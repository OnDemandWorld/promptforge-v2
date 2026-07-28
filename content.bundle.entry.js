/* content.bundle.entry.js — C1
 * Entry point for the bundled content script. esbuild produces
 * content.bundle.js from this file (npm run bundle); the service worker
 * injects that ONE file instead of four scripts in a load-order-sensitive
 * sequence.
 *
 * Import order = evaluation order, which replaces the old injection-order
 * contract:
 *   1. content.styles.js   — window constants (SELECTORS, UI_STYLES, …) +
 *                            injectGlobalStyles(); no dependencies.
 *   2. inputBoxHandler.js  — InputBoxHandler class; uses window globals only
 *                            at call time.
 *   3. content.shared.js   — EXPOSES window.__initPromptShared at eval time;
 *                            its init (TagService/TagUI/PromptUI) runs when
 *                            content.js calls it, after the window globals
 *                            exist.
 *   4. content.js          — defines the window globals, calls
 *                            __initPromptShared, bootstraps. Statically
 *                            imports ai-operations.js (esbuild evaluates it
 *                            just before content.js; its free variables are
 *                            also call-time only).
 *
 * The cross-file window-globals contract still exists inside these sources;
 * dissolving it into real imports is a later refactor step. The bundle buys
 * us single-file injection (no order races) and removes ai-operations.js
 * from the web-accessible surface.
 */
import './content.styles.js';
import './inputBoxHandler.js';
import './content.shared.js';
import './content.js';
