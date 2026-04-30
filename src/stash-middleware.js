// Middleware to auto-stash tabs before destructive operations
const { stashTabs } = require('./stash');
const { loadSession } = require('./storage');

/**
 * Wraps a function that modifies a session by stashing all its tabs first.
 * Useful for bulk-remove or overwrite operations.
 */
function withAutoStash(fn, stashLabel = 'auto') {
  return function (sessionName, ...args) {
    const session = loadSession(sessionName);
    if (session && session.tabs && session.tabs.length > 0) {
      const indices = session.tabs.map((_, i) => i);
      const name = `${stashLabel}-${sessionName}-${Date.now()}`;
      try {
        stashTabs(sessionName, indices, name);
      } catch (_) {
        // stash failure should not block the operation
      }
    }
    return fn(sessionName, ...args);
  };
}

/**
 * Apply auto-stash wrapping to a map of session-mutating functions.
 * Only wraps functions whose names are in the provided list.
 */
function applyAutoStash(fns, targets = []) {
  const wrapped = { ...fns };
  for (const name of targets) {
    if (typeof fns[name] === 'function') {
      wrapped[name] = withAutoStash(fns[name], name);
    }
  }
  return wrapped;
}

module.exports = { withAutoStash, applyAutoStash };
