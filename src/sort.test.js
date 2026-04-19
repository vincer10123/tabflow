const {
  sortTabsByTitle,
  sortTabsByUrl,
  sortTabsByDate,
  sortSessionsByName,
  sortSessionsByTabCount,
  sortSessionsByDate,
  sortSession,
} = require('./sort');

const tabs = [
  { title: 'Zebra', url: 'https://z.com', addedAt: '2024-03-01' },
  { title: 'Apple', url: 'https://a.com', addedAt: '2024-01-01' },
  { title: 'Mango', url: 'https://m.com', addedAt: '2024-02-01' },
];

test('sortTabsByTitle sorts alphabetically', () => {
  const result = sortTabsByTitle(tabs);
  expect(result[0].title).toBe('Apple');
  expect(result[2].title).toBe('Zebra');
});

test('sortTabsByUrl sorts by url', () => {
  const result = sortTabsByUrl(tabs);
  expect(result[0].url).toBe('https://a.com');
});

test('sortTabsByDate sorts oldest first', () => {
  const result = sortTabsByDate(tabs);
  expect(result[0].addedAt).toBe('2024-01-01');
});

test('sortTabsByTitle does not mutate original', () => {
  const copy = [...tabs];
  sortTabsByTitle(tabs);
  expect(tabs[0].title).toBe(copy[0].title);
});

const sessions = [
  { name: 'Work', tabs: [1, 2, 3], createdAt: '2024-01-01' },
  { name: 'Alpha', tabs: [1], createdAt: '2024-03-01' },
  { name: 'Personal', tabs: [1, 2], createdAt: '2024-02-01' },
];

test('sortSessionsByName sorts alphabetically', () => {
  const result = sortSessionsByName(sessions);
  expect(result[0].name).toBe('Alpha');
});

test('sortSessionsByTabCount sorts most tabs first', () => {
  const result = sortSessionsByTabCount(sessions);
  expect(result[0].name).toBe('Work');
});

test('sortSessionsByDate sorts newest first', () => {
  const result = sortSessionsByDate(sessions);
  expect(result[0].createdAt).toBe('2024-03-01');
});

test('sortSession sorts tabs inside session', () => {
  const session = { name: 'test', tabs };
  const result = sortSession(session, 'title');
  expect(result.tabs[0].title).toBe('Apple');
  expect(result.name).toBe('test');
});

test('sortSession handles missing tabs gracefully', () => {
  const result = sortSession({ name: 'empty' }, 'title');
  expect(result.name).toBe('empty');
});
