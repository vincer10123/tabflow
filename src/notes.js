// notes.js — attach notes/annotations to sessions

const { loadSession, saveSession } = require('./storage');

async function addNote(sessionName, note) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session '${sessionName}' not found`);
  session.notes = session.notes || [];
  session.notes.push({ text: note, createdAt: new Date().toISOString() });
  await saveSession(sessionName, session);
  return session.notes;
}

async function getNotes(sessionName) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session '${sessionName}' not found`);
  return session.notes || [];
}

async function removeNote(sessionName, index) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session '${sessionName}' not found`);
  const notes = session.notes || [];
  if (index < 0 || index >= notes.length) throw new Error(`Note index ${index} out of range`);
  const removed = notes.splice(index, 1)[0];
  session.notes = notes;
  await saveSession(sessionName, session);
  return removed;
}

async function clearNotes(sessionName) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session '${sessionName}' not found`);
  session.notes = [];
  await saveSession(sessionName, session);
}

module.exports = { addNote, getNotes, removeNote, clearNotes };
