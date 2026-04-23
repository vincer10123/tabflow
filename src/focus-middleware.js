// Middleware that auto-applies focus filtering when reading sessions
const { applyFocusFilter, isFocusMode } = require('./focus');

function withFocusFilter(fn) {
  return function (...args) {
    const result = fn(...args);
    if (result && typeof result === 'object' && Array.isArray(result.tabs)) {
      if (isFocusMode(result)) {
        return applyFocusFilter(result);
      }
    }
    return result;
  };
}

function applyFocusMiddleware(sessionsFns) {
  const wrapped = {};
  for (const [key, fn] of Object.entries(sessionsFns)) {
    if (typeof fn === 'function') {
      wrapped[key] = withFocusFilter(fn);
    } else {
      wrapped[key] = fn;
    }
  }
  return wrapped;
}

module.exports = { withFocusFilter, applyFocusMiddleware };
