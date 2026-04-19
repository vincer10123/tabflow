const { mergeSessions, mergeAllSessions } = require('./merge');
const { getSession, getAllSessions } = require('./sessions');
const { saveSession } = require('./storage');

jest.mock('./sessions');
jest.mock('./storage');

const sessionA = {
  name: 'work',
  tabs: [
    { url: 'https://github.com', title: 'GitHub' },
    { url: 'https://notion.so', title: 'Notion' },
  ],
};

const sessionB = {
  name: 'research',
  tabs: [
    { url: 'https://notion.so', title: 'Notion' },
    { url: 'https://wikipedia.org', title: 'Wikipedia' },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  getSession.mockImplementation((name) => {
    if (name === 'work') return Promise.resolve(sessionA);
    if (name === 'research') return Promise.resolve(sessionB);
    return Promise.resolve(null);
  });
  saveSession.mockResolvedValue(true);
});

test('merges two sessions into one', async () => {
  const result = await mergeSessions(['work', 'research'], 'combined');
  expect(result.name).toBe('combined');
  expect(result.tabs).toHaveLength(3 + 1); // 4 total with dupe
  expect(result.mergedFrom).toEqual(['work', 'research']);
  expect(saveSession).toHaveBeenCalledWith('combined', expect.objectContaining({ name: 'combined' }));
});

test('merges with dedupe removes duplicate urls', async () => {
  const result = await mergeSessions(['work', 'research'], 'combined', { dedupe: true });
  const urls = result.tabs.map((t) => t.url);
  const unique = new Set(urls);
  expect(urls.length).toBe(unique.size);
  expect(result.tabs).toHaveLength(3);
});

test('throws if fewer than two sessions provided', async () => {
  await expect(mergeSessions(['work'], 'combined')).rejects.toThrow('At least two');
});

test('throws if a session is not found', async () => {
  await expect(mergeSessions(['work', 'missing'], 'combined')).rejects.toThrow('Session not found: missing');
});

test('mergeAllSessions merges all sessions', async () => {
  getAllSessions.mockResolvedValue([sessionA, sessionB]);
  const result = await mergeAllSessions('everything');
  expect(result.name).toBe('everything');
});

test('mergeAllSessions throws if fewer than two sessions exist', async () => {
  getAllSessions.mockResolvedValue([sessionA]);
  await expect(mergeAllSessions('everything')).rejects.toThrow('Need at least two');
});
