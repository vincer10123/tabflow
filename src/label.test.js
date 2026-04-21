const { addLabel, removeLabel, getLabels, filterByLabel, groupByLabel } = require('./label');
const { loadSession, saveSession } = require('./storage');

jest.mock('./storage');

const makeSession = (name, labels = []) => ({ name, tabs: [], labels });

beforeEach(() => jest.clearAllMocks());

test('addLabel adds a new label to a session', async () => {
  const session = makeSession('work');
  loadSession.mockResolvedValue(session);
  saveSession.mockResolvedValue();
  const result = await addLabel('work', 'important');
  expect(result).toContain('important');
  expect(saveSession).toHaveBeenCalled();
});

test('addLabel normalizes label to lowercase', async () => {
  const session = makeSession('work');
  loadSession.mockResolvedValue(session);
  saveSession.mockResolvedValue();
  const result = await addLabel('work', 'URGENT');
  expect(result).toContain('urgent');
});

test('addLabel does not duplicate existing label', async () => {
  const session = makeSession('work', ['important']);
  loadSession.mockResolvedValue(session);
  saveSession.mockResolvedValue();
  const result = await addLabel('work', 'important');
  expect(result.filter(l => l === 'important').length).toBe(1);
  expect(saveSession).not.toHaveBeenCalled();
});

test('removeLabel removes an existing label', async () => {
  const session = makeSession('work', ['important', 'review']);
  loadSession.mockResolvedValue(session);
  saveSession.mockResolvedValue();
  const result = await removeLabel('work', 'important');
  expect(result).not.toContain('important');
  expect(result).toContain('review');
});

test('getLabels returns labels for a session', async () => {
  const session = makeSession('work', ['dev', 'research']);
  loadSession.mockResolvedValue(session);
  const labels = await getLabels('work');
  expect(labels).toEqual(['dev', 'research']);
});

test('getLabels returns empty array if no labels', async () => {
  loadSession.mockResolvedValue(makeSession('empty'));
  const labels = await getLabels('empty');
  expect(labels).toEqual([]);
});

test('filterByLabel returns sessions matching label', async () => {
  const sessions = [
    makeSession('a', ['work']),
    makeSession('b', ['personal']),
    makeSession('c', ['work', 'urgent']),
  ];
  const result = await filterByLabel(sessions, 'work');
  expect(result.map(s => s.name)).toEqual(['a', 'c']);
});

test('groupByLabel groups sessions by their labels', async () => {
  const sessions = [
    makeSession('a', ['work']),
    makeSession('b', ['personal']),
    makeSession('c', ['work']),
  ];
  const groups = await groupByLabel(sessions);
  expect(groups['work'].length).toBe(2);
  expect(groups['personal'].length).toBe(1);
});

test('groupByLabel puts unlabeled sessions under unlabeled key', async () => {
  const sessions = [makeSession('a')];
  const groups = await groupByLabel(sessions);
  expect(groups['unlabeled'].length).toBe(1);
});
