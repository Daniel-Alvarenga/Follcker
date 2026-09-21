/**
 * Runtime localization.
 *
 * `ext.i18n.getMessage` always resolves against the *browser's* UI language and
 * cannot be overridden, so a language picker needs its own layer. This reads the
 * very same `_locales/<id>/messages.json` files the browser uses, which keeps a
 * single source of truth: the browser picks the extension's name in the store,
 * this picks every string in the UI.
 *
 * Used by the popup and the background directly. Content scripts cannot fetch
 * extension resources without `web_accessible_resources`, so they ask the
 * background for the active dictionary instead.
 */

const FALLBACK_LOCALE = "en";

/** The ten most spoken languages worldwide, ordered by total speakers. */
globalThis.LOCALES = [
  { id: "en", name: "English" },
  { id: "zh_CN", name: "中文（简体）" },
  { id: "hi", name: "हिन्दी" },
  { id: "es", name: "Español" },
  { id: "fr", name: "Français" },
  { id: "ar", name: "العربية", rtl: true },
  { id: "bn", name: "বাংলা" },
  { id: "pt_BR", name: "Português (Brasil)" },
  { id: "ru", name: "Русский" },
  { id: "ur", name: "اردو", rtl: true },
];

const dictionaries = new Map();

async function loadDictionary(id) {
  if (dictionaries.has(id)) return dictionaries.get(id);

  const response = await fetch(ext.runtime.getURL(`_locales/${id}/messages.json`));
  const raw = await response.json();

  const flat = {};
  for (const [key, entry] of Object.entries(raw)) flat[key] = entry.message;

  dictionaries.set(id, flat);
  return flat;
}

/** Maps a BCP-47 tag ("pt-BR", "pt", "zh-Hans-CN") onto a locale we ship. */
function matchLocale(tag) {
  if (!tag) return null;

  const normalized = String(tag).replace(/-/g, "_").toLowerCase();
  const exact = LOCALES.find((l) => l.id.toLowerCase() === normalized);
  if (exact) return exact.id;

  const language = normalized.split("_")[0];
  const byLanguage = LOCALES.find(
    (l) => l.id.toLowerCase().split("_")[0] === language
  );
  return byLanguage ? byLanguage.id : null;
}

globalThis.I18N = {
  /** What the user picked: a locale id, or "auto" to follow the browser. */
  preference: "auto",
  /** The locale actually in use once "auto" is resolved. */
  locale: FALLBACK_LOCALE,
  messages: {},
  fallback: {},

  resolve(preference) {
    if (preference && preference !== "auto") {
      const match = matchLocale(preference);
      if (match) return match;
    }
    return matchLocale(ext.i18n?.getUILanguage?.()) || FALLBACK_LOCALE;
  },

  async use(preference) {
    this.preference = preference || "auto";
    this.locale = this.resolve(this.preference);

    this.fallback = await loadDictionary(FALLBACK_LOCALE);
    this.messages =
      this.locale === FALLBACK_LOCALE
        ? this.fallback
        : await loadDictionary(this.locale);

    return this.locale;
  },

  /** Loads the stored preference, reusing what's already in memory. */
  async ensure() {
    const { locale = "auto" } = await ext.storage.local.get("locale");
    if (locale === this.preference && Object.keys(this.messages).length) {
      return this.locale;
    }
    return this.use(locale);
  },

  isRtl(id = this.locale) {
    return Boolean(LOCALES.find((l) => l.id === id)?.rtl);
  },
};

/** Localized string, with `$1`, `$2`... substitutions. */
globalThis.t = function t(key, ...substitutions) {
  const template = I18N.messages[key] ?? I18N.fallback[key];
  if (template === undefined) return key;

  return substitutions.reduce(
    // A function replacement keeps `$&` and friends in the value literal.
    (text, value, index) => text.replaceAll(`$${index + 1}`, () => String(value)),
    template
  );
};
