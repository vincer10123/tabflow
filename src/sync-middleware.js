// sync-middleware.js — middleware to auto-stamp updatedAt on session writes

function withSyncStamp(saveFn) {
  return function (name, session, ...args) {
    const stamped = {
      ...session,
      updatedAt: Date.now(),
    };
    return saveFn(name, stamped, ...args);
  };
}

function withSyncConflictWarning(saveFn, loadFn) {
  return async function (name, session, ...args) {
    let existing = null;
    try {
      existing = await loadFn(name);
    } catch (_) {
      // no existing session — no conflict
    }

    if (
      existing &&
      existing.updatedAt &&
      session.updatedAt &&
      existing.updatedAt > session.updatedAt
    ) {
      console.warn(
        `[sync] Warning: session "${name}" on disk is newer than the version being saved.`
      );
    }

    return saveFn(name, session, ...args);
  };
}

function applySyncMiddleware(saveFn, loadFn) {
  return withSyncConflictWarning(withSyncStamp(saveFn), loadFn);
}

module.exports = { withSyncStamp, withSyncConflictWarning, applySyncMiddleware };
