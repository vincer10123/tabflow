const {
  bookmarkTab,
  unbookmarkTab,
  getBookmarkedTabs,
  getAllBookmarkedTabs,
  isBookmarked,
} = require('./bookmark');

const makeSession = (name, tabs) => ({ name, tabs });
const makeTab = (title, url, bookmarked = false) => ({ title, url, bookmarked });

describe('bookmarkTab', () => {
  it('marks a tab as bookmarked', () => {
    const session = makeSession('work', [makeTab('Google', 'https://google.com')]);
    const result = bookmarkTab(session, 0);
    expect(result.tabs[0].bookmarked).toBe(true);
  });

  it('throws on invalid index', () => {
    const session = makeSession('work', []);
    expect(() => bookmarkTab(session, 0)).toThrow();
  });

  it('does not mutate original session', () => {
    const session = makeSession('work', [makeTab('A', 'https://a.com')]);
    bookmarkTab(session, 0);
    expect(session.tabs[0].bookmarked).toBe(false);
  });
});

describe('unbookmarkTab', () => {
  it('removes bookmark from a tab', () => {
    const session = makeSession('work', [makeTab('Google', 'https://google.com', true)]);
    const result = unbookmarkTab(session, 0);
    expect(result.tabs[0].bookmarked).toBe(false);
  });

  it('throws on invalid index', () => {
    const session = makeSession('work', []);
    expect(() => unbookmarkTab(session, 5)).toThrow();
  });
});

describe('getBookmarkedTabs', () => {
  it('returns only bookmarked tabs', () => {
    const session = makeSession('work', [
      makeTab('A', 'https://a.com', true),
      makeTab('B', 'https://b.com', false),
      makeTab('C', 'https://c.com', true),
    ]);
    const result = getBookmarkedTabs(session);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('A');
  });

  it('returns empty array if none bookmarked', () => {
    const session = makeSession('work', [makeTab('A', 'https://a.com')]);
    expect(getBookmarkedTabs(session)).toEqual([]);
  });
});

describe('getAllBookmarkedTabs', () => {
  it('collects bookmarks across sessions', () => {
    const sessions = [
      makeSession('s1', [makeTab('A', 'https://a.com', true)]),
      makeSession('s2', [makeTab('B', 'https://b.com', false), makeTab('C', 'https://c.com', true)]),
    ];
    const result = getAllBookmarkedTabs(sessions);
    expect(result).toHaveLength(2);
    expect(result[0].sessionName).toBe('s1');
    expect(result[1].sessionName).toBe('s2');
  });
});

describe('isBookmarked', () => {
  it('returns true for bookmarked tab', () => {
    expect(isBookmarked({ bookmarked: true })).toBe(true);
  });
  it('returns false for non-bookmarked tab', () => {
    expect(isBookmarked({ bookmarked: false })).toBe(false);
    expect(isBookmarked({})).toBe(false);
  });
});
