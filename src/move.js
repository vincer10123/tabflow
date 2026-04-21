const { getSession, getAllSessions } = require('./sessions');
const { saveSession } = require('./storage');

/**
 * Move a tab from one session to another by index.
 */
async function moveTab(fromSessionName, tabIndex, toSessionName) {
  const fromSession = await getSession(fromSessionName);
  if (!fromSession) throw new Error(`Session not found: ${fromSessionName}`);

  const toSession = await getSession(toSessionName);
  if (!toSession) throw new Error(`Session not found: ${toSessionName}`);

  const tabs = fromSession.tabs || [];
  if (tabIndex < 0 || tabIndex >= tabs.length) {
    throw new Error(`Tab index ${tabIndex} out of range (0-${tabs.length - 1})`);
  }

  const [tab] = tabs.splice(tabIndex, 1);
  toSession.tabs = [...(toSession.tabs || []), tab];

  fromSession.updatedAt = new Date().toISOString();
  toSession.updatedAt = new Date().toISOString();

  await saveSession(fromSessionName, fromSession);
  await saveSession(toSessionName, toSession);

  return { tab, fromSession, toSession };
}

/**
 * Move multiple tabs (by indices) from one session to another.
 */
async function moveTabs(fromSessionName, tabIndices, toSessionName) {
  const fromSession = await getSession(fromSessionName);
  if (!fromSession) throw new Error(`Session not found: ${fromSessionName}`);

  const toSession = await getSession(toSessionName);
  if (!toSession) throw new Error(`Session not found: ${toSessionName}`);

  const tabs = fromSession.tabs || [];
  const sorted = [...new Set(tabIndices)].sort((a, b) => b - a);

  for (const idx of sorted) {
    if (idx < 0 || idx >= tabs.length) {
      throw new Error(`Tab index ${idx} out of range`);
    }
  }

  const moved = [];
  for (const idx of sorted) {
    const [tab] = tabs.splice(idx, 1);
    moved.unshift(tab);
  }

  toSession.tabs = [...(toSession.tabs || []), ...moved];
  fromSession.tabs = tabs;

  fromSession.updatedAt = new Date().toISOString();
  toSession.updatedAt = new Date().toISOString();

  await saveSession(fromSessionName, fromSession);
  await saveSession(toSessionName, toSession);

  return { moved, fromSession, toSession };
}

module.exports = { moveTab, moveTabs };
