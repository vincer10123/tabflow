const { loadSession, saveSession } = require('./storage');

async function favoriteTab(sessionName, tabUrl) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found`);

  const tab = session.tabs.find(t => t.url === tabUrl);
  if (!tab) throw new Error(`Tab with URL "${tabUrl}" not found in session`);

  tab.favorited = true;
  tab.favoritedAt = new Date().toISOString();
  await saveSession(sessionName, session);
  return tab;
}

async function unfavoriteTab(sessionName, tabUrl) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found`);

  const tab = session.tabs.find(t => t.url === tabUrl);
  if (!tab) throw new Error(`Tab with URL "${tabUrl}" not found in session`);

  tab.favorited = false;
  delete tab.favoritedAt;
  await saveSession(sessionName, session);
  return tab;
}

async function getFavoritedTabs(sessionName) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found`);
  return session.tabs.filter(t => t.favorited === true);
}

async function getAllFavoritedTabs(sessions) {
  const results = [];
  for (const session of sessions) {
    const favs = await getFavoritedTabs(session.name);
    favs.forEach(tab => results.push({ sessionName: session.name, tab }));
  }
  return results;
}

async function isFavorited(sessionName, tabUrl) {
  const session = await loadSession(sessionName);
  if (!session) return false;
  const tab = session.tabs.find(t => t.url === tabUrl);
  return tab ? tab.favorited === true : false;
}

module.exports = { favoriteTab, unfavoriteTab, getFavoritedTabs, getAllFavoritedTabs, isFavorited };
