const { setAlias, removeAlias, resolveAlias, listAliases, getAliasesForSession } = require('./alias');
const storage = require('./storage');

jest.mock('./storage');

const makeStore = (initial = {}) => {
  let store = { aliases: { ...initial } };
  storage.loadSession.mockImplementation(async () => store);
  storage.saveSession.mockImplementation(async (_, data) => { store = data; });
  return () => store;
};

beforeEach(() => jest.clearAllMocks());

test('setAlias stores a new alias', async () => {
  const getStore = makeStore();
  await setAlias('work', 'work-session');
  expect(getStore().aliases['work']).toBe('work-session');
});

test('setAlias rejects invalid alias characters', async () => {
  makeStore();
  await expect(setAlias('bad alias!', 'session')).rejects.toThrow('alphanumeric');
});

test('setAlias requires both arguments', async () => {
  makeStore();
  await expect(setAlias('', 'session')).rejects.toThrow('required');
  await expect(setAlias('a', '')).rejects.toThrow('required');
});

test('removeAlias deletes an existing alias', async () => {
  const getStore = makeStore({ work: 'work-session' });
  await removeAlias('work');
  expect(getStore().aliases['work']).toBeUndefined();
});

test('removeAlias throws for unknown alias', async () => {
  makeStore();
  await expect(removeAlias('nope')).rejects.toThrow('not found');
});

test('resolveAlias returns session name for known alias', async () => {
  makeStore({ wk: 'work-session' });
  const result = await resolveAlias('wk');
  expect(result).toBe('work-session');
});

test('resolveAlias returns input unchanged if not an alias', async () => {
  makeStore({ wk: 'work-session' });
  const result = await resolveAlias('other-session');
  expect(result).toBe('other-session');
});

test('listAliases returns all aliases', async () => {
  makeStore({ a: 'alpha', b: 'beta' });
  const result = await listAliases();
  expect(result).toEqual({ a: 'alpha', b: 'beta' });
});

test('getAliasesForSession returns aliases pointing to session', async () => {
  makeStore({ x: 'my-session', y: 'other', z: 'my-session' });
  const result = await getAliasesForSession('my-session');
  expect(result.sort()).toEqual(['x', 'z']);
});

test('getAliasesForSession returns empty array if none match', async () => {
  makeStore({ x: 'other' });
  const result = await getAliasesForSession('my-session');
  expect(result).toEqual([]);
});
