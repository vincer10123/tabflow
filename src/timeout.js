// timeout.js — set inactivity timeouts on sessions

const { loadSession, saveSession } = require('./storage');

const DEFAULT_TIMEOUT_MINUTES = 60;

function setTimeout_(sessionName, minutes) {
  const session = loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found`);
  session.timeout = {
    minutes: minutes ?? DEFAULT_TIMEOUT_MINUTES,
    setAt: new Date().toISOString(),
  };
  saveSession(sessionName, session);
  return session.timeout;
}

function clearTimeout_(sessionName) {
  const session = loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found`);
  delete session.timeout;
  saveSession(sessionName, session);
  return true;
}

function getTimeout(sessionName) {
  const session = loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found`);
  return session.timeout ?? null;
}

function isTimedOut(sessionName) {
  const session = loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found`);
  if (!session.timeout) return false;
  const { minutes, setAt } = session.timeout;
  const elapsed = (Date.now() - new Date(setAt).getTime()) / 1000 / 60;
  return elapsed >= minutes;
}

function getDueTimeouts(sessions) {
  return sessions.filter(name => {
    try { return isTimedOut(name); } catch { return false; }
  });
}

module.exports = { setTimeout: setTimeout_, clearTimeout: clearTimeout_, getTimeout, isTimedOut, getDueTimeouts };
