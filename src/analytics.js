// analytics.js — aggregate usage analytics across sessions

const { getAllSessions } = require('./sessions');

function getTopDomains(sessions, limit = 10) {
  const domainCounts = {};
  for (const session of sessions) {
    for (const tab of session.tabs || []) {
      try {
        const url = new URL(tab.url);
        const domain = url.hostname;
        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      } catch (_) {
        // skip invalid URLs
      }
    }
  }
  return Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([domain, count]) => ({ domain, count }));
}

function getTabCountDistribution(sessions) {
  const buckets = { '1-5': 0, '6-15': 0, '16-30': 0, '31+': 0 };
  for (const session of sessions) {
    const n = (session.tabs || []).length;
    if (n <= 5) buckets['1-5']++;
    else if (n <= 15) buckets['6-15']++;
    else if (n <= 30) buckets['16-30']++;
    else buckets['31+']++;
  }
  return buckets;
}

function getMostActiveSessions(sessions, limit = 5) {
  return [...sessions]
    .sort((a, b) => (b.tabs || []).length - (a.tabs || []).length)
    .slice(0, limit)
    .map(s => ({ name: s.name, tabCount: (s.tabs || []).length }));
}

function getTagFrequency(sessions) {
  const tagCounts = {};
  for (const session of sessions) {
    for (const tag of session.tags || []) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }
  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));
}

function getAnalyticsReport(sessions) {
  const totalSessions = sessions.length;
  const totalTabs = sessions.reduce((sum, s) => sum + (s.tabs || []).length, 0);
  const avgTabs = totalSessions > 0 ? (totalTabs / totalSessions).toFixed(1) : 0;
  return {
    totalSessions,
    totalTabs,
    avgTabsPerSession: parseFloat(avgTabs),
    topDomains: getTopDomains(sessions),
    tabCountDistribution: getTabCountDistribution(sessions),
    mostActiveSessions: getMostActiveSessions(sessions),
    tagFrequency: getTagFrequency(sessions),
  };
}

module.exports = { getTopDomains, getTabCountDistribution, getMostActiveSessions, getTagFrequency, getAnalyticsReport };
