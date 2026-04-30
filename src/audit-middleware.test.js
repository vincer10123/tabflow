const { withAudit, applyAuditTracking } = require('./audit-middleware');
const { getAuditLog, clearAuditLog } = require('./audit');

beforeEach(() => {
  clearAuditLog('alpha');
  clearAuditLog('beta');
});

test('withAudit records action after function call', () => {
  const mockFn = jest.fn(() => 'ok');
  const wrapped = withAudit(mockFn, 'create');
  const result = wrapped('alpha', { url: 'https://example.com' });
  expect(result).toBe('ok');
  const log = getAuditLog('alpha');
  expect(log).toHaveLength(1);
  expect(log[0].action).toBe('create');
});

test('withAudit passes all args to original function', () => {
  const mockFn = jest.fn();
  const wrapped = withAudit(mockFn, 'update');
  wrapped('alpha', 'extra1', 'extra2');
  expect(mockFn).toHaveBeenCalledWith('alpha', 'extra1', 'extra2');
});

test('applyAuditTracking wraps createSession', () => {
  const sessions = {
    createSession: jest.fn(() => ({ name: 'alpha', tabs: [] })),
    removeSession: jest.fn(),
    renameSession: jest.fn(),
    getSession: jest.fn(() => ({ name: 'alpha' })),
  };
  const tracked = applyAuditTracking(sessions);
  tracked.createSession('alpha');
  const log = getAuditLog('alpha');
  expect(log[0].action).toBe('create');
});

test('applyAuditTracking wraps removeSession', () => {
  const sessions = {
    createSession: jest.fn(),
    removeSession: jest.fn(),
    renameSession: jest.fn(),
    getSession: jest.fn(),
  };
  const tracked = applyAuditTracking(sessions);
  tracked.removeSession('beta');
  const log = getAuditLog('beta');
  expect(log[0].action).toBe('remove');
});

test('applyAuditTracking preserves other methods', () => {
  const sessions = {
    createSession: jest.fn(),
    removeSession: jest.fn(),
    renameSession: jest.fn(),
    getSession: jest.fn(),
    getAllSessions: jest.fn(() => []),
  };
  const tracked = applyAuditTracking(sessions);
  expect(typeof tracked.getAllSessions).toBe('function');
  tracked.getAllSessions();
  expect(sessions.getAllSessions).toHaveBeenCalled();
});
