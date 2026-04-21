const { loadSession, saveSession } = require('./storage');

const LABEL_KEY = 'labels';

async function addLabel(sessionName, label) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found`);
  if (!session[LABEL_KEY]) session[LABEL_KEY] = [];
  const normalized = label.trim().toLowerCase();
  if (!session[LABEL_KEY].includes(normalized)) {
    session[LABEL_KEY].push(normalized);
    await saveSession(sessionName, session);
  }
  return session[LABEL_KEY];
}

async function removeLabel(sessionName, label) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found`);
  if (!session[LABEL_KEY]) return [];
  const normalized = label.trim().toLowerCase();
  session[LABEL_KEY] = session[LABEL_KEY].filter(l => l !== normalized);
  await saveSession(sessionName, session);
  return session[LABEL_KEY];
}

async function getLabels(sessionName) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found`);
  return session[LABEL_KEY] || [];
}

async function filterByLabel(sessions, label) {
  const normalized = label.trim().toLowerCase();
  return sessions.filter(s => Array.isArray(s[LABEL_KEY]) && s[LABEL_KEY].includes(normalized));
}

async function groupByLabel(sessions) {
  const groups = {};
  for (const session of sessions) {
    const labels = session[LABEL_KEY] || ['unlabeled'];
    for (const label of labels) {
      if (!groups[label]) groups[label] = [];
      groups[label].push(session);
    }
  }
  return groups;
}

module.exports = { addLabel, removeLabel, getLabels, filterByLabel, groupByLabel };
