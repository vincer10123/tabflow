const quota = require('./quota');
const storage = require('./storage');

jest.mock('./storage');

const QUOTA_KEY = '__quota__';

beforeEach(() => jest.clearAllMocks());

test('getQuota returns defaults when nothing stored', async () => {
  storage.loadSession.mockRejectedValue(new Error('not found'));
  const q = await quota.getQuota();
  expect(q).toEqual({ maxSessions: null, maxTabsPerSession: null });
});

test('setQuota saves and returns updated quota', async () => {
  storage.loadSession.mockResolvedValue({ maxSessions: null, maxTabsPerSession: null });
  storage.saveSession.mockResolvedValue();
  const result = await quota.setQuota({ maxSessions: 10 });
  expect(result.maxSessions).toBe(10);
  expect(storage.saveSession).toHaveBeenCalledWith(QUOTA_KEY, expect.objectContaining({ maxSessions: 10 }));
});

test('clearQuota resets to defaults', async () => {
  storage.saveSession.mockResolvedValue();
  const result = await quota.clearQuota();
  expect(result).toEqual({ maxSessions: null, maxTabsPerSession: null });
});

test('checkSessionQuota allows when under limit', async () => {
  storage.loadSession.mockResolvedValue({ maxSessions: 5, maxTabsPerSession: null });
  const result = await quota.checkSessionQuota([{}, {}, {}]);
  expect(result.allowed).toBe(true);
  expect(result.current).toBe(3);
  expect(result.limit).toBe(5);
});

test('checkSessionQuota blocks when at limit', async () => {
  storage.loadSession.mockResolvedValue({ maxSessions: 3, maxTabsPerSession: null });
  const result = await quota.checkSessionQuota([{}, {}, {}]);
  expect(result.allowed).toBe(false);
});

test('checkTabQuota allows when no limit set', async () => {
  storage.loadSession.mockResolvedValue({ maxSessions: null, maxTabsPerSession: null });
  const session = { name: 'work', tabs: [{ url: 'a' }, { url: 'b' }] };
  const result = await quota.checkTabQuota(session);
  expect(result.allowed).toBe(true);
  expect(result.limit).toBeNull();
});

test('checkTabQuota blocks when tabs exceed limit', async () => {
  storage.loadSession.mockResolvedValue({ maxSessions: null, maxTabsPerSession: 2 });
  const session = { name: 'work', tabs: [{ url: 'a' }, { url: 'b' }] };
  const result = await quota.checkTabQuota(session);
  expect(result.allowed).toBe(false);
});

test('guardSessionQuota throws when over limit', async () => {
  storage.loadSession.mockResolvedValue({ maxSessions: 2, maxTabsPerSession: null });
  await expect(quota.guardSessionQuota([{}, {}])).rejects.toThrow('Session quota reached');
});

test('guardTabQuota throws when over limit', async () => {
  storage.loadSession.mockResolvedValue({ maxSessions: null, maxTabsPerSession: 1 });
  const session = { name: 'test', tabs: [{ url: 'a' }] };
  await expect(quota.guardTabQuota(session)).rejects.toThrow('Tab quota reached');
});
