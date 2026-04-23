const { setHotkey, clearHotkey, getHotkey, findByHotkey, listHotkeys } = require('./hotkey');
const storage = require('./storage');

jest.mock('./storage');

const mockSession = (name, hotkey) => ({ name, tabs: [], hotkey });

beforeEach(() => jest.clearAllMocks());

test('setHotkey assigns hotkey to session', async () => {
  const session = mockSession('work', undefined);
  storage.loadSession.mockResolvedValue(session);
  storage.saveSession.mockResolvedValue();
  const result = await setHotkey('work', 'W');
  expect(result.hotkey).toBe('w');
  expect(storage.saveSession).toHaveBeenCalledWith('work', expect.objectContaining({ hotkey: 'w' }));
});

test('setHotkey throws on invalid hotkey', async () => {
  await expect(setHotkey('work', '!!!')).rejects.toThrow('Invalid hotkey');
});

test('setHotkey throws if session not found', async () => {
  storage.loadSession.mockResolvedValue(null);
  await expect(setHotkey('ghost', 'g')).rejects.toThrow('not found');
});

test('clearHotkey removes hotkey from session', async () => {
  const session = mockSession('work', 'w');
  storage.loadSession.mockResolvedValue(session);
  storage.saveSession.mockResolvedValue();
  const result = await clearHotkey('work');
  expect(result.hotkey).toBeUndefined();
});

test('getHotkey returns assigned hotkey', async () => {
  storage.loadSession.mockResolvedValue(mockSession('work', 'w'));
  const key = await getHotkey('work');
  expect(key).toBe('w');
});

test('getHotkey returns null when no hotkey set', async () => {
  storage.loadSession.mockResolvedValue(mockSession('work', undefined));
  const key = await getHotkey('work');
  expect(key).toBeNull();
});

test('findByHotkey locates session by hotkey', async () => {
  const sessions = [mockSession('work', 'w'), mockSession('personal', 'p')];
  const found = await findByHotkey('p', sessions);
  expect(found.name).toBe('personal');
});

test('findByHotkey returns null when not found', async () => {
  const result = await findByHotkey('z', [mockSession('work', 'w')]);
  expect(result).toBeNull();
});

test('listHotkeys returns sorted list of assigned hotkeys', async () => {
  const sessions = [mockSession('b-session', 'b'), mockSession('a-session', 'a'), mockSession('no-key', undefined)];
  const list = await listHotkeys(sessions);
  expect(list).toEqual([
    { name: 'a-session', hotkey: 'a' },
    { name: 'b-session', hotkey: 'b' },
  ]);
});
