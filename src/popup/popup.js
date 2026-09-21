/** Follcker popup: credentials, on/off switch, hourly quota, help and language. */

const API_ORIGIN = "https://api.github.com/*";

/** Where the ring turns amber and where it turns red. */
const USAGE_WARNING = 0.7;
const USAGE_CRITICAL = 0.9;

/** Matches the `r` of the two circles in popup.html. */
const RING_RADIUS = 9;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

const el = {
  version: document.getElementById("version"),
  helpToggle: document.getElementById("help-toggle"),
  help: document.getElementById("help"),
  banner: document.getElementById("banner"),
  bannerText: document.getElementById("banner-text"),
  bannerAction: document.getElementById("banner-action"),
  statusDot: document.getElementById("status-dot"),
  statusTitle: document.getElementById("status-title"),
  statusHint: document.getElementById("status-hint"),
  toggle: document.getElementById("toggle"),
  usage: document.getElementById("usage"),
  usageButton: document.getElementById("usage-button"),
  usageArc: document.getElementById("usage-arc"),
  usagePercent: document.getElementById("usage-percent"),
  usageValue: document.getElementById("usage-value"),
  usageReset: document.getElementById("usage-reset"),
  form: document.getElementById("form"),
  username: document.getElementById("username"),
  token: document.getElementById("token"),
  reveal: document.getElementById("reveal"),
  save: document.getElementById("save"),
  saveLabel: document.getElementById("save-label"),
  clear: document.getElementById("clear"),
  locale: document.getElementById("locale"),
  refresh: document.getElementById("refresh"),
  cacheInfo: document.getElementById("cache-info"),
};

/** Replaces every `data-i18n*` attribute with its localized string. */
function localize() {
  const bindings = [
    ["data-i18n", (node, text) => (node.textContent = text)],
    ["data-i18n-placeholder", (node, text) => (node.placeholder = text)],
    ["data-i18n-title", (node, text) => (node.title = text)],
    ["data-i18n-aria-label", (node, text) => node.setAttribute("aria-label", text)],
  ];

  for (const [attribute, apply] of bindings) {
    for (const node of document.querySelectorAll(`[${attribute}]`)) {
      apply(node, t(node.getAttribute(attribute)));
    }
  }

  el.version.textContent = `v${ext.runtime.getManifest().version}`;
}

/** "pt_BR" -> "pt-BR", the form Intl and the `lang` attribute expect. */
function localeTag() {
  return I18N.locale.replace("_", "-");
}

/** Arabic and Urdu flip the whole popup. */
function applyDirection() {
  document.documentElement.dir = I18N.isRtl() ? "rtl" : "ltr";
  document.documentElement.lang = localeTag();
}

/**
 * Two decimals, with the separator and percent placement the locale expects
 * ("73.33%", "73,33 %"). Digits stay Latin via `-u-nu-latn` so the percentage
 * matches the plain numbers shown beside it.
 */
