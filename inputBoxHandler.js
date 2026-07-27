// inputBoxHandler.js
// This script handles input box detection and interactions on supported websites.

/**
 * Class to handle input box detection and interactions on supported websites.
 */
// COMMENT: Cache the provider list — getInputBox() runs on every click/poll
// and used to re-fetch the bundled JSON each time. Not cached on failure
// (stays null) so a transient error doesn't poison lookups for the tab's life.
let _providersCache = null;
async function loadProviders() {
  if (_providersCache) return _providersCache;
  try {
    const response = await fetch(chrome.runtime.getURL('llm_providers.json'));
    if (response.ok) {
      const data = await response.json();
      _providersCache = data.llm_providers || [];
    }
  } catch (error) {
    console.error('Failed to load llm_providers.json:', error);
  }
  return _providersCache || [];
}

class InputBoxHandler {
  /**
   * Detects and retrieves the input box from supported websites.
   * @returns {HTMLElement|null} The input box element or null if not found.
   */
  static async getInputBox() {
    const providers = await loadProviders();

    // Dynamic matching using llm_providers.json
    for (const provider of providers) {
      if (provider.pattern) {
        // COMMENT: Escape regex metachars, convert wildcards, and anchor —
        // the old unanchored/unescaped pattern matched substrings
        // (chatXopenaiYcom would pass) and threw on patterns with +, (, etc.
        const pattern = provider.pattern
          .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          .replace(/\\\*/g, '.*');
        const regex = new RegExp(`^${pattern}`, 'i');
        if (regex.test(window.location.href)) {
          if (provider.element_selector) {
            const selectors = provider.element_selector.split(',').map(s => s.trim());
            for (const sel of selectors) {
              // Try regular DOM first
              let inputBox = document.querySelector(sel);
              if (inputBox) return inputBox;

              // Try shadow DOMs (Perplexity, etc. use shadow roots)
              inputBox = InputBoxHandler._findInShadowDom(sel);
              if (inputBox) return inputBox;
            }
          }
        }
      }
    }

    // If no input box is found, log an error
    console.error('Input box not found on this page.');
    return null;
  }

