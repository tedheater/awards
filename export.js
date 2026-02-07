        /* --- EXPORT --- */

        let isExporting = false;

        async function exportShowAsHtml() {
            if (isExporting) return;
            if (awards.length === 0) {
                showToast("No awards to export!");
                return;
            }

            const btn = document.getElementById('exportBtn');
            const prevLabel = btn ? btn.innerText : "";
            isExporting = true;
            if (btn) {
                btn.disabled = true;
                btn.innerText = "Exporting...";
            }
            showToast("Preparing export...");

            try {
                const html = await buildExportHtml();
                const filename = generateExportFilename();
                downloadTextFile(filename, html);
                showToast("Export ready!");
            } catch (err) {
                console.error(err);
                showToast("Export failed. Check console.");
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerText = prevLabel;
                }
                isExporting = false;
            }
        }

        function generateExportFilename() {
            const d = new Date();
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `awards-show-${yyyy}-${mm}-${dd}.html`;
        }

        function downloadTextFile(filename, content) {
            const blob = new Blob([content], { type: "text/html;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }

        function downloadFile(filename, content, mimeType) {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }

        function generateProjectFilename() {
            const d = new Date();
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `awards-project-${yyyy}-${mm}-${dd}.json`;
        }

        function exportProjectAsJson() {
            const payload = {
                version: 1,
                exportedAt: new Date().toISOString(),
                awards,
                showSettings
            };
            const json = JSON.stringify(payload, null, 2);
            const filename = generateProjectFilename();
            downloadFile(filename, json, "application/json;charset=utf-8");
            showToast("Project saved as JSON.");
        }

        function triggerProjectImport() {
            const input = document.getElementById('projectImportInput');
            if (input) input.click();
        }

        function handleProjectUpload(input) {
            if (!input.files || !input.files[0]) return;
            const file = input.files[0];
            input.value = "";
            handleProjectFile(file);
        }

        function handleProjectFile(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    applyProjectData(data);
                    showToast("Project loaded.");
                } catch (err) {
                    console.error(err);
                    showToast("Invalid JSON file.");
                }
            };
            reader.onerror = () => showToast("Failed to read file.");
            reader.readAsText(file);
        }

        function applyProjectData(data) {
            const rawAwards = Array.isArray(data?.awards) ? data.awards : [];
            awards = rawAwards.map((award, index) => normalizeAward(award, index));
            showSettings = normalizeShowSettings(data?.showSettings);

            if (awards.length === 0) {
                createNewAward();
            } else {
                selectAward(awards[0].id);
            }
            syncShowSettingsUI();
        }

        function safeJsonStringify(obj) {
            return JSON.stringify(obj).replace(/</g, "\\u003c");
        }

        async function getBaseCssTextForExport() {
            const inlineCss = document.querySelector('style[data-app-core]')?.textContent || "";
            let linkedCss = "";
            const appStylesheet = document.getElementById('appStylesheet');

            if (appStylesheet) {
                const sheet = Array.from(document.styleSheets).find(s => s.ownerNode === appStylesheet);
                if (sheet) {
                    try {
                        linkedCss = Array.from(sheet.cssRules || []).map(rule => rule.cssText).join("\n");
                    } catch (err) {
                        console.warn("Could not read stylesheet rules directly, falling back to fetch.", err);
                    }
                }

                if (!linkedCss) {
                    const href = appStylesheet.getAttribute('href');
                    if (href) {
                        try {
                            const res = await fetch(href);
                            if (res.ok) linkedCss = await res.text();
                        } catch (err) {
                            console.warn("Could not fetch app stylesheet for export.", err);
                        }
                    }
                }
            }

            return [inlineCss, linkedCss].filter(Boolean).join("\n");
        }

        async function buildExportHtml() {
            const baseCss = await getBaseCssTextForExport();
            const embeddedFontsCss = await buildEmbeddedMontserratCss();
            const scriptCloseTag = "</scr" + "ipt>";
            const exportOverlayCss = `
            .export-overlay {
                position: fixed;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #000;
                z-index: 500;
                text-align: center;
            }
            .export-overlay.hidden { display: none; }
            .export-overlay-card {
                background: var(--surface-color);
                border: 1px solid var(--border-color);
                padding: 30px 36px;
                max-width: 520px;
                width: calc(100% - 40px);
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            }
            .export-overlay-title {
                font-size: 1.6rem;
                letter-spacing: 1px;
                color: var(--accent-color);
                margin-bottom: 16px;
            }
            .export-overlay-hint {
                color: var(--text-secondary);
                font-size: 0.9rem;
                margin-top: 12px;
            }`;

            const css = `${embeddedFontsCss}\n${baseCss}\n${exportOverlayCss}`;

            const playerEl = document.getElementById('player-app').cloneNode(true);
            playerEl.classList.remove('hidden');
            const exportBg = playerEl.querySelector('#playerBackground');
            if (exportBg) exportBg.classList.remove('active');
            const exportOverlay = playerEl.querySelector('#playerOverlay');
            if (exportOverlay) {
                exportOverlay.innerHTML = "";
            }
            const exportTextStage = playerEl.querySelector('#textStage');
            if (exportTextStage) exportTextStage.classList.add('faded-out');
            const exportMenu = playerEl.querySelector('#menuScreen');
            if (exportMenu) exportMenu.classList.add('hidden');
            const exportImgWrap = playerEl.querySelector('#playerImageWrap');
            if (exportImgWrap) exportImgWrap.classList.remove('ken-burns', 'ken-burns-preview', 'ken-burns-fixate', 'ken-burns-fixate-preview');
            const exportImg = playerEl.querySelector('#playerImageElement');
            if (exportImg) exportImg.setAttribute('src', '');
            const exportTop3Stage = playerEl.querySelector('#top3Stage');
            if (exportTop3Stage) {
                exportTop3Stage.classList.add('hidden');
                exportTop3Stage.classList.remove('visible');
                const teaser = exportTop3Stage.querySelector('#top3Teaser');
                if (teaser) teaser.innerHTML = '';
                const layout = exportTop3Stage.querySelector('#top3Layout');
                if (layout) layout.innerHTML = '';
            }
            const exportTop3Badge = playerEl.querySelector('#top3RevealBadge');
            if (exportTop3Badge) {
                exportTop3Badge.classList.add('hidden');
                exportTop3Badge.classList.remove('visible');
            }
            const playerHtml = playerEl.outerHTML;

            const awardsJson = safeJsonStringify(awards);
            const settingsJson = safeJsonStringify(showSettings);

            const script = `
            const awards = ${awardsJson};
            const showSettings = ${settingsJson};
            let playerState = {
                currentIndex: 0,
                phase: 'intro',
                busy: false,
                top3Placed: [],
                top3Step: 0,
                top3ActiveEntryIndex: null,
                linkedMode: null
            };
            const REVEAL_DELAY_MS = 900;
            const BG_FADE_MS = 1200;
            const TEXT_FADE_DELAY_MS = 800;
            const TOP3_REVEAL_MS = 1100;
            const TOP3_PLACE_FADE_MS = 450;
            const TOP3_PLACE_MS = 700;
            const overlayEffectOptions = [
                'fade',
                'slide-up',
                'slide-down',
                'slide-left',
                'slide-right',
                'zoom',
                'blur',
                'rise',
                'pop',
                'typewriter',
                'word-reveal'
            ];
            const fixateEasingOptions = [
                'ease-out',
                'ease-in-out',
                'ease-in',
                'linear',
                'cubic-bezier(0.2, 0.8, 0.2, 1)'
            ];
            const fontOptions = {
                Montserrat: "'Montserrat', sans-serif",
                Serif: "Georgia, 'Times New Roman', serif",
                Editorial: "'Trebuchet MS', 'Segoe UI', sans-serif",
                Display: "'Impact', 'Haettenschweiler', 'Arial Narrow Bold', sans-serif",
                Mono: "'Courier New', monospace"
            };
            const typePresets = {
                classic: { title: "Montserrat", subtitle: "Montserrat", winner: "Montserrat" },
                editorial: { title: "Serif", subtitle: "Editorial", winner: "Serif" },
                modern: { title: "Editorial", subtitle: "Montserrat", winner: "Montserrat" },
                bold: { title: "Display", subtitle: "Editorial", winner: "Display" }
            };
            const themePresets = {
                "classic-gold": {
                    "--bg-color": "#050505",
                    "--surface-color": "#121212",
                    "--surface-hover": "#1e1e1e",
                    "--accent-color": "#d4af37",
                    "--accent-dim": "#8a7122",
                    "--text-primary": "#ffffff",
                    "--text-secondary": "#aaaaaa",
                    "--border-color": "#333333"
                },
                neon: {
                    "--bg-color": "#050a12",
                    "--surface-color": "#0f1a24",
                    "--surface-hover": "#152634",
                    "--accent-color": "#2ee8ff",
                    "--accent-dim": "#1a8aa0",
                    "--text-primary": "#e6f9ff",
                    "--text-secondary": "#7fb2c6",
                    "--border-color": "#1b3c50"
                },
                minimal: {
                    "--bg-color": "#0c0c0c",
                    "--surface-color": "#161616",
                    "--surface-hover": "#202020",
                    "--accent-color": "#f0f0f0",
                    "--accent-dim": "#9a9a9a",
                    "--text-primary": "#f7f7f7",
                    "--text-secondary": "#9c9c9c",
                    "--border-color": "#2d2d2d"
                },
                retro: {
                    "--bg-color": "#140f0a",
                    "--surface-color": "#20170f",
                    "--surface-hover": "#2a1f15",
                    "--accent-color": "#ffb347",
                    "--accent-dim": "#b86f1a",
                    "--text-primary": "#fff4e1",
                    "--text-secondary": "#d2b48c",
                    "--border-color": "#3a2a1c"
                },
                editorial: {
                    "--bg-color": "#0b0b0f",
                    "--surface-color": "#151622",
                    "--surface-hover": "#1d1f2e",
                    "--accent-color": "#bca7ff",
                    "--accent-dim": "#6c5aa8",
                    "--text-primary": "#f2f0ff",
                    "--text-secondary": "#a5a0c8",
                    "--border-color": "#2c2a3f"
                }
            };
            const TOP3_MIN = 2;
            const TOP3_MAX = 10;
            let overlayTimeouts = [];
            let overlayIntervals = [];
            let autoAdvanceTimer = null;
            let soundContext = null;

            const overlayEl = document.getElementById('exportOverlay');
            const overlayTitleEl = document.getElementById('exportOverlayTitle');
            const overlayHintEl = document.getElementById('exportOverlayHint');
            const overlayBtn = document.getElementById('exportOverlayBtn');
            const startTitleText = (showSettings.exportStartTitle || 'Start Show').trim() || 'Start Show';
            const startButtonText = (showSettings.exportStartButton || 'Start Show').trim() || 'Start Show';

            function showOverlay(title, buttonText, hintText) {
                overlayTitleEl.innerText = title;
                overlayBtn.innerText = buttonText;
                overlayHintEl.innerText = hintText || '';
                resetPlayerControlButtons();
                overlayEl.classList.remove('hidden');
            }

            function hideOverlay() {
                overlayEl.classList.add('hidden');
            }

            overlayBtn.addEventListener('click', () => {
                hideOverlay();
                startShow();
            });

            function clampNumber(value, min, max) {
                return Math.min(Math.max(value, min), max);
            }

            function getFontStack(name) {
                return fontOptions[name] || fontOptions.Montserrat;
            }

            function isHexColor(value) {
                return typeof value === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
            }

            function normalizeHexColor(value) {
                const trimmed = typeof value === 'string' ? value.trim() : "";
                return isHexColor(trimmed) ? trimmed : "";
            }

            function darkenHexColor(hex, amount) {
                if (!isHexColor(hex)) return hex;
                let value = hex.slice(1);
                if (value.length === 3) {
                    value = value.split('').map(ch => ch + ch).join('');
                }
                const intVal = parseInt(value, 16);
                const r = (intVal >> 16) & 255;
                const g = (intVal >> 8) & 255;
                const b = intVal & 255;
                const factor = clampNumber(1 - (amount || 0.35), 0, 1);
                const nr = Math.round(r * factor);
                const ng = Math.round(g * factor);
                const nb = Math.round(b * factor);
                return '#' + nr.toString(16).padStart(2, '0') + ng.toString(16).padStart(2, '0') + nb.toString(16).padStart(2, '0');
            }

            function buildStageBackground(style, baseColor, accentColor) {
                const safeBase = normalizeHexColor(baseColor) || "#050505";
                const safeAccent = normalizeHexColor(accentColor) || safeBase;
                const accentGlow = hexToRgba(safeAccent, 0.32);
                const accentSoft = hexToRgba(safeAccent, 0.18);
                if (style === 'spotlight') {
                    return 'radial-gradient(circle at 50% 35%, ' + accentGlow + ' 0%, ' + hexToRgba(safeBase, 0.92) + ' 55%, ' + safeBase + ' 100%)';
                }
                if (style === 'gradient') {
                    return 'linear-gradient(135deg, ' + darkenHexColor(safeBase, 0.25) + ' 0%, ' + safeBase + ' 60%, ' + accentSoft + ' 120%)';
                }
                return safeBase;
            }

            function applyThemeSettings() {
                const root = document.documentElement;
                const preset = themePresets[showSettings.themePreset] || themePresets['classic-gold'];
                Object.keys(preset).forEach((key) => {
                    root.style.setProperty(key, preset[key]);
                });
                const accentOverride = normalizeHexColor(showSettings.accentColor);
                const stageOverride = normalizeHexColor(showSettings.stageColor);
                const accentColor = accentOverride || preset['--accent-color'] || "#d4af37";
                const stageColor = stageOverride || preset['--bg-color'] || "#050505";
                root.style.setProperty('--accent-color', accentColor);
                root.style.setProperty('--accent-dim', darkenHexColor(accentColor, 0.35));
                root.style.setProperty('--stage-bg', buildStageBackground(showSettings.stageStyle || 'solid', stageColor, accentColor));
            }

            function applyTypeSettings() {
                const root = document.documentElement;
                const titleFont = getFontStack(showSettings.titleFont || 'Montserrat');
                const subtitleFont = getFontStack(showSettings.subtitleFont || 'Montserrat');
                const winnerFont = getFontStack(showSettings.winnerFont || 'Montserrat');
                root.style.setProperty('--font-title', titleFont);
                root.style.setProperty('--font-subtitle', subtitleFont);
                root.style.setProperty('--font-winner', winnerFont);
                const scale = showSettings.largeType ? 1.2 : 1;
                const rawTitleSize = Number(showSettings.titleSize);
                const rawWinnerSize = Number(showSettings.winnerSize);
                const rawCategorySize = Number(showSettings.categorySize);
                const rawSublineSize = Number(showSettings.sublineSize);
                const rawCategoryTracking = Number(showSettings.categoryTracking);
                const rawTitleTracking = Number(showSettings.titleTracking);
                const titleSize = clampNumber(Number.isFinite(rawTitleSize) ? rawTitleSize : 3.5, 2, 6) * scale;
                const winnerSize = clampNumber(Number.isFinite(rawWinnerSize) ? rawWinnerSize : 3.5, 2, 6) * scale;
                const categorySize = clampNumber(Number.isFinite(rawCategorySize) ? rawCategorySize : 1, 0.6, 2) * scale;
                const sublineSize = clampNumber(Number.isFinite(rawSublineSize) ? rawSublineSize : 1, 0.6, 2) * scale;
                const categoryTracking = clampNumber(Number.isFinite(rawCategoryTracking) ? rawCategoryTracking : 4, 0, 10);
                const titleTracking = clampNumber(Number.isFinite(rawTitleTracking) ? rawTitleTracking : 0, -1, 6);
                root.style.setProperty('--title-size', '' + titleSize + 'rem');
                root.style.setProperty('--winner-size', '' + winnerSize + 'rem');
                root.style.setProperty('--category-size', '' + categorySize + 'rem');
                root.style.setProperty('--subline-size', '' + sublineSize + 'rem');
                root.style.setProperty('--category-tracking', '' + categoryTracking + 'px');
                root.style.setProperty('--title-tracking', '' + titleTracking + 'px');
            }

            function normalizeImageFit(value) {
                const fit = typeof value === 'string' ? value : '';
                return ['contain', 'cover', 'fill'].includes(fit) ? fit : 'contain';
            }

            function getImageFit(target) {
                return normalizeImageFit(target && target.imageFit);
            }

            applyThemeSettings();
            applyTypeSettings();

            function clampTop3Count(value) {
                return clampNumber(Math.round(value || 0), TOP3_MIN, TOP3_MAX);
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
                return kind === 'placeLabel' ? 'placeLabel' + place : '' + kind + place;
            }

            function formatOrdinal(place) {
                const n = Math.abs(Math.round(place || 0));
                const mod100 = n % 100;
                if (mod100 >= 11 && mod100 <= 13) return '' + n + 'th';
                switch (n % 10) {
                    case 1: return '' + n + 'st';
                    case 2: return '' + n + 'nd';
                    case 3: return '' + n + 'rd';
                    default: return '' + n + 'th';
                }
            }

            function getDefaultTop3Label(kind, place, award) {
                const ordinal = formatOrdinal(place);
                const winnerEnabled = isTop3WinnerEnabled(award);
                if (!winnerEnabled && place === 1) {
                    if (kind === 'reveal') {
                        return 'Reveal ' + ordinal;
                    }
                    if (kind === 'place') {
                        return 'Place ' + ordinal;
                    }
                    if (kind === 'seeMore') {
                        return 'See More';
                    }
                    if (kind === 'back') {
                        return 'Back';
                    }
                    return ordinal + ' Place';
                }
                if (kind === 'reveal') {
                    return place === 1 ? 'Reveal Winner' : 'Reveal ' + ordinal;
                }
                if (kind === 'place') {
                    return place === 1 ? 'Show Final' : 'Place ' + ordinal;
                }
                if (kind === 'seeMore') {
                    return 'See More';
                }
                if (kind === 'back') {
                    return 'Back';
                }
                return place === 1 ? 'Winner' : ordinal + ' Place';
            }

            function getTop3Label(award, kind, place) {
                const labels = award?.top3?.labels || {};
                const key = makeTop3LabelKey(kind, place);
                const fallback = getDefaultTop3Label(kind, place, award);
                if (Object.prototype.hasOwnProperty.call(labels, key)) {
                    return String(labels[key] ?? '');
                }
                return fallback;
            }

            function buildTop3Entries(count, existingEntries) {
                const entries = Array.isArray(existingEntries) ? existingEntries : [];
                const places = getTop3Places(count);
                const byPlace = new Map();
                const leftovers = [];

                entries.forEach((entry) => {
                    const place = Number(entry?.place);
                    if (Number.isFinite(place) && !byPlace.has(place)) {
                        byPlace.set(place, entry);
                    } else {
                        leftovers.push(entry);
                    }
                });

                let fallbackIndex = 0;
                return places.map((place) => {
                    let entry = byPlace.get(place);
                    if (!entry && fallbackIndex < leftovers.length) {
                        entry = { ...leftovers[fallbackIndex], place };
                        fallbackIndex += 1;
                    }
                    const base = {
                        place,
                        name: '',
                        image: '',
                        imageFit: 'contain',
                        linkedStartAwardId: '',
                        linkedEndAwardId: '',
                        overlays: [],
                        transform: { x: 0, y: 0, scale: 1 },
                        kenBurnsMode: 'off',
                        kenBurnsDuration: 12,
                        kenBurnsIntensity: 20,
                        fixateSpeed: 8,
                        fixateZoom: 2.5,
                        fixatePoint: { x: 0.5, y: 0.5 },
                        fixateEasing: 'ease-out'
                    };
                    return { ...base, ...(entry || {}), place };
                });
            }

            function ensureTop3Labels(award, count) {
                if (!award.top3.labels || typeof award.top3.labels !== 'object') {
                    award.top3.labels = {};
                }
                const labels = award.top3.labels;
                getTop3Places(count).forEach((place) => {
                    ['reveal', 'place', 'seeMore', 'back', 'placeLabel'].forEach((kind) => {
                        const key = makeTop3LabelKey(kind, place);
                        if (!Object.prototype.hasOwnProperty.call(labels, key)) {
                            labels[key] = getDefaultTop3Label(kind, place, award);
                        }
                    });
                });
            }

            function getTop3TypeLabel(award) {
                const count = getTop3Count(award);
                return 'Top ' + count + ' Reveal';
            }

            function escapeHtml(text) {
                return String(text || '')
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/\"/g, '&quot;')
                    .replace(/'/g, '&#39;');
            }

            function htmlFromText(text) {
                return escapeHtml(text).replace(/\n/g, '<br>');
            }

            function stripOverlayHtml(html) {
                const div = document.createElement('div');
                div.innerHTML = html || '';
                return (div.textContent || '').trim();
            }

            function sanitizeOverlayHtml(html) {
                const allowed = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'BR', 'UL', 'OL', 'LI', 'P', 'DIV', 'SPAN']);
                const div = document.createElement('div');
                div.innerHTML = html || '';
                const walker = document.createTreeWalker(div, NodeFilter.SHOW_ELEMENT, null);
                const toRemove = [];
                while (walker.nextNode()) {
                    const el = walker.currentNode;
                    if (!allowed.has(el.tagName)) {
                        toRemove.push(el);
                    } else {
                        Array.from(el.attributes).forEach(attr => el.removeAttribute(attr.name));
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

            function hexToRgba(hex, opacity) {
                let value = String(hex || '').trim();
                if (!value) return 'rgba(0,0,0,' + opacity + ')';
                if (value[0] === '#') value = value.slice(1);
                if (value.length === 3) {
                    value = value.split('').map(ch => ch + ch).join('');
                }
                const int = parseInt(value, 16);
                if (!Number.isFinite(int)) return 'rgba(0,0,0,' + opacity + ')';
                const r = (int >> 16) & 255;
                const g = (int >> 8) & 255;
                const b = int & 255;
                const alpha = clampNumber(opacity, 0, 1);
                return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
            }

            function getOverlayTextShadow(strength, cinematic) {
                const s = clampNumber(Number(strength) || 0, 0, 1);
                if (s <= 0.01) return 'none';
                if (cinematic) {
                    const shadow1 = '0 2px ' + Math.round(6 + 10 * s) + 'px rgba(0,0,0,' + (0.5 + 0.4 * s) + ')';
                    const glow1 = '0 0 ' + Math.round(18 * s) + 'px rgba(255,255,255,' + (0.35 * s) + ')';
                    const glow2 = '0 0 ' + Math.round(36 * s) + 'px rgba(255,255,255,' + (0.2 * s) + ')';
                    return shadow1 + ', ' + glow1 + ', ' + glow2;
                }
                return '0 2px ' + Math.round(10 * s) + 'px rgba(0,0,0,' + (0.7 * s) + ')';
            }

            function applyOverlayPositionStyles(el, overlay) {
                const positionX = overlay.positionX || 'center';
                const positionY = overlay.positionY || 'bottom';
                const baseX = positionX === 'left' ? 12 : (positionX === 'right' ? 88 : 50);
                const baseY = positionY === 'top' ? 15 : (positionY === 'bottom' ? 85 : 50);
                const anchorX = positionX === 'left' ? '0%' : (positionX === 'right' ? '-100%' : '-50%');
                const anchorY = positionY === 'top' ? '0%' : (positionY === 'bottom' ? '-100%' : '-50%');
                const offsetX = clampNumber(Number(overlay.offsetX) || 0, -500, 500);
                const offsetY = clampNumber(Number(overlay.offsetY) || 0, -500, 500);
                el.style.left = baseX + '%';
                el.style.top = baseY + '%';
                el.style.setProperty('--overlay-anchor-x', anchorX);
                el.style.setProperty('--overlay-anchor-y', anchorY);
                el.style.setProperty('--overlay-offset-x', '' + offsetX + 'px');
                el.style.setProperty('--overlay-offset-y', '' + offsetY + 'px');
            }

            function normalizeOverlayData(source, index) {
                const text = String(source?.text || '');
                const htmlSource = typeof source?.html === 'string' ? source.html : (text ? htmlFromText(text) : '');
                const html = sanitizeOverlayHtml(htmlSource);
                const resolvedText = html ? stripOverlayHtml(html) : text;
                return {
                    id: source?.id || 'overlay-' + index,
                    text: resolvedText,
                    html,
                    delay: clampNumber(Number.isFinite(Number(source?.delay)) ? Number(source?.delay) : 0, 0, 10),
                    duration: clampNumber(Number.isFinite(Number(source?.duration)) ? Number(source?.duration) : 3, 0, 10),
                    effect: overlayEffectOptions.includes(source?.effect) ? source.effect : 'fade',
                    effectDuration: clampNumber(Number.isFinite(Number(source?.effectDuration)) ? Number(source?.effectDuration) : 0.6, 0, 10),
                    background: source?.background !== undefined ? !!source.background : true,
                    textColor: String(source?.textColor || '#ffffff'),
                    backgroundColor: String(source?.backgroundColor || '#000000'),
                    backgroundOpacity: clampNumber(Number.isFinite(Number(source?.backgroundOpacity)) ? Number(source?.backgroundOpacity) : 0.45, 0, 1),
                    fontSize: clampNumber(Number.isFinite(Number(source?.fontSize)) ? Number(source?.fontSize) : 2.2, 0.6, 6),
                    lineHeight: clampNumber(Number.isFinite(Number(source?.lineHeight)) ? Number(source?.lineHeight) : 1.15, 0.8, 2.4),
                    align: ['left', 'center', 'right'].includes(source?.align) ? source.align : 'center',
                    maxWidth: clampNumber(Number.isFinite(Number(source?.maxWidth)) ? Number(source?.maxWidth) : 90, 40, 100),
                    glowStrength: clampNumber(Number.isFinite(Number(source?.glowStrength)) ? Number(source?.glowStrength) : 0.6, 0, 1),
                    glowCinematic: source?.glowCinematic !== undefined ? !!source.glowCinematic : true,
                    positionX: ['left', 'center', 'right'].includes(source?.positionX) ? source.positionX : 'center',
                    positionY: ['top', 'middle', 'bottom'].includes(source?.positionY) ? source.positionY : 'bottom',
                    offsetX: clampNumber(Number.isFinite(Number(source?.offsetX)) ? Number(source?.offsetX) : 0, -500, 500),
                    offsetY: clampNumber(Number.isFinite(Number(source?.offsetY)) ? Number(source?.offsetY) : 0, -500, 500),
                    paddingX: clampNumber(Number.isFinite(Number(source?.paddingX)) ? Number(source?.paddingX) : 18, 0, 80),
                    paddingY: clampNumber(Number.isFinite(Number(source?.paddingY)) ? Number(source?.paddingY) : 10, 0, 80),
                    radius: clampNumber(Number.isFinite(Number(source?.radius)) ? Number(source?.radius) : 12, 0, 40),
                    backdropBlur: clampNumber(Number.isFinite(Number(source?.backdropBlur)) ? Number(source?.backdropBlur) : 4, 0, 20),
                    zIndex: clampNumber(Number.isFinite(Number(source?.zIndex)) ? Number(source?.zIndex) : 10, 0, 100)
                };
            }

            function ensureOverlays(award) {
                if (!award) return [];
                if (Array.isArray(award.overlays)) {
                    award.overlays = award.overlays.map((overlay, index) => normalizeOverlayData(overlay, index));
                    return award.overlays;
                }
                if (award.overlayText) {
                    award.overlays = [normalizeOverlayData({
                        id: 'legacy',
                        text: award.overlayText,
                        delay: award.overlayDelay || 0,
                        duration: award.overlayDuration || 3,
                        effect: 'fade'
                    }, 0)];
                } else {
                    award.overlays = [];
                }
                return award.overlays;
            }

            function ensureTop3(award) {
                if (!award) return;
                if (!award.top3) {
                    award.top3 = {
                        count: 3,
                        showWinner: true,
                        teaserStyle: 'silhouette',
                        layoutStyle: 'grid',
                        winnerEmphasis: 'scale-glow',
                        pixelateAmount: 6,
                        silhouetteDarkness: 0.8,
                        labels: {},
                        entries: []
                    };
                }
                const teaserStyles = new Set(['silhouette', 'blur', 'pixelate']);
                const layoutStyles = new Set(['grid', 'editorial']);
                const emphasisStyles = new Set(['scale-glow', 'pulse-glow', 'none']);
                const count = getTop3Count(award);
                award.top3.count = count;
                award.top3.showWinner = award.top3.showWinner !== false;
                award.top3.teaserStyle = teaserStyles.has(award.top3.teaserStyle) ? award.top3.teaserStyle : 'silhouette';
                award.top3.layoutStyle = layoutStyles.has(award.top3.layoutStyle) ? award.top3.layoutStyle : 'grid';
                award.top3.winnerEmphasis = emphasisStyles.has(award.top3.winnerEmphasis) ? award.top3.winnerEmphasis : 'scale-glow';
                award.top3.pixelateAmount = clampNumber(Number(award.top3.pixelateAmount) || 6, 1, 10);
                award.top3.silhouetteDarkness = clampNumber(Number(award.top3.silhouetteDarkness) || 0.8, 0.3, 0.95);
                award.top3.entries = buildTop3Entries(count, award.top3.entries);
                ensureTop3Labels(award, count);
            }

            function clearOverlayTimers() {
                overlayTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
                overlayIntervals.forEach(intervalId => clearInterval(intervalId));
                overlayTimeouts = [];
                overlayIntervals = [];
            }

            function resetOverlayContainer() {
                clearOverlayTimers();
                const overlayContainer = document.getElementById('playerOverlay');
                if (overlayContainer) overlayContainer.innerHTML = '';
            }

            function stopAutoAdvanceBar() {
                const bar = document.getElementById('autoAdvanceBar');
                if (!bar) return;
                bar.classList.remove('active');
                bar.style.transition = 'none';
                bar.style.transform = 'scaleX(0)';
            }

            function startAutoAdvanceBar(durationMs) {
                const bar = document.getElementById('autoAdvanceBar');
                if (!bar) return;
                bar.classList.add('active');
                bar.style.transition = 'none';
                bar.style.transform = 'scaleX(0)';
                requestAnimationFrame(() => {
                    bar.style.transition = 'transform ' + durationMs + 'ms linear';
                    bar.style.transform = 'scaleX(1)';
                });
            }

            function clearAutoAdvanceTimer() {
                if (autoAdvanceTimer) {
                    clearTimeout(autoAdvanceTimer);
                    autoAdvanceTimer = null;
                }
                stopAutoAdvanceBar();
            }

            function scheduleAutoAdvance(delaySec) {
                clearAutoAdvanceTimer();
                if (!showSettings.autoAdvance) return;
                const delayMs = Math.max(0, Number(delaySec || 0) * 1000);
                if (!Number.isFinite(delayMs) || delayMs <= 0) return;
                startAutoAdvanceBar(delayMs);
                autoAdvanceTimer = setTimeout(() => {
                    autoAdvanceTimer = null;
                    stopAutoAdvanceBar();
                    nextStep();
                }, delayMs);
            }

            function isPhotoLikeSlideType(slideType) {
                return slideType === 'photo' || slideType === 'title-card';
            }

            function scheduleAutoAdvanceForAward(award) {
                if (!award) return;
                if (award.slideType === 'top3') {
                    scheduleAutoAdvance(showSettings.autoAdvanceTopStep ?? 3);
                    return;
                }
                if (isPhotoLikeSlideType(award.slideType)) {
                    scheduleAutoAdvance(showSettings.autoAdvancePhoto ?? 6);
                    return;
                }
                scheduleAutoAdvance(showSettings.autoAdvanceAward ?? 6);
            }

            function playSoundEffect(kind) {
                if (!showSettings.soundEnabled) return;
                if (kind === 'reveal' && !showSettings.soundOnReveal) return;
                if (kind === 'advance' && !showSettings.soundOnAdvance) return;
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) return;
                if (!soundContext) soundContext = new AudioCtx();
                const ctx = soundContext;
                if (ctx.state === 'suspended') ctx.resume();
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const style = showSettings.soundStyle || 'soft';
                let baseFreq = kind === 'reveal' ? 520 : 360;
                if (style === 'bright') baseFreq += 120;
                if (style === 'cinematic') baseFreq -= 80;
                osc.frequency.setValueAtTime(baseFreq, now);
                osc.type = style === 'bright' ? 'triangle' : (style === 'cinematic' ? 'sawtooth' : 'sine');
                const peak = style === 'cinematic' ? 0.2 : 0.12;
                const duration = kind === 'reveal' ? 0.28 : 0.18;
                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.exponentialRampToValueAtTime(peak, now + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
                osc.connect(gain).connect(ctx.destination);
                osc.start(now);
                osc.stop(now + duration);
            }

            function getPhotoRevealDelaySec(award, typeOverride) {
                const slideTypeRaw = typeOverride || award?.slideType || 'award';
                const slideType = isPhotoLikeSlideType(slideTypeRaw) ? 'photo' : slideTypeRaw;
                const override = award?.revealPhotoDelay;
                if (override !== null && override !== undefined && Number.isFinite(Number(override))) {
                    return clampNumber(Number(override), 0, 10);
                }
                let fallback = REVEAL_DELAY_MS / 1000;
                if (slideType === 'photo') {
                    fallback = showSettings.revealDelayPhoto ?? fallback;
                } else if (slideType === 'top3') {
                    fallback = showSettings.revealDelayTop ?? fallback;
                } else {
                    fallback = showSettings.revealDelayAward ?? fallback;
                }
                return clampNumber(Number(fallback) || 0, 0, 10);
            }

            function getPhotoFadeDurationSec(award, typeOverride) {
                const slideTypeRaw = typeOverride || award?.slideType || 'award';
                const slideType = isPhotoLikeSlideType(slideTypeRaw) ? 'photo' : slideTypeRaw;
                const override = award?.revealFadeDuration;
                if (override !== null && override !== undefined && Number.isFinite(Number(override))) {
                    return clampNumber(Number(override), 0, 10);
                }
                let fallback = 1.5;
                if (slideType === 'photo') {
                    fallback = showSettings.fadeDurationPhoto ?? fallback;
                } else if (slideType === 'top3') {
                    fallback = showSettings.fadeDurationTop ?? fallback;
                } else {
                    fallback = showSettings.fadeDurationAward ?? fallback;
                }
                return clampNumber(Number(fallback) || 0, 0, 10);
            }

            function applyPhotoFadeDuration(award, typeOverride) {
                const bg = document.getElementById('playerBackground');
                if (!bg) return;
                bg.style.transitionDuration = '' + getPhotoFadeDurationSec(award, typeOverride) + 's';
            }

            function startTypewriter(el, text, effectDurationMs) {
                const chars = Array.from(text);
                const baseDuration = effectDurationMs > 0 ? effectDurationMs : 800;
                const revealDuration = clampNumber(baseDuration, 200, 8000);
                const intervalMs = Math.max(20, Math.floor(revealDuration / Math.max(chars.length, 1)));
                let index = 0;
                el.innerText = '';
                if (chars.length === 0) return;
                const intervalId = setInterval(() => {
                    index += 1;
                    el.innerText = chars.slice(0, index).join('');
                    if (index >= chars.length) clearInterval(intervalId);
                }, intervalMs);
                overlayIntervals.push(intervalId);
            }

            function startWordReveal(el, text, effectDurationMs) {
                const words = text.split(/\\s+/).filter(Boolean);
                const baseDuration = effectDurationMs > 0 ? effectDurationMs : 800;
                const revealDuration = clampNumber(baseDuration, 240, 8000);
                const intervalMs = Math.max(60, Math.floor(revealDuration / Math.max(words.length, 1)));
                let index = 0;
                el.innerText = '';
                if (words.length === 0) return;
                const intervalId = setInterval(() => {
                    index += 1;
                    el.innerText = words.slice(0, index).join(' ');
                    if (index >= words.length) clearInterval(intervalId);
                }, intervalMs);
                overlayIntervals.push(intervalId);
            }

            function playOverlayTextEffect(el, overlay, effectDurationMs) {
                const text = overlay.text || '';
                const effect = overlay.effect || 'fade';
                if (effect === 'typewriter') {
                    if (effectDurationMs <= 0) {
                        el.innerText = text;
                        return;
                    }
                    startTypewriter(el, text, effectDurationMs);
                    return;
                }
                if (effect === 'word-reveal') {
                    if (effectDurationMs <= 0) {
                        el.innerText = text;
                        return;
                    }
                    startWordReveal(el, text, effectDurationMs);
                    return;
                }
                el.innerText = text;
            }

            function scheduleOverlays(award) {
                if (!award) return;
                const overlays = ensureOverlays(award);
                const overlayContainer = document.getElementById('playerOverlay');
                if (!overlayContainer) return;
                resetOverlayContainer();

                overlays.forEach((overlay) => {
                    const effect = overlayEffectOptions.includes(overlay.effect) ? overlay.effect : 'fade';
                    const displayHtml = sanitizeOverlayHtml(overlay.html || htmlFromText(overlay.text || ''));
                    const plainText = stripOverlayHtml(displayHtml);
                    if (!plainText) return;
                    const overlayEl = document.createElement('div');
                    overlayEl.className = \`photo-overlay overlay-effect-\${effect}\`;
                    const effectDurationSec = clampNumber(Number(overlay.effectDuration) || 0.6, 0, 10);
                    const hasBackground = overlay.background !== false;
                    const fontSize = clampNumber(Number(overlay.fontSize) || 2.2, 0.6, 6);
                    const lineHeight = clampNumber(Number(overlay.lineHeight) || 1.15, 0.8, 2.4);
                    const align = ['left', 'center', 'right'].includes(overlay.align) ? overlay.align : 'center';
                    const maxWidth = clampNumber(Number(overlay.maxWidth) || 90, 40, 100);
                    const textColor = overlay.textColor || '#ffffff';
                    const bgColor = overlay.backgroundColor || '#000000';
                    const bgOpacity = clampNumber(Number(overlay.backgroundOpacity) || 0.45, 0, 1);
                    const glowStrength = clampNumber(Number(overlay.glowStrength) || 0, 0, 1);
                    const glowCinematic = overlay.glowCinematic !== false;
                    const rawPadX = Number(overlay.paddingX);
                    const rawPadY = Number(overlay.paddingY);
                    const rawRadius = Number(overlay.radius);
                    const rawBackdrop = Number(overlay.backdropBlur);
                    const rawZ = Number(overlay.zIndex);
                    const padX = clampNumber(Number.isFinite(rawPadX) ? rawPadX : 18, 0, 80);
                    const padY = clampNumber(Number.isFinite(rawPadY) ? rawPadY : 10, 0, 80);
                    const radius = clampNumber(Number.isFinite(rawRadius) ? rawRadius : 12, 0, 40);
                    const backdropBlur = clampNumber(Number.isFinite(rawBackdrop) ? rawBackdrop : 4, 0, 20);
                    const zIndex = clampNumber(Number.isFinite(rawZ) ? rawZ : 10, 0, 100);
                    overlayEl.style.setProperty('--overlay-effect-duration', '' + effectDurationSec + 's');
                    overlayEl.style.setProperty('--overlay-font-size', '' + fontSize + 'rem');
                    overlayEl.style.setProperty('--overlay-line-height', '' + lineHeight);
                    overlayEl.style.setProperty('--overlay-max-width', '' + maxWidth + '%');
                    overlayEl.style.setProperty('--overlay-bg', hexToRgba(bgColor, bgOpacity));
                    overlayEl.style.setProperty('--overlay-text-shadow', getOverlayTextShadow(glowStrength, glowCinematic));
                    overlayEl.style.setProperty('--overlay-pad-x', '' + padX + 'px');
                    overlayEl.style.setProperty('--overlay-pad-y', '' + padY + 'px');
                    overlayEl.style.setProperty('--overlay-radius', '' + radius + 'px');
                    overlayEl.style.setProperty('--overlay-backdrop-blur', '' + backdropBlur + 'px');
                    overlayEl.style.color = textColor;
                    overlayEl.style.textAlign = align;
                    overlayEl.style.zIndex = '' + zIndex;
                    applyOverlayPositionStyles(overlayEl, overlay);
                    overlayEl.classList.toggle('has-text', hasBackground && !!plainText);
                    overlayContainer.appendChild(overlayEl);

                    const delayMs = Math.max(0, (overlay.delay || 0) * 1000);
                    const durationMs = Math.max(0, (overlay.duration || 0) * 1000);
                    const effectDurationMs = effectDurationSec * 1000;

                    const showTimer = setTimeout(() => {
                        if (effect !== 'typewriter' && effect !== 'word-reveal') {
                            overlayEl.innerHTML = displayHtml;
                        }
                        overlayEl.classList.add('visible');
                        playOverlayTextEffect(overlayEl, { text: plainText, effect }, effectDurationMs);
                        if (durationMs > 0) {
                            const hideTimer = setTimeout(() => {
                                overlayEl.classList.remove('visible');
                            }, durationMs);
                            overlayTimeouts.push(hideTimer);
                        }
                    }, delayMs);

                    overlayTimeouts.push(showTimer);
                });
            }

            function getPixelateCanvasSize(aspectRatio, base) {
                const size = base || 32;
                if (!aspectRatio || !Number.isFinite(aspectRatio)) {
                    return { width: size, height: size };
                }
                if (aspectRatio >= 1) {
                    return { width: size, height: Math.max(10, Math.round(size / aspectRatio)) };
                }
                return { width: Math.max(10, Math.round(size * aspectRatio)), height: size };
            }

            function drawCoverToCanvas(img, canvas, ctx) {
                const cw = canvas.width;
                const ch = canvas.height;
                const scale = Math.max(cw / img.width, ch / img.height);
                const dw = img.width * scale;
                const dh = img.height * scale;
                const dx = (cw - dw) / 2;
                const dy = (ch - dh) / 2;
                ctx.imageSmoothingEnabled = false;
                ctx.clearRect(0, 0, cw, ch);
                ctx.drawImage(img, dx, dy, dw, dh);
            }

            function createPixelatedCanvas(src, aspectRatio, base) {
                const size = getPixelateCanvasSize(aspectRatio, base);
                const canvas = document.createElement('canvas');
                canvas.width = size.width;
                canvas.height = size.height;
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.imageRendering = 'pixelated';

                const ctx = canvas.getContext('2d');
                const img = new Image();
                img.onload = () => drawCoverToCanvas(img, canvas, ctx);
                img.src = src;
                return canvas;
            }

            function getTop3PixelateSize(award) {
                const amount = clampNumber(Number(award?.top3?.pixelateAmount) || 6, 1, 10);
                const min = 10;
                const max = 46;
                const t = (10 - amount) / 9;
                return Math.round(min + t * (max - min));
            }

            function getSilhouetteBrightness(award) {
                const darkness = clampNumber(Number(award?.top3?.silhouetteDarkness) || 0.8, 0.3, 0.95);
                return clampNumber(1 - darkness, 0.05, 0.7);
            }

            function resetTop3Stage() {
                const stage = document.getElementById('top3Stage');
                const teaser = document.getElementById('top3Teaser');
                const layout = document.getElementById('top3Layout');
                const badge = document.getElementById('top3RevealBadge');
                if (stage) {
                    stage.classList.remove('visible');
                    stage.classList.add('hidden');
                }
                if (teaser) teaser.innerHTML = '';
                if (layout) layout.innerHTML = '';
                if (badge) {
                    badge.classList.remove('visible');
                    badge.classList.add('hidden');
                }
            }

            function prepareTop3Heading(award) {
                const categoryEl = document.getElementById('top3Category');
                const titleEl = document.getElementById('top3Title');
                const subLineEl = document.getElementById('top3SubLine');
                if (categoryEl) categoryEl.innerText = award.categoryLine || 'And the award for';
                if (titleEl) titleEl.innerText = award.title || '';
                if (subLineEl) {
                    subLineEl.innerText = award.subLine || '';
                    subLineEl.style.display = award.subLine ? 'block' : 'none';
                }
            }

            function getTop3PlaceLabel(index, award) {
                const entry = award?.top3?.entries?.[index];
                const place = getTop3EntryPlace(entry, index, award);
                return getTop3Label(award, 'placeLabel', place);
            }

            function getTop3GridProfile(mainCount, totalCount) {
                const safeMainCount = Math.max(1, Number(mainCount) || 1);
                const safeTotalCount = Math.max(1, Number(totalCount) || safeMainCount);
                const columns = safeTotalCount <= 4
                    ? safeMainCount
                    : (safeMainCount <= 2 ? safeMainCount : Math.ceil(safeMainCount / 2));
                const rows = Math.max(1, Math.ceil(safeMainCount / columns));
                let cardMaxWidth = 300;
                if (safeTotalCount <= 4) {
                    cardMaxWidth = 260;
                } else if (safeTotalCount <= 6) {
                    cardMaxWidth = 280;
                }
                return { columns, rows, cardMaxWidth };
            }

            function renderTop3Teaser(award) {
                ensureTop3(award);
                const teaser = document.getElementById('top3Teaser');
                if (!teaser) return;
                teaser.innerHTML = '';
                teaser.classList.remove('silhouette', 'blur', 'pixelate');
                teaser.classList.add(award.top3.teaserStyle || 'silhouette');
                const stage = document.getElementById('top3Stage');
                if (stage) {
                    stage.style.setProperty('--top3-silhouette-brightness', String(getSilhouetteBrightness(award)));
                }
                const entries = award.top3.entries.map((entry, index) => ({
                    entry,
                    index,
                    place: getTop3EntryPlace(entry, index, award)
                }));
                const totalCount = getTop3Count(award);
                const winnerEnabled = isTop3WinnerEnabled(award);
                const winnerEntry = winnerEnabled ? entries.find(item => item.place === 1) : null;
                const needsSide = winnerEnabled && totalCount % 2 === 1 && winnerEntry;
                const mainEntries = needsSide ? entries.filter(item => item.place !== 1) : entries;
                const profile = getTop3GridProfile(mainEntries.length, totalCount);

                teaser.style.setProperty('--top3-cols', String(profile.columns));
                teaser.style.setProperty('--top3-rows', String(profile.rows));
                teaser.style.setProperty('--top3-card-max-width', profile.cardMaxWidth + 'px');
                teaser.classList.toggle('has-side', !!needsSide);

                const grid = document.createElement('div');
                grid.className = 'top3-teaser-grid';

                mainEntries.forEach(({ entry, index }) => {
                    const card = document.createElement('div');
                    card.className = 'top3-teaser-card';
                    const label = document.createElement('div');
                    label.className = 'top3-teaser-label';
                    label.innerText = getTop3PlaceLabel(index, award);
                    const media = document.createElement('div');
                    media.className = 'top3-teaser-media';
                    if (entry.image) {
                        if (award.top3.teaserStyle === 'pixelate') {
                            media.appendChild(createPixelatedCanvas(entry.image, 0.8, getTop3PixelateSize(award)));
                        } else {
                        const img = document.createElement('img');
                        img.className = 'top3-teaser-img';
                        img.src = entry.image;
                        img.style.objectFit = getImageFit(entry);
                        media.appendChild(img);
                    }
                }
                    card.appendChild(media);
                    card.appendChild(label);
                    grid.appendChild(card);
                });

                teaser.appendChild(grid);

                if (needsSide && winnerEntry) {
                    const side = document.createElement('div');
                    side.className = 'top3-teaser-side';
                    const card = document.createElement('div');
                    card.className = 'top3-teaser-card';
                    const label = document.createElement('div');
                    label.className = 'top3-teaser-label';
                    label.innerText = getTop3PlaceLabel(winnerEntry.index, award);
                    const media = document.createElement('div');
                    media.className = 'top3-teaser-media';
                    if (winnerEntry.entry.image) {
                        if (award.top3.teaserStyle === 'pixelate') {
                            media.appendChild(createPixelatedCanvas(winnerEntry.entry.image, 0.8, getTop3PixelateSize(award)));
                        } else {
                        const img = document.createElement('img');
                        img.className = 'top3-teaser-img';
                        img.src = winnerEntry.entry.image;
                        img.style.objectFit = getImageFit(winnerEntry.entry);
                        media.appendChild(img);
                    }
                }
                    card.appendChild(media);
                    card.appendChild(label);
                    side.appendChild(card);
                    teaser.appendChild(side);
                }
            }

            function renderTop3Layout(award) {
                ensureTop3(award);
                const layout = document.getElementById('top3Layout');
                if (!layout) return;
                layout.innerHTML = '';
                layout.classList.toggle('editorial', award.top3.layoutStyle === 'editorial');
                layout.classList.remove('teaser-silhouette', 'teaser-blur', 'teaser-pixelate');
                layout.classList.add('teaser-' + (award.top3.teaserStyle || 'silhouette'));
                const stage = document.getElementById('top3Stage');
                if (stage) {
                    stage.style.setProperty('--top3-silhouette-brightness', String(getSilhouetteBrightness(award)));
                }
                const entries = award.top3.entries.map((entry, index) => ({
                    entry,
                    index,
                    place: getTop3EntryPlace(entry, index, award)
                }));
                const totalCount = getTop3Count(award);
                const winnerEnabled = isTop3WinnerEnabled(award);
                const winnerEntry = winnerEnabled ? entries.find(item => item.place === 1) : null;
                const needsSide = winnerEnabled && totalCount % 2 === 1 && winnerEntry;
                const mainEntries = needsSide ? entries.filter(item => item.place !== 1) : entries;
                const profile = getTop3GridProfile(mainEntries.length, totalCount);

                layout.style.setProperty('--top3-cols', String(profile.columns));
                layout.style.setProperty('--top3-rows', String(profile.rows));
                layout.style.setProperty('--top3-card-max-width', profile.cardMaxWidth + 'px');
                layout.classList.toggle('has-side', !!needsSide);

                const grid = document.createElement('div');
                grid.className = 'top3-layout-grid';

                mainEntries.forEach(({ entry, index, place }) => {
                    const slot = document.createElement('div');
                    slot.className = 'top3-slot empty';
                    slot.dataset.place = String(place);

                    const media = document.createElement('div');
                    media.className = 'top3-slot-media';

                    const meta = document.createElement('div');
                    meta.className = 'top3-slot-meta';
                    const placeEl = document.createElement('div');
                    placeEl.className = 'top3-slot-place';
                    placeEl.innerText = getTop3PlaceLabel(index, award);
                    const nameEl = document.createElement('div');
                    nameEl.className = 'top3-slot-name';
                    nameEl.innerText = '';
                    meta.appendChild(placeEl);
                    meta.appendChild(nameEl);

                    slot.appendChild(media);
                    slot.appendChild(meta);
                    grid.appendChild(slot);
                });

                layout.appendChild(grid);

                if (needsSide && winnerEntry) {
                    const side = document.createElement('div');
                    side.className = 'top3-layout-side';
                    const slot = document.createElement('div');
                    slot.className = 'top3-slot empty';
                    slot.dataset.place = String(winnerEntry.place);

                    const media = document.createElement('div');
                    media.className = 'top3-slot-media';

                    const meta = document.createElement('div');
                    meta.className = 'top3-slot-meta';
                    const placeEl = document.createElement('div');
                    placeEl.className = 'top3-slot-place';
                    placeEl.innerText = getTop3PlaceLabel(winnerEntry.index, award);
                    const nameEl = document.createElement('div');
                    nameEl.className = 'top3-slot-name';
                    nameEl.innerText = '';
                    meta.appendChild(placeEl);
                    meta.appendChild(nameEl);

                    slot.appendChild(media);
                    slot.appendChild(meta);
                    side.appendChild(slot);
                    layout.appendChild(side);
                }

                updateTop3LayoutSlots(award);
            }

            function updateTop3LayoutSlots(award) {
                ensureTop3(award);
                const layout = document.getElementById('top3Layout');
                if (!layout) return;
                const emphasis = award.top3.winnerEmphasis || 'scale-glow';
                const winnerEnabled = isTop3WinnerEnabled(award);

                award.top3.entries.forEach((entry, index) => {
                    const place = getTop3EntryPlace(entry, index, award);
                    const slot = layout.querySelector('.top3-slot[data-place="' + place + '"]');
                    if (!slot) return;
                    const media = slot.querySelector('.top3-slot-media');
                    const nameEl = slot.querySelector('.top3-slot-name');
                    const isPlaced = !!playerState.top3Placed[index];
                    const hasImage = !!entry.image;
                    slot.classList.toggle('empty', !hasImage);
                    slot.classList.toggle('unrevealed', !isPlaced);
                    slot.classList.remove('winner', 'pulse');
                    slot.classList.remove('place-in');

                    if (media) media.innerHTML = '';
                    if (hasImage && media) {
                        if (!isPlaced && award.top3.teaserStyle === 'pixelate') {
                            media.appendChild(createPixelatedCanvas(entry.image, 0.8, getTop3PixelateSize(award)));
                        } else {
                            const img = document.createElement('img');
                            img.alt = entry.name || getTop3PlaceLabel(index, award);
                            img.src = entry.image || '';
                            img.style.objectFit = getImageFit(entry);
                            if (isPlaced) {
                                img.style.transform = 'translate(' + (entry.transform?.x || 0) + 'px, ' + (entry.transform?.y || 0) + 'px) scale(' + (entry.transform?.scale || 1) + ')';
                            }
                            media.appendChild(img);
                        }
                    }

                    if (nameEl) {
                        nameEl.innerText = isPlaced ? (entry.name || '') : '';
                    }

                    if (winnerEnabled && place === 1 && isPlaced && emphasis !== 'none') {
                        slot.classList.add('winner');
                        if (emphasis === 'pulse-glow') {
                            slot.classList.add('pulse');
                        }
                    }
                });
            }

            function showTop3Stage(mode, award) {
                const stage = document.getElementById('top3Stage');
                const teaser = document.getElementById('top3Teaser');
                const layout = document.getElementById('top3Layout');
                if (!stage || !teaser || !layout) return;
                stage.classList.remove('hidden');
                stage.classList.add('visible');
                if (mode === 'teaser') {
                    renderTop3Teaser(award);
                    teaser.style.display = 'grid';
                    layout.style.display = 'none';
                } else {
                    renderTop3Layout(award);
                    teaser.style.display = 'none';
                    layout.style.display = 'grid';
                }
            }

            function hideTop3Stage() {
                const stage = document.getElementById('top3Stage');
                if (!stage) return;
                stage.classList.remove('visible');
                stage.classList.add('hidden');
            }

            function showTop3RevealBadge(award, index, entry) {
                const badge = document.getElementById('top3RevealBadge');
                const placeEl = document.getElementById('top3RevealPlace');
                const nameEl = document.getElementById('top3RevealName');
                if (!badge || !placeEl || !nameEl) return;
                placeEl.innerText = getTop3PlaceLabel(index, award);
                nameEl.innerText = entry?.name || '';
                badge.classList.remove('hidden');
                requestAnimationFrame(() => badge.classList.add('visible'));
            }

            function hideTop3RevealBadge() {
                const badge = document.getElementById('top3RevealBadge');
                if (!badge) return;
                badge.classList.remove('visible');
                badge.classList.add('hidden');
            }

        const BUTTON_ACTION_CLASSES = [
            'action-default',
            'action-reveal',
            'action-place',
            'action-see-more',
            'action-back',
            'action-next',
            'action-end'
        ];

        function setButtonActionClass(btn, action) {
            if (!btn) return;
            BUTTON_ACTION_CLASSES.forEach((className) => btn.classList.remove(className));
            btn.classList.add('action-' + (action || 'default'));
        }

        function updateNextButton(label, action = 'default') {
            const btn = document.getElementById('nextBtn');
            if (!btn) return;
            btn.innerText = label;
            btn.classList.remove('layout-hidden');
            btn.classList.add('visible');
            setButtonActionClass(btn, action);
            btn.disabled = false;
        }

            function setNextButtonProminence(level) {
                const btn = document.getElementById('nextBtn');
                if (!btn) return;
                btn.classList.toggle('is-secondary', level === 'secondary');
            }

            function setTop3SeeMoreButton(label, options) {
                const btn = document.getElementById('top3SeeMoreBtn');
                if (!btn) return;
                const controls = btn.closest('.player-controls');
                const disabled = !!(options && options.disabled);
                const secondary = !!(options && options.secondary);
                const action = (options && options.action) || (secondary ? 'back' : 'see-more');
                if (!label) {
                    btn.classList.remove('visible');
                    btn.classList.remove('is-secondary');
                    btn.classList.add('layout-hidden');
                    btn.disabled = false;
                    btn.innerText = 'See More';
                    setButtonActionClass(btn, 'default');
                    if (controls) controls.classList.remove('linked-nav');
                    return;
                }
                btn.innerText = label;
                btn.classList.remove('layout-hidden');
                btn.classList.add('visible');
                btn.classList.toggle('is-secondary', secondary);
                setButtonActionClass(btn, action);
                btn.disabled = disabled;
                if (controls) controls.classList.toggle('linked-nav', secondary);
            }

            function resetPlayerControlButtons() {
                const btn = document.getElementById('nextBtn');
                if (btn) {
                    btn.classList.remove('visible');
                    btn.classList.remove('is-secondary');
                    btn.classList.add('layout-hidden');
                    btn.innerText = 'Next';
                    setButtonActionClass(btn, 'default');
                    btn.disabled = true;
                }
                setTop3SeeMoreButton(null);
                setNextButtonProminence('primary');
            }

            function resolveTop3LinkedRange(entry, parentIndex) {
                const startId = String(entry?.linkedStartAwardId || '').trim();
                if (!startId) return null;
                let startIndex = awards.findIndex((award) => award?.id === startId);
                if (startIndex < 0) return null;
                const endId = String(entry?.linkedEndAwardId || '').trim();
                let endIndex = startIndex;
                if (endId) {
                    const foundEnd = awards.findIndex((award) => award?.id === endId);
                    if (foundEnd >= 0) endIndex = foundEnd;
                }
                if (endIndex < startIndex) {
                    const swap = startIndex;
                    startIndex = endIndex;
                    endIndex = swap;
                }
                const effectiveParent = Number.isFinite(Number(parentIndex)) ? Number(parentIndex) : playerState.currentIndex;
                if (effectiveParent >= startIndex && effectiveParent <= endIndex) {
                    return null;
                }
                return { startIndex, endIndex };
            }

            function resolveAwardLinkedRange(award, parentIndex) {
                const startId = String(award?.linkedStartAwardId || '').trim();
                if (!startId) return null;
                let startIndex = awards.findIndex((item) => item?.id === startId);
                if (startIndex < 0) return null;
                const endId = String(award?.linkedEndAwardId || '').trim();
                let endIndex = startIndex;
                if (endId) {
                    const foundEnd = awards.findIndex((item) => item?.id === endId);
                    if (foundEnd >= 0) endIndex = foundEnd;
                }
                if (endIndex < startIndex) {
                    const swap = startIndex;
                    startIndex = endIndex;
                    endIndex = swap;
                }
                const effectiveParent = Number.isFinite(Number(parentIndex)) ? Number(parentIndex) : playerState.currentIndex;
                if (effectiveParent >= startIndex && effectiveParent <= endIndex) {
                    return null;
                }
                return { startIndex, endIndex };
            }

            function getAwardSeeMoreLabel(award) {
                const label = String(award?.seeMoreText ?? '').trim();
                return label || 'Show More';
            }

            function getAwardBackLabel(award) {
                const label = String(award?.backText ?? '').trim();
                return label || 'Back';
            }

            function updateSecondaryActionButton(award) {
                if (playerState.linkedMode && getNextSequenceIndex() !== null) {
                    setTop3SeeMoreButton(playerState.linkedMode.backLabel || 'Back', { secondary: true });
                    setNextButtonProminence('primary');
                    return;
                }

                if (!playerState.linkedMode && award?.slideType === 'award' && playerState.phase === 'revealed') {
                    const hasLinkedRange = !!resolveAwardLinkedRange(award, playerState.currentIndex);
                    setTop3SeeMoreButton(hasLinkedRange ? getAwardSeeMoreLabel(award) : null, { secondary: false });
                    setNextButtonProminence(hasLinkedRange ? 'secondary' : 'primary');
                    return;
                }

                setTop3SeeMoreButton(null);
                setNextButtonProminence('primary');
            }

            function isMainRunSkipped(award) {
                return award?.linkedOnly === true;
            }

            function getMainRunIndexAtOrAfter(startIndex) {
                const safeStart = Math.max(0, Math.floor(Number(startIndex) || 0));
                if (safeStart >= awards.length) return null;
                for (let i = safeStart; i < awards.length; i += 1) {
                    if (!isMainRunSkipped(awards[i])) {
                        return i;
                    }
                }
                return null;
            }

            function getNextSequenceIndex() {
                if (playerState.linkedMode) {
                    const endRaw = Number(playerState.linkedMode.endIndex);
                    const maxIndex = Math.max(0, awards.length - 1);
                    if (!Number.isFinite(endRaw)) return null;
                    const endIndex = clampNumber(endRaw, 0, maxIndex);
                    if (playerState.currentIndex < endIndex) {
                        return playerState.currentIndex + 1;
                    }
                    return null;
                }
                return getMainRunIndexAtOrAfter(playerState.currentIndex + 1);
            }

            function getAdvanceActionType() {
                if (getNextSequenceIndex() !== null) {
                    return 'next';
                }
                return playerState.linkedMode ? 'back' : 'end';
            }

            function getAdvanceActionLabel(award) {
                if (getNextSequenceIndex() !== null) {
                    return award?.nextText || 'Next Slide';
                }
                return playerState.linkedMode ? (playerState.linkedMode.backLabel || 'Back') : 'End Show';
            }

            function restoreTop3AfterLinkedPlayback(linked) {
                const parentAward = awards[linked.parentAwardIndex];
                if (!parentAward || parentAward.slideType !== 'top3') {
                    setTop3SeeMoreButton(null);
                    const nextIndex = getNextSequenceIndex();
                    if (nextIndex !== null) {
                        startSequence(nextIndex);
                    } else {
                        endShow();
                    }
                    return;
                }

                ensureTop3(parentAward);
                const count = getTop3Count(parentAward);
                const entryIndex = clampNumber(
                    Number(linked.parentEntryIndex) || 0,
                    0,
                    Math.max(0, count - 1)
                );
                playerState.currentIndex = clampNumber(
                    Number(linked.parentAwardIndex) || 0,
                    0,
                    Math.max(0, awards.length - 1)
                );
                playerState.phase = 'top3';
                playerState.busy = false;
                playerState.top3Step = Number.isFinite(Number(linked.parentTop3Step))
                    ? Number(linked.parentTop3Step)
                    : (entryIndex * 2 + 1);
                playerState.top3Placed = Array.isArray(linked.parentTop3Placed)
                    ? linked.parentTop3Placed.slice(0, count).map(Boolean)
                    : Array.from({ length: count }, () => false);
                while (playerState.top3Placed.length < count) {
                    playerState.top3Placed.push(false);
                }
                playerState.top3ActiveEntryIndex = entryIndex;

                revealTop3Place(parentAward, entryIndex);
                const entry = parentAward.top3.entries[entryIndex];
                const place = getTop3EntryPlace(entry, entryIndex, parentAward);
                const hasLinkedRange = !!resolveTop3LinkedRange(entry, playerState.currentIndex);
                updateNextButton(getTop3Label(parentAward, 'place', place), 'place');
                setNextButtonProminence(hasLinkedRange ? 'secondary' : 'primary');
                setTop3SeeMoreButton(
                    hasLinkedRange ? getTop3Label(parentAward, 'seeMore', place) : null,
                    { secondary: false }
                );
                scheduleAutoAdvanceForAward(parentAward);
            }

            function restoreAwardAfterLinkedPlayback(linked) {
                const parentAward = awards[linked.parentAwardIndex];
                if (!parentAward || parentAward.slideType !== 'award') {
                    setTop3SeeMoreButton(null);
                    const nextIndex = getNextSequenceIndex();
                    if (nextIndex !== null) {
                        startSequence(nextIndex);
                    } else {
                        endShow();
                    }
                    return;
                }

                playerState.currentIndex = clampNumber(
                    Number(linked.parentAwardIndex) || 0,
                    0,
                    Math.max(0, awards.length - 1)
                );
                playerState.phase = 'revealed';
                playerState.busy = false;
                playerState.top3Placed = [];
                playerState.top3Step = 0;
                playerState.top3ActiveEntryIndex = null;
                clearAutoAdvanceTimer();

                const bg = document.getElementById('playerBackground');
                const img = document.getElementById('playerImageElement');
                const imgWrap = document.getElementById('playerImageWrap');
                const textStage = document.getElementById('textStage');
                hideTop3Stage();
                hideTop3RevealBadge();
                resetOverlayContainer();

                document.getElementById('playerCategory').innerText = parentAward.categoryLine || 'And the award for';
                document.getElementById('playerTitle').innerText = parentAward.title;
                const subLineEl = document.getElementById('playerSubLine');
                subLineEl.innerText = parentAward.subLine || '';
                subLineEl.style.display = parentAward.subLine ? 'block' : 'none';
                const winnerEl = document.getElementById('playerWinner');
                winnerEl.innerText = parentAward.winner || '';
                winnerEl.style.color = parentAward.winnerColor || '#ff3b30';
                winnerEl.style.visibility = parentAward.winner ? 'visible' : 'hidden';
                winnerEl.classList.remove('animate-in');

                if (textStage) textStage.classList.add('faded-out');
                imgWrap.classList.remove('ken-burns', 'ken-burns-fixate');
                if (parentAward.image) {
                    img.src = parentAward.image;
                    img.style.objectFit = getImageFit(parentAward);
                    img.style.transform = 'translate(' + parentAward.transform.x + 'px, ' + parentAward.transform.y + 'px) scale(' + parentAward.transform.scale + ')';
                    applyKenBurns(imgWrap, parentAward);
                    applyPhotoFadeDuration(parentAward);
                    bg.classList.add('active');
                } else {
                    img.src = '';
                    bg.classList.remove('active');
                }

                scheduleOverlays(parentAward);
                updateNextButton(getAdvanceActionLabel(parentAward), getAdvanceActionType());
                updateSecondaryActionButton(parentAward);
                scheduleAutoAdvanceForAward(parentAward);
            }

            function restoreLinkedPlayback() {
                const linked = playerState.linkedMode;
                if (!linked) return;
                playerState.linkedMode = null;
                if (linked.parentType === 'award') {
                    restoreAwardAfterLinkedPlayback(linked);
                    return;
                }
                restoreTop3AfterLinkedPlayback(linked);
            }

            function continueSequenceOrExit() {
                const nextIndex = getNextSequenceIndex();
                if (nextIndex !== null) {
                    playSoundEffect('advance');
                    startSequence(nextIndex, { keepLinkedMode: !!playerState.linkedMode });
                    return;
                }
                if (playerState.linkedMode) {
                    playSoundEffect('advance');
                    restoreLinkedPlayback();
                    return;
                }
                endShow();
            }

            function openTop3SeeMore() {
                if (playerState.busy || playerState.phase === 'revealing') return;
                if (playerState.linkedMode) {
                    restoreLinkedPlayback();
                    return;
                }
                const award = awards[playerState.currentIndex];
                if (!award) return;

                if (award.slideType === 'award') {
                    if (playerState.phase !== 'revealed') return;
                    const range = resolveAwardLinkedRange(award, playerState.currentIndex);
                    if (!range) {
                        setTop3SeeMoreButton(null);
                        setNextButtonProminence('primary');
                        return;
                    }
                    playerState.linkedMode = {
                        parentType: 'award',
                        parentAwardIndex: playerState.currentIndex,
                        parentPhase: playerState.phase,
                        backLabel: getAwardBackLabel(award),
                        startIndex: range.startIndex,
                        endIndex: range.endIndex
                    };
                    clearAutoAdvanceTimer();
                    resetPlayerControlButtons();
                    startSequence(range.startIndex, { keepLinkedMode: true });
                    return;
                }

                if (award.slideType !== 'top3') return;
                ensureTop3(award);
                const count = getTop3Count(award);
                let entryIndex = Number(playerState.top3ActiveEntryIndex);
                if (!Number.isFinite(entryIndex)) {
                    entryIndex = Math.floor(Math.max(0, Number(playerState.top3Step || 1) - 1) / 2);
                }
                entryIndex = clampNumber(entryIndex, 0, Math.max(0, count - 1));
                const entry = award.top3.entries[entryIndex];
                const range = resolveTop3LinkedRange(entry, playerState.currentIndex);
                if (!range) {
                    setTop3SeeMoreButton(null);
                    setNextButtonProminence('primary');
                    return;
                }
                playerState.linkedMode = {
                    parentType: 'top3',
                    parentAwardIndex: playerState.currentIndex,
                    parentEntryIndex: entryIndex,
                    parentTop3Step: playerState.top3Step,
                    parentTop3Placed: Array.isArray(playerState.top3Placed) ? playerState.top3Placed.slice() : [],
                    backLabel: getTop3Label(award, 'back', getTop3EntryPlace(entry, entryIndex, award)),
                    startIndex: range.startIndex,
                    endIndex: range.endIndex
                };
                clearAutoAdvanceTimer();
                resetPlayerControlButtons();
                startSequence(range.startIndex, { keepLinkedMode: true });
            }

            function revealTop3Place(award, index) {
                const entry = award.top3.entries[index];
                const bg = document.getElementById('playerBackground');
                const img = document.getElementById('playerImageElement');
                const imgWrap = document.getElementById('playerImageWrap');
                const textStage = document.getElementById('textStage');

                hideTop3Stage();
                hideTop3RevealBadge();
                resetOverlayContainer();
                if (textStage) textStage.classList.add('faded-out');

                img.src = entry.image || '';
                img.style.objectFit = getImageFit(entry);
                img.style.transform = 'translate(' + (entry.transform?.x || 0) + 'px, ' + (entry.transform?.y || 0) + 'px) scale(' + (entry.transform?.scale || 1) + ')';
                applyKenBurns(imgWrap, entry);
                applyPhotoFadeDuration(award, 'top3');
                bg.classList.add('active');
                playSoundEffect('reveal');
                scheduleOverlays(entry);
            }

            function animateTop3Reveal(award, index, onDone, fromTeaser) {
                const entry = award.top3.entries[index];
                const stage = document.getElementById('top3Stage');
                const bg = document.getElementById('playerBackground');
                const btn = document.getElementById('nextBtn');
                if (!entry?.image || !stage || !bg) {
                    revealTop3Place(award, index);
                    if (typeof onDone === 'function') onDone();
                    return;
                }

                playerState.busy = true;
                if (btn) btn.disabled = true;

                let sourceEl = null;
                if (fromTeaser) {
                    const teaserCards = stage.querySelectorAll('.top3-teaser-card');
                    sourceEl = teaserCards[index] || null;
                } else {
                    const place = getTop3EntryPlace(entry, index, award);
                    sourceEl = stage.querySelector('.top3-slot[data-place="' + place + '"]');
                }

                if (!sourceEl) {
                    revealTop3Place(award, index);
                    playerState.busy = false;
                    if (btn) btn.disabled = false;
                    if (typeof onDone === 'function') onDone();
                    return;
                }

                const startRect = sourceEl.getBoundingClientRect();
                const endRect = bg.getBoundingClientRect();

                const clone = document.createElement('div');
                clone.className = 'top3-reveal-clone';
                clone.style.left = startRect.left + 'px';
                clone.style.top = startRect.top + 'px';
                clone.style.width = startRect.width + 'px';
                clone.style.height = startRect.height + 'px';

                const media = document.createElement('div');
                media.className = 'top3-reveal-media';

                const teaserStyle = award.top3.teaserStyle || 'silhouette';
                const silhouetteBrightness = getSilhouetteBrightness(award);

                if (teaserStyle === 'pixelate') {
                    const canvas = createPixelatedCanvas(entry.image, 0.8, getTop3PixelateSize(award));
                    canvas.style.opacity = '1';
                    const img = document.createElement('img');
                    img.src = entry.image;
                    img.style.objectFit = getImageFit(entry);
                    img.style.opacity = '0';
                    media.appendChild(canvas);
                    media.appendChild(img);
                } else {
                    const img = document.createElement('img');
                    img.src = entry.image;
                    img.style.objectFit = getImageFit(entry);
                    if (teaserStyle === 'blur') {
                        img.style.filter = 'blur(22px) brightness(0.85) saturate(0.9)';
                    } else if (teaserStyle === 'silhouette') {
                        img.style.filter = 'grayscale(1) brightness(' + silhouetteBrightness + ') contrast(1.2)';
                    }
                    media.appendChild(img);
                }

                clone.appendChild(media);
                document.body.appendChild(clone);

                hideTop3Stage();
                hideTop3RevealBadge();

                requestAnimationFrame(() => {
                    const scaleX = endRect.width / startRect.width;
                    const scaleY = endRect.height / startRect.height;
                    const translateX = endRect.left - startRect.left;
                    const translateY = endRect.top - startRect.top;
                    clone.style.transform = 'translate(' + translateX + 'px, ' + translateY + 'px) scale(' + scaleX + ', ' + scaleY + ')';

                    const img = media.querySelector('img');
                    const canvas = media.querySelector('canvas');
                    if (img) {
                        img.style.filter = 'none';
                        img.style.opacity = '1';
                    }
                    if (canvas) {
                        canvas.style.opacity = '0';
                    }
                });

                setTimeout(() => {
                    clone.style.opacity = '0';
                    setTimeout(() => clone.remove(), 300);
                    revealTop3Place(award, index);
                    playerState.busy = false;
                    if (btn) btn.disabled = false;
                    if (typeof onDone === 'function') onDone();
                }, TOP3_REVEAL_MS);
            }

            function placeTop3Entry(award, index, onComplete) {
                const entry = award.top3.entries[index];
                const bg = document.getElementById('playerBackground');
                const imgWrap = document.getElementById('playerImageWrap');
                const layout = document.getElementById('top3Layout');
                const btn = document.getElementById('nextBtn');

                if (!bg || !layout || !imgWrap) return;
                playerState.busy = true;
                if (btn) btn.disabled = true;

                hideTop3RevealBadge();
                const startRect = bg.getBoundingClientRect();
                const clone = document.createElement('div');
                clone.className = 'top3-placing-clone';
                clone.style.left = startRect.left + 'px';
                clone.style.top = startRect.top + 'px';
                clone.style.width = startRect.width + 'px';
                clone.style.height = startRect.height + 'px';
                const cloneWrap = imgWrap.cloneNode(true);
                cloneWrap.classList.remove('ken-burns', 'ken-burns-preview', 'ken-burns-fixate', 'ken-burns-fixate-preview');
                clone.appendChild(cloneWrap);
                document.body.appendChild(clone);

                bg.classList.remove('active');
                resetOverlayContainer();

                setTimeout(() => {
                    showTop3Stage('layout', award);
                    updateTop3LayoutSlots(award);

                    const place = getTop3EntryPlace(entry, index, award);
                    const slot = layout.querySelector('.top3-slot[data-place="' + place + '"]');
                    if (!slot) {
                        clone.remove();
                        playerState.busy = false;
                        if (btn) btn.disabled = false;
                        if (typeof onComplete === 'function') onComplete();
                        return;
                    }
                    const endRect = slot.getBoundingClientRect();
                    requestAnimationFrame(() => {
                        const scaleX = endRect.width / startRect.width;
                        const scaleY = endRect.height / startRect.height;
                        const translateX = endRect.left - startRect.left;
                        const translateY = endRect.top - startRect.top;
                        clone.style.transform = 'translate(' + translateX + 'px, ' + translateY + 'px) scale(' + scaleX + ', ' + scaleY + ')';
                    });

                    setTimeout(() => {
                        clone.remove();
                        playerState.top3Placed[index] = true;
                        updateTop3LayoutSlots(award);
                        slot.classList.add('place-in');
                        setTimeout(() => slot.classList.remove('place-in'), 900);
                        playerState.busy = false;
                        if (btn) btn.disabled = false;
                        if (typeof onComplete === 'function') onComplete();
                    }, TOP3_PLACE_MS);
                }, TOP3_PLACE_FADE_MS);
            }

            function advanceTop3(award) {
                ensureTop3(award);
                const count = getTop3Count(award);
                if (!Number.isFinite(playerState.top3Step)) playerState.top3Step = 0;
                const step = playerState.top3Step;
                const maxStep = count * 2;

                if (step >= maxStep) {
                    playerState.top3ActiveEntryIndex = null;
                    if (playerState.linkedMode) {
                        setTop3SeeMoreButton(playerState.linkedMode.backLabel || 'Back', { secondary: true });
                    } else {
                        setTop3SeeMoreButton(null);
                    }
                    setNextButtonProminence('primary');
                    continueSequenceOrExit();
                    return;
                }

                const index = Math.floor(step / 2);
                const entry = award.top3.entries[index];
                const place = getTop3EntryPlace(entry, index, award);
                const isReveal = step % 2 === 0;

                const runStep = () => {
                    if (isReveal) {
                        const fromTeaser = step === 0;
                        animateTop3Reveal(award, index, () => {
                            if (playerState.linkedMode) {
                                playerState.top3ActiveEntryIndex = null;
                                setTop3SeeMoreButton(playerState.linkedMode.backLabel || 'Back', { secondary: true });
                                setNextButtonProminence('primary');
                            } else {
                                playerState.top3ActiveEntryIndex = index;
                                const hasLinkedRange = !!resolveTop3LinkedRange(entry, playerState.currentIndex);
                                setTop3SeeMoreButton(
                                    hasLinkedRange ? getTop3Label(award, 'seeMore', place) : null,
                                    { secondary: false }
                                );
                                setNextButtonProminence(hasLinkedRange ? 'secondary' : 'primary');
                            }
                            updateNextButton(getTop3Label(award, 'place', place), 'place');
                            scheduleAutoAdvanceForAward(award);
                        }, fromTeaser);
                    } else {
                        placeTop3Entry(award, index, () => {
                            playerState.top3ActiveEntryIndex = null;
                            if (playerState.linkedMode) {
                                setTop3SeeMoreButton(playerState.linkedMode.backLabel || 'Back', { secondary: true });
                            } else {
                                setTop3SeeMoreButton(null);
                            }
                            setNextButtonProminence('primary');
                            if (index + 1 < count) {
                                const nextEntry = award.top3.entries[index + 1];
                                const nextPlace = getTop3EntryPlace(nextEntry, index + 1, award);
                                updateNextButton(getTop3Label(award, 'reveal', nextPlace), 'reveal');
                            } else {
                                updateNextButton(getAdvanceActionLabel(award), getAdvanceActionType());
                            }
                            scheduleAutoAdvanceForAward(award);
                        });
                    }
                };

                const delayMs = getPhotoRevealDelaySec(award, 'top3') * 1000;
                if (delayMs > 0) {
                    const btn = document.getElementById('nextBtn');
                    const seeMoreBtn = document.getElementById('top3SeeMoreBtn');
                    playerState.busy = true;
                    if (btn) btn.disabled = true;
                    if (seeMoreBtn && seeMoreBtn.classList.contains('visible')) seeMoreBtn.disabled = true;
                    setTimeout(() => {
                        playerState.busy = false;
                        if (btn) btn.disabled = false;
                        if (seeMoreBtn && seeMoreBtn.classList.contains('visible')) seeMoreBtn.disabled = false;
                        runStep();
                    }, delayMs);
                } else {
                    runStep();
                }

                playerState.top3Step = step + 1;
            }

            function resetPlayerView() {
                const bg = document.getElementById('playerBackground');
                if (bg) bg.classList.remove('active');
                resetOverlayContainer();
                resetTop3Stage();
                playerState.linkedMode = null;
                playerState.top3ActiveEntryIndex = null;
                const textStage = document.getElementById('textStage');
                if (textStage) textStage.classList.add('faded-out');
                const imgWrap = document.getElementById('playerImageWrap');
                if (imgWrap) {
                    imgWrap.classList.remove('ken-burns', 'ken-burns-preview', 'ken-burns-fixate', 'ken-burns-fixate-preview');
                    imgWrap.style.removeProperty('--kb-scale-from');
                    imgWrap.style.removeProperty('--kb-scale-to');
                    imgWrap.style.removeProperty('--kb-x-from');
                    imgWrap.style.removeProperty('--kb-x-to');
                    imgWrap.style.removeProperty('--kb-y-from');
                    imgWrap.style.removeProperty('--kb-y-to');
                    imgWrap.style.removeProperty('--kb-duration');
                    imgWrap.style.removeProperty('--kb-easing');
                }
                const img = document.getElementById('playerImageElement');
                if (img) img.src = '';
                const menu = document.getElementById('menuScreen');
                if (menu) menu.classList.add('hidden');
                resetPlayerControlButtons();
            }

            function startShow() {
                resetPlayerView();
                const elem = document.getElementById('player-app');
                if (elem.requestFullscreen) elem.requestFullscreen().catch(() => {});
                else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
                else if (elem.msRequestFullscreen) elem.msRequestFullscreen();

                if (showSettings.startMenu) {
                    showMenu();
                } else {
                    startSequence(0);
                }
            }

            function setupPlayerHotkeys() {
                document.addEventListener('keydown', (e) => {
                    if (e.repeat) return;
                    const target = e.target;
                    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
                        return;
                    }
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        endShow();
                        return;
                    }
                    if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
                        e.preventDefault();
                        nextStep();
                    }
                });
            }

            function renderMenu() {
                const grid = document.getElementById('menuGrid');
                if (!grid) return;
                grid.innerHTML = '';
                awards.forEach((award, index) => {
                    if (award.slideType === 'photo') return;
                    const title = award.title || (
                        award.slideType === 'title-card'
                            ? 'Title Card'
                            : (award.slideType === 'photo' ? 'Photo Slide' : 'Untitled')
                    );
                    if (award.slideType === 'top3') ensureTop3(award);
                    const typeLabel = award.slideType === 'top3'
                        ? getTop3TypeLabel(award)
                        : (award.slideType === 'title-card' ? 'Title Card' : 'Award Slide');
                    const tile = document.createElement('button');
                    tile.className = 'menu-tile';
                    tile.onclick = () => startFromMenu(index);
                    tile.innerHTML = \`
                        <div class="menu-tile-title">\${title}</div>
                        <div class="menu-tile-sub">\${typeLabel}</div>
                    \`;
                    grid.appendChild(tile);
                });
            }

            function showMenu() {
                const menu = document.getElementById('menuScreen');
                if (!menu) return;
                menu.classList.remove('hidden');
                renderMenu();
                clearAutoAdvanceTimer();
                playerState.linkedMode = null;
                playerState.top3ActiveEntryIndex = null;
                resetPlayerControlButtons();
                const bg = document.getElementById('playerBackground');
                const textStage = document.getElementById('textStage');
                bg.classList.remove('active');
                textStage.classList.add('faded-out');
                resetOverlayContainer();
                resetTop3Stage();
            }

            function hideMenu() {
                const menu = document.getElementById('menuScreen');
                if (!menu) return;
                menu.classList.add('hidden');
            }

            function startFromMenu(index) {
                hideMenu();
                startSequence(index);
            }

            function startSequence(index, options = {}) {
                const keepLinkedMode = !!options.keepLinkedMode;
                if (!keepLinkedMode) {
                    playerState.linkedMode = null;
                }
                const maxIndex = Math.max(0, awards.length - 1);
                let resolvedIndex = clampNumber(Number(index) || 0, 0, maxIndex);
                if (!playerState.linkedMode) {
                    const playable = getMainRunIndexAtOrAfter(resolvedIndex);
                    if (playable === null) {
                        endShow();
                        return;
                    }
                    resolvedIndex = playable;
                }
                playerState.currentIndex = resolvedIndex;
                playerState.phase = 'intro';
                playerState.busy = false;
                playerState.top3Placed = [];
                playerState.top3Step = 0;
                playerState.top3ActiveEntryIndex = null;
                clearAutoAdvanceTimer();

                const bg = document.getElementById('playerBackground');
                const textStage = document.getElementById('textStage');
                const btn = document.getElementById('nextBtn');
                resetPlayerControlButtons();
                const award = awards[resolvedIndex];
                if (award?.slideType === 'top3') {
                    ensureTop3(award);
                    const count = getTop3Count(award);
                    playerState.top3Placed = Array.from({ length: count }, () => false);
                }

                const needsFade = bg.classList.contains('active');
                const delay = needsFade ? BG_FADE_MS : 0;

                bg.classList.remove('active');
                textStage.classList.add('faded-out');
                resetOverlayContainer();
                hideTop3Stage();
                hideTop3RevealBadge();

                setTimeout(() => {
                    if (award.slideType === 'top3') {
                        prepareTop3Heading(award);
                        showTop3Stage('teaser', award);
                        playerState.phase = 'top3';
                        const firstPlace = getTop3EntryPlace(award.top3.entries[0], 0, award);
                        updateNextButton(getTop3Label(award, 'reveal', firstPlace), 'reveal');
                        if (playerState.linkedMode) {
                            setTop3SeeMoreButton(playerState.linkedMode.backLabel || 'Back', { secondary: true });
                        } else {
                            setTop3SeeMoreButton(null);
                        }
                        setNextButtonProminence('primary');
                        document.getElementById('playerImageWrap').classList.remove('ken-burns', 'ken-burns-fixate');
                        scheduleAutoAdvanceForAward(award);
                        return;
                    }

                    resetAnimation('playerCategory');
                    resetAnimation('playerTitle');
                    resetAnimation('playerSubLine');
                    resetAnimation('playerWinner');

                    document.getElementById('playerCategory').innerText = award.categoryLine || 'And the award for';
                    document.getElementById('playerTitle').innerText = award.title;
                    const subLineEl = document.getElementById('playerSubLine');
                    subLineEl.innerText = award.subLine || '';
                    subLineEl.style.display = award.subLine ? 'block' : 'none';
                    const winnerEl = document.getElementById('playerWinner');
                    winnerEl.innerText = '';
                    winnerEl.style.visibility = 'hidden';
                    winnerEl.style.color = award.winnerColor || '#ff3b30';

                    const isPhotoOnly = isPhotoLikeSlideType(award.slideType);
                    if (!isPhotoOnly) {
                        textStage.classList.remove('faded-out');
                    }

                    if (!isPhotoOnly) {
                        setTimeout(() => {
                            document.getElementById('playerCategory').classList.add('animate-in');
                            document.getElementById('playerTitle').classList.add('animate-in', 'animate-delay-1');
                            if (award.subLine) {
                                document.getElementById('playerSubLine').classList.add('animate-in', 'animate-delay-2');
                            }
                        }, 100);
                    }

                    const nextLabel = getAdvanceActionLabel(award);
                    updateNextButton(
                        isPhotoOnly ? nextLabel : (award.revealText || 'Reveal Winner'),
                        isPhotoOnly ? getAdvanceActionType() : 'reveal'
                    );
                    updateSecondaryActionButton(award);

                    document.getElementById('playerImageWrap').classList.remove('ken-burns', 'ken-burns-fixate');

                    if (isPhotoOnly) {
                        const img = document.getElementById('playerImageElement');
                        const imgWrap = document.getElementById('playerImageWrap');
                        const revealDelayMs = getPhotoRevealDelaySec(award, 'photo') * 1000;
                        if (revealDelayMs > 0) btn.disabled = true;
                        setTimeout(() => {
                            img.src = award.image;
                            img.style.objectFit = getImageFit(award);
                            img.style.transform = \`translate(\${award.transform.x}px, \${award.transform.y}px) scale(\${award.transform.scale})\`;
                            applyKenBurns(imgWrap, award);
                            applyPhotoFadeDuration(award, 'photo');
                            bg.classList.add('active');
                            scheduleOverlays(award);
                            playSoundEffect('reveal');

                            playerState.phase = 'revealed';
                            updateSecondaryActionButton(award);
                            btn.disabled = false;
                            scheduleAutoAdvanceForAward(award);
                        }, revealDelayMs);
                    } else if (!showSettings.holdOnBlack && award.image) {
                        const img = document.getElementById('playerImageElement');
                        const imgWrap = document.getElementById('playerImageWrap');
                        img.src = award.image;
                        img.style.objectFit = getImageFit(award);
                        img.style.transform = \`translate(\${award.transform.x}px, \${award.transform.y}px) scale(\${award.transform.scale})\`;
                        applyKenBurns(imgWrap, award);
                        applyPhotoFadeDuration(award);
                        bg.classList.add('active');
                    }
                    if (!isPhotoOnly) {
                        scheduleAutoAdvanceForAward(award);
                    }
                }, delay);
            }

            function nextStep() {
                const award = awards[playerState.currentIndex];
                const textStage = document.getElementById('textStage');

                if (playerState.busy || playerState.phase === 'revealing') return;
                clearAutoAdvanceTimer();

                if (award.slideType === 'top3') {
                    advanceTop3(award);
                    return;
                }

                if (isPhotoLikeSlideType(award.slideType)) {
                    continueSequenceOrExit();
                    return;
                }

                if (playerState.phase === 'intro') {
                    playerState.phase = 'revealing';
                    document.getElementById('nextBtn').disabled = true;

                    const bg = document.getElementById('playerBackground');
                    const img = document.getElementById('playerImageElement');
                    const imgWrap = document.getElementById('playerImageWrap');

                    const winnerEl = document.getElementById('playerWinner');
                    if (award.winner) {
                        winnerEl.innerText = award.winner;
                        winnerEl.style.color = award.winnerColor || '#ff3b30';
                        winnerEl.style.visibility = 'visible';
                        winnerEl.classList.add('animate-in');
                    }

                    const finalizeReveal = () => {
                        scheduleOverlays(award);
                        updateNextButton(getAdvanceActionLabel(award), getAdvanceActionType());
                        playerState.phase = 'revealed';
                        updateSecondaryActionButton(award);
                        scheduleAutoAdvanceForAward(award);
                        setTimeout(() => {
                            textStage.classList.add('faded-out');
                        }, TEXT_FADE_DELAY_MS);
                    };

                    if (showSettings.holdOnBlack) {
                        const revealDelayMs = getPhotoRevealDelaySec(award) * 1000;
                        setTimeout(() => {
                            img.src = award.image;
                            img.style.objectFit = getImageFit(award);
                            img.style.transform = \`translate(\${award.transform.x}px, \${award.transform.y}px) scale(\${award.transform.scale})\`;
                            applyKenBurns(imgWrap, award);
                            applyPhotoFadeDuration(award);
                            bg.classList.add('active');
                            playSoundEffect('reveal');
                            finalizeReveal();
                        }, revealDelayMs);
                    } else {
                        playSoundEffect('reveal');
                        finalizeReveal();
                    }

                } else {
                    continueSequenceOrExit();
                }
            }

            function resetAnimation(id) {
                const el = document.getElementById(id);
                el.classList.remove('animate-in', 'animate-delay-1', 'animate-delay-2');
                void el.offsetWidth;
            }

            function applyKenBurns(imgWrap, award, className) {
                let mode = award.kenBurnsMode;
                if (mode === undefined && award.kenBurns !== undefined) {
                    mode = award.kenBurns ? 'zoom-in' : 'off';
                }
                mode = mode || 'off';
                const isFixate = mode === 'fixate';
                const duration = isFixate ? (award.fixateSpeed || 8) : (award.kenBurnsDuration || 12);
                const intensity = award.kenBurnsIntensity || 20;
                const scaleDelta = Math.max(0, (intensity / 60) * 0.2);

                imgWrap.classList.remove('ken-burns', 'ken-burns-preview', 'ken-burns-fixate', 'ken-burns-fixate-preview');
                imgWrap.style.removeProperty('--kb-scale-from');
                imgWrap.style.removeProperty('--kb-scale-to');
                imgWrap.style.removeProperty('--kb-x-from');
                imgWrap.style.removeProperty('--kb-x-to');
                imgWrap.style.removeProperty('--kb-y-from');
                imgWrap.style.removeProperty('--kb-y-to');
                imgWrap.style.removeProperty('--kb-duration');
                imgWrap.style.removeProperty('--kb-easing');

                if (mode === 'off') return;

                let scaleFrom = 1;
                let scaleTo = 1 + scaleDelta;
                let xFrom = 0;
                let xTo = 0;
                let yFrom = 0;
                let yTo = 0;

                if (isFixate) {
                    const zoom = clampNumber(Number(award.fixateZoom) || 2.5, 1, 5);
                    const point = award.fixatePoint || { x: 0.5, y: 0.5 };
                    const px = clampNumber(Number(point.x) || 0.5, 0, 1);
                    const py = clampNumber(Number(point.y) || 0.5, 0, 1);
                    const rect = imgWrap.getBoundingClientRect();
                    const dx = (px - 0.5) * rect.width;
                    const dy = (py - 0.5) * rect.height;
                    scaleFrom = 1;
                    scaleTo = zoom;
                    xFrom = 0;
                    yFrom = 0;
                    xTo = -dx * (zoom - 1);
                    yTo = -dy * (zoom - 1);
                } else {
                    switch (mode) {
                        case 'zoom-in':
                            scaleFrom = 1;
                            scaleTo = 1 + scaleDelta;
                            break;
                        case 'zoom-out':
                            scaleFrom = 1 + scaleDelta;
                            scaleTo = 1;
                            break;
                        case 'pan-left-right':
                            xFrom = -intensity;
                            xTo = intensity;
                            scaleTo = 1 + scaleDelta * 0.5;
                            break;
                        case 'pan-right-left':
                            xFrom = intensity;
                            xTo = -intensity;
                            scaleTo = 1 + scaleDelta * 0.5;
                            break;
                        case 'pan-up-down':
                            yFrom = -intensity;
                            yTo = intensity;
                            scaleTo = 1 + scaleDelta * 0.5;
                            break;
                        case 'pan-down-up':
                            yFrom = intensity;
                            yTo = -intensity;
                            scaleTo = 1 + scaleDelta * 0.5;
                            break;
                        case 'diagonal-up-right':
                            xFrom = -intensity;
                            xTo = intensity;
                            yFrom = intensity;
                            yTo = -intensity;
                            scaleTo = 1 + scaleDelta * 0.5;
                            break;
                        case 'diagonal-down-left':
                            xFrom = intensity;
                            xTo = -intensity;
                            yFrom = -intensity;
                            yTo = intensity;
                            scaleTo = 1 + scaleDelta * 0.5;
                            break;
                        default:
                            break;
                    }
                }

                imgWrap.style.setProperty('--kb-scale-from', \`\${scaleFrom}\`);
                imgWrap.style.setProperty('--kb-scale-to', \`\${scaleTo}\`);
                imgWrap.style.setProperty('--kb-x-from', \`\${xFrom}px\`);
                imgWrap.style.setProperty('--kb-x-to', \`\${xTo}px\`);
                imgWrap.style.setProperty('--kb-y-from', \`\${yFrom}px\`);
                imgWrap.style.setProperty('--kb-y-to', \`\${yTo}px\`);
                imgWrap.style.setProperty('--kb-duration', \`\${duration}s\`);
                if (isFixate) {
                    const easing = fixateEasingOptions.includes(award.fixateEasing) ? award.fixateEasing : 'ease-out';
                    imgWrap.style.setProperty('--kb-easing', easing);
                }
                const resolvedClass = className || (isFixate ? 'ken-burns-fixate' : 'ken-burns');
                imgWrap.classList.add(resolvedClass);
            }

            function endShow() {
                if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
                clearAutoAdvanceTimer();
                playerState.linkedMode = null;
                playerState.top3ActiveEntryIndex = null;
                setTop3SeeMoreButton(null);
                showOverlay('Show Finished', 'Play Again', 'Click to replay the show');
            }

            setupPlayerHotkeys();
            resetPlayerView();
            showOverlay(startTitleText, startButtonText, 'Click to enter fullscreen');
            `;

            return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Awards Show</title>
    <style>
${css}
    </style>
</head>
<body>
    <div id="exportOverlay" class="export-overlay">
        <div class="export-overlay-card">
            <div id="exportOverlayTitle" class="export-overlay-title">Start Show</div>
            <button id="exportOverlayBtn" class="btn-primary">Start Show</button>
            <div id="exportOverlayHint" class="export-overlay-hint">Click to enter fullscreen</div>
        </div>
    </div>
    ${playerHtml}
</body>
</html>`;
        }

        async function buildEmbeddedMontserratCss() {
            const cssUrl = "https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;600&display=swap";
            const cssRes = await fetch(cssUrl);
            if (!cssRes.ok) throw new Error("Font CSS request failed");
            const cssText = await cssRes.text();

            const fontFaces = extractLatinFontFaces(cssText);
            if (fontFaces.length === 0) throw new Error("No Latin font faces found");

            const embedded = await Promise.all(fontFaces.map(async (face) => {
                const res = await fetch(face.url);
                if (!res.ok) throw new Error("Font file request failed");
                const buffer = await res.arrayBuffer();
                const base64 = arrayBufferToBase64(buffer);
                return {
                    weight: face.weight,
                    style: face.style,
                    unicodeRange: face.unicodeRange,
                    base64
                };
            }));

            return embedded.map(face => {
                const range = face.unicodeRange ? `unicode-range: ${face.unicodeRange};` : "";
                return `@font-face {
    font-family: 'Montserrat';
    font-style: ${face.style || 'normal'};
    font-weight: ${face.weight};
    font-display: swap;
    src: url(data:font/woff2;base64,${face.base64}) format('woff2');
    ${range}
}`;
            }).join("\n");
        }

        function extractLatinFontFaces(cssText) {
            const blocks = cssText.match(/@font-face\s*{[^}]+}/g) || [];
            const weights = new Set(['200', '300', '400', '600']);
            return blocks.map(parseFontFaceBlock).filter(face => {
                if (!face) return false;
                if (!weights.has(String(face.weight))) return false;
                return (face.unicodeRange || "").includes("U+0000-00FF");
            });
        }

        function parseFontFaceBlock(block) {
            const weight = extractCssProp(block, "font-weight");
            const style = extractCssProp(block, "font-style") || "normal";
            const unicodeRange = extractCssProp(block, "unicode-range");
            const src = extractCssProp(block, "src");
            if (!src) return null;
            const urlMatch = src.match(/url\(([^)]+)\)\s*format\('woff2'\)/);
            if (!urlMatch) return null;
            const url = urlMatch[1].replace(/['"]/g, "");
            return { weight, style, unicodeRange, url };
        }

        function extractCssProp(block, prop) {
            const match = block.match(new RegExp(`${prop}\\s*:\\s*([^;]+);`));
            return match ? match[1].trim() : "";
        }

        function arrayBufferToBase64(buffer) {
            let binary = "";
            const bytes = new Uint8Array(buffer);
            const chunkSize = 0x8000;
            for (let i = 0; i < bytes.length; i += chunkSize) {
                binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
            }
            return btoa(binary);
        }

        function endShow() {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            }
            clearAutoAdvanceTimer();
            playerState.linkedMode = null;
            playerState.top3ActiveEntryIndex = null;
            setTop3SeeMoreButton(null);
            resetOverlayContainer();
            resetTop3Stage();
            document.getElementById('player-app').classList.add('hidden');
            document.getElementById('editor-app').classList.remove('hidden');

	            if (previewMode && previewRestore) {
	                awards = previewRestore.awards;
	                currentAwardId = previewRestore.currentAwardId;
	                previewRestore = null;
	                previewMode = false;
	                renderList();
	                if (currentAwardId) selectAward(currentAwardId);
	                showToast("Preview finished.");
	                return;
	            }

	            showToast("Show Finished");
	        }
