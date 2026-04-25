const { previewSession, previewAllSessions, previewTab } = require('./preview');

const makeSession = (name, tabs) => ({ name, tabs });
const makeTab = (title, url, extra = {}) => ({ title, url, ...extra });

describe('previewSession', () => {
  it('renders session name and tab count', () => {
    const s = makeSession('work', [makeTab('GitHub', 'https://github.com')]);
    const out = previewSession(s);
    expect(out).toContain('Session: work');
    expect(out).toContain('Tabs: 1');
  });

  it('lists tabs with index, title and url', () => {
    const s = makeSession('dev', [makeTab('MDN', 'https://mdn.io')]);
    const out = previewSession(s);
    expect(out).toContain('[1]');
    expect(out).toContain('MDN');
    expect(out).toContain('<https://mdn.io>');
  });

  it('truncates when tabs exceed maxTabs', () => {
    const tabs = Array.from({ length: 15 }, (_, i) => makeTab(`Tab ${i}`, `https://x.com/${i}`));
    const s = makeSession('big', tabs);
    const out = previewSession(s, { maxTabs: 5 });
    expect(out).toContain('showing first 5');
    expect(out).toContain('... and 10 more');
  });

  it('hides url when showUrl is false', () => {
    const s = makeSession('s', [makeTab('Hello', 'https://hello.com')]);
    const out = previewSession(s, { showUrl: false });
    expect(out).not.toContain('https://hello.com');
  });

  it('throws on invalid session', () => {
    expect(() => previewSession(null)).toThrow('Invalid session');
    expect(() => previewSession({ name: 'x' })).toThrow('Invalid session');
  });
});

describe('previewAllSessions', () => {
  it('returns no sessions message when empty', () => {
    expect(previewAllSessions([])).toBe('No sessions found.');
  });

  it('joins multiple session previews', () => {
    const sessions = [
      makeSession('a', [makeTab('T1', 'https://a.com')]),
      makeSession('b', [makeTab('T2', 'https://b.com')]),
    ];
    const out = previewAllSessions(sessions);
    expect(out).toContain('Session: a');
    expect(out).toContain('Session: b');
  });
});

describe('previewTab', () => {
  it('shows title and url', () => {
    const out = previewTab(makeTab('Foo', 'https://foo.com'));
    expect(out).toContain('Title : Foo');
    expect(out).toContain('URL   : https://foo.com');
  });

  it('shows pinned flag', () => {
    const out = previewTab(makeTab('X', 'https://x.com', { pinned: true }));
    expect(out).toContain('Pinned: yes');
  });

  it('shows tags when present', () => {
    const out = previewTab(makeTab('X', 'https://x.com', { tags: ['work', 'ref'] }));
    expect(out).toContain('Tags  : work, ref');
  });

  it('throws when no tab given', () => {
    expect(() => previewTab(null)).toThrow('No tab provided');
  });
});
