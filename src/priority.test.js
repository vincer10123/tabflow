const {
  setTabPriority,
  clearTabPriority,
  getTabPriority,
  filterByPriority,
  sortByPriority,
  getPrioritySummary,
  PRIORITY_LEVELS,
} = require('./priority');

const makeSession = (tabs) => ({ name: 'test', tabs });
const makeTab = (url, priority) => (priority ? { url, priority } : { url });

test('setTabPriority sets priority on a tab', () => {
  const session = makeSession([makeTab('http://a.com'), makeTab('http://b.com')]);
  const result = setTabPriority(session, 0, 'high');
  expect(result.tabs[0].priority).toBe('high');
  expect(result.tabs[1].priority).toBeUndefined();
});

test('setTabPriority throws on invalid level', () => {
  const session = makeSession([makeTab('http://a.com')]);
  expect(() => setTabPriority(session, 0, 'urgent')).toThrow('Invalid priority level');
});

test('setTabPriority throws on out-of-range index', () => {
  const session = makeSession([makeTab('http://a.com')]);
  expect(() => setTabPriority(session, 5, 'high')).toThrow('out of range');
});

test('clearTabPriority removes priority from tab', () => {
  const session = makeSession([makeTab('http://a.com', 'high')]);
  const result = clearTabPriority(session, 0);
  expect(result.tabs[0].priority).toBeUndefined();
});

test('getTabPriority returns normal for tabs without priority', () => {
  expect(getTabPriority({ url: 'http://a.com' })).toBe('normal');
  expect(getTabPriority({ url: 'http://a.com', priority: 'critical' })).toBe('critical');
});

test('filterByPriority returns tabs matching level', () => {
  const session = makeSession([
    makeTab('http://a.com', 'high'),
    makeTab('http://b.com', 'low'),
    makeTab('http://c.com', 'high'),
  ]);
  const result = filterByPriority(session, 'high');
  expect(result).toHaveLength(2);
});

test('sortByPriority orders tabs highest first', () => {
  const session = makeSession([
    makeTab('http://a.com', 'low'),
    makeTab('http://b.com', 'critical'),
    makeTab('http://c.com', 'normal'),
  ]);
  const result = sortByPriority(session);
  expect(result.tabs[0].priority).toBe('critical');
  expect(result.tabs[2].priority).toBe('low');
});

test('getPrioritySummary counts tabs by level', () => {
  const session = makeSession([
    makeTab('http://a.com', 'high'),
    makeTab('http://b.com'),
    makeTab('http://c.com', 'high'),
    makeTab('http://d.com', 'critical'),
  ]);
  const summary = getPrioritySummary(session);
  expect(summary.high).toBe(2);
  expect(summary.normal).toBe(1);
  expect(summary.critical).toBe(1);
  expect(summary.low).toBe(0);
});

test('PRIORITY_LEVELS includes all expected levels', () => {
  expect(PRIORITY_LEVELS).toEqual(['low', 'normal', 'high', 'critical']);
});
