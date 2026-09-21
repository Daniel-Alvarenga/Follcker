/**
 * Annotates GitHub's follow lists with mutual-follow badges.
 *
 * Runs on every github.com page but bails out in a few microseconds unless the
 * URL is a profile's `?tab=following` or `?tab=followers` list.
 */

const ROW_CLASS = "follcker-row";
const BADGE_CLASS = "follcker-badge";
const SUMMARY_ID = "follcker-summary";
const FILTERING_CLASS = "follcker-filtering";

/** Bumped on every run so a slow request can't paint a stale list. */
let runId = 0;
let lastUrl = location.href;

/**
 * Content scripts can't fetch extension resources, so the active dictionary is
 * requested from the background once and reused until the language changes.
 */
let messages = null;

async function ensureMessages() {
  if (messages) return;
  try {
    const response = await ext.runtime.sendMessage({ type: MSG.GET_MESSAGES });
    if (response?.ok) messages = response.messages;
  } catch {
    messages = {};
  }
}

/** Localized string, with `$1`, `$2`... substitutions. */
function tr(key, ...substitutions) {
  const template = messages?.[key];
  if (template === undefined) return key;

  return substitutions.reduce(
    (text, value, index) => text.replaceAll(`$${index + 1}`, () => String(value)),
    template
  );
}

/**
 * The profile and tab being viewed, or null when this isn't a follow list.
 * `/torvalds?tab=following` -> { profile: "torvalds", tab: "following" }
 */
function getContext() {
  const url = new URL(location.href);
  const tab = url.searchParams.get("tab");
  if (tab !== "following" && tab !== "followers") return null;

  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length !== 1) return null;

  return { profile: segments[0].toLowerCase(), tab };
}

/**
 * The list rows. GitHub's markup is `div.d-table.table-fixed`, but that class
 * combo is a layout detail, so fall back to grouping by user hovercard link.
 */
function findRows() {
  const primary = document.querySelectorAll("div.d-table.table-fixed");
  if (primary.length) return Array.from(primary);

  const rows = new Set();
  for (const link of document.querySelectorAll('a[data-hovercard-type="user"]')) {
    const row = link.closest("div.d-table, li, .Box-row");
    if (row) rows.add(row);
  }
  return Array.from(rows);
}

/** The login this row is about, lowercased. */
function loginFromRow(row) {
  const link = row.querySelector('a[data-hovercard-type="user"][href^="/"]');
  if (!link) return null;

  const path = link.getAttribute("href").split("?")[0].replace(/^\//, "");
  if (!path || path.includes("/")) return null;

  return path.toLowerCase();
}

/** Where a badge reads best: right after the username, not next to the button. */
function badgeAnchor(row) {
  return (
    row.querySelector("div.d-table-cell.col-8") ||
    row.querySelector("div.d-table-cell.col-2.v-align-top.text-right") ||
    row
  );
}

function clearAnnotations() {
  for (const badge of document.querySelectorAll(`.${BADGE_CLASS}`)) badge.remove();
  document.getElementById(SUMMARY_ID)?.remove();

  for (const row of document.querySelectorAll(`.${ROW_CLASS}`)) {
    row.classList.remove(ROW_CLASS);
    row.removeAttribute("data-follcker-highlight");
  }
  for (const container of document.querySelectorAll(`.${FILTERING_CLASS}`)) {
    container.classList.remove(FILTERING_CLASS);
  }
}

function makeBadge(kind, label) {
  const badge = document.createElement("span");
  badge.className = `${BADGE_CLASS} ${BADGE_CLASS}--${kind}`;
  // GitHub's page is LTR; `auto` lets an Arabic or Urdu badge read correctly.
  badge.dir = "auto";
  badge.textContent = label;
  badge.title = "Follcker";
  return badge;
}

/**
 * The bar above the list: counts, current state, and the filter toggle.
 * `tone` is one of "loading" | "info" | "success" | "warn" | "error".
 */
function renderSummary(rows, tone, text, filterTarget) {
  document.getElementById(SUMMARY_ID)?.remove();
  const container = rows[0]?.parentElement;
  if (!container) return;

  const summary = document.createElement("div");
  summary.id = SUMMARY_ID;
  summary.className = `follcker-summary follcker-summary--${tone}`;

  const message = document.createElement("span");
  message.className = "follcker-summary__text";
  message.dir = "auto";
  message.textContent = text;
  summary.appendChild(message);

  if (filterTarget && filterTarget.count > 0) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "follcker-summary__filter";
    button.textContent = tr("filterShowOnly");
    button.addEventListener("click", () => {
      const filtering = container.classList.toggle(FILTERING_CLASS);
      button.textContent = filtering ? tr("filterShowAll") : tr("filterShowOnly");
      button.setAttribute("aria-pressed", String(filtering));
    });
    button.setAttribute("aria-pressed", "false");
    summary.appendChild(button);
  }

  container.insertBefore(summary, rows[0]);
}

