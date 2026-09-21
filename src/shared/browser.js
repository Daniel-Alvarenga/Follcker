/**
 * Cross-browser API shim.
 *
 * Firefox exposes the promise-based `browser` namespace; Chrome only exposes
 * `chrome`. Every API this extension uses (storage, runtime, action, i18n,
 * permissions) returns promises in Chrome MV3 when no callback is passed, so a
 * plain alias is enough -- no polyfill needed.
 */
globalThis.ext = globalThis.browser ?? globalThis.chrome;

/** Message types exchanged between popup/content script and the background. */
globalThis.MSG = {
  GET_STATE: "GET_STATE",
  SET_ENABLED: "SET_ENABLED",
  SAVE_CREDENTIALS: "SAVE_CREDENTIALS",
  CLEAR_CREDENTIALS: "CLEAR_CREDENTIALS",
  GET_LISTS: "GET_LISTS",
  GET_RATE_LIMIT: "GET_RATE_LIMIT",
  SET_LOCALE: "SET_LOCALE",
  GET_MESSAGES: "GET_MESSAGES"
};
