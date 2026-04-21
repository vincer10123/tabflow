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
  groupSessionByDomain,
  groupSessionByTag,
};
