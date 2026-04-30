// audit-middleware.js — wrap session operations with audit logging

const { recordAudit } = require('./audit');

function withAudit(fn, action) {
  return function (...args) {
    const sessionName = args[0];
    const result = fn(...args);
    recordAudit(sessionName, action, { args: args.slice(1) });
    return result;
  };
}

function withAsyncAudit(fn, action) {
  return async function (...args) {
    const sessionName = args[0];
    const result = await fn(...args);
    recordAudit(sessionName, action, { args: args.slice(1) });
    return result;
  };
}

function applyAuditTracking(sessions) {
  return {
    ...sessions,
    createSession: withAudit(sessions.createSession, 'create'),
    removeSession: withAudit(sessions.removeSession, 'remove'),
    renameSession: withAudit(sessions.renameSession, 'rename'),
    getSession: withAudit(sessions.getSession, 'read'),
  };
}

module.exports = { withAudit, withAsyncAudit, applyAuditTracking };
