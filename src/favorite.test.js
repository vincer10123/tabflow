const { favoriteTab, unfavoriteTab, getFavoritedTabs, getAllFavoritedTabs, isFavorited } = require('./favorite');
const { loadSession, saveSession } = require('./storage');

jest.mock('./storage');

const mockSession = () => ({
  name: 'work',
  tabs: [
    { url: 'https://github.com', title: 'GitHub' },
    { url: 'https://example.com', title: 'Example', favorited: true, favoritedAt: '2024-01-01T00:00:00.000Z' }
  ]
});

beforeEach(() => {
  jest.clearAllMocks();
  loadSession.mockResolvedValue(mockSession());
  saveSession.mockResolvedValue();
});

test('favoriteTab marks a tab as favorited', async () => {
  const tab = await favoriteTab('work', 'https://github.com');
  expect(tab.favorited).toBe(true);
  expect(tab.favoritedAt).toBeDefined();
  expect(saveSession).toHaveBeenCalled();
});

test('favoriteTab throws if session not found', async () => {
  loadSession.mockResolvedValue(null);
  await expect(favoriteTab('missing', 'https://x.com')).rejects.toThrow('not found');
});

test('favoriteTab throws if tab not found', async () => {
  await expect(favoriteTab('work', 'https://nothere.com')).rejects.toThrow('not found');
});

test('unfavoriteTab removes favorite flag', async () => {
  const tab = await unfavoriteTab('work', 'https://example.com');
  expect(tab.favorited).toBe(false);
  expect(tab.favoritedAt).toBeUndefined();
});

test('getFavoritedTabs returns only favorited tabs', async () => {
  const tabs = await getFavoritedTabs('work');
  expect(tabs).toHaveLength(1);
  expect(tabs[0].url).toBe('https://example.com');
});

test('getAllFavoritedTabs aggregates across sessions', async () => {
  const sessions = [{ name: 'work' }, { name: 'personal' }];
  const results = await getAllFavoritedTabs(sessions);
  expect(results).toHaveLength(2);
  expect(results[0]).toHaveProperty('sessionName');
  expect(results[0]).toHaveProperty('tab');
});

test('isFavorited returns true for favorited tab', async () => {
  const result = await isFavorited('work', 'https://example.com');
  expect(result).toBe(true);
});

test('isFavorited returns false for non-favorited tab', async () => {
  const result = await isFavorited('work', 'https://github.com');
  expect(result).toBe(false);
});

test('isFavorited returns false if session not found', async () => {
  loadSession.mockResolvedValue(null);
  const result = await isFavorited('missing', 'https://x.com');
  expect(result).toBe(false);
});
