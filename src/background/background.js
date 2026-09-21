/**
 * Background message router and badge state.
 *
 * Deliberately *not* a relay to the content script: the content script reacts
 * to `storage.onChanged` instead, which keeps every open GitHub tab in sync
 * rather than only the active one.
 */

const DEFAULT_STATE = {
  enabled: false,
  username: "",
  token: "",
  locale: "auto"
};

async function updateBadge(enabled) {
  if (!ext.action) return;
  try {
    await ext.action.setBadgeText({ text: enabled ? "ON" : "" });
    await ext.action.setBadgeBackgroundColor({ color: "#2ea043" });
  } catch {
    // Badge styling is cosmetic; never let it break a message round-trip.
  }
}

async function handleMessage(message) {
  // Error strings come back localized, so the dictionary has to be ready first.
  await I18N.ensure();

  switch (message?.type) {
    case MSG.GET_STATE: {
      const state = await ext.storage.local.get([
        "enabled",
        "username",
        "token",
        "cache",
        "locale"
      ]);
      return {
        ok: true,
        ...DEFAULT_STATE,
        ...state,
        resolvedLocale: I18N.locale,
        rtl: I18N.isRtl(),
        locales: LOCALES
      };
    }

    case MSG.SET_LOCALE: {
      const locale = String(message.locale || "auto");
      await ext.storage.local.set({ locale });
      await I18N.use(locale);
      return { ok: true, locale, resolvedLocale: I18N.locale, rtl: I18N.isRtl() };
    }

    case MSG.GET_MESSAGES: {
      // Content scripts can't fetch extension resources, so they get the
      // already-loaded dictionary from here.
      return {
        ok: true,
        locale: I18N.locale,
        rtl: I18N.isRtl(),
        messages: { ...I18N.fallback, ...I18N.messages }
      };
    }

    case MSG.GET_RATE_LIMIT: {
      const rateLimit = await getRateLimit();
      return { ok: true, rateLimit };
    }

    case MSG.SET_ENABLED: {
      const enabled = Boolean(message.enabled);
      await ext.storage.local.set({ enabled });
      await updateBadge(enabled);
      return { ok: true, enabled };
    }

    case MSG.SAVE_CREDENTIALS: {
      const username = String(message.username ?? "").trim().replace(/^@/, "");
      const token = String(message.token ?? "").trim();

      const login = await validateCredentials(username, token);

      // Credentials changed: the cached lists belong to the old account.
      await ext.storage.local.set({ username: login, token, cache: null });
      await getLists({ force: true });

      return { ok: true, username: login };
    }

    case MSG.CLEAR_CREDENTIALS: {
      await ext.storage.local.set({ ...DEFAULT_STATE, cache: null });
      await updateBadge(false);
      return { ok: true };
    }

    case MSG.GET_LISTS: {
      const lists = await getLists({ force: Boolean(message.force) });
      return { ok: true, ...lists };
    }

    default:
      return { ok: false, error: `Unknown message: ${message?.type}` };
  }
}

ext.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  handleMessage(message)
    .then(sendResponse)
    .catch((error) => {
      sendResponse({
        ok: false,
        error: error?.message || t("errGeneric", "unknown"),
        code: error?.code || "unknown"
      });
    });

  // Keep the channel open for the async response (required by Chrome).
  return true;
});

/**
 * Follcker 1.x stored `githubUsername` / `githubToken` / `isExtensionOn`.
 * Without this, upgrading would silently drop the user's saved credentials.
 */
async function migrateLegacyStorage() {
  const legacy = await ext.storage.local.get([
    "githubUsername",
    "githubToken",
    "isExtensionOn"
  ]);
  if (!Object.keys(legacy).length) return;

  const migrated = {};
  if (legacy.githubUsername) migrated.username = legacy.githubUsername;
  if (legacy.githubToken) migrated.token = legacy.githubToken;
  if (legacy.isExtensionOn !== undefined) {
    migrated.enabled = Boolean(legacy.isExtensionOn);
  }

  if (Object.keys(migrated).length) await ext.storage.local.set(migrated);
  await ext.storage.local.remove([
    "githubUsername",
    "githubToken",
    "isExtensionOn"
  ]);
}

ext.runtime.onInstalled.addListener(async () => {
  await migrateLegacyStorage();

  const state = await ext.storage.local.get(Object.keys(DEFAULT_STATE));
  const missing = {};
  for (const [key, value] of Object.entries(DEFAULT_STATE)) {
    if (state[key] === undefined) missing[key] = value;
  }
  if (Object.keys(missing).length) await ext.storage.local.set(missing);

  await updateBadge(Boolean(state.enabled));
});

ext.runtime.onStartup?.addListener(async () => {
  const { enabled } = await ext.storage.local.get("enabled");
  await updateBadge(Boolean(enabled));
});
