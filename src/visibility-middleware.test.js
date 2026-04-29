const {
  withVisibilityFilter,
  withHiddenWarning,
  applyVisibilityMiddleware
} = require('./visibility-middleware');

const allSessions = {
  work: { name: 'work', tabs: [] },
  hidden: { name: 'hidden', tabs: [], hidden: true }
};

const mockGetAll = jest.fn().mockResolvedValue(allSessions);
const mockGetOne = jest.fn();

beforeEach(() => jest.clearAllMocks());

test('withVisibilityFilter hides hidden sessions by default', async () => {
  const wrapped = withVisibilityFilter(mockGetAll);
  const result = await wrapped();
  expect(Object.keys(result)).toEqual(['work']);
});

test('withVisibilityFilter includes hidden sessions when opted in', async () => {
  const wrapped = withVisibilityFilter(mockGetAll);
  const result = await wrapped({ includeHidden: true });
  expect(Object.keys(result)).toContain('hidden');
});

test('withHiddenWarning throws for hidden session', async () => {
  mockGetOne.mockResolvedValue({ name: 'hidden', hidden: true });
  const wrapped = withHiddenWarning(mockGetOne);
  await expect(wrapped('hidden')).rejects.toThrow('SESSION_HIDDEN');
});

test('withHiddenWarning allows hidden session with includeHidden', async () => {
  mockGetOne.mockResolvedValue({ name: 'hidden', hidden: true });
  const wrapped = withHiddenWarning(mockGetOne);
  const result = await wrapped('hidden', { includeHidden: true });
  expect(result.name).toBe('hidden');
});

test('withHiddenWarning passes through normal sessions', async () => {
  mockGetOne.mockResolvedValue({ name: 'work', tabs: [] });
  const wrapped = withHiddenWarning(mockGetOne);
  const result = await wrapped('work');
  expect(result.name).toBe('work');
});

test('applyVisibilityMiddleware wraps both functions', async () => {
  const fns = { getAllSessions: mockGetAll, getSession: mockGetOne, other: jest.fn() };
  mockGetOne.mockResolvedValue({ name: 'work' });
  const wrapped = applyVisibilityMiddleware(fns);
  expect(wrapped.other).toBe(fns.other);
  const sessions = await wrapped.getAllSessions();
  expect(Object.keys(sessions)).not.toContain('hidden');
});
