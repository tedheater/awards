        /* --- PLAYER LOGIC --- */

        function updateShowSetting(key, value) {
            showSettings[key] = value;
            if (key === 'themePreset' || key === 'accentColor' || key === 'stageColor' || key === 'stageStyle') {
                applyThemeSettings();
            }
            if (key === 'typePreset') {
                applyTypePreset(value);
            }
            if (key === 'themePreset') {
                const preset = themePresets[showSettings.themePreset] || themePresets['classic-gold'];
                if (!showSettings.accentColor) {
                    const accentEl = document.getElementById('inputAccentColor');
                    if (accentEl) accentEl.value = preset['--accent-color'] || '#d4af37';
                }
                if (!showSettings.stageColor) {
                    const stageEl = document.getElementById('inputStageColor');
                    if (stageEl) stageEl.value = preset['--bg-color'] || '#050505';
                }
            }
            if (key === 'titleFont' || key === 'subtitleFont' || key === 'winnerFont' || key === 'largeType' ||
                key === 'titleSize' || key === 'winnerSize' || key === 'categorySize' || key === 'sublineSize' ||
                key === 'categoryTracking' || key === 'titleTracking') {
                applyTypeSettings();
            }
            if (key === 'autoAdvance') {
                toggleAutoAdvanceControls();
            }
            if (key === 'soundEnabled') {
                toggleSoundControls();
            }
        }

        function toggleAutoAdvanceControls() {
            const group = document.getElementById('autoAdvanceTimingGroup');
            if (group) group.style.display = showSettings.autoAdvance ? 'block' : 'none';
        }

        function toggleSoundControls() {
            const group = document.getElementById('soundDetailGroup');
            if (group) group.style.display = showSettings.soundEnabled ? 'block' : 'none';
        }

        function syncShowSettingsUI() {
            const startMenuEl = document.getElementById('inputStartMenu');
            if (startMenuEl) startMenuEl.checked = !!showSettings.startMenu;
            const startTitleEl = document.getElementById('inputExportStartTitle');
            if (startTitleEl) startTitleEl.value = showSettings.exportStartTitle || "Start Show";
            const startButtonEl = document.getElementById('inputExportStartButton');
            if (startButtonEl) startButtonEl.value = showSettings.exportStartButton || "Start Show";
            const themeEl = document.getElementById('inputThemePreset');
            if (themeEl) themeEl.value = showSettings.themePreset || "classic-gold";
            const preset = themePresets[showSettings.themePreset] || themePresets['classic-gold'];
            const stageStyleEl = document.getElementById('inputStageStyle');
            if (stageStyleEl) stageStyleEl.value = showSettings.stageStyle || "solid";
            const accentEl = document.getElementById('inputAccentColor');
            if (accentEl) accentEl.value = showSettings.accentColor || preset['--accent-color'] || "#d4af37";
            const stageColorEl = document.getElementById('inputStageColor');
            if (stageColorEl) stageColorEl.value = showSettings.stageColor || preset['--bg-color'] || "#050505";
            const typePresetEl = document.getElementById('inputTypePreset');
            if (typePresetEl) typePresetEl.value = showSettings.typePreset || "classic";
            const titleFontEl = document.getElementById('inputTitleFont');
            if (titleFontEl) titleFontEl.value = showSettings.titleFont || "Montserrat";
            const subtitleFontEl = document.getElementById('inputSubtitleFont');
            if (subtitleFontEl) subtitleFontEl.value = showSettings.subtitleFont || "Montserrat";
            const winnerFontEl = document.getElementById('inputWinnerFont');
            if (winnerFontEl) winnerFontEl.value = showSettings.winnerFont || "Montserrat";
            const titleSizeEl = document.getElementById('inputTitleSize');
            if (titleSizeEl) titleSizeEl.value = showSettings.titleSize ?? 3.5;
            const winnerSizeEl = document.getElementById('inputWinnerSize');
            if (winnerSizeEl) winnerSizeEl.value = showSettings.winnerSize ?? 3.5;
            const categorySizeEl = document.getElementById('inputCategorySize');
            if (categorySizeEl) categorySizeEl.value = showSettings.categorySize ?? 1;
            const sublineSizeEl = document.getElementById('inputSublineSize');
            if (sublineSizeEl) sublineSizeEl.value = showSettings.sublineSize ?? 1;
            const categoryTrackEl = document.getElementById('inputCategoryTracking');
            if (categoryTrackEl) categoryTrackEl.value = showSettings.categoryTracking ?? 4;
            const titleTrackEl = document.getElementById('inputTitleTracking');
            if (titleTrackEl) titleTrackEl.value = showSettings.titleTracking ?? 0;
            const largeTypeEl = document.getElementById('inputLargeType');
            if (largeTypeEl) largeTypeEl.checked = !!showSettings.largeType;
            const holdBlackEl = document.getElementById('inputHoldBlack');
            if (holdBlackEl) holdBlackEl.checked = !!showSettings.holdOnBlack;
            const autoAdvanceEl = document.getElementById('inputAutoAdvance');
            if (autoAdvanceEl) autoAdvanceEl.checked = !!showSettings.autoAdvance;
            const autoAwardEl = document.getElementById('inputAutoAdvanceAward');
            if (autoAwardEl) autoAwardEl.value = showSettings.autoAdvanceAward ?? 6;
            const autoPhotoEl = document.getElementById('inputAutoAdvancePhoto');
            if (autoPhotoEl) autoPhotoEl.value = showSettings.autoAdvancePhoto ?? 6;
            const autoTopEl = document.getElementById('inputAutoAdvanceTop');
            if (autoTopEl) autoTopEl.value = showSettings.autoAdvanceTopStep ?? 3;
            const delayAwardEl = document.getElementById('inputRevealDelayAward');
            if (delayAwardEl) delayAwardEl.value = showSettings.revealDelayAward ?? 0.9;
            const delayPhotoEl = document.getElementById('inputRevealDelayPhoto');
            if (delayPhotoEl) delayPhotoEl.value = showSettings.revealDelayPhoto ?? 0;
            const delayTopEl = document.getElementById('inputRevealDelayTop');
            if (delayTopEl) delayTopEl.value = showSettings.revealDelayTop ?? 0.6;
            const fadeAwardEl = document.getElementById('inputFadeAward');
            if (fadeAwardEl) fadeAwardEl.value = showSettings.fadeDurationAward ?? 1.5;
            const fadePhotoEl = document.getElementById('inputFadePhoto');
            if (fadePhotoEl) fadePhotoEl.value = showSettings.fadeDurationPhoto ?? 1.5;
            const fadeTopEl = document.getElementById('inputFadeTop');
            if (fadeTopEl) fadeTopEl.value = showSettings.fadeDurationTop ?? 1.2;
            const soundEnabledEl = document.getElementById('inputSoundEnabled');
            if (soundEnabledEl) soundEnabledEl.checked = !!showSettings.soundEnabled;
            const soundRevealEl = document.getElementById('inputSoundReveal');
            if (soundRevealEl) soundRevealEl.checked = !!showSettings.soundOnReveal;
            const soundAdvanceEl = document.getElementById('inputSoundAdvance');
            if (soundAdvanceEl) soundAdvanceEl.checked = !!showSettings.soundOnAdvance;
            const soundStyleEl = document.getElementById('inputSoundStyle');
            if (soundStyleEl) soundStyleEl.value = showSettings.soundStyle || "soft";
            applyThemeSettings();
            applyTypeSettings();
            toggleAutoAdvanceControls();
            toggleSoundControls();
        }

        function normalizeShowSettings(data) {
            if (!data || typeof data !== 'object') return { ...defaultShowSettings };
            return {
                startMenu: !!data.startMenu,
                exportStartTitle: normalizeText(data.exportStartTitle, defaultShowSettings.exportStartTitle),
                exportStartButton: normalizeText(data.exportStartButton, defaultShowSettings.exportStartButton),
                themePreset: normalizeText(data.themePreset, defaultShowSettings.themePreset),
                stageStyle: normalizeText(data.stageStyle, defaultShowSettings.stageStyle),
                accentColor: normalizeText(data.accentColor, defaultShowSettings.accentColor),
                stageColor: normalizeText(data.stageColor, defaultShowSettings.stageColor),
                typePreset: normalizeText(data.typePreset, defaultShowSettings.typePreset),
                titleFont: normalizeText(data.titleFont, defaultShowSettings.titleFont),
                subtitleFont: normalizeText(data.subtitleFont, defaultShowSettings.subtitleFont),
                winnerFont: normalizeText(data.winnerFont, defaultShowSettings.winnerFont),
                titleSize: clampNumber(normalizeNumber(data.titleSize, defaultShowSettings.titleSize), 2, 6),
                winnerSize: clampNumber(normalizeNumber(data.winnerSize, defaultShowSettings.winnerSize), 2, 6),
                categorySize: clampNumber(normalizeNumber(data.categorySize, defaultShowSettings.categorySize), 0.6, 2),
                sublineSize: clampNumber(normalizeNumber(data.sublineSize, defaultShowSettings.sublineSize), 0.6, 2),
                categoryTracking: clampNumber(normalizeNumber(data.categoryTracking, defaultShowSettings.categoryTracking), 0, 10),
                titleTracking: clampNumber(normalizeNumber(data.titleTracking, defaultShowSettings.titleTracking), -1, 6),
                largeType: !!data.largeType,
                holdOnBlack: data.holdOnBlack !== undefined ? !!data.holdOnBlack : defaultShowSettings.holdOnBlack,
                revealDelayAward: clampNumber(normalizeNumber(data.revealDelayAward, defaultShowSettings.revealDelayAward), 0, 10),
                revealDelayPhoto: clampNumber(normalizeNumber(data.revealDelayPhoto, defaultShowSettings.revealDelayPhoto), 0, 10),
                revealDelayTop: clampNumber(normalizeNumber(data.revealDelayTop, defaultShowSettings.revealDelayTop), 0, 10),
                fadeDurationAward: clampNumber(normalizeNumber(data.fadeDurationAward, defaultShowSettings.fadeDurationAward), 0, 10),
                fadeDurationPhoto: clampNumber(normalizeNumber(data.fadeDurationPhoto, defaultShowSettings.fadeDurationPhoto), 0, 10),
                fadeDurationTop: clampNumber(normalizeNumber(data.fadeDurationTop, defaultShowSettings.fadeDurationTop), 0, 10),
                autoAdvance: !!data.autoAdvance,
                autoAdvanceAward: clampNumber(normalizeNumber(data.autoAdvanceAward, defaultShowSettings.autoAdvanceAward), 1, 60),
                autoAdvancePhoto: clampNumber(normalizeNumber(data.autoAdvancePhoto, defaultShowSettings.autoAdvancePhoto), 1, 60),
                autoAdvanceTopStep: clampNumber(normalizeNumber(data.autoAdvanceTopStep, defaultShowSettings.autoAdvanceTopStep), 1, 60),
                soundEnabled: !!data.soundEnabled,
                soundOnReveal: data.soundOnReveal !== undefined ? !!data.soundOnReveal : defaultShowSettings.soundOnReveal,
                soundOnAdvance: data.soundOnAdvance !== undefined ? !!data.soundOnAdvance : defaultShowSettings.soundOnAdvance,
                soundStyle: normalizeText(data.soundStyle, defaultShowSettings.soundStyle)
            };
        }

        function getFontStack(name) {
            return fontOptions[name] || fontOptions.Montserrat;
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

        function applyTypePreset(presetKey) {
            const preset = typePresets[presetKey] || typePresets.classic;
            showSettings.titleFont = preset.title;
            showSettings.subtitleFont = preset.subtitle;
            showSettings.winnerFont = preset.winner;
            const titleFontEl = document.getElementById('inputTitleFont');
            const subtitleFontEl = document.getElementById('inputSubtitleFont');
            const winnerFontEl = document.getElementById('inputWinnerFont');
            if (titleFontEl) titleFontEl.value = preset.title;
            if (subtitleFontEl) subtitleFontEl.value = preset.subtitle;
            if (winnerFontEl) winnerFontEl.value = preset.winner;
            applyTypeSettings();
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
            root.style.setProperty('--title-size', `${titleSize}rem`);
            root.style.setProperty('--winner-size', `${winnerSize}rem`);
            root.style.setProperty('--category-size', `${categorySize}rem`);
            root.style.setProperty('--subline-size', `${sublineSize}rem`);
            root.style.setProperty('--category-tracking', `${categoryTracking}px`);
            root.style.setProperty('--title-tracking', `${titleTracking}px`);
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
                bar.style.transition = `transform ${durationMs}ms linear`;
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

        function getAwardAutoAdvanceEnabled(award) {
            if (award?.slideAutoAdvance === true || award?.slideAutoAdvance === false) {
                return award.slideAutoAdvance;
            }
            return !!showSettings.autoAdvance;
        }

        function getAwardAutoAdvanceDelaySec(award) {
            const override = award?.slideAutoAdvanceDelay;
            if (override !== null && override !== undefined && Number.isFinite(Number(override))) {
                return clampNumber(Number(override), 1, 60);
            }
            let fallback = showSettings.autoAdvanceAward ?? 6;
            if (award?.slideType === 'top3') {
                fallback = showSettings.autoAdvanceTopStep ?? fallback;
            } else if (isPhotoLikeSlideType(award?.slideType)) {
                fallback = showSettings.autoAdvancePhoto ?? fallback;
            }
            return clampNumber(Number(fallback) || 0, 1, 60);
        }

        function shouldShowSlideControls(award) {
            if (award?.slideShowControls === true || award?.slideShowControls === false) {
                return award.slideShowControls;
            }
            return true;
        }

        function syncPlayerControlsVisibility(award = awards[playerState.currentIndex]) {
            const controls = document.querySelector('#player-app .player-controls');
            if (!controls) return;
            controls.classList.toggle('layout-hidden', !shouldShowSlideControls(award));
        }

        function scheduleAutoAdvanceForAward(award) {
            if (!award) return;
            if (!getAwardAutoAdvanceEnabled(award)) {
                clearAutoAdvanceTimer();
                return;
            }
            scheduleAutoAdvance(getAwardAutoAdvanceDelaySec(award));
        }

        let soundContext = null;

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

        function getPhotoFadeOutDurationSec(award, typeOverride) {
            const slideTypeRaw = typeOverride || award?.slideType || 'award';
            const slideType = isPhotoLikeSlideType(slideTypeRaw) ? 'photo' : slideTypeRaw;
            const override = award?.revealFadeOutDuration;
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
            bg.style.transitionDuration = `${getPhotoFadeDurationSec(award, typeOverride)}s`;
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
            const words = text.split(/\s+/).filter(Boolean);
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
            ensureOverlays(award);
            const overlayContainer = document.getElementById('playerOverlay');
            if (!overlayContainer) return;
            resetOverlayContainer();

            award.overlays.forEach((overlay) => {
                const effect = overlayEffectOptions.includes(overlay.effect) ? overlay.effect : 'fade';
                const displayHtml = sanitizeOverlayHtml(overlay.html || htmlFromText(overlay.text || ""));
                const plainText = stripOverlayHtml(displayHtml);
                if (!plainText) return;
                const overlayEl = document.createElement('div');
                overlayEl.className = `photo-overlay overlay-effect-${effect}`;
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
                overlayEl.style.setProperty('--overlay-effect-duration', `${effectDurationSec}s`);
                overlayEl.style.setProperty('--overlay-font-size', `${fontSize}rem`);
                overlayEl.style.setProperty('--overlay-line-height', `${lineHeight}`);
                overlayEl.style.setProperty('--overlay-max-width', `${maxWidth}%`);
                overlayEl.style.setProperty('--overlay-bg', hexToRgba(bgColor, bgOpacity));
                overlayEl.style.setProperty('--overlay-text-shadow', getOverlayTextShadow(glowStrength, glowCinematic));
                overlayEl.style.setProperty('--overlay-pad-x', `${padX}px`);
                overlayEl.style.setProperty('--overlay-pad-y', `${padY}px`);
                overlayEl.style.setProperty('--overlay-radius', `${radius}px`);
                overlayEl.style.setProperty('--overlay-backdrop-blur', `${backdropBlur}px`);
                overlayEl.style.color = textColor;
                overlayEl.style.textAlign = align;
                overlayEl.style.zIndex = `${zIndex}`;
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

        function getPixelateCanvasSize(aspectRatio = 0.8, base = 32) {
            if (!aspectRatio || !Number.isFinite(aspectRatio)) {
                return { width: base, height: base };
            }
            if (aspectRatio >= 1) {
                return { width: base, height: Math.max(10, Math.round(base / aspectRatio)) };
            }
            return { width: Math.max(10, Math.round(base * aspectRatio)), height: base };
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

        function createPixelatedCanvas(src, aspectRatio = 0.8, base = 32) {
            const { width, height } = getPixelateCanvasSize(aspectRatio, base);
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
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
            if (categoryEl) categoryEl.innerText = award.categoryLine || "And the award for";
            if (titleEl) titleEl.innerText = award.title || "";
            if (subLineEl) {
                subLineEl.innerText = award.subLine || "";
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
            teaser.style.setProperty('--top3-card-max-width', `${profile.cardMaxWidth}px`);
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
            layout.classList.add(`teaser-${award.top3.teaserStyle || 'silhouette'}`);
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
            layout.style.setProperty('--top3-card-max-width', `${profile.cardMaxWidth}px`);
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
                nameEl.innerText = "";
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
                nameEl.innerText = "";
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
                const slot = layout.querySelector(`.top3-slot[data-place="${place}"]`);
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
                        img.src = entry.image || "";
                        img.style.objectFit = getImageFit(entry);
                        if (isPlaced) {
                            img.style.transform = `translate(${entry.transform?.x || 0}px, ${entry.transform?.y || 0}px) scale(${entry.transform?.scale || 1})`;
                        }
                        media.appendChild(img);
                    }
                }

                if (nameEl) {
                    nameEl.innerText = isPlaced ? (entry.name || "") : "";
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
            nameEl.innerText = entry?.name || "";
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

        function setButtonActionClass(btn, action = 'default') {
            if (!btn) return;
            BUTTON_ACTION_CLASSES.forEach((className) => btn.classList.remove(className));
            btn.classList.add(`action-${action || 'default'}`);
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

        function setNextButtonProminence(level = 'primary') {
            const btn = document.getElementById('nextBtn');
            if (!btn) return;
            btn.classList.toggle('is-secondary', level === 'secondary');
        }

        function setTop3SeeMoreButton(label, options = {}) {
            const btn = document.getElementById('top3SeeMoreBtn');
            if (!btn) return;
            const controls = btn.closest('.player-controls');
            const disabled = !!options.disabled;
            const secondary = !!options.secondary;
            const action = options.action || (secondary ? 'back' : 'see-more');
            if (!label) {
                btn.classList.remove('visible');
                btn.classList.remove('is-secondary');
                btn.classList.add('layout-hidden');
                btn.disabled = false;
                btn.innerText = "See More";
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
            const controls = document.querySelector('#player-app .player-controls');
            if (controls) controls.classList.remove('layout-hidden');
            const btn = document.getElementById('nextBtn');
            if (btn) {
                btn.classList.remove('visible');
                btn.classList.remove('is-secondary');
                btn.classList.add('layout-hidden');
                btn.innerText = "Next";
                setButtonActionClass(btn, 'default');
                btn.disabled = true;
            }
            setTop3SeeMoreButton(null);
            setNextButtonProminence('primary');
        }

        function resolveTop3LinkedRange(entry, parentIndex = playerState.currentIndex) {
            const startId = String(entry?.linkedStartAwardId || "").trim();
            if (!startId) return null;
            let startIndex = awards.findIndex((award) => award?.id === startId);
            if (startIndex < 0) return null;
            const endId = String(entry?.linkedEndAwardId || "").trim();
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
            if (Number.isFinite(parentIndex) && parentIndex >= startIndex && parentIndex <= endIndex) {
                return null;
            }
            return { startIndex, endIndex };
        }

        function resolveAwardLinkedRange(award, parentIndex = playerState.currentIndex) {
            const startId = String(award?.linkedStartAwardId || "").trim();
            if (!startId) return null;
            let startIndex = awards.findIndex((item) => item?.id === startId);
            if (startIndex < 0) return null;
            const endId = String(award?.linkedEndAwardId || "").trim();
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
            const label = String(award?.seeMoreText ?? "").trim();
            return label || "Show More";
        }

        function getAwardBackLabel(award) {
            const label = String(award?.backText ?? "").trim();
            return label || "Back";
        }

        function updateSecondaryActionButton(award) {
            if (playerState.linkedMode && getNextSequenceIndex() !== null) {
                setTop3SeeMoreButton(playerState.linkedMode.backLabel || "Back", { secondary: true });
                setNextButtonProminence('primary');
                syncPlayerControlsVisibility(award);
                return;
            }

            if (!playerState.linkedMode && award?.slideType === 'award' && playerState.phase === 'revealed') {
                const hasLinkedRange = !!resolveAwardLinkedRange(award, playerState.currentIndex);
                setTop3SeeMoreButton(hasLinkedRange ? getAwardSeeMoreLabel(award) : null, { secondary: false });
                setNextButtonProminence(hasLinkedRange ? 'secondary' : 'primary');
                syncPlayerControlsVisibility(award);
                return;
            }

            setTop3SeeMoreButton(null);
            setNextButtonProminence('primary');
            syncPlayerControlsVisibility(award);
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
                return award?.nextText || "Next Slide";
            }
            return playerState.linkedMode ? (playerState.linkedMode.backLabel || "Back") : "End Show";
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
            syncPlayerControlsVisibility(parentAward);
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

            document.getElementById('playerCategory').innerText = parentAward.categoryLine || "And the award for";
            document.getElementById('playerTitle').innerText = parentAward.title;
            const subLineEl = document.getElementById('playerSubLine');
            subLineEl.innerText = parentAward.subLine || "";
            subLineEl.style.display = parentAward.subLine ? 'block' : 'none';
            const winnerEl = document.getElementById('playerWinner');
            winnerEl.innerText = parentAward.winner || "";
            winnerEl.style.color = parentAward.winnerColor || "#ff3b30";
            winnerEl.style.visibility = parentAward.winner ? 'visible' : 'hidden';
            winnerEl.classList.remove('animate-in');

            if (textStage) textStage.classList.add('faded-out');
            imgWrap.classList.remove('ken-burns', 'ken-burns-fixate');
            if (parentAward.image) {
                img.src = parentAward.image;
                img.style.objectFit = getImageFit(parentAward);
                img.style.transform = `translate(${parentAward.transform.x}px, ${parentAward.transform.y}px) scale(${parentAward.transform.scale})`;
                applyKenBurns(imgWrap, parentAward);
                applyPhotoFadeDuration(parentAward);
                bg.classList.add('active');
            } else {
                img.src = "";
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
                    showToast("No linked slideshow for this slide.");
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
                showToast("No linked slideshow for this place.");
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

            img.src = entry.image || "";
            img.style.objectFit = getImageFit(entry);
            img.style.transform = `translate(${entry.transform?.x || 0}px, ${entry.transform?.y || 0}px) scale(${entry.transform?.scale || 1})`;
            applyKenBurns(imgWrap, entry);
            applyPhotoFadeDuration(award, 'top3');
            bg.classList.add('active');
            playSoundEffect('reveal');
            scheduleOverlays(entry);
        }

        function animateTop3Reveal(award, index, onDone, fromTeaser = false) {
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
                sourceEl = stage.querySelector(`.top3-slot[data-place="${place}"]`);
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
            clone.style.left = `${startRect.left}px`;
            clone.style.top = `${startRect.top}px`;
            clone.style.width = `${startRect.width}px`;
            clone.style.height = `${startRect.height}px`;

            const media = document.createElement('div');
            media.className = 'top3-reveal-media';

            const teaserStyle = award.top3.teaserStyle || 'silhouette';
            const silhouetteBrightness = getSilhouetteBrightness(award);

            if (teaserStyle === 'pixelate') {
                const canvas = createPixelatedCanvas(entry.image, 0.8, getTop3PixelateSize(award));
                canvas.style.opacity = '1';
                const img = document.createElement('img');
                img.src = entry.image;
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
                    img.style.filter = `grayscale(1) brightness(${silhouetteBrightness}) contrast(1.2)`;
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
                clone.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;

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
            clone.style.left = `${startRect.left}px`;
            clone.style.top = `${startRect.top}px`;
            clone.style.width = `${startRect.width}px`;
            clone.style.height = `${startRect.height}px`;
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
                const slot = layout.querySelector(`.top3-slot[data-place="${place}"]`);
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
                    clone.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
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
                    setTop3SeeMoreButton(playerState.linkedMode.backLabel || "Back", { secondary: true });
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
                            setTop3SeeMoreButton(playerState.linkedMode.backLabel || "Back", { secondary: true });
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
                            setTop3SeeMoreButton(playerState.linkedMode.backLabel || "Back", { secondary: true });
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
                tile.innerHTML = `
                    <div class="menu-tile-title">${title}</div>
                    <div class="menu-tile-sub">${typeLabel}</div>
                `;
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

        function playShow(options = {}) {
            if (awards.length === 0) {
                showToast("No awards to play!");
                return;
            }
            const { startIndex = 0, skipMenu = false } = options;

            document.getElementById('editor-app').classList.add('hidden');
            document.getElementById('player-app').classList.remove('hidden');
            resetPlayerControlButtons();
            
            // Request Fullscreen
            const elem = document.getElementById('player-app');
            if (elem.requestFullscreen) elem.requestFullscreen();
            else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
            else if (elem.msRequestFullscreen) elem.msRequestFullscreen();

            if (!skipMenu && showSettings.startMenu) {
                showMenu();
            } else {
                startSequence(startIndex);
            }
        }

        function startSequence(index, options = {}) {
            const keepLinkedMode = !!options.keepLinkedMode;
            if (!keepLinkedMode) {
                playerState.linkedMode = null;
            }
            const previousAward = awards[playerState.currentIndex];
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
            const fadeOutSec = needsFade ? getPhotoFadeOutDurationSec(previousAward) : 0;
            const delay = needsFade ? Math.max(0, Math.floor(fadeOutSec * 1000)) : 0;

            if (needsFade) {
                bg.style.transitionDuration = `${fadeOutSec}s`;
            }
            bg.classList.remove('active'); // Fade to black
            textStage.classList.add('faded-out'); // Hide text during transition
            resetOverlayContainer();
            hideTop3Stage();
            hideTop3RevealBadge();

            setTimeout(() => {
                if (award.slideType === 'top3') {
                    prepareTop3Heading(award);
                    showTop3Stage('teaser', award);
                    playerState.phase = 'top3';
                    const firstPlace = getTop3EntryPlace(award.top3.entries[0], 0, award);
                    const label = getTop3Label(award, 'reveal', firstPlace);
                    updateNextButton(label, 'reveal');
                    if (playerState.linkedMode) {
                        setTop3SeeMoreButton(playerState.linkedMode.backLabel || "Back", { secondary: true });
                    } else {
                        setTop3SeeMoreButton(null);
                    }
                    setNextButtonProminence('primary');
                    syncPlayerControlsVisibility(award);
                    document.getElementById('playerImageWrap').classList.remove('ken-burns', 'ken-burns-fixate');
                    scheduleAutoAdvanceForAward(award);
                    return;
                }

                // Reset Text animations
                resetAnimation('playerCategory');
                resetAnimation('playerTitle');
                resetAnimation('playerSubLine');
                resetAnimation('playerWinner');

                // Populate Text
                document.getElementById('playerCategory').innerText = award.categoryLine || "And the award for";
                document.getElementById('playerTitle').innerText = award.title;
                const subLineEl = document.getElementById('playerSubLine');
                subLineEl.innerText = award.subLine || "";
                subLineEl.style.display = award.subLine ? 'block' : 'none';
                const winnerEl = document.getElementById('playerWinner');
                winnerEl.innerText = ""; // Hide winner initially
                winnerEl.style.visibility = 'hidden';
                winnerEl.style.color = award.winnerColor || "#ff3b30";

                const isPhotoOnly = isPhotoLikeSlideType(award.slideType);
                if (!isPhotoOnly) {
                    // Reveal text stage
                    textStage.classList.remove('faded-out');
                }

                // Trigger Text Animations
                if (!isPhotoOnly) {
                    setTimeout(() => {
                        document.getElementById('playerCategory').classList.add('animate-in');
                        document.getElementById('playerTitle').classList.add('animate-in', 'animate-delay-1');
                        if (award.subLine) {
                            document.getElementById('playerSubLine').classList.add('animate-in', 'animate-delay-2');
                        }
                    }, 100);
                }

                // Button State
                const nextLabel = getAdvanceActionLabel(award);
                updateNextButton(
                    isPhotoOnly ? nextLabel : (award.revealText || "Reveal Winner"),
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
                        img.style.transform = `translate(${award.transform.x}px, ${award.transform.y}px) scale(${award.transform.scale})`;
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
                    img.style.transform = `translate(${award.transform.x}px, ${award.transform.y}px) scale(${award.transform.scale})`;
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
                // Reveal the Winner Name first (on black), then photo
                playerState.phase = 'revealing';
                document.getElementById('nextBtn').disabled = true;
                
                const bg = document.getElementById('playerBackground');
                const img = document.getElementById('playerImageElement');
                const imgWrap = document.getElementById('playerImageWrap');
                
                // Show Winner Text if exists
                const winnerEl = document.getElementById('playerWinner');
                if (award.winner) {
                    winnerEl.innerText = award.winner;
                    winnerEl.style.color = award.winnerColor || "#ff3b30";
                    winnerEl.style.visibility = 'visible';
                    winnerEl.classList.add('animate-in');
                }

                const finalizeReveal = () => {
                    scheduleOverlays(award);
                    // Update Button
                    updateNextButton(getAdvanceActionLabel(award), getAdvanceActionType());
                    playerState.phase = 'revealed';
                    updateSecondaryActionButton(award);
                    scheduleAutoAdvanceForAward(award);
                    // Fade out text a bit sooner after reveal
                    setTimeout(() => {
                        textStage.classList.add('faded-out');
                    }, TEXT_FADE_DELAY_MS);
                };

                if (showSettings.holdOnBlack) {
                    const revealDelayMs = getPhotoRevealDelaySec(award) * 1000;
                    setTimeout(() => {
                        // Set Image
                        img.src = award.image;
                        img.style.objectFit = getImageFit(award);
                        // Apply Saved Transforms
                        img.style.transform = `translate(${award.transform.x}px, ${award.transform.y}px) scale(${award.transform.scale})`;

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
                // Move to next
                continueSequenceOrExit();
            }
        }

        function resetAnimation(id) {
            const el = document.getElementById(id);
            el.classList.remove('animate-in', 'animate-delay-1', 'animate-delay-2');
            void el.offsetWidth; // Trigger reflow
        }

        function applyKenBurns(imgWrap, award, className) {
            let mode = award.kenBurnsMode;
            if (mode === undefined && award.kenBurns !== undefined) {
                mode = award.kenBurns ? "zoom-in" : "off";
            }
            mode = mode || "off";
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

            if (mode === "off") return;

            let scaleFrom = 1;
            let scaleTo = 1 + scaleDelta;
            let xFrom = 0;
            let xTo = 0;
            let yFrom = 0;
            let yTo = 0;

            if (isFixate) {
                const zoom = clampNumber(Number(award.fixateZoom) || 2.5, 1, 5);
                const point = normalizeFixatePoint(award.fixatePoint);
                const rect = imgWrap.getBoundingClientRect();
                const dx = (point.x - 0.5) * rect.width;
                const dy = (point.y - 0.5) * rect.height;
                scaleFrom = 1;
                scaleTo = zoom;
                xFrom = 0;
                yFrom = 0;
                xTo = -dx * (zoom - 1);
                yTo = -dy * (zoom - 1);
            } else {
                switch (mode) {
                    case "zoom-in":
                        scaleFrom = 1;
                        scaleTo = 1 + scaleDelta;
                        break;
                    case "zoom-out":
                        scaleFrom = 1 + scaleDelta;
                        scaleTo = 1;
                        break;
                    case "pan-left-right":
                        xFrom = -intensity;
                        xTo = intensity;
                        scaleTo = 1 + scaleDelta * 0.5;
                        break;
                    case "pan-right-left":
                        xFrom = intensity;
                        xTo = -intensity;
                        scaleTo = 1 + scaleDelta * 0.5;
                        break;
                    case "pan-up-down":
                        yFrom = -intensity;
                        yTo = intensity;
                        scaleTo = 1 + scaleDelta * 0.5;
                        break;
                    case "pan-down-up":
                        yFrom = intensity;
                        yTo = -intensity;
                        scaleTo = 1 + scaleDelta * 0.5;
                        break;
                    case "diagonal-up-right":
                        xFrom = -intensity;
                        xTo = intensity;
                        yFrom = intensity;
                        yTo = -intensity;
                        scaleTo = 1 + scaleDelta * 0.5;
                        break;
                    case "diagonal-down-left":
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

            imgWrap.style.setProperty('--kb-scale-from', `${scaleFrom}`);
            imgWrap.style.setProperty('--kb-scale-to', `${scaleTo}`);
            imgWrap.style.setProperty('--kb-x-from', `${xFrom}px`);
            imgWrap.style.setProperty('--kb-x-to', `${xTo}px`);
            imgWrap.style.setProperty('--kb-y-from', `${yFrom}px`);
            imgWrap.style.setProperty('--kb-y-to', `${yTo}px`);
            imgWrap.style.setProperty('--kb-duration', `${duration}s`);
            if (isFixate) {
                const easing = fixateEasingOptions.includes(award.fixateEasing) ? award.fixateEasing : "ease-out";
                imgWrap.style.setProperty('--kb-easing', easing);
            }
            const resolvedClass = className || (isFixate ? 'ken-burns-fixate' : 'ken-burns');
            imgWrap.classList.add(resolvedClass);
        }

        function previewKenBurns() {
            const target = getCurrentMediaTarget();
            if (!target) return;
            if (!target.image) {
                showToast("Upload a photo to preview.");
                return;
            }
            if ((target.kenBurnsMode || "off") === "off" && target.kenBurns !== true) {
                showToast("Ken Burns is off.");
                return;
            }

            const wrap = document.getElementById('editorImageWrap');
            wrap.classList.remove('ken-burns-preview', 'ken-burns-fixate-preview');
            void wrap.offsetWidth;
            const previewClass = (target.kenBurnsMode === 'fixate') ? 'ken-burns-fixate-preview' : 'ken-burns-preview';
            applyKenBurns(wrap, target, previewClass);

            const duration = (target.kenBurnsMode === 'fixate' ? (target.fixateSpeed || 8) : (target.kenBurnsDuration || 12)) * 1000;
            setTimeout(() => {
                wrap.classList.remove('ken-burns-preview', 'ken-burns-fixate-preview');
            }, duration);
        }

        function syncBulkKenBurnsTargets() {
            const startEl = document.getElementById('bulkKenBurnsStart');
            const endEl = document.getElementById('bulkKenBurnsEnd');
            if (!startEl || !endEl) return;

            const selectedStart = startEl.value;
            const selectedEnd = endEl.value;
            const current = getCurrentAward();

            const baseOptionStart = '<option value="">Select start slide</option>';
            const baseOptionEnd = '<option value="">Select end slide</option>';
            startEl.innerHTML = baseOptionStart;
            endEl.innerHTML = baseOptionEnd;

            awards.forEach((award, index) => {
                const label = `${index + 1}. ${award.title || 'Untitled'} (${getSlideTypeLabel(award)})`;
                const startOption = document.createElement('option');
                startOption.value = award.id;
                startOption.innerText = label;
                startEl.appendChild(startOption);

                const endOption = document.createElement('option');
                endOption.value = award.id;
                endOption.innerText = label;
                endEl.appendChild(endOption);
            });

            const hasStart = awards.some((award) => award.id === selectedStart);
            const hasEnd = awards.some((award) => award.id === selectedEnd);
            startEl.value = hasStart ? selectedStart : (current?.id || '');
            endEl.value = hasEnd ? selectedEnd : (current?.id || '');

            syncBulkKenBurnsControls();
        }

        function syncBulkKenBurnsControls() {
            const modeEl = document.getElementById('bulkKenBurnsMode');
            const durationGroup = document.getElementById('bulkKenBurnsDurationGroup');
            const intensityGroup = document.getElementById('bulkKenBurnsIntensityGroup');
            const fixateGroup = document.getElementById('bulkKenBurnsFixateGroup');
            if (!modeEl) return;

            const mode = modeEl.value || 'off';
            const isFixate = mode === 'fixate';
            const isActive = mode !== 'off';

            if (durationGroup) durationGroup.style.display = (!isFixate && isActive) ? 'block' : 'none';
            if (intensityGroup) intensityGroup.style.display = (!isFixate && isActive) ? 'block' : 'none';
            if (fixateGroup) fixateGroup.style.display = isFixate ? 'block' : 'none';
        }

        function applyKenBurnsToRange() {
            const startEl = document.getElementById('bulkKenBurnsStart');
            const endEl = document.getElementById('bulkKenBurnsEnd');
            const modeEl = document.getElementById('bulkKenBurnsMode');
            if (!startEl || !endEl || !modeEl) return;

            const startId = String(startEl.value || '').trim();
            const endId = String(endEl.value || '').trim();
            if (!startId || !endId) {
                showToast("Select both range start and end.");
                return;
            }

            const startIndex = awards.findIndex((award) => award.id === startId);
            const endIndex = awards.findIndex((award) => award.id === endId);
            if (startIndex < 0 || endIndex < 0) {
                showToast("Selected slide range is invalid.");
                return;
            }

            const from = Math.min(startIndex, endIndex);
            const to = Math.max(startIndex, endIndex);
            const mode = modeEl.value || 'off';

            const durationEl = document.getElementById('bulkKenBurnsDuration');
            const intensityEl = document.getElementById('bulkKenBurnsIntensity');
            const fixateZoomEl = document.getElementById('bulkFixateZoom');
            const fixateSpeedEl = document.getElementById('bulkFixateSpeed');
            const fixateEasingEl = document.getElementById('bulkFixateEasing');
            const fixatePointXEl = document.getElementById('bulkFixatePointX');
            const fixatePointYEl = document.getElementById('bulkFixatePointY');

            const duration = clampNumber(Number(durationEl?.value) || 12, 6, 24);
            const intensity = clampNumber(Number(intensityEl?.value) || 20, 0, 60);
            const fixateZoom = clampNumber(Number(fixateZoomEl?.value) || 2.5, 1, 5);
            const fixateSpeed = clampNumber(Number(fixateSpeedEl?.value) || 8, 2, 60);
            const fixateEasing = fixateEasingOptions.includes(fixateEasingEl?.value) ? fixateEasingEl.value : 'ease-out';
            const fixatePointX = clampNumber(Number(fixatePointXEl?.value) || 0.5, 0, 1);
            const fixatePointY = clampNumber(Number(fixatePointYEl?.value) || 0.5, 0, 1);

            let applied = 0;
            let skippedTop3 = 0;

            for (let i = from; i <= to; i += 1) {
                const award = awards[i];
                if (!award) continue;
                if (award.slideType === 'top3') {
                    skippedTop3 += 1;
                    continue;
                }
                award.kenBurnsMode = mode;
                if (mode === 'fixate') {
                    award.fixateZoom = fixateZoom;
                    award.fixateSpeed = fixateSpeed;
                    award.fixateEasing = fixateEasing;
                    award.fixatePoint = { x: fixatePointX, y: fixatePointY };
                } else if (mode !== 'off') {
                    award.kenBurnsDuration = duration;
                    award.kenBurnsIntensity = intensity;
                }
                applied += 1;
            }

            if (applied === 0) {
                showToast(skippedTop3 > 0 ? "No eligible slides in range (Top Reveal slides skipped)." : "No slides updated.");
                return;
            }

            refreshEditorMedia();
            const skippedNote = skippedTop3 > 0 ? ` (${skippedTop3} Top Reveal skipped)` : '';
            showToast(`Applied Ken Burns to ${applied} slide(s)${skippedNote}.`);
        }

        let draggedAwardId = null;

        function onDragStart(e, id) {
            draggedAwardId = id;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', id);
            e.currentTarget.classList.add('dragging');
        }

        function onDragOver(e) {
            e.preventDefault();
            e.currentTarget.classList.add('drag-over');
            e.dataTransfer.dropEffect = 'move';
        }

        function onDragLeave(e) {
            e.currentTarget.classList.remove('drag-over');
        }

        function onDrop(e, targetId) {
            e.preventDefault();
            e.currentTarget.classList.remove('drag-over');
            const fromId = draggedAwardId || e.dataTransfer.getData('text/plain');
            if (!fromId || fromId === targetId) return;
            const fromIndex = awards.findIndex(a => a.id === fromId);
            const toIndex = awards.findIndex(a => a.id === targetId);
            if (fromIndex === -1 || toIndex === -1) return;
            const [moved] = awards.splice(fromIndex, 1);
            awards.splice(toIndex, 0, moved);
            renderList();
            currentAwardId = moved.id;
            selectAward(currentAwardId);
        }

        function onDragEnd(el) {
            el.classList.remove('dragging');
            document.querySelectorAll('.award-item.drag-over').forEach(item => item.classList.remove('drag-over'));
            draggedAwardId = null;
        }
