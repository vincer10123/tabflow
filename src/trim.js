// trim.js — remove tabs from a session by index range or count

/**
 * Remove tabs beyond a maximum count, keeping the first N tabs.
 * @param {object} session
 * @param {number} maxTabs
 * @returns {object} trimmed session
 */
function trimToCount(session, maxTabs) {
  if (!session || !Array.isArray(session.tabs)) throw new Error('Invalid session');
  if (typeof maxTabs !== 'number' || maxTabs < 0) throw new Error('maxTabs must be a non-negative number');
  return {
    ...session,
    tabs: session.tabs.slice(0, maxTabs),
  };
}

/**
 * Remove tabs at specific indices.
 * @param {object} session
 * @param {number[]} indices
 * @returns {object} trimmed session
 */
function trimByIndices(session, indices) {
  if (!session || !Array.isArray(session.tabs)) throw new Error('Invalid session');
  const set = new Set(indices);
  return {
    ...session,
    tabs: session.tabs.filter((_, i) => !set.has(i)),
  };
}

/**
 * Remove tabs from the end of a session.
 * @param {object} session
 * @param {number} count number of tabs to remove from the tail
 * @returns {object} trimmed session
 */
function trimTail(session, count) {
  if (!session || !Array.isArray(session.tabs)) throw new Error('Invalid session');
  if (typeof count !== 'number' || count < 0) throw new Error('count must be a non-negative number');
  const end = Math.max(0, session.tabs.length - count);
  return {
    ...session,
    tabs: session.tabs.slice(0, end),
  };
}

/**
 * Remove tabs whose URLs match a given pattern.
 * @param {object} session
 * @param {RegExp|string} pattern
 * @returns {object} trimmed session
 */
function trimByPattern(session, pattern) {
  if (!session || !Array.isArray(session.tabs)) throw new Error('Invalid session');
  const re = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
  return {
    ...session,
    tabs: session.tabs.filter(tab => !re.test(tab.url || '')),
  };
}

module.exports = { trimToCount, trimByIndices, trimTail, trimByPattern };
