// quota.js — enforce max session count and max tabs per session

const storage = require('./storage');

const QUOTA_KEY = '__quota__';

const DEFAULT_QUOTA = {
  maxSessions: null,
  maxTabsPerSession: null,
};

async function getQuota() {
  try {
    const data = await storage.loadSession(QUOTA_KEY);
    return { ...DEFAULT_QUOTA, ...data };
  } catch {
    return { ...DEFAULT_QUOTA };
  }
}

async function setQuota({ maxSessions, maxTabsPerSession }) {
  const current = await getQuota();
  const updated = {
    ...current,
    ...(maxSessions !== undefined && { maxSessions }),
    ...(maxTabsPerSession !== undefined && { maxTabsPerSession }),
  };
  await storage.saveSession(QUOTA_KEY, updated);
  return updated;
}

async function clearQuota() {
  await storage.saveSession(QUOTA_KEY, DEFAULT_QUOTA);
  return DEFAULT_QUOTA;
}

async function checkSessionQuota(sessions) {
  const { maxSessions } = await getQuota();
  if (maxSessions === null) return { allowed: true, limit: null, current: sessions.length };
  return {
    allowed: sessions.length < maxSessions,
    limit: maxSessions,
    current: sessions.length,
  };
}

async function checkTabQuota(session) {
  const { maxTabsPerSession } = await getQuota();
  const tabCount = (session.tabs || []).length;
  if (maxTabsPerSession === null) return { allowed: true, limit: null, current: tabCount };
  return {
    allowed: tabCount < maxTabsPerSession,
    limit: maxTabsPerSession,
    current: tabCount,
  };
}

async function guardSessionQuota(sessions) {
  const result = await checkSessionQuota(sessions);
  if (!result.allowed) {
    throw new Error(`Session quota reached: ${result.current}/${result.limit} sessions`);
  }
}

async function guardTabQuota(session) {
  const result = await checkTabQuota(session);
  if (!result.allowed) {
    throw new Error(`Tab quota reached for session "${session.name}": ${result.current}/${result.limit} tabs`);
  }
}

module.exports = {
  getQuota,
  setQuota,
  clearQuota,
  checkSessionQuota,
  checkTabQuota,
  guardSessionQuota,
  guardTabQuota,
};
