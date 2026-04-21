const { getSession, getAllSessions, removeSession } = require('./sessions');
const { saveSession } = require('./storage');

/**
 * Apply a transformation function to multiple sessions by name.
 * Returns an array of { name, success, error } results.
 */
async function batchTransform(sessionNames, transformFn) {
  const results = [];
  for (const name of sessionNames) {
    try {
      const session = await getSession(name);
      if (!session) {
        results.push({ name, success: false, error: 'Session not found' });
        continue;
      }
      const updated = await transformFn(session);
      await saveSession(name, updated);
      results.push({ name, success: true });
    } catch (err) {
      results.push({ name, success: false, error: err.message });
    }
  }
  return results;
}

/**
 * Delete multiple sessions by name.
 */
async function batchDelete(sessionNames) {
  const results = [];
  for (const name of sessionNames) {
    try {
      await removeSession(name);
      results.push({ name, success: true });
    } catch (err) {
      results.push({ name, success: false, error: err.message });
    }
  }
  return results;
}

/**
 * Apply a tag to multiple sessions.
 */
async function batchAddTag(sessionNames, tag) {
  return batchTransform(sessionNames, (session) => {
    const tags = new Set(session.tags || []);
    tags.add(tag);
    return { ...session, tags: Array.from(tags) };
  });
}

/**
 * Remove a tag from multiple sessions.
 */
async function batchRemoveTag(sessionNames, tag) {
  return batchTransform(sessionNames, (session) => {
    const tags = (session.tags || []).filter((t) => t !== tag);
    return { ...session, tags };
  });
}

/**
 * Apply a batch operation to ALL sessions matching a predicate.
 */
async function batchTransformWhere(predicateFn, transformFn) {
  const all = await getAllSessions();
  const matching = all.filter(predicateFn).map((s) => s.name);
  return batchTransform(matching, transformFn);
}

module.exports = {
  batchTransform,
  batchDelete,
  batchAddTag,
  batchRemoveTag,
  batchTransformWhere,
};
