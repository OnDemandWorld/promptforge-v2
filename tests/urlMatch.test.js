// Regression tests for integration-manager.urlMatchesPattern — finding #17.
import { urlMatchesPattern } from '../integration-manager.js';

describe('urlMatchesPattern (#17)', () => {
  test('matches the intended provider host', () => {
    expect(urlMatchesPattern('*://chatgpt.com/*', 'https://chatgpt.com/c/abc')).toBe(true);
    expect(urlMatchesPattern('*://chatgpt.com/*', 'http://chatgpt.com/')).toBe(true);
  });

  test('does NOT match a provider URL embedded in another site\'s query string', () => {
    expect(urlMatchesPattern('*://chatgpt.com/*', 'https://evil.com/?next=https://chatgpt.com/')).toBe(false);
    expect(urlMatchesPattern('*://chatgpt.com/*', 'https://notchatgpt.com/')).toBe(false);
    expect(urlMatchesPattern('*://chatgpt.com/*', 'https://chatgpt.com.evil.com/')).toBe(false);
  });

  test('path-scoped patterns require the path prefix', () => {
    expect(urlMatchesPattern('*://github.com/copilot/*', 'https://github.com/copilot/chat')).toBe(true);
    expect(urlMatchesPattern('*://github.com/copilot/*', 'https://github.com/other')).toBe(false);
    // Bare /copilot (no trailing slash) does not match '/copilot/*' — see #61.
    expect(urlMatchesPattern('*://github.com/copilot/*', 'https://github.com/copilot')).toBe(false);
  });

  test('subdomain wildcard matches base and subdomains', () => {
    expect(urlMatchesPattern('*://*.example.com/*', 'https://example.com/')).toBe(true);
    expect(urlMatchesPattern('*://*.example.com/*', 'https://a.example.com/')).toBe(true);
    expect(urlMatchesPattern('*://*.example.com/*', 'https://evil.com/')).toBe(false);
  });

  test('#61: trailing-star path matches the bare collection URL', () => {
    expect(urlMatchesPattern('*://github.com/copilot*', 'https://github.com/copilot')).toBe(true);
    expect(urlMatchesPattern('*://github.com/copilot*', 'https://github.com/copilot/chat')).toBe(true);
    expect(urlMatchesPattern('*://github.com/copilot*', 'https://github.com/other')).toBe(false);
  });

  test('invalid inputs return false', () => {
    expect(urlMatchesPattern('*://chatgpt.com/*', 'not a url')).toBe(false);
    expect(urlMatchesPattern('garbage', 'https://chatgpt.com/')).toBe(false);
  });
});
