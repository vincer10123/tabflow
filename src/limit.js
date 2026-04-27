// limit.js — enforce max tab count per session

const DEFAULT_MAX_TABS = 50;

/**
 * Get the tab limit for a session (falls back to default).
 */
function getLimit(session) {
  return session.tabLimit ?? DEFAULT_MAX_TABS;
}

/**
 * Set a tab limit on a session.
 * @param {object} session - The session object.
 * @param {number} max - Must be a positive integer.
 */
function setLimit(session, max) {
  if (typeof max !== 'number' || max < 1) {
    throw new Error(`Invalid tab limit: ${max}. Must be a positive integer.`);
  }
  return { ...session, tabLimit: Math.floor(max) };
}

/**
 * Remove the tab limit from a session (resets to default).
 */
function clearLimit(session) {
  const updated = { ...session };
  delete updated.tabLimit;
  return updated;
}

/**
 * Check whether a session is at or over its tab limit.
 */
function isAtLimit(session) {
  const tabs = session.tabs ?? [];
  return tabs.length >= getLimit(session);
}

/**
 * Enforce the limit when adding a tab — throws if over limit.
 */
function guardLimit(session, tab) {
  if (isAtLimit(session)) {
    throw new Error(
      `Session "${session.name}" is at its tab limit (${getLimit(session)}). Remove a tab or raise the limit.`
    );
  }
  return { ...session, tabs: [...(session.tabs ?? []), tab] };
}

/**
 * Trim tabs to fit within the current limit (keeps first N tabs).
 */
function trimToLimit(session) {
  const limit = getLimit(session);
  const tabs = session.tabs ?? [];
  if (tabs.length <= limit) return session;
  return { ...session, tabs: tabs.slice(0, limit) };
}

/**
 * Returns how many more tabs can be added before hitting the limit.
 * Returns 0 if the session is already at or over the limit.
 */
function remainingCapacity(session) {
  const tabs = session.tabs ?? [];
  const limit = getLimit(session);
  return Math.max(0, limit - tabs.length);
}

module.exports = { getLimit, setLimit, clearLimit, isAtLimit, guardLimit, trimToLimit, remainingCapacity };