function formatPercent(ratio) {
  try {
    return new Intl.NumberFormat(`${localeTag()}-u-nu-latn`, {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(ratio);
  } catch {
    return `${(ratio * 100).toFixed(2)}%`;
  }
}

function buildLanguageOptions() {
  el.locale.textContent = "";

  const auto = document.createElement("option");
  auto.value = "auto";
  auto.textContent = t("languageAuto");
  el.locale.appendChild(auto);

  for (const locale of LOCALES) {
    const option = document.createElement("option");
    option.value = locale.id;
    option.textContent = locale.name;
    el.locale.appendChild(option);
  }

  el.locale.value = I18N.preference;
}

function showBanner(message, { tone = "error", action } = {}) {
  el.bannerText.textContent = message;
  el.banner.dataset.tone = tone;
  el.banner.hidden = false;

  if (action) {
    el.bannerAction.textContent = action.label;
    el.bannerAction.hidden = false;
    el.bannerAction.onclick = action.onClick;
  } else {
    el.bannerAction.hidden = true;
    el.bannerAction.onclick = null;
  }
}

function hideBanner() {
  el.banner.hidden = true;
  el.bannerAction.hidden = true;
  el.bannerAction.onclick = null;
}

function renderStatus(enabled) {
  el.toggle.setAttribute("aria-checked", String(enabled));
  el.statusDot.dataset.on = String(enabled);
  el.statusTitle.textContent = t(enabled ? "statusOn" : "statusOff");
  el.statusHint.textContent = t(enabled ? "statusOnHint" : "statusOffHint");
}

function line(text) {
  const span = document.createElement("span");
  span.textContent = text;
  return span;
}

function formatAge(fetchedAt) {
  const minutes = Math.floor((Date.now() - fetchedAt) / 60000);
  if (minutes < 1) return t("cacheAgeNow");
  if (minutes < 60) return t("cacheAgeMinutes", minutes);
  return t("cacheAgeHours", Math.floor(minutes / 60));
}

function renderCache(cache) {
  el.cacheInfo.textContent = "";

  if (!cache?.fetchedAt) {
    el.cacheInfo.append(line(t("cacheEmpty")));
    el.cacheInfo.title = "";
    return;
  }

  // Two deliberate lines: a wrapped single string left a dangling separator.
  el.cacheInfo.append(
    line(t("cacheInfo", cache.followers.length, cache.following.length)),
    line(formatAge(cache.fetchedAt))
  );
  el.cacheInfo.title = new Date(cache.fetchedAt).toLocaleString();
}

/**
 * A single ratio against a known limit, so this is a meter, not a chart -- here
 * a ring in the header. The numbers live in the hover tooltip, so severity is
 * never carried by color alone.
 */
function renderUsage(rateLimit) {
  const limit = Number(rateLimit?.limit);
  if (!Number.isFinite(limit) || limit <= 0) {
    el.usage.hidden = true;
    return;
  }

  const used = Math.max(0, Math.min(Number(rateLimit.used) || 0, limit));
  const ratio = used / limit;
  const percent = formatPercent(ratio);

  el.usage.hidden = false;
  el.usage.dataset.severity =
    ratio >= USAGE_CRITICAL ? "critical" : ratio >= USAGE_WARNING ? "warning" : "normal";

  el.usageArc.style.strokeDasharray = String(RING_LENGTH);
  el.usageArc.style.strokeDashoffset = String(RING_LENGTH * (1 - ratio));

  const value = t("usageValue", used, limit);
  el.usagePercent.textContent = percent;
  el.usageValue.textContent = value;

  const minutes = Math.ceil((Number(rateLimit.reset) - Date.now()) / 60000);
  el.usageReset.textContent =
    minutes >= 1 ? t("usageReset", minutes) : t("usageResetSoon");

  // Screen readers get the whole story without having to hover.
  el.usageButton.setAttribute(
    "aria-label",
    `${t("usageLabel")}: ${percent} — ${value}, ${el.usageReset.textContent}`
  );
}

/**
 * Firefox MV3 treats host permissions as opt-in, so api.github.com access can
 * be missing even though the manifest declares it. Chrome grants it at install
 * time, where this check simply always passes.
 */
async function checkHostPermission() {
  if (!ext.permissions?.contains) return true;

  const granted = await ext.permissions.contains({ origins: [API_ORIGIN] });
  if (granted) return true;

  showBanner(t("grantTitle"), {
    tone: "info",
    action: {
      label: t("grantAction"),
      onClick: async () => {
        const accepted = await ext.permissions.request({ origins: [API_ORIGIN] });
        if (accepted) {
          hideBanner();
          load();
          loadUsage();
        } else {
          showBanner(t("errPermission"));
        }
      },
    },
  });
  return false;
}

async function send(message) {
  try {
    return await ext.runtime.sendMessage(message);
  } catch (error) {
    return { ok: false, error: error?.message || t("errNetwork") };
  }
}

async function load() {
  const state = await send({ type: MSG.GET_STATE });
  if (!state.ok) {
    showBanner(state.error);
    return;
  }

  renderStatus(state.enabled);
  el.username.value = state.username || "";
  el.token.value = state.token || "";
  renderCache(state.cache);

  await checkHostPermission();
}

/** Quota is secondary information: on failure it just disappears. */
async function loadUsage() {
  const response = await send({ type: MSG.GET_RATE_LIMIT });
  if (!response.ok || !response.rateLimit) {
    el.usage.hidden = true;
    return;
  }
  renderUsage(response.rateLimit);
}

/* Help */

el.helpToggle.addEventListener("click", () => setHelpOpen(el.help.hidden));

function setHelpOpen(open) {
  el.help.hidden = !open;
  el.helpToggle.setAttribute("aria-expanded", String(open));
  el.helpToggle.setAttribute("aria-label", t(open ? "helpHide" : "helpShow"));
  el.helpToggle.classList.toggle("icon-button--active", open);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !el.help.hidden) setHelpOpen(false);
});

