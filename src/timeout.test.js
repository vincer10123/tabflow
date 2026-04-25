const { setTimeout: setTO, clearTimeout: clearTO, getTimeout, isTimedOut } = require('./timeout');
const { loadSession, saveSession } = require('./storage');

jest.mock('./storage');

const mockSession = () => ({ name: 'work', tabs: [] });

beforeEach(() => {
  jest.clearAllMocks();
  loadSession.mockReturnValue(mockSession());
});

test('setTimeout sets timeout on session', () => {
  const result = setTO('work', 30);
  expect(result.minutes).toBe(30);
  expect(result.setAt).toBeDefined();
  expect(saveSession).toHaveBeenCalled();
});

test('setTimeout uses default if minutes omitted', () => {
  const result = setTO('work');
  expect(result.minutes).toBe(60);
});

test('clearTimeout removes timeout from session', () => {
  const session = mockSession();
  session.timeout = { minutes: 30, setAt: new Date().toISOString() };
  loadSession.mockReturnValue(session);
  const result = clearTO('work');
  expect(result).toBe(true);
  expect(saveSession).toHaveBeenCalledWith('work', expect.not.objectContaining({ timeout: expect.anything() }));
});

test('getTimeout returns null if no timeout set', () => {
  expect(getTimeout('work')).toBeNull();
});

test('getTimeout returns timeout object', () => {
  const session = mockSession();
  session.timeout = { minutes: 45, setAt: new Date().toISOString() };
  loadSession.mockReturnValue(session);
  expect(getTimeout('work')).toEqual(session.timeout);
});

test('isTimedOut returns false when not expired', () => {
  const session = mockSession();
  session.timeout = { minutes: 60, setAt: new Date().toISOString() };
  loadSession.mockReturnValue(session);
  expect(isTimedOut('work')).toBe(false);
});

test('isTimedOut returns true when expired', () => {
  const session = mockSession();
  const past = new Date(Date.now() - 90 * 60 * 1000).toISOString();
  session.timeout = { minutes: 60, setAt: past };
  loadSession.mockReturnValue(session);
  expect(isTimedOut('work')).toBe(true);
});

test('isTimedOut returns false when no timeout set', () => {
  expect(isTimedOut('work')).toBe(false);
});

test('throws if session not found', () => {
  loadSession.mockReturnValue(null);
  expect(() => setTO('ghost', 10)).toThrow('not found');
});
