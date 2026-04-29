const { setExpiry, clearExpiry, getExpiry, isExpired, getDueExpiries, formatExpiry } = require('./expiry');

jest.mock('./storage');
const { loadSession, saveSession } = require('./storage');

const makeSession = (extra = {}) => ({ name: 'work', tabs: [], ...extra });

beforeEach(() => {
  jest.clearAllMocks();
});

test('setExpiry stores expiry on session', () => {
  const session = makeSession();
  loadSession.mockReturnValue(session);
  const result = setExpiry('work', '2099-01-01T00:00:00Z');
  expect(result.expiresAt).toBe('2099-01-01T00:00:00.000Z');
  expect(result.setAt).toBeDefined();
  expect(saveSession).toHaveBeenCalledWith('work', expect.objectContaining({ expiry: result }));
});

test('setExpiry throws if session not found', () => {
  loadSession.mockReturnValue(null);
  expect(() => setExpiry('ghost', '2099-01-01')).toThrow('Session not found: ghost');
});

test('clearExpiry removes expiry field', () => {
  const session = makeSession({ expiry: { expiresAt: '2099-01-01T00:00:00Z', setAt: '2024-01-01T00:00:00Z' } });
  loadSession.mockReturnValue(session);
  clearExpiry('work');
  expect(saveSession).toHaveBeenCalledWith('work', expect.not.objectContaining({ expiry: expect.anything() }));
});

test('getExpiry returns null when no expiry set', () => {
  loadSession.mockReturnValue(makeSession());
  expect(getExpiry('work')).toBeNull();
});

test('getExpiry returns expiry object', () => {
  const expiry = { expiresAt: '2099-01-01T00:00:00Z', setAt: '2024-01-01T00:00:00Z' };
  loadSession.mockReturnValue(makeSession({ expiry }));
  expect(getExpiry('work')).toEqual(expiry);
});

test('isExpired returns false for future date', () => {
  loadSession.mockReturnValue(makeSession({ expiry: { expiresAt: '2099-01-01T00:00:00Z' } }));
  expect(isExpired('work')).toBe(false);
});

test('isExpired returns true for past date', () => {
  loadSession.mockReturnValue(makeSession({ expiry: { expiresAt: '2000-01-01T00:00:00Z' } }));
  expect(isExpired('work')).toBe(true);
});

test('isExpired returns false when no expiry', () => {
  loadSession.mockReturnValue(makeSession());
  expect(isExpired('work')).toBe(false);
});

test('getDueExpiries filters expired sessions', () => {
  loadSession
    .mockReturnValueOnce(makeSession({ expiry: { expiresAt: '2000-01-01T00:00:00Z' } }))
    .mockReturnValueOnce(makeSession({ expiry: { expiresAt: '2099-01-01T00:00:00Z' } }))
    .mockReturnValueOnce(makeSession());
  const due = getDueExpiries(['old', 'future', 'none']);
  expect(due).toEqual(['old']);
});

test('formatExpiry returns readable string for future expiry', () => {
  const future = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
  expect(formatExpiry({ expiresAt: future })).toMatch(/Expires in/);
});

test('formatExpiry returns readable string for past expiry', () => {
  const past = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  expect(formatExpiry({ expiresAt: past })).toMatch(/Expired/);
});

test('formatExpiry handles null', () => {
  expect(formatExpiry(null)).toBe('No expiry set');
});
