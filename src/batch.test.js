const { batchTransform, batchDelete, batchAddTag, batchRemoveTag, batchTransformWhere } = require('./batch');

jest.mock('./sessions');
jest.mock('./storage');

const { getSession, getAllSessions, removeSession } = require('./sessions');
const { saveSession } = require('./storage');

const makeSession = (name, tags = []) => ({ name, tags, tabs: [] });

beforeEach(() => jest.clearAllMocks());

test('batchTransform applies fn and saves each session', async () => {
  getSession.mockResolvedValueOnce(makeSession('work')).mockResolvedValueOnce(makeSession('home'));
  saveSession.mockResolvedValue();

  const results = await batchTransform(['work', 'home'], (s) => ({ ...s, touched: true }));

  expect(results).toEqual([
    { name: 'work', success: true },
    { name: 'home', success: true },
  ]);
  expect(saveSession).toHaveBeenCalledTimes(2);
});

test('batchTransform records error when session not found', async () => {
  getSession.mockResolvedValue(null);

  const results = await batchTransform(['ghost'], (s) => s);

  expect(results[0]).toEqual({ name: 'ghost', success: false, error: 'Session not found' });
  expect(saveSession).not.toHaveBeenCalled();
});

test('batchDelete removes each session', async () => {
  removeSession.mockResolvedValue();

  const results = await batchDelete(['a', 'b']);

  expect(results).toEqual([
    { name: 'a', success: true },
    { name: 'b', success: true },
  ]);
  expect(removeSession).toHaveBeenCalledTimes(2);
});

test('batchDelete captures errors', async () => {
  removeSession.mockRejectedValue(new Error('disk error'));

  const results = await batchDelete(['broken']);

  expect(results[0]).toEqual({ name: 'broken', success: false, error: 'disk error' });
});

test('batchAddTag adds tag to sessions', async () => {
  getSession.mockResolvedValue(makeSession('work', ['old']));
  saveSession.mockResolvedValue();

  await batchAddTag(['work'], 'new-tag');

  const saved = saveSession.mock.calls[0][1];
  expect(saved.tags).toContain('new-tag');
  expect(saved.tags).toContain('old');
});

test('batchRemoveTag removes tag from sessions', async () => {
  getSession.mockResolvedValue(makeSession('work', ['keep', 'remove-me']));
  saveSession.mockResolvedValue();

  await batchRemoveTag(['work'], 'remove-me');

  const saved = saveSession.mock.calls[0][1];
  expect(saved.tags).not.toContain('remove-me');
  expect(saved.tags).toContain('keep');
});

test('batchTransformWhere filters and transforms matching sessions', async () => {
  getAllSessions.mockResolvedValue([makeSession('a', ['x']), makeSession('b', []), makeSession('c', ['x'])]);
  getSession.mockImplementation((name) => Promise.resolve(makeSession(name, ['x'])));
  saveSession.mockResolvedValue();

  const results = await batchTransformWhere((s) => s.tags.includes('x'), (s) => s);

  expect(results.map((r) => r.name)).toEqual(['a', 'c']);
});
