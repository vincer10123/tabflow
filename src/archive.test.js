const { archiveSession, restoreSession, listArchived, isArchived } = require('./archive');
const storage = require('./storage');

jest.mock('./storage');

const mockSession = { name: 'work', tabs: [{ url: 'https://example.com', title: 'Example' }] };

beforeEach(() => jest.clearAllMocks());

test('archiveSession saves with prefix and deletes original', () => {
  storage.loadSession.mockReturnValue(mockSession);
  const result = archiveSession('work');
  expect(result).toBe('__archived__work');
  expect(storage.saveSession).toHaveBeenCalledWith('__archived__work', expect.objectContaining({ archivedAt: expect.any(String) }));
  expect(storage.deleteSession).toHaveBeenCalledWith('work');
});

test('archiveSession throws if session not found', () => {
  storage.loadSession.mockReturnValue(null);
  expect(() => archiveSession('nope')).toThrow('Session "nope" not found');
});

test('restoreSession restores and removes archive', () => {
  storage.loadSession.mockReturnValue({ ...mockSession, archivedAt: '2024-01-01T00:00:00.000Z' });
  const result = restoreSession('work');
  expect(result).toBe('work');
  expect(storage.saveSession).toHaveBeenCalledWith('work', expect.not.objectContaining({ archivedAt: expect.anything() }));
  expect(storage.deleteSession).toHaveBeenCalledWith('__archived__work');
});

test('restoreSession throws if archive not found', () => {
  storage.loadSession.mockReturnValue(null);
  expect(() => restoreSession('missing')).toThrow('Archived session "missing" not found');
});

test('listArchived returns only archived names without prefix', () => {
  storage.listSessions.mockReturnValue(['__archived__work', 'personal', '__archived__school']);
  expect(listArchived()).toEqual(['work', 'school']);
});

test('isArchived returns true for archived session', () => {
  storage.listSessions.mockReturnValue(['__archived__work']);
  expect(isArchived('work')).toBe(true);
  expect(isArchived('personal')).toBe(false);
});
