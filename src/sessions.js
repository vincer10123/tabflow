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

/**
 * Renames an existing session by copying it under the new name and deleting the old one.
 * Throws if the source session doesn't exist or the target name is already taken.
 */
function renameSession(oldName, newName) {
  if (!newName || typeof newName !== 'string' || newName.trim() === '') {
    throw new Error('New session name must be a non-empty string');
  }
  const session = loadSession(oldName);
  if (!session) throw new Error(`Session "${oldName}" not found`);
  if (loadSession(newName.trim())) throw new Error(`Session "${newName.trim()}" already exists`);

  const renamed = { ...session, name: newName.trim() };
  saveSession(newName.trim(), renamed);
  deleteSession(oldName);
  return renamed;
}

module.exports = { createSession, getSession, getAllSessions, removeSession, renameSession };
