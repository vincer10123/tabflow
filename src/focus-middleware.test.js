const { withFocusFilter, applyFocusMiddleware } = require('./focus-middleware');

const focusedSession = {
  name: 'dev',
  focusDomains: ['github.com'],
  tabs: [
    { url: 'https://github.com/repo', title: 'Repo' },
    { url: 'https://reddit.com', title: 'Reddit' },
  ],
};

const openSession = {
  name: 'open',
  tabs: [
    { url: 'https://github.com/repo', title: 'Repo' },
    { url: 'https://reddit.com', title: 'Reddit' },
  ],
};

test('withFocusFilter filters tabs for focused session', () => {
  const fn = jest.fn(() => focusedSession);
  const wrapped = withFocusFilter(fn);
  const result = wrapped('dev');
  expect(result.tabs).toHaveLength(1);
  expect(result.tabs[0].url).toContain('github.com');
});

test('withFocusFilter passes through non-focused session', () => {
  const fn = jest.fn(() => openSession);
  const wrapped = withFocusFilter(fn);
  const result = wrapped('open');
  expect(result.tabs).toHaveLength(2);
});

test('withFocusFilter passes through non-session return values', () => {
  const fn = jest.fn(() => 42);
  const wrapped = withFocusFilter(fn);
  expect(wrapped()).toBe(42);
});

test('applyFocusMiddleware wraps all functions', () => {
  const fns = {
    getSession: jest.fn(() => openSession),
    listSessions: jest.fn(() => [openSession]),
    notAFn: 'hello',
  };
  const wrapped = applyFocusMiddleware(fns);
  expect(typeof wrapped.getSession).toBe('function');
  expect(typeof wrapped.listSessions).toBe('function');
  expect(wrapped.notAFn).toBe('hello');
});

test('applyFocusMiddleware wrapped getSession applies filter', () => {
  const fns = { getSession: jest.fn(() => focusedSession) };
  const wrapped = applyFocusMiddleware(fns);
  const result = wrapped.getSession('dev');
  expect(result.tabs).toHaveLength(1);
});
