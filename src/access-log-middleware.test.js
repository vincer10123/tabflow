const { withAccessLog, withWriteLog, applyAccessLogging } = require('./access-log-middleware');
const { getAccessCount, getLastAccessed, getAccessHistory } = require('./access-log');

jest.mock('./storage', () => ({
  saveSession: jest.fn(async s => s),
  loadSession: jest.fn(),
}));

const { saveSession } = require('./storage');

const makeSession = (name) => ({ name, tabs: [] });

beforeEach(() => jest.clearAllMocks());

describe('withAccessLog', () => {
  it('records access on the returned session', async () => {
    const fn = jest.fn(async () => makeSession('work'));
    const wrapped = withAccessLog(fn, 'restore');
    const result = await wrapped('work');
    expect(getAccessCount(result)).toBe(1);
    expect(getAccessHistory(result)[0].action).toBe('restore');
  });

  it('saves the updated session with access log', async () => {
    const fn = jest.fn(async () => makeSession('work'));
    const wrapped = withAccessLog(fn, 'view');
    await wrapped('work');
    expect(saveSession).toHaveBeenCalledTimes(1);
  });

  it('returns null if inner fn returns null', async () => {
    const fn = jest.fn(async () => null);
    const wrapped = withAccessLog(fn, 'view');
    const result = await wrapped('missing');
    expect(result).toBeNull();
    expect(saveSession).not.toHaveBeenCalled();
  });

  it('passes args through to the wrapped function', async () => {
    const fn = jest.fn(async (name, extra) => ({ name, extra, tabs: [] }));
    const wrapped = withAccessLog(fn, 'view');
    await wrapped('work', 'bonus');
    expect(fn).toHaveBeenCalledWith('work', 'bonus');
  });
});

describe('withWriteLog', () => {
  it('records a write action on the result', async () => {
    const fn = jest.fn(async (session) => ({ ...session, tabs: [{ url: 'https://a.com' }] }));
    const wrapped = withWriteLog(fn);
    const result = await wrapped(makeSession('work'));
    expect(getAccessHistory(result)[0].action).toBe('write');
  });

  it('returns null if inner fn returns null', async () => {
    const fn = jest.fn(async () => null);
    const wrapped = withWriteLog(fn);
    const result = await wrapped(makeSession('work'));
    expect(result).toBeNull();
  });
});

describe('applyAccessLogging', () => {
  it('wraps all provided ops with access logging', async () => {
    const getSession = jest.fn(async () => makeSession('work'));
    const ops = { getSession: { fn: getSession, action: 'view' } };
    const wrapped = applyAccessLogging(ops);
    const result = await wrapped.getSession('work');
    expect(getAccessCount(result)).toBe(1);
  });
});
