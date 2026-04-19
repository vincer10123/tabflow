const { takeSnapshot, listSnapshots, restoreSnapshot, deleteSnapshot, pruneSnapshots } = require('./snapshots');
const storage = require('./storage');

jest.mock('./storage');

const mockSession = { tabs: [{ url: 'https://example.com', title: 'Example' }] };

beforeEach(() => jest.clearAllMocks());

test('takeSnapshot saves with prefixed name', async () => {
  storage.saveSession.mockResolvedValue();
  const name = await takeSnapshot('work', mockSession);
  expect(name).toMatch(/^snapshot__work__/);
  expect(storage.saveSession).toHaveBeenCalledWith(name, expect.objectContaining({ snapshotOf: 'work' }));
});

test('listSnapshots returns only matching snapshots', async () => {
  storage.listSessions.mockResolvedValue(['snapshot__work__1', 'snapshot__work__2', 'snapshot__home__1']);
  const result = await listSnapshots('work');
  expect(result).toEqual(['snapshot__work__1', 'snapshot__work__2']);
});

test('restoreSnapshot loads snapshot data', async () => {
  storage.loadSession.mockResolvedValue({ ...mockSession, snapshotOf: 'work' });
  const result = await restoreSnapshot('snapshot__work__1');
  expect(result.snapshotOf).toBe('work');
});

test('restoreSnapshot throws if not found', async () => {
  storage.loadSession.mockResolvedValue(null);
  await expect(restoreSnapshot('missing')).rejects.toThrow('Snapshot not found');
});

test('pruneSnapshots deletes oldest beyond keepLast', async () => {
  storage.listSessions.mockResolvedValue(['snapshot__work__1', 'snapshot__work__2', 'snapshot__work__3', 'snapshot__work__4']);
  storage.deleteSession.mockResolvedValue();
  const deleted = await pruneSnapshots('work', 2);
  expect(deleted).toHaveLength(2);
  expect(storage.deleteSession).toHaveBeenCalledTimes(2);
});
