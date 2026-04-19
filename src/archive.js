const { loadSession, saveSession, deleteSession, listSessions } = require('./storage');

const ARCHIVE_PREFIX = '__archived__';

function archiveSession(name) {
  const session = loadSession(name);
  if (!session) throw new Error(`Session "${name}" not found`);
  const archivedName = `${ARCHIVE_PREFIX}${name}`;
  saveSession(archivedName, { ...session, archivedAt: new Date().toISOString() });
  deleteSession(name);
  return archivedName;
}

function restoreSession(name) {
  const archivedName = `${ARCHIVE_PREFIX}${name}`;
  const session = loadSession(archivedName);
  if (!session) throw new Error(`Archived session "${name}" not found`);
  const { archivedAt, ...restored } = session;
  saveSession(name, restored);
  deleteSession(archivedName);
  return name;
}

function listArchived() {
  return listSessions()
    .filter(n => n.startsWith(ARCHIVE_PREFIX))
    .map(n => n.slice(ARCHIVE_PREFIX.length));
}

function isArchived(name) {
  return listArchived().includes(name);
}

module.exports = { archiveSession, restoreSession, listArchived, isArchived, ARCHIVE_PREFIX };
