const { addTag, removeTag, getSessionsByTag, listTags } = require('./tags');
const storage = require('./storage');

jest.mock('./storage');

const mockSession = (tags = []) => ({ name: 'test', tabs: [], tags });

beforeEach(() => jest.clearAllMocks());

test('addTag adds a tag to a session', async () => {
  storage.loadSession.mockResolvedValue(mockSession());
  storage.saveSession.mockResolvedValue();
  const result = await addTag('test', 'work');
  expect(result.tags).toContain('work');
  expect(storage.saveSession).toHaveBeenCalledWith('test', expect.objectContaining({ tags: ['work'] }));
});

test('addTag does not duplicate tags', async () => {
  storage.loadSession.mockResolvedValue(mockSession(['work']));
  storage.saveSession.mockResolvedValue();
  const result = await addTag('test', 'work');
  expect(result.tags).toEqual(['work']);
  expect(storage.saveSession).not.toHaveBeenCalled();
});

test('addTag throws if session not found', async () => {
  storage.loadSession.mockResolvedValue(null);
  await expect(addTag('missing', 'work')).rejects.toThrow("Session 'missing' not found");
});

test('removeTag removes a tag from a session', async () => {
  storage.loadSession.mockResolvedValue(mockSession(['work', 'personal']));
  storage.saveSession.mockResolvedValue();
  const result = await removeTag('test', 'work');
  expect(result.tags).toEqual(['personal']);
});

test('getSessionsByTag returns matching sessions', async () => {
  storage.listSessions.mockResolvedValue(['s1', 's2']);
  storage.loadSession
    .mockResolvedValueOnce(mockSession(['work']))
    .mockResolvedValueOnce(mockSession(['personal']));
  const results = await getSessionsByTag('work');
  expect(results).toHaveLength(1);
  expect(results[0].name).toBe('s1');
});

test('listTags returns sorted unique tags', async () => {
  storage.listSessions.mockResolvedValue(['s1', 's2']);
  storage.loadSession
    .mockResolvedValueOnce(mockSession(['work', 'dev']))
    .mockResolvedValueOnce(mockSession(['personal', 'work']));
  const tags = await listTags();
  expect(tags).toEqual(['dev', 'personal', 'work']);
});
