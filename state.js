        /**
         * APPLICATION STATE
         */
        let awards = [];
        let currentAwardId = null;
        let currentTop3Index = 0;
        const TOP3_MIN = 2;
        const TOP3_MAX = 10;
        const defaultShowSettings = {
            startMenu: false,
            exportStartTitle: "Start Show",
            exportStartButton: "Start Show",
            themePreset: "classic-gold",
            stageStyle: "solid",
            accentColor: "",
            stageColor: "",
            typePreset: "classic",
            titleFont: "Montserrat",
            subtitleFont: "Montserrat",
            winnerFont: "Montserrat",
            titleSize: 3.5,
            winnerSize: 3.5,
            categorySize: 1,
            sublineSize: 1,
            categoryTracking: 4,
            titleTracking: 0,
            largeType: false,
            holdOnBlack: true,
            revealDelayAward: 0.9,
            revealDelayPhoto: 0,
            revealDelayTop: 0.6,
            fadeDurationAward: 1.5,
            fadeDurationPhoto: 1.5,
            fadeDurationTop: 1.2,
            autoAdvance: false,
            autoAdvanceAward: 6,
            autoAdvancePhoto: 6,
            autoAdvanceTopStep: 3,
            soundEnabled: false,
            soundOnReveal: true,
            soundOnAdvance: false,
            soundStyle: "soft"
        };
        let showSettings = { ...defaultShowSettings };
        let previewRestore = null;
        let previewMode = false;
        let editorPanelMode = 'slide';

        const overlayEffectOptions = [
            "fade",
            "slide-up",
            "slide-down",
            "slide-left",
            "slide-right",
            "zoom",
            "blur",
            "rise",
            "pop",
            "typewriter",
            "word-reveal"
        ];
        const fixateEasingOptions = [
            "ease-out",
            "ease-in-out",
            "ease-in",
            "linear",
            "cubic-bezier(0.2, 0.8, 0.2, 1)"
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

        // Player State
        let playerState = {
            currentIndex: 0,
            phase: 'intro', // 'intro', 'revealing', 'revealed'
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
        let overlayTimeouts = [];
        let overlayIntervals = [];
        let autoAdvanceTimer = null;

        // Editor Viewport State (Panning/Zooming)
        let editorTransform = { x: 0, y: 0, scale: 1 };
        let isDragging = false;
        let startX, startY;
        let dragStartClientX = 0;
        let dragStartClientY = 0;
        let dragMoved = false;

