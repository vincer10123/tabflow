// visibility-middleware.js — wraps session accessors to respect hidden flag

const { filterVisible, isHidden } = require('./visibility');

/**
 * Wraps getAllSessions to exclude hidden sessions by default.
 * Pass { includeHidden: true } to bypass.
 */
function withVisibilityFilter(getAllSessions) {
  return async function (opts = {}) {
    const sessions = await getAllSessions();
    if (opts.includeHidden) return sessions;
    return filterVisible(sessions);
  };
}

/**
 * Wraps getSession to warn if the session is hidden.
 */
function withHiddenWarning(getSession) {
  return async function (name, opts = {}) {
    const session = await getSession(name);
    if (session && isHidden(session) && !opts.includeHidden) {
      const err = new Error(`Session "${name}" is hidden. Use --include-hidden to access it.`);
      err.code = 'SESSION_HIDDEN';
      throw err;
    }
    return session;
  };
}

function applyVisibilityMiddleware(fns) {
  return {
    ...fns,
    getAllSessions: withVisibilityFilter(fns.getAllSessions),
    getSession: withHiddenWarning(fns.getSession)
  };
}

module.exports = { withVisibilityFilter, withHiddenWarning, applyVisibilityMiddleware };
