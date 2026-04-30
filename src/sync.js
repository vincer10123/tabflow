// sync.js — compare and sync sessions across two named profiles/dirs

const { getAllSessions, getSession } = require('./sessions');
const { saveSession } = require('./storage');

function diffProfiles(profileA, profileB) {
  const namesA = new Set(profileA.map(s => s.name));
  const namesB = new Set(profileB.map(s => s.name));

  const onlyInA = profileA.filter(s => !namesB.has(s.name));
  const onlyInB = profileB.filter(s => !namesA.has(s.name));
  const inBoth = profileA.filter(s => namesB.has(s.name));

  return { onlyInA, onlyInB, inBoth };
}

function mergeProfiles(profileA, profileB, strategy = 'union') {
  const map = new Map();

  for (const session of profileA) {
    map.set(session.name, { ...session });
  }

  for (const session of profileB) {
    if (strategy === 'union') {
      if (!map.has(session.name)) {
        map.set(session.name, { ...session });
      }
    } else if (strategy === 'overwrite') {
      map.set(session.name, { ...session });
    } else if (strategy === 'newer') {
      const existing = map.get(session.name);
      if (!existing || (session.updatedAt || 0) > (existing.updatedAt || 0)) {
        map.set(session.name, { ...session });
      }
    }
  }

  return Array.from(map.values());
}

function getSyncStatus(sessions) {
  const now = Date.now();
  return sessions.map(s => ({
    name: s.name,
    tabCount: (s.tabs || []).length,
    updatedAt: s.updatedAt || null,
    age: s.updatedAt ? Math.floor((now - s.updatedAt) / 1000) : null,
  }));
}

module.exports = { diffProfiles, mergeProfiles, getSyncStatus };
