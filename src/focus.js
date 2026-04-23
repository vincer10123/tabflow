// Focus mode: restrict a session to a set of allowed domains
const { loadSession, saveSession } = require('./storage');

function setFocusMode(sessionName, allowedDomains) {
  const session = loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found`);
  session.focusDomains = allowedDomains.map(d => d.toLowerCase().trim());
  saveSession(sessionName, session);
  return session;
}

function clearFocusMode(sessionName) {
  const session = loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found`);
  delete session.focusDomains;
  saveSession(sessionName, session);
  return session;
}

function getFocusDomains(sessionName) {
  const session = loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found`);
  return session.focusDomains || null;
}

function applyFocusFilter(session) {
  if (!session.focusDomains || session.focusDomains.length === 0) return session;
  const allowed = session.focusDomains;
  const filtered = session.tabs.filter(tab => {
    try {
      const hostname = new URL(tab.url).hostname.toLowerCase();
      return allowed.some(d => hostname === d || hostname.endsWith('.' + d));
    } catch {
      return false;
    }
  });
  return { ...session, tabs: filtered };
}

function isFocusMode(session) {
  return Array.isArray(session.focusDomains) && session.focusDomains.length > 0;
}

module.exports = { setFocusMode, clearFocusMode, getFocusDomains, applyFocusFilter, isFocusMode };
