// audit.js — track write operations on sessions for audit trail

const store = {};

function getAuditLog(sessionName) {
  return store[sessionName] || [];
}

function recordAudit(sessionName, action, meta = {}) {
  if (!store[sessionName]) store[sessionName] = [];
  const entry = {
    action,
    timestamp: new Date().toISOString(),
    ...meta,
  };
  store[sessionName].push(entry);
  return entry;
}

function clearAuditLog(sessionName) {
  delete store[sessionName];
}

function getRecentAuditEntries(sessionName, limit = 10) {
  const log = getAuditLog(sessionName);
  return log.slice(-limit);
}

function getAllAuditLogs() {
  return Object.entries(store).map(([sessionName, entries]) => ({
    sessionName,
    entries,
  }));
}

function summarizeAuditLog(sessionName) {
  const log = getAuditLog(sessionName);
  const counts = {};
  for (const entry of log) {
    counts[entry.action] = (counts[entry.action] || 0) + 1;
  }
  return { sessionName, total: log.length, counts };
}

module.exports = {
  getAuditLog,
  recordAudit,
  clearAuditLog,
  getRecentAuditEntries,
  getAllAuditLogs,
  summarizeAuditLog,
};
