const { loadSession, saveSession } = require('./storage');

function lockSession(name) {
  const session = loadSession(name);
  if (!session) throw new Error(`Session '${name}' not found`);
  if (session.locked) throw new Error(`Session '${name}' is already locked`);
  session.locked = true;
  saveSession(name, session);
  return session;
}

function unlockSession(name) {
  const session = loadSession(name);
  if (!session) throw new Error(`Session '${name}' not found`);
  if (!session.locked) throw new Error(`Session '${name}' is not locked`);
  session.locked = false;
  saveSession(name, session);
  return session;
}

function isLocked(name) {
  const session = loadSession(name);
  if (!session) throw new Error(`Session '${name}' not found`);
  return session.locked === true;
}

function guardLocked(name) {
  if (isLocked(name)) {
    throw new Error(`Session '${name}' is locked and cannot be modified`);
  }
}

module.exports = { lockSession, unlockSession, isLocked, guardLocked };
