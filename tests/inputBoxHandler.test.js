/**
 * @jest-environment jsdom
 */
// Regression tests for inputBoxHandler.js insertPrompt — findings #7 and #8.
import fs from 'fs';
import { jest } from '@jest/globals';

let InputBoxHandler;
let hidePromptList;

beforeAll(() => {
  hidePromptList = jest.fn();
  global.PromptUIManager = { hidePromptList };
  global.chrome = {
    storage: { local: { get: (_key, cb) => cb({ disableOverwrite: false }) } },
    runtime: { lastError: null },
  };
  const src = fs.readFileSync(new URL('../inputBoxHandler.js', import.meta.url), 'utf8');
  // Classic script (no exports) — evaluate to register window.InputBoxHandler.
  // eslint-disable-next-line no-eval
  eval(src);
  InputBoxHandler = global.window.InputBoxHandler;
});

beforeEach(() => hidePromptList.mockClear());

const nativeGet = (el, proto) => Object.getOwnPropertyDescriptor(proto, 'value').get.call(el);
const nativeSet = (el, proto, v) => Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);

describe('insertPrompt value injection (#7/#8)', () => {
  test('#8: textarea value is set via the native prototype setter, bypassing a React-style tracker', async () => {
    const ta = document.createElement('textarea');
    document.body.appendChild(ta);
    // Simulate React's value tracker: an own property that shadows the
    // prototype setter. A plain `.value =` would update only this tracker.
    let tracker = '';
    Object.defineProperty(ta, 'value', {
      configurable: true,
      get() { return tracker; },
      set(v) { tracker = v; },
    });
    let inputFired = false;
    ta.addEventListener('input', () => { inputFired = true; });

    await InputBoxHandler.insertPrompt(ta, 'hello world', null);

    const proto = HTMLTextAreaElement.prototype;
    expect(nativeGet(ta, proto)).toBe('hello world  '); // native value set
    expect(tracker).toBe('');                          // tracker NOT touched -> React onChange will fire
    expect(inputFired).toBe(true);
    expect(hidePromptList).toHaveBeenCalled();
  });

  test('#7: a plain <input type=text> (OpenRouter) is injected, not rejected as unknown', async () => {
    const input = document.createElement('input');
    input.type = 'text';
    document.body.appendChild(input);
    let inputFired = false;
    input.addEventListener('input', () => { inputFired = true; });

    await InputBoxHandler.insertPrompt(input, 'prompt text', null);

    expect(nativeGet(input, HTMLInputElement.prototype)).toBe('prompt text  ');
    expect(inputFired).toBe(true);
    expect(hidePromptList).toHaveBeenCalled(); // reached the success path, not the dead else
  });

  test('append mode preserves existing content with a separating space', async () => {
    global.chrome.storage.local.get = (_key, cb) => cb({ disableOverwrite: true });
    const ta = document.createElement('textarea');
    nativeSet(ta, HTMLTextAreaElement.prototype, 'existing');
    await InputBoxHandler.insertPrompt(ta, 'added', null);
    expect(nativeGet(ta, HTMLTextAreaElement.prototype)).toBe('existing added  ');
    global.chrome.storage.local.get = (_key, cb) => cb({ disableOverwrite: false });
  });
});
