const { bookmarkTab, unbookmarkTab, getBookmarkedTabs, getAllBookmarkedTabs } = require('./bookmark');

const makeTab = (title, url, bookmarked = false) => ({ title, url, bookmarked });
const makeSession = (name, tabs) => ({ name, tabs });

describe('bookmark integration', () => {
  it('full bookmark lifecycle: add, verify, remove', () => {
    let session = makeSession('dev', [
      makeTab('GitHub', 'https://github.com'),
      makeTab('MDN', 'https://developer.mozilla.org'),
    ]);

    session = bookmarkTab(session, 0);
    expect(getBookmarkedTabs(session)).toHaveLength(1);
    expect(getBookmarkedTabs(session)[0].title).toBe('GitHub');

    session = bookmarkTab(session, 1);
    expect(getBookmarkedTabs(session)).toHaveLength(2);

    session = unbookmarkTab(session, 0);
    expect(getBookmarkedTabs(session)).toHaveLength(1);
    expect(getBookmarkedTabs(session)[0].title).toBe('MDN');
  });

  it('aggregates bookmarks from multiple sessions', () => {
    const s1 = bookmarkTab(
      makeSession('work', [makeTab('Jira', 'https://jira.example.com')]),
      0
    );
    const s2 = makeSession('personal', [
      makeTab('Reddit', 'https://reddit.com'),
      makeTab('HN', 'https://news.ycombinator.com'),
    ]);
    const s2b = bookmarkTab(s2, 1);

    const all = getAllBookmarkedTabs([s1, s2b]);
    expect(all).toHaveLength(2);
    expect(all.map((x) => x.tab.title)).toEqual(['Jira', 'HN']);
  });

  it('handles sessions with no tabs gracefully', () => {
    const empty = makeSession('empty', []);
    expect(getBookmarkedTabs(empty)).toEqual([]);
    expect(getAllBookmarkedTabs([empty])).toEqual([]);
  });
});
