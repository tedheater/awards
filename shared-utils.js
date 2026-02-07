        /* --- SHARED UTILS --- */

        function clampNumber(value, min, max) {
            return Math.min(Math.max(value, min), max);
        }

        function normalizeText(value, fallback = "") {
            return typeof value === 'string' ? value : fallback;
        }

        function normalizeNumber(value, fallback, min, max) {
            if (value === null || value === undefined || value === "") return fallback;
            const n = Number(value);
            if (!Number.isFinite(n)) return fallback;
            if (min === undefined && max === undefined) return n;
            return clampNumber(n, min ?? n, max ?? n);
        }

        function escapeHtml(text) {
            return String(text || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        }

        function htmlFromText(text) {
            return escapeHtml(text).replace(/\n/g, "<br>");
        }

        function stripOverlayHtml(html) {
            const div = document.createElement('div');
            div.innerHTML = html || "";
            return (div.textContent || "").trim();
        }

        function sanitizeOverlayHtml(html) {
            const allowed = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'BR', 'UL', 'OL', 'LI', 'P', 'DIV', 'SPAN']);
            const div = document.createElement('div');
            div.innerHTML = html || "";
            const walker = document.createTreeWalker(div, NodeFilter.SHOW_ELEMENT, null);
            const toRemove = [];
            while (walker.nextNode()) {
                const el = walker.currentNode;
                if (!allowed.has(el.tagName)) {
                    toRemove.push(el);
                } else {
                    [...el.attributes].forEach(attr => el.removeAttribute(attr.name));
                }
            }
            toRemove.forEach(el => {
                const parent = el.parentNode;
                if (!parent) return;
                while (el.firstChild) parent.insertBefore(el.firstChild, el);
                parent.removeChild(el);
            });
            return div.innerHTML;
        }

        function hexToRgba(hex, opacity = 1) {
            let value = String(hex || "").trim();
            if (!value) return `rgba(0,0,0,${opacity})`;
            if (value[0] === '#') value = value.slice(1);
            if (value.length === 3) {
                value = value.split('').map(ch => ch + ch).join('');
            }
            const int = parseInt(value, 16);
            if (!Number.isFinite(int)) return `rgba(0,0,0,${opacity})`;
            const r = (int >> 16) & 255;
            const g = (int >> 8) & 255;
            const b = int & 255;
            const alpha = clampNumber(opacity, 0, 1);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }

        function normalizeFixatePoint(point) {
            const raw = point && typeof point === 'object' ? point : {};
            const x = clampNumber(normalizeNumber(raw.x, 0.5), 0, 1);
            const y = clampNumber(normalizeNumber(raw.y, 0.5), 0, 1);
            return { x, y };
        }

        function normalizeImageFit(value) {
            const fit = typeof value === 'string' ? value : '';
            return ['contain', 'cover', 'fill'].includes(fit) ? fit : 'contain';
        }

        function isHexColor(value) {
            return typeof value === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
        }

        function normalizeHexColor(value) {
            const trimmed = typeof value === 'string' ? value.trim() : "";
            return isHexColor(trimmed) ? trimmed : "";
        }

        function darkenHexColor(hex, amount = 0.35) {
            if (!isHexColor(hex)) return hex;
            let value = hex.slice(1);
            if (value.length === 3) {
                value = value.split('').map(ch => ch + ch).join('');
            }
            const intVal = parseInt(value, 16);
            const r = (intVal >> 16) & 255;
            const g = (intVal >> 8) & 255;
            const b = intVal & 255;
            const factor = clampNumber(1 - amount, 0, 1);
            const nr = Math.round(r * factor);
            const ng = Math.round(g * factor);
            const nb = Math.round(b * factor);
            return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
        }

        function buildStageBackground(style, baseColor, accentColor) {
            const safeBase = normalizeHexColor(baseColor) || "#050505";
            const safeAccent = normalizeHexColor(accentColor) || safeBase;
            const accentGlow = hexToRgba(safeAccent, 0.32);
            const accentSoft = hexToRgba(safeAccent, 0.18);
            if (style === 'spotlight') {
                return `radial-gradient(circle at 50% 35%, ${accentGlow} 0%, ${hexToRgba(safeBase, 0.92)} 55%, ${safeBase} 100%)`;
            }
            if (style === 'gradient') {
                return `linear-gradient(135deg, ${darkenHexColor(safeBase, 0.25)} 0%, ${safeBase} 60%, ${accentSoft} 120%)`;
            }
            return safeBase;
        }

        function clampTop3Count(value) {
            const min = typeof TOP3_MIN === 'number' ? TOP3_MIN : 2;
            const max = typeof TOP3_MAX === 'number' ? TOP3_MAX : 10;
            return clampNumber(Math.round(value || 0), min, max);
        }

        function getTop3Count(award) {
            if (!award?.top3) return 3;
            const rawCount = Number(award.top3.count);
            const fallback = Array.isArray(award.top3.entries) ? award.top3.entries.length : 3;
            const resolved = Number.isFinite(rawCount) ? rawCount : (fallback || 3);
            return clampTop3Count(resolved);
        }

        function getTop3Places(count) {
            const safeCount = clampTop3Count(count);
            const places = [];
            for (let place = safeCount; place >= 1; place -= 1) {
                places.push(place);
            }
            return places;
        }

        function getTop3PlaceForIndex(index, awardOrCount) {
            const count = typeof awardOrCount === 'number' ? awardOrCount : getTop3Count(awardOrCount);
            return clampTop3Count(count) - index;
        }

        function getTop3EntryPlace(entry, index, award) {
            const place = Number(entry?.place);
            if (Number.isFinite(place)) return place;
            return getTop3PlaceForIndex(index, award);
        }

        function isTop3WinnerEnabled(award) {
            return award?.top3?.showWinner !== false;
        }

        function makeTop3LabelKey(kind, place) {
            return kind === 'placeLabel' ? `placeLabel${place}` : `${kind}${place}`;
        }

        function formatOrdinal(place) {
            const n = Math.abs(Math.round(place || 0));
            const mod100 = n % 100;
            if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
            switch (n % 10) {
                case 1: return `${n}st`;
                case 2: return `${n}nd`;
                case 3: return `${n}rd`;
                default: return `${n}th`;
            }
        }

        function getDefaultTop3Label(kind, place, award) {
            const ordinal = formatOrdinal(place);
            const winnerEnabled = isTop3WinnerEnabled(award);
            if (!winnerEnabled && place === 1) {
                if (kind === 'reveal') return `Reveal ${ordinal}`;
                if (kind === 'place') return `Place ${ordinal}`;
                if (kind === 'seeMore') return "See More";
                if (kind === 'back') return "Back";
                return `${ordinal} Place`;
            }
            if (kind === 'reveal') return place === 1 ? "Reveal Winner" : `Reveal ${ordinal}`;
            if (kind === 'place') return place === 1 ? "Show Final" : `Place ${ordinal}`;
            if (kind === 'seeMore') return "See More";
            if (kind === 'back') return "Back";
            return place === 1 ? "Winner" : `${ordinal} Place`;
        }

        function getTop3Label(award, kind, place) {
            const labels = award?.top3?.labels || {};
            const key = makeTop3LabelKey(kind, place);
            const fallback = getDefaultTop3Label(kind, place, award);
            if (Object.prototype.hasOwnProperty.call(labels, key)) {
                return String(labels[key] ?? "");
            }
            return fallback;
        }
