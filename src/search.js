const { getAllSessions } = require('./sessions');

/**
 * Search sessions by name (partial, case-insensitive)
 */
function searchByName(query) {
  const sessions = getAllSessions();
  const lower = query.toLowerCase();
  return sessions.filter(s => s.name.toLowerCase().includes(lower));
}

/**
 * Search sessions by URL (partial, case-insensitive)
 */
function searchByUrl(query) {
  const sessions = getAllSessions();
  const lower = query.toLowerCase();
  return sessions.filter(s =>
    s.tabs && s.tabs.some(tab => tab.url && tab.url.toLowerCase().includes(lower))
  );
}

/**
 * Search sessions by tab title (partial, case-insensitive)
 */
function searchByTitle(query) {
  const sessions = getAllSessions();
  const lower = query.toLowerCase();
  return sessions.filter(s =>
    s.tabs && s.tabs.some(tab => tab.title && tab.title.toLowerCase().includes(lower))
  );
}

/**
 * Search across name, url, and title
 */
function searchAll(query) {
  const sessions = getAllSessions();
  const lower = query.toLowerCase();
  return sessions.filter(s => {
    if (s.name.toLowerCase().includes(lower)) return true;
    if (!s.tabs) return false;
    return s.tabs.some(
      tab =>
        (tab.url && tab.url.toLowerCase().includes(lower)) ||
        (tab.title && tab.title.toLowerCase().includes(lower))
    );
  });
}

module.exports = { searchByName, searchByUrl, searchByTitle, searchAll };
