const { saveSession, loadSession, listSessions, deleteSession } = require('./storage');

const SNAPSHOT_PREFIX = 'snapshot__';

function snapshotName(sessionName) {
  return `${SNAPSHOT_PREFIX}${sessionName}__${Date.now()}`;
}

async function takeSnapshot(sessionName, session) {
  const name = snapshotName(sessionName);
  await saveSession(name, { ...session, snapshotOf: sessionName, takenAt: new Date().toISOString() });
  return name;
}

async function listSnapshots(sessionName) {
  const all = await listSessions();
  return all.filter(name => name.startsWith(`${SNAPSHOT_PREFIX}${sessionName}__`));
}

async function restoreSnapshot(snapshotName) {
  const snapshot = await loadSession(snapshotName);
  if (!snapshot) throw new Error(`Snapshot not found: ${snapshotName}`);
  return snapshot;
}

async function deleteSnapshot(snapshotName) {
  await deleteSession(snapshotName);
}

async function pruneSnapshots(sessionName, keepLast = 5) {
  const snapshots = await listSnapshots(sessionName);
  const sorted = snapshots.sort();
  const toDelete = sorted.slice(0, Math.max(0, sorted.length - keepLast));
  for (const name of toDelete) {
    await deleteSnapshot(name);
  }
  return toDelete;
}

module.exports = { takeSnapshot, listSnapshots, restoreSnapshot, deleteSnapshot, pruneSnapshots, SNAPSHOT_PREFIX };
