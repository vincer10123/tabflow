const { getSession, getAllSessions } = require('./sessions');
const { saveSession } = require('./storage');

/**
 * Merge multiple sessions into a new session
 * @param {string[]} sessionNames - names of sessions to merge
 * @param {string} targetName - name for the merged session
 * @param {object} options
 * @param {boolean} options.dedupe - remove duplicate URLs after merge
 */
async function mergeSessions(sessionNames, targetName, options = {}) {
  if (!sessionNames || sessionNames.length < 2) {
    throw new Error('At least two session names are required to merge');
  }
  if (!targetName) {
    throw new Error('Target session name is required');
  }

  const tabs = [];
  const seen = new Set();

  for (const name of sessionNames) {
    const session = await getSession(name);
    if (!session) {
      throw new Error(`Session not found: ${name}`);
    }
    for (const tab of session.tabs || []) {
      if (options.dedupe) {
        if (!seen.has(tab.url)) {
          seen.add(tab.url);
          tabs.push(tab);
        }
      } else {
        tabs.push(tab);
      }
    }
  }

  const merged = {
    name: targetName,
    tabs,
    createdAt: new Date().toISOString(),
    mergedFrom: sessionNames,
  };

  await saveSession(targetName, merged);
  return merged;
}

/**
 * Merge all existing sessions into one
 */
async function mergeAllSessions(targetName, options = {}) {
  const sessions = await getAllSessions();
  const names = sessions.map((s) => s.name);
  if (names.length < 2) {
    throw new Error('Need at least two sessions to merge');
  }
  return mergeSessions(names, targetName, options);
}

module.exports = { mergeSessions, mergeAllSessions };
