// Priority levels for tabs within a session
const PRIORITY_LEVELS = ['low', 'normal', 'high', 'critical'];

function setTabPriority(session, tabIndex, level) {
  if (!PRIORITY_LEVELS.includes(level)) {
    throw new Error(`Invalid priority level: ${level}. Must be one of: ${PRIORITY_LEVELS.join(', ')}`);
  }
  if (tabIndex < 0 || tabIndex >= session.tabs.length) {
    throw new Error(`Tab index ${tabIndex} out of range`);
  }
  const tabs = session.tabs.map((tab, i) =>
    i === tabIndex ? { ...tab, priority: level } : tab
  );
  return { ...session, tabs };
}

function clearTabPriority(session, tabIndex) {
  if (tabIndex < 0 || tabIndex >= session.tabs.length) {
    throw new Error(`Tab index ${tabIndex} out of range`);
  }
  const tabs = session.tabs.map((tab, i) => {
    if (i !== tabIndex) return tab;
    const { priority, ...rest } = tab;
    return rest;
  });
  return { ...session, tabs };
}

function getTabPriority(tab) {
  return tab.priority || 'normal';
}

function filterByPriority(session, level) {
  if (!PRIORITY_LEVELS.includes(level)) {
    throw new Error(`Invalid priority level: ${level}`);
  }
  return session.tabs.filter(tab => getTabPriority(tab) === level);
}

function sortByPriority(session) {
  const sorted = [...session.tabs].sort((a, b) => {
    return PRIORITY_LEVELS.indexOf(getTabPriority(b)) - PRIORITY_LEVELS.indexOf(getTabPriority(a));
  });
  return { ...session, tabs: sorted };
}

function getPrioritySummary(session) {
  const summary = Object.fromEntries(PRIORITY_LEVELS.map(l => [l, 0]));
  for (const tab of session.tabs) {
    const p = getTabPriority(tab);
    summary[p]++;
  }
  return summary;
}

module.exports = {
  PRIORITY_LEVELS,
  setTabPriority,
  clearTabPriority,
  getTabPriority,
  filterByPriority,
  sortByPriority,
  getPrioritySummary,
};
