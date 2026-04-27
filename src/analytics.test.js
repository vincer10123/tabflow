const { getTopDomains, getTabCountDistribution, getMostActiveSessions, getTagFrequency, getAnalyticsReport } = require('./analytics');

const mockSessions = [
  {
    name: 'work',
    tags: ['work', 'important'],
    tabs: [
      { url: 'https://github.com/foo' },
      { url: 'https://github.com/bar' },
      { url: 'https://notion.so/page' },
    ],
  },
  {
    name: 'research',
    tags: ['research'],
    tabs: [
      { url: 'https://arxiv.org/paper1' },
      { url: 'https://github.com/baz' },
      { url: 'https://news.ycombinator.com' },
      { url: 'https://news.ycombinator.com/item' },
    ],
  },
  {
    name: 'empty',
    tags: [],
    tabs: [],
  },
];

test('getTopDomains returns sorted domain counts', () => {
  const result = getTopDomains(mockSessions);
  expect(result[0].domain).toBe('github.com');
  expect(result[0].count).toBe(3);
  expect(result[1].domain).toBe('news.ycombinator.com');
  expect(result[1].count).toBe(2);
});

test('getTopDomains respects limit', () => {
  const result = getTopDomains(mockSessions, 2);
  expect(result).toHaveLength(2);
});

test('getTopDomains skips invalid URLs', () => {
  const sessions = [{ tabs: [{ url: 'not-a-url' }, { url: 'https://valid.com' }] }];
  const result = getTopDomains(sessions);
  expect(result).toHaveLength(1);
  expect(result[0].domain).toBe('valid.com');
});

test('getTabCountDistribution buckets sessions correctly', () => {
  const dist = getTabCountDistribution(mockSessions);
  expect(dist['1-5']).toBe(1); // work: 3 tabs
  expect(dist['6-15']).toBe(0);
  expect(dist['1-5']).toBeGreaterThanOrEqual(1);
  // empty session (0 tabs) falls in 1-5
  expect(dist['1-5']).toBe(2);
});

test('getMostActiveSessions returns top sessions by tab count', () => {
  const result = getMostActiveSessions(mockSessions, 2);
  expect(result[0].name).toBe('research');
  expect(result[0].tabCount).toBe(4);
  expect(result[1].name).toBe('work');
});

test('getTagFrequency counts tags across sessions', () => {
  const result = getTagFrequency(mockSessions);
  const workTag = result.find(t => t.tag === 'work');
  expect(workTag).toBeDefined();
  expect(workTag.count).toBe(1);
});

test('getAnalyticsReport returns full report shape', () => {
  const report = getAnalyticsReport(mockSessions);
  expect(report.totalSessions).toBe(3);
  expect(report.totalTabs).toBe(7);
  expect(report.avgTabsPerSession).toBeCloseTo(2.3, 1);
  expect(report.topDomains).toBeDefined();
  expect(report.tabCountDistribution).toBeDefined();
  expect(report.mostActiveSessions).toBeDefined();
  expect(report.tagFrequency).toBeDefined();
});

test('getAnalyticsReport handles empty sessions list', () => {
  const report = getAnalyticsReport([]);
  expect(report.totalSessions).toBe(0);
  expect(report.totalTabs).toBe(0);
  expect(report.avgTabsPerSession).toBe(0);
  expect(report.topDomains).toHaveLength(0);
});
