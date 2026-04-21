const { loadSession, saveSession } = require('./storage');

function groupTabsByDomain(session) {
  const groups = {};
  for (const tab of session.tabs) {
    let domain;
    try {
      domain = new URL(tab.url).hostname;
    } catch {
      domain = 'unknown';
    }
    if (!groups[domain]) groups[domain] = [];
    groups[domain].push(tab);
  }
  return groups;
}

function groupTabsByTag(session) {
  const groups = {};
  for (const tab of session.tabs) {
    const tags = tab.tags && tab.tags.length > 0 ? tab.tags : ['untagged'];
    for (const tag of tags) {
      if (!groups[tag]) groups[tag] = [];
      groups[tag].push(tab);
    }
  }
  return groups;
}

function applyGroupOrder(session, groupKey, groupFn) {
  const groups = groupFn(session);
  const reordered = [];
  for (const key of Object.keys(groups).sort()) {
    for (const tab of groups[key]) {
      reordered.push({ ...tab, [groupKey]: key });
    }
  }
  return { ...session, tabs: reordered };
}

/**
 * Returns a summary of group sizes for a given grouping function.
 * Useful for previewing how tabs will be grouped before committing.
 *
 * @param {object} session - The session object
 * @param {function} groupFn - A grouping function (e.g. groupTabsByDomain)
 * @returns {object} Map of group keys to tab counts
 */
function getGroupSummary(session, groupFn) {
  const groups = groupFn(session);
  const summary = {};
  for (const [key, tabs] of Object.entries(groups)) {
    summary[key] = tabs.length;
  }
  return summary;
}

async function groupSessionByDomain(name) {
  const session = await loadSession(name);
  if (!session) throw new Error(`Session "${name}" not found`);
  const updated = applyGroupOrder(session, '_domainGroup', groupTabsByDomain);
  await saveSession(name, updated);
  return updated;
}

async function groupSessionByTag(name) {
  const session = await loadSession(name);
  if (!session) throw new Error(`Session "${name}" not found`);
  const updated = applyGroupOrder(session, '_tagGroup', groupTabsByTag);
  await saveSession(name, updated);
  return updated;
}

module.exports = {
  groupTabsByDomain,
  groupTabsByTag,
  applyGroupOrder,
  getGroupSummary,
  groupSessionByDomain,
  groupSessionByTag,
};
