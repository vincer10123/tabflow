const { setFocusMode, clearFocusMode, getFocusDomains, applyFocusFilter, isFocusMode } = require('./focus');
const storage = require('./storage');

jest.mock('./storage');

const baseSession = {
  name: 'work',
  tabs: [
    { url: 'https://github.com/foo', title: 'GitHub' },
    { url: 'https://news.ycombinator.com', title: 'HN' },
    { url: 'https://mail.google.com', title: 'Gmail' },
    { url: 'https://docs.github.com', title: 'Docs' },
  ],
};

beforeEach(() => {
  storage.loadSession.mockReturnValue(JSON.parse(JSON.stringify(baseSession)));
  storage.saveSession.mockReset();
});

test('setFocusMode stores allowed domains', () => {
  const result = setFocusMode('work', ['github.com']);
  expect(result.focusDomains).toEqual(['github.com']);
  expect(storage.saveSession).toHaveBeenCalled();
});

test('clearFocusMode removes focusDomains', () => {
  storage.loadSession.mockReturnValue({ ...baseSession, focusDomains: ['github.com'] });
  const result = clearFocusMode('work');
  expect(result.focusDomains).toBeUndefined();
});

test('getFocusDomains returns null when not set', () => {
  expect(getFocusDomains('work')).toBeNull();
});

test('getFocusDomains returns domains when set', () => {
  storage.loadSession.mockReturnValue({ ...baseSession, focusDomains: ['github.com'] });
  expect(getFocusDomains('work')).toEqual(['github.com']);
});

test('applyFocusFilter keeps only matching tabs', () => {
  const session = { ...baseSession, focusDomains: ['github.com'] };
  const result = applyFocusFilter(session);
  expect(result.tabs).toHaveLength(2);
  expect(result.tabs.every(t => t.url.includes('github.com'))).toBe(true);
});

test('applyFocusFilter returns all tabs when no focus set', () => {
  const result = applyFocusFilter(baseSession);
  expect(result.tabs).toHaveLength(4);
});

test('isFocusMode returns true when domains set', () => {
  expect(isFocusMode({ focusDomains: ['github.com'] })).toBe(true);
  expect(isFocusMode({ focusDomains: [] })).toBe(false);
  expect(isFocusMode({})).toBe(false);
});

test('setFocusMode throws if session not found', () => {
  storage.loadSession.mockReturnValue(null);
  expect(() => setFocusMode('missing', ['x.com'])).toThrow('not found');
});
