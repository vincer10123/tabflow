import { guardLocked } from './lock.js';

/**
 * Wraps a session mutation function so it throws if the session is locked.
 * @param {Function} fn - async (session, ...args) => updatedSession
 * @returns {Function}
 */
export function withLockGuard(fn) {
  return async function (session, ...args) {
    guardLocked(session);
    return fn(session, ...args);
  };
}

/**
 * Applies lock guarding to a map of session operation functions.
 * Each function in the map should accept session as its first argument.
 * @param {Object} operations - { [name]: fn }
 * @returns {Object}
 */
export function applyLockGuards(operations) {
  return Object.fromEntries(
    Object.entries(operations).map(([name, fn]) => [
      name,
      withLockGuard(fn),
    ])
  );
}
