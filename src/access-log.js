// access-log.js — track when sessions were last accessed

const { loadSession, saveSession } = require('./storage');

const ACCESS_KEY = '__accessLog';

function getAccessLog(session) {
  return session[ACCESS_KEY] || {};
}

function recordAccess(session, action = 'view') {
  const now = new Date().toISOString();
  const log = getAccessLog(session);
  const entry = { action, at: now };

  const history = log.history ? [...log.history, entry] : [entry];

  return {
    ...session,
    [ACCESS_KEY]: {
      lastAccessed: now,
      lastAction: action,
      accessCount: (log.accessCount || 0) + 1,
      history: history.slice(-50), // keep last 50 entries
    },
  };
}

function getLastAccessed(session) {
  return session[ACCESS_KEY]?.lastAccessed || null;
}

function getAccessCount(session) {
  return session[ACCESS_KEY]?.accessCount || 0;
}

function getAccessHistory(session) {
  return session[ACCESS_KEY]?.history || [];
}

function clearAccessLog(session) {
  const updated = { ...session };
  delete updated[ACCESS_KEY];
  return updated;
}

function getMostAccessed(sessions) {
  return [...sessions].sort(
    (a, b) => getAccessCount(b) - getAccessCount(a)
  );
}

function getRecentlyAccessed(sessions, limit = 5) {
  return [...sessions]
    .filter(s => getLastAccessed(s) !== null)
    .sort((a, b) => {
      const ta = new Date(getLastAccessed(a)).getTime();
      const tb = new Date(getLastAccessed(b)).getTime();
      return tb - ta;
    })
    .slice(0, limit);
}

module.exports = {
  recordAccess,
  getLastAccessed,
  getAccessCount,
  getAccessHistory,
  clearAccessLog,
  getMostAccessed,
  getRecentlyAccessed,
};
