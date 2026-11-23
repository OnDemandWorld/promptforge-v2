// Regression tests for language.js detectLanguage — finding #22: callers gate
// on confidence >= 0.75, so mixed-script text must score below that threshold
// while clear English/Traditional text scores above it.
import { detectLanguage } from '../language.js';

describe('detectLanguage confidence (#22)', () => {
  test('clear English is high-confidence en', () => {
    const d = detectLanguage('Write a clear summary of this article.');
    expect(d.code).toBe('en');
    expect(d.confidence).toBeGreaterThanOrEqual(0.75);
  });

  test('clear Traditional Chinese is high-confidence zh-HK', () => {
    const d = detectLanguage('龍龍龍龍'); // 龍 is Traditional-only
    expect(d.code).toBe('zh-HK');
    expect(d.confidence).toBeGreaterThanOrEqual(0.75);
  });

  test('mixed Traditional+Simplified is low-confidence (must not be auto-stored)', () => {
    const d = detectLanguage('龍龙'); // one Traditional + one Simplified discriminator
    expect(d.confidence).toBeLessThan(0.75);
  });

  test('empty/undetectable text returns null code', () => {
    expect(detectLanguage('').code).toBeNull();
    expect(detectLanguage('123456').code).toBeNull();
  });
});
