const { loadSession, saveSession } = require('./storage');

const HISTORY_SESSION_KEY = '__history__';
const MAX_HISTORY = 50;

async function getHistory() {
  try {
    const data = await loadSession(HISTORY_SESSION_KEY);
    return data.entries || [];
  } catch {
    return [];
  }
}

async function addHistoryEntry(action, sessionName, meta = {}) {
  const history = await getHistory();
  const entry = {
    action,
    sessionName,
    timestamp: new Date().toISOString(),
    ...meta,
  };
  history.unshift(entry);
  if (history.length > MAX_HISTORY) history.splice(MAX_HISTORY);
  await saveSession(HISTORY_SESSION_KEY, { entries: history });
  return entry;
}

async function clearHistory() {
  await saveSession(HISTORY_SESSION_KEY, { entries: [] });
}

async function getHistoryForSession(sessionName) {
  const history = await getHistory();
  return history.filter((e) => e.sessionName === sessionName);
}

module.exports = { getHistory, addHistoryEntry, clearHistory, getHistoryForSession };
