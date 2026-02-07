        /* --- OVERLAY EDITOR LOGIC --- */

        function ensureOverlays(award) {
            if (!award) return;
            if (Array.isArray(award.overlays)) {
                award.overlays = award.overlays.map((overlay, index) => normalizeOverlay(overlay, index));
                return;
            }
            award.overlays = getLegacyOverlays(award).map((overlay, index) => normalizeOverlay(overlay, index));
        }

        function updateOverlaySummary(award, target) {
            const countEl = document.getElementById('overlayCount');
            const previewEl = document.getElementById('overlayPreviewList');
            const modalMetaEl = document.getElementById('overlayModalMeta');
            if (!award || !target) {
                if (countEl) countEl.innerText = "No overlays yet.";
                if (previewEl) previewEl.innerHTML = '';
                if (modalMetaEl) modalMetaEl.innerText = "Select a slide to edit overlays.";
                return;
            }
            ensureOverlays(target);
            const count = target.overlays ? target.overlays.length : 0;
            if (countEl) countEl.innerText = count === 0 ? "No overlays yet." : `${count} overlay${count === 1 ? '' : 's'}`;
            if (previewEl) {
                previewEl.innerHTML = '';
                if (count > 0) {
                    const maxPreview = Math.min(count, 3);
                    for (let i = 0; i < maxPreview; i += 1) {
                        const overlay = target.overlays[i];
                        const plain = stripOverlayHtml(overlay?.html || "") || overlay?.text || "";
                        const label = plain.trim() ? plain.trim() : `Overlay ${i + 1}`;
                        const item = document.createElement('div');
                        item.className = 'overlay-preview-item';
                        item.innerHTML = `
                            <div class="overlay-preview-title">Overlay ${i + 1}</div>
                            <div>${escapeHtml(label.slice(0, 120))}${label.length > 120 ? '…' : ''}</div>
                        `;
                        previewEl.appendChild(item);
                    }
                }
            }
            if (modalMetaEl) {
                const title = award.title || (
                    award.slideType === 'photo'
                        ? 'Photo Slide'
                        : (award.slideType === 'title-card' ? 'Title Card' : 'Untitled')
                );
                let suffix = "";
                if (award.slideType === 'top3') {
                    suffix = ` • ${getTop3PlaceLabel(currentTop3Index, award)}`;
                }
                modalMetaEl.innerText = `${getSlideTypeLabel(award)}: ${title}${suffix}`;
            }
        }

        function renderOverlayList() {
            const container = document.getElementById('overlayList');
            const award = getCurrentAward();
            const target = getCurrentMediaTarget();
            updateOverlaySummary(award, target);
            if (!container) return;
            container.innerHTML = '';
            if (!award || !target) return;
            ensureOverlays(target);

            if (!target.overlays || target.overlays.length === 0) {
                const empty = document.createElement('div');
                empty.className = 'overlay-empty';
                empty.innerText = 'No overlays yet.';
                container.appendChild(empty);
                return;
            }

            target.overlays.forEach((overlay) => {
                const item = document.createElement('div');
                item.className = 'overlay-item';
                const editorId = `overlay-edit-${overlay.id}`;
                const alignOptions = ['left', 'center', 'right'];
                const editorHtml = sanitizeOverlayHtml(overlay.html || htmlFromText(overlay.text || ""));
                item.innerHTML = `
                    <div class="overlay-item-row">
                        <div class="overlay-toolbar">
                            <button type="button" onmousedown="event.preventDefault()" onclick="applyOverlayCommand('${overlay.id}', 'bold')">Bold</button>
                            <button type="button" onmousedown="event.preventDefault()" onclick="applyOverlayCommand('${overlay.id}', 'italic')">Italic</button>
                            <button type="button" onmousedown="event.preventDefault()" onclick="applyOverlayCommand('${overlay.id}', 'underline')">Underline</button>
                            <button type="button" onmousedown="event.preventDefault()" onclick="applyOverlayCommand('${overlay.id}', 'insertUnorderedList')">Bullets</button>
                            <button type="button" onmousedown="event.preventDefault()" onclick="applyOverlayCommand('${overlay.id}', 'insertOrderedList')">Numbered</button>
                            <button type="button" onmousedown="event.preventDefault()" onclick="applyOverlayCommand('${overlay.id}', 'formatBlock', 'p')">Paragraph</button>
                            <button type="button" onmousedown="event.preventDefault()" onclick="clearOverlayFormatting('${overlay.id}')">Clear</button>
                        </div>
                        <div class="overlay-item-actions">
                            <button type="button" class="btn-mini" onclick="duplicateOverlay('${overlay.id}')">Duplicate</button>
                            <button type="button" class="btn-mini" onclick="moveOverlay('${overlay.id}', -1)">Up</button>
                            <button type="button" class="btn-mini" onclick="moveOverlay('${overlay.id}', 1)">Down</button>
                        </div>
                        <button class="btn-icon delete-btn" style="position: static; opacity: 1;" onclick="removeOverlay('${overlay.id}')">×</button>
                    </div>
                    <div class="overlay-item-row">
                        <div id="${editorId}" class="overlay-editor" contenteditable="true" data-placeholder="Overlay text" oninput="updateOverlayField('${overlay.id}', 'html', this)" onblur="sanitizeOverlayEditor('${overlay.id}')" onkeyup="saveOverlaySelection('${overlay.id}')" onmouseup="saveOverlaySelection('${overlay.id}')">${editorHtml}</div>
                    </div>
                    <div class="overlay-item-row">
                        <div style="flex:1;">
                            <span class="overlay-item-label">Delay (s)</span>
                            <input type="number" min="0" max="10" step="0.5" value="${overlay.delay ?? 0}" oninput="updateOverlayField('${overlay.id}', 'delay', this)">
                            <div class="overlay-nudge">
                                <button type="button" class="btn-mini" onclick="nudgeOverlayField('${overlay.id}', 'delay', -0.1)">-0.1</button>
                                <button type="button" class="btn-mini" onclick="nudgeOverlayField('${overlay.id}', 'delay', 0.1)">+0.1</button>
                            </div>
                        </div>
                        <div style="flex:1;">
                            <span class="overlay-item-label">Duration (s)</span>
                            <input type="number" min="0" max="10" step="0.5" value="${overlay.duration ?? 3}" oninput="updateOverlayField('${overlay.id}', 'duration', this)">
                            <div class="overlay-nudge">
                                <button type="button" class="btn-mini" onclick="nudgeOverlayField('${overlay.id}', 'duration', -0.1)">-0.1</button>
                                <button type="button" class="btn-mini" onclick="nudgeOverlayField('${overlay.id}', 'duration', 0.1)">+0.1</button>
                            </div>
                        </div>
                        <div style="flex:1;">
                            <span class="overlay-item-label">Effect</span>
                            <select oninput="updateOverlayField('${overlay.id}', 'effect', this)">
                                ${overlayEffectOptions.map(effect => {
                                    const label = effect.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                                    return `<option value="${effect}" ${overlay.effect === effect ? 'selected' : ''}>${label}</option>`;
                                }).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="overlay-item-row">
                        <div style="flex:1;">
                            <span class="overlay-item-label">Size (rem)</span>
                            <input type="number" min="0.6" max="6" step="0.1" value="${overlay.fontSize ?? 2.2}" oninput="updateOverlayField('${overlay.id}', 'fontSize', this)">
                        </div>
                        <div style="flex:1;">
                            <span class="overlay-item-label">Align</span>
                            <select oninput="updateOverlayField('${overlay.id}', 'align', this)">
                                ${alignOptions.map(opt => `<option value="${opt}" ${overlay.align === opt ? 'selected' : ''}>${opt.toUpperCase()}</option>`).join('')}
                            </select>
                        </div>
                        <div style="flex:1;">
                            <span class="overlay-item-label">Max Width (%)</span>
                            <input type="number" min="40" max="100" step="1" value="${overlay.maxWidth ?? 90}" oninput="updateOverlayField('${overlay.id}', 'maxWidth', this)">
                        </div>
                    </div>
                    <div class="overlay-item-row">
                        <div style="flex:1;">
                            <span class="overlay-item-label">Text Color</span>
                            <input type="color" value="${overlay.textColor || '#ffffff'}" oninput="updateOverlayField('${overlay.id}', 'textColor', this)">
                        </div>
                        <div style="flex:1;">
                            <span class="overlay-item-label">Background Color</span>
                            <input type="color" value="${overlay.backgroundColor || '#000000'}" oninput="updateOverlayField('${overlay.id}', 'backgroundColor', this)">
                        </div>
                        <div style="flex:1;">
                            <span class="overlay-item-label">Background</span>
                            <label class="overlay-item-toggle">
                                <input type="checkbox" ${overlay.background !== false ? 'checked' : ''} onchange="updateOverlayField('${overlay.id}', 'background', this)">
                                Enable
                            </label>
                        </div>
                    </div>
                    <details class="overlay-advanced">
                        <summary>Advanced Options</summary>
                        <div class="overlay-advanced-body">
                            <div class="overlay-item-row">
                                <div style="flex:1;">
                                    <span class="overlay-item-label">BG Opacity</span>
                                    <input type="number" min="0" max="1" step="0.05" value="${overlay.backgroundOpacity ?? 0.45}" oninput="updateOverlayField('${overlay.id}', 'backgroundOpacity', this)">
                                </div>
                                <div style="flex:1;">
                                    <span class="overlay-item-label">Line Height</span>
                                    <input type="number" min="0.8" max="2.4" step="0.05" value="${overlay.lineHeight ?? 1.15}" oninput="updateOverlayField('${overlay.id}', 'lineHeight', this)">
                                </div>
                                <div style="flex:1;">
                                    <span class="overlay-item-label">Glow</span>
                                    <input type="number" min="0" max="1" step="0.05" value="${overlay.glowStrength ?? 0.6}" oninput="updateOverlayField('${overlay.id}', 'glowStrength', this)">
                                </div>
                                <label class="overlay-item-toggle">
                                    <input type="checkbox" ${overlay.glowCinematic !== false ? 'checked' : ''} onchange="updateOverlayField('${overlay.id}', 'glowCinematic', this)">
                                    Cinematic Glow
                                </label>
                            </div>
                            <div class="overlay-item-row">
                                <div style="flex:1;">
                                    <span class="overlay-item-label">Pad X (px)</span>
                                    <input type="number" min="0" max="80" step="1" value="${overlay.paddingX ?? 18}" oninput="updateOverlayField('${overlay.id}', 'paddingX', this)">
                                </div>
                                <div style="flex:1;">
                                    <span class="overlay-item-label">Pad Y (px)</span>
                                    <input type="number" min="0" max="80" step="1" value="${overlay.paddingY ?? 10}" oninput="updateOverlayField('${overlay.id}', 'paddingY', this)">
                                </div>
                                <div style="flex:1;">
                                    <span class="overlay-item-label">Radius (px)</span>
                                    <input type="number" min="0" max="40" step="1" value="${overlay.radius ?? 6}" oninput="updateOverlayField('${overlay.id}', 'radius', this)">
                                </div>
                            </div>
                            <div class="overlay-item-row">
                                <div style="flex:1;">
                                    <span class="overlay-item-label">Backdrop Blur</span>
                                    <input type="number" min="0" max="20" step="1" value="${overlay.backdropBlur ?? 4}" oninput="updateOverlayField('${overlay.id}', 'backdropBlur', this)">
                                </div>
                                <div style="flex:1;">
                                    <span class="overlay-item-label">Layer (Z)</span>
                                    <input type="number" min="0" max="100" step="1" value="${overlay.zIndex ?? 10}" oninput="updateOverlayField('${overlay.id}', 'zIndex', this)">
                                </div>
                            </div>
                            <div class="overlay-item-row">
                                <div style="flex:1;">
                                    <span class="overlay-item-label">Vertical</span>
                                    <select oninput="updateOverlayField('${overlay.id}', 'positionY', this)">
                                        ${['top','middle','bottom'].map(opt => `<option value="${opt}" ${overlay.positionY === opt ? 'selected' : ''}>${opt.toUpperCase()}</option>`).join('')}
                                    </select>
                                </div>
                                <div style="flex:1;">
                                    <span class="overlay-item-label">Horizontal</span>
                                    <select oninput="updateOverlayField('${overlay.id}', 'positionX', this)">
                                        ${['left','center','right'].map(opt => `<option value="${opt}" ${overlay.positionX === opt ? 'selected' : ''}>${opt.toUpperCase()}</option>`).join('')}
                                    </select>
                                </div>
                                <button type="button" class="btn-mini" onclick="startOverlayDrag('${overlay.id}')">Drag In Preview</button>
                            </div>
                            <div class="overlay-item-row">
                                <div style="flex:1;">
                                    <span class="overlay-item-label">Offset X (px)</span>
                                    <input type="number" id="overlay-offsetx-${overlay.id}" min="-500" max="500" step="1" value="${overlay.offsetX ?? 0}" oninput="updateOverlayField('${overlay.id}', 'offsetX', this)">
                                </div>
                                <div style="flex:1;">
                                    <span class="overlay-item-label">Offset Y (px)</span>
                                    <input type="number" id="overlay-offsety-${overlay.id}" min="-500" max="500" step="1" value="${overlay.offsetY ?? 0}" oninput="updateOverlayField('${overlay.id}', 'offsetY', this)">
                                </div>
                            </div>
                            <div class="overlay-item-row">
                                <div style="flex:1;">
                                    <span class="overlay-item-label">Effect Duration (s)</span>
                                    <input type="number" min="0" max="10" step="0.1" value="${overlay.effectDuration ?? 0.6}" oninput="updateOverlayField('${overlay.id}', 'effectDuration', this)">
                                    <div class="overlay-nudge">
                                        <button type="button" class="btn-mini" onclick="nudgeOverlayField('${overlay.id}', 'effectDuration', -0.1)">-0.1</button>
                                        <button type="button" class="btn-mini" onclick="nudgeOverlayField('${overlay.id}', 'effectDuration', 0.1)">+0.1</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </details>
                `;
                container.appendChild(item);
            });

            if (overlayDragState.active) {
                updateOverlayDragGhost();
            }
        }

        function openOverlayModal() {
            const award = getCurrentAward();
            if (!award) {
                showToast("Select a slide to edit overlays.");
                return;
            }
            const modal = document.getElementById('overlayModal');
            if (!modal) return;
            renderOverlayList();
            modal.classList.remove('hidden');
            modal.setAttribute('aria-hidden', 'false');
        }

        function closeOverlayModal() {
            const modal = document.getElementById('overlayModal');
            if (!modal) return;
            modal.classList.add('hidden');
            modal.setAttribute('aria-hidden', 'true');
        }

        function addOverlay() {
            const target = getCurrentMediaTarget();
            if (!target) return;
            ensureOverlays(target);
            const overlay = buildDefaultOverlay(generateId());
            target.overlays.push(overlay);
            renderOverlayList();
            openOverlayModal();
        }

        function removeOverlay(id) {
            const target = getCurrentMediaTarget();
            if (!target || !Array.isArray(target.overlays)) return;
            target.overlays = target.overlays.filter(overlay => overlay.id !== id);
            renderOverlayList();
        }

        function duplicateOverlay(id) {
            const target = getCurrentMediaTarget();
            if (!target || !Array.isArray(target.overlays)) return;
            const index = target.overlays.findIndex(overlay => overlay.id === id);
            if (index === -1) return;
            const source = target.overlays[index];
            const clone = { ...source, id: generateId() };
            target.overlays.splice(index + 1, 0, clone);
            renderOverlayList();
        }

        function moveOverlay(id, direction) {
            const target = getCurrentMediaTarget();
            if (!target || !Array.isArray(target.overlays)) return;
            const index = target.overlays.findIndex(overlay => overlay.id === id);
            if (index === -1) return;
            const nextIndex = clampNumber(index + direction, 0, target.overlays.length - 1);
            if (nextIndex === index) return;
            const [moved] = target.overlays.splice(index, 1);
            target.overlays.splice(nextIndex, 0, moved);
            renderOverlayList();
        }

        function updateOverlayField(id, key, inputEl) {
            const target = getCurrentMediaTarget();
            if (!target || !Array.isArray(target.overlays)) return;
            const overlay = target.overlays.find(item => item.id === id);
            if (!overlay) return;

            if (key === 'text') {
                overlay.text = inputEl.value;
                return;
            }

            if (key === 'html') {
                const raw = inputEl.innerHTML || "";
                overlay.html = raw;
                overlay.text = stripOverlayHtml(raw);
                return;
            }

            if (key === 'delay') {
                const value = clampNumber(parseFloat(inputEl.value) || 0, 0, 10);
                overlay.delay = value;
                inputEl.value = value;
                return;
            }

            if (key === 'duration') {
                const value = clampNumber(parseFloat(inputEl.value) || 0, 0, 10);
                overlay.duration = value;
                inputEl.value = value;
                return;
            }

            if (key === 'effectDuration') {
                const value = clampNumber(parseFloat(inputEl.value) || 0, 0, 10);
                overlay.effectDuration = value;
                inputEl.value = value;
                return;
            }

            if (key === 'textColor') {
                overlay.textColor = inputEl.value || '#ffffff';
                return;
            }

            if (key === 'backgroundColor') {
                overlay.backgroundColor = inputEl.value || '#000000';
                return;
            }

            if (key === 'backgroundOpacity') {
                const value = clampNumber(parseFloat(inputEl.value) || 0, 0, 1);
                overlay.backgroundOpacity = value;
                inputEl.value = value;
                return;
            }

            if (key === 'fontSize') {
                const value = clampNumber(parseFloat(inputEl.value) || 2.2, 0.6, 6);
                overlay.fontSize = value;
                inputEl.value = value;
                return;
            }

            if (key === 'lineHeight') {
                const value = clampNumber(parseFloat(inputEl.value) || 1.15, 0.8, 2.4);
                overlay.lineHeight = value;
                inputEl.value = value;
                return;
            }

            if (key === 'align') {
                overlay.align = ['left', 'center', 'right'].includes(inputEl.value) ? inputEl.value : 'center';
                return;
            }

            if (key === 'maxWidth') {
                const value = clampNumber(parseFloat(inputEl.value) || 90, 40, 100);
                overlay.maxWidth = value;
                inputEl.value = value;
                return;
            }

            if (key === 'glowStrength') {
                const value = clampNumber(parseFloat(inputEl.value) || 0, 0, 1);
                overlay.glowStrength = value;
                inputEl.value = value;
                return;
            }

            if (key === 'paddingX') {
                const value = clampNumber(parseFloat(inputEl.value) || 0, 0, 80);
                overlay.paddingX = value;
                inputEl.value = value;
                return;
            }

            if (key === 'paddingY') {
                const value = clampNumber(parseFloat(inputEl.value) || 0, 0, 80);
                overlay.paddingY = value;
                inputEl.value = value;
                return;
            }

            if (key === 'radius') {
                const value = clampNumber(parseFloat(inputEl.value) || 0, 0, 40);
                overlay.radius = value;
                inputEl.value = value;
                return;
            }

            if (key === 'backdropBlur') {
                const value = clampNumber(parseFloat(inputEl.value) || 0, 0, 20);
                overlay.backdropBlur = value;
                inputEl.value = value;
                return;
            }

            if (key === 'zIndex') {
                const value = clampNumber(parseFloat(inputEl.value) || 0, 0, 100);
                overlay.zIndex = value;
                inputEl.value = value;
                return;
            }

            if (key === 'glowCinematic') {
                overlay.glowCinematic = !!inputEl.checked;
                return;
            }

            if (key === 'positionX') {
                overlay.positionX = ['left', 'center', 'right'].includes(inputEl.value) ? inputEl.value : 'center';
                updateOverlayDragGhost();
                return;
            }

            if (key === 'positionY') {
                overlay.positionY = ['top', 'middle', 'bottom'].includes(inputEl.value) ? inputEl.value : 'bottom';
                updateOverlayDragGhost();
                return;
            }

            if (key === 'offsetX') {
                const value = clampNumber(parseFloat(inputEl.value) || 0, -500, 500);
                overlay.offsetX = value;
                inputEl.value = value;
                updateOverlayDragGhost();
                return;
            }

            if (key === 'offsetY') {
                const value = clampNumber(parseFloat(inputEl.value) || 0, -500, 500);
                overlay.offsetY = value;
                inputEl.value = value;
                updateOverlayDragGhost();
                return;
            }

            if (key === 'effect') {
                overlay.effect = overlayEffectOptions.includes(inputEl.value) ? inputEl.value : 'fade';
                return;
            }

            if (key === 'background') {
                overlay.background = !!inputEl.checked;
            }
        }

        function applyOverlayCommand(id, command, value) {
            const editor = document.getElementById(`overlay-edit-${id}`);
            if (!editor) return;
            restoreOverlaySelection(id);
            editor.focus();
            if (command === 'formatBlock') {
                document.execCommand(command, false, value || 'p');
            } else {
                document.execCommand(command, false, value);
            }
            updateOverlayField(id, 'html', editor);
        }

        function clearOverlayFormatting(id) {
            const editor = document.getElementById(`overlay-edit-${id}`);
            if (!editor) return;
            const text = stripOverlayHtml(editor.innerHTML || "");
            editor.innerHTML = htmlFromText(text);
            updateOverlayField(id, 'html', editor);
        }

        function sanitizeOverlayEditor(id) {
            const editor = document.getElementById(`overlay-edit-${id}`);
            if (!editor) return;
            const cleaned = sanitizeOverlayHtml(editor.innerHTML || "");
            editor.innerHTML = cleaned;
            updateOverlayField(id, 'html', editor);
        }

        const overlaySelections = new Map();

        function saveOverlaySelection(id) {
            const editor = document.getElementById(`overlay-edit-${id}`);
            if (!editor) return;
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;
            const range = selection.getRangeAt(0);
            if (!editor.contains(range.commonAncestorContainer)) return;
            overlaySelections.set(id, range);
        }

        function restoreOverlaySelection(id) {
            const range = overlaySelections.get(id);
            const editor = document.getElementById(`overlay-edit-${id}`);
            if (!editor || !range) return;
            if (!editor.contains(range.commonAncestorContainer)) return;
            const selection = window.getSelection();
            if (!selection) return;
            selection.removeAllRanges();
            try {
                selection.addRange(range);
            } catch {
                // Range is stale; ignore.
            }
        }

        function nudgeOverlayField(id, key, delta) {
            const target = getCurrentMediaTarget();
            if (!target || !Array.isArray(target.overlays)) return;
            const overlay = target.overlays.find(item => item.id === id);
            if (!overlay) return;
            const current = Number(overlay[key]) || 0;
            const next = current + delta;
            if (key === 'delay' || key === 'duration' || key === 'effectDuration') {
                overlay[key] = clampNumber(next, 0, 10);
            } else {
                overlay[key] = next;
            }
            renderOverlayList();
        }

        let overlayDragState = {
            id: null,
            active: false,
            dragging: false,
            startX: 0,
            startY: 0,
            baseOffsetX: 0,
            baseOffsetY: 0
        };

        function startOverlayDrag(id) {
            if (overlayDragState.active && overlayDragState.id === id) {
                stopOverlayDrag();
                return;
            }
            closeOverlayModal();
            overlayDragState.id = id;
            overlayDragState.active = true;
            overlayDragState.dragging = false;
            updateOverlayDragGhost();
            const ghost = document.getElementById('overlayDragGhost');
            if (!ghost) return;
            ghost.classList.add('active');
            showToast("Drag the overlay ghost in preview to reposition. Click 'Drag In Preview' again to stop.");
            ghost.onmousedown = (e) => {
                const overlay = getCurrentOverlayById(id);
                if (!overlay) return;
                overlayDragState.dragging = true;
                overlayDragState.startX = e.clientX;
                overlayDragState.startY = e.clientY;
                overlayDragState.baseOffsetX = Number(overlay.offsetX) || 0;
                overlayDragState.baseOffsetY = Number(overlay.offsetY) || 0;
                e.preventDefault();
            };
            document.addEventListener('mousemove', onOverlayDragMove);
            document.addEventListener('mouseup', onOverlayDragEnd);
        }

        function stopOverlayDrag() {
            overlayDragState.active = false;
            overlayDragState.dragging = false;
            overlayDragState.id = null;
            const ghost = document.getElementById('overlayDragGhost');
            if (ghost) {
                ghost.classList.remove('active');
                ghost.onmousedown = null;
            }
            document.removeEventListener('mousemove', onOverlayDragMove);
            document.removeEventListener('mouseup', onOverlayDragEnd);
        }

        function getCurrentOverlayById(id) {
            const target = getCurrentMediaTarget();
            if (!target || !Array.isArray(target.overlays)) return null;
            return target.overlays.find(item => item.id === id);
        }

        function onOverlayDragMove(e) {
            if (!overlayDragState.active || !overlayDragState.dragging) return;
            const overlay = getCurrentOverlayById(overlayDragState.id);
            if (!overlay) return;
            const dx = e.clientX - overlayDragState.startX;
            const dy = e.clientY - overlayDragState.startY;
            overlay.offsetX = clampNumber(overlayDragState.baseOffsetX + dx, -500, 500);
            overlay.offsetY = clampNumber(overlayDragState.baseOffsetY + dy, -500, 500);
            const inputX = document.getElementById(`overlay-offsetx-${overlay.id}`);
            const inputY = document.getElementById(`overlay-offsety-${overlay.id}`);
            if (inputX) inputX.value = overlay.offsetX;
            if (inputY) inputY.value = overlay.offsetY;
            updateOverlayDragGhost();
        }

        function onOverlayDragEnd() {
            if (!overlayDragState.active) return;
            overlayDragState.dragging = false;
        }

        function updateOverlayDragGhost() {
            if (!overlayDragState.active) return;
            const overlay = getCurrentOverlayById(overlayDragState.id);
            const ghost = document.getElementById('overlayDragGhost');
            if (!overlay || !ghost) return;
            const displayHtml = sanitizeOverlayHtml(overlay.html || htmlFromText(overlay.text || 'Overlay'));
            ghost.innerHTML = displayHtml || 'Overlay';
            const positionX = overlay.positionX || 'center';
            const positionY = overlay.positionY || 'bottom';
            const baseX = positionX === 'left' ? 12 : (positionX === 'right' ? 88 : 50);
            const baseY = positionY === 'top' ? 15 : (positionY === 'bottom' ? 85 : 50);
            const anchorX = positionX === 'left' ? 0 : (positionX === 'right' ? -100 : -50);
            const anchorY = positionY === 'top' ? 0 : (positionY === 'bottom' ? -100 : -50);
            const offsetX = Number(overlay.offsetX) || 0;
            const offsetY = Number(overlay.offsetY) || 0;
            ghost.style.left = `${baseX}%`;
            ghost.style.top = `${baseY}%`;
            ghost.style.transform = `translate(${anchorX}%, ${anchorY}%) translate(${offsetX}px, ${offsetY}px)`;
        }
