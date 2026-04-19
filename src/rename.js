const { loadSession, saveSession, deleteSession, listSessions } = require('./storage');

async function renameSession(oldName, newName) {
  if (!oldName || !newName) throw new Error('Both old and new names are required');
  if (oldName === newName) throw new Error('New name must be different from old name');

  const sessions = await listSessions();
  if (!sessions.includes(oldName)) throw new Error(`Session "${oldName}" not found`);
  if (sessions.includes(newName)) throw new Error(`Session "${newName}" already exists`);

  const session = await loadSession(oldName);
  const renamed = { ...session, name: newName, renamedAt: new Date().toISOString() };

  await saveSession(newName, renamed);
  await deleteSession(oldName);

  return renamed;
}

async function sessionExists(name) {
  const sessions = await listSessions();
  return sessions.includes(name);
}

module.exports = { renameSession, sessionExists };
