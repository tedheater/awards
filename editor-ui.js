        /* --- EDITOR LOGIC --- */

        function generateId() {
            return `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
        }

        function buildDefaultOverlay(id) {
            return {
                id,
                text: "",
                html: "",
                delay: 0,
                duration: 3,
                effect: "fade",
                effectDuration: 0.6,
                background: true,
                textColor: "#ffffff",
                backgroundColor: "#000000",
                backgroundOpacity: 0.45,
                fontSize: 2.2,
                lineHeight: 1.15,
                align: "center",
                maxWidth: 90,
                glowStrength: 0.6,
                glowCinematic: true,
                positionX: "center",
                positionY: "bottom",
                offsetX: 0,
                offsetY: 0,
                paddingX: 18,
                paddingY: 10,
                radius: 12,
                backdropBlur: 4,
                zIndex: 10
            };
        }

        function buildDefaultTop3Entry(place) {
            return {
                place,
                name: "",
                image: "",
                imageFit: "contain",
                linkedStartAwardId: "",
                linkedEndAwardId: "",
                overlays: [],
                transform: { x: 0, y: 0, scale: 1 },
                kenBurnsMode: "off",
                kenBurnsDuration: 12,
                kenBurnsIntensity: 20,
                fixateSpeed: 8,
                fixateZoom: 2.5,
                fixatePoint: { x: 0.5, y: 0.5 },
                fixateEasing: "ease-out"
            };
        }

        function buildTop3Entries(count, existingEntries = []) {
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
                const base = buildDefaultTop3Entry(place);
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

        function buildDefaultTop3(count = 3) {
            const safeCount = clampTop3Count(count || 3);
            const top3 = {
                count: safeCount,
                showWinner: false,
                teaserStyle: "blur",
                layoutStyle: "grid",
                winnerEmphasis: "scale-glow",
                pixelateAmount: 6,
                silhouetteDarkness: 0.8,
                labels: {},
                entries: buildTop3Entries(safeCount)
            };
            ensureTop3Labels({ top3 }, safeCount);
            return top3;
        }

        function buildDefaultAward(id) {
            return {
                id,
                title: "New Category",
                slideType: "photo",
                categoryLine: "And the award for",
                subLine: "",
                winner: "Winner Name",
                winnerColor: "#ff3b30",
                revealText: "Reveal Winner",
                nextText: "Next Slide",
                linkedStartAwardId: "",
                linkedEndAwardId: "",
                seeMoreText: "Show More",
                backText: "Back",
                linkedOnly: false,
                revealPhotoDelay: null,
                revealFadeDuration: null,
                revealFadeOutDuration: null,
                slideAutoAdvance: null,
                slideAutoAdvanceDelay: null,
                slideShowControls: null,
                overlays: [],
                image: "", // Base64
                imageFit: "contain",
                transform: { x: 0, y: 0, scale: 1 },
                kenBurnsMode: "off",
                kenBurnsDuration: 12,
                kenBurnsIntensity: 20,
                fixateSpeed: 8,
                fixateZoom: 2.5,
                fixatePoint: { x: 0.5, y: 0.5 },
                fixateEasing: "ease-out",
                top3: buildDefaultTop3()
            };
        }

        function ensureTop3(award) {
            if (!award) return;
            if (!award.top3) {
                award.top3 = buildDefaultTop3();
                return;
            }
            const teaserStyles = new Set(['silhouette', 'blur', 'pixelate']);
            const layoutStyles = new Set(['grid', 'editorial']);
            const emphasisStyles = new Set(['scale-glow', 'pulse-glow', 'none']);
            const count = getTop3Count(award);
            const defaults = buildDefaultTop3(count);
            award.top3.count = count;
            award.top3.showWinner = award.top3.showWinner === undefined ? defaults.showWinner : !!award.top3.showWinner;
            award.top3.teaserStyle = teaserStyles.has(award.top3.teaserStyle) ? award.top3.teaserStyle : defaults.teaserStyle;
            award.top3.layoutStyle = layoutStyles.has(award.top3.layoutStyle) ? award.top3.layoutStyle : defaults.layoutStyle;
            award.top3.winnerEmphasis = emphasisStyles.has(award.top3.winnerEmphasis) ? award.top3.winnerEmphasis : defaults.winnerEmphasis;
            award.top3.pixelateAmount = clampNumber(Number(award.top3.pixelateAmount) || defaults.pixelateAmount, 1, 10);
            award.top3.silhouetteDarkness = clampNumber(Number(award.top3.silhouetteDarkness) || defaults.silhouetteDarkness, 0.3, 0.95);
            award.top3.entries = buildTop3Entries(count, award.top3.entries);
            ensureTop3Labels(award, count);
        }

        function getTop3Entry(award, index) {
            if (!award) return null;
            ensureTop3(award);
            const entries = award.top3.entries;
            const safeIndex = clampNumber(parseInt(index, 10) || 0, 0, entries.length - 1);
            return entries[safeIndex];
        }

        function getCurrentMediaTarget() {
            const award = getCurrentAward();
            if (!award) return null;
            if (award.slideType !== 'top3') return award;
            return getTop3Entry(award, currentTop3Index);
        }

        function createTop3LabelRow(container, caption, value, placeholder, onInput) {
            const row = document.createElement('div');
            row.className = 'top3-label-row';
            const label = document.createElement('div');
            label.className = 'top3-label-caption';
            label.innerText = caption;
            const input = document.createElement('input');
            input.type = 'text';
            input.value = value || "";
            input.placeholder = placeholder || "";
            input.addEventListener('input', (e) => onInput(e.target.value));
            row.appendChild(label);
            row.appendChild(input);
            container.appendChild(row);
        }

        function renderTop3LabelInputs(award) {
            const buttonList = document.getElementById('top3ButtonLabels');
            const placeList = document.getElementById('top3PlaceLabels');
            if (!buttonList || !placeList) return;
            buttonList.innerHTML = '';
            placeList.innerHTML = '';

            const count = getTop3Count(award);
            for (let index = 0; index < count; index += 1) {
                const place = getTop3PlaceForIndex(index, count);
                const ordinal = formatOrdinal(place);
                createTop3LabelRow(
                    buttonList,
                    getDefaultTop3Label('reveal', place, award),
                    getTop3Label(award, 'reveal', place),
                    `Reveal ${ordinal}`,
                    (value) => updateTop3Label('reveal', place, value)
                );
                createTop3LabelRow(
                    buttonList,
                    getDefaultTop3Label('place', place, award),
                    getTop3Label(award, 'place', place),
                    `Place ${ordinal}`,
                    (value) => updateTop3Label('place', place, value)
                );
                createTop3LabelRow(
                    buttonList,
                    `See More ${ordinal}`,
                    getTop3Label(award, 'seeMore', place),
                    getDefaultTop3Label('seeMore', place, award),
                    (value) => updateTop3Label('seeMore', place, value)
                );
                createTop3LabelRow(
                    buttonList,
                    `Back ${ordinal}`,
                    getTop3Label(award, 'back', place),
                    getDefaultTop3Label('back', place, award),
                    (value) => updateTop3Label('back', place, value)
                );
                createTop3LabelRow(
                    placeList,
                    (place === 1 && isTop3WinnerEnabled(award)) ? "Winner Label" : `${ordinal} Label`,
                    getTop3Label(award, 'placeLabel', place),
                    getDefaultTop3Label('placeLabel', place, award),
                    (value) => updateTop3Label('placeLabel', place, value)
                );
            }
        }

        function renderTop3PlaceSelect(award) {
            const placeSelect = document.getElementById('inputTop3Place');
            if (!placeSelect) return;
            const count = getTop3Count(award);
            placeSelect.innerHTML = '';
            for (let index = 0; index < count; index += 1) {
                const option = document.createElement('option');
                option.value = String(index);
                option.innerText = getTop3PlaceLabel(index, award);
                placeSelect.appendChild(option);
            }
            const maxIndex = Math.max(0, count - 1);
            currentTop3Index = clampNumber(currentTop3Index, 0, maxIndex);
            placeSelect.value = String(currentTop3Index);
        }

        function getSlideOptionLabel(award, index) {
            const fallbackTitle = award?.slideType === 'photo'
                ? 'Photo Slide'
                : (award?.slideType === 'title-card' ? 'Title Card' : 'Untitled');
            const title = award?.title || fallbackTitle;
            const typeLabel = getSlideTypeLabel(award);
            return `${index + 1}. ${title} (${typeLabel})`;
        }

        function populateTop3LinkedSlideSelect(selectId, currentAward, selectedId, emptyLabel) {
            const selectEl = document.getElementById(selectId);
            if (!selectEl) return;
            const currentId = currentAward?.id || "";
            const selected = String(selectedId || "");
            let hasSelected = selected.length === 0;

            selectEl.innerHTML = '';
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.innerText = emptyLabel;
            selectEl.appendChild(emptyOption);

            awards.forEach((award, index) => {
                if (!award || award.id === currentId) return;
                const option = document.createElement('option');
                option.value = award.id;
                option.innerText = getSlideOptionLabel(award, index);
                selectEl.appendChild(option);
                if (award.id === selected) hasSelected = true;
            });

            if (selected && !hasSelected) {
                const missing = document.createElement('option');
                missing.value = selected;
                missing.innerText = '(Missing slide)';
                selectEl.appendChild(missing);
                hasSelected = true;
            }

            selectEl.value = hasSelected ? selected : '';
        }

        function updateTop3EditHint(award) {
            const hint = document.getElementById('top3EditHint');
            if (!hint) return;
            const label = getTop3PlaceLabel(currentTop3Index, award);
            hint.innerText = `Editing: ${label}`;
            hint.style.display = 'block';
        }

        function syncTop3UI(award) {
            if (!award || award.slideType !== 'top3') return;
            ensureTop3(award);
            const top3 = award.top3;
            const countEl = document.getElementById('inputTop3Count');
            if (countEl) countEl.value = String(top3.count || 3);
            renderTop3PlaceSelect(award);
            const entry = getTop3Entry(award, currentTop3Index);
            const nameInput = document.getElementById('inputTop3Name');
            if (nameInput) nameInput.value = entry?.name || "";
            populateTop3LinkedSlideSelect('inputTop3LinkedStart', award, entry?.linkedStartAwardId, 'None');
            populateTop3LinkedSlideSelect('inputTop3LinkedEnd', award, entry?.linkedEndAwardId, 'Same as start');
            const teaserEl = document.getElementById('inputTop3Teaser');
            if (teaserEl) teaserEl.value = top3.teaserStyle || "blur";
            const layoutEl = document.getElementById('inputTop3Layout');
            if (layoutEl) layoutEl.value = top3.layoutStyle || "grid";
            const winnerToggleEl = document.getElementById('inputTop3WinnerToggle');
            if (winnerToggleEl) winnerToggleEl.checked = !!top3.showWinner;
            const winnerGroup = document.getElementById('top3WinnerEmphasisGroup');
            if (winnerGroup) winnerGroup.style.display = top3.showWinner ? 'block' : 'none';
            const emphasisEl = document.getElementById('inputTop3Emphasis');
            if (emphasisEl) emphasisEl.value = top3.winnerEmphasis || "scale-glow";
            const pixelateEl = document.getElementById('inputTop3Pixelate');
            if (pixelateEl) pixelateEl.value = top3.pixelateAmount ?? 6;
            const silhouetteEl = document.getElementById('inputTop3Silhouette');
            if (silhouetteEl) silhouetteEl.value = top3.silhouetteDarkness ?? 0.8;
            renderTop3LabelInputs(award);
            updateTop3EditHint(award);
            updatePanelMeta();
        }

        function syncAwardLinkedUI(award) {
            if (!award) return;
            populateTop3LinkedSlideSelect('inputAwardLinkedStart', award, award.linkedStartAwardId, 'None');
            populateTop3LinkedSlideSelect('inputAwardLinkedEnd', award, award.linkedEndAwardId, 'Same as start');
            const seeMoreEl = document.getElementById('inputAwardSeeMoreText');
            if (seeMoreEl) seeMoreEl.value = award.seeMoreText || "Show More";
            const backEl = document.getElementById('inputAwardBackText');
            if (backEl) backEl.value = award.backText || "Back";
        }

        function setTop3EditIndex(value) {
            const award = getCurrentAward();
            if (!award || award.slideType !== 'top3') return;
            ensureTop3(award);
            const maxIndex = Math.max(0, getTop3Count(award) - 1);
            currentTop3Index = clampNumber(parseInt(value, 10) || 0, 0, maxIndex);
            syncTop3UI(award);
            refreshEditorMedia();
            updatePanelMeta();
        }

        function updateTop3Count(value) {
            const award = getCurrentAward();
            if (!award || award.slideType !== 'top3') return;
            ensureTop3(award);
            const previousEntry = getTop3Entry(award, currentTop3Index);
            const previousPlace = getTop3EntryPlace(previousEntry, currentTop3Index, award);
            const nextCount = clampTop3Count(value);
            award.top3.count = nextCount;
            award.top3.entries = buildTop3Entries(nextCount, award.top3.entries);
            ensureTop3Labels(award, nextCount);
            let nextIndex = award.top3.entries.findIndex(entry => Number(entry.place) === previousPlace);
            if (nextIndex === -1) nextIndex = clampNumber(currentTop3Index, 0, nextCount - 1);
            currentTop3Index = nextIndex;
            syncTop3UI(award);
            refreshEditorMedia();
            renderList();
        }

        function updateTop3Setting(key, value) {
            const award = getCurrentAward();
            if (!award || award.slideType !== 'top3') return;
            ensureTop3(award);
            if (key === 'showWinner') {
                award.top3.showWinner = !!value;
                syncTop3UI(award);
                renderTop3LabelInputs(award);
                renderTop3PlaceSelect(award);
                updateTop3EditHint(award);
                updatePanelMeta();
                return;
            }
            if (key === 'pixelateAmount') {
                award.top3.pixelateAmount = clampNumber(Number(value) || 6, 1, 10);
                return;
            }
            if (key === 'silhouetteDarkness') {
                award.top3.silhouetteDarkness = clampNumber(Number(value) || 0.8, 0.3, 0.95);
                return;
            }
            award.top3[key] = value;
        }

        function updateTop3Label(kind, place, value) {
            const award = getCurrentAward();
            if (!award || award.slideType !== 'top3') return;
            ensureTop3(award);
            if (!award.top3.labels) award.top3.labels = {};
            const key = makeTop3LabelKey(kind, place);
            award.top3.labels[key] = value;
            if (kind === 'placeLabel') {
                renderTop3PlaceSelect(award);
                updateTop3EditHint(award);
            }
        }

        function updateTop3Entry(key, value) {
            const award = getCurrentAward();
            if (!award || award.slideType !== 'top3') return;
            const entry = getTop3Entry(award, currentTop3Index);
            if (!entry) return;
            entry[key] = value;
            if (key === 'name') {
                renderList();
            }
        }

        function updateTop3LinkedStart(value) {
            const award = getCurrentAward();
            if (!award || award.slideType !== 'top3') return;
            const entry = getTop3Entry(award, currentTop3Index);
            if (!entry) return;
            const nextValue = String(value || "");
            entry.linkedStartAwardId = nextValue;
            if (!nextValue) {
                entry.linkedEndAwardId = "";
            } else if (!entry.linkedEndAwardId) {
                entry.linkedEndAwardId = nextValue;
            }
            syncTop3UI(award);
        }

        function updateTop3LinkedEnd(value) {
            const award = getCurrentAward();
            if (!award || award.slideType !== 'top3') return;
            const entry = getTop3Entry(award, currentTop3Index);
            if (!entry) return;
            const nextValue = String(value || "");
            entry.linkedEndAwardId = nextValue;
            if (nextValue && !entry.linkedStartAwardId) {
                entry.linkedStartAwardId = nextValue;
            }
            syncTop3UI(award);
        }

        function updateAwardLinkedStart(value) {
            const award = getCurrentAward();
            if (!award || award.slideType !== 'award') return;
            const nextValue = String(value || "");
            award.linkedStartAwardId = nextValue;
            if (!nextValue) {
                award.linkedEndAwardId = "";
            } else if (!award.linkedEndAwardId) {
                award.linkedEndAwardId = nextValue;
            }
            syncAwardLinkedUI(award);
        }

        function updateAwardLinkedEnd(value) {
            const award = getCurrentAward();
            if (!award || award.slideType !== 'award') return;
            const nextValue = String(value || "");
            award.linkedEndAwardId = nextValue;
            if (nextValue && !award.linkedStartAwardId) {
                award.linkedStartAwardId = nextValue;
            }
            syncAwardLinkedUI(award);
        }

        function refreshEditorMedia() {
            const award = getCurrentAward();
            if (!award) return;
            const target = getCurrentMediaTarget();

            const imgEl = document.getElementById('editorImage');
            const phEl = document.getElementById('placeholderText');

            const isTitleCard = award.slideType === 'title-card';
            if (target?.image) {
                imgEl.src = target.image;
                imgEl.style.display = 'block';
                phEl.style.display = 'none';
            } else {
                imgEl.src = "";
                imgEl.style.display = 'none';
                phEl.style.display = isTitleCard ? 'none' : 'flex';
            }

            const resolvedFit = normalizeImageFit(target?.imageFit);
            applyEditorImageFit(resolvedFit);
            const fitEl = document.getElementById('inputImageFit');
            if (fitEl) fitEl.value = resolvedFit;

            editorTransform = normalizeTransform(target?.transform);
            applyEditorTransform();
            document.getElementById('zoomInput').value = editorTransform.scale;

            if (target && target.kenBurnsMode === undefined && target.kenBurns !== undefined) {
                target.kenBurnsMode = target.kenBurns ? "zoom-in" : "off";
            }
            const modeEl = document.getElementById('inputKenBurnsMode');
            if (modeEl) modeEl.value = target?.kenBurnsMode || "off";
            const durEl = document.getElementById('inputKenBurnsDuration');
            if (durEl) durEl.value = target?.kenBurnsDuration || 12;
            const intensityEl = document.getElementById('inputKenBurnsIntensity');
            if (intensityEl) intensityEl.value = target?.kenBurnsIntensity || 20;
            const fixateZoomEl = document.getElementById('inputFixateZoom');
            const fixateZoomNumEl = document.getElementById('inputFixateZoomNum');
            const fixateSpeedEl = document.getElementById('inputFixateSpeed');
            const fixateSpeedNumEl = document.getElementById('inputFixateSpeedNum');
            const fixateEasingEl = document.getElementById('inputFixateEasing');
            const fixateZoom = clampNumber(Number(target?.fixateZoom) || 2.5, 1, 5);
            const fixateSpeed = clampNumber(Number(target?.fixateSpeed) || 8, 2, 60);
            const fixateEasing = fixateEasingOptions.includes(target?.fixateEasing) ? target.fixateEasing : "ease-out";
            if (target && !fixateEasingOptions.includes(target.fixateEasing)) {
                target.fixateEasing = fixateEasing;
            }
            if (fixateZoomEl) fixateZoomEl.value = fixateZoom;
            if (fixateZoomNumEl) fixateZoomNumEl.value = fixateZoom;
            if (fixateSpeedEl) fixateSpeedEl.value = fixateSpeed;
            if (fixateSpeedNumEl) fixateSpeedNumEl.value = fixateSpeed;
            if (fixateEasingEl) fixateEasingEl.value = fixateEasing;
            toggleFixateControls(target?.kenBurnsMode || "off");

            ensureOverlays(target);
            renderOverlayList();
            updateFixateMarker(target);

            syncSlideTimingUI(award);
        }

        function toggleTop3Controls(award) {
            const showTop3 = award?.slideType === 'top3';
            const showAward = award?.slideType === 'award';
            const top3Controls = document.getElementById('top3Controls');
            if (top3Controls) {
                top3Controls.style.display = showTop3 ? 'block' : 'none';
            }

            const winnerNameGroup = document.getElementById('awardWinnerNameGroup');
            const winnerColorGroup = document.getElementById('awardWinnerColorGroup');
            const revealTextGroup = document.getElementById('awardRevealTextGroup');
            const linkedStartGroup = document.getElementById('awardLinkedStartGroup');
            const linkedEndGroup = document.getElementById('awardLinkedEndGroup');
            const seeMoreTextGroup = document.getElementById('awardSeeMoreTextGroup');
            const backTextGroup = document.getElementById('awardBackTextGroup');
            const nextLabel = document.getElementById('inputNextTextLabel');
            const linkedOnlyGroup = document.getElementById('linkedOnlyGroup');
            if (winnerNameGroup) winnerNameGroup.style.display = showTop3 ? 'none' : 'block';
            if (winnerColorGroup) winnerColorGroup.style.display = showTop3 ? 'none' : 'block';
            if (revealTextGroup) revealTextGroup.style.display = showTop3 ? 'none' : 'block';
            if (linkedStartGroup) linkedStartGroup.style.display = showAward ? 'block' : 'none';
            if (linkedEndGroup) linkedEndGroup.style.display = showAward ? 'block' : 'none';
            if (seeMoreTextGroup) seeMoreTextGroup.style.display = showAward ? 'block' : 'none';
            if (backTextGroup) backTextGroup.style.display = showAward ? 'block' : 'none';
            if (linkedOnlyGroup) linkedOnlyGroup.style.display = award?.slideType === 'photo' ? 'block' : 'none';
            if (nextLabel) {
                nextLabel.innerText = showTop3 ? "Post-Final Button Text" : "Next Slide Button Text";
            }

            const hint = document.getElementById('top3EditHint');
            if (hint && !showTop3) {
                hint.style.display = 'none';
            }
        }

        function setPanelMode(mode) {
            const panel = document.querySelector('.controls-panel');
            if (!panel) return;
            const next = mode === 'show' ? 'show' : 'slide';
            editorPanelMode = next;
            panel.dataset.mode = next;
            const buttons = panel.querySelectorAll('.mode-btn');
            buttons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.mode === next);
            });
        }

        function getSlideTypeLabel(award) {
            if (!award) return "Award Slide";
            if (award.slideType === 'photo') return "Photo Slide";
            if (award.slideType === 'title-card') return "Title Card";
            if (award.slideType === 'top3') {
                ensureTop3(award);
                return getTop3TypeLabel(award);
            }
            return "Award Slide";
        }

        function updatePanelMeta() {
            const metaEl = document.getElementById('panelSlideMeta');
            if (!metaEl) return;
            const award = getCurrentAward();
            if (!award) {
                metaEl.innerText = "No slide selected";
                return;
            }
            const title = award.title || (
                award.slideType === 'photo'
                    ? 'Photo Slide'
                    : (award.slideType === 'title-card' ? 'Title Card' : 'Untitled')
            );
            let suffix = "";
            if (award.slideType === 'top3') {
                suffix = ` • Editing ${getTop3PlaceLabel(currentTop3Index, award)}`;
            }
            metaEl.innerText = `${getSlideTypeLabel(award)}: ${title}${suffix}`;
        }

        function hasFiniteSlideTimingValue(value) {
            if (value === null || value === undefined || value === '') return false;
            return Number.isFinite(Number(value));
        }

        function hasBooleanSlideTimingValue(value) {
            return value === true || value === false;
        }

        function getSlideAutoAdvanceEnabled(award) {
            if (award?.slideAutoAdvance === true || award?.slideAutoAdvance === false) {
                return award.slideAutoAdvance;
            }
            return !!showSettings.autoAdvance;
        }

        function getSlideAutoAdvanceDefaultDelaySec(award) {
            if (!award) return clampNumber(Number(showSettings.autoAdvanceAward) || 6, 1, 60);
            if (award.slideType === 'top3') {
                return clampNumber(Number(showSettings.autoAdvanceTopStep) || 3, 1, 60);
            }
            if (isPhotoLikeSlideType(award.slideType)) {
                return clampNumber(Number(showSettings.autoAdvancePhoto) || 6, 1, 60);
            }
            return clampNumber(Number(showSettings.autoAdvanceAward) || 6, 1, 60);
        }

        function getSlideAutoAdvanceDelaySec(award) {
            if (hasFiniteSlideTimingValue(award?.slideAutoAdvanceDelay)) {
                return clampNumber(Number(award.slideAutoAdvanceDelay), 1, 60);
            }
            return getSlideAutoAdvanceDefaultDelaySec(award);
        }

        function getSlideShowControlsEnabled(award) {
            if (award?.slideShowControls === true || award?.slideShowControls === false) {
                return award.slideShowControls;
            }
            return true;
        }

        function hasSlideTimingOverride(award) {
            const delay = award?.revealPhotoDelay;
            const fade = award?.revealFadeDuration;
            const fadeOut = award?.revealFadeOutDuration;
            const autoAdvanceDelay = award?.slideAutoAdvanceDelay;
            const autoAdvance = award?.slideAutoAdvance;
            const showControls = award?.slideShowControls;
            return hasFiniteSlideTimingValue(delay)
                || hasFiniteSlideTimingValue(fade)
                || hasFiniteSlideTimingValue(fadeOut)
                || hasFiniteSlideTimingValue(autoAdvanceDelay)
                || hasBooleanSlideTimingValue(autoAdvance)
                || hasBooleanSlideTimingValue(showControls);
        }

        function syncSlideTimingUI(award) {
            const current = award || getCurrentAward();
            const toggleEl = document.getElementById('inputSlideTimingOverride');
            const delayEl = document.getElementById('inputRevealPhotoDelay');
            const fadeEl = document.getElementById('inputRevealPhotoFade');
            const fadeOutEl = document.getElementById('inputRevealPhotoFadeOut');
            const autoAdvanceEl = document.getElementById('inputSlideAutoAdvance');
            const autoAdvanceDelayEl = document.getElementById('inputSlideAutoAdvanceDelay');
            const showControlsEl = document.getElementById('inputSlideShowControls');
            const hintEl = document.getElementById('slideTimingHint');
            const delayGroup = document.getElementById('slideTimingRevealGroup');
            const fadeGroup = document.getElementById('slideTimingFadeGroup');
            const fadeOutGroup = document.getElementById('slideTimingFadeOutGroup');
            const autoAdvanceToggleGroup = document.getElementById('slideTimingAutoAdvanceToggleGroup');
            const autoAdvanceDelayGroup = document.getElementById('slideTimingAutoAdvanceDelayGroup');
            const showControlsGroup = document.getElementById('slideTimingButtonsGroup');
            if (!current) {
                if (toggleEl) {
                    toggleEl.checked = false;
                    toggleEl.disabled = true;
                }
                if (delayEl) {
                    delayEl.value = '';
                    delayEl.disabled = true;
                }
                if (fadeEl) {
                    fadeEl.value = '';
                    fadeEl.disabled = true;
                }
                if (fadeOutEl) {
                    fadeOutEl.value = '';
                    fadeOutEl.disabled = true;
                }
                if (autoAdvanceEl) {
                    autoAdvanceEl.checked = !!showSettings.autoAdvance;
                    autoAdvanceEl.disabled = true;
                }
                if (autoAdvanceDelayEl) {
                    autoAdvanceDelayEl.value = '';
                    autoAdvanceDelayEl.disabled = true;
                }
                if (showControlsEl) {
                    showControlsEl.checked = true;
                    showControlsEl.disabled = true;
                }
                if (delayGroup) delayGroup.classList.add('is-disabled');
                if (fadeGroup) fadeGroup.classList.add('is-disabled');
                if (fadeOutGroup) fadeOutGroup.classList.add('is-disabled');
                if (autoAdvanceToggleGroup) autoAdvanceToggleGroup.classList.add('is-disabled');
                if (autoAdvanceDelayGroup) autoAdvanceDelayGroup.classList.add('is-disabled');
                if (showControlsGroup) showControlsGroup.classList.add('is-disabled');
                if (hintEl) hintEl.innerText = "Select a slide to edit timing.";
                return;
            }
            const enabled = hasSlideTimingOverride(current);
            const slideAutoAdvanceEnabled = getSlideAutoAdvanceEnabled(current);
            const showControlsEnabled = getSlideShowControlsEnabled(current);
            if (toggleEl) {
                toggleEl.checked = enabled;
                toggleEl.disabled = false;
            }
            if (delayGroup) delayGroup.classList.toggle('is-disabled', !enabled);
            if (fadeGroup) fadeGroup.classList.toggle('is-disabled', !enabled);
            if (fadeOutGroup) fadeOutGroup.classList.toggle('is-disabled', !enabled);
            if (autoAdvanceToggleGroup) autoAdvanceToggleGroup.classList.toggle('is-disabled', !enabled);
            if (autoAdvanceDelayGroup) autoAdvanceDelayGroup.classList.toggle('is-disabled', !enabled || !slideAutoAdvanceEnabled);
            if (showControlsGroup) showControlsGroup.classList.toggle('is-disabled', !enabled);
            if (delayEl) delayEl.disabled = !enabled;
            if (fadeEl) fadeEl.disabled = !enabled;
            if (fadeOutEl) fadeOutEl.disabled = !enabled;
            if (autoAdvanceEl) autoAdvanceEl.disabled = !enabled;
            if (autoAdvanceDelayEl) autoAdvanceDelayEl.disabled = !enabled || !slideAutoAdvanceEnabled;
            if (showControlsEl) showControlsEl.disabled = !enabled;
            if (hintEl) {
                if (!enabled) {
                    hintEl.innerText = "Uses show defaults. Toggle to override.";
                } else if (!showControlsEnabled && !slideAutoAdvanceEnabled) {
                    hintEl.innerText = "Buttons are hidden and auto-advance is off. Use keyboard (Space/Enter/Right Arrow) to continue.";
                } else {
                    hintEl.innerText = "Editing per-slide timing and playback overrides.";
                }
            }
            if (enabled) {
                const delayValue = hasFiniteSlideTimingValue(current.revealPhotoDelay)
                    ? clampNumber(Number(current.revealPhotoDelay), 0, 10)
                    : getPhotoRevealDelaySec(current);
                const fadeValue = hasFiniteSlideTimingValue(current.revealFadeDuration)
                    ? clampNumber(Number(current.revealFadeDuration), 0, 10)
                    : getPhotoFadeDurationSec(current);
                const fadeOutValue = hasFiniteSlideTimingValue(current.revealFadeOutDuration)
                    ? clampNumber(Number(current.revealFadeOutDuration), 0, 10)
                    : getPhotoFadeOutDurationSec(current);
                const autoAdvanceDelayValue = hasFiniteSlideTimingValue(current.slideAutoAdvanceDelay)
                    ? clampNumber(Number(current.slideAutoAdvanceDelay), 1, 60)
                    : getSlideAutoAdvanceDelaySec(current);
                if (delayEl) delayEl.value = delayValue;
                if (fadeEl) fadeEl.value = fadeValue;
                if (fadeOutEl) fadeOutEl.value = fadeOutValue;
                if (autoAdvanceEl) autoAdvanceEl.checked = slideAutoAdvanceEnabled;
                if (autoAdvanceDelayEl) autoAdvanceDelayEl.value = autoAdvanceDelayValue;
                if (showControlsEl) showControlsEl.checked = showControlsEnabled;
            } else {
                if (delayEl) delayEl.value = '';
                if (fadeEl) fadeEl.value = '';
                if (fadeOutEl) fadeOutEl.value = '';
                if (autoAdvanceEl) autoAdvanceEl.checked = !!showSettings.autoAdvance;
                if (autoAdvanceDelayEl) autoAdvanceDelayEl.value = '';
                if (showControlsEl) showControlsEl.checked = true;
            }
        }

        function toggleSlideTimingOverride(enabled) {
            const award = getCurrentAward();
            if (!award) return;
            if (!enabled) {
                award.revealPhotoDelay = null;
                award.revealFadeDuration = null;
                award.revealFadeOutDuration = null;
                award.slideAutoAdvance = null;
                award.slideAutoAdvanceDelay = null;
                award.slideShowControls = null;
            } else {
                award.revealPhotoDelay = getPhotoRevealDelaySec(award);
                award.revealFadeDuration = getPhotoFadeDurationSec(award);
                award.revealFadeOutDuration = getPhotoFadeOutDurationSec(award);
                award.slideAutoAdvance = getSlideAutoAdvanceEnabled(award);
                award.slideAutoAdvanceDelay = getSlideAutoAdvanceDelaySec(award);
                award.slideShowControls = getSlideShowControlsEnabled(award);
            }
            syncSlideTimingUI(award);
        }

        function createNewAward() {
            const newId = generateId();
            const newAward = buildDefaultAward(newId);
            awards.push(newAward);
            renderList();
            selectAward(newId);
        }

        function selectAward(id) {
            currentAwardId = id;
            renderList();
            stopOverlayDrag();
            
            const award = awards.find(a => a.id === id);
            if (!award) return;

            // Populate inputs
            document.getElementById('inputTitle').value = award.title;
            if (!award.slideType) award.slideType = "photo";
            document.getElementById('inputSlideType').value = award.slideType;
            document.getElementById('inputCategoryLine').value = award.categoryLine || "";
            document.getElementById('inputSubLine').value = award.subLine || "";
            document.getElementById('inputWinner').value = award.winner;
            document.getElementById('inputWinnerColor').value = award.winnerColor || "#ff3b30";
            document.getElementById('inputRevealText').value = award.revealText || "Reveal Winner";
            document.getElementById('inputNextText').value = award.nextText || "Next Slide";
            const seeMoreTextEl = document.getElementById('inputAwardSeeMoreText');
            if (seeMoreTextEl) seeMoreTextEl.value = award.seeMoreText || "Show More";
            const backTextEl = document.getElementById('inputAwardBackText');
            if (backTextEl) backTextEl.value = award.backText || "Back";
            const linkedOnlyEl = document.getElementById('inputLinkedOnly');
            if (linkedOnlyEl) linkedOnlyEl.checked = award.linkedOnly === true;
            toggleTop3Controls(award);
            if (award.slideType === 'top3') {
                ensureTop3(award);
                syncTop3UI(award);
            }
            syncAwardLinkedUI(award);

            refreshEditorMedia();
        }

        function updateCurrentAward(key, value) {
            const award = awards.find(a => a.id === currentAwardId);
            if (award) {
                award[key] = value;
                if (key === 'title') {
                    renderList(); // Update list text
                    updatePanelMeta();
                }
                if (key === 'slideType') {
                    if (value !== 'photo') {
                        award.linkedOnly = false;
                    }
                    const linkedOnlyEl = document.getElementById('inputLinkedOnly');
                    if (linkedOnlyEl) linkedOnlyEl.checked = award.linkedOnly === true;
                    toggleTop3Controls(award);
                    if (value === 'top3') {
                        ensureTop3(award);
                        currentTop3Index = 0;
                        syncTop3UI(award);
                    }
                    refreshEditorMedia();
                    renderList();
                    updatePanelMeta();
                }
                if (key === 'slideAutoAdvance' || key === 'slideShowControls') {
                    syncSlideTimingUI(award);
                }
            }
        }

        function updateCurrentAwardNumber(key, value, min = 0, max = 10) {
            const award = awards.find(a => a.id === currentAwardId);
            if (!award) return;
            const n = parseFloat(value);
            if (!Number.isFinite(n)) {
                award[key] = null;
                if (key === 'revealPhotoDelay' || key === 'revealFadeDuration' || key === 'revealFadeOutDuration' || key === 'slideAutoAdvanceDelay') {
                    syncSlideTimingUI(award);
                }
                return;
            }
            award[key] = clampNumber(n, min, max);
            if (key === 'revealPhotoDelay' || key === 'revealFadeDuration' || key === 'revealFadeOutDuration' || key === 'slideAutoAdvanceDelay') {
                syncSlideTimingUI(award);
            }
        }

        function updateCurrentMediaSetting(key, value) {
            const target = getCurrentMediaTarget();
            if (target) {
                if (key === 'imageFit') {
                    target.imageFit = normalizeImageFit(value);
                    applyEditorImageFit(target.imageFit);
                    return;
                }
                target[key] = value;
                if (key === 'kenBurnsMode') {
                    if (value === 'fixate') {
                        if (!target.fixatePoint) target.fixatePoint = { x: 0.5, y: 0.5 };
                        if (!Number.isFinite(target.fixateZoom)) target.fixateZoom = 2.5;
                        if (!Number.isFinite(target.fixateSpeed)) target.fixateSpeed = 8;
                        if (!fixateEasingOptions.includes(target.fixateEasing)) target.fixateEasing = "ease-out";
                    }
                    toggleFixateControls(value);
                    updateFixateMarker(target);
                }
            }
        }

        function toggleFixateControls(mode) {
            const fixateControls = document.getElementById('fixateControls');
            const durationGroup = document.getElementById('kenBurnsDurationGroup');
            const intensityGroup = document.getElementById('kenBurnsIntensityGroup');
            const isFixate = mode === 'fixate';
            const isActive = mode && mode !== 'off';
            if (fixateControls) fixateControls.style.display = isFixate ? 'block' : 'none';
            if (durationGroup) durationGroup.style.display = (!isFixate && isActive) ? 'block' : 'none';
            if (intensityGroup) intensityGroup.style.display = (!isFixate && isActive) ? 'block' : 'none';
        }

        function updateFixateControl(key, value) {
            const target = getCurrentMediaTarget();
            if (!target) return;
            if (key === 'fixateEasing') {
                const easing = fixateEasingOptions.includes(value) ? value : "ease-out";
                target.fixateEasing = easing;
                const easingEl = document.getElementById('inputFixateEasing');
                if (easingEl) easingEl.value = easing;
                return;
            }
            let v = parseFloat(value);
            if (!Number.isFinite(v)) return;
            if (key === 'fixateZoom') {
                v = clampNumber(v, 1, 5);
                target.fixateZoom = v;
                const rangeEl = document.getElementById('inputFixateZoom');
                const numEl = document.getElementById('inputFixateZoomNum');
                if (rangeEl) rangeEl.value = v;
                if (numEl) numEl.value = v;
                return;
            }
            if (key === 'fixateSpeed') {
                v = clampNumber(v, 2, 60);
                target.fixateSpeed = v;
                const rangeEl = document.getElementById('inputFixateSpeed');
                const numEl = document.getElementById('inputFixateSpeedNum');
                if (rangeEl) rangeEl.value = v;
                if (numEl) numEl.value = v;
            }
        }

        function updateFixateMarker(target) {
            const marker = document.getElementById('fixateTarget');
            const container = document.getElementById('editorImageContainer');
            if (!marker || !container || !target) return;
            const mode = target.kenBurnsMode || "off";
            if (mode !== 'fixate') {
                marker.classList.add('hidden');
                return;
            }
            const point = normalizeFixatePoint(target.fixatePoint);
            marker.style.left = `${point.x * 100}%`;
            marker.style.top = `${point.y * 100}%`;
            marker.classList.remove('hidden');
        }

        function deleteAward(e, id) {
            e.stopPropagation();
            if (!confirm("Delete this award?")) return;
            awards = awards.filter(a => a.id !== id);
            if (currentAwardId === id) {
                currentAwardId = awards.length > 0 ? awards[0].id : null;
                if (currentAwardId) selectAward(currentAwardId);
                else {
                    document.getElementById('editorImage').style.display = 'none';
                    document.getElementById('placeholderText').style.display = 'flex';
                    document.getElementById('inputTitle').value = "";
                    syncSlideTimingUI(null);
                    updatePanelMeta();
                }
            }
            renderList();
        }

        function duplicateCurrentAward() {
            const index = awards.findIndex(a => a.id === currentAwardId);
            if (index === -1) {
                showToast("Select a slide to duplicate.");
                return;
            }
            const source = awards[index];
            const clone = typeof structuredClone === 'function'
                ? structuredClone(source)
                : JSON.parse(JSON.stringify(source));
            clone.id = generateId();
            clone.title = source.title ? `${source.title} (Copy)` : "New Category (Copy)";
            if (Array.isArray(clone.overlays)) {
                clone.overlays = clone.overlays.map(overlay => ({
                    ...overlay,
                    id: generateId()
                }));
            }
            awards.splice(index + 1, 0, clone);
            renderList();
            selectAward(clone.id);
            showToast("Slide duplicated.");
        }

        function previewCurrentSlide() {
            const award = awards.find(a => a.id === currentAwardId);
            if (!award) {
                showToast("Select a slide to preview.");
                return;
            }
            if (previewMode) return;
            previewRestore = { awards, currentAwardId };
            previewMode = true;
            awards = [award];
            currentAwardId = award.id;
            playShow({ startIndex: 0, skipMenu: true });
        }

        function getTop3TypeLabel(award) {
            const count = getTop3Count(award);
            return `Top ${count} Reveal`;
        }

        function getTop3WinnerEntry(award) {
            if (!award?.top3?.entries) return null;
            const winner = award.top3.entries.find(entry => Number(entry.place) === 1);
            return winner || award.top3.entries[award.top3.entries.length - 1] || null;
        }

        function renderList() {
            const container = document.getElementById('awardList');
            container.innerHTML = '';
            
            awards.forEach(award => {
                const div = document.createElement('div');
                div.className = `award-item ${award.id === currentAwardId ? 'active' : ''}`;
                div.onclick = () => selectAward(award.id);
                div.draggable = true;
                div.addEventListener('dragstart', (e) => onDragStart(e, award.id));
                div.addEventListener('dragover', (e) => onDragOver(e));
                div.addEventListener('dragleave', (e) => onDragLeave(e));
                div.addEventListener('drop', (e) => onDrop(e, award.id));
                div.addEventListener('dragend', () => onDragEnd(div));
                let typeLabel = award.slideType === 'photo'
                    ? 'Photo Slide'
                    : (award.slideType === 'title-card' ? 'Title Card' : 'Award Slide');
                let summaryText = award.winner || 'No winner set';
                if (award.slideType === 'top3') {
                    ensureTop3(award);
                    typeLabel = getTop3TypeLabel(award);
                    const winnerIndex = award.top3.entries.findIndex(entry => Number(entry.place) === 1);
                    const primaryIndex = winnerIndex >= 0 ? winnerIndex : 0;
                    const primaryEntry = award.top3.entries[primaryIndex];
                    const primaryLabel = getTop3Label(award, 'placeLabel', 1);
                    summaryText = primaryEntry?.name || `${primaryLabel} TBD`;
                } else if (award.slideType === 'title-card') {
                    summaryText = 'Overlay-based title card';
                }
                div.innerHTML = `
                    <h4>${award.title || 'Untitled'}</h4>
                    <p>${summaryText} • ${typeLabel}</p>
                    <button class="btn-icon delete-btn" onclick="deleteAward(event, '${award.id}')">×</button>
                `;
                container.appendChild(div);
            });
            syncBulkKenBurnsTargets();
            const current = getCurrentAward();
            if (current?.slideType === 'top3') {
                syncTop3UI(current);
            } else if (current?.slideType === 'award') {
                syncAwardLinkedUI(current);
            }
            renderMenu();
        }

        function handleImageUpload(input) {
            if (input.files && input.files.length > 0) {
                handleImageFiles(input.files);
            }
            input.value = "";
        }

        function handleImageFile(file) {
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                const target = getCurrentMediaTarget();
                if (target) {
                    target.image = e.target.result;
                }
                refreshEditorMedia();
            };
            reader.readAsDataURL(file);
        }

        function readFileAsDataURL(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(new Error("File read failed"));
                reader.readAsDataURL(file);
            });
        }

        function clearTop3ButtonLabels() {
            const award = getCurrentAward();
            if (!award || award.slideType !== 'top3') return;
            ensureTop3(award);
            const count = getTop3Count(award);
            if (!award.top3.labels || typeof award.top3.labels !== 'object') {
                award.top3.labels = {};
            }
            getTop3Places(count).forEach((place) => {
                award.top3.labels[makeTop3LabelKey('reveal', place)] = "";
                award.top3.labels[makeTop3LabelKey('place', place)] = "";
                award.top3.labels[makeTop3LabelKey('seeMore', place)] = "";
                award.top3.labels[makeTop3LabelKey('back', place)] = "";
                award.top3.labels[makeTop3LabelKey('placeLabel', place)] = "";
            });
            renderTop3LabelInputs(award);
        }

        function fileNameToTitle(fileName) {
            if (!fileName) return "New Category";
            const base = fileName.replace(/\.[^/.]+$/, "");
            const trimmed = base.trim();
            return trimmed || "New Category";
        }

        function createAwardFromImageFile(file, dataUrl) {
            const newId = generateId();
            const newAward = buildDefaultAward(newId);
            newAward.title = fileNameToTitle(file?.name);
            newAward.image = dataUrl;
            awards.push(newAward);
            return newAward.id;
        }

        async function handleImageFiles(files) {
            const fileList = Array.from(files || []).filter(file => file && file.type && file.type.startsWith("image/"));
            if (fileList.length === 0) return;

            const currentAward = getCurrentAward();
            if (currentAward?.slideType === 'top3') {
                ensureTop3(currentAward);
                if (fileList.length === 1) {
                    handleImageFile(fileList[0]);
                    return;
                }
                const maxCount = getTop3Count(currentAward);
                const targets = currentAward.top3?.entries || [];
                const usable = fileList.slice(0, maxCount);
                for (let i = 0; i < usable.length; i += 1) {
                    try {
                        const dataUrl = await readFileAsDataURL(usable[i]);
                        if (targets[i]) targets[i].image = dataUrl;
                    } catch (err) {
                        console.error(err);
                    }
                }
                if (fileList.length > maxCount) {
                    showToast(`Loaded first ${maxCount} images into Top ${maxCount}.`);
                } else {
                    showToast(`Loaded ${usable.length} image(s) into Top ${maxCount}.`);
                }
                refreshEditorMedia();
                return;
            }

            if (fileList.length === 1) {
                handleImageFile(fileList[0]);
                return;
            }

            let lastId = null;
            for (const file of fileList) {
                try {
                    const dataUrl = await readFileAsDataURL(file);
                    lastId = createAwardFromImageFile(file, dataUrl);
                } catch (err) {
                    console.error(err);
                }
            }

            renderList();
            if (lastId) selectAward(lastId);
            showToast(`Created ${fileList.length} slides.`);
        }

        /* --- FRAMING CONTROLS --- */

        function setupEditorInteractions() {
            const container = document.getElementById('editorImageContainer');
            const img = document.getElementById('editorImage');

            // Drag & Drop Upload
            container.addEventListener('dragover', (e) => {
                e.preventDefault();
                container.classList.add('drag-over');
            });
            container.addEventListener('dragleave', () => {
                container.classList.remove('drag-over');
            });
            container.addEventListener('drop', (e) => {
                e.preventDefault();
                container.classList.remove('drag-over');
                if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleImageFiles(e.dataTransfer.files);
                }
            });

            // Mouse Down
            container.addEventListener('mousedown', (e) => {
                isDragging = true;
                dragMoved = false;
                dragStartClientX = e.clientX;
                dragStartClientY = e.clientY;
                startX = e.clientX - editorTransform.x;
                startY = e.clientY - editorTransform.y;
                container.style.cursor = 'grabbing';
            });

            // Mouse Up
            window.addEventListener('mouseup', (e) => {
                if (isDragging) {
                    isDragging = false;
                    container.style.cursor = 'default';
                    saveTransform();
                }
            });

            // Mouse Move
            window.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                e.preventDefault();
                if (!dragMoved) {
                    const movedX = Math.abs(e.clientX - dragStartClientX);
                    const movedY = Math.abs(e.clientY - dragStartClientY);
                    if (movedX > 4 || movedY > 4) dragMoved = true;
                }
                const x = e.clientX - startX;
                const y = e.clientY - startY;
                editorTransform.x = x;
                editorTransform.y = y;
                applyEditorTransform();
            });

            container.addEventListener('click', (e) => {
                const target = getCurrentMediaTarget();
                if (!target || (target.kenBurnsMode || 'off') !== 'fixate') return;
                if (dragMoved) {
                    dragMoved = false;
                    return;
                }
                const rect = container.getBoundingClientRect();
                const x = clampNumber((e.clientX - rect.left) / rect.width, 0, 1);
                const y = clampNumber((e.clientY - rect.top) / rect.height, 0, 1);
                target.fixatePoint = { x, y };
                updateFixateMarker(target);
            });

            // Wheel Zoom
            container.addEventListener('wheel', (e) => {
                e.preventDefault();
                const delta = e.deltaY * -0.001;
                const newScale = Math.min(Math.max(0.5, editorTransform.scale + delta), 3);
                
                editorTransform.scale = newScale;
                document.getElementById('zoomInput').value = newScale;
                applyEditorTransform();
                // Debounce save slightly or save on mouseup? Let's save immediately for zoom
                saveTransform();
            });
        }

        function setupPlayerHotkeys() {
            document.addEventListener('keydown', (e) => {
                if (e.repeat) return;
                const player = document.getElementById('player-app');
                if (!player || player.classList.contains('hidden')) return;
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

        function handleZoomChange(val) {
            editorTransform.scale = parseFloat(val);
            applyEditorTransform();
            saveTransform();
        }

        function normalizeTransform(transform) {
            const base = { x: 0, y: 0, scale: 1 };
            const raw = transform && typeof transform === 'object' ? transform : {};
            const x = normalizeNumber(raw.x, base.x);
            const y = normalizeNumber(raw.y, base.y);
            const scale = clampNumber(normalizeNumber(raw.scale, base.scale), 0.5, 3);
            return { x, y, scale };
        }

        function getOverlayTextShadow(strength, cinematic) {
            const s = clampNumber(Number(strength) || 0, 0, 1);
            if (s <= 0.01) return 'none';
            if (cinematic) {
                const shadow1 = `0 2px ${Math.round(6 + 10 * s)}px rgba(0,0,0,${0.5 + 0.4 * s})`;
                const glow1 = `0 0 ${Math.round(18 * s)}px rgba(255,255,255,${0.35 * s})`;
                const glow2 = `0 0 ${Math.round(36 * s)}px rgba(255,255,255,${0.2 * s})`;
                return `${shadow1}, ${glow1}, ${glow2}`;
            }
            return `0 2px ${Math.round(10 * s)}px rgba(0,0,0,${0.7 * s})`;
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
            el.style.left = `${baseX}%`;
            el.style.top = `${baseY}%`;
            el.style.setProperty('--overlay-anchor-x', anchorX);
            el.style.setProperty('--overlay-anchor-y', anchorY);
            el.style.setProperty('--overlay-offset-x', `${offsetX}px`);
            el.style.setProperty('--overlay-offset-y', `${offsetY}px`);
        }

        function normalizeOverlay(source, index) {
            const id = normalizeText(source?.id, `${Date.now()}-${index}`);
            const text = normalizeText(source?.text, "");
            const htmlSource = typeof source?.html === 'string'
                ? source.html
                : (text ? htmlFromText(text) : "");
            const html = sanitizeOverlayHtml(htmlSource);
            const resolvedText = html ? stripOverlayHtml(html) : text;
            const delay = clampNumber(normalizeNumber(source?.delay, 0), 0, 10);
            const duration = clampNumber(normalizeNumber(source?.duration, 3), 0, 10);
            const effect = overlayEffectOptions.includes(source?.effect) ? source.effect : "fade";
            const effectDuration = clampNumber(normalizeNumber(source?.effectDuration, 0.6), 0, 10);
            const background = source?.background !== undefined ? !!source.background : true;
            const textColor = normalizeText(source?.textColor, "#ffffff");
            const backgroundColor = normalizeText(source?.backgroundColor, "#000000");
            const backgroundOpacity = clampNumber(normalizeNumber(source?.backgroundOpacity, 0.45), 0, 1);
            const fontSize = clampNumber(normalizeNumber(source?.fontSize, 2.2), 0.6, 6);
            const lineHeight = clampNumber(normalizeNumber(source?.lineHeight, 1.15), 0.8, 2.4);
            const align = ['left', 'center', 'right'].includes(source?.align) ? source.align : "center";
            const maxWidth = clampNumber(normalizeNumber(source?.maxWidth, 90), 40, 100);
            const glowStrength = clampNumber(normalizeNumber(source?.glowStrength, 0.6), 0, 1);
            const glowCinematic = source?.glowCinematic !== undefined ? !!source.glowCinematic : true;
            const positionX = ['left', 'center', 'right'].includes(source?.positionX) ? source.positionX : "center";
            const positionY = ['top', 'middle', 'bottom'].includes(source?.positionY) ? source.positionY : "bottom";
            const offsetX = clampNumber(normalizeNumber(source?.offsetX, 0), -500, 500);
            const offsetY = clampNumber(normalizeNumber(source?.offsetY, 0), -500, 500);
            const paddingX = clampNumber(normalizeNumber(source?.paddingX, 18), 0, 80);
            const paddingY = clampNumber(normalizeNumber(source?.paddingY, 10), 0, 80);
            const radius = clampNumber(normalizeNumber(source?.radius, 12), 0, 40);
            const backdropBlur = clampNumber(normalizeNumber(source?.backdropBlur, 4), 0, 20);
            const zIndex = clampNumber(normalizeNumber(source?.zIndex, 10), 0, 100);
            return {
                id,
                text: resolvedText,
                html,
                delay,
                duration,
                effect,
                effectDuration,
                background,
                textColor,
                backgroundColor,
                backgroundOpacity,
                fontSize,
                lineHeight,
                align,
                maxWidth,
                glowStrength,
                glowCinematic,
                positionX,
                positionY,
                offsetX,
                offsetY,
                paddingX,
                paddingY,
                radius,
                backdropBlur,
                zIndex
            };
        }

        function normalizeTop3Entry(source, placeFallback) {
            const base = buildDefaultTop3Entry(placeFallback);
            const rawOverlays = Array.isArray(source?.overlays) ? source.overlays : [];
            const overlays = rawOverlays.map((overlay, idx) => normalizeOverlay(overlay, idx));
            const kenBurnsModes = new Set([
                "off",
                "zoom-in",
                "zoom-out",
                "pan-left-right",
                "pan-right-left",
                "pan-up-down",
                "pan-down-up",
                "diagonal-up-right",
                "diagonal-down-left",
                "fixate"
            ]);
            const kenBurnsMode = kenBurnsModes.has(source?.kenBurnsMode) ? source.kenBurnsMode : base.kenBurnsMode;
            const fixateEasing = fixateEasingOptions.includes(source?.fixateEasing) ? source.fixateEasing : base.fixateEasing;

            return {
                ...base,
                place: normalizeNumber(source?.place, base.place),
                name: normalizeText(source?.name, base.name),
                image: normalizeText(source?.image, base.image),
                imageFit: normalizeImageFit(source?.imageFit || base.imageFit),
                linkedStartAwardId: normalizeText(source?.linkedStartAwardId, base.linkedStartAwardId),
                linkedEndAwardId: normalizeText(source?.linkedEndAwardId, base.linkedEndAwardId),
                overlays,
                transform: normalizeTransform(source?.transform),
                kenBurnsMode,
                kenBurnsDuration: clampNumber(normalizeNumber(source?.kenBurnsDuration, base.kenBurnsDuration), 6, 24),
                kenBurnsIntensity: clampNumber(normalizeNumber(source?.kenBurnsIntensity, base.kenBurnsIntensity), 0, 60),
                fixateSpeed: clampNumber(normalizeNumber(source?.fixateSpeed, base.fixateSpeed), 2, 60),
                fixateZoom: clampNumber(normalizeNumber(source?.fixateZoom, base.fixateZoom), 1, 5),
                fixatePoint: normalizeFixatePoint(source?.fixatePoint),
                fixateEasing
            };
        }

        function normalizeTop3Entries(entries, count) {
            const rawEntries = Array.isArray(entries) ? entries : [];
            const byPlace = new Map();
            const leftovers = [];

            rawEntries.forEach((entry) => {
                const place = Number(entry?.place);
                if (Number.isFinite(place) && !byPlace.has(place)) {
                    byPlace.set(place, entry);
                } else {
                    leftovers.push(entry);
                }
            });

            let fallbackIndex = 0;
            return getTop3Places(count).map((place) => {
                let entry = byPlace.get(place);
                if (!entry && fallbackIndex < leftovers.length) {
                    entry = { ...leftovers[fallbackIndex], place };
                    fallbackIndex += 1;
                }
                return normalizeTop3Entry(entry, place);
            });
        }

        function normalizeTop3(source) {
            const base = buildDefaultTop3();
            const rawCount = normalizeNumber(source?.count, NaN);
            const fallbackCount = Array.isArray(source?.entries) ? source.entries.length : base.count;
            const count = clampTop3Count(Number.isFinite(rawCount) ? rawCount : (fallbackCount || base.count));
            const labels = source?.labels && typeof source.labels === 'object' ? source.labels : {};
            const normalizedLabels = {};
            Object.keys(labels).forEach((key) => {
                normalizedLabels[key] = normalizeText(labels[key], "");
            });
            const teaserStyles = new Set(['silhouette', 'blur', 'pixelate']);
            const layoutStyles = new Set(['grid', 'editorial']);
            const emphasisStyles = new Set(['scale-glow', 'pulse-glow', 'none']);
            const normalized = {
                count,
                showWinner: source?.showWinner === true,
                teaserStyle: teaserStyles.has(source?.teaserStyle) ? source.teaserStyle : base.teaserStyle,
                layoutStyle: layoutStyles.has(source?.layoutStyle) ? source.layoutStyle : base.layoutStyle,
                winnerEmphasis: emphasisStyles.has(source?.winnerEmphasis) ? source.winnerEmphasis : base.winnerEmphasis,
                pixelateAmount: clampNumber(normalizeNumber(source?.pixelateAmount, base.pixelateAmount), 1, 10),
                silhouetteDarkness: clampNumber(normalizeNumber(source?.silhouetteDarkness, base.silhouetteDarkness), 0.3, 0.95),
                labels: normalizedLabels,
                entries: normalizeTop3Entries(source?.entries, count)
            };
            ensureTop3Labels({ top3: normalized }, count);
            return normalized;
        }

        function getLegacyOverlays(source) {
            const legacyText = normalizeText(source?.overlayText, "");
            if (!legacyText) return [];
            return [{
                id: generateId(),
                text: legacyText,
                html: htmlFromText(legacyText),
                delay: clampNumber(normalizeNumber(source?.overlayDelay, 0), 0, 10),
                duration: clampNumber(normalizeNumber(source?.overlayDuration, 3), 0, 10),
                effect: "fade",
                effectDuration: 0.6,
                background: true,
                textColor: "#ffffff",
                backgroundColor: "#000000",
                backgroundOpacity: 0.45,
                fontSize: 2.2,
                lineHeight: 1.15,
                align: "center",
                maxWidth: 90,
                glowStrength: 0.6,
                glowCinematic: true,
                positionX: "center",
                positionY: "bottom",
                offsetX: 0,
                offsetY: 0,
                paddingX: 18,
                paddingY: 10,
                radius: 6,
                backdropBlur: 4,
                zIndex: 10
            }];
        }

        function normalizeAward(source, index) {
            const id = normalizeText(source?.id, `${Date.now()}-${index}`);
            const base = buildDefaultAward(id);
            const slideType = source?.slideType === 'photo'
                ? 'photo'
                : (source?.slideType === 'top3'
                    ? 'top3'
                    : (source?.slideType === 'title-card' ? 'title-card' : 'award'));
            const kenBurnsModes = new Set([
                "off",
                "zoom-in",
                "zoom-out",
                "pan-left-right",
                "pan-right-left",
                "pan-up-down",
                "pan-down-up",
                "diagonal-up-right",
                "diagonal-down-left",
                "fixate"
            ]);
            const kenBurnsMode = kenBurnsModes.has(source?.kenBurnsMode) ? source.kenBurnsMode : base.kenBurnsMode;

            const rawOverlays = Array.isArray(source?.overlays) ? source.overlays : getLegacyOverlays(source);
            const overlays = rawOverlays.map((overlay, idx) => normalizeOverlay(overlay, idx));
            const revealDelayRaw = normalizeNumber(source?.revealPhotoDelay, base.revealPhotoDelay);
            const revealFadeRaw = normalizeNumber(source?.revealFadeDuration, base.revealFadeDuration);
            const revealFadeOutRaw = normalizeNumber(source?.revealFadeOutDuration, base.revealFadeOutDuration);
            const slideAutoAdvanceDelayRaw = normalizeNumber(source?.slideAutoAdvanceDelay, base.slideAutoAdvanceDelay);
            const slideAutoAdvanceRaw = source?.slideAutoAdvance;
            const slideShowControlsRaw = source?.slideShowControls;

            return {
                ...base,
                title: normalizeText(source?.title, base.title),
                slideType,
                categoryLine: normalizeText(source?.categoryLine, base.categoryLine),
                subLine: normalizeText(source?.subLine, base.subLine),
                winner: normalizeText(source?.winner, base.winner),
                winnerColor: normalizeText(source?.winnerColor, base.winnerColor),
                revealText: normalizeText(source?.revealText, base.revealText),
                nextText: normalizeText(source?.nextText, base.nextText),
                linkedStartAwardId: normalizeText(source?.linkedStartAwardId, base.linkedStartAwardId),
                linkedEndAwardId: normalizeText(source?.linkedEndAwardId, base.linkedEndAwardId),
                seeMoreText: normalizeText(source?.seeMoreText, base.seeMoreText),
                backText: normalizeText(source?.backText, base.backText),
                linkedOnly: source?.linkedOnly === true,
                revealPhotoDelay: Number.isFinite(revealDelayRaw) ? clampNumber(revealDelayRaw, 0, 10) : null,
                revealFadeDuration: Number.isFinite(revealFadeRaw) ? clampNumber(revealFadeRaw, 0, 10) : null,
                revealFadeOutDuration: Number.isFinite(revealFadeOutRaw) ? clampNumber(revealFadeOutRaw, 0, 10) : null,
                slideAutoAdvance: slideAutoAdvanceRaw === true ? true : (slideAutoAdvanceRaw === false ? false : null),
                slideAutoAdvanceDelay: Number.isFinite(slideAutoAdvanceDelayRaw) ? clampNumber(slideAutoAdvanceDelayRaw, 1, 60) : null,
                slideShowControls: slideShowControlsRaw === true ? true : (slideShowControlsRaw === false ? false : null),
                overlays,
                image: normalizeText(source?.image, base.image),
                imageFit: normalizeImageFit(source?.imageFit || base.imageFit),
                transform: normalizeTransform(source?.transform),
                kenBurnsMode,
                kenBurnsDuration: clampNumber(normalizeNumber(source?.kenBurnsDuration, base.kenBurnsDuration), 6, 24),
                kenBurnsIntensity: clampNumber(normalizeNumber(source?.kenBurnsIntensity, base.kenBurnsIntensity), 0, 60),
                fixateSpeed: clampNumber(normalizeNumber(source?.fixateSpeed, base.fixateSpeed), 2, 60),
                fixateZoom: clampNumber(normalizeNumber(source?.fixateZoom, base.fixateZoom), 1, 5),
                fixatePoint: normalizeFixatePoint(source?.fixatePoint),
                fixateEasing: fixateEasingOptions.includes(source?.fixateEasing) ? source.fixateEasing : base.fixateEasing,
                top3: normalizeTop3(source?.top3)
            };
        }

        function getCurrentAward() {
            return awards.find(a => a.id === currentAwardId);
        }


        function applyEditorTransform() {
            const img = document.getElementById('editorImage');
            img.style.transform = `translate(${editorTransform.x}px, ${editorTransform.y}px) scale(${editorTransform.scale})`;
        }

        function applyEditorImageFit(fit) {
            const img = document.getElementById('editorImage');
            if (!img) return;
            img.style.objectFit = normalizeImageFit(fit);
        }

        function getImageFit(target) {
            return normalizeImageFit(target?.imageFit);
        }

        function resetFraming() {
            editorTransform = { x: 0, y: 0, scale: 1 };
            applyEditorTransform();
            document.getElementById('zoomInput').value = 1;
            saveTransform();
        }

        function fitImageToFrame() {
            const target = getCurrentMediaTarget();
            if (!target) return;
            target.imageFit = 'cover';
            editorTransform = { x: 0, y: 0, scale: 1 };
            applyEditorTransform();
            applyEditorImageFit(target.imageFit);
            const fitEl = document.getElementById('inputImageFit');
            if (fitEl) fitEl.value = target.imageFit;
            document.getElementById('zoomInput').value = 1;
            saveTransform();
        }

        function clearCurrentImage() {
            const target = getCurrentMediaTarget();
            if (!target) return;
            target.image = "";
            editorTransform = { x: 0, y: 0, scale: 1 };
            applyEditorTransform();
            document.getElementById('zoomInput').value = 1;
            saveTransform();
            refreshEditorMedia();
        }

        function saveTransform() {
            const target = getCurrentMediaTarget();
            if (target) {
                target.transform = { ...editorTransform };
            }
        }
