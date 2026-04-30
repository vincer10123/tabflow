// Stash: temporarily park tabs aside without deleting them
const { loadSession, saveSession } = require('./storage');

const STASH_PREFIX = '__stash__';

function stashKey(name) {
  return `${STASH_PREFIX}${name}`;
}

function stashTabs(sessionName, indices, stashName) {
  const session = loadSession(sessionName);
  if (!session) throw new Error(`Session not found: ${sessionName}`);

  const tabSet = new Set(indices);
  const stashed = session.tabs.filter((_, i) => tabSet.has(i));
  const remaining = session.tabs.filter((_, i) => !tabSet.has(i));

  if (stashed.length === 0) throw new Error('No tabs matched the given indices');

  const key = stashKey(stashName || `${sessionName}-${Date.now()}`);
  saveSession(key, { name: key, tabs: stashed, stashedFrom: sessionName, stashedAt: Date.now() });
  saveSession(sessionName, { ...session, tabs: remaining });

  return { stashName: key, count: stashed.length };
}

function popStash(stashName, targetSession) {
  const key = stashKey(stashName);
  const stash = loadSession(key);
  if (!stash) throw new Error(`Stash not found: ${stashName}`);

  const dest = targetSession || stash.stashedFrom;
  const session = loadSession(dest);
  if (!session) throw new Error(`Target session not found: ${dest}`);

  const merged = { ...session, tabs: [...session.tabs, ...stash.tabs] };
  saveSession(dest, merged);
  // remove stash after pop
  const { deleteSession } = require('./storage');
  deleteSession(key);

  return { dest, count: stash.tabs.length };
}

function listStashes() {
  const { listSessions } = require('./storage');
  return listSessions()
    .filter(name => name.startsWith(STASH_PREFIX))
    .map(name => {
      const s = loadSession(name);
      return { name: name.slice(STASH_PREFIX.length), tabCount: s.tabs.length, stashedFrom: s.stashedFrom, stashedAt: s.stashedAt };
    });
}

function dropStash(stashName) {
  const key = stashKey(stashName);
  const stash = loadSession(key);
  if (!stash) throw new Error(`Stash not found: ${stashName}`);
  const { deleteSession } = require('./storage');
  deleteSession(key);
  return true;
}

function peekStash(stashName) {
  const key = stashKey(stashName);
  const stash = loadSession(key);
  if (!stash) throw new Error(`Stash not found: ${stashName}`);
  return stash;
}

module.exports = { stashTabs, popStash, listStashes, dropStash, peekStash, STASH_PREFIX };
