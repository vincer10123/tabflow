const { searchByName, searchByUrl, searchByTitle, searchAll } = require('./search');
const { getAllSessions } = require('./sessions');

jest.mock('./sessions');

const mockSessions = [
  {
    name: 'work',
    tabs: [
      { url: 'https://github.com/org/repo', title: 'GitHub Repo' },
      { url: 'https://jira.example.com', title: 'Jira Board' }
    ]
  },
  {
    name: 'personal',
    tabs: [
      { url: 'https://news.ycombinator.com', title: 'Hacker News' },
      { url: 'https://reddit.com', title: 'Reddit' }
    ]
  },
  {
    name: 'research',
    tabs: [
      { url: 'https://arxiv.org/paper', title: 'ArXiv Paper on GitHub topics' }
    ]
  }
];

beforeEach(() => {
  getAllSessions.mockReturnValue(mockSessions);
});

test('searchByName returns sessions matching name', () => {
  const results = searchByName('work');
  expect(results).toHaveLength(1);
  expect(results[0].name).toBe('work');
});

test('searchByName is case-insensitive', () => {
  const results = searchByName('PERSONAL');
  expect(results).toHaveLength(1);
  expect(results[0].name).toBe('personal');
});

test('searchByName returns empty array when no match', () => {
  const results = searchByName('nonexistent');
  expect(results).toHaveLength(0);
});

test('searchByUrl finds sessions with matching tab url', () => {
  const results = searchByUrl('github.com');
  expect(results).toHaveLength(1);
  expect(results[0].name).toBe('work');
});

test('searchByUrl is case-insensitive', () => {
  const results = searchByUrl('GITHUB.COM');
  expect(results).toHaveLength(1);
  expect(results[0].name).toBe('work');
});

test('searchByTitle finds sessions with matching tab title', () => {
  const results = searchByTitle('hacker news');
  expect(results).toHaveLength(1);
  expect(results[0].name).toBe('personal');
});

test('searchAll matches across name, url, and title', () => {
  const results = searchAll('github');
  expect(results.map(s => s.name)).toEqual(expect.arrayContaining(['work', 'research']));
});

test('searchAll returns empty array when no match', () => {
  const results = searchAll('zzznomatch');
  expect(results).toHaveLength(0);
});

test('searchAll does not return duplicate sessions', () => {
  // 'work' session matches both by name pattern and url; should only appear once
  const results = searchAll('work');
  const names = results.map(s => s.name);
  expect(names).toEqual([...new Set(names)]);
});
