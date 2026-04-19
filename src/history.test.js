const { getHistory, addHistoryEntry, clearHistory, getHistoryForSession } = require('./history');
const storage = require('./storage');

jest.mock('./storage');

describe('history', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getHistory returns empty array when no history exists', async () => {
    storage.loadSession.mockRejectedValue(new Error('not found'));
    const result = await getHistory();
    expect(result).toEqual([]);
  });

  test('addHistoryEntry saves a new entry', async () => {
    storage.loadSession.mockResolvedValue({ entries: [] });
    storage.saveSession.mockResolvedValue();
    const entry = await addHistoryEntry('create', 'work');
    expect(entry.action).toBe('create');
    expect(entry.sessionName).toBe('work');
    expect(entry.timestamp).toBeDefined();
    expect(storage.saveSession).toHaveBeenCalled();
  });

  test('addHistoryEntry prepends and trims to MAX_HISTORY', async () => {
    const existing = Array.from({ length: 50 }, (_, i) => ({ action: 'create', sessionName: `s${i}`, timestamp: '' }));
    storage.loadSession.mockResolvedValue({ entries: existing });
    storage.saveSession.mockResolvedValue();
    await addHistoryEntry('delete', 'new-session');
    const saved = storage.saveSession.mock.calls[0][1];
    expect(saved.entries.length).toBe(50);
    expect(saved.entries[0].sessionName).toBe('new-session');
  });

  test('clearHistory resets entries', async () => {
    storage.saveSession.mockResolvedValue();
    await clearHistory();
    expect(storage.saveSession).toHaveBeenCalledWith('__history__', { entries: [] });
  });

  test('getHistoryForSession filters by session name', async () => {
    storage.loadSession.mockResolvedValue({
      entries: [
        { action: 'create', sessionName: 'work', timestamp: '' },
        { action: 'delete', sessionName: 'home', timestamp: '' },
      ],
    });
    const result = await getHistoryForSession('work');
    expect(result).toHaveLength(1);
    expect(result[0].sessionName).toBe('work');
  });
});
