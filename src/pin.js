const { loadSession, saveSession } = require('./storage');

async function pinTab(sessionName, tabUrl) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session '${sessionName}' not found`);

  const tab = session.tabs.find(t => t.url === tabUrl);
  if (!tab) throw new Error(`Tab '${tabUrl}' not found in session`);

  tab.pinned = true;
  await saveSession(sessionName, session);
  return tab;
}

async function unpinTab(sessionName, tabUrl) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session '${sessionName}' not found`);

  const tab = session.tabs.find(t => t.url === tabUrl);
  if (!tab) throw new Error(`Tab '${tabUrl}' not found in session`);

  tab.pinned = false;
  await saveSession(sessionName, session);
  return tab;
}

async function getPinnedTabs(sessionName) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session '${sessionName}' not found`);
  return session.tabs.filter(t => t.pinned === true);
}

async function clearPins(sessionName) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session '${sessionName}' not found`);

  session.tabs = session.tabs.map(t => ({ ...t, pinned: false }));
  await saveSession(sessionName, session);
  return session.tabs;
}

module.exports = { pinTab, unpinTab, getPinnedTabs, clearPins };
