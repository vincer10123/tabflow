const {
  withPrioritySort,
  withPriorityFilter,
  applyPriorityMiddleware,
} = require('./priority-middleware');

const makeSession = (tabs) => ({ name: 'test', tabs });

test('withPrioritySort sorts tabs by priority', async () => {
  const session = makeSession([
    { url: 'http://a.com', priority: 'low' },
    { url: 'http://b.com', priority: 'critical' },
    { url: 'http://c.com' },
  ]);
  const fn = jest.fn().mockResolvedValue(session);
  const wrapped = withPrioritySort(fn);
  const result = await wrapped();
  expect(result.tabs[0].priority).toBe('critical');
  expect(result.tabs[2].priority).toBe('low');
});

test('withPrioritySort passes through null session', async () => {
  const fn = jest.fn().mockResolvedValue(null);
  const wrapped = withPrioritySort(fn);
  const result = await wrapped();
  expect(result).toBeNull();
});

test('withPriorityFilter returns only matching priority tabs', async () => {
  const session = makeSession([
    { url: 'http://a.com', priority: 'high' },
    { url: 'http://b.com', priority: 'low' },
    { url: 'http://c.com', priority: 'high' },
  ]);
  const fn = jest.fn().mockResolvedValue(session);
  const wrapped = withPriorityFilter('high')(fn);
  const result = await wrapped();
  expect(result.tabs).toHaveLength(2);
  expect(result.tabs.every(t => t.priority === 'high')).toBe(true);
});

test('withPriorityFilter passes through null', async () => {
  const fn = jest.fn().mockResolvedValue(null);
  const wrapped = withPriorityFilter('high')(fn);
  const result = await wrapped();
  expect(result).toBeNull();
});

test('applyPriorityMiddleware wraps all provided functions', async () => {
  const session = makeSession([
    { url: 'http://a.com', priority: 'low' },
    { url: 'http://b.com', priority: 'critical' },
  ]);
  const fns = {
    getSession: jest.fn().mockResolvedValue(session),
    getOther: jest.fn().mockResolvedValue(session),
  };
  const wrapped = applyPriorityMiddleware(fns);
  const result = await wrapped.getSession();
  expect(result.tabs[0].priority).toBe('critical');
  expect(typeof wrapped.getOther).toBe('function');
});
