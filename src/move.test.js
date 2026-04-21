const { moveTab, moveTabs } = require('./move');
const { getSession } = require('./sessions');
const { saveSession } = require('./storage');

jest.mock('./sessions');
jest.mock('./storage');

const makeSession = (name, tabs) => ({ name, tabs, updatedAt: '2024-01-01' });

beforeEach(() => {
  jest.clearAllMocks();
  saveSession.mockResolvedValue(undefined);
});

describe('moveTab', () => {
  it('moves a tab from one session to another', async () => {
    const from = makeSession('work', [
      { url: 'https://a.com', title: 'A' },
      { url: 'https://b.com', title: 'B' },
    ]);
    const to = makeSession('personal', [{ url: 'https://c.com', title: 'C' }]);

    getSession.mockImplementation((name) =>
      Promise.resolve(name === 'work' ? from : to)
    );

    const result = await moveTab('work', 0, 'personal');

    expect(result.tab.url).toBe('https://a.com');
    expect(result.fromSession.tabs).toHaveLength(1);
    expect(result.toSession.tabs).toHaveLength(2);
    expect(saveSession).toHaveBeenCalledTimes(2);
  });

  it('throws if source session not found', async () => {
    getSession.mockResolvedValue(null);
    await expect(moveTab('ghost', 0, 'personal')).rejects.toThrow('Session not found: ghost');
  });

  it('throws if tab index out of range', async () => {
    const from = makeSession('work', [{ url: 'https://a.com', title: 'A' }]);
    const to = makeSession('personal', []);
    getSession.mockImplementation((name) =>
      Promise.resolve(name === 'work' ? from : to)
    );
    await expect(moveTab('work', 5, 'personal')).rejects.toThrow('out of range');
  });
});

describe('moveTabs', () => {
  it('moves multiple tabs at once', async () => {
    const from = makeSession('work', [
      { url: 'https://a.com', title: 'A' },
      { url: 'https://b.com', title: 'B' },
      { url: 'https://c.com', title: 'C' },
    ]);
    const to = makeSession('personal', []);

    getSession.mockImplementation((name) =>
      Promise.resolve(name === 'work' ? from : to)
    );

    const result = await moveTabs('work', [0, 2], 'personal');

    expect(result.moved).toHaveLength(2);
    expect(result.fromSession.tabs).toHaveLength(1);
    expect(result.fromSession.tabs[0].url).toBe('https://b.com');
    expect(result.toSession.tabs).toHaveLength(2);
  });

  it('deduplicates indices before moving', async () => {
    const from = makeSession('work', [
      { url: 'https://a.com', title: 'A' },
      { url: 'https://b.com', title: 'B' },
    ]);
    const to = makeSession('personal', []);
    getSession.mockImplementation((name) =>
      Promise.resolve(name === 'work' ? from : to)
    );
    const result = await moveTabs('work', [0, 0, 1], 'personal');
    expect(result.moved).toHaveLength(2);
  });
});
