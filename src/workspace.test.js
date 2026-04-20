const {
  createWorkspace,
  saveWorkspace,
  loadWorkspace,
  listWorkspaces,
  addSessionToWorkspace,
  removeSessionFromWorkspace,
} = require('./workspace');

jest.mock('./storage', () => ({
  saveSession: jest.fn(),
  loadSession: jest.fn(),
}));

jest.mock('./sessions', () => ({
  getAllSessions: jest.fn(),
}));

const { saveSession, loadSession } = require('./storage');
const { getAllSessions } = require('./sessions');

beforeEach(() => jest.clearAllMocks());

test('createWorkspace returns correct shape', () => {
  const ws = createWorkspace('dev', ['session1', 'session2']);
  expect(ws.name).toBe('dev');
  expect(ws.type).toBe('workspace');
  expect(ws.sessionNames).toEqual(['session1', 'session2']);
  expect(ws.createdAt).toBeDefined();
});

test('saveWorkspace stores with prefixed key', async () => {
  saveSession.mockResolvedValue();
  const ws = await saveWorkspace('dev', ['s1']);
  expect(saveSession).toHaveBeenCalledWith('workspace::dev', expect.objectContaining({ name: 'dev', type: 'workspace' }));
  expect(ws.sessionNames).toEqual(['s1']);
});

test('loadWorkspace returns workspace data', async () => {
  loadSession.mockResolvedValue({ name: 'workspace::dev', type: 'workspace', sessionNames: ['s1'] });
  const ws = await loadWorkspace('dev');
  expect(ws.sessionNames).toEqual(['s1']);
});

test('loadWorkspace throws if not found', async () => {
  loadSession.mockResolvedValue(null);
  await expect(loadWorkspace('missing')).rejects.toThrow('not found');
});

test('listWorkspaces filters workspace sessions', async () => {
  getAllSessions.mockResolvedValue([
    { name: 'workspace::dev', type: 'workspace', sessionNames: [] },
    { name: 'regular-session', type: undefined, sessionNames: [] },
  ]);
  const list = await listWorkspaces();
  expect(list).toHaveLength(1);
  expect(list[0].displayName).toBe('dev');
});

test('addSessionToWorkspace appends session', async () => {
  const ws = { name: 'workspace::dev', type: 'workspace', sessionNames: ['s1'], updatedAt: '' };
  loadSession.mockResolvedValue(ws);
  saveSession.mockResolvedValue();
  const updated = await addSessionToWorkspace('dev', 's2');
  expect(updated.sessionNames).toContain('s2');
});

test('removeSessionFromWorkspace removes session', async () => {
  const ws = { name: 'workspace::dev', type: 'workspace', sessionNames: ['s1', 's2'], updatedAt: '' };
  loadSession.mockResolvedValue(ws);
  saveSession.mockResolvedValue();
  const updated = await removeSessionFromWorkspace('dev', 's1');
  expect(updated.sessionNames).not.toContain('s1');
});
