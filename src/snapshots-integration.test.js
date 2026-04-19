const { takeSnapshot, listSnapshots, restoreSnapshot, pruneSnapshots } = require('./snapshots');
const storage = require('./storage');

jest.mock('./storage');

const session = { tabs: [{ url: 'https://a.com', title: 'A' }], name: 'dev' };

beforeEach(() => jest.clearAllMocks());

test('full snapshot lifecycle', async () => {
  storage.saveSession.mockResolvedValue();
  storage.loadSession.mockImplementation(async (name) => ({ ...session, snapshotOf: 'dev', takenAt: '2024-01-01' }));
  storage.listSessions.mockResolvedValue([]);
  storage.deleteSession.mockResolvedValue();

  const snapName = await takeSnapshot('dev', session);
  expect(snapName).toMatch(/^snapshot__dev__/);

  storage.listSessions.mockResolvedValue([snapName]);
  const list = await listSnapshots('dev');
  expect(list).toContain(snapName);

  const restored = await restoreSnapshot(snapName);
  expect(restored.snapshotOf).toBe('dev');
});

test('prune keeps correct number', async () => {
  const names = Array.from({ length: 7 }, (_, i) => `snapshot__dev__${1000 + i}`);
  storage.listSessions.mockResolvedValue(names);
  storage.deleteSession.mockResolvedValue();

  const deleted = await pruneSnapshots('dev', 3);
  expect(deleted).toHaveLength(4);
});
