// restore-middleware.js — middleware to guard restore operations (locked/archived sessions)

const { isLocked } = require('./lock');
const { isArchived } = require('./archive');
const { restoreSession } = require('./restore');

function withRestoreGuard(name, options = {}) {
  if (isLocked(name)) {
    return { ok: false, error: `Session "${name}" is locked and cannot be restored` };
  }
  return null; // no guard triggered
}

function withArchivedWarning(name, options = {}) {
  if (isArchived(name) && !options.allowArchived) {
    return {
      ok: false,
      error: `Session "${name}" is archived. Use --allow-archived to restore it anyway`,
    };
  }
  return null;
}

function guardedRestore(name, options = {}) {
  const lockGuard = withRestoreGuard(name, options);
  if (lockGuard) return lockGuard;

  const archiveGuard = withArchivedWarning(name, options);
  if (archiveGuard) return archiveGuard;

  return restoreSession(name, options);
}

function applyRestoreMiddleware(restoreFn) {
  return function (name, options = {}) {
    const lockGuard = withRestoreGuard(name, options);
    if (lockGuard) return lockGuard;

    const archiveGuard = withArchivedWarning(name, options);
    if (archiveGuard) return archiveGuard;

    return restoreFn(name, options);
  };
}

module.exports = { withRestoreGuard, withArchivedWarning, guardedRestore, applyRestoreMiddleware };