// Clicking anywhere outside dismisses the overlay.
document.addEventListener("click", (event) => {
  if (el.help.hidden) return;
  if (el.help.contains(event.target) || el.helpToggle.contains(event.target)) return;
  setHelpOpen(false);
});

/* Language */

el.locale.addEventListener("change", async () => {
  const preference = el.locale.value;

  const response = await send({ type: MSG.SET_LOCALE, locale: preference });
  if (!response.ok) {
    showBanner(response.error);
    return;
  }

  // The background keeps its own copy; this is the popup's.
  await I18N.use(preference);

  applyDirection();
  localize();
  buildLanguageOptions();
  setSaveState("idle");
  await load();
  await loadUsage();
});

/* Toggle */

el.toggle.addEventListener("click", async () => {
  const enabled = el.toggle.getAttribute("aria-checked") !== "true";
  renderStatus(enabled);

  const response = await send({ type: MSG.SET_ENABLED, enabled });
  if (!response.ok) {
    renderStatus(!enabled);
    showBanner(response.error);
  }
});

/* Reveal token */

el.reveal.addEventListener("click", () => {
  const revealed = el.token.type === "text";
  el.token.type = revealed ? "password" : "text";
  el.reveal.setAttribute("aria-pressed", String(!revealed));
  el.reveal.setAttribute("aria-label", t(revealed ? "revealToken" : "hideToken"));
  // SVG elements don't implement the `hidden` IDL property, so the attribute
  // has to be toggled directly or the icon never changes.
  el.reveal.querySelector(".icon-slash").toggleAttribute("hidden", revealed);
});

/* Save */

function setSaveState(state) {
  el.save.dataset.state = state;
  el.save.disabled = state === "saving";
  el.saveLabel.textContent = t(
    state === "saving" ? "saving" : state === "saved" ? "saved" : "save"
  );
}

el.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideBanner();

  const username = el.username.value.trim().replace(/^@/, "");
  if (!username) {
    el.username.setAttribute("aria-invalid", "true");
    el.username.focus();
    showBanner(t("errUsernameRequired"));
    return;
  }

  if (!(await checkHostPermission())) return;

  setSaveState("saving");
  const response = await send({
    type: MSG.SAVE_CREDENTIALS,
    username,
    token: el.token.value.trim(),
  });

  if (!response.ok) {
    setSaveState("idle");
    el.username.setAttribute("aria-invalid", "true");
    await loadUsage();
    showBanner(response.error);
    return;
  }

  el.username.value = response.username;
  setSaveState("saved");
  await load();
  await loadUsage();
});

[el.username, el.token].forEach((input) => {
  input.addEventListener("input", () => {
    input.removeAttribute("aria-invalid");
    setSaveState("idle");
    hideBanner();
  });
});

/* Clear */

el.clear.addEventListener("click", async () => {
  const response = await send({ type: MSG.CLEAR_CREDENTIALS });
  if (!response.ok) {
    showBanner(response.error);
    return;
  }

  el.username.value = "";
  el.token.value = "";
  setSaveState("idle");
  hideBanner();
  await load();
});

/* Refresh cache */

el.refresh.addEventListener("click", async () => {
  el.refresh.disabled = true;
  hideBanner();

  const response = await send({ type: MSG.GET_LISTS, force: true });
  el.refresh.disabled = false;

  await loadUsage();
  if (!response.ok) {
    showBanner(response.error);
    return;
  }
  renderCache(response);
});

async function boot() {
  await I18N.ensure();

  applyDirection();
  localize();
  buildLanguageOptions();
  setSaveState("idle");

  await load();
  await loadUsage();
}

boot();
