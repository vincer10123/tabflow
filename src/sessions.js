const { saveSession, loadSession, listSessions, deleteSession } = require('./storage');

function createSession(name, tabs) {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new Error('Session name must be a non-empty string');
  }
  if (!Array.isArray(tabs) || tabs.length === 0) {
    throw new Error('Tabs must be a non-empty array');
  }

  const session = {
    name: name.trim(),
    tabs: tabs.map((tab) => {
      if (!tab.url) throw new Error(`Tab is missing a url: ${JSON.stringify(tab)}`);
      return {
        url: tab.url,
        title: tab.title || tab.url,
      };
    }),
    createdAt: new Date().toISOString(),
  };

  saveSession(name.trim(), session);
  return session;
}

function getSession(name) {
  const session = loadSession(name);
  if (!session) throw new Error(`Session "${name}" not found`);
  return session;
}

function getAllSessions() {
  return listSessions().map((name) => {
    const session = loadSession(name);
    return {
      name,
      tabCount: session?.tabs?.length ?? 0,
      createdAt: session?.createdAt ?? null,
    };
  });
}

function removeSession(name) {
  const session = loadSession(name);
  if (!session) throw new Error(`Session "${name}" not found`);
  deleteSession(name);
}

module.exports = { createSession, getSession, getAllSessions, removeSession };
