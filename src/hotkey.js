// hotkey.js — assign and retrieve keyboard shortcut hints for sessions

const { loadSession, saveSession } = require('./storage');

const HOTKEY_FIELD = 'hotkey';
const VALID_HOTKEY_RE = /^[a-z0-9]{1,2}$/i;

function validateHotkey(hotkey) {
  if (!VALID_HOTKEY_RE.test(hotkey)) {
    throw new Error(`Invalid hotkey "${hotkey}". Use 1-2 alphanumeric characters.`);
  }
}

async function setHotkey(sessionName, hotkey) {
  validateHotkey(hotkey);
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found.`);
  session[HOTKEY_FIELD] = hotkey.toLowerCase();
  await saveSession(sessionName, session);
  return session;
}

async function clearHotkey(sessionName) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found.`);
  delete session[HOTKEY_FIELD];
  await saveSession(sessionName, session);
  return session;
}

async function getHotkey(sessionName) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found.`);
  return session[HOTKEY_FIELD] || null;
}

async function findByHotkey(hotkey, allSessions) {
  const key = hotkey.toLowerCase();
  return allSessions.find(s => s[HOTKEY_FIELD] === key) || null;
}

async function listHotkeys(allSessions) {
  return allSessions
    .filter(s => s[HOTKEY_FIELD])
    .map(s => ({ name: s.name, hotkey: s[HOTKEY_FIELD] }))
    .sort((a, b) => a.hotkey.localeCompare(b.hotkey));
}

module.exports = { setHotkey, clearHotkey, getHotkey, findByHotkey, listHotkeys };
