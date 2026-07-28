// i18n-html.js — hydrates static HTML for extension pages (v3 feature D-III)
//
// MV3 forbids inline scripts, so this external file is included in
// app.html / popup.html / info.html / permissions.html. It translates:
//   [data-i18n]       → textContent
//   [data-i18n-ph]    → placeholder
//   [data-i18n-title] → title attribute
// Missing keys leave the authored (English) text in place.
document.addEventListener('DOMContentLoaded', () => {
  const msg = (key) => chrome.i18n.getMessage(key);
  document.querySelectorAll('[data-i18n]').forEach(n => {
    const v = msg(n.dataset.i18n);
    if (v) n.textContent = v;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(n => {
    const v = msg(n.dataset.i18nPh);
    if (v) n.placeholder = v;
  });
  document.querySelectorAll('[data-i18n-title]').forEach(n => {
    const v = msg(n.dataset.i18nTitle);
    if (v) n.title = v;
  });
});
