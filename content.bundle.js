(() => {
  // content.styles.js
  var THEME_COLORS2 = window.THEME_COLORS || {
    primary: "#3674B5",
    primaryGradientStart: "#3674B5",
    primaryGradientEnd: "#578FCA",
    hoverPrimary: "#205295",
    darkBackground: "#0A2647",
    lightBackground: "#F7FAFC",
    darkBorder: "#144272",
    lightBorder: "#E2E8F0",
    darkShadow: "0 4px 20px rgba(0,0,0,0.3)",
    lightShadow: "0 4px 20px rgba(0,0,0,0.15)",
    inputDarkBorder: "1px solid #4A5568",
    inputLightBorder: "1px solid #CBD5E0",
    inputDarkBg: "#2D3748",
    inputLightBg: "#FFFFFF",
    inputDarkText: "#E2E8F0",
    inputLightText: "#2D3748"
  };
  window.THEME_COLORS = THEME_COLORS2;
  var UI_STYLES2 = window.UI_STYLES || {
    getPromptButtonContainerStyle: (pos) => ({
      position: "fixed",
      zIndex: "9999",
      bottom: `${pos.y}px`,
      right: `${pos.x}px`,
      width: "64px",
      height: "64px",
      userSelect: "none"
    }),
    hotCornerActiveZone: {
      position: "fixed",
      bottom: "0",
      right: "0",
      width: "60px",
      height: "60px",
      zIndex: "9998",
      backgroundColor: "transparent"
    }
  };
  window.UI_STYLES = UI_STYLES2;
  var PROMPT_CLOSE_DELAY = typeof window.PROMPT_CLOSE_DELAY === "number" ? window.PROMPT_CLOSE_DELAY : 1e3;
  window.PROMPT_CLOSE_DELAY = PROMPT_CLOSE_DELAY;
  var SELECTORS2 = window.SELECTORS || {
    ROOT: "opm-root",
    PROMPT_BUTTON_CONTAINER: "opm-prompt-button-container",
    PROMPT_BUTTON: "opm-prompt-button",
    PROMPT_LIST: "opm-prompt-list",
    PANEL_CONTENT: "opm-panel-content",
    PROMPT_SEARCH_INPUT: "opm-prompt-search-input",
    PROMPT_ITEMS_CONTAINER: "opm-prompt-items-container",
    ONBOARDING_POPUP: "opm-onboarding-popup",
    HOT_CORNER_CONTAINER: "opm-hot-corner-container",
    HOT_CORNER_INDICATOR: "opm-hot-corner-indicator",
    INFO_CONTENT: "opm-info-content"
  };
  window.SELECTORS = SELECTORS2;
  var injectGlobalStyles2 = window.injectGlobalStyles || function injectGlobalStyles3() {
    const styleEl = document.createElement("style");
    styleEl.textContent = `
    #${SELECTORS2.ROOT} {
      --primary: ${THEME_COLORS2.primary};
      --primary-gradient-start: ${THEME_COLORS2.primaryGradientStart};
      --primary-gradient-end: ${THEME_COLORS2.primaryGradientEnd};
      --hover-primary: ${THEME_COLORS2.hoverPrimary};
      --dark-bg: ${THEME_COLORS2.darkBackground};
      --light-bg: ${THEME_COLORS2.lightBackground};
      --dark-border: ${THEME_COLORS2.darkBorder};
      --light-border: ${THEME_COLORS2.lightBorder};
      --dark-shadow: ${THEME_COLORS2.darkShadow};
      --light-shadow: ${THEME_COLORS2.lightShadow};
      --input-dark-border: ${THEME_COLORS2.inputDarkBorder};
      --input-light-border: ${THEME_COLORS2.inputLightBorder};
      --input-dark-bg: ${THEME_COLORS2.inputDarkBg};
      --input-light-bg: ${THEME_COLORS2.inputLightBg};
      --input-dark-text: ${THEME_COLORS2.inputDarkText};
      --input-light-text: ${THEME_COLORS2.inputLightText};
      --transition-speed: 0.3s;
      --border-radius: 8px;
      --font-family: 'Roboto', sans-serif;
    }
    
    /* COMMENT: Scrollbars remain hidden until ScrollVisibilityManager marks activity */
    #${SELECTORS2.ROOT} .opm-scrollable {
      scrollbar-width: none;
      scrollbar-color: transparent transparent;
    }
    #${SELECTORS2.ROOT} .opm-scrollable::-webkit-scrollbar {
      width: 0;
      height: 0;
      background: transparent;
    }
    #${SELECTORS2.ROOT} .opm-scrollable.opm-scroll-active {
      scrollbar-width: auto !important;
      scrollbar-color: ${THEME_COLORS2.primary}90 transparent !important;
    }
    #${SELECTORS2.ROOT} .opm-scrollable.opm-scroll-active::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    #${SELECTORS2.ROOT} .opm-scrollable.opm-scroll-active::-webkit-scrollbar-thumb {
      background-color: ${THEME_COLORS2.primary}90;
      border-radius: 8px;
    }
    #${SELECTORS2.ROOT} .opm-scrollable.opm-scroll-active::-webkit-scrollbar-track {
      background: transparent;
    }
    /* COMMENT: Horizontal tags bar uses a shorter scrollbar when active */
    #${SELECTORS2.ROOT} .opm-tags-filter-bar.opm-scroll-active::-webkit-scrollbar {
      height: 8px;
    }
    
    #${SELECTORS2.ROOT}, #${SELECTORS2.ROOT} * { font-family: var(--font-family); }
    /* Prompt Button styling */
    #${SELECTORS2.ROOT} .opm-prompt-button {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: none;
      outline: none;
      cursor: pointer;
      background: linear-gradient(135deg, var(--primary-gradient-start), var(--primary-gradient-end));
      background-size: cover;
      box-shadow: var(--light-shadow);
      transition: transform var(--transition-speed) ease, box-shadow var(--transition-speed) ease;
      background-position: center;
      background-repeat: no-repeat;
      position: relative;
    }
    
    /* Toggle switch styling */
    #${SELECTORS2.ROOT} .opm-toggle-switch {
      position: relative;
      width: 40px;
      height: 20px;
      border-radius: 10px;
      cursor: pointer;
      transition: background-color var(--transition-speed) ease;
    }
    
    #${SELECTORS2.ROOT} .opm-toggle-switch.opm-light {
      background-color: #cbd5e0;
    }
    
    #${SELECTORS2.ROOT} .opm-toggle-switch.opm-dark {
      background-color: #4a5568;
    }
    
    #${SELECTORS2.ROOT} .opm-toggle-switch.active.opm-light {
      background-color: var(--primary);
    }
    
    #${SELECTORS2.ROOT} .opm-toggle-switch.active.opm-dark {
      background-color: var(--primary);
    }
    
    #${SELECTORS2.ROOT} .opm-toggle-switch::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background-color: #fff;
      transition: transform var(--transition-speed) ease;
    }
    
    #${SELECTORS2.ROOT} .opm-toggle-switch.active::after {
      transform: translateX(20px);
    }
    
    /* Prompt Button styling */
    #${SELECTORS2.ROOT} .opm-prompt-button::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url('${chrome.runtime.getURL("icon-nocircle.svg")}');
      background-size: 90%;
      background-position: center;
      background-repeat: no-repeat;
    }
    #${SELECTORS2.ROOT} .opm-prompt-button:hover {
      transform: scale(1.05);
      box-shadow: var(--dark-shadow);
    }
    /* Prompt list container styling */
    #${SELECTORS2.ROOT} .opm-prompt-list {
      position: absolute;
      bottom: 50px;
      right: 0;
      padding: 10px;
      border-radius: var(--border-radius);
      display: none;
      width: 280px;
      z-index: 10000;
      opacity: 0;
      transform: translateY(10px);
      transition: opacity var(--transition-speed) ease, transform var(--transition-speed) ease;
      backdrop-filter: blur(12px);
      /* Constrain panel and let inner list scroll. The main scroll must be inside items, not the whole panel. */
      display: flex;
      flex-direction: column;
      min-height: 450px;
      max-height: 450px;
      overflow: hidden; /* prevent bottom menu from being pushed outside */
    }
    /* Dedicated scrollable content container inside the panel */
    #${SELECTORS2.ROOT} #${SELECTORS2.PANEL_CONTENT} {
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden; /* keep scroll limited to items container */
      position: relative; /* anchor bottom menu absolutely inside */
      padding-bottom: 10px; /* reserve space for bottom menu; ensure last item fully visible above it */
      display: flex; /* allow children (list items container or forms) to flex */
      flex-direction: column;
      padding-bottom: 64px; /* COMMENT: increase reserved space to avoid overlap with bottom menu */
    }
    #${SELECTORS2.ROOT} .opm-prompt-list.opm-visible {
      opacity: 1;
      transform: translateY(0);
    }
    #${SELECTORS2.ROOT} .opm-prompt-list.opm-light {
      background-color: var(--light-bg);
      border: 1px solid var(--light-border);
      box-shadow: var(--light-shadow);
    }
    #${SELECTORS2.ROOT} .opm-prompt-list.opm-dark {
      background-color: var(--dark-bg);
      border: 1px solid var(--dark-border);
      box-shadow: var(--dark-shadow);
    }
    /* Height modes: fixed (non-list views) vs variable (list view) */
    #${SELECTORS2.ROOT} .opm-prompt-list.opm-fixed-400 {
      min-height: 400px;
      max-height: 400px;
    }
    #${SELECTORS2.ROOT} .opm-prompt-list.opm-variable {
      height: auto;
      min-height: 0;
      max-height: 400px;
    }
    /* List Items styled as modern cards */
    #${SELECTORS2.ROOT} .opm-prompt-list-items {
      max-height: 350px;
      overflow-y: auto;
      margin-bottom: 8px;
      padding-top: 4px;
      padding-bottom: 24px; /* COMMENT: extra space so the last item is not obscured by bottom menu */
      flex: 1 1 auto; /* ensure items take available space and scroll internally */
    }
    #${SELECTORS2.ROOT} .opm-prompt-list-items.opm-light {
      background-color: var(--light-bg);
    }
    #${SELECTORS2.ROOT} .opm-prompt-list-items.opm-dark {
      background-color: var(--dark-bg);
    }
    /* Tags filter bar (LIST view only) */
    #${SELECTORS2.ROOT} .opm-tags-filter-bar {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 6px;
      overflow-x: auto;
      overflow-y: hidden;
      white-space: nowrap;
      padding: 6px 8px;
      border-bottom: 1px solid rgba(0,0,0,0.08);
      min-height: 34px; /* fixed height impact so panel doesn\u2019t jump */
      box-sizing: border-box;
      flex: none; /* don\u2019t grow/shrink; keep list area stable */
    }
    #${SELECTORS2.ROOT}.opm-dark .opm-tags-filter-bar { border-bottom-color: rgba(255,255,255,0.12); }
    #${SELECTORS2.ROOT} .opm-tag-pill-filter {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px 10px;
      border-radius: 9999px;
      border: 1px solid var(--light-border);
      font-size: 13px;
      cursor: pointer;
      flex: 0 0 auto;
      user-select: none;
      background-color: #FFFFFF;
      color: var(--input-light-text);
    }
    #${SELECTORS2.ROOT}.opm-dark .opm-tag-pill-filter {
      border-color: var(--dark-border);
      background-color: #144272;
      color: var(--input-dark-text);
    }
    /* Selected state for tag pill */
    #${SELECTORS2.ROOT} .opm-tag-pill-filter[aria-pressed="true"] {
      background-color: #E6F0FF;
      border-color: #BBD3FF;
    }
    #${SELECTORS2.ROOT}.opm-dark .opm-tag-pill-filter[aria-pressed="true"] {
      background-color: #2E3A4E;
      border-color: #3E4C66;
    }
    /* Generic text colors for common containers */
    #${SELECTORS2.ROOT} .opm-form-container.opm-light { color: var(--input-light-text); }
    #${SELECTORS2.ROOT} .opm-form-container.opm-dark { color: var(--input-dark-text); }
    /* Tighter spacing only for prompt creation form */
    #${SELECTORS2.ROOT} .opm-create-form { gap: 4px !important; }
    /* Let textarea fields expand to available space in forms */
    #${SELECTORS2.ROOT} .opm-form-container {
      display: flex;
      flex-direction: column;
      min-height: 0; /* allow children to flex within constrained parent */
      flex: 1 1 auto; /* fill remaining height in panel content */
      overflow-y: auto; /* scroll form if content is taller */
      padding-bottom: 0px; /* keep save buttons above sticky bottom menu */
    }
    #${SELECTORS2.ROOT} .opm-form-container .opm-textarea-field {
      flex: 1 1 auto;
      min-height: 0;
      resize: vertical;
    }
    #${SELECTORS2.ROOT} .opm-prompt-list-item.opm-light { color: var(--input-light-text); }
    #${SELECTORS2.ROOT} .opm-prompt-list-item.opm-dark { color: var(--input-dark-text); }
    #${SELECTORS2.ROOT} .opm-prompt-list-item {
      border-radius: var(--border-radius);
      font-size: 14px;
      cursor: pointer;
      transition: background-color var(--transition-speed) ease, transform var(--transition-speed) ease;
      display: flex;
      align-items: center;
      padding: 6px 12px;
    }
    #${SELECTORS2.ROOT} .opm-prompt-list-item.opm-light:hover {
      background-color: #e2e8f0;
      transform: translateY(-2px);
    }
    #${SELECTORS2.ROOT} .opm-prompt-list-item.opm-dark:hover {
      background-color: #2d3748;
      transform: translateY(-2px);
    }
    /* Drag-and-drop placeholder to displace items during reordering */
    #${SELECTORS2.ROOT} .opm-drop-placeholder {
      border: 1px dashed var(--light-border);
      background-color: ${THEME_COLORS2.primary}14;
      border-radius: var(--border-radius);
      margin: 6px 0;
    }
    #${SELECTORS2.ROOT}.opm-dark .opm-drop-placeholder {
      border: 1px dashed var(--dark-border);
      background-color: ${THEME_COLORS2.primary}26;
    }
    /* Bottom menu styling: stick to bottom of the container */
    #${SELECTORS2.ROOT} .opm-bottom-menu {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 10px;
      border-top: 1px solid var(--light-border);
      flex: none;
      z-index: 1;
      background: transparent;
    }
    #${SELECTORS2.ROOT} .opm-bottom-menu.opm-light {
      background-color: var(--light-bg);
    }
    #${SELECTORS2.ROOT} .opm-bottom-menu.opm-dark {
      background-color: var(--dark-bg);
      border-top: 1px solid var(--dark-border);
    }
    /* Search input styling */
    #${SELECTORS2.ROOT} .opm-prompt-list .opm-search-input {
      width: 100%;
      padding: 8px;
      font-size: 14px;
      border-radius: 4px;
      box-sizing: border-box;
      height: 32px;
      line-height: 20px;
      outline: none;
      transition: border-color var(--transition-speed) ease, box-shadow var(--transition-speed) ease;
      display: none; /* initially hidden until Prompt Manager list opens */
    }
    #${SELECTORS2.ROOT} .opm-prompt-list .opm-search-input.opm-light {
      border: var(--input-light-border);
      background-color: var(--input-light-bg);
      color: var(--input-light-text);
    }
    #${SELECTORS2.ROOT} .opm-prompt-list .opm-search-input.opm-dark {
      border: var(--input-dark-border);
      background-color: var(--input-dark-bg);
      color: var(--input-dark-text);
    }
    /* Form fields styling */
    #${SELECTORS2.ROOT} .opm-input-field, #${SELECTORS2.ROOT} .opm-textarea-field {
      width: 100%;
      padding: 8px;
      border-radius: 6px;
      box-sizing: border-box;
      font-size: 14px;
      font-family: var(--font-family);
      color: var(--input-text);
      margin-bottom: 4px;
    }
    #${SELECTORS2.ROOT} .opm-input-field.opm-light {
      border: var(--input-light-border);
      background-color: var(--input-light-bg);
      color: var(--input-light-text);
    }
    #${SELECTORS2.ROOT} .opm-input-field.opm-dark {
      border: var(--input-dark-border);
      background-color: var(--input-dark-bg);
      color: var(--input-dark-text);
    }
    #${SELECTORS2.ROOT} .opm-textarea-field.opm-light {
      border: var(--input-light-border);
      background-color: var(--input-light-bg);
      color: var(--input-light-text);
      min-height: 120px;
      resize: vertical;
    }
    #${SELECTORS2.ROOT} .opm-textarea-field.opm-dark {
      border: var(--input-dark-border);
      background-color: var(--input-dark-bg);
      color: var(--input-dark-text);
      min-height: 120px;
      resize: vertical;
    }
    /* Button styling */
    #${SELECTORS2.ROOT} .opm-button {
      padding: 10px;
      width: 100%;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color var(--transition-speed) ease;
      color: #fff;
    }
    #${SELECTORS2.ROOT} .opm-button.opm-light {
      background-color: var(--primary);
    }
    #${SELECTORS2.ROOT} .opm-button.opm-dark {
      background-color: var(--hover-primary);
    }
    #${SELECTORS2.ROOT} .opm-button:hover {
      opacity: 0.9;
    }
    /* Icon button styling */
    #${SELECTORS2.ROOT} .opm-icon-button {
      width: 28px;
      height: 28px;
      padding: 6px;
      background-color: transparent;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color var(--transition-speed) ease;
    }
    #${SELECTORS2.ROOT} .opm-icon-button:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
    
    /* Make bottom menu icons white-ish in dark mode only */
    /* COMMENT: Force white-ish appearance for bottom menu icons when in dark mode */
    #${SELECTORS2.ROOT}.opm-dark .opm-bottom-menu .opm-icon-button img {
      /* COMMENT: Use a high-contrast invert with no saturation; keep light mode untouched */
      filter: invert(100%) saturate(0%) brightness(115%) contrast(100%) !important;
    }
    /* Focus style for search input only (avoid styling tag inputs inside forms) */
    #${SELECTORS2.ROOT} #${SELECTORS2.PROMPT_LIST} .opm-search-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(90, 103, 216, 0.3);
      outline: none;
    }
    /* Keyboard navigation styling */
    #${SELECTORS2.ROOT} .opm-prompt-list-item.opm-keyboard-selected {
      background-color: var(--dark-bg);
      transform: translateY(-2px);
    }
    #${SELECTORS2.ROOT} .opm-prompt-list-item.opm-light.opm-keyboard-selected {
      background-color: #e2e8f0;
      transform: translateY(-2px);
    }
    #${SELECTORS2.ROOT} .opm-prompt-list-item.opm-dark.opm-keyboard-selected {
      background-color: #2d3748;
      transform: translateY(-2px);
    }
    #${SELECTORS2.ROOT}:not(.opm-edit-mode-active) .opm-edit-only {
      display: none !important;
    }
    #${SELECTORS2.ROOT}.opm-edit-mode-active .opm-edit-only {
      display: flex;
    }
    #${SELECTORS2.ROOT}:not(.opm-edit-mode-active) .opm-drag-handle {
      cursor: default !important;
    }
    /* Ensure prompt list stays visible during keyboard navigation */
    #${SELECTORS2.ROOT} .opm-prompt-list.opm-visible:focus-within {
      display: block;
      opacity: 1;
      transform: translateY(0);
    }
    /* Tags input and pills */
    #${SELECTORS2.ROOT} .opm-tag-row {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-wrap: nowrap; /* COMMENT: keep on one line */
      overflow-x: auto;  /* COMMENT: scroll horizontally instead of wrapping */
      min-height: 32px;
      padding: 4px 6px;
      border-radius: 6px;
      position: relative; /* COMMENT: allow suggestions to be positioned absolutely */
    }
    #${SELECTORS2.ROOT} .opm-tag-row.opm-light { border: var(--input-light-border); background-color: var(--input-light-bg); }
    #${SELECTORS2.ROOT} .opm-tag-row.opm-dark { border: var(--input-dark-border); background-color: var(--input-dark-bg); }
    #${SELECTORS2.ROOT} .opm-tags-container { display: flex; gap: 2px; flex-wrap: nowrap; align-items: center; }
    /* Settings tag management: allow wrapping to multiple lines */
    #${SELECTORS2.ROOT} .opm-tags-mgmt-container {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
    }
    #${SELECTORS2.ROOT} .opm-tag-input {
      flex: 0 0 auto; /* COMMENT: do not grow so row stays one line */
      min-width: 120px;
      border: none;
      outline: none;
      background: transparent;
      color: inherit;
      font-size: 13px;
      padding: 2px 4px;
    }
    #${SELECTORS2.ROOT} .opm-tag-pill {
      display: inline-flex;
      align-items: center;
      padding: 1px 6px;
      border-radius: 999px;
      font-size: 12px;
      background-color: ${THEME_COLORS2.primary}22;
      color: inherit;
      white-space: nowrap;
      line-height: 1;
      flex: 0 0 auto;
    }
    #${SELECTORS2.ROOT} .opm-tag-pill.opm-light { border: 1px solid var(--light-border); }
    #${SELECTORS2.ROOT} .opm-tag-pill.opm-dark { border: 1px solid var(--dark-border); }
    #${SELECTORS2.ROOT} .opm-tag-remove {
      margin-left: 6px;
      border: none;
      background: transparent;
      color: inherit;
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
      padding: 0 2px;
    }

    /* Tag suggestions dropdown */
    #${SELECTORS2.ROOT} .opm-tag-suggestions {
      /* positioning and z-index are set inline by JS to avoid stacking/overflow issues */
      max-height: 160px;
      overflow-y: auto;
      border-radius: 6px;
      box-shadow: var(--light-shadow);
      padding: 4px;
    }
    #${SELECTORS2.ROOT} .opm-tag-suggestions.opm-light { background-color: var(--light-bg); border: 1px solid var(--light-border); }
    #${SELECTORS2.ROOT} .opm-tag-suggestions.opm-dark { background-color: var(--dark-bg); border: 1px solid var(--dark-border); box-shadow: var(--dark-shadow); }

    #${SELECTORS2.ROOT} .opm-tag-suggestion-item {
      padding: 6px 8px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      margin: 2px 0;
    }
    #${SELECTORS2.ROOT} .opm-tag-suggestion-item:hover,
    #${SELECTORS2.ROOT} .opm-tag-suggestion-item.active {
      background-color: ${THEME_COLORS2.primary}22;
    }

    /* Remove focus border/shadow on inputs inside create/edit forms only */
    #${SELECTORS2.ROOT} .opm-form-container .opm-input-field.opm-light:focus,
    #${SELECTORS2.ROOT} .opm-form-container .opm-textarea-field.opm-light:focus {
      border: var(--input-light-border);
      box-shadow: none;
      outline: none;
    }
    #${SELECTORS2.ROOT} .opm-form-container .opm-input-field.opm-dark:focus,
    #${SELECTORS2.ROOT} .opm-form-container .opm-textarea-field.opm-dark:focus {
      border: var(--input-dark-border);
      box-shadow: none;
      outline: none;
    }
    #${SELECTORS2.ROOT} .opm-form-container .opm-tag-input:focus {
      border: none;
      box-shadow: none;
      outline: none;
    }
    /* Onboarding animation */
    @keyframes opm-onboarding-bounce {
      0%, 100% { transform: translateX(-50%) translateY(0); }
      50% { transform: translateX(-50%) translateY(-5px); }
    }
    /* Responsive styles for onboarding popup */
    @media (max-width: 768px) {
      #${SELECTORS2.ROOT} #${SELECTORS2.ONBOARDING_POPUP} {
        font-size: 12px;
        padding: 6px 10px;
      }
    }
    /* Hot corner styling */
    #${SELECTORS2.ROOT} #${SELECTORS2.HOT_CORNER_INDICATOR} {
      opacity: 0.7;
      transition: opacity 0.3s ease, border-width 0.3s ease, border-color 0.3s ease;
    }
    #${SELECTORS2.ROOT} #${SELECTORS2.HOT_CORNER_CONTAINER}:hover #${SELECTORS2.HOT_CORNER_INDICATOR} {
      opacity: 1;
    }
  `;
    document.head.appendChild(styleEl);
  };
  window.injectGlobalStyles = injectGlobalStyles2;

  // inputBoxHandler.js
  var _providersCache = null;
  async function loadProviders() {
    if (_providersCache) return _providersCache;
    try {
      const response = await fetch(chrome.runtime.getURL("llm_providers.json"));
      if (response.ok) {
        const data = await response.json();
        _providersCache = data.llm_providers || [];
      }
    } catch (error) {
      console.error("Failed to load llm_providers.json:", error);
    }
    return _providersCache || [];
  }
  var InputBoxHandler2 = class _InputBoxHandler {
    /**
     * Detects and retrieves the input box from supported websites.
     * @returns {HTMLElement|null} The input box element or null if not found.
     */
    static async getInputBox() {
      const providers = await loadProviders();
      for (const provider of providers) {
        if (provider.pattern) {
          const pattern = provider.pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\*/g, ".*");
          const regex = new RegExp(`^${pattern}`, "i");
          if (regex.test(window.location.href)) {
            if (provider.element_selector) {
              const selectors = provider.element_selector.split(",").map((s) => s.trim());
              for (const sel of selectors) {
                let inputBox = document.querySelector(sel);
                if (inputBox) return inputBox;
                inputBox = _InputBoxHandler._findInShadowDom(sel);
                if (inputBox) return inputBox;
              }
            }
          }
        }
      }
      console.error("Input box not found on this page.");
      return null;
    }
    /**
     * Search for an element in all shadow DOMs, recursing to any depth.
     */
    static _findInShadowDom(selector, root = document) {
      const hosts = root.querySelectorAll("*");
      for (const el of hosts) {
        if (!el.shadowRoot) continue;
        const found = el.shadowRoot.querySelector(selector);
        if (found) return found;
        const deep = _InputBoxHandler._findInShadowDom(selector, el.shadowRoot);
        if (deep) return deep;
      }
      return null;
    }
    /**
     * Waits for the input box to be available in the DOM.
     * @returns {Promise<HTMLElement>} Resolves with the input box element.
     */
    static waitForInputBox() {
      return new Promise((resolve, reject) => {
        const checkExist = setInterval(async () => {
          const inputBox = await _InputBoxHandler.getInputBox();
          if (inputBox) {
            clearInterval(checkExist);
            resolve(inputBox);
          }
        }, 500);
        setTimeout(() => {
          clearInterval(checkExist);
          reject(new Error("Input box not found after 10 seconds."));
        }, 1e4);
      });
    }
    /**
     * Inserts a prompt into the detected input box.
     * @param {HTMLElement} inputBox - The input box element.
     * @param {string} content - The prompt content to insert.
     * @param {HTMLElement} promptList - The prompt list element to hide after insertion.
     */
    static async insertPrompt(inputBox, content, promptList) {
      if (!inputBox || !content) {
        console.error("Missing required parameters for insertPrompt", { inputBox, content, promptList });
        return;
      }
      inputBox.focus();
      try {
        const disableOverwrite = await new Promise((resolve) => {
          try {
            chrome.storage.local.get("disableOverwrite", (data) => {
              if (chrome.runtime?.lastError) {
                resolve(false);
                return;
              }
              resolve(Boolean(data?.disableOverwrite));
            });
          } catch (_) {
            resolve(false);
          }
        });
        if (inputBox.contentEditable === "true") {
          const isLexicalEditor = inputBox.getAttribute("data-lexical-editor") === "true" || !!inputBox.closest('[data-lexical-editor="true"]') || inputBox.id === "ask-input";
          if (isLexicalEditor) {
            const selection = window.getSelection();
            const range2 = document.createRange();
            if (disableOverwrite) {
              range2.selectNodeContents(inputBox);
              range2.collapse(false);
            } else {
              range2.selectNodeContents(inputBox);
            }
            selection.removeAllRanges();
            selection.addRange(range2);
            if (!disableOverwrite) {
              document.execCommand("delete", false, null);
            }
            const textToInsert = content + "  ";
            const inserted = document.execCommand("insertText", false, textToInsert);
            if (!inserted) {
              try {
                inputBox.dispatchEvent(new InputEvent("beforeinput", {
                  inputType: "insertText",
                  data: textToInsert,
                  bubbles: true,
                  cancelable: true
                }));
                inputBox.dispatchEvent(new Event("input", { bubbles: true }));
              } catch (_) {
                inputBox.textContent = textToInsert;
                inputBox.dispatchEvent(new Event("input", { bubbles: true }));
              }
            }
            const endRange = document.createRange();
            endRange.selectNodeContents(inputBox);
            endRange.collapse(false);
            const sel2 = window.getSelection();
            sel2.removeAllRanges();
            sel2.addRange(endRange);
            inputBox.dispatchEvent(new Event("change", { bubbles: true }));
            PromptUIManager.hidePromptList(promptList);
            return;
          }
          const isProseMirrorEditor = inputBox.classList && inputBox.classList.contains("ProseMirror") || typeof inputBox.closest === "function" && !!inputBox.closest(".ProseMirror");
          if (isProseMirrorEditor) {
            const selection = window.getSelection();
            const range2 = document.createRange();
            range2.selectNodeContents(inputBox);
            if (disableOverwrite) {
              range2.collapse(false);
            }
            selection.removeAllRanges();
            selection.addRange(range2);
            if (!disableOverwrite) {
              document.execCommand("delete", false, null);
            }
            const textToInsert = content + "  ";
            let inserted = false;
            try {
              inserted = document.execCommand("insertText", false, textToInsert);
            } catch (_) {
            }
            if (!inserted) {
              try {
                inputBox.dispatchEvent(new InputEvent("beforeinput", {
                  inputType: "insertText",
                  data: textToInsert,
                  bubbles: true,
                  cancelable: true
                }));
                inputBox.dispatchEvent(new Event("input", { bubbles: true }));
              } catch (_) {
                try {
                  const dt = new DataTransfer();
                  dt.setData("text/plain", textToInsert);
                  const pasteEvent = new ClipboardEvent("paste", {
                    clipboardData: dt,
                    bubbles: true,
                    cancelable: true
                  });
                  inputBox.dispatchEvent(pasteEvent);
                } catch (_2) {
                  if (disableOverwrite) {
                    inputBox.appendChild(document.createTextNode(textToInsert));
                  } else {
                    inputBox.textContent = textToInsert;
                  }
                  inputBox.dispatchEvent(new Event("input", { bubbles: true }));
                }
              }
            }
            const endRange = document.createRange();
            endRange.selectNodeContents(inputBox);
            endRange.collapse(false);
            const sel2 = window.getSelection();
            sel2.removeAllRanges();
            sel2.addRange(endRange);
            inputBox.dispatchEvent(new Event("change", { bubbles: true }));
            PromptUIManager.hidePromptList(promptList);
            return;
          }
          if (disableOverwrite) {
            const endRange = document.createRange();
            endRange.selectNodeContents(inputBox);
            endRange.collapse(false);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(endRange);
            if (content.includes("\n")) {
              const lines = content.split("\n");
              lines.forEach((line, index) => {
                const p = document.createElement("p");
                if (line.trim()) {
                  p.textContent = line;
                } else {
                  p.appendChild(document.createElement("br"));
                }
                inputBox.appendChild(p);
              });
            } else {
              const lastNode = inputBox.lastChild;
              const needsSpace = lastNode && lastNode.nodeType === Node.TEXT_NODE && !lastNode.textContent.endsWith(" ");
              const prefix = needsSpace ? " " : "";
              inputBox.appendChild(document.createTextNode(prefix + content));
            }
          } else {
            inputBox.innerHTML = "";
            const dataTransfer = new DataTransfer();
            dataTransfer.setData("text/plain", content);
            const pasteEvent = new ClipboardEvent("paste", {
              clipboardData: dataTransfer,
              bubbles: true,
              cancelable: true
            });
            inputBox.dispatchEvent(pasteEvent);
            if (content.includes("\n")) {
              const lines = content.split("\n");
              inputBox.innerHTML = "";
              lines.forEach((line, index) => {
                if (line.trim()) {
                  const p = document.createElement("p");
                  p.textContent = line;
                  inputBox.appendChild(p);
                } else if (index < lines.length - 1) {
                  const p = document.createElement("p");
                  const br = document.createElement("br");
                  p.appendChild(br);
                  inputBox.appendChild(p);
                }
              });
            } else {
              inputBox.textContent = content;
            }
          }
          inputBox.appendChild(document.createTextNode("  "));
          const range = document.createRange();
          range.selectNodeContents(inputBox);
          range.collapse(false);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          inputBox.dispatchEvent(new Event("input", { bubbles: true }));
          if (!inputBox.textContent || inputBox.textContent.trim() === "") {
            inputBox.innerText = content + "  ";
            inputBox.dispatchEvent(new Event("input", { bubbles: true }));
          }
        } else if (inputBox.tagName.toLowerCase() === "textarea") {
          if (disableOverwrite) {
            const existing = inputBox.value || "";
            const needsSpace = existing && !/\s$/.test(existing);
            const spacer = needsSpace ? " " : "";
            inputBox.value = existing + spacer + content + "  ";
          } else {
            inputBox.value = content + "  ";
          }
          inputBox.dispatchEvent(new Event("input", { bubbles: true }));
          inputBox.dispatchEvent(new Event("change", { bubbles: true }));
          inputBox.style.height = "auto";
          inputBox.style.height = `${inputBox.scrollHeight}px`;
        } else {
          console.error("Unknown input box type.", { inputBox });
          return;
        }
        PromptUIManager.hidePromptList(promptList);
      } catch (error) {
        console.error("Error inserting prompt:", error, { content, inputBox, promptList });
      }
    }
  };
  window.InputBoxHandler = InputBoxHandler2;

  // content.shared.js
  (function registerPromptManagerShared() {
    function initPromptManagerShared() {
      if (window.__OPM_PROMPT_SHARED__) return;
      window.__OPM_PROMPT_SHARED__ = true;
      const createEl3 = window.createEl;
      const getMode2 = window.getMode;
      const getIconFilterFn = window.getIconFilter;
      const showEl2 = window.showEl;
      const hideEl2 = window.hideEl;
      const SELECTORS3 = window.SELECTORS;
      const PanelRouter2 = window.PanelRouter;
      const PanelView2 = window.PanelView;
      const PromptUIManager3 = window.PromptUIManager;
      const PromptStorageManager3 = window.PromptStorageManager;
      if (!createEl3 || !getMode2 || !showEl2 || !hideEl2 || !SELECTORS3 || !PanelRouter2 || !PanelView2 || !PromptUIManager3 || !PromptStorageManager3) {
        window.__OPM_PROMPT_SHARED__ = false;
        console.warn("[PromptManager] Shared helpers unavailable; deferring initialization.");
        return;
      }
      const fallbackIconFilter = "invert(37%) sepia(74%) saturate(380%) hue-rotate(175deg) brightness(93%) contrast(88%)";
      const iconFilter = () => typeof getIconFilterFn === "function" ? getIconFilterFn() : fallbackIconFilter;
      window.__PF_PROMPT_INDEX = window.__PF_PROMPT_INDEX || /* @__PURE__ */ new Map();
      const indexPromptForSearch = (prompt) => {
        if (!prompt || !prompt.uuid) return;
        window.__PF_PROMPT_INDEX.set(prompt.uuid, {
          title: (prompt.title || "").toLowerCase(),
          content: (prompt.content || "").toLowerCase(),
          tags: Array.isArray(prompt.tags) ? prompt.tags.map((t) => String(t).toLowerCase()) : []
        });
      };
      const ICON_SVGS = {
        list: `<img src="${chrome.runtime.getURL("icons/list.svg")}" width="16" height="16" alt="List Prompts" title="List Prompts" style="filter: ${iconFilter()}">`,
        add: `<img src="${chrome.runtime.getURL("icons/new.svg")}" width="16" height="16" alt="Add Prompt" title="Add Prompt" style="filter: ${iconFilter()}">`,
        delete: `<img src="${chrome.runtime.getURL("icons/delete.svg")}" width="16" height="16" alt="Delete" title="Delete" style="filter: ${iconFilter()}">`,
        edit: `<img src="${chrome.runtime.getURL("icons/edit.svg")}" width="16" height="16" alt="Edit" title="Edit" style="filter: ${iconFilter()}">`,
        settings: `<img src="${chrome.runtime.getURL("icons/settings.svg")}" width="16" height="16" alt="Settings" title="Settings" style="filter: ${iconFilter()}">`,
        help: `<img src="${chrome.runtime.getURL("icons/help.svg")}" width="16" height="16" alt="Help" title="Help" style="filter: ${iconFilter()}">`
      };
      const TagService2 = /* @__PURE__ */ (() => {
        const computeCounts = (prompts = []) => {
          const counts = /* @__PURE__ */ new Map();
          prompts.forEach((p) => (Array.isArray(p.tags) ? p.tags : []).forEach((t) => {
            const key = String(t).trim();
            if (!key) return;
            counts.set(key, (counts.get(key) || 0) + 1);
          }));
          return counts;
        };
        const getCounts = async (prompts) => {
          if (!Array.isArray(prompts)) {
            try {
              prompts = await window.PromptStorageManager.getPrompts();
            } catch (_) {
              prompts = [];
            }
          }
          return computeCounts(prompts);
        };
        const getOrderedTags = async (countsOrPrompts) => {
          const counts = countsOrPrompts instanceof Map ? countsOrPrompts : await getCounts(countsOrPrompts);
          const order = await window.PromptStorageManager.getTagsOrder();
          const tags = Array.from(counts.keys());
          const missing = tags.filter((t) => !order.includes(t)).sort((a, b) => a.localeCompare(b));
          return [...order.filter((t) => counts.has(t)), ...missing];
        };
        const getSuggestions = async ({ term = "", exclude = /* @__PURE__ */ new Set() } = {}) => {
          const counts = await getCounts();
          const ordered = await getOrderedTags(counts);
          const lcTerm = term.trim().toLowerCase();
          return ordered.filter((t) => !exclude.has(t) && (lcTerm === "" || String(t).toLowerCase().includes(lcTerm)));
        };
        return { getCounts, getOrderedTags, getSuggestions };
      })();
      window.TagService = TagService2;
      const TagUI2 = (() => {
        if (!window.__PF_TAG_UI_GLOBAL_LISTENERS) {
          window.__PF_TAG_UI_GLOBAL_LISTENERS = true;
          const repositionActive = () => {
            const a = window.__pfActiveTagSuggestions;
            if (a && a.suggestions.style.display !== "none") a.position();
          };
          document.addEventListener("click", (evt) => {
            const a = window.__pfActiveTagSuggestions;
            if (a && a.suggestions.style.display !== "none" && !a.suggestions.contains(evt.target)) {
              a.suggestions.style.display = "none";
            }
          });
          window.addEventListener("resize", repositionActive);
          window.addEventListener("scroll", repositionActive, true);
        }
        const createTagInput = ({ initialTags = [] } = {}) => {
          const tagsSet = new Set(Array.isArray(initialTags) ? initialTags : []);
          const row = createEl3("div", { className: `opm-tag-row opm-${getMode2()}` });
          const pills = createEl3("div", { className: "opm-tags-container" });
          const input = createEl3("input", { attributes: { type: "text", placeholder: "Tags" }, className: `opm-tag-input opm-${getMode2()}` });
          const suggestions = createEl3("div", { className: `opm-tag-suggestions opm-${getMode2()}`, styles: { display: "none" } });
          let activeIndex = -1;
          let options = [];
          const renderPills = () => {
            pills.innerHTML = "";
            Array.from(tagsSet).forEach((tag) => {
              const pill = createEl3("span", { className: `opm-tag-pill opm-${getMode2()}` }, [String(tag)]);
              const removeBtn = createEl3("button", { className: "opm-tag-remove", innerHTML: "\xD7" });
              removeBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                tagsSet.delete(tag);
                if (pill && pill.parentNode) pill.parentNode.removeChild(pill);
              });
              pill.appendChild(removeBtn);
              pills.appendChild(pill);
            });
          };
          const mountSuggestionsPortal = () => {
            const root = document.getElementById(SELECTORS3.ROOT) || document.body;
            if (suggestions.parentElement !== root) root.appendChild(suggestions);
            suggestions.style.position = "fixed";
            suggestions.style.zIndex = "100000";
          };
          const positionSuggestions = () => {
            const rect = row.getBoundingClientRect();
            suggestions.style.left = `${Math.max(0, rect.left)}px`;
            const spaceAbove = rect.top;
            const desiredHeight = Math.min(160, window.innerHeight * 0.4);
            if (spaceAbove > desiredHeight + 8) {
              suggestions.style.top = `${rect.top}px`;
              suggestions.style.transform = "translateY(-100%)";
            } else {
              suggestions.style.top = `${rect.bottom}px`;
              suggestions.style.transform = "translateY(2px)";
            }
            suggestions.style.minWidth = `${Math.max(180, rect.width - 12)}px`;
          };
          const addTag = (val) => {
            const tag = (val || "").trim().toLowerCase().replace(/\s+/g, "-");
            if (!tag || tagsSet.has(tag)) return;
            tagsSet.add(tag);
            renderPills();
            activeIndex = -1;
            suggestions.style.display = "none";
          };
          const refreshSuggestions = async () => {
            options = await TagService2.getSuggestions({ term: input.value, exclude: tagsSet });
            suggestions.innerHTML = "";
            options.forEach((t, idx) => {
              const item = createEl3("div", { className: "opm-tag-suggestion-item" }, [t]);
              if (idx === activeIndex) item.classList.add("active");
              item.addEventListener("mousedown", (e) => {
                e.preventDefault();
                addTag(t);
                input.value = "";
                suggestions.style.display = "none";
              });
              suggestions.appendChild(item);
            });
            if (options.length > 0) {
              mountSuggestionsPortal();
              positionSuggestions();
              suggestions.style.display = "block";
            } else {
              suggestions.style.display = "none";
            }
          };
          input.addEventListener("input", () => {
            activeIndex = -1;
            const term = input.value.trim();
            if (term.length === 0) {
              suggestions.style.display = "none";
              options = [];
              return;
            }
            refreshSuggestions();
          });
          input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (activeIndex >= 0 && activeIndex < options.length) {
                addTag(options[activeIndex]);
                input.value = "";
              } else {
                addTag(input.value);
                input.value = "";
              }
              suggestions.style.display = "none";
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              activeIndex = Math.min(activeIndex + 1, options.length - 1);
              refreshSuggestions();
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              activeIndex = Math.max(activeIndex - 1, -1);
              refreshSuggestions();
            }
            if (e.key === "Escape") {
              suggestions.style.display = "none";
            }
          });
          input.addEventListener("focus", () => {
            suggestions.style.display = "none";
          });
          input.addEventListener("blur", () => {
            suggestions.style.display = "none";
          });
          window.__pfActiveTagSuggestions = { suggestions, position: positionSuggestions };
          renderPills();
          row.append(pills, input);
          return { element: row, getTags: () => Array.from(tagsSet) };
        };
        return { createTagInput };
      })();
      window.TagUI = TagUI2;
      const PromptUI2 = (() => {
        const State = {
          manuallyOpened: false,
          inVariableInputMode: false,
          closeTimer: null
        };
        const Elements = {
          createPanelContent() {
            return createEl3("div", { id: SELECTORS3.PANEL_CONTENT });
          },
          createTagsBar({ tags = [], counts = /* @__PURE__ */ new Map(), onSelect, selectedTag = "all" } = {}) {
            const bar = createEl3("div", { className: `opm-tags-filter-bar opm-${getMode2()}` });
            window.ScrollVisibilityManager?.observe(bar);
            const makePill = (label, isSelected = false) => {
              const pill = createEl3("button", { className: `opm-tag-pill-filter opm-${getMode2()}`, attributes: { "aria-pressed": String(!!isSelected) } });
              pill.textContent = label;
              return pill;
            };
            let current = selectedTag || "all";
            const updateSelected = (nextTag) => {
              current = nextTag;
              Array.from(bar.children).forEach((child) => {
                const isSelected = child.dataset && child.dataset.tag === current;
                child.setAttribute("aria-pressed", String(isSelected));
              });
            };
            const allPill = makePill("All", (selectedTag || "all") === "all");
            allPill.dataset.tag = "all";
            allPill.addEventListener("click", (e) => {
              e.stopPropagation();
              if (typeof onSelect === "function") onSelect("all");
              updateSelected("all");
            });
            bar.appendChild(allPill);
            tags.forEach((tag) => {
              const count = counts.get(tag) || 0;
              const pill = makePill(count > 0 ? `${tag}` : tag, (selectedTag || "all") === tag);
              pill.dataset.tag = tag;
              pill.addEventListener("click", (e) => {
                e.stopPropagation();
                if (typeof onSelect === "function") onSelect(tag);
                updateSelected(tag);
              });
              bar.appendChild(pill);
            });
            return bar;
          },
          createItemsContainer({ mode = "list" } = {}) {
            const classes = [
              SELECTORS3.PROMPT_ITEMS_CONTAINER,
              "opm-prompt-list-items",
              "opm-view-list",
              `opm-${getMode2()}`
            ];
            if (mode === "edit") classes.push("opm-edit-mode");
            return createEl3("div", { className: classes.join(" ") });
          },
          createPromptItem(prompt) {
            const item = createEl3("div", {
              className: `opm-prompt-list-item opm-${getMode2()}`,
              eventListeners: {
                click: () => PromptUIManager3.emitPromptSelect(prompt),
                mouseenter: () => {
                  document.querySelectorAll(`#${SELECTORS3.ROOT} .opm-prompt-list-item`).forEach((i) => i.classList.remove("opm-keyboard-selected"));
                  PromptUIManager3.cancelCloseTimer();
                }
              }
            });
            const text = createEl3("div", { styles: { flex: "1" } });
            text.textContent = prompt.title;
            item.appendChild(text);
            item.dataset.uuid = prompt.uuid;
            indexPromptForSearch(prompt);
            return item;
          },
          createEditablePromptItem(prompt, idx, reorder) {
            const item = createEl3("div", {
              className: `opm-prompt-list-item opm-${getMode2()}`,
              styles: {
                justifyContent: "space-between",
                padding: "6px 12px",
                margin: "6px 0",
                borderRadius: "10px",
                gap: "8px"
              },
              eventListeners: {
                click: () => PromptUIManager3.emitPromptSelect(prompt),
                mouseenter: () => {
                  document.querySelectorAll(`#${SELECTORS3.ROOT} .opm-prompt-list-item`).forEach((i) => i.classList.remove("opm-keyboard-selected"));
                  PromptUIManager3.cancelCloseTimer();
                }
              }
            });
            item.dataset.index = idx;
            item.dataset.uuid = prompt.uuid;
            indexPromptForSearch(prompt);
            const dragHandle = createEl3("div", {
              className: "opm-drag-handle opm-edit-only",
              innerHTML: `
            <img 
              src="${chrome.runtime.getURL("icons/drag_indicator.svg")}" 
              width="16" 
              height="16" 
              alt="Drag handle" 
              title="Drag to reorder"
              style="display: block; opacity: 0.9; filter: ${iconFilter()}"
            >
          `,
              styles: {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "16px",
                height: "16px",
                margin: "0",
                flex: "0 0 auto",
                cursor: "grab",
                userSelect: "none",
                opacity: "0.9"
              }
            });
            reorder?.wireItem(item, idx, dragHandle);
            const info = createEl3("div", { styles: { display: "flex", flexDirection: "column", flex: "1", gap: "2px" } });
            const text = createEl3("div", { styles: { flex: "0 0 auto" } });
            text.textContent = prompt.title;
            info.appendChild(text);
            const actions = createEl3("div", { className: "opm-edit-only", styles: { display: "flex", gap: "4px", flex: "0 0 auto" } });
            const editIcon = Elements.createIconButton("edit", (e) => {
              e.stopPropagation();
              window.PromptUIManager.showEditForm(prompt);
            });
            const deleteIcon = Elements.createIconButton("delete", (e) => {
              e.stopPropagation();
              if (confirm('Delete "' + prompt.title + '"?')) window.PromptUIManager.deletePrompt(prompt.uuid);
            });
            actions.append(editIcon, deleteIcon);
            item.append(dragHandle, info, actions);
            return item;
          },
          createIconButton(type, onClick) {
            return createEl3("button", { className: "opm-icon-button", eventListeners: { click: onClick }, innerHTML: ICON_SVGS[type] || "" });
          },
          createMenuBar() {
            const bar = createEl3("div", { styles: { display: "flex", alignItems: "center", justifyContent: "space-evenly", width: "100%" } });
            const btns = ["list", "add", "edit", "help", "settings"];
            const actions = {
              list: (e) => {
                e.stopPropagation();
                PromptUIManager3.manuallyOpened = true;
                PanelRouter2.mount(PanelView2.LIST);
              },
              add: (e) => {
                e.stopPropagation();
                PromptUIManager3.manuallyOpened = true;
                PanelRouter2.mount(PanelView2.CREATE);
              },
              edit: (e) => {
                e.stopPropagation();
                PromptUIManager3.manuallyOpened = true;
                PanelRouter2.mount(PanelView2.EDIT);
              },
              settings: (e) => {
                e.stopPropagation();
                PromptUIManager3.manuallyOpened = true;
                PanelRouter2.mount(PanelView2.SETTINGS);
              },
              help: (e) => {
                e.stopPropagation();
                PromptUIManager3.manuallyOpened = true;
                PanelRouter2.mount(PanelView2.HELP);
              }
            };
            btns.forEach((type) => bar.appendChild(Elements.createIconButton(type, actions[type])));
            return bar;
          },
          createBottomMenu() {
            const menu = createEl3("div", {
              className: `opm-bottom-menu opm-${getMode2()}`,
              styles: { display: "flex", flexDirection: "column", gap: "10px", padding: "10px 10px 5px 10px", borderTop: "1px solid var(--light-border)" }
            });
            const search = createEl3("input", {
              id: SELECTORS3.PROMPT_SEARCH_INPUT,
              className: `opm-search-input opm-${getMode2()}`,
              attributes: { type: "text", placeholder: "Type to search", style: "border-radius: 4px;" }
            });
            search.addEventListener("input", (e) => {
              PromptUIManager3.filterPromptItems(e.target.value);
            });
            menu.appendChild(search);
            menu.appendChild(Elements.createMenuBar());
            return menu;
          },
          createToggleRow({ labelText, getValue, onToggle }) {
            const row = createEl3("div", { styles: { display: "flex", justifyContent: "space-between", alignItems: "center" } });
            const label = createEl3("label", { innerHTML: labelText, styles: { fontSize: "14px" } });
            const toggleSwitch = createEl3("div", {
              className: `opm-toggle-switch opm-${getMode2()}`
            });
            const applyValue = (active) => {
              if (active) toggleSwitch.classList.add("active");
              else toggleSwitch.classList.remove("active");
            };
            toggleSwitch.addEventListener("click", (e) => {
              e.stopPropagation();
              const nextActive = !toggleSwitch.classList.contains("active");
              applyValue(nextActive);
              Promise.resolve(onToggle?.(nextActive)).catch((err) => console.error("[PromptManager] Toggle handler failed:", err));
            });
            Promise.resolve(getValue?.()).then(applyValue).catch((err) => console.warn("[PromptManager] Failed to initialize toggle state:", err));
            row.append(label, toggleSwitch);
            return row;
          }
        };
        const Reorder = {
          attach(promptsContainer, prompts, onReorder) {
            let isDragging = false;
            let dragSrcEl = null;
            let ghost = null;
            let autoScrollTimer = null;
            const SCROLL_ZONE_PX = 40;
            const SCROLL_SPEED_PX = 8;
            const getListItems = () => Array.from(promptsContainer.children).filter((c) => c.classList.contains("opm-prompt-list-item"));
            const cleanup = () => {
              isDragging = false;
              if (ghost) {
                ghost.remove();
                ghost = null;
              }
              if (dragSrcEl) {
                dragSrcEl.style.opacity = "";
                dragSrcEl = null;
              }
              if (autoScrollTimer) {
                clearInterval(autoScrollTimer);
                autoScrollTimer = null;
              }
              document.body.style.cursor = "";
              document.removeEventListener("mousemove", handleMouseMove);
              document.removeEventListener("mouseup", handleMouseUp);
            };
            const handleMouseMove = (e) => {
              if (!isDragging || !ghost) return;
              e.preventDefault();
              const ghostHeight = ghost.offsetHeight;
              ghost.style.top = `${e.clientY - ghostHeight / 2}px`;
              ghost.style.left = `${e.clientX + 10}px`;
              const rect = promptsContainer.getBoundingClientRect();
              if (autoScrollTimer) clearInterval(autoScrollTimer);
              autoScrollTimer = null;
              if (e.clientY < rect.top + SCROLL_ZONE_PX) {
                autoScrollTimer = setInterval(() => {
                  promptsContainer.scrollTop -= SCROLL_SPEED_PX;
                }, 16);
              } else if (e.clientY > rect.bottom - SCROLL_ZONE_PX) {
                autoScrollTimer = setInterval(() => {
                  promptsContainer.scrollTop += SCROLL_SPEED_PX;
                }, 16);
              }
              const mouseY = e.clientY;
              const items = getListItems();
              let target = null;
              for (const item of items) {
                if (item === dragSrcEl) continue;
                const r = item.getBoundingClientRect();
                const mid = r.top + r.height / 2;
                if (mouseY < mid) {
                  target = item;
                  break;
                }
              }
              if (target) {
                if (dragSrcEl.nextElementSibling !== target) {
                  promptsContainer.insertBefore(dragSrcEl, target);
                }
              } else {
                if (dragSrcEl.nextElementSibling) {
                  promptsContainer.appendChild(dragSrcEl);
                }
              }
            };
            const handleMouseUp = (e) => {
              if (!isDragging) return;
              const items = getListItems();
              const newOrderIndices = items.map((item) => parseInt(item.dataset.index, 10));
              cleanup();
              let changed = false;
              for (let i = 0; i < newOrderIndices.length; i++) {
                if (newOrderIndices[i] !== i) {
                  changed = true;
                  break;
                }
              }
              if (changed) {
                const newPrompts = newOrderIndices.map((originalIdx) => prompts[originalIdx]);
                onReorder(newPrompts);
              }
            };
            const wireItem = (item, index, handle) => {
              handle.style.cursor = "grab";
              handle.addEventListener("dragstart", (e) => e.preventDefault());
              handle.addEventListener("mousedown", (e) => {
                if (e.button !== 0) return;
                const mode = window.PromptUIManager?.state?.listMode;
                if (mode !== "edit") return;
                e.preventDefault();
                e.stopPropagation();
                isDragging = true;
                dragSrcEl = item;
                const rect = item.getBoundingClientRect();
                ghost = item.cloneNode(true);
                Object.assign(ghost.style, {
                  position: "fixed",
                  top: `${rect.top}px`,
                  left: `${rect.left}px`,
                  width: `${rect.width}px`,
                  height: `${rect.height}px`,
                  zIndex: "99999",
                  pointerEvents: "none",
                  opacity: "0.95",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                  transform: "scale(1.02)",
                  margin: "0",
                  transition: "none",
                  backgroundColor: getMode2() === "dark" ? "var(--dark-bg)" : "var(--light-bg)"
                });
                const root = document.getElementById(SELECTORS3.ROOT);
                if (root) root.appendChild(ghost);
                else document.body.appendChild(ghost);
                item.style.opacity = "0.0";
                document.body.style.cursor = "grabbing";
                handle.style.cursor = "grabbing";
                document.addEventListener("mousemove", handleMouseMove);
                document.addEventListener("mouseup", handleMouseUp);
              });
            };
            return { wireItem };
          }
        };
        const Views = {
          createPromptForm({ initialTitle = "", initialContent = "", submitLabel = "Save", onSubmit, initialCategory = null }) {
            const form = createEl3("div", { className: `opm-form-container opm-create-form opm-${getMode2()}`, styles: { padding: "0", display: "flex", flexDirection: "column", gap: "4px" } });
            const titleIn = createEl3("input", { attributes: { placeholder: "Prompt Title" }, className: `opm-input-field opm-${getMode2()}`, styles: { borderRadius: "4px" } });
            const contentArea = createEl3("textarea", {
              attributes: { placeholder: "Write your prompt. Use hashtags for #variables#" },
              className: `opm-textarea-field opm-${getMode2()}`,
              styles: { flex: "1 1 auto", minHeight: "0", height: "auto" }
            });
            titleIn.value = initialTitle;
            contentArea.value = initialContent;
            const catSelect = createEl3("select", { className: `opm-input-field opm-${getMode2()}`, styles: { borderRadius: "4px", fontSize: "13px" } });
            const defaultCat = createEl3("option", {}, ["Uncategorized"]);
            catSelect.appendChild(defaultCat);
            const categories = ["Writing & Content", "Coding & Development", "Analysis & Research", "Creative & Design", "Business & Marketing", "Education & Learning", "Data & Technical", "Communication & Email", "Productivity & Planning", "Other"];
            for (const c of categories) {
              const o = createEl3("option", {}, [c]);
              if (c === initialCategory) o.selected = true;
              catSelect.appendChild(o);
            }
            const saveBtn = createEl3("button", { innerHTML: submitLabel, className: `opm-button opm-${getMode2()}` });
            saveBtn.addEventListener("click", async (e) => {
              e.stopPropagation();
              const t = titleIn.value.trim(), c = contentArea.value.trim();
              if (!t || !c) {
                alert("Please fill in both title and content.");
                return;
              }
              const cat = catSelect.value !== "Uncategorized" ? catSelect.value : null;
              if (typeof onSubmit === "function") await onSubmit({ title: t, content: c, category: cat });
            });
            form.append(titleIn, contentArea, catSelect, saveBtn);
            form.addEventListener("click", (e) => e.stopPropagation());
            return form;
          },
          renderPromptList(prompts = [], { mode = "list" } = {}) {
            const content = Elements.createPanelContent();
            const tagsHost = createEl3("div", { className: `opm-tags-filter-host opm-${getMode2()}`, styles: { display: "none" } });
            content.appendChild(tagsHost);
            const itemsContainer = Elements.createItemsContainer({ mode });
            const reorder = Reorder.attach(
              itemsContainer,
              prompts,
              async (newPrompts) => {
                prompts.splice(0, prompts.length, ...newPrompts);
                Array.from(itemsContainer.children).filter((node) => node.classList?.contains("opm-prompt-list-item")).forEach((node, idx) => {
                  node.dataset.index = idx;
                });
                if (window.PromptUIManager?.state?.listMode === "edit") {
                  window.PromptUIManager.requestListRefreshSuppression?.();
                }
                await window.PromptStorageManager.setPrompts(newPrompts);
              }
            );
            prompts.forEach((p, idx) => {
              const item = Elements.createEditablePromptItem(p, idx, reorder);
              itemsContainer.appendChild(item);
            });
            content.appendChild(itemsContainer);
            content.appendChild(Elements.createBottomMenu());
            (async () => {
              try {
                const enableTags = await window.PromptStorageManager.getEnableTags();
                if (!enableTags) {
                  tagsHost.style.display = "none";
                  return;
                }
                const counts = await TagService2.getCounts(prompts);
                if (counts.size === 0) {
                  tagsHost.style.display = "none";
                  return;
                }
                const ordered = await TagService2.getOrderedTags(counts);
                let persisted = "all";
                try {
                  persisted = (await window.PromptStorageManager.getActiveTagFilter() || "all").toLowerCase();
                } catch (_) {
                  persisted = "all";
                }
                const prev = (window.PromptUIManager.activeTagFilter || persisted || "all").toLowerCase();
                const selected = prev !== "all" && counts.has(prev) ? prev : "all";
                window.PromptUIManager.activeTagFilter = selected;
                const bar = Elements.createTagsBar({
                  tags: ordered,
                  counts,
                  selectedTag: selected,
                  onSelect: (tag) => {
                    window.PromptUIManager.filterByTag(tag);
                  }
                });
                tagsHost.replaceWith(bar);
                window.PromptUIManager.filterByTag(selected);
                window.ScrollVisibilityManager?.observe(bar);
              } catch (_) {
                tagsHost.style.display = "none";
              }
            })();
            return content;
          },
          async createPromptCreationForm(prefill = "") {
            const search = document.getElementById(SELECTORS3.PROMPT_SEARCH_INPUT);
            if (search) search.style.display = "none";
            const enableTags = await window.PromptStorageManager.getEnableTags();
            const form = createEl3("div", { className: `opm-form-container opm-${getMode2()}`, styles: { padding: "0", display: "flex", flexDirection: "column", gap: "8px" } });
            const titleIn = createEl3("input", { attributes: { placeholder: "Prompt Title" }, className: `opm-input-field opm-${getMode2()}`, styles: { borderRadius: "4px" } });
            const contentArea = createEl3("textarea", {
              attributes: { placeholder: "Enter your prompt here. Add variables with #examplevariable#" },
              className: `opm-textarea-field opm-${getMode2()}`,
              styles: { flex: "1 1 auto", minHeight: "0", height: "auto" }
            });
            titleIn.value = "";
            contentArea.value = prefill || "";
            const catSelect = createEl3("select", { className: `opm-input-field opm-${getMode2()}`, styles: { borderRadius: "4px", fontSize: "13px" } });
            const defaultCat = createEl3("option", {}, ["Uncategorized"]);
            catSelect.appendChild(defaultCat);
            const categories = ["Writing & Content", "Coding & Development", "Analysis & Research", "Creative & Design", "Business & Marketing", "Education & Learning", "Data & Technical", "Communication & Email", "Productivity & Planning", "Other"];
            for (const c of categories) catSelect.appendChild(createEl3("option", {}, [c]));
            let tagsBlock = null;
            let tagInput = null;
            if (enableTags) {
              const label = createEl3("label", { styles: { fontSize: "12px", fontWeight: "bold" } });
              tagInput = TagUI2.createTagInput();
              tagsBlock = createEl3("div");
              tagsBlock.append(label, tagInput.element);
            }
            const saveBtn = createEl3("button", { innerHTML: "Create Prompt", className: `opm-button opm-${getMode2()}` });
            saveBtn.addEventListener("click", async (e) => {
              e.stopPropagation();
              const t = titleIn.value.trim(), c = contentArea.value.trim();
              if (!t || !c) {
                alert("Please fill in both title and content.");
                return;
              }
              const tags = enableTags && tagInput ? tagInput.getTags() : [];
              const cat = catSelect.value !== "Uncategorized" ? catSelect.value : null;
              const res = await window.PromptStorageManager.savePrompt({ title: t, content: c, tags, category: cat });
              if (!res.success) {
                alert("Error saving prompt.");
                return;
              }
              window.PanelRouter.mount(window.PanelView.LIST);
            });
            form.append(titleIn, contentArea, catSelect);
            if (tagsBlock) form.append(tagsBlock);
            form.append(saveBtn);
            form.addEventListener("click", (e) => e.stopPropagation());
            return form;
          },
          createSettingsForm() {
            const form = createEl3("div", { className: `opm-form-container opm-${getMode2()}`, styles: { padding: "12px", display: "flex", flexDirection: "column", gap: "8px" } });
            const title = createEl3("div", { styles: { fontWeight: "bold", fontSize: "16px", marginBottom: "10px" }, innerHTML: "Settings" });
            const settings = createEl3("div", { styles: { display: "flex", flexDirection: "column", gap: "12px" } });
            settings.appendChild(Elements.createToggleRow({
              labelText: "Hot Corner Mode",
              getValue: async () => await window.PromptStorageManager.getDisplayMode() === "hotCorner",
              onToggle: async (active) => {
                const newMode = active ? "hotCorner" : "standard";
                await window.PromptStorageManager.saveDisplayMode(newMode);
                await window.PromptUIManager.refreshDisplayMode();
              }
            }));
            settings.appendChild(Elements.createToggleRow({
              labelText: "Append prompts to text",
              getValue: async () => await window.PromptStorageManager.getDisableOverwrite(),
              onToggle: async (active) => {
                await window.PromptStorageManager.saveDisableOverwrite(active);
              }
            }));
            settings.appendChild(Elements.createToggleRow({
              labelText: "Enable tags",
              getValue: async () => await window.PromptStorageManager.getEnableTags(),
              onToggle: async (active) => {
                await window.PromptStorageManager.saveEnableTags(active);
              }
            }));
            settings.appendChild(Elements.createToggleRow({
              labelText: "Force Dark Mode",
              getValue: async () => {
                const enabled = await window.PromptStorageManager.getForceDarkMode();
                window.isDarkModeForced = !!enabled;
                return enabled;
              },
              onToggle: async (active) => {
                window.isDarkModeForced = active;
                await window.PromptStorageManager.saveForceDarkMode(active);
                window.PromptUIManager.updateThemeForUI();
              }
            }));
            const fullSettingsBtn = createEl3("button", {
              innerHTML: "Open Full Settings \u2197",
              className: `opm-button opm-${getMode2()}`,
              styles: { marginTop: "4px" }
            });
            fullSettingsBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              chrome.runtime.sendMessage({ type: "OPEN_APP_TAB", path: "#/settings" });
            });
            settings.appendChild(fullSettingsBtn);
            const hint = createEl3("div", {
              styles: { fontSize: "11px", color: getMode2() === "dark" ? "#aaa" : "#666", marginTop: "2px" },
              innerHTML: "Ollama config, model selection, and integrations are in full settings."
            });
            settings.appendChild(hint);
            const dataSectionTitle = createEl3("div", { styles: { fontWeight: "bold", fontSize: "14px", marginTop: "6px" }, innerHTML: "Prompt Management" });
            const dataActions = createEl3("div", { styles: { display: "flex", gap: "8px" } });
            const exportBtn = createEl3("button", { innerHTML: "Export", className: `opm-button opm-${getMode2()}` });
            exportBtn.addEventListener("click", async (e) => {
              e.stopPropagation();
              try {
                const prompts = await window.PromptStorageManager.getPrompts();
                const json = JSON.stringify(prompts, null, 2);
                const blob = new Blob([json], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = createEl3("a", { attributes: { href: url, download: `prompts-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json` } });
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              } catch (err) {
                alert("Export failed.");
              }
            });
            const importBtn = createEl3("button", { innerHTML: "Import", className: `opm-button opm-${getMode2()}` });
            importBtn.addEventListener("click", async (e) => {
              e.stopPropagation();
              const fileInput = createEl3("input", { attributes: { type: "file", accept: ".json" } });
              fileInput.addEventListener("change", async (event) => {
                const file = event.target.files[0];
                if (file) {
                  try {
                    const text = await file.text();
                    const imported = JSON.parse(text);
                    if (!Array.isArray(imported)) throw new Error("Invalid format");
                    const merged = await window.PromptStorageManager.mergeImportedPrompts(imported);
                    window.PromptUIManager.refreshPromptList(merged);
                    importBtn.textContent = "Import successful!";
                    setTimeout(() => importBtn.textContent = "Import", window.IMPORT_SUCCESS_RESET_MS || 2e3);
                  } catch (err) {
                    alert("Invalid JSON file format.");
                  }
                }
              });
              fileInput.click();
            });
            dataActions.append(exportBtn, importBtn);
            const deleteAllBtn = createEl3("button", {
              innerHTML: "Delete all prompts",
              className: `opm-button opm-${getMode2()}`,
              styles: { backgroundColor: "#9CA3AF", marginTop: "4px" }
            });
            deleteAllBtn.addEventListener("click", async (e) => {
              e.stopPropagation();
              if (!confirm("Delete ALL prompts? This cannot be undone.")) return;
              try {
                await window.PromptStorageManager.setPrompts([]);
                window.PanelRouter.mount(window.PanelView.SETTINGS);
              } catch (_) {
                alert("Failed to delete prompts.");
              }
            });
            const tagMgmtTitle = createEl3("div", { styles: { fontWeight: "bold", fontSize: "14px", marginTop: "12px", display: "none" }, innerHTML: "Tag management" });
            const tagMgmtContainer = createEl3("div", { styles: { display: "none", flexDirection: "column", gap: "6px" } });
            (async () => {
              try {
                const enableTags = await window.PromptStorageManager.getEnableTags();
                if (!enableTags) {
                  tagMgmtTitle.style.display = "none";
                  tagMgmtContainer.style.display = "none";
                  return;
                }
                tagMgmtTitle.style.display = "";
                tagMgmtContainer.style.display = "";
                let counts = await TagService2.getCounts();
                const row = createEl3("div", { className: "opm-tags-mgmt-container" });
                let finalOrder = await TagService2.getOrderedTags(counts);
                const placeholder = createEl3("span", { className: `opm-tag-pill opm-${getMode2()} opm-drop-placeholder`, innerHTML: "&nbsp;" });
                let dragFromIndex = null;
                const pillsOnly = () => Array.from(row.children).filter((n) => n.classList && n.classList.contains("opm-tag-pill") && n !== placeholder);
                const insertPlaceholderAt = (clientX, clientY) => {
                  const pills = pillsOnly();
                  if (pills.length === 0) {
                    row.appendChild(placeholder);
                    return;
                  }
                  let inserted = false;
                  for (let i = 0; i < pills.length; i++) {
                    const rect = pills[i].getBoundingClientRect();
                    if (clientY >= rect.top && clientY <= rect.bottom) {
                      placeholder.style.width = `${rect.width}px`;
                      const before = clientX < rect.left + rect.width / 2;
                      if (before) {
                        if (pills[i].previousSibling !== placeholder) row.insertBefore(placeholder, pills[i]);
                      } else {
                        if (pills[i].nextSibling !== placeholder) row.insertBefore(placeholder, pills[i].nextSibling);
                      }
                      inserted = true;
                      break;
                    }
                  }
                  if (!inserted) {
                    const first = pills[0];
                    const last = pills[pills.length - 1];
                    const firstRect = first.getBoundingClientRect();
                    const lastRect = last.getBoundingClientRect();
                    placeholder.style.width = `${(firstRect || lastRect).width}px`;
                    if (clientY < firstRect.top) {
                      if (first.previousSibling !== placeholder) row.insertBefore(placeholder, first);
                    } else {
                      if (last.nextSibling !== placeholder) row.insertBefore(placeholder, last.nextSibling);
                    }
                  }
                };
                row.addEventListener("dragover", (e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  insertPlaceholderAt(e.clientX, e.clientY);
                });
                row.addEventListener("drop", async (e) => {
                  e.preventDefault();
                  const nodes = Array.from(row.children);
                  let to = 0;
                  for (let i = 0; i < nodes.length; i++) {
                    const node = nodes[i];
                    if (node === placeholder) break;
                    if (node.classList && node.classList.contains("opm-tag-pill")) to++;
                  }
                  let from = dragFromIndex;
                  if (from === null) {
                    const txt = e.dataTransfer.getData("text/plain");
                    const parsed = parseInt(txt, 10);
                    from = Number.isNaN(parsed) ? null : parsed;
                  }
                  if (from === null || from === to) {
                    if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
                    dragFromIndex = null;
                    return;
                  }
                  if (from < to) to = to - 1;
                  const moved = finalOrder.splice(from, 1)[0];
                  finalOrder.splice(Math.max(0, Math.min(finalOrder.length, to)), 0, moved);
                  await window.PromptStorageManager.saveTagsOrder(finalOrder);
                  if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
                  dragFromIndex = null;
                  render();
                });
                const render = () => {
                  row.innerHTML = "";
                  finalOrder.forEach((tag, idx) => {
                    const n = counts.get(tag) || 0;
                    const pill = createEl3("span", { className: `opm-tag-pill opm-${getMode2()}` });
                    const handle = createEl3("span", {
                      styles: { display: "inline-flex", alignItems: "center", marginRight: "6px", cursor: "grab" },
                      innerHTML: `
                    <img 
                      src="${chrome.runtime.getURL("icons/drag_indicator.svg")}" 
                      width="14"
                      height="14"
                      alt="Drag"
                      title="Drag to reorder"
                      style="opacity: 0.9; filter: ${iconFilter()}"
                    >
                  `
                    });
                    handle.setAttribute("draggable", "true");
                    handle.addEventListener("dragstart", (e) => {
                      e.stopPropagation();
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", String(idx));
                      dragFromIndex = idx;
                      try {
                        const rect = pill.getBoundingClientRect();
                        const offsetX = Math.min(8, rect.width / 2);
                        const offsetY = Math.min(8, rect.height / 2);
                        e.dataTransfer.setDragImage(pill, offsetX, offsetY);
                      } catch (_) {
                      }
                    });
                    handle.addEventListener("dragend", () => {
                      if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
                      dragFromIndex = null;
                    });
                    const label = createEl3("span", {}, [`${tag} (${n})`]);
                    const removeBtn = createEl3("button", { innerHTML: "\xD7", styles: { marginLeft: "6px", border: "none", background: "transparent", cursor: "pointer", fontSize: "14px", lineHeight: "1" } });
                    removeBtn.addEventListener("click", async (e) => {
                      e.stopPropagation();
                      if (!confirm(`Remove tag "${tag}" from all prompts?`)) return;
                      try {
                        const prompts = await window.PromptStorageManager.getPrompts();
                        const updated = prompts.map((p) => {
                          const nextTags = Array.isArray(p.tags) ? p.tags.filter((t) => t !== tag) : [];
                          return { ...p, tags: nextTags };
                        });
                        await window.PromptStorageManager.setPrompts(updated);
                        counts = await TagService2.getCounts(updated);
                        finalOrder = finalOrder.filter((t) => t !== tag);
                        await window.PromptStorageManager.saveTagsOrder(finalOrder);
                        render();
                      } catch (_) {
                      }
                    });
                    pill.append(handle, label, removeBtn);
                    row.appendChild(pill);
                  });
                };
                render();
                tagMgmtContainer.appendChild(row);
              } catch (_) {
              }
            })();
            form.append(title, settings, dataSectionTitle, dataActions, deleteAllBtn, tagMgmtTitle, tagMgmtContainer);
            return form;
          },
          async createEditView() {
            const prompts = await window.PromptStorageManager.getPrompts();
            const container = createEl3("div", { className: `opm-form-container opm-view-list opm-${getMode2()}`, styles: { padding: "0", display: "flex", flexDirection: "column", gap: "4px", minHeight: "0" } });
            const promptsContainer = createEl3("div", { className: `${SELECTORS3.PROMPT_ITEMS_CONTAINER} opm-prompt-list-items opm-${getMode2()}`, styles: { maxHeight: "350px", overflowY: "auto", marginBottom: "4px" } });
            const reorder = Reorder.attach(
              promptsContainer,
              prompts,
              async (newPrompts) => {
                prompts.splice(0, prompts.length, ...newPrompts);
                Array.from(promptsContainer.children).filter((node) => node.classList?.contains("opm-prompt-list-item")).forEach((node, idx) => {
                  node.dataset.index = idx;
                });
                await window.PromptStorageManager.setPrompts(newPrompts);
              }
            );
            prompts.forEach((p, idx) => {
              const item = createEl3("div", { className: `opm-prompt-list-item opm-${getMode2()}`, styles: { justifyContent: "space-between", padding: "4px 4px", margin: "6px 0" } });
              item.dataset.index = idx;
              const dragHandle = createEl3("div", {
                className: "opm-drag-handle",
                innerHTML: `
              <img 
                src="${chrome.runtime.getURL("icons/drag_indicator.svg")}" 
                width="16" 
                height="16" 
                alt="Drag handle" 
                title="Drag to reorder"
                style="display: block; opacity: 0.9; filter: ${iconFilter()}"
              >
            `,
                styles: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "16px",
                  height: "16px",
                  marginRight: "4px",
                  marginLeft: "0px",
                  flex: "0 0 auto",
                  cursor: "grab",
                  userSelect: "none",
                  opacity: "0.9"
                }
              });
              reorder.wireItem(item, idx, dragHandle);
              const info = createEl3("div", { styles: { display: "flex", flexDirection: "column", flex: "1", gap: "2px" } });
              const text = createEl3("div", { styles: { flex: "0 0 auto" } });
              text.textContent = p.title;
              info.appendChild(text);
              item.dataset.uuid = p.uuid;
              indexPromptForSearch(p);
              const actions = createEl3("div", { styles: { display: "flex", gap: "4px" } });
              const editIcon = Elements.createIconButton("edit", () => {
                window.PromptUIManager.showEditForm(p);
              });
              const deleteIcon = Elements.createIconButton("delete", () => {
                if (confirm(`Delete "${p.title}"?`)) window.PromptUIManager.deletePrompt(p.uuid);
              });
              actions.append(editIcon, deleteIcon);
              item.append(dragHandle, info, actions);
              promptsContainer.appendChild(item);
            });
            container.appendChild(promptsContainer);
            (async () => {
              const tagsHost = document.querySelector(`#${SELECTORS3.PANEL_CONTENT} .opm-tags-filter-host`);
              if (!tagsHost) return;
              try {
                const enableTags = await window.PromptStorageManager.getEnableTags();
                if (!enableTags) {
                  tagsHost.style.display = "none";
                  return;
                }
                const counts = await TagService2.getCounts(prompts);
                if (counts.size === 0) {
                  tagsHost.style.display = "none";
                  return;
                }
                const ordered = await TagService2.getOrderedTags(counts);
                let persisted = "all";
                try {
                  persisted = (await window.PromptStorageManager.getActiveTagFilter() || "all").toLowerCase();
                } catch (_) {
                  persisted = "all";
                }
                const prev = (window.PromptUIManager.activeTagFilter || persisted || "all").toLowerCase();
                const selected = prev !== "all" && counts.has(prev) ? prev : "all";
                window.PromptUIManager.activeTagFilter = selected;
                const bar = Elements.createTagsBar({
                  tags: ordered,
                  counts,
                  selectedTag: selected,
                  onSelect: (tag) => {
                    window.PromptUIManager.filterByTag(tag);
                  }
                });
                tagsHost.replaceWith(bar);
                window.ScrollVisibilityManager?.observe(bar);
                window.PromptUIManager.filterByTag(selected);
              } catch (_) {
                tagsHost.style.display = "none";
              }
            })();
            return container;
          }
        };
        const Behaviors = {
          showList(listEl) {
            showEl2(listEl);
          },
          hideList(listEl) {
            hideEl2(listEl);
          },
          startCloseTimer(listEl, onClose) {
            if (State.closeTimer) clearTimeout(State.closeTimer);
            State.closeTimer = setTimeout(() => {
              try {
                if (typeof onClose === "function") onClose();
              } finally {
                Behaviors.hideList(listEl);
                State.closeTimer = null;
              }
            }, window.PROMPT_CLOSE_DELAY || 1e4);
          },
          cancelCloseTimer() {
            if (State.closeTimer) clearTimeout(State.closeTimer);
            State.closeTimer = null;
          }
        };
        const Events = {
          attachButtonEvents(button, listEl) {
            let isOpen = false;
            const startClose = (e) => {
              if (e) e.stopPropagation();
              Behaviors.startCloseTimer(listEl, () => {
                isOpen = false;
              });
            };
            button.addEventListener("click", (e) => {
              e.stopPropagation();
              State.manuallyOpened = true;
              isOpen ? Behaviors.hideList(listEl) : Behaviors.showList(listEl);
              isOpen = !isOpen;
            });
            button.addEventListener("mouseenter", async (e) => {
              e.stopPropagation();
              Behaviors.cancelCloseTimer();
              const listIsVisible = listEl.classList.contains("opm-visible");
              if (!listIsVisible && !window.PromptUIManager.inVariableInputMode) {
                window.PromptUIManager.manuallyOpened = false;
                await window.PromptUIManager.mountListOrCreateBasedOnPrompts();
                isOpen = true;
              } else {
                isOpen = true;
              }
            });
            button.addEventListener("mouseleave", startClose);
            listEl.addEventListener("mouseenter", Behaviors.cancelCloseTimer);
            listEl.addEventListener("mouseleave", startClose);
          }
        };
        return Object.freeze({ State, Elements, Views, Behaviors, Events });
      })();
      window.PromptUI = PromptUI2;
    }
    window.__initPromptShared = initPromptManagerShared;
  })();

  // ai-operations.js
  var _aiPort = null;
  var _aiReqId = 0;
  function aiPort() {
    if (!_aiPort) {
      _aiPort = chrome.runtime.connect({ name: "pf-ai" });
      _aiPort.onDisconnect.addListener(() => {
        _aiPort = null;
      });
    }
    return _aiPort;
  }
  function ollamaRPC(message) {
    return new Promise((resolve, reject) => {
      const port = aiPort();
      const id = ++_aiReqId;
      const onMessage = (msg) => {
        if (!msg || msg.id !== id) return;
        if (msg.error !== void 0) {
          port.onMessage.removeListener(onMessage);
          reject(new Error(msg.error));
        } else if ("result" in msg) {
          port.onMessage.removeListener(onMessage);
          resolve(msg.result);
        }
      };
      port.onMessage.addListener(onMessage);
      port.postMessage({ id, ...message });
    });
  }
  function ollamaStream(message) {
    const port = aiPort();
    const id = ++_aiReqId;
    const queue = [];
    let resolveNext = null;
    let done = false;
    let error = null;
    const onMessage = (msg) => {
      if (!msg || msg.id !== id) return;
      if (msg.error !== void 0) error = new Error(msg.error);
      else if (msg.chunk !== void 0) queue.push(msg.chunk);
      if (msg.done || msg.error !== void 0) done = true;
      if (resolveNext) {
        const r = resolveNext;
        resolveNext = null;
        r();
      }
    };
    port.onMessage.addListener(onMessage);
    port.postMessage({ id, ...message });
    const gen = (async function* () {
      try {
        while (true) {
          if (queue.length > 0) {
            yield queue.shift();
            continue;
          }
          if (done) {
            if (error) throw error;
            return;
          }
          await new Promise((r) => {
            resolveNext = r;
          });
        }
      } finally {
        port.onMessage.removeListener(onMessage);
      }
    })();
    gen.cancel = () => {
      try {
        port.postMessage({ id, cancel: true });
      } catch {
      }
    };
    return gen;
  }
  function looksLikeResponseInsteadOfPrompt(text) {
    return /^(I |I'll |I can |I cannot |I'm |I am |As an AI|Sure,|Here's|Okay,|Great question)/i.test(text.trim());
  }
  function _toast(msg, type = "info", duration = 2500) {
    const t = createEl("div", {}, [msg]);
    t.style.cssText = "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);padding:8px 16px;border-radius:8px;font-size:13px;z-index:100001;color:#fff;transition:opacity 0.2s;";
    t.style.backgroundColor = type === "error" ? "#dc3545" : type === "success" ? "#198754" : "#1a73e8";
    document.body.appendChild(t);
    setTimeout(() => {
      t.style.opacity = "0";
      setTimeout(() => t.remove(), 200);
    }, duration);
  }
  async function improvePrompt(promptUuid, listEl) {
    try {
      const prompts = await PromptStorageManager.getPrompts();
      const prompt = prompts.find((p) => p.uuid === promptUuid);
      if (!prompt) return;
      const original = prompt.content;
      let buffer = "";
      let improving = true;
      const statusDiv = createEl("div", { className: "opm-improving-status" });
      statusDiv.style.cssText = "position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1a73e8;color:#fff;padding:8px 16px;border-radius:8px;font-size:13px;z-index:100000;display:flex;align-items:center;gap:8px;";
      const statusLabel = createEl("span", {}, ["Improving\u2026"]);
      const stopButton = createEl("button");
      stopButton.style.cssText = "background:rgba(255,255,255,0.3);border:none;color:#fff;padding:2px 8px;border-radius:4px;cursor:pointer;";
      stopButton.textContent = "Stop";
      statusDiv.append(statusLabel, stopButton);
      const stream = ollamaStream({ op: "improve", promptText: original });
      stopButton.addEventListener("click", () => {
        improving = false;
        stream.cancel();
        statusDiv.remove();
      });
      document.body.appendChild(statusDiv);
      try {
        for await (const chunk of stream) {
          if (!improving) break;
          buffer += chunk;
        }
      } finally {
        statusDiv.remove();
      }
      if (!improving || !buffer.trim()) return;
      buffer = buffer.replace(/^(?:here|sure|okay|the improved|improved|below)[^\n]*\n?/i, "").trim();
      if (buffer && looksLikeResponseInsteadOfPrompt(buffer)) {
        throw new Error("Model produced a response instead of a rewritten prompt");
      }
      if (buffer) {
        await PromptStorageManager.addVersion(promptUuid, buffer, "ai_improvement");
        await PromptStorageManager._ps().then((ps) => ps.updatePrompt(promptUuid, { content: buffer }));
        if (listEl) PromptUIManager.refreshPromptList(await PromptStorageManager.getPrompts());
        _toast("Prompt improved!", "success");
      }
    } catch (e) {
      if (!/abort/i.test(e.message || "")) {
        console.error("Improve failed:", e);
        _toast("Improvement failed: " + e.message, "error");
      }
    }
  }
  async function generateVariants(promptUuid, listEl) {
    try {
      const prompts = await PromptStorageManager.getPrompts();
      const prompt = prompts.find((p) => p.uuid === promptUuid);
      if (!prompt) return;
      const statusDiv = createEl("div", { className: "opm-improving-status" });
      statusDiv.style.cssText = "position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1a73e8;color:#fff;padding:8px 16px;border-radius:8px;font-size:13px;z-index:100000;";
      statusDiv.textContent = "Generating variants\u2026";
      document.body.appendChild(statusDiv);
      let variants = [];
      try {
        variants = await ollamaRPC({ op: "variants", promptText: prompt.content, count: 3 });
      } finally {
        statusDiv.remove();
      }
      if (variants && variants.length > 0) {
        const g = "variant-group-" + Date.now();
        for (let i = 0; i < variants.length; i++) {
          await PromptStorageManager.addVersion(promptUuid, variants[i], "ai_variant", { variantGroup: g, variantIndex: i + 1 });
        }
        if (listEl) PromptUIManager.refreshPromptList(await PromptStorageManager.getPrompts());
        _toast(`Generated ${variants.length} variants!`, "success");
      }
    } catch (e) {
      console.error("Variants failed:", e);
      _toast("Variant generation failed: " + e.message, "error");
    }
  }
  async function autoSuggestMetadata(promptUuid, listEl) {
    try {
      const prompts = await PromptStorageManager.getPrompts();
      const prompt = prompts.find((p) => p.uuid === promptUuid);
      if (!prompt) return;
      const data = await chrome.storage.local.get({ autoSuggestMetadata: true });
      if (!data.autoSuggestMetadata) return;
      const metadata = await ollamaRPC({ op: "suggest", promptText: prompt.content });
      const updates = {};
      if ((!prompt.title || prompt.title === "Untitled Prompt") && metadata.title && metadata.title !== "Untitled Prompt") {
        updates.title = metadata.title;
      }
      if (!prompt.category && metadata.category && metadata.category !== "Other") {
        updates.category = metadata.category;
      }
      if (!Array.isArray(prompt.tags) || prompt.tags.length === 0) {
        const filteredTags = (metadata.tags || []).filter((t) => t !== "untagged");
        if (filteredTags.length > 0) updates.tags = filteredTags;
      }
      if (Object.keys(updates).length > 0) {
        const ps = await PromptStorageManager._ps();
        await ps.updatePrompt(promptUuid, { ...updates, updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
        if (listEl) PromptUIManager.refreshPromptList(await PromptStorageManager.getPrompts());
      }
    } catch (e) {
      console.warn("Auto-suggest failed:", e);
    }
  }
  window.PFAIOperations = { improvePrompt, generateVariants, autoSuggestMetadata };

  // content.js
  var __PF_ALREADY_INITIALIZED = !!window.__OPM_PROMPT_MANAGER_INITIALIZED;
  window.__OPM_PROMPT_MANAGER_INITIALIZED = true;
  var ensureStylesInjected = /* @__PURE__ */ (() => {
    let injected = false;
    return () => {
      if (injected) return;
      try {
        injectGlobalStyles();
        injected = true;
      } catch (err) {
        console.error("[PromptManager] Failed to inject global styles safely:", err);
      }
    };
  })();
  if (!__PF_ALREADY_INITIALIZED) {
    ensureStylesInjected();
  }
  var ChromeBridge = /* @__PURE__ */ (() => {
    const safeAsync = async (executor, fallback) => {
      try {
        return await executor();
      } catch (error) {
        console.error("[PromptManager] safeAsync captured error:", error);
        return fallback;
      }
    };
    const storage = {
      /**
       * COMMENT: Read from chrome.storage.local with consistent error handling.
       * @param {string} key
       * @param {any} fallback
       * @returns {Promise<any>}
       */
      async get(key, fallback) {
        if (!chrome?.storage?.local) return fallback;
        return safeAsync(() => new Promise((resolve) => {
          chrome.storage.local.get(key, (data) => {
            if (chrome.runtime?.lastError) {
              console.warn(`[PromptManager] chrome.storage.get failed for ${key}:`, chrome.runtime.lastError.message);
              resolve(fallback);
              return;
            }
            if (key && typeof key === "string") {
              resolve(data?.[key] !== void 0 ? data[key] : fallback);
            } else {
              resolve(data ?? fallback);
            }
          });
        }), fallback);
      },
      /**
       * COMMENT: Write to chrome.storage.local and surface boolean success.
       * @param {string} key
       * @param {any} value
       * @returns {Promise<boolean>}
       */
      async set(key, value) {
        if (!chrome?.storage?.local) return false;
        return safeAsync(() => new Promise((resolve) => {
          chrome.storage.local.set({ [key]: value }, () => {
            if (chrome.runtime?.lastError) {
              console.warn(`[PromptManager] chrome.storage.set failed for ${key}:`, chrome.runtime.lastError.message);
              resolve(false);
              return;
            }
            resolve(true);
          });
        }), false);
      }
    };
    return { safeAsync, storage };
  })();
  var HIDE_ANIMATION_MS = 200;
  var MUTATION_DEBOUNCE_MS = 300;
  var SEARCH_FOCUS_DELAY_MS = 50;
  var ONBOARDING_AUTO_HIDE_MS = 1e4;
  var ONBOARDING_FADE_OUT_MS = 300;
  var SCROLLBAR_PERSIST_MS = 900;
  var HOT_CORNER_INDICATOR_SMALL_PX = 20;
  var HOT_CORNER_INDICATOR_LARGE_PX = 30;
  var createEl2 = (tag, { id, className, styles, attributes, innerHTML, eventListeners } = {}, children = null) => {
    const el = document.createElement(tag);
    if (id) el.id = id;
    if (className) el.className = className;
    if (styles) Object.assign(el.style, styles);
    if (attributes) Object.entries(attributes).forEach(([k, v]) => el.setAttribute(k, v));
    if (innerHTML) el.innerHTML = innerHTML;
    if (eventListeners) Object.entries(eventListeners).forEach(([evt, handler]) => el.addEventListener(evt, handler));
    if (children != null) {
      const arr = Array.isArray(children) ? children : [children];
      for (const c of arr) {
        if (c == null || typeof c === "function") continue;
        el.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
      }
    }
    return el;
  };
  window.createEl = createEl2;
  var debounce = (fn, wait = 100) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(null, args), wait);
    };
  };
  var getMode = () => isDarkMode() ? "dark" : "light";
  var getIconFilter = () => isDarkMode() ? "invert(93%) sepia(0%) saturate(0%) hue-rotate(213deg) brightness(107%) contrast(87%)" : "invert(37%) sepia(74%) saturate(380%) hue-rotate(175deg) brightness(93%) contrast(88%)";
  window.getMode = getMode;
  window.getIconFilter = getIconFilter;
  var showEl = (el) => {
    const isPromptList = el.classList && el.classList.contains("opm-prompt-list");
    if (el._opmHideTimer) {
      clearTimeout(el._opmHideTimer);
      el._opmHideTimer = null;
    }
    el.style.display = isPromptList ? "flex" : "block";
    void el.offsetHeight;
    el.classList.add("opm-visible");
  };
  var hideEl = (el) => {
    el.classList.remove("opm-visible");
    if (el._opmHideTimer) clearTimeout(el._opmHideTimer);
    el._opmHideTimer = setTimeout(() => {
      el._opmHideTimer = null;
      if (el.classList.contains("opm-visible")) return;
      el.style.display = "none";
      const items = el.querySelector(`.${SELECTORS.PROMPT_ITEMS_CONTAINER}`);
      if (items) Array.from(items.children).forEach((i) => i.style.display = "flex");
    }, HIDE_ANIMATION_MS);
  };
  window.showEl = showEl;
  window.hideEl = hideEl;
  var Theme = {
    // Apply current mode class to a single node
    applyNode(node) {
      if (!node) return;
      node.classList?.remove("opm-light", "opm-dark");
      node.classList?.add(`opm-${getMode()}`);
    },
    // Apply to all nodes that opt into theming within our root
    applyAll() {
      const root = document.getElementById(SELECTORS.ROOT);
      if (!root) return;
      root.classList.toggle("opm-dark", isDarkMode());
      root.classList.toggle("opm-light", !isDarkMode());
      const themedNodes = root.querySelectorAll('[class*="opm-"]');
      themedNodes.forEach((el) => this.applyNode(el));
    }
  };
  var $root = () => document.getElementById(SELECTORS.ROOT);
  var qs = (sel, root = $root()) => root ? root.querySelector(sel) : null;
  var PanelView = Object.freeze({
    LIST: "LIST",
    CREATE: "CREATE",
    EDIT: "EDIT",
    SETTINGS: "SETTINGS",
    HELP: "HELP",
    VARIABLE_INPUT: "VARIABLE_INPUT"
  });
  window.PanelView = PanelView;
  var ScrollVisibilityManager = /* @__PURE__ */ (() => {
    const observers = /* @__PURE__ */ new WeakMap();
    const ACTIVITY_EVENTS = ["scroll", "wheel", "touchmove"];
    const markActive = (node, state) => {
      node.classList.add("opm-scroll-active");
      clearTimeout(state.timer);
      state.timer = setTimeout(() => {
        node.classList.remove("opm-scroll-active");
      }, SCROLLBAR_PERSIST_MS);
    };
    const ensureListeners = (node) => {
      const state = { timer: null };
      const handler = () => markActive(node, state);
      ACTIVITY_EVENTS.forEach((evt) => node.addEventListener(evt, handler, { passive: true }));
      observers.set(node, state);
    };
    return {
      observe(node) {
        if (!node || observers.has(node)) return;
        node.classList.add("opm-scrollable");
        ensureListeners(node);
      }
    };
  })();
  window.ScrollVisibilityManager = ScrollVisibilityManager;
  var PanelRouter = (() => {
    const state = {
      currentView: null
    };
    const createInfoView = ({ titleText, contentId, sourcePath }) => {
      const dark = isDarkMode();
      const container = createEl2("div", {
        className: `opm-form-container opm-${getMode()}`,
        styles: { padding: "0", display: "flex", flexDirection: "column", gap: "6px" }
      });
      const title = createEl2("div", {
        styles: { fontWeight: "bold", fontSize: "16px", marginBottom: "6px" },
        innerHTML: titleText
      });
      const info = createEl2("div", {
        id: contentId,
        styles: {
          maxHeight: "410px",
          overflowY: "auto",
          padding: "4px",
          borderRadius: "6px",
          color: dark ? THEME_COLORS.inputDarkText : THEME_COLORS.inputLightText
        }
      });
      container.append(title, info);
      fetch(chrome.runtime.getURL(sourcePath)).then((r) => r.text()).then((html) => {
        info.innerHTML = html;
      }).catch((err) => console.error(`[PromptManager] Failed to load ${sourcePath}:`, err));
      ScrollVisibilityManager.observe(info);
      return container;
    };
    const VIEW_DEFINITIONS = {
      [PanelView.LIST]: {
        kind: "list",
        panelHeight: "variable",
        searchVisible: true,
        alwaysRebuild: true,
        description: "Prompt list view needs live data + persisted tags every time.",
        async controller(listEl) {
          try {
            PromptUIManager2.setListMode("list");
            const prompts = await PromptStorageManager2.getPrompts();
            let savedTag = "all";
            try {
              savedTag = await PromptStorageManager2.getActiveTagFilter() || "all";
            } catch (_) {
              savedTag = "all";
            }
            PromptUIManager2.activeTagFilter = savedTag;
            PromptUIManager2.refreshPromptList(prompts);
            PromptUIManager2.filterByTag(savedTag);
            PromptUIManager2.showPromptList(listEl);
          } catch (err) {
            console.error("[PromptManager] Failed to render LIST view:", err);
          }
        }
      },
      [PanelView.CREATE]: {
        builder: () => PromptUIManager2.createPromptCreationForm(""),
        panelHeight: "fixed",
        searchVisible: false,
        description: "Create view uses fixed-height form; search stays hidden."
      },
      [PanelView.EDIT]: {
        kind: "list",
        panelHeight: "variable",
        searchVisible: true,
        alwaysRebuild: true,
        description: "Edit view reuses the prompt list with edit + reorder controls.",
        async controller(listEl) {
          try {
            PromptUIManager2.setListMode("edit");
            const prompts = await PromptStorageManager2.getPrompts();
            let savedTag = "all";
            try {
              savedTag = await PromptStorageManager2.getActiveTagFilter() || "all";
            } catch (_) {
              savedTag = "all";
            }
            PromptUIManager2.activeTagFilter = savedTag;
            PromptUIManager2.refreshPromptList(prompts);
            PromptUIManager2.filterByTag(savedTag);
            PromptUIManager2.showPromptList(listEl);
          } catch (err) {
            console.error("[PromptManager] Failed to render EDIT view:", err);
          }
        }
      },
      [PanelView.SETTINGS]: {
        builder: () => PromptUIManager2.createSettingsForm(),
        panelHeight: "fixed",
        searchVisible: false,
        description: "Settings is a standalone form with no search."
      },
      [PanelView.HELP]: {
        builder: () => createInfoView({
          titleText: "Navigation & Features",
          contentId: SELECTORS.INFO_CONTENT,
          sourcePath: "info.html"
        }),
        panelHeight: "fixed",
        searchVisible: false,
        description: "Help content is static HTML pulled from info.html."
      },
      [PanelView.VARIABLE_INPUT]: {
        builder: (context) => PromptUIManager2.createVariableInputForm(context),
        panelHeight: "fixed",
        searchVisible: false,
        description: "Variable input form that collects placeholder values before insertion.",
        requiresContext: true,
        alwaysRebuild: true
      }
    };
    const applyViewChrome = (definition) => {
      const heightMode = definition.panelHeight === "variable" ? "variable" : "fixed";
      PromptUIManager2.setPanelHeightMode(heightMode);
      PromptUIManager2.setSearchVisibility(definition.searchVisible !== false);
      Theme.applyAll();
    };
    const mount = async (view, context = void 0) => {
      const definition = VIEW_DEFINITIONS[view];
      if (!definition) return;
      if (definition.requiresContext && !context) {
        console.warn(`[PromptManager] Missing context for view ${view}`);
        return;
      }
      const listEl = qs(`#${SELECTORS.PROMPT_LIST}`);
      if (!listEl) return;
      if (state.currentView === view && !definition.alwaysRebuild) {
        PromptUIManager2.showPromptList(listEl);
        return;
      }
      state.currentView = view;
      PromptUIManager2.inVariableInputMode = view === PanelView.VARIABLE_INPUT;
      if (definition.kind === "list") {
        applyViewChrome(definition);
        await definition.controller(listEl);
        return;
      }
      const builder = definition.builder;
      if (!builder) return;
      PromptUIManager2.resetPromptListContainer();
      let node = null;
      try {
        node = await builder(context);
      } catch (err) {
        console.error(`[PromptManager] Failed to build view "${view}":`, err);
        return;
      }
      if (!node) return;
      PromptUIManager2.replacePanelMainContent(node);
      applyViewChrome(definition);
      PromptUIManager2.showPromptList(listEl);
    };
    return { mount };
  })();
  window.PanelRouter = PanelRouter;
  var OutsideClickCloser = /* @__PURE__ */ (() => {
    let attached = false;
    const handler = (e) => {
      const listEl = qs(`#${SELECTORS.PROMPT_LIST}`);
      if (!listEl || !listEl.classList.contains("opm-visible")) return;
      const isMenu = e.target.closest(`#${SELECTORS.PROMPT_LIST}`) || e.target.closest(`.${SELECTORS.PROMPT_ITEMS_CONTAINER}`) || e.target.closest(".opm-icon-button") || e.target.closest(".opm-form-container") || e.target.closest(".opm-button");
      if (!isMenu) PromptUIManager2.hidePromptList(listEl);
    };
    return {
      ensure() {
        if (attached) return;
        document.addEventListener("click", handler);
        attached = true;
      }
    };
  })();
  var KeyboardManager = class _KeyboardManager {
    static initialized = false;
    static shortcutCache = null;
    static initialize() {
      if (_KeyboardManager.initialized) return;
      _KeyboardManager.initialized = true;
      document.addEventListener("keydown", _KeyboardManager._onKeyDown);
      _KeyboardManager._loadShortcut();
      _KeyboardManager._attachShortcutWatcher();
    }
    static async _onKeyDown(e) {
      const shortcut = _KeyboardManager.shortcutCache || await PromptStorageManager2.getKeyboardShortcut();
      if (!_KeyboardManager.shortcutCache && shortcut) _KeyboardManager.shortcutCache = shortcut;
      if (e[shortcut.modifier] && (shortcut.requiresShift ? e.shiftKey : true) && e.key.toLowerCase() === shortcut.key.toLowerCase()) {
        e.preventDefault();
        _KeyboardManager._togglePromptList();
        return;
      }
      if (e.key === "Escape") {
        PromptUIManager2.handleGlobalEscape(e);
        return;
      }
      const searchEl = document.getElementById(SELECTORS.PROMPT_SEARCH_INPUT);
      const isSearchActive = document.activeElement === searchEl;
      if (["ArrowUp", "ArrowDown", "Enter"].includes(e.key)) {
        PromptUIManager2.handleKeyboardNavigation(e, isSearchActive ? "search" : "list");
      }
    }
    static async _togglePromptList() {
      const listEl = qs(`#${SELECTORS.PROMPT_LIST}`);
      if (!listEl) return;
      if (listEl.classList.contains("opm-visible")) {
        PromptUIManager2.hidePromptList(listEl);
      } else {
        PromptUIManager2.manuallyOpened = true;
        await PromptUIManager2.mountListOrCreateBasedOnPrompts();
      }
    }
    static async _loadShortcut() {
      try {
        _KeyboardManager.shortcutCache = await PromptStorageManager2.getKeyboardShortcut();
      } catch (_) {
      }
    }
    static _attachShortcutWatcher() {
      if (!chrome || !chrome.storage || !chrome.storage.onChanged) return;
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== "local") return;
        if (changes && changes.keyboardShortcut && changes.keyboardShortcut.newValue) {
          _KeyboardManager.shortcutCache = changes.keyboardShortcut.newValue;
        }
      });
    }
  };
  if (!__PF_ALREADY_INITIALIZED) {
    ensureStylesInjected();
  }
  var isDarkModeActive = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (typeof window.isDarkModeForced === "undefined") window.isDarkModeForced = false;
  var isDarkMode = () => window.isDarkModeForced ? true : isDarkModeActive;
  if (window.matchMedia && !__PF_ALREADY_INITIALIZED) {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    mql.addEventListener("change", (e) => {
      isDarkModeActive = e.matches;
      PromptUIManager2.updateThemeForUI();
    });
  }
  var EventBus = class {
    constructor() {
      this.events = {};
    }
    on(evt, listener) {
      (this.events[evt] = this.events[evt] || []).push(listener);
    }
    emit(evt, ...args) {
      (this.events[evt] || []).forEach((fn) => fn(...args));
    }
  };
  var PromptStorageManager2 = class _PromptStorageManager {
    // Generic local-storage helpers (still used by non-prompt features)
    static async getData(key, def) {
      return await ChromeBridge.storage.get(key, def);
    }
    static async setData(key, value) {
      return await ChromeBridge.storage.set(key, value);
    }
    // ---- Unified prompt operations ----
    static async _ps() {
      if (this.__ps) return this.__ps;
      const mod = await import(chrome.runtime.getURL("promptStorage.js"));
      this.__ps = mod;
      return this.__ps;
    }
    static async getPrompts() {
      const ps = await this._ps();
      return await ps.getPrompts();
    }
    static async savePrompt(prompt) {
      const ps = await this._ps();
      const result = await ps.savePrompt(prompt);
      if (result && result.prompt && result.prompt.uuid && result.prompt.content) {
        try {
          await _PromptStorageManager.addVersion(result.prompt.uuid, result.prompt.content, "user_input");
        } catch {
        }
        try {
          await PromptUIManager2.autoSuggestMetadata(result.prompt.uuid, qs(`#${SELECTORS.PROMPT_LIST}`));
        } catch {
        }
      }
      return result;
    }
    static async setPrompts(prompts) {
      const ps = await this._ps();
      return await ps.setPrompts(prompts);
    }
    static async mergeImportedPrompts(imported) {
      const ps = await this._ps();
      return await ps.importPrompts(imported);
    }
    static async addVersion(promptUuid, content, source = "manual_edit", metadata = {}) {
      const ps = await this._ps();
      try {
        return await ps.addVersion(promptUuid, content, source, metadata);
      } catch {
        return null;
      }
    }
    static async getVersions(promptUuid) {
      const ps = await this._ps();
      try {
        return await ps.getVersions(promptUuid);
      } catch {
        return [];
      }
    }
    static async restoreVersion(promptUuid, versionIndex) {
      const ps = await this._ps();
      try {
        return await ps.restoreVersion(promptUuid, versionIndex);
      } catch {
        return null;
      }
    }
    static async getButtonPosition() {
      return await _PromptStorageManager.getData("buttonPosition", { x: 75, y: 100 });
    }
    static async saveButtonPosition(pos) {
      const current = await _PromptStorageManager.getButtonPosition();
      if (current.x === pos.x && current.y === pos.y) return true;
      return await _PromptStorageManager.setData("buttonPosition", pos);
    }
    static async getKeyboardShortcut() {
      const platform = (navigator.userAgentData?.platform ?? navigator.platform ?? "").toUpperCase();
      const isMac = platform.includes("MAC");
      return await _PromptStorageManager.getData("keyboardShortcut", {
        key: isMac ? "p" : "m",
        modifier: isMac ? "metaKey" : "ctrlKey",
        requiresShift: isMac
      });
    }
    static async saveKeyboardShortcut(shortcut) {
      return await _PromptStorageManager.setData("keyboardShortcut", shortcut);
    }
    static async getOnboardingCompleted() {
      return await _PromptStorageManager.getData("onboardingCompleted", false);
    }
    static async setOnboardingCompleted() {
      return await _PromptStorageManager.setData("onboardingCompleted", true);
    }
    static async getDisplayMode() {
      return await _PromptStorageManager.getData("displayMode", "standard");
    }
    static async saveDisplayMode(mode) {
      return await _PromptStorageManager.setData("displayMode", mode);
    }
    static async getForceDarkMode() {
      return await _PromptStorageManager.getData("forceDarkMode", false);
    }
    static async saveForceDarkMode(enabled) {
      return await _PromptStorageManager.setData("forceDarkMode", !!enabled);
    }
    // COMMENT: Preference to append prompts instead of overwriting the input area
    static async getDisableOverwrite() {
      return await _PromptStorageManager.getData("disableOverwrite", false);
    }
    static async saveDisableOverwrite(value) {
      return await _PromptStorageManager.setData("disableOverwrite", !!value);
    }
    // COMMENT: Feature flag for tags in prompt creation UI (off by default)
    static async getEnableTags() {
      return await _PromptStorageManager.getData("enableTags", false);
    }
    static async saveEnableTags(value) {
      return await _PromptStorageManager.setData("enableTags", !!value);
    }
    // COMMENT: Persist the active tag filter across sessions (LIST view)
    static async getActiveTagFilter() {
      return await _PromptStorageManager.getData("activeTagFilter", "all");
    }
    static async saveActiveTagFilter(tag) {
      const clean = tag || "all";
      return await _PromptStorageManager.setData("activeTagFilter", clean);
    }
    // COMMENT: Persistent custom display order for tags in settings (array of tag names)
    static async getTagsOrder() {
      return await _PromptStorageManager.getData("tagsOrder", []);
    }
    static async saveTagsOrder(order) {
      if (!Array.isArray(order)) return false;
      return await _PromptStorageManager.setData("tagsOrder", order);
    }
  };
  window.PromptStorageManager = PromptStorageManager2;
  var PromptUIManager2 = class _PromptUIManager {
    // COMMENT: Configuration for the info banner. Toggle 'active' to show/hide.
    static BANNER_CONFIG = {
      active: true,
      id: "info-banner-v2",
      // Change ID to re-show to users who dismissed it
      html: `<span>
      <strong>New:</strong> select text, right click & save as a new prompt! </br></br>
      Enjoy the extension? 
      <a href="https://chromewebstore.google.com/detail/open-prompt-manager/gmhaghdbihgenofhnmdbglbkbplolain" target="_blank" rel="noopener noreferrer" style="color:#3674B5;text-decoration:underline;">Leave a review</a>!
    </span>`
    };
    static state = {
      root: null,
      currentMode: null,
      buttonContainer: null,
      hotCornerContainer: null,
      hotCornerVisibilityHandler: null,
      lastPromptsSignature: null,
      listMode: "list",
      tagsBar: null,
      suppressNextListRefresh: false
    };
    static _ensureRoot() {
      let root = _PromptUIManager.state.root;
      if (root && document.body.contains(root)) return root;
      root = document.getElementById(SELECTORS.ROOT);
      if (!root) {
        root = createEl2("div", { id: SELECTORS.ROOT });
        document.body.appendChild(root);
        root.classList.add(`opm-${getMode()}`);
      }
      _PromptUIManager.state.root = root;
      return root;
    }
    // COMMENT: Toggle panel height mode: 'variable' (LIST) or 'fixed' (other views)
    static setPanelHeightMode(mode) {
      const listEl = qs(`#${SELECTORS.PROMPT_LIST}`);
      if (!listEl) return;
      listEl.classList.remove("opm-fixed-400", "opm-variable");
      if (mode === "variable") listEl.classList.add("opm-variable");
      else listEl.classList.add("opm-fixed-400");
    }
    // COMMENT: Track whether the active list should expose editing controls or standard view.
    static setListMode(mode = "list") {
      const normalized = mode === "edit" ? "edit" : "list";
      _PromptUIManager.state.listMode = normalized;
      _PromptUIManager.applyListModeClass();
    }
    static applyListModeClass() {
      const root = _PromptUIManager._ensureRoot();
      root.classList.toggle("opm-edit-mode-active", _PromptUIManager.state.listMode === "edit");
    }
    static requestListRefreshSuppression() {
      _PromptUIManager.state.suppressNextListRefresh = true;
    }
    // COMMENT: Map manager flags to PromptUI.State via accessors
    static get manuallyOpened() {
      return PromptUI.State.manuallyOpened;
    }
    static set manuallyOpened(v) {
      PromptUI.State.manuallyOpened = v;
    }
    static get inVariableInputMode() {
      return PromptUI.State.inVariableInputMode;
    }
    static set inVariableInputMode(v) {
      PromptUI.State.inVariableInputMode = v;
    }
    static onPromptSelect(cb) {
      _PromptUIManager._eb.on("promptSelect", cb);
    }
    static emitPromptSelect(prompt) {
      _PromptUIManager._eb.emit("promptSelect", prompt);
    }
    static _eb = new EventBus();
    // COMMENT: Removed panel height lock; CSS now enforces min/max height across views
    static injectPromptManagerButton(prompts) {
      if (_PromptUIManager.state.buttonContainer && document.body.contains(_PromptUIManager.state.buttonContainer)) {
        _PromptUIManager.refreshPromptList(prompts);
        return;
      }
      PromptStorageManager2.getButtonPosition().then((pos) => {
        const container = createEl2("div", { id: SELECTORS.PROMPT_BUTTON_CONTAINER, styles: UI_STYLES.getPromptButtonContainerStyle(pos) });
        const button = createEl2("button", { id: SELECTORS.PROMPT_BUTTON, className: "opm-prompt-button" });
        container.appendChild(button);
        const listEl = createEl2("div", { id: SELECTORS.PROMPT_LIST, className: `opm-prompt-list opm-${getMode()} opm-fixed-400` });
        container.appendChild(listEl);
        _PromptUIManager._ensureRoot().appendChild(container);
        _PromptUIManager.refreshPromptList(prompts);
        _PromptUIManager.attachButtonEvents(button, listEl, container, prompts);
        _PromptUIManager.makeDraggable(container);
        _PromptUIManager.checkAndShowOnboarding(container);
        OutsideClickCloser.ensure();
        _PromptUIManager.state.buttonContainer = container;
        _PromptUIManager.state.hotCornerContainer = null;
        _PromptUIManager.state.currentMode = "standard";
      });
    }
    static async checkAndShowOnboarding(container) {
      const onboardingCompleted = await PromptStorageManager2.getOnboardingCompleted();
      if (!onboardingCompleted) {
        _PromptUIManager.showOnboardingPopup(container);
      }
    }
    static showOnboardingPopup(container) {
      const existingPopup = document.getElementById(SELECTORS.ONBOARDING_POPUP);
      if (existingPopup) existingPopup.remove();
      const popup = createEl2("div", {
        id: SELECTORS.ONBOARDING_POPUP,
        className: `opm-onboarding-popup opm-${getMode()}`,
        styles: {
          position: "absolute",
          top: "-42px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: `${THEME_COLORS.primary}dd`,
          color: "white",
          padding: "6px 10px",
          borderRadius: "6px",
          fontSize: "13px",
          fontWeight: "bold",
          zIndex: "10000",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.15)",
          textAlign: "center",
          whiteSpace: "nowrap",
          transition: "opacity 0.3s ease"
        },
        innerHTML: "Hover to Start"
      });
      const triangle = createEl2("div", {
        styles: {
          position: "absolute",
          bottom: "-4px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "0",
          height: "0",
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: `5px solid ${THEME_COLORS.primary}dd`
        }
      });
      popup.appendChild(triangle);
      container.appendChild(popup);
      setTimeout(() => {
        if (popup && popup.parentNode) {
          popup.style.opacity = "0";
          setTimeout(() => {
            if (popup && popup.parentNode) popup.remove();
          }, ONBOARDING_FADE_OUT_MS);
        }
      }, ONBOARDING_AUTO_HIDE_MS);
    }
    static attachButtonEvents(button, listEl) {
      PromptUI.Events.attachButtonEvents(button, listEl);
    }
    static startCloseTimer(e, listEl, callback) {
      PromptUI.Behaviors.startCloseTimer(listEl, callback);
    }
    static cancelCloseTimer() {
      PromptUI.Behaviors.cancelCloseTimer();
    }
    static makeDraggable(container) {
      let pos = { x: 0, y: 0 };
      PromptStorageManager2.getButtonPosition().then((savedPos) => {
        pos = savedPos;
        Object.assign(container.style, {
          right: `${pos.x}px`,
          bottom: `${pos.y}px`
        });
      });
      container.addEventListener("mousedown", (startEvent) => {
        if (startEvent.target.id !== SELECTORS.PROMPT_BUTTON) return;
        const startX = startEvent.clientX;
        const startY = startEvent.clientY;
        const startRight = parseInt(container.style.right, 10) || 0;
        const startBottom = parseInt(container.style.bottom, 10) || 0;
        container.style.transition = "none";
        const handleMove = (moveEvent) => {
          const newX = Math.min(
            Math.max(startRight + (startX - moveEvent.clientX), 0),
            window.innerWidth - container.offsetWidth
          );
          const newY = Math.min(
            Math.max(startBottom + (startY - moveEvent.clientY), 0),
            window.innerHeight - container.offsetHeight
          );
          container.style.right = `${newX}px`;
          container.style.bottom = `${newY}px`;
        };
        const handleEnd = () => {
          document.removeEventListener("mousemove", handleMove);
          document.removeEventListener("mouseup", handleEnd);
          container.style.transition = "all 0.3s ease";
          const newPos = {
            x: parseInt(container.style.right, 10),
            y: parseInt(container.style.bottom, 10)
          };
          if (Math.abs(newPos.x - pos.x) > 5 || Math.abs(newPos.y - pos.y) > 5) {
            PromptStorageManager2.saveButtonPosition(newPos).then((success) => {
              if (success) pos = newPos;
            });
          }
        };
        document.addEventListener("mousemove", handleMove);
        document.addEventListener("mouseup", handleEnd);
      });
    }
    static refreshPromptList(prompts) {
      const signature = _PromptUIManager.computePromptsSignature(prompts);
      if (signature && _PromptUIManager.state.lastPromptsSignature === signature) {
        _PromptUIManager.setSearchVisibility(true);
        return;
      }
      _PromptUIManager.buildPromptListContainer(prompts);
      _PromptUIManager.state.lastPromptsSignature = signature;
      _PromptUIManager.setSearchVisibility(true);
    }
    static refreshItemsIfListActive(prompts = []) {
      const panel = document.getElementById(SELECTORS.PANEL_CONTENT);
      if (!panel) return;
      const items = panel.querySelector(`.${SELECTORS.PROMPT_ITEMS_CONTAINER}.opm-view-list`);
      if (!items) return;
      if (_PromptUIManager.state.suppressNextListRefresh) {
        _PromptUIManager.state.suppressNextListRefresh = false;
        _PromptUIManager.setSearchVisibility(true);
        return;
      }
      const signature = _PromptUIManager.computePromptsSignature(prompts);
      if (!signature || _PromptUIManager.state.lastPromptsSignature !== signature) {
        _PromptUIManager.buildPromptListContainer(prompts);
        _PromptUIManager.state.lastPromptsSignature = signature;
      }
      _PromptUIManager.setSearchVisibility(true);
      const selected = _PromptUIManager.activeTagFilter || "all";
      const input = document.getElementById(SELECTORS.PROMPT_SEARCH_INPUT);
      const term = input ? input.value : "";
      _PromptUIManager.filterByTag(selected);
      if (term) _PromptUIManager.filterPromptItems(term);
    }
    static setSearchVisibility(visible) {
      const input = document.getElementById(SELECTORS.PROMPT_SEARCH_INPUT);
      if (input) input.style.display = visible ? "block" : "none";
    }
    // COMMENT: Centralized prompt items filter used by search input
    static filterPromptItems(term) {
      const value = (term || "").toLowerCase();
      const container = document.querySelector(`.${SELECTORS.PROMPT_ITEMS_CONTAINER}`);
      if (!container) return;
      const activeTag = (_PromptUIManager.activeTagFilter || "all").toLowerCase();
      Array.from(container.children).forEach((item) => {
        const entry = window.__PF_PROMPT_INDEX?.get(item.dataset.uuid);
        const matchesSearch = value === "" || entry && (entry.title.includes(value) || entry.content.includes(value) || entry.tags.some((t) => t.includes(value)));
        let matchesTag = true;
        if (activeTag !== "all") {
          matchesTag = !!(entry && entry.tags.includes(activeTag));
        }
        item.style.display = matchesSearch && matchesTag ? "flex" : "none";
      });
      _PromptUIManager.selectedSearchIndex = -1;
    }
    // COMMENT: Ensure every scrollable region only shows scrollbars while in motion.
    static refreshScrollObservers(context = document) {
      if (!window.ScrollVisibilityManager) return;
      const selectors = [
        `.${SELECTORS.PROMPT_ITEMS_CONTAINER}`,
        ".opm-form-container",
        `#${SELECTORS.INFO_CONTENT}`,
        ".opm-tags-filter-bar"
      ];
      const ensure = (node) => ScrollVisibilityManager.observe(node);
      selectors.forEach((sel) => {
        if (context.matches?.(sel)) ensure(context);
        context.querySelectorAll?.(sel)?.forEach(ensure);
      });
    }
    // COMMENT: Tag filter setter that reruns combined filtering without changing panel height
    static filterByTag(tag) {
      const prev = _PromptUIManager.activeTagFilter || "all";
      _PromptUIManager.activeTagFilter = tag || "all";
      const input = document.getElementById(SELECTORS.PROMPT_SEARCH_INPUT);
      const term = input ? input.value : "";
      _PromptUIManager.filterPromptItems(term);
      PromptStorageManager2.saveActiveTagFilter(_PromptUIManager.activeTagFilter);
    }
    // COMMENT: Centralized clearing of search input and results state
    static clearSearchInput() {
      const input = document.getElementById(SELECTORS.PROMPT_SEARCH_INPUT);
      if (input) input.value = "";
      _PromptUIManager.selectedSearchIndex = -1;
    }
    static buildPromptListContainer(prompts = []) {
      const listEl = qs(`#${SELECTORS.PROMPT_LIST}`);
      if (!listEl) return;
      Theme.applyNode(listEl);
      const existingPanel = listEl.querySelector(`#${SELECTORS.PANEL_CONTENT}`);
      const existingItems = existingPanel?.querySelector(`.${SELECTORS.PROMPT_ITEMS_CONTAINER}`);
      const previousScrollTop = existingItems ? existingItems.scrollTop : 0;
      listEl.innerHTML = "";
      const mode = _PromptUIManager.state.listMode || "list";
      const content = PromptUI.Views.renderPromptList(prompts, { mode });
      if (_PromptUIManager.BANNER_CONFIG.active) {
        (async () => {
          try {
            const dismissed = await PromptStorageManager2.getData("dismissedBanners", []);
            if (dismissed.includes(_PromptUIManager.BANNER_CONFIG.id)) return;
            const banner = createEl2("div", {
              className: `opm-info-banner opm-${getMode()}`,
              styles: {
                padding: "10px 12px",
                fontSize: "13px",
                display: "flex",
                alignItems: "start",
                justifyContent: "space-between",
                gap: "8px",
                borderBottom: isDarkMode() ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.06)",
                backgroundColor: isDarkMode() ? "rgba(54, 116, 181, 0.15)" : "#ebf8ff",
                // Tinted primary/blue
                color: isDarkMode() ? "#E2E8F0" : "#2C5282",
                flex: "0 0 auto",
                lineHeight: "1.4"
              },
              innerHTML: `
              <div style="flex: 1;">${_PromptUIManager.BANNER_CONFIG.html}</div>
            `
            });
            const closeBtn = createEl2("button", {
              innerHTML: "\xD7",
              styles: {
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "0 4px",
                fontSize: "18px",
                lineHeight: "1",
                opacity: "0.6",
                color: "inherit",
                display: "flex",
                alignItems: "center"
              }
            });
            closeBtn.addEventListener("mouseenter", () => closeBtn.style.opacity = "1");
            closeBtn.addEventListener("mouseleave", () => closeBtn.style.opacity = "0.6");
            closeBtn.addEventListener("click", async (e) => {
              e.stopPropagation();
              banner.remove();
              const current = await PromptStorageManager2.getData("dismissedBanners", []);
              if (!current.includes(_PromptUIManager.BANNER_CONFIG.id)) {
                current.push(_PromptUIManager.BANNER_CONFIG.id);
                await PromptStorageManager2.setData("dismissedBanners", current);
              }
            });
            banner.appendChild(closeBtn);
            content.insertBefore(banner, content.firstChild);
          } catch (err) {
            console.error("[PromptManager] Failed to render banner:", err);
          }
        })();
      }
      listEl.appendChild(content);
      const newItems = content.querySelector(`.${SELECTORS.PROMPT_ITEMS_CONTAINER}`);
      if (newItems) {
        newItems.scrollTop = previousScrollTop;
      }
      _PromptUIManager.refreshScrollObservers(listEl);
      _PromptUIManager.applyListModeClass();
    }
    static resetPromptListContainer() {
      const listEl = qs(`#${SELECTORS.PROMPT_LIST}`);
      const wasVisible = listEl && listEl.classList.contains("opm-visible");
      _PromptUIManager.buildPromptListContainer();
      _PromptUIManager.state.lastPromptsSignature = null;
      if (wasVisible) {
        const updated = qs(`#${SELECTORS.PROMPT_LIST}`);
        if (updated) {
          updated.style.display = "block";
          void updated.offsetHeight;
          updated.classList.add("opm-visible");
        }
      }
    }
    static replacePanelMainContent(node) {
      const panel = document.getElementById(SELECTORS.PANEL_CONTENT);
      if (!panel) return;
      const items = panel.querySelector(`.${SELECTORS.PROMPT_ITEMS_CONTAINER}`);
      if (items) {
        items.replaceWith(node);
      } else {
        const lastChild = panel.lastElementChild;
        if (lastChild) panel.insertBefore(node, lastChild);
        else panel.appendChild(node);
      }
      const isListView = node.classList && node.classList.contains("opm-view-list");
      _PromptUIManager.setSearchVisibility(!!isListView);
      _PromptUIManager.refreshScrollObservers(panel);
    }
    // COMMENT: Show the prompt list and handle keyboard navigation
    static showPromptList(listEl) {
      if (!listEl) return;
      const wasVisible = listEl.classList.contains("opm-visible");
      const panelNode = document.getElementById(SELECTORS.PANEL_CONTENT);
      const isListView = panelNode && panelNode.querySelector(`.${SELECTORS.PROMPT_ITEMS_CONTAINER}.opm-view-list`);
      _PromptUIManager.setPanelHeightMode(isListView ? "variable" : "fixed");
      PromptUI.Behaviors.showList(listEl);
      const panel = document.getElementById(SELECTORS.PANEL_CONTENT);
      const hasListItems = panel && panel.querySelector(`.${SELECTORS.PROMPT_ITEMS_CONTAINER}.opm-view-list`);
      if (!wasVisible && hasListItems) {
        const searchInput = document.getElementById(SELECTORS.PROMPT_SEARCH_INPUT);
        const currentTerm = searchInput ? searchInput.value : "";
        _PromptUIManager.filterPromptItems(currentTerm);
      }
      _PromptUIManager.setSearchVisibility(!!hasListItems);
      if (hasListItems) {
        const first = listEl.querySelector(".opm-prompt-list-item");
        if (first) setTimeout(() => first.focus(), SEARCH_FOCUS_DELAY_MS);
        _PromptUIManager.focusSearchInput();
      }
      _PromptUIManager.completeOnboarding();
    }
    static hidePromptList(listEl) {
      if (!listEl) return;
      PromptUI.Behaviors.hideList(listEl);
      _PromptUIManager.clearSearchInput();
      _PromptUIManager.manuallyOpened = false;
      _PromptUIManager.inVariableInputMode = false;
    }
    static handleKeyboardNavigation(e, context = "list") {
      const list = qs(`#${SELECTORS.PROMPT_LIST}`);
      if (!list || !list.classList.contains("opm-visible")) return;
      _PromptUIManager.cancelCloseTimer();
      let items = [];
      if (context === "search") {
        const container = document.querySelector(`.${SELECTORS.PROMPT_ITEMS_CONTAINER}`);
        if (!container) return;
        items = Array.from(container.querySelectorAll(".opm-prompt-list-item")).filter((item) => item.style.display !== "none");
      } else {
        items = Array.from(list.querySelectorAll(".opm-prompt-list-item"));
      }
      if (items.length === 0) return;
      const idx = context === "search" ? _PromptUIManager.selectedSearchIndex : items.indexOf(document.activeElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (context === "search") {
          _PromptUIManager.selectedSearchIndex = Math.min(_PromptUIManager.selectedSearchIndex + 1, items.length - 1) || 0;
          _PromptUIManager.updateSelection(items, _PromptUIManager.selectedSearchIndex);
        } else {
          items[idx === -1 || idx === items.length - 1 ? 0 : idx + 1].focus();
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (context === "search") {
          _PromptUIManager.selectedSearchIndex = Math.max(_PromptUIManager.selectedSearchIndex - 1, -1);
          _PromptUIManager.updateSelection(items, _PromptUIManager.selectedSearchIndex);
        } else {
          items[idx <= 0 ? items.length - 1 : idx - 1].focus();
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (context === "search") {
          if (_PromptUIManager.selectedSearchIndex >= 0 && _PromptUIManager.selectedSearchIndex < items.length) {
            items[_PromptUIManager.selectedSearchIndex].click();
          } else if (items.length === 1) {
            items[0].click();
          }
        } else if (idx !== -1) {
          items[idx].click();
        }
      }
    }
    static handleGlobalEscape(e) {
      if (e.key === "Escape") {
        const listEl = qs(`#${SELECTORS.PROMPT_LIST}`);
        if (listEl && listEl.classList.contains("opm-visible")) {
          e.preventDefault();
          _PromptUIManager.selectedSearchIndex = -1;
          const container = document.querySelector(`.${SELECTORS.PROMPT_ITEMS_CONTAINER}`);
          if (container) {
            const items = Array.from(container.querySelectorAll(".opm-prompt-list-item")).filter((item) => item.style.display !== "none");
            _PromptUIManager.updateSelection(items, -1);
          }
          _PromptUIManager.hidePromptList(listEl);
        }
      }
    }
    static updateThemeForUI() {
      Theme.applyAll();
      const container = document.getElementById(SELECTORS.PROMPT_BUTTON_CONTAINER);
      if (container) {
        const btn = container.querySelector(`#${SELECTORS.PROMPT_BUTTON}`) || container.querySelector(".opm-prompt-button");
        if (btn) {
          btn.style.boxShadow = isDarkMode() ? THEME_COLORS.darkShadow : THEME_COLORS.lightShadow;
        }
      }
      const icons = document.querySelectorAll(`#${SELECTORS.ROOT} .opm-icon-button img`);
      icons.forEach((icon) => {
        icon.style.filter = getIconFilter();
      });
    }
    static focusSearchInput() {
      const input = document.getElementById(SELECTORS.PROMPT_SEARCH_INPUT);
      if (input) {
        Theme.applyNode(input);
        requestAnimationFrame(() => {
          input.focus();
          input.select();
        });
      }
    }
    static createVariableInputForm({ inputBox, content, variables, onSubmit }) {
      _PromptUIManager.inVariableInputMode = true;
      const form = createEl2("div", {
        className: `opm-form-container opm-${getMode()}`,
        styles: { padding: "12px", display: "flex", flexDirection: "column", gap: "8px", overflow: "hidden", minHeight: "0" }
      });
      const count = Array.isArray(variables) ? variables.length : 0;
      const singleMode = count <= 1;
      const splitMode = count === 2 || count === 3;
      const listMode = count >= 4;
      const itemGap = listMode ? "8px" : "12px";
      const varContainerFlex = singleMode ? "0 1 auto" : "1 1 auto";
      const varContainer = createEl2("div", {
        // COMMENT: Grow to fill remaining height and become the only scrollable area when content exceeds space.
        // COMMENT: Use both gap and rowGap for broader compatibility across flex-gap implementations.
        styles: {
          display: "flex",
          flexDirection: "column",
          gap: itemGap,
          rowGap: itemGap,
          flex: varContainerFlex,
          minHeight: "0",
          overflowY: "auto",
          // COMMENT: Add subtle top/bottom padding for list presentation when many variables
          paddingTop: listMode ? "8px" : "0",
          paddingBottom: listMode ? "8px" : "0"
        }
      });
      ScrollVisibilityManager.observe(varContainer);
      const varValues = {};
      variables.forEach((v) => {
        const displayLabel = String(v).replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
        const row = createEl2("div", {
          styles: {
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            // COMMENT: Equal splits for 2 or 3 variables; single mode stays compact; list is compact.
            flex: singleMode ? "0 0 auto" : splitMode ? "1 1 0%" : "0 0 auto",
            // COMMENT: Let flex children shrink properly in split mode
            minHeight: splitMode ? "0" : "auto",
            // COMMENT: Add explicit margin fallback so rows never visually collide if gap is not honored.
            marginBottom: itemGap,
            // COMMENT: Apply list-like vertical padding when many variables
            padding: listMode ? "6px 0" : "0"
          }
        });
        const label = createEl2("label", {
          innerHTML: displayLabel,
          className: `opm-${getMode()}`,
          styles: {
            fontSize: "12px",
            fontWeight: "600",
            letterSpacing: "0.2px",
            opacity: "0.85",
            padding: "0 2px"
          }
        });
        const rowsAttr = listMode ? "1" : splitMode ? "3" : "6";
        const inputField = createEl2("textarea", {
          // COMMENT: Rows tuned per mode and clear placeholder
          attributes: { rows: rowsAttr, placeholder: `${displayLabel} value` },
          className: `opm-textarea-field opm-${getMode()}`,
          // COMMENT: Let the textarea expand within its row. In split mode, disable manual resize to preserve equal distribution.
          // COMMENT: Minimum height ~ one line; when there are many variables and space runs out, the container scrolls.
          styles: {
            // COMMENT: Increase vertical padding for a more comfortable input.
            padding: "12px 10px",
            // COMMENT: Taller minima so fields feel more usable without manual resizing.
            minHeight: listMode ? "18px" : splitMode ? "60px" : "1px",
            // COMMENT: For list mode enforce single-line visual height
            height: listMode ? "18px" : "auto",
            // COMMENT: Ensure sizing accounts for padding and borders to prevent layout overflow/overlap.
            boxSizing: "border-box",
            width: "100%",
            // COMMENT: Flex behavior depends on mode: split fills evenly; single & list are compact
            flex: listMode ? "0 0 auto" : splitMode ? "1 1 auto" : "0 0 auto",
            resize: splitMode || listMode ? "none" : "vertical"
          }
        });
        inputField.addEventListener("input", () => {
          varValues[v] = inputField.value;
        });
        inputField.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submitBtn.click();
          }
        });
        row.append(label, inputField);
        varContainer.appendChild(row);
        varValues[v] = "";
      });
      form.appendChild(varContainer);
      _PromptUIManager.setPanelHeightMode("fixed");
      const btnContainer = createEl2("div", { styles: { display: "flex", flexDirection: "column", gap: "8px", marginTop: "auto", position: "sticky", bottom: "0", background: "transparent" } });
      const submitBtn = createEl2("button", { innerHTML: "Submit", className: `opm-button opm-${getMode()}` });
      submitBtn.addEventListener("click", () => {
        _PromptUIManager.inVariableInputMode = false;
        onSubmit(varValues);
      });
      const backBtn = createEl2("button", { innerHTML: "Back", className: `opm-button opm-${getMode()}` });
      backBtn.addEventListener("click", () => {
        _PromptUIManager.inVariableInputMode = false;
        PanelRouter.mount(PanelView.LIST);
      });
      btnContainer.append(submitBtn, backBtn);
      form.appendChild(btnContainer);
      requestAnimationFrame(() => {
        const firstInput = varContainer.querySelector("textarea, input");
        if (firstInput) firstInput.focus();
      });
      return form;
    }
    static createPromptCreationForm(prefill = "") {
      return PromptUI.Views.createPromptCreationForm(prefill);
    }
    static async showEditForm(prompt) {
      const list = qs(`#${SELECTORS.PROMPT_LIST}`);
      if (!list) return;
      _PromptUIManager.resetPromptListContainer();
      _PromptUIManager.setSearchVisibility(true);
      const form = PromptUI.Views.createPromptForm({
        initialTitle: prompt.title,
        initialContent: prompt.content,
        initialCategory: prompt.category || null,
        submitLabel: "Save Changes",
        onSubmit: async ({ title, content, tags, category }) => {
          const ps = await PromptStorageManager2._ps();
          const update = { title, content };
          if (Array.isArray(tags)) update.tags = tags;
          if (category) update.category = category;
          await PromptStorageManager2.addVersion(prompt.uuid, content, "manual_edit");
          await ps.updatePrompt(prompt.uuid, update);
          PanelRouter.mount(PanelView.EDIT);
        }
      });
      _PromptUIManager.replacePanelMainContent(form);
      const listElInitial = qs(`#${SELECTORS.PROMPT_LIST}`);
      if (listElInitial) {
        _PromptUIManager.showPromptList(listElInitial);
        _PromptUIManager.setSearchVisibility(false);
      }
      (async () => {
        const btnDark = isDarkMode();
        const btnCss = `padding:4px 10px;font-size:12px;cursor:pointer;border-radius:4px;border:1px solid ${btnDark ? "#4a5568" : "#ccc"};background:${btnDark ? "#2d3748" : "#fff"};color:${btnDark ? "#e2e8f0" : "#333"};`;
        const actionRow = createEl2("div", { styles: { display: "flex", gap: "6px", marginBottom: "8px", flexWrap: "wrap" } });
        const vhBtn = createEl2("button", { innerHTML: "\u{1F4CB} Versions", className: "opm-button opm-standard" });
        vhBtn.style.cssText = btnCss;
        vhBtn.addEventListener("click", () => _PromptUIManager.showVersionHistory(prompt.uuid));
        actionRow.appendChild(vhBtn);
        const impBtn = createEl2("button", { innerHTML: "\u2728 Improve", className: "opm-button opm-standard" });
        impBtn.style.cssText = btnCss;
        impBtn.addEventListener("click", async () => {
          await _PromptUIManager.improvePrompt(prompt.uuid, qs(`#${SELECTORS.PROMPT_LIST}`));
        });
        actionRow.appendChild(impBtn);
        const varBtn = createEl2("button", { innerHTML: "\u{1F504} Variants", className: "opm-button opm-standard" });
        varBtn.style.cssText = btnCss;
        varBtn.addEventListener("click", async () => {
          await _PromptUIManager.generateVariants(prompt.uuid, qs(`#${SELECTORS.PROMPT_LIST}`));
        });
        actionRow.appendChild(varBtn);
        const saveBtn = form.querySelector(".opm-button");
        if (saveBtn && saveBtn.parentNode) saveBtn.parentNode.insertBefore(actionRow, saveBtn);
        const enableTags = await PromptStorageManager2.getEnableTags();
        if (!enableTags) {
          _PromptUIManager.replacePanelMainContent(form);
          const listElAfter2 = qs(`#${SELECTORS.PROMPT_LIST}`);
          if (listElAfter2) {
            _PromptUIManager.showPromptList(listElAfter2);
            _PromptUIManager.setSearchVisibility(false);
          }
          return;
        }
        const label = createEl2("label", { styles: { fontSize: "12px", fontWeight: "bold" } });
        const tagInput = TagUI.createTagInput({ initialTags: Array.isArray(prompt.tags) ? prompt.tags : [] });
        const tagsBlock = createEl2("div");
        tagsBlock.append(label, tagInput.element);
        if (saveBtn && saveBtn.parentNode) saveBtn.parentNode.insertBefore(tagsBlock, saveBtn);
        if (saveBtn) {
          const newBtn = saveBtn.cloneNode(true);
          saveBtn.replaceWith(newBtn);
          newBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const titleIn = form.querySelector(".opm-input-field");
            const contentArea = form.querySelector(".opm-textarea-field");
            const catSel = form.querySelectorAll(".opm-input-field")[2];
            const t = titleIn.value.trim(), c = contentArea.value.trim();
            if (!t || !c) {
              alert("Please fill in both title and content.");
              return;
            }
            const cat = catSel && catSel.tagName === "SELECT" && catSel.value !== "Uncategorized" ? catSel.value : null;
            const ps = await PromptStorageManager2._ps();
            await PromptStorageManager2.addVersion(prompt.uuid, c, "manual_edit");
            await ps.updatePrompt(prompt.uuid, { title: t, content: c, tags: tagInput.getTags(), category: cat });
            PanelRouter.mount(PanelView.EDIT);
          }, { once: true });
        }
        const listElAfter = qs(`#${SELECTORS.PROMPT_LIST}`);
        if (listElAfter) {
          _PromptUIManager.showPromptList(listElAfter);
          _PromptUIManager.setSearchVisibility(false);
        }
      })();
    }
    static async deletePrompt(uuid) {
      const ps = await PromptStorageManager2._ps();
      await ps.deletePrompt(uuid);
      await PanelRouter.mount(PanelView.EDIT);
    }
    static async showVersionHistory(promptUuid) {
      try {
        const ps = await PromptStorageManager2._ps();
        const versions = await ps.getVersions(promptUuid);
        if (!versions || versions.length === 0) {
          alert("No version history yet.");
          return;
        }
        const dark = isDarkMode();
        const themeBg = dark ? "#1a202c" : "#fff";
        const themeText = dark ? "#e2e8f0" : "#333";
        const themeBorder = dark ? "#4a5568" : "#e0e0e0";
        const overlay = createEl2("div", { className: "opm-modal-overlay" });
        overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:100000;display:flex;align-items:center;justify-content:center;";
        const modal = createEl2("div");
        modal.style.cssText = `background:${themeBg};color:${themeText};border:1px solid ${themeBorder};border-radius:12px;padding:20px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.3);`;
        const header = createEl2("div", { styles: { display: "flex", justifyContent: "space-between", marginBottom: "16px" } });
        header.appendChild(createEl2("h3", { styles: { margin: 0, fontSize: "16px" } }, ["Version History"]));
        const closeBtn = createEl2("button", { innerHTML: "\xD7", className: "opm-button-close" });
        closeBtn.style.cssText = `background:none;border:none;font-size:24px;cursor:pointer;color:${themeText};`;
        closeBtn.addEventListener("click", () => overlay.remove());
        header.appendChild(closeBtn);
        modal.appendChild(header);
        for (let i = versions.length - 1; i >= 0; i--) {
          const v = versions[i];
          const row = createEl2("div", { styles: { padding: "8px 0", borderBottom: `1px solid ${themeBorder}` } });
          const metaRow = createEl2("div");
          metaRow.appendChild(createEl2("b", {}, [`v${i + 1}`]));
          metaRow.appendChild(createEl2("span", { styles: { color: "#666", fontSize: "12px" } }, [` ${v.source} \xB7 ${new Date(v.createdAt).toLocaleString()}`]));
          row.appendChild(metaRow);
          const btns = createEl2("div", { styles: { display: "flex", gap: "4px", marginTop: "4px" } });
          const viewBtn = createEl2("button", { innerHTML: "View", className: "opm-button opm-standard" });
          viewBtn.style.cssText = "padding:4px 10px;font-size:12px;cursor:pointer;border-radius:4px;border:1px solid #ccc;";
          viewBtn.addEventListener("click", () => {
            alert(`Version ${i + 1} (${v.source}):

${v.content}`);
          });
          btns.appendChild(viewBtn);
          if (i < versions.length - 1) {
            const restoreBtn = createEl2("button", { innerHTML: "Restore", className: "opm-button opm-standard" });
            restoreBtn.style.cssText = "padding:4px 10px;font-size:12px;cursor:pointer;border-radius:4px;border:1px solid #ccc;";
            restoreBtn.addEventListener("click", async () => {
              await ps.restoreVersion(promptUuid, i);
              overlay.remove();
              alert(`Restored as v${versions.length}`);
              await PanelRouter.mount(PanelView.LIST);
            });
            btns.appendChild(restoreBtn);
          }
          row.appendChild(btns);
          modal.appendChild(row);
        }
        overlay.appendChild(modal);
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) overlay.remove();
        });
        document.body.appendChild(overlay);
      } catch (e) {
        console.error("Version history failed:", e);
        alert("Failed to load version history: " + e.message);
      }
    }
    static async improvePrompt(promptUuid, listEl) {
      return improvePrompt(promptUuid, listEl);
    }
    static async generateVariants(promptUuid, listEl) {
      return generateVariants(promptUuid, listEl);
    }
    static async autoSuggestMetadata(promptUuid, listEl) {
      return autoSuggestMetadata(promptUuid, listEl);
    }
    static createSettingsForm() {
      return PromptUI.Views.createSettingsForm();
    }
    static computePromptsSignature(prompts = []) {
      if (!Array.isArray(prompts)) return null;
      try {
        return prompts.map((p) => `${p?.uuid || ""}:${p?.updatedAt || p?.createdAt || ""}`).join("|");
      } catch (err) {
        console.error("[PromptManager] Failed to compute prompts signature:", err);
        return null;
      }
    }
    // COMMENT: Update the selection of the items in the when using keyboard navigation
    static updateSelection(items, selIndex) {
      items.forEach((item, idx) => {
        item.style.backgroundColor = "";
        item.style.border = "";
        item.style.transform = "";
        item.classList.toggle("opm-keyboard-selected", idx === selIndex);
        if (idx === selIndex) {
          const container = item.parentElement, top = item.offsetTop, bottom = top + item.offsetHeight, cTop = container.scrollTop, cBottom = cTop + container.offsetHeight;
          if (top < cTop) container.scrollTop = top;
          else if (bottom > cBottom) container.scrollTop = bottom - container.offsetHeight;
        }
      });
    }
    // COMMENT: Store the selected index of the search results
    static selectedSearchIndex = -1;
    // HOT CORNER MODE
    static injectHotCorner() {
      if (_PromptUIManager.state.hotCornerContainer && document.body.contains(_PromptUIManager.state.hotCornerContainer)) {
        return;
      }
      const container = createEl2("div", {
        id: SELECTORS.HOT_CORNER_CONTAINER,
        styles: UI_STYLES.hotCornerActiveZone
      });
      const indicator = createEl2("div", {
        id: SELECTORS.HOT_CORNER_INDICATOR,
        styles: {
          position: "fixed",
          bottom: "0",
          right: "0",
          width: "0",
          height: "0",
          zIndex: "9999",
          borderStyle: "solid",
          borderWidth: `0 0 ${HOT_CORNER_INDICATOR_SMALL_PX}px ${HOT_CORNER_INDICATOR_SMALL_PX}px`,
          borderColor: `transparent transparent ${THEME_COLORS.primary}90 transparent`,
          transition: "border-width 0.3s ease, border-color 0.3s ease",
          pointerEvents: "none"
        }
      });
      container.appendChild(indicator);
      const listEl = createEl2("div", {
        id: SELECTORS.PROMPT_LIST,
        className: `opm-prompt-list opm-${getMode()} opm-fixed-400`,
        styles: {
          position: "absolute",
          right: "30px",
          bottom: "30px"
        }
      });
      container.appendChild(listEl);
      _PromptUIManager._ensureRoot().appendChild(container);
      this.setupHotCornerEvents(container, indicator, listEl);
      OutsideClickCloser.ensure();
      _PromptUIManager.state.hotCornerContainer = container;
      _PromptUIManager.state.buttonContainer = null;
      _PromptUIManager.state.currentMode = "hotCorner";
    }
    // Extracted event handling for hot corner
    static setupHotCornerEvents(container, indicator, listEl) {
      container.addEventListener("mouseenter", async (e) => {
        e.stopPropagation();
        _PromptUIManager.cancelCloseTimer();
        const listIsVisible = listEl.classList.contains("opm-visible");
        if (!listIsVisible && !_PromptUIManager.inVariableInputMode) {
          _PromptUIManager.manuallyOpened = false;
          indicator.style.borderWidth = `0 0 ${HOT_CORNER_INDICATOR_LARGE_PX}px ${HOT_CORNER_INDICATOR_LARGE_PX}px`;
          indicator.style.borderColor = `transparent transparent ${THEME_COLORS.primary} transparent`;
          await _PromptUIManager.mountListOrCreateBasedOnPrompts();
        }
      });
      listEl.addEventListener("mouseenter", () => {
        _PromptUIManager.cancelCloseTimer();
      });
      listEl.addEventListener("mouseleave", (e) => {
        _PromptUIManager.startCloseTimer(e, listEl, () => {
          _PromptUIManager.manuallyOpened = false;
          _PromptUIManager.inVariableInputMode = false;
        });
      });
      container.addEventListener("mouseleave", (e) => {
        e.stopPropagation();
        indicator.style.borderWidth = `0 0 ${HOT_CORNER_INDICATOR_SMALL_PX}px ${HOT_CORNER_INDICATOR_SMALL_PX}px`;
        indicator.style.borderColor = `transparent transparent ${THEME_COLORS.primary}90 transparent`;
        _PromptUIManager.startCloseTimer(e, listEl, () => {
          _PromptUIManager.manuallyOpened = false;
          _PromptUIManager.inVariableInputMode = false;
        });
      });
      const visibilityHandler = () => {
        if (document.hidden) {
          _PromptUIManager.manuallyOpened = false;
          _PromptUIManager.inVariableInputMode = false;
          PromptUI.Behaviors.hideList(listEl);
        }
      };
      document.addEventListener("visibilitychange", visibilityHandler);
      _PromptUIManager.state.hotCornerVisibilityHandler = visibilityHandler;
      container.addEventListener("mouseenter", () => {
        _PromptUIManager.completeOnboarding();
      });
    }
    static cleanupAllUIComponents() {
      if (_PromptUIManager.state.buttonContainer && document.body.contains(_PromptUIManager.state.buttonContainer)) {
        _PromptUIManager.state.buttonContainer.remove();
      }
      if (_PromptUIManager.state.hotCornerVisibilityHandler) {
        document.removeEventListener("visibilitychange", _PromptUIManager.state.hotCornerVisibilityHandler);
        _PromptUIManager.state.hotCornerVisibilityHandler = null;
      }
      if (_PromptUIManager.state.hotCornerContainer && document.body.contains(_PromptUIManager.state.hotCornerContainer)) {
        _PromptUIManager.state.hotCornerContainer.remove();
      }
      _PromptUIManager.manuallyOpened = false;
      _PromptUIManager.state.buttonContainer = null;
      _PromptUIManager.state.hotCornerContainer = null;
      _PromptUIManager.state.currentMode = null;
      _PromptUIManager.state.lastPromptsSignature = null;
    }
    static async refreshDisplayMode() {
      _PromptUIManager.cleanupAllUIComponents();
      const prompts = await PromptStorageManager2.getPrompts();
      await _PromptUIManager.injectUIForCurrentMode(prompts);
      _PromptUIManager.refreshItemsIfListActive(prompts);
      const listEl = qs(`#${SELECTORS.PROMPT_LIST}`);
      if (listEl && listEl.classList.contains("opm-visible")) {
        _PromptUIManager.hidePromptList(listEl);
      }
    }
    // COMMENT: Helper to mark onboarding as complete and remove the popup if present
    static completeOnboarding() {
      PromptStorageManager2.setOnboardingCompleted();
      const popup = document.getElementById(SELECTORS.ONBOARDING_POPUP);
      if (popup) popup.remove();
    }
    // COMMENT: Helper to mount LIST or CREATE based on prompt availability
    static async mountListOrCreateBasedOnPrompts() {
      const currentPrompts = await PromptStorageManager2.getPrompts();
      if (currentPrompts.length === 0) PanelRouter.mount(PanelView.CREATE);
      else PanelRouter.mount(PanelView.LIST);
    }
    // COMMENT: Inject the correct UI based on current display mode
    static async injectUIForCurrentMode(prompts) {
      const displayMode = await PromptStorageManager2.getDisplayMode();
      const hasButtonUI = _PromptUIManager.state.buttonContainer && document.body.contains(_PromptUIManager.state.buttonContainer);
      const hasHotCornerUI = _PromptUIManager.state.hotCornerContainer && document.body.contains(_PromptUIManager.state.hotCornerContainer);
      if (_PromptUIManager.state.currentMode === displayMode) {
        if (displayMode === "standard" && hasButtonUI) {
          if (prompts) _PromptUIManager.refreshPromptList(prompts);
          return;
        }
        if (displayMode === "hotCorner" && hasHotCornerUI) return;
      }
      if (displayMode === "standard") {
        const data = prompts || await PromptStorageManager2.getPrompts();
        _PromptUIManager.injectPromptManagerButton(data);
      } else {
        _PromptUIManager.injectHotCorner();
      }
    }
  };
  window.PromptUIManager = PromptUIManager2;
  if (typeof window.__initPromptShared === "function") {
    window.__initPromptShared();
  }
  var { TagService, TagUI, PromptUI } = window;
  var PromptProcessor = class {
    static extractVariables(content) {
      const regex = /#([a-zA-Z0-9_]+)#/g;
      return [...new Set([...content.matchAll(regex)].map((m) => m[1]))];
    }
    static replaceVariables(content, values) {
      return Object.entries(values).reduce((res, [k, v]) => res.replace(new RegExp(`#${k}#`, "g"), v), content);
    }
  };
  var PromptMediator = /* @__PURE__ */ (() => {
    const state = {
      initialized: false,
      processor: null,
      promptSelectHandler: null,
      mutationObserver: null,
      storageWatcherAttached: false
    };
    const checkCurrentSitePermission = async () => {
      try {
        const response = await fetch(chrome.runtime.getURL("llm_providers.json"));
        if (!response.ok) return false;
        const data = await response.json();
        const currentUrl = window.location.href;
        for (const provider of data.llm_providers) {
          const regexPattern = provider.pattern.replace(/\\/g, "\\\\").replace(/[.]/g, "\\.").replace(/[*]/g, ".*");
          const urlRegex = new RegExp(`^${regexPattern}`);
          if (urlRegex.test(currentUrl)) {
            const hasPermission = await chrome.permissions.contains({ origins: [provider.pattern] });
            return hasPermission;
          }
        }
      } catch (e) {
        console.warn("[PromptForge] Failed to check site permission:", e);
      }
      return false;
    };
    const copyToClipboardWithFeedback = async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        const toast = createEl2("div", { className: "opm-clipboard-toast" }, [
          createEl2("span", {}, ["Prompt copied to clipboard"])
        ]);
        toast.style.cssText = "position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1a73e8;color:#fff;padding:8px 16px;border-radius:8px;font-size:13px;font-family:system-ui;z-index:100000;box-shadow:0 2px 8px rgba(0,0,0,0.2);";
        document.body.appendChild(toast);
        setTimeout(() => {
          toast.style.opacity = "0";
          toast.style.transition = "opacity 0.3s";
          setTimeout(() => toast.remove(), 300);
        }, 2e3);
      } catch (e) {
        console.error("[PromptForge] Failed to copy to clipboard:", e);
      }
    };
    const handlePromptSelect = async (prompt) => {
      const listEl = qs(`#${SELECTORS.PROMPT_LIST}`);
      let inputBox = await InputBoxHandler.getInputBox();
      if (!inputBox) {
        try {
          inputBox = await InputBoxHandler.waitForInputBox();
        } catch (_) {
          console.error("[PromptForge] Input box not found, falling back to clipboard.");
          await copyToClipboardWithFeedback(prompt.content);
          if (listEl) PromptUIManager2.hidePromptList(listEl);
          return;
        }
      }
      const vars = state.processor.extractVariables(prompt.content);
      if (vars.length === 0) {
        await InputBoxHandler.insertPrompt(inputBox, prompt.content, listEl);
        PromptUIManager2.hidePromptList(listEl);
        return;
      }
      PanelRouter.mount(PanelView.VARIABLE_INPUT, {
        inputBox,
        content: prompt.content,
        variables: vars,
        onSubmit: async (values) => {
          const processed = state.processor.replaceVariables(prompt.content, values);
          let target = await InputBoxHandler.getInputBox();
          if (!target || !target.isConnected) {
            target = inputBox && inputBox.isConnected ? inputBox : null;
          }
          const activeList = qs(`#${SELECTORS.PROMPT_LIST}`);
          if (!target) {
            console.error("[PromptForge] Input box no longer available; falling back to clipboard.");
            await copyToClipboardWithFeedback(processed);
            if (activeList) PromptUIManager2.hidePromptList(activeList);
            return;
          }
          await InputBoxHandler.insertPrompt(target, processed, activeList);
          if (activeList) PromptUIManager2.hidePromptList(activeList);
          setTimeout(() => {
            PromptStorageManager2.getPrompts().then((nextPrompts) => {
              PromptUIManager2.refreshPromptList(nextPrompts);
            }).catch((err) => console.error("Failed to refresh prompt list after variable submission:", err));
          }, 300);
        }
      });
    };
    const ensurePromptSelectionListener = () => {
      if (state.promptSelectHandler) return;
      state.promptSelectHandler = handlePromptSelect;
      PromptUIManager2.onPromptSelect(state.promptSelectHandler);
    };
    const setupMutationObserver = () => {
      if (state.mutationObserver) return;
      const target = document.documentElement || document.body;
      if (!target) return;
      const ensureUIVisible = debounce(async () => {
        if (!document.getElementById(SELECTORS.PROMPT_BUTTON_CONTAINER) && !document.getElementById(SELECTORS.HOT_CORNER_CONTAINER)) {
          PromptUIManager2.cleanupAllUIComponents();
          const prompts = await PromptStorageManager2.getPrompts();
          await PromptUIManager2.injectUIForCurrentMode(prompts);
        }
      }, MUTATION_DEBOUNCE_MS);
      state.mutationObserver = new MutationObserver(ensureUIVisible);
      state.mutationObserver.observe(target, { childList: true, subtree: true });
    };
    const setupStorageChangeMonitor = () => {
      if (state.storageWatcherAttached) return;
      state.storageWatcherAttached = true;
      (async () => {
        try {
          const { onPromptsChanged } = await import(chrome.runtime.getURL("promptStorage.js"));
          onPromptsChanged((prompts) => {
            PromptUIManager2.refreshItemsIfListActive(prompts);
          });
        } catch (err) {
          state.storageWatcherAttached = false;
          console.error("Failed to attach unified prompts change listener:", err);
        }
      })();
    };
    const setupKeyboardShortcuts = () => {
      KeyboardManager.initialize();
    };
    const bootstrap = async (ui, processor) => {
      if (state.initialized) return;
      state.initialized = true;
      try {
        window.isDarkModeForced = await PromptStorageManager2.getForceDarkMode();
      } catch (_) {
      }
      state.processor = processor;
      ensurePromptSelectionListener();
      PromptStorageManager2.getPrompts().then((prompts) => PromptUIManager2.injectUIForCurrentMode(prompts)).catch((err) => console.error("Error initializing extension UI:", err));
      setupMutationObserver();
      setupStorageChangeMonitor();
      setupKeyboardShortcuts();
    };
    return { bootstrap };
  })();
  if (!__PF_ALREADY_INITIALIZED) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message?.type === "PROMPTFORGE_SEND_PROMPT") {
        (async () => {
          try {
            const { content, title, uuid } = message.prompt;
            if (!content) {
              sendResponse({ success: false, error: "Empty content" });
              return;
            }
            const trackUse = async () => {
              if (!uuid) return;
              try {
                const { bumpUseCount } = await import(chrome.runtime.getURL("promptStorage.js"));
                await bumpUseCount(uuid);
              } catch {
              }
            };
            const vars = PromptProcessor.extractVariables(content);
            if (vars.length === 0) {
              let inputBox2 = await InputBoxHandler.getInputBox();
              if (!inputBox2) {
                inputBox2 = await InputBoxHandler.waitForInputBox();
              }
              if (inputBox2) {
                await InputBoxHandler.insertPrompt(inputBox2, content, null);
              } else {
                await navigator.clipboard.writeText(content);
              }
              trackUse();
              sendResponse({ success: true, injected: true });
              return;
            }
            let inputBox = await InputBoxHandler.getInputBox();
            if (!inputBox) {
              inputBox = await InputBoxHandler.waitForInputBox();
            }
            if (!inputBox) {
              await navigator.clipboard.writeText(content);
              trackUse();
              sendResponse({ success: true, clipboard: true });
              return;
            }
            PanelRouter.mount(PanelView.VARIABLE_INPUT, {
              inputBox,
              content,
              variables: vars,
              onSubmit: async (values) => {
                const processed = PromptProcessor.replaceVariables(content, values);
                let target = await InputBoxHandler.getInputBox();
                if (!target || !target.isConnected) {
                  target = inputBox && inputBox.isConnected ? inputBox : null;
                }
                if (!target) {
                  await navigator.clipboard.writeText(processed);
                  trackUse();
                  return;
                }
                await InputBoxHandler.insertPrompt(target, processed, null);
                trackUse();
              }
            });
            sendResponse({ success: true, variables: true });
          } catch (e) {
            sendResponse({ success: false, error: e.message });
          }
        })();
        return true;
      }
      if (message?.type !== "PROMPTFORGE_INSERT") return false;
      (async () => {
        try {
          if (!window.InputBoxHandler) {
            try {
              await navigator.clipboard.writeText(message.text);
              sendResponse({ success: true, clipboard: true });
            } catch (e) {
              sendResponse({ success: false, error: "Clipboard failed: " + e.message });
            }
            return;
          }
          let inputBox = null;
          for (let attempt = 0; attempt < 20; attempt++) {
            inputBox = await window.InputBoxHandler.getInputBox();
            if (inputBox) break;
            await new Promise((r) => setTimeout(r, 500));
          }
          if (!inputBox) {
            try {
              await navigator.clipboard.writeText(message.text);
              sendResponse({ success: true, clipboard: true });
            } catch (e) {
              sendResponse({ success: false, error: "Could not find input field and clipboard failed: " + e.message });
            }
            return;
          }
          await window.InputBoxHandler.insertPrompt(inputBox, message.text, null);
          sendResponse({ success: true });
        } catch (e) {
          console.error("[PromptForge] External insert failed:", e);
          sendResponse({ success: false, error: e.message });
        }
      })();
      return true;
    });
  }
  if (!__PF_ALREADY_INITIALIZED) {
    setTimeout(() => {
      PromptMediator.bootstrap(PromptUIManager2, PromptProcessor);
    }, 50);
  }
})();
