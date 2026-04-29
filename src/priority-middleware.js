const { sortByPriority, filterByPriority } = require('./priority');

/**
 * Middleware that automatically sorts tabs by priority when reading a session.
 */
function withPrioritySort(fn) {
  return async function (...args) {
    const session = await fn(...args);
    if (!session || !session.tabs) return session;
    return sortByPriority(session);
  };
}

/**
 * Middleware that filters tabs to only a given priority level when reading.
 */
function withPriorityFilter(level) {
  return function (fn) {
    return async function (...args) {
      const session = await fn(...args);
      if (!session || !session.tabs) return session;
      const filtered = filterByPriority(session, level);
      return { ...session, tabs: filtered };
    };
  };
}

/**
 * Apply priority sort middleware to a map of session functions.
 */
function applyPriorityMiddleware(fns) {
  return Object.fromEntries(
    Object.entries(fns).map(([name, fn]) => [name, withPrioritySort(fn)])
  );
}

module.exports = { withPrioritySort, withPriorityFilter, applyPriorityMiddleware };
