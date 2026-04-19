const { takeSnapshot } = require('./snapshots');

function withSnapshot(fn, sessionName) {
  return async function (...args) {
    const session = await fn(...args);
    if (session) {
      try {
        await takeSnapshot(sessionName, session);
      } catch (e) {
        // non-fatal
      }
    }
    return session;
  };
}

function applySnapshotTracking(sessions, sessionName) {
  return {
    ...sessions,
    getSession: withSnapshot(sessions.getSession, sessionName),
  };
}

module.exports = { withSnapshot, applySnapshotTracking };
