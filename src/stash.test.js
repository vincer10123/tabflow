const { stashTabs, popStash, listStashes, dropStash, peekStash } = require('./stash');
const storage = require('./storage');

jest.mock('./storage');

const mockSession = (tabs) => ({ name: 'work', tabs });
const tab = (url) => ({ url, title: url });

beforeEach(() => jest.clearAllMocks());

test('stashTabs moves tabs to stash session', () => {
  const tabs = [tab('a.com'), tab('b.com'), tab('c.com')];
  storage.loadSession.mockReturnValue(mockSession(tabs));
  storage.saveSession.mockImplementation(() => {});

  const result = stashTabs('work', [1], 'mystash');
  expect(result.count).toBe(1);
  expect(result.stashName).toContain('mystash');

  const stashSave = storage.saveSession.mock.calls.find(c => c[0].includes('mystash'));
  expect(stashSave[1].tabs[0].url).toBe('b.com');

  const sessionSave = storage.saveSession.mock.calls.find(c => c[0] === 'work');
  expect(sessionSave[1].tabs).toHaveLength(2);
});

test('stashTabs throws if session not found', () => {
  storage.loadSession.mockReturnValue(null);
  expect(() => stashTabs('missing', [0])).toThrow('Session not found');
});

test('stashTabs throws if no tabs matched', () => {
  storage.loadSession.mockReturnValue(mockSession([tab('a.com')]));
  expect(() => stashTabs('work', [99])).toThrow('No tabs matched');
});

test('popStash merges stash back into session', () => {
  storage.loadSession
    .mockReturnValueOnce({ name: '__stash__s1', tabs: [tab('x.com')], stashedFrom: 'work', stashedAt: 1 })
    .mockReturnValueOnce(mockSession([tab('a.com')]));
  storage.saveSession.mockImplementation(() => {});
  storage.deleteSession = jest.fn();

  const result = popStash('s1');
  expect(result.count).toBe(1);
  expect(result.dest).toBe('work');
  expect(storage.deleteSession).toHaveBeenCalledWith('__stash__s1');
});

test('listStashes returns only stash entries', () => {
  storage.listSessions.mockReturnValue(['work', '__stash__foo', '__stash__bar']);
  storage.loadSession.mockImplementation(name => ({
    tabs: [tab('x.com')], stashedFrom: 'work', stashedAt: 0
  }));

  const result = listStashes();
  expect(result).toHaveLength(2);
  expect(result[0].name).toBe('foo');
});

test('dropStash deletes the stash', () => {
  storage.loadSession.mockReturnValue({ tabs: [], stashedFrom: 'work' });
  storage.deleteSession = jest.fn();
  dropStash('foo');
  expect(storage.deleteSession).toHaveBeenCalledWith('__stash__foo');
});

test('peekStash returns stash contents', () => {
  const stash = { tabs: [tab('z.com')], stashedFrom: 'work', stashedAt: 1 };
  storage.loadSession.mockReturnValue(stash);
  const result = peekStash('foo');
  expect(result.tabs[0].url).toBe('z.com');
});

test('peekStash throws if not found', () => {
  storage.loadSession.mockReturnValue(null);
  expect(() => peekStash('nope')).toThrow('Stash not found');
});
