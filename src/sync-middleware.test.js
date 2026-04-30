const { withSyncStamp, withSyncConflictWarning, applySyncMiddleware } = require('./sync-middleware');

describe('withSyncStamp', () => {
  it('adds updatedAt timestamp to session before saving', async () => {
    const save = jest.fn().mockResolvedValue(true);
    const wrapped = withSyncStamp(save);
    const before = Date.now();
    await wrapped('mySession', { tabs: [] });
    const after = Date.now();
    const saved = save.mock.calls[0][1];
    expect(saved.updatedAt).toBeGreaterThanOrEqual(before);
    expect(saved.updatedAt).toBeLessThanOrEqual(after);
  });

  it('preserves existing session fields', async () => {
    const save = jest.fn().mockResolvedValue(true);
    const wrapped = withSyncStamp(save);
    await wrapped('s', { tabs: [{ url: 'http://a.com' }] });
    expect(save.mock.calls[0][1].tabs[0].url).toBe('http://a.com');
  });
});

describe('withSyncConflictWarning', () => {
  it('warns when disk version is newer', async () => {
    const save = jest.fn().mockResolvedValue(true);
    const load = jest.fn().mockResolvedValue({ updatedAt: 9999999 });
    const wrapped = withSyncConflictWarning(save, load);
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await wrapped('s', { tabs: [], updatedAt: 1 });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('newer'));
    spy.mockRestore();
  });

  it('does not warn when incoming session is up to date', async () => {
    const save = jest.fn().mockResolvedValue(true);
    const load = jest.fn().mockResolvedValue({ updatedAt: 100 });
    const wrapped = withSyncConflictWarning(save, load);
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await wrapped('s', { tabs: [], updatedAt: 999 });
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('does not throw if no existing session found', async () => {
    const save = jest.fn().mockResolvedValue(true);
    const load = jest.fn().mockRejectedValue(new Error('not found'));
    const wrapped = withSyncConflictWarning(save, load);
    await expect(wrapped('s', { tabs: [] })).resolves.toBe(true);
  });
});

describe('applySyncMiddleware', () => {
  it('composes stamp and conflict warning', async () => {
    const save = jest.fn().mockResolvedValue(true);
    const load = jest.fn().mockRejectedValue(new Error('none'));
    const wrapped = applySyncMiddleware(save, load);
    await wrapped('s', { tabs: [] });
    expect(save.mock.calls[0][1].updatedAt).toBeDefined();
  });
});