  /**
   * Search for an element in all shadow DOMs, recursing to any depth.
   */
  static _findInShadowDom(selector, root = document) {
    // COMMENT: True recursion — the old version hardcoded two shadow levels
    // and missed deeper nesting. Closed roots remain invisible by design.
    const hosts = root.querySelectorAll('*');
    for (const el of hosts) {
      if (!el.shadowRoot) continue;
      const found = el.shadowRoot.querySelector(selector);
      if (found) return found;
      const deep = InputBoxHandler._findInShadowDom(selector, el.shadowRoot);
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
        const inputBox = await InputBoxHandler.getInputBox();
        if (inputBox) {
          clearInterval(checkExist);
          resolve(inputBox);
        }
      }, 500); // Check every 500ms

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkExist);
        reject(new Error('Input box not found after 10 seconds.'));
      }, 10000);
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
      console.error('Missing required parameters for insertPrompt', { inputBox, content, promptList });
      return;
    }
    inputBox.focus();
    try {
      // COMMENT: Read setting that controls append vs overwrite behavior
      const disableOverwrite = await new Promise(resolve => {
        try {
          chrome.storage.local.get('disableOverwrite', data => {
            if (chrome.runtime?.lastError) { resolve(false); return; }
            resolve(Boolean(data?.disableOverwrite));
          });
        } catch (_) { resolve(false); }
      });

      if (inputBox.contentEditable === 'true') {
        // COMMENT: Handle rich editors (e.g., Perplexity uses Lexical under #ask-input)
        // COMMENT: Lexical ignores direct DOM mutations but responds to execCommand/InputEvents
        const isLexicalEditor = inputBox.getAttribute('data-lexical-editor') === 'true'
          || !!inputBox.closest('[data-lexical-editor="true"]')
          || inputBox.id === 'ask-input';

        if (isLexicalEditor) {
          // COMMENT: Normalize caret based on append/overwrite preference
          const selection = window.getSelection();
          const range = document.createRange();
          if (disableOverwrite) {
            // COMMENT: Append — place caret at the end
            range.selectNodeContents(inputBox);
            range.collapse(false);
          } else {
            // COMMENT: Overwrite — select all content so insertion replaces it
            range.selectNodeContents(inputBox);
          }
          selection.removeAllRanges();
          selection.addRange(range);

          // COMMENT: Overwrite requires clearing selection before insertion
          if (!disableOverwrite) {
            document.execCommand('delete', false, null);
          }

          // COMMENT: Primary path — let the editor handle text via execCommand
          const textToInsert = content + '  ';
          const inserted = document.execCommand('insertText', false, textToInsert);

          // COMMENT: Fallback — synthesize input pipeline events
          if (!inserted) {
            try {
              inputBox.dispatchEvent(new InputEvent('beforeinput', {
                inputType: 'insertText',
                data: textToInsert,
                bubbles: true,
                cancelable: true,
              }));
              inputBox.dispatchEvent(new Event('input', { bubbles: true }));
            } catch (_) {
              // COMMENT: Last resort — set textContent; editor may still override this
              inputBox.textContent = textToInsert;
              inputBox.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }

          // COMMENT: Ensure caret ends up at the end after insertion
          const endRange = document.createRange();
          endRange.selectNodeContents(inputBox);
          endRange.collapse(false);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(endRange);

          // COMMENT: Notify any listeners the content changed
          inputBox.dispatchEvent(new Event('change', { bubbles: true }));
          PromptUIManager.hidePromptList(promptList);
          return;
        }

        // COMMENT: Handle ProseMirror/Tiptap editors (e.g., Grok) which respond well to execCommand/beforeinput
        const isProseMirrorEditor =
          (inputBox.classList && inputBox.classList.contains('ProseMirror')) ||
          (typeof inputBox.closest === 'function' && !!inputBox.closest('.ProseMirror'));
        if (isProseMirrorEditor) {
          // COMMENT: Normalize caret based on append/overwrite preference
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(inputBox);
          if (disableOverwrite) {
            // COMMENT: Append — place caret at the end
            range.collapse(false);
          }
          selection.removeAllRanges();
          selection.addRange(range);
          // COMMENT: Overwrite requires clearing selection before insertion
          if (!disableOverwrite) {
            document.execCommand('delete', false, null);
          }
          const textToInsert = content + '  ';
          let inserted = false;
          try {
            inserted = document.execCommand('insertText', false, textToInsert);
          } catch (_) {}
          // COMMENT: Fallback to synthetic beforeinput/input or paste if needed
          if (!inserted) {
            try {
              inputBox.dispatchEvent(new InputEvent('beforeinput', {
                inputType: 'insertText',
                data: textToInsert,
                bubbles: true,
                cancelable: true,
              }));
              inputBox.dispatchEvent(new Event('input', { bubbles: true }));
            } catch (_) {
              try {
                const dt = new DataTransfer();
                dt.setData('text/plain', textToInsert);
                const pasteEvent = new ClipboardEvent('paste', {
                  clipboardData: dt,
                  bubbles: true,
                  cancelable: true,
                });
                inputBox.dispatchEvent(pasteEvent);
              } catch (_) {
                if (disableOverwrite) {
                  inputBox.appendChild(document.createTextNode(textToInsert));
                } else {
                  inputBox.textContent = textToInsert;
                }
                inputBox.dispatchEvent(new Event('input', { bubbles: true }));
              }
            }
          }
          // COMMENT: Ensure caret ends up at the end after insertion
          const endRange = document.createRange();
          endRange.selectNodeContents(inputBox);
          endRange.collapse(false);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(endRange);
          // COMMENT: Notify any listeners the content changed and close the UI
          inputBox.dispatchEvent(new Event('change', { bubbles: true }));
          PromptUIManager.hidePromptList(promptList);
          return;
        }

        // COMMENT: Default contentEditable handling (non-Lexical editors)
        if (disableOverwrite) {
          // COMMENT: Append mode — add content at the end without clearing existing text
          // Ensure caret is at the end before appending
          const endRange = document.createRange();
          endRange.selectNodeContents(inputBox);
          endRange.collapse(false);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(endRange);

          if (content.includes('\n')) {
            const lines = content.split('\n');
            lines.forEach((line, index) => {
              const p = document.createElement('p');
              if (line.trim()) {
                p.textContent = line;
              } else {
                p.appendChild(document.createElement('br'));
              }
              inputBox.appendChild(p);
            });
          } else {
            const lastNode = inputBox.lastChild;
            const needsSpace = lastNode && lastNode.nodeType === Node.TEXT_NODE && !lastNode.textContent.endsWith(' ');
            const prefix = needsSpace ? ' ' : '';
            inputBox.appendChild(document.createTextNode(prefix + content));
          }
        } else {
          // COMMENT: Overwrite mode — replace content and simulate a paste for better compatibility
          inputBox.innerHTML = '';

          const dataTransfer = new DataTransfer();
          dataTransfer.setData('text/plain', content);
          const pasteEvent = new ClipboardEvent('paste', {
            clipboardData: dataTransfer,
            bubbles: true,
            cancelable: true,
          });
          inputBox.dispatchEvent(pasteEvent);

          // Fallback for line breaks if paste event doesn't handle them perfectly
          if (content.includes('\n')) {
            const lines = content.split('\n');
            inputBox.innerHTML = '';
            lines.forEach((line, index) => {
              if (line.trim()) {
                const p = document.createElement('p');
                p.textContent = line;
                inputBox.appendChild(p);
              } else if (index < lines.length - 1) {
                const p = document.createElement('p');
                const br = document.createElement('br');
                p.appendChild(br);
                inputBox.appendChild(p);
              }
            });
          } else {
            // For single-line prompts, ensure content is set
            inputBox.textContent = content;
          }
        }

        // Add two spaces at the end
        inputBox.appendChild(document.createTextNode('  '));

        // Move cursor to the end of the content
        const range = document.createRange();
        range.selectNodeContents(inputBox);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        // Trigger input event to notify the application of the change
        inputBox.dispatchEvent(new Event('input', { bubbles: true }));

        // Final fallback: if still empty, set innerText
        if (!inputBox.textContent || inputBox.textContent.trim() === '') {
          inputBox.innerText = content + '  ';
          inputBox.dispatchEvent(new Event('input', { bubbles: true }));
        }
      } else if (inputBox.tagName.toLowerCase() === 'textarea') {
        // COMMENT: For textareas, either overwrite or append
        if (disableOverwrite) {
          const existing = inputBox.value || '';
          const needsSpace = existing && !/\s$/.test(existing);
          const spacer = needsSpace ? ' ' : '';
          inputBox.value = existing + spacer + content + '  ';
        } else {
          inputBox.value = content + '  ';
        }
        inputBox.dispatchEvent(new Event('input', { bubbles: true }));
        inputBox.dispatchEvent(new Event('change', { bubbles: true }));
        inputBox.style.height = 'auto';
        inputBox.style.height = `${inputBox.scrollHeight}px`;
      } else {
        console.error('Unknown input box type.', { inputBox });
        return;
      }
      PromptUIManager.hidePromptList(promptList);
    } catch (error) {
      console.error('Error inserting prompt:', error, { content, inputBox, promptList });
    }
  }
}

// Expose globally so content.js and external messages can use it
window.InputBoxHandler = InputBoxHandler;