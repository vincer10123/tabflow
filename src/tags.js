const { loadSession, saveSession, listSessions } = require('./storage');

async function addTag(sessionName, tag) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session '${sessionName}' not found`);
  if (!session.tags) session.tags = [];
  if (!session.tags.includes(tag)) {
    session.tags.push(tag);
    await saveSession(sessionName, session);
  }
  return session;
}

async function removeTag(sessionName, tag) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session '${sessionName}' not found`);
  if (!session.tags) return session;
  session.tags = session.tags.filter(t => t !== tag);
  await saveSession(sessionName, session);
  return session;
}

async function getSessionsByTag(tag) {
  const names = await listSessions();
  const results = [];
  for (const name of names) {
    const session = await loadSession(name);
    if (session && session.tags && session.tags.includes(tag)) {
      results.push({ name, session });
    }
  }
  return results;
}

async function listTags() {
  const names = await listSessions();
  const tagSet = new Set();
  for (const name of names) {
    const session = await loadSession(name);
    if (session && session.tags) {
      session.tags.forEach(t => tagSet.add(t));
    }
  }
  return Array.from(tagSet).sort();
}

async function renameTags(oldTag, newTag) {
  const sessions = await getSessionsByTag(oldTag);
  for (const { name, session } of sessions) {
    session.tags = session.tags.map(t => (t === oldTag ? newTag : t));
    await saveSession(name, session);
  }
  return sessions.length;
}

module.exports = { addTag, removeTag, getSessionsByTag, listTags, renameTags };
