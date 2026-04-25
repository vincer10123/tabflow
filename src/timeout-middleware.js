// timeout-middleware.js — guard operations when a session has timed out

const { isTimedOut, clearTimeout: clearTO } = require('./timeout');

/**
 * Wraps a session operation, blocking it if the session has timed out.
 * Optionally auto-clears the timeout after warning.
 */
function withTimeoutGuard(fn, { autoClear = false } = {}) {
  return function (sessionName, ...args) {
    let timedOut = false;
    try { timedOut = isTimedOut(sessionName); } catch { /* no timeout set */ }

    if (timedOut) {
      if (autoClear) {
        try { clearTO(sessionName); } catch { /* ignore */ }
        console.warn(`[tabflow] Session "${sessionName}" timed out — timeout cleared, proceeding.`);
      } else {
        throw new Error(`Session "${sessionName}" has timed out. Clear the timeout to continue.`);
      }
    }

    return fn(sessionName, ...args);
  };
}

function applyTimeoutGuards(operations, options = {}) {
  const result = {};
  for (const [key, fn] of Object.entries(operations)) {
    result[key] = withTimeoutGuard(fn, options);
  }
  return result;
}

module.exports = { withTimeoutGuard, applyTimeoutGuards };
