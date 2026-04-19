const {
  filterByPinned,
  filterByTag,
  filterByDomain,
  filterSessionsByMinTabs,
  filterSessionsByTag,
} = require('./filter');

const makeSession = (tabs) => ({ name: 'test', tabs });

const tabs = [
  { url: 'https://github.com/foo', title: 'GitHub', pinned: true, tags: ['dev'] },
  { url: 'https://news.ycombinator.com/', title: 'HN', pinned: false, tags: ['reading'] },
  { url: 'https://sub.github.com/bar', title: 'GitHub Sub', pinned: false, tags: ['dev'] },
];

test('filterByPinned returns only pinned tabs', () => {
  const result = filterByPinned(makeSession(tabs), true);
  expect(result.tabs).toHaveLength(1);
  expect(result.tabs[0].title).toBe('GitHub');
});

test('filterByPinned returns only unpinned tabs', () => {
  const result = filterByPinned(makeSession(tabs), false);
  expect(result.tabs).toHaveLength(2);
});

test('filterByTag filters tabs by tag', () => {
  const result = filterByTag(makeSession(tabs), 'dev');
  expect(result.tabs).toHaveLength(2);
  expect(result.tabs.every((t) => t.tags.includes('dev'))).toBe(true);
});

test('filterByTag returns empty if no match', () => {
  const result = filterByTag(makeSession(tabs), 'nonexistent');
  expect(result.tabs).toHaveLength(0);
});

test('filterByDomain matches exact and subdomains', () => {
  const result = filterByDomain(makeSession(tabs), 'github.com');
  expect(result.tabs).toHaveLength(2);
});

test('filterByDomain returns empty for unknown domain', () => {
  const result = filterByDomain(makeSession(tabs), 'example.com');
  expect(result.tabs).toHaveLength(0);
});

test('filterSessionsByMinTabs filters correctly', () => {
  const sessions = [
    makeSession([tabs[0]]),
    makeSession(tabs),
  ];
  expect(filterSessionsByMinTabs(sessions, 2)).toHaveLength(1);
  expect(filterSessionsByMinTabs(sessions, 1)).toHaveLength(2);
});

test('filterSessionsByTag returns sessions with matching tab tag', () => {
  const sessions = [
    makeSession([tabs[1]]),
    makeSession([tabs[0], tabs[2]]),
  ];
  const result = filterSessionsByTag(sessions, 'dev');
  expect(result).toHaveLength(1);
});
