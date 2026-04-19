const { lockSession, unlockSession, isLocked, guardLocked } = require('./lock');
const { loadSession, saveSession } = require('./storage');

jest.mock('./storage');

const mockSession = (locked = false) => ({ name: 'work', tabs: [], locked });

beforeEach(() => jest.clearAllMocks());

test('lockSession sets locked to true', () => {
  loadSession.mockReturnValue(mockSession(false));
  const result = lockSession('work');
  expect(result.locked).toBe(true);
  expect(saveSession).toHaveBeenCalledWith('work', expect.objectContaining({ locked: true }));
});

test('lockSession throws if already locked', () => {
  loadSession.mockReturnValue(mockSession(true));
  expect(() => lockSession('work')).toThrow('already locked');
});

test('unlockSession sets locked to false', () => {
  loadSession.mockReturnValue(mockSession(true));
  const result = unlockSession('work');
  expect(result.locked).toBe(false);
  expect(saveSession).toHaveBeenCalledWith('work', expect.objectContaining({ locked: false }));
});

test('unlockSession throws if not locked', () => {
  loadSession.mockReturnValue(mockSession(false));
  expect(() => unlockSession('work')).toThrow('not locked');
});

test('isLocked returns true when locked', () => {
  loadSession.mockReturnValue(mockSession(true));
  expect(isLocked('work')).toBe(true);
});

test('isLocked returns false when not locked', () => {
  loadSession.mockReturnValue(mockSession(false));
  expect(isLocked('work')).toBe(false);
});

test('guardLocked throws if session is locked', () => {
  loadSession.mockReturnValue(mockSession(true));
  expect(() => guardLocked('work')).toThrow('locked and cannot be modified');
});

test('guardLocked does not throw if session is unlocked', () => {
  loadSession.mockReturnValue(mockSession(false));
  expect(() => guardLocked('work')).not.toThrow();
});

test('lockSession throws if session not found', () => {
  loadSession.mockReturnValue(null);
  expect(() => lockSession('ghost')).toThrow('not found');
});
