// expiry.js — set and check expiration dates on sessions

const { loadSession, saveSession } = require('./storage');

function setExpiry(sessionName, expiresAt) {
  const session = loadSession(sessionName);
  if (!session) throw new Error(`Session not found: ${sessionName}`);
  session.expiry = {
    expiresAt: new Date(expiresAt).toISOString(),
    setAt: new Date().toISOString(),
  };
  saveSession(sessionName, session);
  return session.expiry;
}

function clearExpiry(sessionName) {
  const session = loadSession(sessionName);
  if (!session) throw new Error(`Session not found: ${sessionName}`);
  delete session.expiry;
  saveSession(sessionName, session);
}

function getExpiry(sessionName) {
  const session = loadSession(sessionName);
  if (!session) throw new Error(`Session not found: ${sessionName}`);
  return session.expiry || null;
}

function isExpired(sessionName) {
  const session = loadSession(sessionName);
  if (!session || !session.expiry) return false;
  return new Date() > new Date(session.expiry.expiresAt);
}

function getDueExpiries(allSessions) {
  return allSessions.filter((name) => isExpired(name));
}

function formatExpiry(expiry) {
  if (!expiry) return 'No expiry set';
  const expiresAt = new Date(expiry.expiresAt);
  const now = new Date();
  const expired = now > expiresAt;
  const diff = Math.abs(expiresAt - now);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const label =
    days > 0 ? `${days}d` : hours > 0 ? `${hours}h` : `${minutes}m`;
  return expired ? `Expired ${label} ago` : `Expires in ${label}`;
}

module.exports = {
  setExpiry,
  clearExpiry,
  getExpiry,
  isExpired,
  getDueExpiries,
  formatExpiry,
};
