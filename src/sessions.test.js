const { createSession, getSession, getAllSessions, removeSession } = require('./sessions');
const storage = require('./storage');

jest.mock('./storage');

const mockTabs = [
  { url: 'https://example.com', title: 'Example' },
  { url: 'https://github.com' },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('createSession', () => {
  it('saves and returns a valid session', () => {
    const session = createSession('work', mockTabs);
    expect(session.name).toBe('work');
    expect(session.tabs).toHaveLength(2);
    expect(session.tabs[1].title).toBe('https://github.com');
    expect(storage.saveSession).toHaveBeenCalledWith('work', expect.objectContaining({ name: 'work' }));
  });

  it('throws on empty name', () => {
    expect(() => createSession('', mockTabs)).toThrow('non-empty string');
  });

  it('throws on empty tabs array', () => {
    expect(() => createSession('work', [])).toThrow('non-empty array');
  });

  it('throws if a tab has no url', () => {
    expect(() => createSession('work', [{ title: 'No URL' }])).toThrow('missing a url');
  });
});

describe('getSession', () => {
  it('returns session if found', () => {
    storage.loadSession.mockReturnValue({ name: 'work', tabs: mockTabs });
    const session = getSession('work');
    expect(session.name).toBe('work');
  });

  it('throws if session not found', () => {
    storage.loadSession.mockReturnValue(null);
    expect(() => getSession('missing')).toThrow('not found');
  });
});

describe('getAllSessions', () => {
  it('returns summary list of sessions', () => {
    storage.listSessions.mockReturnValue(['work', 'personal']);
    storage.loadSession.mockReturnValue({ tabs: mockTabs, createdAt: '2024-01-01T00:00:00.000Z' });
    const all = getAllSessions();
    expect(all).toHaveLength(2);
    expect(all[0]).toMatchObject({ name: 'work', tabCount: 2 });
  });
});

describe('removeSession', () => {
  it('deletes an existing session', () => {
    storage.loadSession.mockReturnValue({ name: 'work', tabs: mockTabs });
    removeSession('work');
    expect(storage.deleteSession).toHaveBeenCalledWith('work');
  });

  it('throws if session does not exist', () => {
    storage.loadSession.mockReturnValue(null);
    expect(() => removeSession('ghost')).toThrow('not found');
  });
});
