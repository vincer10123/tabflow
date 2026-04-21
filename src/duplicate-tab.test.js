const { duplicateTab, duplicateTabInSession, copyTabToSession } = require('./duplicate-tab');

const makeSession = (name, tabs) => ({ name, tabs, updatedAt: '2024-01-01T00:00:00.000Z' });
const makeTab = (id, title, url) => ({ id, title, url });

describe('duplicateTab', () => {
  it('returns a copy with modified title and new id', () => {
    const session = makeSession('s1', [makeTab('t1', 'Google', 'https://google.com')]);
    const dup = duplicateTab(session, 0);
    expect(dup.title).toBe('Google (copy)');
    expect(dup.url).toBe('https://google.com');
    expect(dup.id).not.toBe('t1');
    expect(dup.duplicatedAt).toBeDefined();
  });

  it('throws on invalid session', () => {
    expect(() => duplicateTab(null, 0)).toThrow('Invalid session');
    expect(() => duplicateTab({}, 0)).toThrow('Invalid session');
  });

  it('throws on out-of-range index', () => {
    const session = makeSession('s1', [makeTab('t1', 'A', 'https://a.com')]);
    expect(() => duplicateTab(session, 5)).toThrow('out of range');
    expect(() => duplicateTab(session, -1)).toThrow('out of range');
  });
});

describe('duplicateTabInSession', () => {
  it('inserts duplicate after the original tab', () => {
    const session = makeSession('s1', [
      makeTab('t1', 'A', 'https://a.com'),
      makeTab('t2', 'B', 'https://b.com'),
    ]);
    const updated = duplicateTabInSession(session, 0);
    expect(updated.tabs).toHaveLength(3);
    expect(updated.tabs[0].title).toBe('A');
    expect(updated.tabs[1].title).toBe('A (copy)');
    expect(updated.tabs[2].title).toBe('B');
  });

  it('updates updatedAt on the session', () => {
    const session = makeSession('s1', [makeTab('t1', 'A', 'https://a.com')]);
    const updated = duplicateTabInSession(session, 0);
    expect(updated.updatedAt).not.toBe('2024-01-01T00:00:00.000Z');
  });
});

describe('copyTabToSession', () => {
  it('appends the tab to the target session', () => {
    const src = makeSession('src', [makeTab('t1', 'A', 'https://a.com')]);
    const tgt = makeSession('tgt', [makeTab('t2', 'B', 'https://b.com')]);
    const updated = copyTabToSession(src, 0, tgt);
    expect(updated.tabs).toHaveLength(2);
    expect(updated.tabs[1].url).toBe('https://a.com');
    expect(updated.tabs[1].copiedFrom).toBe('src');
    expect(updated.tabs[1].copiedAt).toBeDefined();
  });

  it('throws on invalid source or target', () => {
    const src = makeSession('src', [makeTab('t1', 'A', 'https://a.com')]);
    expect(() => copyTabToSession(null, 0, src)).toThrow('Invalid source session');
    expect(() => copyTabToSession(src, 0, null)).toThrow('Invalid target session');
  });

  it('throws on bad tab index', () => {
    const src = makeSession('src', [makeTab('t1', 'A', 'https://a.com')]);
    const tgt = makeSession('tgt', []);
    expect(() => copyTabToSession(src, 9, tgt)).toThrow('out of range');
  });
});
