/* exported getLists, getRateLimit, validateCredentials */

/**
 * GitHub API layer: paginated fetching, error mapping and caching.
 *
 * Runs in the background (service worker on Chrome, event page on Firefox) so
 * that cross-origin requests never depend on the page's CORS policy and so the
 * cache has a single owner.
 */

const GITHUB_API = "https://api.github.com";
const PER_PAGE = 100;
/** Safety stop: 100 pages x 100 users = 10k accounts per list. */
const MAX_PAGES = 100;
/** How long a cached follower/following list stays fresh. */
const CACHE_TTL_MS = 10 * 60 * 1000;

/** An error carrying a user-facing, already-localized message. */
class ApiError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

function minutesUntil(resetEpochSeconds) {
  const ms = Number(resetEpochSeconds) * 1000 - Date.now();
  return Math.max(1, Math.ceil(ms / 60000));
}

/**
 * Every GitHub response carries the current quota in its headers, so usage can
 * be tracked for free as a side effect of the calls the extension already makes.
 */
function captureRateLimit(response) {
  const limit = response.headers.get("x-ratelimit-limit");
  if (!limit) return;

  const remaining = Number(response.headers.get("x-ratelimit-remaining"));
  // An absent header reads as null, and `Number(null)` is 0 -- which would
  // silently report "0 requests used". Treat absence as unknown instead.
  const usedHeader = response.headers.get("x-ratelimit-used");
  const reported = usedHeader === null ? NaN : Number(usedHeader);

  const snapshot = {
    limit: Number(limit),
    remaining,
    // `x-ratelimit-used` is not guaranteed; derive it when it is absent or junk.
    used: Number.isFinite(reported) ? reported : Number(limit) - remaining,
    reset: Number(response.headers.get("x-ratelimit-reset")) * 1000,
    at: Date.now(),
  };

  // Fire and forget: a failed bookkeeping write must never fail the request.
  ext.storage.local.set({ rateLimit: snapshot }).catch(() => {});
}

/**
 * The current hour's quota. `/rate_limit` is the authoritative source and is
 * explicitly free -- it does not count against the limit it reports -- so the
 * popup can ask for it on every open. Falls back to the last headers seen.
 */
async function getRateLimit() {
  const { token, rateLimit } = await ext.storage.local.get(["token", "rateLimit"]);

  try {
    const data = await ghFetch("/rate_limit", token);
    const core = data?.resources?.core ?? data?.rate;

    if (core && Number.isFinite(Number(core.limit))) {
      const snapshot = {
        limit: Number(core.limit),
        remaining: Number(core.remaining),
        used: Number(core.used ?? Number(core.limit) - Number(core.remaining)),
        reset: Number(core.reset) * 1000,
        at: Date.now(),
      };
      await ext.storage.local.set({ rateLimit: snapshot });
      return snapshot;
    }
  } catch (error) {
    if (rateLimit) return rateLimit;
    throw error;
  }

  return rateLimit ?? null;
}

/**
 * Single authenticated (or anonymous) call to the GitHub REST API.
 * Throws an ApiError with a localized message for every failure mode, so no
 * caller ever has to inspect a raw response again.
 */
async function ghFetch(path, token) {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${GITHUB_API}${path}`, { headers, cache: "no-store" });
  } catch {
    throw new ApiError(t("errNetwork"), "network");
  }

  captureRateLimit(response);

  if (response.ok) return response.json();

  if (response.status === 401) {
    throw new ApiError(t("errInvalidToken"), "auth");
  }
  if (response.status === 404) {
    throw new ApiError(t("errGeneric", "404"), "not_found");
  }
  if (response.status === 403 || response.status === 429) {
    const remaining = response.headers.get("x-ratelimit-remaining");
    if (remaining === "0") {
      const reset = response.headers.get("x-ratelimit-reset");
      throw new ApiError(
        token
          ? t("errRateLimit", minutesUntil(reset))
          : t("errRateLimitToken"),
        "rate_limit"
      );
    }
  }
  throw new ApiError(t("errGeneric", String(response.status)), "http");
}

/**
 * Every login in `/users/{username}/{kind}`, lowercased.
 *
 * Fetches 100 per page and stops as soon as a short page comes back, so a
 * 250-follower account costs 3 requests instead of 9.
 */
async function fetchAllLogins(kind, username, token) {
  const logins = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const data = await ghFetch(
      `/users/${encodeURIComponent(username)}/${kind}?per_page=${PER_PAGE}&page=${page}`,
      token
    );

    // A non-array body means an error payload slipped through; never loop on it.
    if (!Array.isArray(data) || data.length === 0) break;

    for (const user of data) {
      if (user && typeof user.login === "string") {
        logins.push(user.login.toLowerCase());
      }
    }

    if (data.length < PER_PAGE) break;
  }

  return logins;
}

/**
 * Confirms the username exists and, when a token is given, that it belongs to
 * that same account. Returns the canonical login as GitHub spells it.
 */
async function validateCredentials(username, token) {
  const wanted = username.trim().replace(/^@/, "");
  if (!wanted) throw new ApiError(t("errUsernameRequired"), "username");

  if (token) {
    const me = await ghFetch("/user", token);
    if (me.login.toLowerCase() !== wanted.toLowerCase()) {
      throw new ApiError(t("errTokenMismatch", me.login, wanted), "mismatch");
    }
    return me.login;
  }

  try {
    const user = await ghFetch(`/users/${encodeURIComponent(wanted)}`, null);
    return user.login;
  } catch (error) {
    if (error.code === "not_found") {
      throw new ApiError(t("errUserNotFound", wanted), "not_found");
    }
    throw error;
  }
}

function isCacheFresh(cache, username) {
  return Boolean(
    cache &&
      cache.username === username.toLowerCase() &&
      Date.now() - cache.fetchedAt < CACHE_TTL_MS
  );
}

/**
 * The user's follower and following logins, served from cache when fresh.
 *
 * This is the fix for the original N-times-M blowup: the lists are fetched once
 * per TTL and every "does X follow me?" check is then an O(1) Set lookup.
 */
async function getLists({ force = false } = {}) {
  const { username, token, cache } = await ext.storage.local.get([
    "username",
    "token",
    "cache",
  ]);

  if (!username) throw new ApiError(t("errUsernameRequired"), "username");

  if (!force && isCacheFresh(cache, username)) {
    return { ...cache, fromCache: true };
  }

  const [followers, following] = await Promise.all([
    fetchAllLogins("followers", username, token),
    fetchAllLogins("following", username, token),
  ]);

  const fresh = {
    username: username.toLowerCase(),
    followers,
    following,
    fetchedAt: Date.now(),
  };

  await ext.storage.local.set({ cache: fresh });
  return { ...fresh, fromCache: false };
}
