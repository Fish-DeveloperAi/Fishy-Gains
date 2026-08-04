// utils/i18nKeys.js
// Single source of truth for turning DB values (muscle groups, categories,
// ranks) into translation keys. Previously each screen had its own
// `safeTranslateKey` helper and they disagreed on multi-word values
// (e.g. "Full Body" -> "fullbody" in some screens, "fullBody" in others),
// which silently broke lookups. This helper always produces camelCase.
export function toTranslationKey(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .trim()
    .split(/[\s_\-/]+/)
    .filter(Boolean)
    .map((word, index) => {
      const lower = word.toLowerCase();
      return index === 0 ? lower : lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

// Translates a DB value, falling back to the raw value when no key exists.
export function translateValue(value, t) {
  if (!value) return '';
  const key = toTranslationKey(value);
  if (!key) return String(value);
  return t(key, String(value));
}