function annotate(rows, context, lists) {
  const followers = new Set(lists.followers);
  const following = new Set(lists.following);
  const viewingOtherProfile = context.profile !== lists.username;

  let flagged = 0;
  let counted = 0;

  for (const row of rows) {
    const login = loginFromRow(row);
    if (!login || login === lists.username) continue;

    counted++;
    row.classList.add(ROW_CLASS);

    // On a "following" list the useful question is "do they follow me?";
    // on a "followers" list it is "do I follow them back?".
    const isPositive =
      context.tab === "following" ? followers.has(login) : following.has(login);

    const label =
      context.tab === "following"
        ? isPositive
          ? tr("badgeFollowsYou")
          : tr("badgeNotFollowingYou")
        : isPositive
        ? tr("badgeYouFollow")
        : tr("badgeYouDontFollow");

    if (!isPositive) {
      flagged++;
      row.setAttribute("data-follcker-highlight", "1");
    }

    badgeAnchor(row).appendChild(makeBadge(isPositive ? "yes" : "no", label));
  }

  const messageKey =
    context.tab === "following" ? "summaryFollowing" : "summaryFollowers";
  const text =
    flagged === 0
      ? tr("summaryAllMutual", counted)
      : tr(messageKey, flagged, counted);

  renderSummary(
    rows,
    flagged === 0 ? "success" : "warn",
    viewingOtherProfile ? `@${lists.username}: ${text}` : text,
    { count: flagged }
  );
}

async function run() {
  const currentRun = ++runId;
  clearAnnotations();

  const context = getContext();
  if (!context) return;

  await ensureMessages();

  const { enabled, username } = await ext.storage.local.get([
    "enabled",
    "username",
  ]);
  if (!enabled || currentRun !== runId) return;

  const rows = findRows();
  if (!rows.length) return;

  if (!username) {
    renderSummary(rows, "info", tr("summarySetup"), null);
    return;
  }

  renderSummary(rows, "loading", tr("summaryLoading"), null);

  let response;
  try {
    response = await ext.runtime.sendMessage({ type: MSG.GET_LISTS });
  } catch {
    response = { ok: false, error: tr("errNetwork") };
  }
  if (currentRun !== runId) return;

  if (!response?.ok) {
    renderSummary(rows, "error", response?.error || tr("errNetwork"), null);
    return;
  }

  annotate(rows, context, response);
}

/**
 * GitHub is a Turbo app, so most navigation never reloads the page. Listening
 * to Turbo's own events is far cheaper than the document-wide MutationObserver
 * this used to rely on; the interval is only a string comparison safety net.
 */
function watchNavigation() {
  const onNavigate = () => {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    run();
  };

  for (const event of ["turbo:load", "turbo:render", "pjax:end", "popstate"]) {
    window.addEventListener(event, onNavigate);
  }
  setInterval(onNavigate, 1000);
}

// A toggle or credential change in the popup re-renders every open GitHub tab,
// which is why the background never has to message content scripts.
ext.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;

  // A language change invalidates the cached dictionary.
  if ("locale" in changes) messages = null;

  if (
    "enabled" in changes ||
    "username" in changes ||
    "cache" in changes ||
    "locale" in changes
  ) {
    run();
  }
});

run();
watchNavigation();
