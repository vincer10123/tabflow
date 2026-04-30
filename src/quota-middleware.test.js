const { withSessionQuota, withTabQuota, applyQuotaMiddleware } = require('./quota-middleware');
const quotaModule = require('./quota');
const sessions = require('./sessions');

jest.mock('./quota');
jest.mock('./sessions');

beforeEach(() => jest.clearAllMocks());

test('withSessionQuota calls guardSessionQuota before fn', async () => {
  sessions.getAllSessions.mockResolvedValue([{}, {}]);
  quotaModule.guardSessionQuota.mockResolvedValue();
  const fn = jest.fn().mockResolvedValue({ name: 'new' });
  const wrapped = withSessionQuota(fn);
  await wrapped('new', []);
  expect(quotaModule.guardSessionQuota).toHaveBeenCalledWith([{}, {}]);
  expect(fn).toHaveBeenCalledWith('new', []);
});

test('withSessionQuota throws if quota exceeded', async () => {
  sessions.getAllSessions.mockResolvedValue([{}, {}, {}]);
  quotaModule.guardSessionQuota.mockRejectedValue(new Error('Session quota reached: 3/3 sessions'));
  const fn = jest.fn();
  const wrapped = withSessionQuota(fn);
  await expect(wrapped('new', [])).rejects.toThrow('Session quota reached');
  expect(fn).not.toHaveBeenCalled();
});

test('withTabQuota calls guardTabQuota before fn', async () => {
  const session = { name: 'work', tabs: [] };
  quotaModule.guardTabQuota.mockResolvedValue();
  const fn = jest.fn().mockResolvedValue(session);
  const wrapped = withTabQuota(fn);
  await wrapped(session, { url: 'https://example.com' });
  expect(quotaModule.guardTabQuota).toHaveBeenCalledWith(session);
  expect(fn).toHaveBeenCalledWith(session, { url: 'https://example.com' });
});

test('withTabQuota throws if tab quota exceeded', async () => {
  const session = { name: 'work', tabs: [{ url: 'a' }, { url: 'b' }] };
  quotaModule.guardTabQuota.mockRejectedValue(new Error('Tab quota reached'));
  const fn = jest.fn();
  const wrapped = withTabQuota(fn);
  await expect(wrapped(session, { url: 'c' })).rejects.toThrow('Tab quota reached');
  expect(fn).not.toHaveBeenCalled();
});

test('applyQuotaMiddleware wraps createSession and addTab', async () => {
  sessions.getAllSessions.mockResolvedValue([]);
  quotaModule.guardSessionQuota.mockResolvedValue();
  quotaModule.guardTabQuota.mockResolvedValue();

  const api = {
    createSession: jest.fn().mockResolvedValue({ name: 'x' }),
    addTab: jest.fn().mockResolvedValue({}),
    removeSession: jest.fn(),
  };

  const wrapped = applyQuotaMiddleware(api);
  expect(wrapped.createSession).not.toBe(api.createSession);
  expect(wrapped.addTab).not.toBe(api.addTab);
  expect(wrapped.removeSession).toBe(api.removeSession);

  await wrapped.createSession('x', []);
  expect(api.createSession).toHaveBeenCalled();

  const session = { name: 'x', tabs: [] };
  await wrapped.addTab(session, { url: 'u' });
  expect(api.addTab).toHaveBeenCalled();
});
