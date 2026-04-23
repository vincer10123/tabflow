// Tracks per-session activity: open count, last accessed, total time
const { loadSession, saveSession } = require('./storage');

function getActivity(session) {
  return session.activity || { openCount: 0, lastAccessed: null, totalMs: 0 };
}

async function recordOpen(name) {
  const session = await loadSession(name);
  if (!session) throw new Error(`Session "${name}" not found`);

  const activity = getActivity(session);
  activity.openCount += 1;
  activity.lastAccessed = new Date().toISOString();

  await saveSession(name, { ...session, activity });
  return activity;
}

async function recordClose(name, durationMs) {
  const session = await loadSession(name);
  if (!session) throw new Error(`Session "${name}" not found`);

  const activity = getActivity(session);
  activity.totalMs = (activity.totalMs || 0) + durationMs;
  activity.lastAccessed = new Date().toISOString();

  await saveSession(name, { ...session, activity });
  return activity;
}

async function getSessionActivity(name) {
  const session = await loadSession(name);
  if (!session) throw new Error(`Session "${name}" not found`);
  return getActivity(session);
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const remSecs = secs % 60;
  if (mins < 60) return `${mins}m ${remSecs}s`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs}h ${remMins}m`;
}

module.exports = { recordOpen, recordClose, getSessionActivity, formatDuration, getActivity };
