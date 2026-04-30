const { withAutoStash, applyAutoStash } = require('./stash-middleware');
const storage = require('./storage');
const stash = require('./stash');

jest.mock('./storage');
jest.mock('./stash');

beforeEach(() => jest.clearAllMocks());

const tab = (url) => ({ url, title: url });

test('withAutoStash stashes tabs before calling fn', () => {
  storage.loadSession.mockReturnValue({ tabs: [tab('a.com'), tab('b.com')] });
  stash.stashTabs.mockReturnValue({ stashName: 'x', count: 2 });

  const fn = jest.fn().mockReturnValue('done');
  const wrapped = withAutoStash(fn, 'pre');
  const result = wrapped('work', 'extra');

  expect(stash.stashTabs).toHaveBeenCalledWith('work', [0, 1], expect.stringContaining('pre-work'));
  expect(fn).toHaveBeenCalledWith('work', 'extra');
  expect(result).toBe('done');
});

test('withAutoStash skips stash if session has no tabs', () => {
  storage.loadSession.mockReturnValue({ tabs: [] });
  const fn = jest.fn();
  withAutoStash(fn)('work');
  expect(stash.stashTabs).not.toHaveBeenCalled();
  expect(fn).toHaveBeenCalled();
});

test('withAutoStash skips stash if session not found', () => {
  storage.loadSession.mockReturnValue(null);
  const fn = jest.fn();
  withAutoStash(fn)('missing');
  expect(stash.stashTabs).not.toHaveBeenCalled();
  expect(fn).toHaveBeenCalled();
});

test('withAutoStash does not throw if stashTabs fails', () => {
  storage.loadSession.mockReturnValue({ tabs: [tab('a.com')] });
  stash.stashTabs.mockImplementation(() => { throw new Error('disk full'); });
  const fn = jest.fn().mockReturnValue('ok');
  expect(() => withAutoStash(fn)('work')).not.toThrow();
  expect(fn).toHaveBeenCalled();
});

test('applyAutoStash wraps only listed functions', () => {
  storage.loadSession.mockReturnValue({ tabs: [] });
  const remove = jest.fn();
  const rename = jest.fn();
  const fns = { remove, rename };

  const wrapped = applyAutoStash(fns, ['remove']);
  wrapped.remove('work');
  wrapped.rename('work', 'new');

  // remove was wrapped (withAutoStash path), rename was not
  expect(rename).toHaveBeenCalledWith('work', 'new');
  expect(remove).toHaveBeenCalledWith('work');
});

test('applyAutoStash ignores unknown targets gracefully', () => {
  const fns = { save: jest.fn() };
  const wrapped = applyAutoStash(fns, ['nonexistent']);
  expect(wrapped.save).toBe(fns.save);
});
