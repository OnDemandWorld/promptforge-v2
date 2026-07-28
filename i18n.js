// i18n.js — thin wrapper over chrome.i18n (v3 feature D-III)
//
// Catalogs live in _locales/{en,zh_HK,zh_CN}/messages.json. Every t() call
// carries an English fallback so a missing key degrades to English text
// instead of a blank label — this keeps string extraction incremental-safe.
// Pure module: usable from the app page, popup, service worker, and (via the
// content bundle / window.PFI18n) the content scripts.

/**
 * Translate a key.
 * @param {string} key
 * @param {string[]|null} subs - positional substitutions ($1..$9 in message)
 * @param {string|null} fallback - returned when the catalog has no entry
 * @returns {string}
 */
export function t(key, subs = null, fallback = null) {
  try {
    const msg = chrome.i18n.getMessage(key, subs || undefined);
    if (msg) return msg;
  } catch { /* context without chrome.i18n — fall through */ }
  return fallback !== null ? fallback : key;
}

/** Current UI locale as reported by Chrome (e.g. "en", "zh-HK", "zh-CN"). */
export function uiLocale() {
  try { return chrome.i18n.getUILanguage(); } catch { return 'en'; }
}

const RTF_CACHE = new Map();

/**
 * Relative time with real locale support ("3 days ago" / "3天前").
 * @param {string|number|Date} ts
 * @returns {string}
 */
export function relativeTimeLocalized(ts) {
  if (!ts) return t('time_never', null, 'never');
  const then = new Date(ts).getTime();
  if (isNaN(then)) return t('time_never', null, 'never');
  const diff = then - Date.now(); // negative for past
  const abs = Math.abs(diff);
  const rtf = RTF_CACHE.get(uiLocale()) || new Intl.RelativeTimeFormat(uiLocale(), { numeric: 'auto' });
  RTF_CACHE.set(uiLocale(), rtf);
  const minute = 60e3, hour = 3600e3, day = 86400e3;
  if (abs < minute) return t('time_just_now', null, 'just now');
  if (abs < hour) return rtf.format(Math.round(diff / minute), 'minute');
  if (abs < day) return rtf.format(Math.round(diff / hour), 'hour');
  if (abs < 7 * day) return rtf.format(Math.round(diff / day), 'day');
  return new Intl.DateTimeFormat(uiLocale()).format(then);
}
