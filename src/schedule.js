const { loadSession, saveSession } = require('./storage');

const SCHEDULE_KEY = '__schedule__';

function setSchedule(session, openAt) {
  const date = new Date(openAt);
  if (isNaN(date.getTime())) throw new Error('Invalid date: ' + openAt);
  return {
    ...session,
    [SCHEDULE_KEY]: date.toISOString(),
  };
}

function clearSchedule(session) {
  const updated = { ...session };
  delete updated[SCHEDULE_KEY];
  return updated;
}

function getSchedule(session) {
  return session[SCHEDULE_KEY] ? new Date(session[SCHEDULE_KEY]) : null;
}

function isScheduledNow(session) {
  const scheduled = getSchedule(session);
  if (!scheduled) return false;
  return new Date() >= scheduled;
}

function getDueSchedules(sessions) {
  return sessions.filter(isScheduledNow);
}

function scheduleSession(name, openAt, { load = loadSession, save = saveSession } = {}) {
  const session = load(name);
  if (!session) throw new Error('Session not found: ' + name);
  const updated = setSchedule(session, openAt);
  save(name, updated);
  return updated;
}

function unscheduleSession(name, { load = loadSession, save = saveSession } = {}) {
  const session = load(name);
  if (!session) throw new Error('Session not found: ' + name);
  const updated = clearSchedule(session);
  save(name, updated);
  return updated;
}

module.exports = {
  setSchedule,
  clearSchedule,
  getSchedule,
  isScheduledNow,
  getDueSchedules,
  scheduleSession,
  unscheduleSession,
};
