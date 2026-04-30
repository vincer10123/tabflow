// Session status: active, idle, stale
// A session is 'stale' if not accessed within a threshold, 'idle' if accessed but not recently

const DEFAULT_IDLE_HOURS = 24;
const DEFAULT_STALE_DAYS = 7;

function getSessionStatus(session, accessLog = {}, now = Date.now()) {
  const idleMs = DEFAULT_IDLE_HOURS * 60 * 60 * 1000;
  const staleMs = DEFAULT_STALE_DAYS * 24 * 60 * 60 * 1000;

  const lastAccessed = accessLog.lastAccessed
    ? new Date(accessLog.lastAccessed).getTime()
    : null;

  if (!lastAccessed) return 'new';

  const elapsed = now - lastAccessed;

  if (elapsed >= staleMs) return 'stale';
  if (elapsed >= idleMs) return 'idle';
  return 'active';
}

function getStatusSummary(sessions, accessLogs = {}, now = Date.now()) {
  const summary = { active: [], idle: [], stale: [], new: [] };

  for (const session of sessions) {
    const log = accessLogs[session.name] || {};
    const status = getSessionStatus(session, log, now);
    summary[status].push(session.name);
  }

  return summary;
}

function filterByStatus(sessions, status, accessLogs = {}, now = Date.now()) {
  return sessions.filter(session => {
    const log = accessLogs[session.name] || {};
    return getSessionStatus(session, log, now) === status;
  });
}

function formatStatus(status) {
  const icons = { active: '🟢', idle: '🟡', stale: '🔴', new: '🔵' };
  return `${icons[status] || '⚪'} ${status}`;
}

module.exports = { getSessionStatus, getStatusSummary, filterByStatus, formatStatus };
