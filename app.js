        /**
         * INITIALIZATION
         */
	        window.addEventListener('DOMContentLoaded', () => {
	            createNewAward();
	            setupEditorInteractions();
	            setupPlayerHotkeys();
	            syncShowSettingsUI();
	            setPanelMode(editorPanelMode);
	            updatePanelMeta();
	            document.addEventListener('keydown', (e) => {
	                const modal = document.getElementById('overlayModal');
	                if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
	                    closeOverlayModal();
	                }
	            });
	        });


        /* --- UTILS --- */

        function showToast(msg) {
            const t = document.getElementById('toast');
            t.innerText = msg;
            t.classList.add('show');
            setTimeout(() => t.classList.remove('show'), 3000);
        }
