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
      width: 280px;
      z-index: 10000;
      opacity: 0;
      pointer-events: none; /* #45 \u2014 invisible (opacity:0) panel must not intercept host-page clicks */
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
      pointer-events: auto; /* #45 \u2014 re-enable interaction only when visible */
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
  var _shadowInputCache = /* @__PURE__ */ new Map();
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
      if (root === document) {
        const cached = _shadowInputCache.get(selector);
        if (cached && cached.isConnected && cached.matches(selector)) return cached;
      }
      const hosts = root.querySelectorAll("*");
      for (const el of hosts) {
        if (!el.shadowRoot) continue;
        const found = el.shadowRoot.querySelector(selector);
        if (found) {
          if (root === document) _shadowInputCache.set(selector, found);
          return found;
        }
        const deep = _InputBoxHandler._findInShadowDom(selector, el.shadowRoot);
        if (deep) {
          if (root === document) _shadowInputCache.set(selector, deep);
          return deep;
        }
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
        } else if (inputBox.tagName.toLowerCase() === "textarea" || inputBox.tagName.toLowerCase() === "input") {
          const tag = inputBox.tagName.toLowerCase();
          const proto = tag === "textarea" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
          const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value").set;
          let newValue;
          if (disableOverwrite) {
            const existing = inputBox.value || "";
            const needsSpace = existing && !/\s$/.test(existing);
            const spacer = needsSpace ? " " : "";
            newValue = existing + spacer + content + "  ";
          } else {
            newValue = content + "  ";
          }
          nativeSetter.call(inputBox, newValue);
          inputBox.dispatchEvent(new Event("input", { bubbles: true }));
          inputBox.dispatchEvent(new Event("change", { bubbles: true }));
          if (tag === "textarea") {
            inputBox.style.height = "auto";
            inputBox.style.height = `${inputBox.scrollHeight}px`;
          }
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
      const tt2 = (key, subs, fallback) => window.PFI18n ? window.PFI18n.t(key, subs || null, fallback) : fallback;
      window.__PF_PROMPT_INDEX = window.__PF_PROMPT_INDEX || /* @__PURE__ */ new Map();
      const indexPromptForSearch = (prompt) => {
        if (!prompt || !prompt.uuid) return;
        window.__PF_PROMPT_INDEX.set(prompt.uuid, {
          title: (prompt.title || "").toLowerCase(),
          content: (prompt.content || "").toLowerCase(),
          tags: Array.isArray(prompt.tags) ? prompt.tags.map((t2) => String(t2).toLowerCase()) : []
        });
      };
      const ICON_SVGS = {
        list: `<img src="${chrome.runtime.getURL("icons/list.svg")}" width="16" height="16" alt="${tt2("panel_icon_list", null, "List Prompts")}" title="${tt2("panel_icon_list", null, "List Prompts")}" style="filter: ${iconFilter()}">`,
        add: `<img src="${chrome.runtime.getURL("icons/new.svg")}" width="16" height="16" alt="${tt2("panel_icon_add", null, "Add Prompt")}" title="${tt2("panel_icon_add", null, "Add Prompt")}" style="filter: ${iconFilter()}">`,
        delete: `<img src="${chrome.runtime.getURL("icons/delete.svg")}" width="16" height="16" alt="${tt2("panel_icon_delete", null, "Delete")}" title="${tt2("panel_icon_delete", null, "Delete")}" style="filter: ${iconFilter()}">`,
        edit: `<img src="${chrome.runtime.getURL("icons/edit.svg")}" width="16" height="16" alt="${tt2("panel_icon_edit", null, "Edit")}" title="${tt2("panel_icon_edit", null, "Edit")}" style="filter: ${iconFilter()}">`,
        settings: `<img src="${chrome.runtime.getURL("icons/settings.svg")}" width="16" height="16" alt="${tt2("panel_icon_settings", null, "Settings")}" title="${tt2("panel_icon_settings", null, "Settings")}" style="filter: ${iconFilter()}">`,
        help: `<img src="${chrome.runtime.getURL("icons/help.svg")}" width="16" height="16" alt="${tt2("panel_icon_help", null, "Help")}" title="${tt2("panel_icon_help", null, "Help")}" style="filter: ${iconFilter()}">`
      };
      const TagService2 = /* @__PURE__ */ (() => {
        const computeCounts = (prompts = []) => {
          const counts = /* @__PURE__ */ new Map();
          prompts.forEach((p) => (Array.isArray(p.tags) ? p.tags : []).forEach((t2) => {
            const key = String(t2).trim();
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
          const missing = tags.filter((t2) => !order.includes(t2)).sort((a, b) => a.localeCompare(b));
          return [...order.filter((t2) => counts.has(t2)), ...missing];
        };
        const getSuggestions = async ({ term = "", exclude = /* @__PURE__ */ new Set() } = {}) => {
          const counts = await getCounts();
          const ordered = await getOrderedTags(counts);
          const lcTerm = term.trim().toLowerCase();
          return ordered.filter((t2) => !exclude.has(t2) && (lcTerm === "" || String(t2).toLowerCase().includes(lcTerm)));
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
          const input = createEl3("input", { attributes: { type: "text", placeholder: tt2("panel_tags_ph", null, "Tags") }, className: `opm-tag-input opm-${getMode2()}` });
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
            root.querySelectorAll(".opm-tag-suggestions").forEach((n) => {
              if (n !== suggestions) n.remove();
            });
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
            options.forEach((t2, idx) => {
              const item = createEl3("div", { className: "opm-tag-suggestion-item" }, [t2]);
              if (idx === activeIndex) item.classList.add("active");
              item.addEventListener("mousedown", (e) => {
                e.preventDefault();
                addTag(t2);
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
              if (confirm(tt2("panel_delete_confirm", [prompt.title], 'Delete "' + prompt.title + '"?'))) window.PromptUIManager.deletePrompt(prompt.uuid);
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
              attributes: { type: "text", placeholder: tt2("panel_ph_search", null, "Type to search"), style: "border-radius: 4px;" }
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
              window.removeEventListener("blur", handleBlur);
            };
            const handleBlur = () => cleanup();
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
              if (dragSrcEl && !dragSrcEl.isConnected) {
                cleanup();
                return;
              }
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
                window.addEventListener("blur", handleBlur);
              });
            };
            return { wireItem };
          }
        };
        const Views = {
          createPromptForm({ initialTitle = "", initialContent = "", submitLabel = null, onSubmit, initialCategory = null, initialLanguage = null }) {
            const form = createEl3("div", { className: `opm-form-container opm-create-form opm-${getMode2()}`, styles: { padding: "0", display: "flex", flexDirection: "column", gap: "4px" } });
            const titleIn = createEl3("input", { attributes: { placeholder: tt2("panel_ph_title", null, "Prompt Title") }, className: `opm-input-field opm-${getMode2()}`, styles: { borderRadius: "4px" } });
            const contentArea = createEl3("textarea", {
              attributes: { placeholder: tt2("panel_ph_write", null, "Write your prompt. Use hashtags for #variables#") },
              className: `opm-textarea-field opm-${getMode2()}`,
              styles: { flex: "1 1 auto", minHeight: "0", height: "auto" }
            });
            titleIn.value = initialTitle;
            contentArea.value = initialContent;
            const catSelect = createEl3("select", { className: `opm-input-field opm-${getMode2()}`, styles: { borderRadius: "4px", fontSize: "13px" } });
            catSelect.appendChild(createEl3("option", { attributes: { value: "" } }, [tt2("panel_uncategorized", null, "Uncategorized")]));
            for (const c of window.PFCategories || []) {
              const o = createEl3("option", { attributes: { value: c.name } }, [tt2(`cat_${c.id}`, null, c.name)]);
              if (c.name === initialCategory) o.selected = true;
              catSelect.appendChild(o);
            }
            const langSelect = createEl3("select", { className: `opm-input-field opm-${getMode2()}`, styles: { borderRadius: "4px", fontSize: "13px" } });
            langSelect.appendChild(createEl3("option", { attributes: { value: "auto" } }, ["Auto-detect language"]));
            if (window.PFLanguage) {
              for (const l of window.PFLanguage.SUPPORTED_LANGUAGES) {
                const o = createEl3("option", { attributes: { value: l.code } }, [l.label]);
                if (l.code === initialLanguage) o.selected = true;
                langSelect.appendChild(o);
              }
            }
            const saveBtn = createEl3("button", { innerHTML: submitLabel || tt2("panel_save", null, "Save"), className: `opm-button opm-${getMode2()}` });
            saveBtn.addEventListener("click", async (e) => {
              e.stopPropagation();
              const t2 = titleIn.value.trim(), c = contentArea.value.trim();
              if (!t2 || !c) {
                alert(tt2("panel_fill_both", null, "Please fill in both title and content."));
                return;
              }
              const cat = catSelect.value || null;
              const language = langSelect.value === "auto" ? window.PFLanguage ? window.PFLanguage.detectLanguage(c).code : null : langSelect.value;
              if (typeof onSubmit === "function") await onSubmit({ title: t2, content: c, category: cat, language });
            });
            form.append(titleIn, contentArea, catSelect, langSelect, saveBtn);
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
                const ps = await window.PromptStorageManager._ps();
                await ps.reorderPrompts(newPrompts.map((p) => p.uuid));
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
            const titleIn = createEl3("input", { attributes: { placeholder: tt2("panel_ph_title", null, "Prompt Title") }, className: `opm-input-field opm-${getMode2()}`, styles: { borderRadius: "4px" } });
            const contentArea = createEl3("textarea", {
              attributes: { placeholder: tt2("panel_ph_enter", null, "Enter your prompt here. Add variables with #examplevariable#") },
              className: `opm-textarea-field opm-${getMode2()}`,
              styles: { flex: "1 1 auto", minHeight: "0", height: "auto" }
            });
            titleIn.value = "";
            contentArea.value = prefill || "";
            const catSelect = createEl3("select", { className: `opm-input-field opm-${getMode2()}`, styles: { borderRadius: "4px", fontSize: "13px" } });
            catSelect.appendChild(createEl3("option", { attributes: { value: "" } }, [tt2("panel_uncategorized", null, "Uncategorized")]));
            for (const c of window.PFCategories || []) catSelect.appendChild(createEl3("option", { attributes: { value: c.name } }, [tt2(`cat_${c.id}`, null, c.name)]));
            const langSelect = createEl3("select", { className: `opm-input-field opm-${getMode2()}`, styles: { borderRadius: "4px", fontSize: "13px" } });
            langSelect.appendChild(createEl3("option", { attributes: { value: "auto" } }, ["Auto-detect language"]));
            if (window.PFLanguage) {
              for (const l of window.PFLanguage.SUPPORTED_LANGUAGES) {
                langSelect.appendChild(createEl3("option", { attributes: { value: l.code } }, [l.label]));
              }
            }
            let tagsBlock = null;
            let tagInput = null;
            if (enableTags) {
              const label = createEl3("label", { styles: { fontSize: "12px", fontWeight: "bold" } });
              tagInput = TagUI2.createTagInput();
              tagsBlock = createEl3("div");
              tagsBlock.append(label, tagInput.element);
            }
            const saveBtn = createEl3("button", { innerHTML: tt2("panel_create", null, "Create Prompt"), className: `opm-button opm-${getMode2()}` });
            saveBtn.addEventListener("click", async (e) => {
              e.stopPropagation();
              const t2 = titleIn.value.trim(), c = contentArea.value.trim();
              if (!t2 || !c) {
                alert(tt2("panel_fill_both", null, "Please fill in both title and content."));
                return;
              }
              if (saveBtn.disabled) return;
              saveBtn.disabled = true;
              const tags = enableTags && tagInput ? tagInput.getTags() : [];
              const cat = catSelect.value || null;
              const language = langSelect.value === "auto" ? window.PFLanguage ? window.PFLanguage.detectLanguage(c).code : null : langSelect.value;
              const res = await window.PromptStorageManager.savePrompt({ title: t2, content: c, tags, category: cat, language });
              if (!res.success) {
                saveBtn.disabled = false;
                alert(tt2("panel_save_error", null, "Error saving prompt."));
                return;
              }
              window.PanelRouter.mount(window.PanelView.LIST);
            });
            form.append(titleIn, contentArea, catSelect, langSelect);
            if (tagsBlock) form.append(tagsBlock);
            form.append(saveBtn);
            form.addEventListener("click", (e) => e.stopPropagation());
            return form;
          },
          createSettingsForm() {
            const form = createEl3("div", { className: `opm-form-container opm-${getMode2()}`, styles: { padding: "12px", display: "flex", flexDirection: "column", gap: "8px" } });
            const title = createEl3("div", { styles: { fontWeight: "bold", fontSize: "16px", marginBottom: "10px" }, innerHTML: tt2("panel_settings_title", null, "Settings") });
            const settings = createEl3("div", { styles: { display: "flex", flexDirection: "column", gap: "12px" } });
            settings.appendChild(Elements.createToggleRow({
              labelText: tt2("panel_hot_corner", null, "Hot Corner Mode"),
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
              labelText: tt2("panel_enable_tags", null, "Enable tags"),
              getValue: async () => await window.PromptStorageManager.getEnableTags(),
              onToggle: async (active) => {
                await window.PromptStorageManager.saveEnableTags(active);
              }
            }));
            settings.appendChild(Elements.createToggleRow({
              labelText: tt2("panel_force_dark", null, "Force Dark Mode"),
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
              innerHTML: tt2("panel_open_full", null, "Open Full Settings \u2197"),
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
            const dataSectionTitle = createEl3("div", { styles: { fontWeight: "bold", fontSize: "14px", marginTop: "6px" }, innerHTML: tt2("panel_prompt_mgmt", null, "Prompt Management") });
            const dataActions = createEl3("div", { styles: { display: "flex", gap: "8px" } });
            const exportBtn = createEl3("button", { innerHTML: tt2("panel_export", null, "Export"), className: `opm-button opm-${getMode2()}` });
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
            const importBtn = createEl3("button", { innerHTML: tt2("panel_import", null, "Import"), className: `opm-button opm-${getMode2()}` });
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
                    importBtn.textContent = tt2("panel_import_success", null, "Import successful!");
                    setTimeout(() => importBtn.textContent = tt2("panel_import", null, "Import"), window.IMPORT_SUCCESS_RESET_MS || 2e3);
                  } catch (err) {
                    alert("Invalid JSON file format.");
                  }
                }
              });
              fileInput.click();
            });
            dataActions.append(exportBtn, importBtn);
            const deleteAllBtn = createEl3("button", {
              innerHTML: tt2("panel_delete_all", null, "Delete all prompts"),
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
            const tagMgmtTitle = createEl3("div", { styles: { fontWeight: "bold", fontSize: "14px", marginTop: "12px", display: "none" }, innerHTML: tt2("panel_tag_mgmt", null, "Tag management") });
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
                      if (!confirm(tt2("panel_remove_tag_confirm", [tag], `Remove tag "${tag}" from all prompts?`))) return;
                      try {
                        const ps = await window.PromptStorageManager._ps();
                        const updated = await ps.removeTagEverywhere(tag);
                        counts = await TagService2.getCounts(updated);
                        finalOrder = finalOrder.filter((t2) => t2 !== tag);
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
            }, window.PROMPT_CLOSE_DELAY || 1e3);
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
  var _pendingCleanups = /* @__PURE__ */ new Set();
  function aiPort() {
    if (!_aiPort) {
      _aiPort = chrome.runtime.connect({ name: "pf-ai" });
      _aiPort.onDisconnect.addListener(() => {
        _aiPort = null;
        for (const cleanup of [..._pendingCleanups]) cleanup();
        _pendingCleanups.clear();
      });
    }
    return _aiPort;
  }
  function ollamaRPC(message) {
    return new Promise((resolve, reject) => {
      const port = aiPort();
      const id = ++_aiReqId;
      const cleanup = () => {
        port.onMessage.removeListener(onMessage);
        reject(new Error("AI port disconnected"));
      };
      const onMessage = (msg) => {
        if (!msg || msg.id !== id) return;
        if (msg.error !== void 0) {
          _pendingCleanups.delete(cleanup);
          port.onMessage.removeListener(onMessage);
          reject(new Error(msg.error));
        } else if ("result" in msg) {
          _pendingCleanups.delete(cleanup);
          port.onMessage.removeListener(onMessage);
          resolve(msg.result);
        }
      };
      _pendingCleanups.add(cleanup);
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
    const cleanup = () => {
      error = new Error("AI port disconnected");
      done = true;
      if (resolveNext) {
        const r = resolveNext;
        resolveNext = null;
        r();
      }
    };
    _pendingCleanups.add(cleanup);
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
        _pendingCleanups.delete(cleanup);
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
  var tt = (key, subs, fallback) => window.PFI18n ? window.PFI18n.t(key, subs || null, fallback) : fallback;
  function _toast(msg, type = "info", duration = 2500) {
    const t2 = createEl("div", {}, [msg]);
    t2.style.cssText = "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);padding:8px 16px;border-radius:8px;font-size:13px;z-index:100001;color:#fff;transition:opacity 0.2s;";
    t2.style.backgroundColor = type === "error" ? "#dc3545" : type === "success" ? "#198754" : "#1a73e8";
    document.body.appendChild(t2);
    setTimeout(() => {
      t2.style.opacity = "0";
      setTimeout(() => t2.remove(), 200);
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
      const statusLabel = createEl("span", {}, [tt("panel_improving", null, "Improving\u2026")]);
      const stopButton = createEl("button");
      stopButton.style.cssText = "background:rgba(255,255,255,0.3);border:none;color:#fff;padding:2px 8px;border-radius:4px;cursor:pointer;";
      stopButton.textContent = tt("panel_stop", null, "Stop");
      statusDiv.append(statusLabel, stopButton);
      const stream = ollamaStream({ op: "improve", promptText: original, language: prompt.language });
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
        if (listEl && PromptUIManager.state.listMode !== "edit") PromptUIManager.refreshPromptList(await PromptStorageManager.getPrompts());
        _toast(tt("panel_improved", null, "Prompt improved!"), "success");
      }
    } catch (e) {
      if (!/abort/i.test(e.message || "")) {
        console.error("Improve failed:", e);
        _toast(tt("panel_improve_failed", [e.message], "Improvement failed: " + e.message), "error");
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
      statusDiv.textContent = tt("panel_generating", null, "Generating variants\u2026");
      document.body.appendChild(statusDiv);
      let variants = [];
      try {
        variants = await ollamaRPC({ op: "variants", promptText: prompt.content, count: 3, language: prompt.language });
      } finally {
        statusDiv.remove();
      }
      if (variants && variants.length > 0) {
        const g = "variant-group-" + Date.now();
        for (let i = 0; i < variants.length; i++) {
          await PromptStorageManager.addVersion(promptUuid, variants[i], "ai_variant", { variantGroup: g, variantIndex: i + 1 });
        }
        if (listEl && PromptUIManager.state.listMode !== "edit") PromptUIManager.refreshPromptList(await PromptStorageManager.getPrompts());
        _toast(tt("panel_variants_generated", [String(variants.length)], `Generated ${variants.length} variants!`), "success");
      }
    } catch (e) {
      console.error("Variants failed:", e);
      _toast(tt("panel_variants_failed", [e.message], "Variant generation failed: " + e.message), "error");
    }
  }
  async function translatePrompt(promptUuid, toLang, listEl) {
    try {
      const prompts = await PromptStorageManager.getPrompts();
      const prompt = prompts.find((p) => p.uuid === promptUuid);
      if (!prompt || !toLang) return;
      const fromLang = prompt.language || null;
      const targetLabel = window.PFLanguage && window.PFLanguage.languageMeta(toLang).label || toLang;
      let buffer = "";
      let running = true;
      const statusDiv = createEl("div", { className: "opm-improving-status" });
      statusDiv.style.cssText = "position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1a73e8;color:#fff;padding:8px 16px;border-radius:8px;font-size:13px;z-index:100000;display:flex;align-items:center;gap:8px;";
      statusDiv.appendChild(createEl("span", {}, [tt("panel_translating", null, "Translating\u2026")]));
      const stopButton = createEl("button");
      stopButton.style.cssText = "background:rgba(255,255,255,0.3);border:none;color:#fff;padding:2px 8px;border-radius:4px;cursor:pointer;";
      stopButton.textContent = tt("panel_stop", null, "Stop");
      statusDiv.appendChild(stopButton);
      const stream = ollamaStream({ op: "translate", promptText: prompt.content, toLang, fromLang });
      stopButton.addEventListener("click", () => {
        running = false;
        stream.cancel();
        statusDiv.remove();
      });
      document.body.appendChild(statusDiv);
      try {
        for await (const chunk of stream) {
          if (!running) break;
          buffer += chunk;
        }
      } finally {
        statusDiv.remove();
      }
      if (!running || !buffer.trim()) return;
      buffer = buffer.trim();
      await PromptStorageManager.addVersion(promptUuid, buffer, "ai_translation", { from: fromLang, to: toLang });
      await PromptStorageManager._ps().then((ps) => ps.updatePrompt(promptUuid, { content: buffer, language: toLang }));
      if (listEl && PromptUIManager.state.listMode !== "edit") PromptUIManager.refreshPromptList(await PromptStorageManager.getPrompts());
      _toast(tt("panel_translated", [targetLabel], `Translated to ${targetLabel}`), "success");
    } catch (e) {
      if (!/abort/i.test(e.message || "")) {
        console.error("Translate failed:", e);
        _toast(tt("toast_translate_failed", [e.message], "Translation failed: " + e.message), "error");
      }
    }
  }
  async function translateText(promptText, toLang, fromLang = null) {
    const stream = ollamaStream({ op: "translate", promptText, toLang, fromLang });
    let buffer = "";
    for await (const chunk of stream) buffer += chunk;
    return buffer.trim();
  }
  async function autoSuggestMetadata(promptUuid, listEl) {
    try {
      const prompts = await PromptStorageManager.getPrompts();
      const prompt = prompts.find((p) => p.uuid === promptUuid);
      if (!prompt) return;
      const data = await chrome.storage.local.get({ autoSuggestMetadata: true });
      if (!data.autoSuggestMetadata) return;
      const metadata = await ollamaRPC({ op: "suggest", promptText: prompt.content, language: prompt.language });
      const fresh = (await PromptStorageManager.getPrompts()).find((p) => p.uuid === promptUuid);
      if (!fresh) return;
      const updates = {};
      if ((!fresh.title || fresh.title === "Untitled Prompt") && metadata.title && metadata.title !== "Untitled Prompt") {
        updates.title = metadata.title;
      }
      if (!fresh.category && metadata.category && metadata.category !== "Other") {
        updates.category = metadata.category;
      }
      if (!Array.isArray(fresh.tags) || fresh.tags.length === 0) {
        const filteredTags = (metadata.tags || []).filter((t2) => t2 !== "untagged");
        if (filteredTags.length > 0) updates.tags = filteredTags;
      }
      if (Object.keys(updates).length > 0) {
        const ps = await PromptStorageManager._ps();
        await ps.updatePrompt(promptUuid, { ...updates, updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
        if (listEl && PromptUIManager.state.listMode !== "edit") PromptUIManager.refreshPromptList(await PromptStorageManager.getPrompts());
      }
    } catch (e) {
      console.warn("Auto-suggest failed:", e);
    }
  }
  window.PFAIOperations = { improvePrompt, generateVariants, autoSuggestMetadata, translatePrompt };

  // language.js
  var SUPPORTED_LANGUAGES = Object.freeze([
    Object.freeze({ code: "en", label: "English", short: "EN" }),
    Object.freeze({ code: "zh-HK", label: "\u4E2D\u6587\uFF08\u7E41\u9AD4\uFF09", short: "\u7E41" }),
    Object.freeze({ code: "zh-CN", label: "\u4E2D\u6587\uFF08\u7B80\u4F53\uFF09", short: "\u7B80" })
  ]);
  var DEFAULT_PROMPT_LANGUAGES = Object.freeze(["en", "zh-HK", "zh-CN"]);
  var LANGUAGE_NAMES = Object.freeze({
    "en": "English",
    "zh-HK": "Traditional Chinese",
    "zh-CN": "Simplified Chinese"
  });
  function normalizeLangCode(raw) {
    if (typeof raw !== "string") return null;
    const parts = raw.trim().split(/[-_]/).filter(Boolean);
    if (parts.length === 0) return null;
    const primary = parts[0].toLowerCase();
    if (!/^[a-z]{2,3}$/.test(primary)) return null;
    if (parts.length === 1) return primary;
    const region = parts[1].toUpperCase();
    if (!/^[A-Z]{2}$/.test(region)) return primary;
    return `${primary}-${region}`;
  }
  function languageMeta(code) {
    const normalized = normalizeLangCode(code);
    return SUPPORTED_LANGUAGES.find((l) => l.code === normalized) || { code: normalized || code, label: normalized || String(code), short: (normalized || String(code)).toUpperCase() };
  }
  var SIMP_TRAD_PAIRS = [
    ["\u4E07", "\u842C"],
    ["\u4E0E", "\u8207"],
    ["\u4E13", "\u5C08"],
    ["\u4E1A", "\u696D"],
    ["\u4E1C", "\u6771"],
    ["\u4E1D", "\u7D72"],
    ["\u4E24", "\u5169"],
    ["\u4E25", "\u56B4"],
    ["\u4E2A", "\u500B"],
    ["\u4E30", "\u8C50"],
    ["\u4E34", "\u81E8"],
    ["\u4E3A", "\u70BA"],
    ["\u4E3E", "\u8209"],
    ["\u4E49", "\u7FA9"],
    ["\u4E50", "\u6A02"],
    ["\u4E60", "\u7FD2"],
    ["\u4E61", "\u9109"],
    ["\u4E66", "\u66F8"],
    ["\u4E70", "\u8CB7"],
    ["\u4E71", "\u4E82"],
    ["\u4E89", "\u722D"],
    ["\u4E8E", "\u65BC"],
    ["\u4E91", "\u96F2"],
    ["\u4EA7", "\u7522"],
    ["\u4EB2", "\u89AA"],
    ["\u4EBF", "\u5104"],
    ["\u4EC5", "\u50C5"],
    ["\u4ECE", "\u5F9E"],
    ["\u4ED3", "\u5009"],
    ["\u4EEA", "\u5100"],
    ["\u4EEC", "\u5011"],
    ["\u4EF7", "\u50F9"],
    ["\u4F17", "\u773E"],
    ["\u4F18", "\u512A"],
    ["\u4F1A", "\u6703"],
    ["\u4F1F", "\u5049"],
    ["\u4F20", "\u50B3"],
    ["\u4F24", "\u50B7"],
    ["\u4F53", "\u9AD4"],
    ["\u4F63", "\u50AD"],
    ["\u6765", "\u4F86"],
    ["\u4FA6", "\u5075"],
    ["\u4FA7", "\u5074"],
    ["\u4FA8", "\u50D1"],
    ["\u4FE9", "\u5006"],
    ["\u4FED", "\u5109"],
    ["\u503A", "\u50B5"],
    ["\u503E", "\u50BE"],
    ["\u507F", "\u511F"],
    ["\u50A8", "\u5132"],
    ["\u513F", "\u5152"],
    ["\u5151", "\u514C"],
    ["\u5170", "\u862D"],
    ["\u5173", "\u95DC"],
    ["\u5174", "\u8208"],
    ["\u517B", "\u990A"],
    ["\u5185", "\u5167"],
    ["\u5188", "\u5CA1"],
    ["\u518C", "\u518A"],
    ["\u5199", "\u5BEB"],
    ["\u519B", "\u8ECD"],
    ["\u519C", "\u8FB2"],
    ["\u51AF", "\u99AE"],
    ["\u51B2", "\u6C96"],
    ["\u51B3", "\u6C7A"],
    ["\u51B5", "\u6CC1"],
    ["\u51BB", "\u51CD"],
    ["\u51C0", "\u6DE8"],
    ["\u51C9", "\u6DBC"],
    ["\u51CF", "\u6E1B"],
    ["\u51E0", "\u5E7E"],
    ["\u51E4", "\u9CF3"],
    ["\u51ED", "\u6191"],
    ["\u51EF", "\u51F1"],
    ["\u51FB", "\u64CA"],
    ["\u51FF", "\u947F"],
    ["\u5218", "\u5289"],
    ["\u5219", "\u5247"],
    ["\u521A", "\u525B"],
    ["\u521B", "\u5275"],
    ["\u5220", "\u522A"],
    ["\u522B", "\u5225"],
    ["\u5251", "\u528D"],
    ["\u5267", "\u5287"],
    ["\u529D", "\u52F8"],
    ["\u529E", "\u8FA6"],
    ["\u52A1", "\u52D9"],
    ["\u52A8", "\u52D5"],
    ["\u52B1", "\u52F5"],
    ["\u52B2", "\u52C1"],
    ["\u52B3", "\u52DE"],
    ["\u52BF", "\u52E2"],
    ["\u52CB", "\u52DB"],
    ["\u5300", "\u52FB"],
    ["\u533A", "\u5340"],
    ["\u533B", "\u91AB"],
    ["\u534E", "\u83EF"],
    ["\u534F", "\u5354"],
    ["\u5355", "\u55AE"],
    ["\u5356", "\u8CE3"],
    ["\u536B", "\u885B"],
    ["\u5374", "\u537B"],
    ["\u5382", "\u5EE0"],
    ["\u5385", "\u5EF3"],
    ["\u5386", "\u6B77"],
    ["\u5389", "\u53B2"],
    ["\u538B", "\u58D3"],
    ["\u538C", "\u53AD"],
    ["\u5395", "\u5EC1"],
    ["\u53A2", "\u5EC2"],
    ["\u53A6", "\u5EC8"],
    ["\u53A8", "\u5EDA"],
    ["\u53BF", "\u7E23"],
    ["\u53CC", "\u96D9"],
    ["\u53D1", "\u767C"],
    ["\u53D8", "\u8B8A"],
    ["\u53D9", "\u6558"],
    ["\u53E0", "\u758A"],
    ["\u53F6", "\u8449"],
    ["\u53F7", "\u865F"],
    ["\u53F9", "\u5606"],
    ["\u540E", "\u5F8C"],
    ["\u5413", "\u5687"],
    ["\u5415", "\u5442"],
    ["\u5417", "\u55CE"],
    ["\u5428", "\u5678"],
    ["\u542C", "\u807D"],
    ["\u542F", "\u555F"],
    ["\u5434", "\u5433"],
    ["\u5455", "\u5614"],
    ["\u5458", "\u54E1"],
    ["\u545B", "\u55C6"],
    ["\u545C", "\u55DA"],
    ["\u5499", "\u56A8"],
    ["\u54CD", "\u97FF"],
    ["\u54D1", "\u555E"],
    ["\u54D7", "\u5629"],
    ["\u54DF", "\u55B2"],
    ["\u5520", "\u562E"],
    ["\u5524", "\u559A"],
    ["\u5567", "\u5616"],
    ["\u556E", "\u5699"],
    ["\u5570", "\u56C9"],
    ["\u5578", "\u562F"],
    ["\u55B7", "\u5674"],
    ["\u55BD", "\u560D"],
    ["\u55EB", "\u56C1"],
    ["\u6151", "\u61FE"],
    ["\u61D2", "\u61F6"],
    ["\u620F", "\u6232"],
    ["\u6218", "\u6230"],
    ["\u6237", "\u6236"],
    ["\u626A", "\u636B"],
    ["\u626B", "\u6383"],
    ["\u626C", "\u63DA"],
    ["\u6270", "\u64FE"],
    ["\u629A", "\u64AB"],
    ["\u629B", "\u62CB"],
    ["\u62E3", "\u63C0"],
    ["\u62E5", "\u64C1"],
    ["\u62E6", "\u6514"],
    ["\u62E7", "\u64F0"],
    ["\u62E8", "\u64A5"],
    ["\u62E9", "\u64C7"],
    ["\u6302", "\u639B"],
    ["\u631A", "\u646F"],
    ["\u631B", "\u6523"],
    ["\u631D", "\u64BE"],
    ["\u631E", "\u64BB"],
    ["\u631F", "\u633E"],
    ["\u6320", "\u6493"],
    ["\u6321", "\u64CB"],
    ["\u6323", "\u6399"],
    ["\u6324", "\u64E0"],
    ["\u6325", "\u63EE"],
    ["\u635E", "\u6488"],
    ["\u635F", "\u640D"],
    ["\u6361", "\u64BF"],
    ["\u6362", "\u63DB"],
    ["\u6363", "\u6417"],
    ["\u636E", "\u64DA"],
    ["\u63B3", "\u64C4"],
    ["\u63B7", "\u64F2"],
    ["\u63B8", "\u64A3"],
    ["\u63BA", "\u647B"],
    ["\u63FD", "\u652C"],
    ["\u65A9", "\u65AC"],
    ["\u65AD", "\u65B7"],
    ["\u65E0", "\u7121"],
    ["\u65E7", "\u820A"],
    ["\u65F6", "\u6642"],
    ["\u65F7", "\u66E0"],
    ["\u6619", "\u66C7"],
    ["\u663C", "\u665D"],
    ["\u663E", "\u986F"],
    ["\u664B", "\u6649"],
    ["\u6652", "\u66EC"],
    ["\u6653", "\u66C9"],
    ["\u6655", "\u6688"],
    ["\u6656", "\u6689"],
    ["\u6682", "\u66AB"],
    ["\u672F", "\u8853"],
    ["\u6734", "\u6A38"],
    ["\u673A", "\u6A5F"],
    ["\u6740", "\u6BBA"],
    ["\u6742", "\u96DC"],
    ["\u6743", "\u6B0A"],
    ["\u6746", "\u687F"],
    ["\u6761", "\u689D"],
    ["\u6768", "\u694A"],
    ["\u6781", "\u6975"],
    ["\u6784", "\u69CB"],
    ["\u67A2", "\u6A1E"],
    ["\u67A3", "\u68D7"],
    ["\u67AA", "\u69CD"],
    ["\u67AB", "\u6953"],
    ["\u67E0", "\u6AB8"],
    ["\u6805", "\u67F5"],
    ["\u6807", "\u6A19"],
    ["\u6808", "\u68E7"],
    ["\u680B", "\u68DF"],
    ["\u680F", "\u6B04"],
    ["\u6811", "\u6A39"],
    ["\u6837", "\u6A23"],
    ["\u6863", "\u6A94"],
    ["\u6865", "\u6A4B"],
    ["\u6866", "\u6A3A"],
    ["\u6868", "\u69F3"],
    ["\u6869", "\u6A01"],
    ["\u68A6", "\u5922"],
    ["\u68C0", "\u6AA2"],
    ["\u697C", "\u6A13"],
    ["\u692D", "\u6A62"],
    ["\u6A2A", "\u6A6B"],
    ["\u6A31", "\u6AFB"],
    ["\u6A71", "\u6AE5"],
    ["\u6B22", "\u6B61"],
    ["\u6B27", "\u6B50"],
    ["\u6B7C", "\u6BB2"],
    ["\u6B87", "\u6BA4"],
    ["\u6B8B", "\u6B98"],
    ["\u6BD9", "\u6583"],
    ["\u6BE1", "\u6C08"],
    ["\u6C14", "\u6C23"],
    ["\u6C22", "\u6C2B"],
    ["\u6C47", "\u532F"],
    ["\u6C49", "\u6F22"],
    ["\u6C64", "\u6E6F"],
    ["\u6C9F", "\u6E9D"],
    ["\u6CA1", "\u6C92"],
    ["\u6CA5", "\u701D"],
    ["\u6CA6", "\u6DEA"],
    ["\u6CA7", "\u6EC4"],
    ["\u6CAA", "\u6EEC"],
    ["\u6CDE", "\u6FD8"],
    ["\u6CEA", "\u6DDA"],
    ["\u6CF7", "\u7027"],
    ["\u6CF8", "\u7018"],
    ["\u6CFB", "\u7009"],
    ["\u6CFC", "\u6F51"],
    ["\u6CFD", "\u6FA4"],
    ["\u6CFE", "\u6D87"],
    ["\u6D01", "\u6F54"],
    ["\u6D12", "\u7051"],
    ["\u6D45", "\u6DFA"],
    ["\u6D46", "\u6F3F"],
    ["\u6D47", "\u6F86"],
    ["\u6D4A", "\u6FC1"],
    ["\u6D4B", "\u6E2C"],
    ["\u6D4E", "\u6FDF"],
    ["\u6D4F", "\u700F"],
    ["\u6D51", "\u6E3E"],
    ["\u6D52", "\u6EF8"],
    ["\u6D53", "\u6FC3"],
    ["\u6D54", "\u6F6F"],
    ["\u6DA9", "\u6F80"],
    ["\u6E0A", "\u6DF5"],
    ["\u6E0D", "\u6F2C"],
    ["\u6E0E", "\u7006"],
    ["\u6E10", "\u6F38"],
    ["\u6E14", "\u6F01"],
    ["\u6E17", "\u6EF2"],
    ["\u6E29", "\u6EAB"],
    ["\u6E7E", "\u7063"],
    ["\u6E7F", "\u6FD5"],
    ["\u6E83", "\u6F70"],
    ["\u6E85", "\u6FFA"],
    ["\u6EE5", "\u6FEB"],
    ["\u6EE8", "\u6FF1"],
    ["\u6EE9", "\u7058"],
    ["\u6EE4", "\u6FFE"],
    ["\u6EDA", "\u6EFE"],
    ["\u6EDE", "\u6EEF"],
    ["\u6EE1", "\u6EFF"],
    ["\u6F4B", "\u7032"],
    ["\u6F4D", "\u6FF0"],
    ["\u6F5C", "\u6F5B"],
    ["\u6F9C", "\u703E"],
    ["\u6FD2", "\u7015"],
    ["\u706D", "\u6EC5"],
    ["\u706F", "\u71C8"],
    ["\u7075", "\u9748"],
    ["\u707E", "\u707D"],
    ["\u707F", "\u71E6"],
    ["\u7089", "\u7210"],
    ["\u7096", "\u71C9"],
    ["\u709C", "\u7152"],
    ["\u70B9", "\u9EDE"],
    ["\u70BC", "\u7149"],
    ["\u70BD", "\u71BE"],
    ["\u70C1", "\u720D"],
    ["\u70C2", "\u721B"],
    ["\u70C3", "\u70F4"],
    ["\u70DB", "\u71ED"],
    ["\u70E8", "\u71C1"],
    ["\u70E9", "\u71F4"],
    ["\u70EB", "\u71D9"],
    ["\u70EC", "\u71FC"],
    ["\u70ED", "\u71B1"],
    ["\u7115", "\u7165"],
    ["\u7116", "\u71DC"],
    ["\u7231", "\u611B"],
    ["\u7237", "\u723A"],
    ["\u724D", "\u7258"],
    ["\u7275", "\u727D"],
    ["\u727A", "\u72A7"],
    ["\u728A", "\u72A2"],
    ["\u72B6", "\u72C0"],
    ["\u72B9", "\u7336"],
    ["\u72C8", "\u72FD"],
    ["\u72DE", "\u7370"],
    ["\u72EC", "\u7368"],
    ["\u72ED", "\u72F9"],
    ["\u72EE", "\u7345"],
    ["\u72F0", "\u7319"],
    ["\u72F1", "\u7344"],
    ["\u7315", "\u737C"],
    ["\u732A", "\u8C6C"],
    ["\u732B", "\u8C93"],
    ["\u732E", "\u737B"],
    ["\u736D", "\u737A"],
    ["\u7391", "\u74A3"],
    ["\u739B", "\u746A"],
    ["\u73AE", "\u744B"],
    ["\u73AF", "\u74B0"],
    ["\u73B0", "\u73FE"],
    ["\u73BA", "\u74BD"],
    ["\u73D1", "\u74CF"],
    ["\u73F2", "\u743F"],
    ["\u7410", "\u7463"],
    ["\u743C", "\u74CA"],
    ["\u7477", "\u74A6"],
    ["\u748E", "\u74D4"],
    ["\u74D2", "\u74DA"],
    ["\u7535", "\u96FB"],
    ["\u753B", "\u756B"],
    ["\u7545", "\u66A2"],
    ["\u7574", "\u7587"],
    ["\u7596", "\u7664"],
    ["\u7597", "\u7642"],
    ["\u759F", "\u7627"],
    ["\u75A1", "\u760D"],
    ["\u75AE", "\u7621"],
    ["\u75AF", "\u760B"],
    ["\u75B1", "\u76B0"],
    ["\u75C8", "\u7670"],
    ["\u75C9", "\u75D9"],
    ["\u75D2", "\u7662"],
    ["\u75EA", "\u7613"],
    ["\u75EB", "\u7647"],
    ["\u7618", "\u763B"],
    ["\u762B", "\u7671"],
    ["\u763E", "\u766E"],
    ["\u765E", "\u7669"],
    ["\u7663", "\u766C"],
    ["\u766B", "\u7672"],
    ["\u7691", "\u769A"],
    ["\u76B1", "\u76BA"],
    ["\u76CF", "\u76DE"],
    ["\u76D0", "\u9E7D"],
    ["\u76D1", "\u76E3"],
    ["\u76D8", "\u76E4"],
    ["\u7741", "\u775C"],
    ["\u7750", "\u775E"],
    ["\u7751", "\u77BC"],
    ["\u7792", "\u779E"],
    ["\u77A9", "\u77DA"],
    ["\u77EB", "\u77EF"],
    ["\u77F6", "\u78EF"],
    ["\u77FE", "\u792C"],
    ["\u77FF", "\u7926"],
    ["\u7801", "\u78BC"],
    ["\u7816", "\u78DA"],
    ["\u781A", "\u786F"],
    ["\u783A", "\u792A"],
    ["\u783E", "\u792B"],
    ["\u7840", "\u790E"],
    ["\u7855", "\u78A9"],
    ["\u786E", "\u78BA"],
    ["\u788D", "\u7919"],
    ["\u793C", "\u79AE"],
    ["\u794E", "\u7995"],
    ["\u796F", "\u798E"],
    ["\u7977", "\u79B1"],
    ["\u7978", "\u798D"],
    ["\u7985", "\u79AA"],
    ["\u79BB", "\u96E2"],
    ["\u79C3", "\u79BF"],
    ["\u79C6", "\u7A08"],
    ["\u7A0E", "\u7A05"],
    ["\u7A23", "\u7A4C"],
    ["\u7A33", "\u7A69"],
    ["\u7A51", "\u7A61"],
    ["\u7A77", "\u7AAE"],
    ["\u7A83", "\u7ACA"],
    ["\u7A8D", "\u7AC5"],
    ["\u7A91", "\u7AAF"],
    ["\u7A9C", "\u7AC4"],
    ["\u7A9D", "\u7AA9"],
    ["\u7AA5", "\u7ABA"],
    ["\u7AA6", "\u7AC7"],
    ["\u7AD6", "\u8C4E"],
    ["\u7ADE", "\u7AF6"],
    ["\u7B03", "\u7BE4"],
    ["\u7B14", "\u7B46"],
    ["\u7B3A", "\u7B8B"],
    ["\u7B3C", "\u7C60"],
    ["\u7B5B", "\u7BE9"],
    ["\u7B5D", "\u7B8F"],
    ["\u7B79", "\u7C4C"],
    ["\u7B7E", "\u7C64"],
    ["\u7B80", "\u7C21"],
    ["\u7BA7", "\u7BCB"],
    ["\u7BA9", "\u7C6E"],
    ["\u7BAA", "\u7C1E"],
    ["\u7BAB", "\u7C2B"],
    ["\u7BD3", "\u7C0D"],
    ["\u7BEE", "\u7C43"],
    ["\u7C7B", "\u985E"],
    ["\u7C9C", "\u7CF6"],
    ["\u7CAA", "\u7CDE"],
    ["\u7CAE", "\u7CE7"],
    ["\u7D27", "\u7DCA"],
    ["\u7EA0", "\u7CFE"],
    ["\u7EA2", "\u7D05"],
    ["\u7EA4", "\u7E96"],
    ["\u7EA6", "\u7D04"],
    ["\u7EA7", "\u7D1A"],
    ["\u7EAA", "\u7D00"],
    ["\u7EAB", "\u7D09"],
    ["\u7EAC", "\u7DEF"],
    ["\u7EAF", "\u7D14"],
    ["\u7EB1", "\u7D17"],
    ["\u7EB2", "\u7DB1"],
    ["\u7EB3", "\u7D0D"],
    ["\u7EB5", "\u7E31"],
    ["\u7EB6", "\u7DB8"],
    ["\u7EB7", "\u7D1B"],
    ["\u7EB8", "\u7D19"],
    ["\u7EB9", "\u7D0B"],
    ["\u7EBA", "\u7D21"],
    ["\u7EBD", "\u7D10"],
    ["\u7EBF", "\u7DDA"],
    ["\u7EC3", "\u7DF4"],
    ["\u7EC4", "\u7D44"],
    ["\u7EC5", "\u7D33"],
    ["\u7EC6", "\u7D30"],
    ["\u7EC7", "\u7E54"],
    ["\u7EC8", "\u7D42"],
    ["\u7ECA", "\u7D46"],
    ["\u7ECD", "\u7D39"],
    ["\u7ECE", "\u7E79"],
    ["\u7ECF", "\u7D93"],
    ["\u7ED1", "\u7D81"],
    ["\u7ED2", "\u7D68"],
    ["\u7ED3", "\u7D50"],
    ["\u7ED5", "\u7E5E"],
    ["\u7ED8", "\u7E6A"],
    ["\u7ED9", "\u7D66"],
    ["\u7EDA", "\u7D62"],
    ["\u7EDC", "\u7D61"],
    ["\u7EDD", "\u7D55"],
    ["\u7EDE", "\u7D5E"],
    ["\u7EDF", "\u7D71"],
    ["\u7EE3", "\u7E61"],
    ["\u7EE5", "\u7D8F"],
    ["\u7EE7", "\u7E7C"],
    ["\u7EE9", "\u7E3E"],
    ["\u7EEA", "\u7DD2"],
    ["\u7EED", "\u7E8C"],
    ["\u7EEE", "\u7DBA"],
    ["\u7EEF", "\u7DCB"],
    ["\u7EF0", "\u7DBD"],
    ["\u7EF3", "\u7E69"],
    ["\u7EF4", "\u7DAD"],
    ["\u7EF5", "\u7DBF"],
    ["\u7EF7", "\u7E43"],
    ["\u7EF8", "\u7DA2"],
    ["\u7EFC", "\u7D9C"],
    ["\u7EFD", "\u7DBB"],
    ["\u7EFF", "\u7DA0"],
    ["\u7F00", "\u7DB4"],
    ["\u7F04", "\u7DD8"],
    ["\u7F05", "\u7DEC"],
    ["\u7F06", "\u7E9C"],
    ["\u7F09", "\u7DDD"],
    ["\u7F0E", "\u7DDE"],
    ["\u7F16", "\u7DE8"],
    ["\u7F18", "\u7DE3"],
    ["\u7F1A", "\u7E1B"],
    ["\u7F1D", "\u7E2B"],
    ["\u7F20", "\u7E8F"],
    ["\u7F24", "\u7E7D"],
    ["\u7F25", "\u7E39"],
    ["\u7F28", "\u7E93"],
    ["\u7F29", "\u7E2E"],
    ["\u7F2A", "\u7E46"],
    ["\u7F2D", "\u7E5A"],
    ["\u7F2E", "\u7E55"],
    ["\u7F30", "\u7E6E"],
    ["\u7F34", "\u7E73"],
    ["\u7F51", "\u7DB2"],
    ["\u7F57", "\u7F85"],
    ["\u7F5A", "\u7F70"],
    ["\u7F62", "\u7F77"],
    ["\u7F81", "\u7F88"],
    ["\u8038", "\u8073"],
    ["\u803B", "\u6065"],
    ["\u8042", "\u8076"],
    ["\u804B", "\u807E"],
    ["\u804C", "\u8077"],
    ["\u8054", "\u806F"],
    ["\u8069", "\u8075"],
    ["\u806A", "\u8070"],
    ["\u8083", "\u8085"],
    ["\u80A0", "\u8178"],
    ["\u80A4", "\u819A"],
    ["\u80BE", "\u814E"],
    ["\u80BF", "\u816B"],
    ["\u80C0", "\u8139"],
    ["\u80C1", "\u8105"],
    ["\u80C6", "\u81BD"],
    ["\u80DC", "\u52DD"],
    ["\u80E7", "\u6727"],
    ["\u80F6", "\u81A0"],
    ["\u8109", "\u8108"],
    ["\u810D", "\u81BE"],
    ["\u810F", "\u81DF"],
    ["\u8110", "\u81CD"],
    ["\u8111", "\u8166"],
    ["\u8113", "\u81BF"],
    ["\u811A", "\u8173"],
    ["\u8138", "\u81C9"],
    ["\u814A", "\u81D8"],
    ["\u817B", "\u81A9"],
    ["\u817E", "\u9A30"],
    ["\u8206", "\u8F3F"],
    ["\u8230", "\u8266"],
    ["\u8231", "\u8259"],
    ["\u8270", "\u8271"],
    ["\u8273", "\u8277"],
    ["\u827A", "\u85DD"],
    ["\u829C", "\u856A"],
    ["\u82A6", "\u8606"],
    ["\u82C7", "\u8466"],
    ["\u82CB", "\u83A7"],
    ["\u82CD", "\u84BC"],
    ["\u82CF", "\u8607"],
    ["\u830E", "\u8396"],
    ["\u8327", "\u7E6D"],
    ["\u8346", "\u834A"],
    ["\u8350", "\u85A6"],
    ["\u835A", "\u83A2"],
    ["\u835E", "\u854E"],
    ["\u835F", "\u8588"],
    ["\u8360", "\u85BA"],
    ["\u8363", "\u69AE"],
    ["\u8364", "\u8477"],
    ["\u8365", "\u6ECE"],
    ["\u8366", "\u7296"],
    ["\u8367", "\u7192"],
    ["\u8368", "\u8541"],
    ["\u836A", "\u84C0"],
    ["\u836B", "\u852D"],
    ["\u836F", "\u85E5"],
    ["\u83B1", "\u840A"],
    ["\u83B2", "\u84EE"],
    ["\u83B3", "\u8494"],
    ["\u83B4", "\u8435"],
    ["\u83B7", "\u7372"],
    ["\u83B9", "\u7469"],
    ["\u83BA", "\u9DAF"],
    ["\u841D", "\u863F"],
    ["\u8424", "\u87A2"],
    ["\u8425", "\u71DF"],
    ["\u8426", "\u7E08"],
    ["\u8427", "\u856D"],
    ["\u8428", "\u85A9"],
    ["\u8489", "\u8562"],
    ["\u848B", "\u8523"],
    ["\u84DD", "\u85CD"],
    ["\u84DF", "\u858A"],
    ["\u84E3", "\u8577"],
    ["\u84E6", "\u9A40"],
    ["\u8537", "\u8594"],
    ["\u853A", "\u85FA"],
    ["\u853C", "\u85F9"],
    ["\u8572", "\u8604"],
    ["\u8574", "\u860A"],
    ["\u85AE", "\u85EA"],
    ["\u85D3", "\u861A"],
    ["\u864F", "\u865C"],
    ["\u8651", "\u616E"],
    ["\u865A", "\u865B"],
    ["\u866C", "\u866F"],
    ["\u867D", "\u96D6"],
    ["\u867E", "\u8766"],
    ["\u8680", "\u8755"],
    ["\u8681", "\u87FB"],
    ["\u8682", "\u879E"],
    ["\u8695", "\u8836"],
    ["\u869D", "\u8814"],
    ["\u86AC", "\u8706"],
    ["\u86CA", "\u8831"],
    ["\u86CE", "\u8823"],
    ["\u86CF", "\u87F6"],
    ["\u86EE", "\u883B"],
    ["\u86F0", "\u87C4"],
    ["\u86F1", "\u86FA"],
    ["\u86F2", "\u87EF"],
    ["\u86F3", "\u8784"],
    ["\u8715", "\u86FB"],
    ["\u8717", "\u8778"],
    ["\u8721", "\u881F"],
    ["\u8748", "\u87C8"],
    ["\u877C", "\u87BB"],
    ["\u877E", "\u8811"],
    ["\u87A8", "\u87CE"],
    ["\u8845", "\u91C1"],
    ["\u8854", "\u929C"],
    ["\u8865", "\u88DC"],
    ["\u8884", "\u8956"],
    ["\u8885", "\u88CA"],
    ["\u889C", "\u896A"],
    ["\u88AD", "\u8972"],
    ["\u88C5", "\u88DD"],
    ["\u88C6", "\u8960"],
    ["\u88E4", "\u8932"],
    ["\u891B", "\u8938"],
    ["\u8934", "\u8964"],
    ["\u89C1", "\u898B"],
    ["\u89C2", "\u89C0"],
    ["\u89C4", "\u898F"],
    ["\u89C5", "\u8993"],
    ["\u89C6", "\u8996"],
    ["\u89C8", "\u89BD"],
    ["\u89C9", "\u89BA"],
    ["\u89CA", "\u89AC"],
    ["\u89CE", "\u89A6"],
    ["\u89D0", "\u89B2"],
    ["\u89D1", "\u89B7"],
    ["\u89E6", "\u89F8"],
    ["\u8A89", "\u8B7D"],
    ["\u8A8A", "\u8B04"],
    ["\u8BA1", "\u8A08"],
    ["\u8BA2", "\u8A02"],
    ["\u8BA3", "\u8A03"],
    ["\u8BA4", "\u8A8D"],
    ["\u8BA5", "\u8B4F"],
    ["\u8BA8", "\u8A0E"],
    ["\u8BA9", "\u8B93"],
    ["\u8BAD", "\u8A13"],
    ["\u8BAE", "\u8B70"],
    ["\u8BAF", "\u8A0A"],
    ["\u8BB0", "\u8A18"],
    ["\u8BB2", "\u8B1B"],
    ["\u8BB3", "\u8AF1"],
    ["\u8BB4", "\u8B33"],
    ["\u8BB6", "\u8A1D"],
    ["\u8BB8", "\u8A31"],
    ["\u8BB9", "\u8A1B"],
    ["\u8BBA", "\u8AD6"],
    ["\u8BBC", "\u8A1F"],
    ["\u8BBD", "\u8AF7"],
    ["\u8BBE", "\u8A2D"],
    ["\u8BBF", "\u8A2A"],
    ["\u8BC0", "\u8A23"],
    ["\u8BC1", "\u8B49"],
    ["\u8BC4", "\u8A55"],
    ["\u8BC5", "\u8A5B"],
    ["\u8BC8", "\u8A50"],
    ["\u8BC9", "\u8A34"],
    ["\u8BCD", "\u8A5E"],
    ["\u8BD5", "\u8A66"],
    ["\u8BD7", "\u8A69"],
    ["\u8BD8", "\u8A70"],
    ["\u8BD9", "\u8A7C"],
    ["\u8BDA", "\u8AA0"],
    ["\u8BDB", "\u8A85"],
    ["\u8BDD", "\u8A71"],
    ["\u8BDE", "\u8A95"],
    ["\u8BE1", "\u8A6D"],
    ["\u8BE2", "\u8A62"],
    ["\u8BE3", "\u8A63"],
    ["\u8BE5", "\u8A72"],
    ["\u8BE6", "\u8A73"],
    ["\u8BE7", "\u8A6B"],
    ["\u8BEB", "\u8AA1"],
    ["\u8BEC", "\u8AA3"],
    ["\u8BED", "\u8A9E"],
    ["\u8BEF", "\u8AA4"],
    ["\u8BF1", "\u8A98"],
    ["\u8BF2", "\u8AA8"],
    ["\u8BF4", "\u8AAA"],
    ["\u8BF5", "\u8AA6"],
    ["\u8BF7", "\u8ACB"],
    ["\u8BF8", "\u8AF8"],
    ["\u8BFA", "\u8AFE"],
    ["\u8BFB", "\u8B80"],
    ["\u8BFD", "\u8AB9"],
    ["\u8BFE", "\u8AB2"],
    ["\u8C01", "\u8AB0"],
    ["\u8C03", "\u8ABF"],
    ["\u8C05", "\u8AD2"],
    ["\u8C06", "\u8AC4"],
    ["\u8C08", "\u8AC7"],
    ["\u8C0A", "\u8ABC"],
    ["\u8C0B", "\u8B00"],
    ["\u8C0D", "\u8ADC"],
    ["\u8C0E", "\u8B0A"],
    ["\u8C0F", "\u8AEB"],
    ["\u8C10", "\u8AE7"],
    ["\u8C11", "\u8B14"],
    ["\u8C13", "\u8B02"],
    ["\u8C15", "\u8AED"],
    ["\u8C1A", "\u8AFA"],
    ["\u8C1B", "\u8AE6"],
    ["\u8C1C", "\u8B0E"],
    ["\u8C22", "\u8B1D"],
    ["\u8C23", "\u8B20"],
    ["\u8C24", "\u8B17"],
    ["\u8C26", "\u8B19"],
    ["\u8C27", "\u8B10"],
    ["\u8C28", "\u8B39"],
    ["\u8C2C", "\u8B2C"],
    ["\u8C2D", "\u8B5A"],
    ["\u8C31", "\u8B5C"],
    ["\u8C32", "\u8B4E"],
    ["\u8C34", "\u8B74"],
    ["\u8D1D", "\u8C9D"],
    ["\u8D1E", "\u8C9E"],
    ["\u8D1F", "\u8CA0"],
    ["\u8D21", "\u8CA2"],
    ["\u8D22", "\u8CA1"],
    ["\u8D23", "\u8CAC"],
    ["\u8D24", "\u8CE2"],
    ["\u8D25", "\u6557"],
    ["\u8D26", "\u8CEC"],
    ["\u8D27", "\u8CA8"],
    ["\u8D28", "\u8CEA"],
    ["\u8D29", "\u8CA9"],
    ["\u8D2A", "\u8CAA"],
    ["\u8D2B", "\u8CA7"],
    ["\u8D2C", "\u8CB6"],
    ["\u8D2D", "\u8CFC"],
    ["\u8D2E", "\u8CAF"],
    ["\u8D2F", "\u8CAB"],
    ["\u8D30", "\u8CB3"],
    ["\u8D31", "\u8CE4"],
    ["\u8D34", "\u8CBC"],
    ["\u8D35", "\u8CB4"],
    ["\u8D37", "\u8CB8"],
    ["\u8D38", "\u8CBF"],
    ["\u8D39", "\u8CBB"],
    ["\u8D3A", "\u8CC0"],
    ["\u8D3C", "\u8CCA"],
    ["\u8D3E", "\u8CC8"],
    ["\u8D3F", "\u8CC4"],
    ["\u8D41", "\u8CC3"],
    ["\u8D42", "\u8CC2"],
    ["\u8D43", "\u8D1C"],
    ["\u8D44", "\u8CC7"],
    ["\u8D45", "\u8CC5"],
    ["\u8D48", "\u8CD1"],
    ["\u8D4A", "\u8CD2"],
    ["\u8D4B", "\u8CE6"],
    ["\u8D4C", "\u8CED"],
    ["\u8D4E", "\u8D16"],
    ["\u8D4F", "\u8CDE"],
    ["\u8D50", "\u8CDC"],
    ["\u8D54", "\u8CE0"],
    ["\u8D56", "\u8CF4"],
    ["\u8D58", "\u8D05"],
    ["\u8D5A", "\u8CFA"],
    ["\u8D5B", "\u8CFD"],
    ["\u8D5E", "\u8D0A"],
    ["\u8D60", "\u8D08"],
    ["\u8D61", "\u8D0D"],
    ["\u8D62", "\u8D0F"],
    ["\u8D63", "\u8D1B"],
    ["\u8D75", "\u8D99"],
    ["\u8D76", "\u8D95"],
    ["\u8D8B", "\u8DA8"],
    ["\u8DC3", "\u8E8D"],
    ["\u8DC4", "\u8E4C"],
    ["\u8DF5", "\u8E10"],
    ["\u8DF7", "\u8E7A"],
    ["\u8DF9", "\u8E9A"],
    ["\u8DFB", "\u8E8B"],
    ["\u8E0C", "\u8E8A"],
    ["\u8E2A", "\u8E64"],
    ["\u8E2C", "\u8E93"],
    ["\u8E2F", "\u8E91"],
    ["\u8E51", "\u8EA1"],
    ["\u8E52", "\u8E63"],
    ["\u8E7F", "\u8EA5"],
    ["\u8E8F", "\u8EAA"],
    ["\u8EAF", "\u8EC0"],
    ["\u8F69", "\u8ED2"],
    ["\u8F6C", "\u8F49"],
    ["\u8F6D", "\u8EDB"],
    ["\u8F6E", "\u8F2A"],
    ["\u8F6F", "\u8EDF"],
    ["\u8F70", "\u8F5F"],
    ["\u8F74", "\u8EF8"],
    ["\u8F76", "\u8EFC"],
    ["\u8F7B", "\u8F15"],
    ["\u8F7C", "\u8EFE"],
    ["\u8F7D", "\u8F09"],
    ["\u8F7F", "\u8F4E"],
    ["\u8F83", "\u8F03"],
    ["\u8F84", "\u8F12"],
    ["\u8F85", "\u8F14"],
    ["\u8F86", "\u8F1B"],
    ["\u8F88", "\u8F29"],
    ["\u8F89", "\u8F1D"],
    ["\u8F8D", "\u8F1F"],
    ["\u8F90", "\u8F3B"],
    ["\u8F91", "\u8F2F"],
    ["\u8F93", "\u8F38"],
    ["\u8F95", "\u8F45"],
    ["\u8F96", "\u8F44"],
    ["\u8F97", "\u8F3E"],
    ["\u8F99", "\u8F4D"],
    ["\u8F9E", "\u8FAD"],
    ["\u8FA9", "\u8FAF"],
    ["\u8FAB", "\u8FAE"],
    ["\u8FB9", "\u908A"],
    ["\u8FBD", "\u907C"],
    ["\u8FBE", "\u9054"],
    ["\u8FC1", "\u9077"],
    ["\u8FC7", "\u904E"],
    ["\u8FC8", "\u9081"],
    ["\u8FD0", "\u904B"],
    ["\u8FD8", "\u9084"],
    ["\u8FD9", "\u9019"],
    ["\u8FDB", "\u9032"],
    ["\u8FDC", "\u9060"],
    ["\u8FDD", "\u9055"],
    ["\u8FDE", "\u9023"],
    ["\u8FDF", "\u9072"],
    ["\u9002", "\u9069"],
    ["\u9009", "\u9078"],
    ["\u900A", "\u905C"],
    ["\u9012", "\u905E"],
    ["\u903B", "\u908F"],
    ["\u9057", "\u907A"],
    ["\u9065", "\u9059"],
    ["\u9093", "\u9127"],
    ["\u90AE", "\u90F5"],
    ["\u90B9", "\u9112"],
    ["\u90BB", "\u9130"],
    ["\u90D1", "\u912D"],
    ["\u90E7", "\u9116"],
    ["\u90F8", "\u9132"],
    ["\u915D", "\u919E"],
    ["\u917F", "\u91C0"],
    ["\u91CA", "\u91CB"],
    ["\u9274", "\u9452"],
    ["\u92AE", "\u947E"],
    ["\u9488", "\u91DD"],
    ["\u9489", "\u91D8"],
    ["\u948A", "\u91D7"],
    ["\u948E", "\u91FA"],
    ["\u948F", "\u91E7"],
    ["\u9493", "\u91E3"],
    ["\u9497", "\u91F5"],
    ["\u9499", "\u9223"],
    ["\u949B", "\u9226"],
    ["\u949D", "\u920D"],
    ["\u949E", "\u9214"],
    ["\u949F", "\u9418"],
    ["\u94A0", "\u9209"],
    ["\u94A2", "\u92FC"],
    ["\u94A3", "\u9211"],
    ["\u94A5", "\u9470"],
    ["\u94A6", "\u6B3D"],
    ["\u94A7", "\u921E"],
    ["\u94A8", "\u93A2"],
    ["\u94A9", "\u9264"],
    ["\u94AE", "\u9215"],
    ["\u94AF", "\u9200"],
    ["\u94B0", "\u923A"],
    ["\u94B1", "\u9322"],
    ["\u94B2", "\u9266"],
    ["\u94B3", "\u9257"],
    ["\u94B4", "\u9237"],
    ["\u94B5", "\u7F3D"],
    ["\u94BB", "\u947D"],
    ["\u94BC", "\u926C"],
    ["\u94BE", "\u9240"],
    ["\u94C0", "\u923E"],
    ["\u94C1", "\u9435"],
    ["\u94C2", "\u9251"],
    ["\u94C3", "\u9234"],
    ["\u94C5", "\u925B"],
    ["\u94C6", "\u925A"],
    ["\u94C9", "\u9249"],
    ["\u94CB", "\u924D"],
    ["\u94CE", "\u9438"],
    ["\u94D0", "\u92AC"],
    ["\u94DB", "\u943A"],
    ["\u94DC", "\u9285"],
    ["\u94DD", "\u92C1"],
    ["\u94E0", "\u93A7"],
    ["\u94E1", "\u9358"],
    ["\u94E3", "\u9291"],
    ["\u94E4", "\u92CC"],
    ["\u94E7", "\u93F5"],
    ["\u94E8", "\u9293"],
    ["\u94EC", "\u927B"],
    ["\u94ED", "\u9298"],
    ["\u94EE", "\u931A"],
    ["\u94F0", "\u9278"],
    ["\u94F2", "\u93DF"],
    ["\u94F3", "\u9283"],
    ["\u94F5", "\u92A8"],
    ["\u94F6", "\u9280"],
    ["\u94F8", "\u9444"],
    ["\u94FA", "\u92EA"],
    ["\u94FE", "\u93C8"],
    ["\u94FF", "\u93D7"],
    ["\u9500", "\u92B7"],
    ["\u9501", "\u9396"],
    ["\u9502", "\u92F0"],
    ["\u9504", "\u92E4"],
    ["\u9505", "\u934B"],
    ["\u9506", "\u92EF"],
    ["\u9508", "\u93FD"],
    ["\u9509", "\u92BC"],
    ["\u950B", "\u92D2"],
    ["\u950C", "\u92C5"],
    ["\u9510", "\u92B3"],
    ["\u9511", "\u92BB"],
    ["\u9519", "\u932F"],
    ["\u951A", "\u9328"],
    ["\u951F", "\u9315"],
    ["\u9521", "\u932B"],
    ["\u9522", "\u932E"],
    ["\u9523", "\u947C"],
    ["\u9524", "\u9318"],
    ["\u9525", "\u9310"],
    ["\u9526", "\u9326"],
    ["\u9528", "\u9341"],
    ["\u952D", "\u9320"],
    ["\u952E", "\u9375"],
    ["\u952F", "\u92F8"],
    ["\u9530", "\u9333"],
    ["\u9532", "\u9365"],
    ["\u9535", "\u93D8"],
    ["\u9536", "\u9376"],
    ["\u9537", "\u9354"],
    ["\u9539", "\u936C"],
    ["\u953B", "\u935B"],
    ["\u9540", "\u934D"],
    ["\u9541", "\u9382"],
    ["\u9542", "\u93E4"],
    ["\u9547", "\u93AE"],
    ["\u954A", "\u9477"],
    ["\u954C", "\u942B"],
    ["\u954D", "\u93B3"],
    ["\u954F", "\u93A6"],
    ["\u9550", "\u93AC"],
    ["\u9551", "\u938A"],
    ["\u9552", "\u93B0"],
    ["\u9555", "\u9394"],
    ["\u9556", "\u93E2"],
    ["\u955C", "\u93E1"],
    ["\u955D", "\u93D1"],
    ["\u9563", "\u9410"],
    ["\u9567", "\u946D"],
    ["\u956D", "\u9433"],
    ["\u956F", "\u9432"],
    ["\u9570", "\u942E"],
    ["\u9573", "\u9463"],
    ["\u9576", "\u9472"],
    ["\u957F", "\u9577"],
    ["\u95E8", "\u9580"],
    ["\u95E9", "\u9582"],
    ["\u95EA", "\u9583"],
    ["\u95ED", "\u9589"],
    ["\u95EE", "\u554F"],
    ["\u95EF", "\u95D6"],
    ["\u95F0", "\u958F"],
    ["\u95F2", "\u9592"],
    ["\u95F4", "\u9593"],
    ["\u95F5", "\u9594"],
    ["\u95F7", "\u60B6"],
    ["\u95F8", "\u9598"],
    ["\u95F9", "\u9B27"],
    ["\u95FA", "\u95A8"],
    ["\u95FB", "\u805E"],
    ["\u95FD", "\u95A9"],
    ["\u95FE", "\u95AD"],
    ["\u9600", "\u95A5"],
    ["\u9601", "\u95A3"],
    ["\u9605", "\u95B1"],
    ["\u9606", "\u95AC"],
    ["\u9609", "\u95B9"],
    ["\u960E", "\u95BB"],
    ["\u9610", "\u95E1"],
    ["\u9611", "\u95CC"],
    ["\u9614", "\u95CA"],
    ["\u9616", "\u95D4"],
    ["\u9617", "\u95D0"],
    ["\u9619", "\u95D5"],
    ["\u961F", "\u968A"],
    ["\u9633", "\u967D"],
    ["\u9634", "\u9670"],
    ["\u9635", "\u9663"],
    ["\u9636", "\u968E"],
    ["\u9645", "\u969B"],
    ["\u9646", "\u9678"],
    ["\u9647", "\u96B4"],
    ["\u9648", "\u9673"],
    ["\u9655", "\u965D"],
    ["\u9668", "\u9695"],
    ["\u9669", "\u96AA"],
    ["\u968F", "\u96A8"],
    ["\u9690", "\u96B1"],
    ["\u96B6", "\u96B8"],
    ["\u96BE", "\u96E3"],
    ["\u96CF", "\u96DB"],
    ["\u96F3", "\u9742"],
    ["\u96FE", "\u9727"],
    ["\u9701", "\u973D"],
    ["\u972D", "\u9744"],
    ["\u9753", "\u975A"],
    ["\u9765", "\u9768"],
    ["\u9791", "\u97C3"],
    ["\u97E6", "\u97CB"],
    ["\u97E7", "\u97CC"],
    ["\u97E9", "\u97D3"],
    ["\u97EC", "\u97DC"],
    ["\u9875", "\u9801"],
    ["\u9876", "\u9802"],
    ["\u9877", "\u9803"],
    ["\u9879", "\u9805"],
    ["\u987A", "\u9806"],
    ["\u987B", "\u9808"],
    ["\u987D", "\u9811"],
    ["\u987E", "\u9867"],
    ["\u987F", "\u9813"],
    ["\u9880", "\u980E"],
    ["\u9881", "\u9812"],
    ["\u9882", "\u980C"],
    ["\u9884", "\u9810"],
    ["\u9885", "\u9871"],
    ["\u9886", "\u9818"],
    ["\u9887", "\u9817"],
    ["\u9888", "\u9838"],
    ["\u9889", "\u9821"],
    ["\u988A", "\u9830"],
    ["\u988C", "\u981C"],
    ["\u988D", "\u6F41"],
    ["\u9890", "\u9824"],
    ["\u9891", "\u983B"],
    ["\u9893", "\u9839"],
    ["\u9896", "\u7A4E"],
    ["\u9897", "\u9846"],
    ["\u9898", "\u984C"],
    ["\u989A", "\u984E"],
    ["\u989C", "\u984F"],
    ["\u989D", "\u984D"],
    ["\u989E", "\u9873"],
    ["\u98A0", "\u985B"],
    ["\u98A2", "\u9865"],
    ["\u98A4", "\u986B"],
    ["\u98A6", "\u9870"],
    ["\u98A7", "\u9874"],
    ["\u98CE", "\u98A8"],
    ["\u98CF", "\u98BA"],
    ["\u98D2", "\u98AF"],
    ["\u98D3", "\u98B6"],
    ["\u98D8", "\u98C4"],
    ["\u98D9", "\u98C6"],
    ["\u98DE", "\u98DB"],
    ["\u98E8", "\u9957"],
    ["\u9965", "\u98E2"],
    ["\u9967", "\u9933"],
    ["\u9968", "\u98E9"],
    ["\u996A", "\u98EA"],
    ["\u996D", "\u98EF"],
    ["\u996E", "\u98F2"],
    ["\u996F", "\u991E"],
    ["\u9970", "\u98FE"],
    ["\u9971", "\u98FD"],
    ["\u9972", "\u98FC"],
    ["\u9974", "\u98F4"],
    ["\u9975", "\u990C"],
    ["\u9976", "\u9952"],
    ["\u9977", "\u9909"],
    ["\u997A", "\u9903"],
    ["\u997C", "\u9905"],
    ["\u997D", "\u9911"],
    ["\u997F", "\u9913"],
    ["\u9980", "\u9918"],
    ["\u9981", "\u9912"],
    ["\u9984", "\u991B"],
    ["\u9985", "\u9921"],
    ["\u9986", "\u9928"],
    ["\u9988", "\u994B"],
    ["\u998B", "\u995E"],
    ["\u998D", "\u9943"],
    ["\u998F", "\u993E"],
    ["\u9990", "\u9948"],
    ["\u9991", "\u9949"],
    ["\u9992", "\u9945"],
    ["\u9994", "\u994C"],
    ["\u9A6C", "\u99AC"],
    ["\u9A6D", "\u99AD"],
    ["\u9A6E", "\u99B1"],
    ["\u9A6F", "\u99B4"],
    ["\u9A70", "\u99B3"],
    ["\u9A71", "\u9A45"],
    ["\u9A73", "\u99C1"],
    ["\u9A74", "\u9A62"],
    ["\u9A76", "\u99DB"],
    ["\u9A77", "\u99DF"],
    ["\u9A79", "\u99D2"],
    ["\u9A7B", "\u99D0"],
    ["\u9A7C", "\u99DD"],
    ["\u9A7E", "\u99D5"],
    ["\u9A7F", "\u9A5B"],
    ["\u9A81", "\u9A4D"],
    ["\u9A82", "\u7F75"],
    ["\u9A84", "\u9A55"],
    ["\u9A85", "\u9A4A"],
    ["\u9A86", "\u99F1"],
    ["\u9A87", "\u99ED"],
    ["\u9A88", "\u99E2"],
    ["\u9A8A", "\u9A6A"],
    ["\u9A8B", "\u9A01"],
    ["\u9A8C", "\u9A57"],
    ["\u9A8F", "\u99FF"],
    ["\u9A90", "\u9A0F"],
    ["\u9A91", "\u9A0E"],
    ["\u9A92", "\u9A0D"],
    ["\u9A93", "\u9A05"],
    ["\u9A97", "\u9A19"],
    ["\u9A9A", "\u9A37"],
    ["\u9A9B", "\u9A16"],
    ["\u9A9C", "\u9A41"],
    ["\u9A9D", "\u9A2E"],
    ["\u9A9E", "\u9A2B"],
    ["\u9A9F", "\u9A38"],
    ["\u9AA0", "\u9A43"],
    ["\u9AA1", "\u9A3E"],
    ["\u9AA2", "\u9A44"],
    ["\u9AA4", "\u9A5F"],
    ["\u9AA5", "\u9A65"],
    ["\u9AC5", "\u9ACF"],
    ["\u9ACB", "\u9AD6"],
    ["\u9ACC", "\u9AD5"],
    ["\u9B13", "\u9B22"],
    ["\u9B47", "\u9B58"],
    ["\u9B49", "\u9B4E"],
    ["\u9C7C", "\u9B5A"],
    ["\u9C7F", "\u9B77"],
    ["\u9C81", "\u9B6F"],
    ["\u9C82", "\u9B74"],
    ["\u9C85", "\u9B81"],
    ["\u9C86", "\u9B83"],
    ["\u9C88", "\u9C78"],
    ["\u9C8B", "\u9B92"],
    ["\u9C8D", "\u9B91"],
    ["\u9C8E", "\u9C5F"],
    ["\u9C91", "\u9BAD"],
    ["\u9C94", "\u9BAA"],
    ["\u9C95", "\u9B9E"],
    ["\u9C9B", "\u9BAB"],
    ["\u9C9F", "\u9C58"],
    ["\u9CA0", "\u9BC1"],
    ["\u9CA2", "\u9C31"],
    ["\u9CA3", "\u9C39"],
    ["\u9CA4", "\u9BC9"],
    ["\u9CA5", "\u9C23"],
    ["\u9CA6", "\u9C37"],
    ["\u9CA7", "\u9BC0"],
    ["\u9CA8", "\u9BCA"],
    ["\u9CA9", "\u9BC7"],
    ["\u9CAB", "\u9BFD"],
    ["\u9CAD", "\u9BD6"],
    ["\u9CAE", "\u9BEA"],
    ["\u9CB1", "\u9BE1"],
    ["\u9CB2", "\u9BE4"],
    ["\u9CB3", "\u9BE7"],
    ["\u9CB5", "\u9BE2"],
    ["\u9CB6", "\u9BF0"],
    ["\u9CB7", "\u9BDB"],
    ["\u9CB8", "\u9BE8"],
    ["\u9CBB", "\u9BD4"],
    ["\u9CBC", "\u9C5D"],
    ["\u9CBD", "\u9C08"],
    ["\u9CC3", "\u9C13"],
    ["\u9CC4", "\u9C77"],
    ["\u9CC5", "\u9C0D"],
    ["\u9CC7", "\u9C09"],
    ["\u9CCC", "\u9C32"],
    ["\u9CCD", "\u9C2D"],
    ["\u9CCE", "\u9C28"],
    ["\u9CCF", "\u9C25"],
    ["\u9CD0", "\u9C29"],
    ["\u9CD3", "\u9C33"],
    ["\u9CD4", "\u9C3E"],
    ["\u9CD5", "\u9C48"],
    ["\u9CD6", "\u9C49"],
    ["\u9CD7", "\u9C3B"],
    ["\u9CDC", "\u9C56"],
    ["\u9CDD", "\u9C54"],
    ["\u9CDE", "\u9C57"],
    ["\u9CDF", "\u9C52"],
    ["\u9CE2", "\u9C67"],
    ["\u9E1F", "\u9CE5"],
    ["\u9E20", "\u9CE9"],
    ["\u9E21", "\u96DE"],
    ["\u9E22", "\u9CF6"],
    ["\u9E23", "\u9CF4"],
    ["\u9E25", "\u9DD7"],
    ["\u9E26", "\u9D09"],
    ["\u9E28", "\u9D07"],
    ["\u9E29", "\u9D06"],
    ["\u9E2A", "\u9D23"],
    ["\u9E2B", "\u9D87"],
    ["\u9E2C", "\u9E15"],
    ["\u9E2D", "\u9D28"],
    ["\u9E2F", "\u9D26"],
    ["\u9E31", "\u9D1F"],
    ["\u9E33", "\u9D1B"],
    ["\u9E35", "\u9D15"],
    ["\u9E37", "\u9DD9"],
    ["\u9E38", "\u9D2F"],
    ["\u9E39", "\u9D30"],
    ["\u9E3D", "\u9D3F"],
    ["\u9E3E", "\u9E1E"],
    ["\u9E3F", "\u9D3B"],
    ["\u9E42", "\u9E1D"],
    ["\u9E43", "\u9D51"],
    ["\u9E44", "\u9D60"],
    ["\u9E45", "\u9D5D"],
    ["\u9E49", "\u9D61"],
    ["\u9E4A", "\u9D72"],
    ["\u9E4C", "\u9D6A"],
    ["\u9E4F", "\u9D6C"],
    ["\u9E51", "\u9D89"],
    ["\u9E55", "\u9D98"],
    ["\u9E57", "\u9D9A"],
    ["\u9E58", "\u9DBB"],
    ["\u9E5C", "\u9DA9"],
    ["\u9E5E", "\u9DC2"],
    ["\u9E63", "\u9DBC"],
    ["\u9E64", "\u9DB4"],
    ["\u9E66", "\u9E1A"],
    ["\u9E67", "\u9DD3"],
    ["\u9E68", "\u9DDA"],
    ["\u9E69", "\u9DEF"],
    ["\u9E6A", "\u9DE6"],
    ["\u9E6C", "\u9DF8"],
    ["\u9E6D", "\u9DFA"],
    ["\u9E70", "\u9DF9"],
    ["\u9E73", "\u9E1B"],
    ["\u9EA6", "\u9EA5"],
    ["\u9EB8", "\u9EA9"],
    ["\u9EC4", "\u9EC3"],
    ["\u9EC9", "\u9ECC"],
    ["\u9EE1", "\u9EF6"],
    ["\u9EE9", "\u9EF7"],
    ["\u9EFE", "\u9EFD"],
    ["\u9F0B", "\u9EFF"],
    ["\u9F0D", "\u9F09"],
    ["\u9F50", "\u9F4A"],
    ["\u9F51", "\u9F4F"],
    ["\u9F7F", "\u9F52"],
    ["\u9F80", "\u9F54"],
    ["\u9F81", "\u9F55"],
    ["\u9F84", "\u9F61"],
    ["\u9F85", "\u9F59"],
    ["\u9F86", "\u9F60"],
    ["\u9F87", "\u9F5C"],
    ["\u9F88", "\u9F66"],
    ["\u9F89", "\u9F6C"],
    ["\u9F8A", "\u9F6A"],
    ["\u9F8B", "\u9F72"],
    ["\u9F8C", "\u9F77"],
    ["\u9F99", "\u9F8D"],
    ["\u9F9A", "\u9F94"],
    ["\u9F9B", "\u9F95"],
    ["\u9F9F", "\u9F9C"]
  ];
  var SIMP_ONLY = new Set(SIMP_TRAD_PAIRS.map((p) => p[0]));
  var TRAD_ONLY = new Set(SIMP_TRAD_PAIRS.map((p) => p[1]));
  var CJK_RE = /[㐀-鿿豈-﫿]/g;
  var NONSPACE_RE = /\S/g;
  function detectLanguage(text) {
    const src = typeof text === "string" ? text : "";
    const nonSpace = src.match(NONSPACE_RE);
    if (!nonSpace || nonSpace.length === 0) return { code: null, confidence: 0 };
    const cjk = src.match(CJK_RE);
    const cjkCount = cjk ? cjk.length : 0;
    const cjkRatio = cjkCount / nonSpace.length;
    if (cjkRatio < 0.15) {
      const hasLatin = /[A-Za-z]/.test(src);
      return hasLatin ? { code: "en", confidence: 0.9 } : { code: null, confidence: 0 };
    }
    let trad = 0;
    let simp = 0;
    for (const ch of src) {
      if (TRAD_ONLY.has(ch)) trad++;
      else if (SIMP_ONLY.has(ch)) simp++;
    }
    const discriminators = trad + simp;
    if (discriminators === 0) return { code: null, confidence: 0 };
    const code = trad >= simp ? "zh-HK" : "zh-CN";
    const dominance = Math.max(trad, simp) / discriminators;
    const confidence = discriminators >= 3 && dominance >= 0.75 ? 0.9 : dominance >= 0.6 ? 0.5 : 0.2;
    return { code, confidence };
  }

  // i18n.js
  function t(key, subs = null, fallback = null) {
    try {
      const msg = chrome.i18n.getMessage(key, subs || void 0);
      if (msg) return msg;
    } catch {
    }
    return fallback !== null ? fallback : key;
  }
  function uiLocale() {
    try {
      return chrome.i18n.getUILanguage();
    } catch {
      return "en";
    }
  }
  var RTF_CACHE = /* @__PURE__ */ new Map();
  function relativeTimeLocalized(ts) {
    if (!ts) return t("time_never", null, "never");
    const then = new Date(ts).getTime();
    if (isNaN(then)) return t("time_never", null, "never");
    const diff = then - Date.now();
    const abs = Math.abs(diff);
    const rtf = RTF_CACHE.get(uiLocale()) || new Intl.RelativeTimeFormat(uiLocale(), { numeric: "auto" });
    RTF_CACHE.set(uiLocale(), rtf);
    const minute = 6e4, hour = 36e5, day = 864e5;
    if (abs < minute) return t("time_just_now", null, "just now");
    if (abs < hour) return rtf.format(Math.round(diff / minute), "minute");
    if (abs < day) return rtf.format(Math.round(diff / hour), "hour");
    if (abs < 7 * day) return rtf.format(Math.round(diff / day), "day");
    return new Intl.DateTimeFormat(uiLocale()).format(then);
  }

  // categories.js
  var CATEGORIES = Object.freeze([
    Object.freeze({ id: "writing", name: "Writing & Content", description: "blog posts, articles, stories, copywriting, content generation" }),
    Object.freeze({ id: "coding", name: "Coding & Development", description: "code generation, debugging, code review, technical documentation" }),
    Object.freeze({ id: "analysis", name: "Analysis & Research", description: "summarization, research, fact-finding, comparison, synthesis" }),
    Object.freeze({ id: "creative", name: "Creative & Design", description: "creative writing, brainstorming, design ideas, naming, visual concepts" }),
    Object.freeze({ id: "business", name: "Business & Marketing", description: "marketing copy, sales, strategy, branding, customer-facing content" }),
    Object.freeze({ id: "education", name: "Education & Learning", description: "explanations, tutorials, study aids, lesson plans, quizzes" }),
    Object.freeze({ id: "data", name: "Data & Technical", description: "data analysis, SQL, spreadsheets, technical specs, system design" }),
    Object.freeze({ id: "communication", name: "Communication & Email", description: "emails, messages, letters, professional communication" }),
    Object.freeze({ id: "productivity", name: "Productivity & Planning", description: "task lists, planning, scheduling, project management, meeting notes" }),
    Object.freeze({ id: "other", name: "Other", description: "anything that does not clearly fit the above" })
  ]);
  var CATEGORY_NAMES = CATEGORIES.map((c) => c.name);
  var BY_NAME = new Map(CATEGORIES.map((c) => [c.name.toLowerCase(), c]));
  var BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]));

  // content.js
  window.PFLanguage = { detectLanguage, SUPPORTED_LANGUAGES, DEFAULT_PROMPT_LANGUAGES, languageMeta };
  window.PFI18n = { t, relativeTimeLocalized };
  window.PFCategories = CATEGORIES;
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
    let mountSeq = 0;
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
      const seq = ++mountSeq;
      state.currentView = view;
      PromptUIManager2.inVariableInputMode = view === PanelView.VARIABLE_INPUT;
      if (definition.kind === "list") {
        applyViewChrome(definition);
        await definition.controller(listEl);
        if (seq !== mountSeq) return;
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
      if (seq !== mountSeq) return;
      PromptUIManager2.replacePanelMainContent(node);
      applyViewChrome(definition);
      PromptUIManager2.showPromptList(listEl);
    };
    return { mount };
  })();
  if (!__PF_ALREADY_INITIALIZED) window.PanelRouter = PanelRouter;
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
        PromptUIManager2.autoSuggestMetadata(result.prompt.uuid, qs(`#${SELECTORS.PROMPT_LIST}`)).catch(() => {
        });
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
  if (!__PF_ALREADY_INITIALIZED) window.PromptStorageManager = PromptStorageManager2;
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
        const matchesSearch = value === "" || entry && (entry.title.includes(value) || entry.content.includes(value) || entry.tags.some((t2) => t2.includes(value)));
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
      const submitBtn = createEl2("button", { innerHTML: t("panel_submit", null, "Submit"), className: `opm-button opm-${getMode()}` });
      submitBtn.addEventListener("click", () => {
        _PromptUIManager.inVariableInputMode = false;
        onSubmit(varValues);
      });
      const backBtn = createEl2("button", { innerHTML: t("panel_back", null, "Back"), className: `opm-button opm-${getMode()}` });
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
        initialLanguage: prompt.language || null,
        submitLabel: t("panel_save_changes", null, "Save Changes"),
        onSubmit: async ({ title, content, tags, category, language }) => {
          const ps = await PromptStorageManager2._ps();
          const update = { title, content };
          if (Array.isArray(tags)) update.tags = tags;
          if (category) update.category = category;
          update.language = language;
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
        const vhBtn = createEl2("button", { innerHTML: t("panel_versions", null, "\u{1F4CB} Versions"), className: "opm-button opm-standard" });
        vhBtn.style.cssText = btnCss;
        vhBtn.addEventListener("click", () => _PromptUIManager.showVersionHistory(prompt.uuid));
        actionRow.appendChild(vhBtn);
        const impBtn = createEl2("button", { innerHTML: t("panel_improve", null, "\u2728 Improve"), className: "opm-button opm-standard" });
        impBtn.style.cssText = btnCss;
        impBtn.addEventListener("click", async () => {
          await _PromptUIManager.improvePrompt(prompt.uuid, qs(`#${SELECTORS.PROMPT_LIST}`));
        });
        actionRow.appendChild(impBtn);
        const varBtn = createEl2("button", { innerHTML: t("panel_variants_btn", null, "\u{1F504} Variants"), className: "opm-button opm-standard" });
        varBtn.style.cssText = btnCss;
        varBtn.addEventListener("click", async () => {
          await _PromptUIManager.generateVariants(prompt.uuid, qs(`#${SELECTORS.PROMPT_LIST}`));
        });
        actionRow.appendChild(varBtn);
        const trBtn = createEl2("button", { innerHTML: t("panel_translate", null, "\u{1F310} Translate"), className: "opm-button opm-standard" });
        trBtn.style.cssText = btnCss;
        trBtn.addEventListener("click", () => {
          if (actionRow.querySelector(".opm-translate-pick")) return;
          const pick = createEl2("select", { className: `opm-translate-pick opm-input-field opm-${getMode()}`, styles: { borderRadius: "4px", fontSize: "12px" } });
          pick.appendChild(createEl2("option", { attributes: { value: "" } }, [t("panel_translate_to", null, "Translate to\u2026")]));
          for (const l of window.PFLanguage ? window.PFLanguage.SUPPORTED_LANGUAGES : []) {
            if (l.code !== prompt.language) pick.appendChild(createEl2("option", { attributes: { value: l.code } }, [l.label]));
          }
          pick.addEventListener("change", async () => {
            const to = pick.value;
            pick.remove();
            if (to) await _PromptUIManager.translatePrompt(prompt.uuid, to, qs(`#${SELECTORS.PROMPT_LIST}`));
          });
          actionRow.appendChild(pick);
        });
        actionRow.appendChild(trBtn);
        const forkBtn = createEl2("button", { innerHTML: t("editor_fork", null, "Fork \u25BE"), className: "opm-button opm-standard" });
        forkBtn.style.cssText = btnCss;
        forkBtn.addEventListener("click", () => {
          if (actionRow.querySelector(".opm-fork-pick")) return;
          const pick = createEl2("select", { className: `opm-fork-pick opm-input-field opm-${getMode()}`, styles: { borderRadius: "4px", fontSize: "12px" } });
          pick.appendChild(createEl2("option", { attributes: { value: "" } }, [t("editor_fork_menu", null, "Fork / duplicate\u2026")]));
          pick.appendChild(createEl2("option", { attributes: { value: "duplicate" } }, [t("editor_duplicate", null, "Duplicate (same language)")]));
          for (const l of window.PFLanguage ? window.PFLanguage.SUPPORTED_LANGUAGES : []) {
            if (l.code !== prompt.language) pick.appendChild(createEl2("option", { attributes: { value: "fork:" + l.code } }, [t("editor_fork_lang", [l.label], `Fork to ${l.label}`)]));
          }
          pick.addEventListener("change", async () => {
            const v = pick.value;
            pick.remove();
            if (v === "duplicate") await _PromptUIManager.forkPrompt(prompt, null);
            else if (v.startsWith("fork:")) await _PromptUIManager.forkPrompt(prompt, v.slice(5));
          });
          actionRow.appendChild(pick);
        });
        actionRow.appendChild(forkBtn);
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
            const formSelects = form.querySelectorAll("select:not(.opm-translate-pick):not(.opm-fork-pick)");
            const catSel = formSelects[0];
            const langSel = formSelects[1];
            const t2 = titleIn.value.trim(), c = contentArea.value.trim();
            if (!t2 || !c) {
              alert("Please fill in both title and content.");
              return;
            }
            if (newBtn.disabled) return;
            newBtn.disabled = true;
            const cat = catSel && catSel.value ? catSel.value : null;
            const language = langSel ? langSel.value === "auto" ? detectLanguage(c).code : langSel.value : void 0;
            const ps = await PromptStorageManager2._ps();
            await PromptStorageManager2.addVersion(prompt.uuid, c, "manual_edit");
            const update = { title: t2, content: c, tags: tagInput.getTags(), category: cat };
            if (language !== void 0) update.language = language;
            await ps.updatePrompt(prompt.uuid, update);
            PanelRouter.mount(PanelView.EDIT);
          });
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
          alert(t("panel_no_versions", null, "No version history yet."));
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
        header.appendChild(createEl2("h3", { styles: { margin: 0, fontSize: "16px" } }, [t("panel_version_history", null, "Version History")]));
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
          const viewBtn = createEl2("button", { innerHTML: t("panel_view", null, "View"), className: "opm-button opm-standard" });
          viewBtn.style.cssText = "padding:4px 10px;font-size:12px;cursor:pointer;border-radius:4px;border:1px solid #ccc;";
          viewBtn.addEventListener("click", () => {
            alert(`Version ${i + 1} (${v.source}):

${v.content}`);
          });
          btns.appendChild(viewBtn);
          if (i < versions.length - 1) {
            const restoreBtn = createEl2("button", { innerHTML: t("panel_restore", null, "Restore"), className: "opm-button opm-standard" });
            restoreBtn.style.cssText = "padding:4px 10px;font-size:12px;cursor:pointer;border-radius:4px;border:1px solid #ccc;";
            restoreBtn.addEventListener("click", async () => {
              await ps.restoreVersion(promptUuid, i);
              overlay.remove();
              alert(t("panel_restored", [String(versions.length)], `Restored as v${versions.length}`));
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
        alert(t("panel_versions_failed", [e.message], "Failed to load version history: " + e.message));
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
    static async translatePrompt(promptUuid, toLang, listEl) {
      return translatePrompt(promptUuid, toLang, listEl);
    }
    /**
     * COMMENT: v3 feature D-VI — fork a prompt into a language-linked group.
     * toLang = null duplicates in place; otherwise the content is translated
     * via the SW proxy and saved as a sibling sharing the groupId (created and
     * back-filled onto the source on the first fork).
     */
    static async forkPrompt(prompt, toLang) {
      const ps = await PromptStorageManager2._ps();
      if (!prompt.language && window.PFLanguage) {
        const detected = window.PFLanguage.detectLanguage(prompt.content || "").code;
        if (detected) {
          await ps.updatePrompt(prompt.uuid, { language: detected });
          prompt.language = detected;
        }
      }
      let groupId = prompt.groupId;
      if (!groupId) {
        groupId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `g-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        await ps.updatePrompt(prompt.uuid, { groupId });
      }
      let content = prompt.content;
      let language = prompt.language || null;
      if (toLang && toLang !== prompt.language) {
        content = await translateText(prompt.content, toLang, prompt.language || null);
        if (!content) return;
        language = toLang;
      }
      await PromptStorageManager2.savePrompt({
        title: prompt.title,
        content,
        language,
        groupId,
        tags: prompt.tags,
        category: prompt.category
      });
      await PanelRouter.mount(PanelView.LIST);
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
  if (!__PF_ALREADY_INITIALIZED) window.PromptUIManager = PromptUIManager2;
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
      return Object.entries(values).reduce((res, [k, v]) => res.replace(new RegExp(`#${k}#`, "g"), () => v), content);
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
