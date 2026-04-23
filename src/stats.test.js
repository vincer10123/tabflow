const { getSessionStats, getGlobalStats } = require('./stats');

const mockSession = {
  name: 'work',
  tabs: [
    { url: 'https://github.com/foo', title: 'GitHub', pinned: true },
    { url: 'https://github.com/bar', title: 'GitHub 2', pinned: false },
    { url: 'https://notion.so/page', title: 'Notion', pinned: false },
    { url: 'not-a-url', title: 'Bad', pinned: false },
  ],
  tags: ['dev', 'important'],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-02',
};

describe('getSessionStats', () => {
  it('returns correct tab count', () => {
    const stats = getSessionStats(mockSession);
    expect(stats.tabCount).toBe(4);
  });

  it('returns correct pinned count', () => {
    const stats = getSessionStats(mockSession);
    expect(stats.pinnedCount).toBe(1);
  });

  it('returns correct tag count', () => {
    const stats = getSessionStats(mockSession);
    expect(stats.tagCount).toBe(2);
  });

  it('identifies top domain', () => {
    const stats = getSessionStats(mockSession);
    expect(stats.topDomain).toBe('github.com');
  });

  it('counts unique domains including unknown', () => {
    const stats = getSessionStats(mockSession);
    expect(stats.uniqueDomains).toBe(3);
  });

  it('handles session with no tabs', () => {
    const stats = getSessionStats({ name: 'empty', tabs: [] });
    expect(stats.tabCount).toBe(0);
    expect(stats.topDomain).toBeNull();
  });
});

describe('getGlobalStats', () => {
  const sessions = [
    { name: 'a', tabs: [{ url: 'https://github.com' }, { url: 'https://github.com/2' }] },
    { name: 'b', tabs: [{ url: 'https://google.com' }] },
    { name: 'c', tabs: [] },
  ];

  it('returns correct session count', () => {
    const stats = getGlobalStats(sessions);
    expect(stats.sessionCount).toBe(3);
  });

  it('returns correct total tabs', () => {
    const stats = getGlobalStats(sessions);
    expect(stats.totalTabs).toBe(3);
  });

  it('computes average tabs per session', () => {
    const stats = getGlobalStats(sessions);
    expect(stats.avgTabsPerSession).toBe(1);
  });

  it('lists top domains', () => {
    const stats = getGlobalStats(sessions);
    expect(stats.topDomains[0].domain).toBe('github.com');
    expect(stats.topDomains[0].count).toBe(2);
  });

  it('handles empty session list', () => {
    const stats = getGlobalStats([]);
    expect(stats.avgTabsPerSession).toBe(0);
    expect(stats.topDomains).toHaveLength(0);
  });
});
