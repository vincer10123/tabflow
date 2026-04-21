const { groupTabsByDomain, groupTabsByTag, applyGroupOrder } = require('./group');

const mockSession = {
  name: 'test',
  tabs: [
    { url: 'https://github.com/foo', title: 'Foo', tags: ['dev'] },
    { url: 'https://google.com/search', title: 'Search', tags: [] },
    { url: 'https://github.com/bar', title: 'Bar', tags: ['dev', 'work'] },
    { url: 'https://notion.so/page', title: 'Page', tags: ['work'] },
  ],
};

describe('groupTabsByDomain', () => {
  it('groups tabs by hostname', () => {
    const groups = groupTabsByDomain(mockSession);
    expect(Object.keys(groups)).toContain('github.com');
    expect(Object.keys(groups)).toContain('google.com');
    expect(groups['github.com']).toHaveLength(2);
    expect(groups['google.com']).toHaveLength(1);
  });

  it('handles invalid URLs gracefully', () => {
    const session = { tabs: [{ url: 'not-a-url', title: 'Bad' }] };
    const groups = groupTabsByDomain(session);
    expect(groups['unknown']).toHaveLength(1);
  });
});

describe('groupTabsByTag', () => {
  it('groups tabs by tag', () => {
    const groups = groupTabsByTag(mockSession);
    expect(groups['dev']).toHaveLength(2);
    expect(groups['work']).toHaveLength(2);
  });

  it('places untagged tabs under "untagged"', () => {
    const groups = groupTabsByTag(mockSession);
    expect(groups['untagged']).toHaveLength(1);
    expect(groups['untagged'][0].title).toBe('Search');
  });
});

describe('applyGroupOrder', () => {
  it('reorders tabs and annotates with group key', () => {
    const result = applyGroupOrder(mockSession, '_domainGroup', groupTabsByDomain);
    expect(result.tabs[0]._domainGroup).toBeDefined();
    const domains = result.tabs.map(t => t._domainGroup);
    expect(domains).toEqual([...domains].sort());
  });

  it('preserves all tabs', () => {
    const result = applyGroupOrder(mockSession, '_tagGroup', groupTabsByTag);
    // tabs with multiple tags appear multiple times
    expect(result.tabs.length).toBeGreaterThanOrEqual(mockSession.tabs.length);
  });
});
