const { pinTab, unpinTab, getPinnedTabs, clearPins } = require('./pin');
const { loadSession, saveSession } = require('./storage');

jest.mock('./storage');

const mockSession = () => ({
  name: 'work',
  tabs: [
    { url: 'https://github.com', title: 'GitHub', pinned: false },
    { url: 'https://notion.so', title: 'Notion', pinned: false }
  ]
});

beforeEach(() => {
  jest.clearAllMocks();
  loadSession.mockResolvedValue(mockSession());
  saveSession.mockResolvedValue(true);
});

test('pinTab marks a tab as pinned', async () => {
  const session = mockSession();
  loadSession.mockResolvedValue(session);
  const tab = await pinTab('work', 'https://github.com');
  expect(tab.pinned).toBe(true);
  expect(saveSession).toHaveBeenCalled();
});

test('pinTab throws if tab not found', async () => {
  await expect(pinTab('work', 'https://missing.com')).rejects.toThrow("Tab 'https://missing.com' not found");
});

test('unpinTab sets pinned to false', async () => {
  const session = mockSession();
  session.tabs[0].pinned = true;
  loadSession.mockResolvedValue(session);
  const tab = await unpinTab('work', 'https://github.com');
  expect(tab.pinned).toBe(false);
});

test('getPinnedTabs returns only pinned tabs', async () => {
  const session = mockSession();
  session.tabs[0].pinned = true;
  loadSession.mockResolvedValue(session);
  const pinned = await getPinnedTabs('work');
  expect(pinned).toHaveLength(1);
  expect(pinned[0].url).toBe('https://github.com');
});

test('clearPins unpins all tabs', async () => {
  const session = mockSession();
  session.tabs[0].pinned = true;
  loadSession.mockResolvedValue(session);
  const tabs = await clearPins('work');
  expect(tabs.every(t => t.pinned === false)).toBe(true);
});
