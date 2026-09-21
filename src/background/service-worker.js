/**
 * Chrome MV3 entry point.
 *
 * Chrome requires a single `background.service_worker` file, while Firefox MV3
 * loads `background.scripts` as a classic event page. Both keys live in the
 * manifest; this file simply pulls in the same scripts Firefox lists there.
 */
importScripts(
  "/src/shared/browser.js",
  "/src/shared/i18n.js",
  "/src/background/api.js",
  "/src/background/background.js"
);
