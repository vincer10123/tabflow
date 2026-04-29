const {
  hideSession,
  showSession,
  isHidden,
  filterVisible,
  filterHidden,
  getHiddenNames
} = require('./visibility');

const makeSessions = () => ({
  work: { name: 'work', tabs: [{ url: 'https://example.com' }] },
  personal: { name: 'personal', tabs: [] },
  secret: { name: 'secret', tabs: [], hidden: true, hiddenAt: '2024-01-01T00:00:00.000Z' }
});

test('hideSession marks session as hidden', () => {
  const result = hideSession(makeSessions(), 'work');
  expect(result.work.hidden).toBe(true);
  expect(result.work.hiddenAt).toBeDefined();
});

test('hideSession throws if session not found', () => {
  expect(() => hideSession(makeSessions(), 'nope')).toThrow('not found');
});

test('showSession removes hidden flag', () => {
  const result = showSession(makeSessions(), 'secret');
  expect(result.secret.hidden).toBeUndefined();
  expect(result.secret.hiddenAt).toBeUndefined();
});

test('showSession throws if session not found', () => {
  expect(() => showSession(makeSessions(), 'ghost')).toThrow('not found');
});

test('isHidden returns true for hidden sessions', () => {
  expect(isHidden({ hidden: true })).toBe(true);
  expect(isHidden({ hidden: false })).toBe(false);
  expect(isHidden({})).toBe(false);
  expect(isHidden(null)).toBe(false);
});

test('filterVisible excludes hidden sessions', () => {
  const visible = filterVisible(makeSessions());
  expect(Object.keys(visible)).toEqual(['work', 'personal']);
});

test('filterHidden returns only hidden sessions', () => {
  const hidden = filterHidden(makeSessions());
  expect(Object.keys(hidden)).toEqual(['secret']);
});

test('getHiddenNames returns names of hidden sessions', () => {
  expect(getHiddenNames(makeSessions())).toEqual(['secret']);
});

test('hideSession does not mutate original', () => {
  const sessions = makeSessions();
  hideSession(sessions, 'work');
  expect(sessions.work.hidden).toBeUndefined();
});
