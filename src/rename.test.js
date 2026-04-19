const { renameSession, sessionExists } = require('./rename');
const storage = require('./storage');

jest.mock('./storage');

describe('renameSession', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renames a session successfully', async () => {
    storage.listSessions.mockResolvedValue(['work', 'personal']);
    storage.loadSession.mockResolvedValue({ name: 'work', tabs: [] });
    storage.saveSession.mockResolvedValue();
    storage.deleteSession.mockResolvedValue();

    const result = await renameSession('work', 'work-backup');
    expect(result.name).toBe('work-backup');
    expect(storage.saveSession).toHaveBeenCalledWith('work-backup', expect.objectContaining({ name: 'work-backup' }));
    expect(storage.deleteSession).toHaveBeenCalledWith('work');
  });

  it('throws if old session not found', async () => {
    storage.listSessions.mockResolvedValue(['personal']);
    await expect(renameSession('work', 'work-backup')).rejects.toThrow('not found');
  });

  it('throws if new name already exists', async () => {
    storage.listSessions.mockResolvedValue(['work', 'personal']);
    await expect(renameSession('work', 'personal')).rejects.toThrow('already exists');
  });

  it('throws if names are the same', async () => {
    storage.listSessions.mockResolvedValue(['work']);
    await expect(renameSession('work', 'work')).rejects.toThrow('different');
  });

  it('throws if names are missing', async () => {
    await expect(renameSession('', 'new')).rejects.toThrow('required');
  });
});

describe('sessionExists', () => {
  it('returns true if session exists', async () => {
    storage.listSessions.mockResolvedValue(['work']);
    expect(await sessionExists('work')).toBe(true);
  });

  it('returns false if session does not exist', async () => {
    storage.listSessions.mockResolvedValue(['work']);
    expect(await sessionExists('other')).toBe(false);
  });
});
