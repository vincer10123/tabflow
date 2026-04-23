const { getAllSessions } = require('./sessions');

/**
 * Get statistics for a single session
 */
function getSessionStats(session) {
  const tabs = session.tabs || [];
  const domains = tabs.map(t => {
    try {
      return new URL(t.url).hostname;
    } catch {
      return 'unknown';
    }
  });

  const domainCounts = domains.reduce((acc, d) => {
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});

  const topDomain = Object.entries(domainCounts).sort((a, b) => b[1] - a[1])[0];

  return {
    name: session.name,
    tabCount: tabs.length,
    pinnedCount: tabs.filter(t => t.pinned).length,
    tagCount: (session.tags || []).length,
    uniqueDomains: Object.keys(domainCounts).length,
    topDomain: topDomain ? topDomain[0] : null,
    createdAt: session.createdAt || null,
    updatedAt: session.updatedAt || null,
  };
}

/**
 * Get aggregate stats across all sessions
 */
function getGlobalStats(sessions) {
  const list = sessions || getAllSessions();
  const totalTabs = list.reduce((sum, s) => sum + (s.tabs || []).length, 0);
  const allTabs = list.flatMap(s => s.tabs || []);

  const domainCounts = {};
  for (const tab of allTabs) {
    try {
      const host = new URL(tab.url).hostname;
      domainCounts[host] = (domainCounts[host] || 0) + 1;
    } catch {
      // skip invalid URLs
    }
  }

  const topDomains = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([domain, count]) => ({ domain, count }));

  return {
    sessionCount: list.length,
    totalTabs,
    avgTabsPerSession: list.length ? +(totalTabs / list.length).toFixed(2) : 0,
    uniqueDomains: Object.keys(domainCounts).length,
    topDomains,
  };
}

module.exports = { getSessionStats, getGlobalStats };
