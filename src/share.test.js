const { generateShareText, generateShareMarkdown, generateShareJson, shareSession } = require('./share');
const storage = require('./storage');

jest.mock('./storage');

const mockSession = {
  name: 'work',
  notes: 'Daily tabs',
  tabs: [
    { url: 'https://github.com', title: 'GitHub' },
    { url: 'https://example.com', title: null },
  ],
};

describe('generateShareText', () => {
  it('includes session name and tab count', () => {
    const out = generateShareText(mockSession);
    expect(out).toContain('Session: work');
    expect(out).toContain('Tabs (2):');
  });

  it('lists urls', () => {
    const out = generateShareText(mockSession);
    expect(out).toContain('https://github.com');
    expect(out).toContain('https://example.com');
  });

  it('includes notes when present', () => {
    const out = generateShareText(mockSession);
    expect(out).toContain('Notes: Daily tabs');
  });
});

describe('generateShareMarkdown', () => {
  it('uses markdown heading', () => {
    const out = generateShareMarkdown(mockSession);
    expect(out).toContain('# Session: work');
  });

  it('formats tabs as numbered links', () => {
    const out = generateShareMarkdown(mockSession);
    expect(out).toContain('[GitHub](https://github.com)');
    expect(out).toContain('[https://example.com](https://example.com)');
  });
});

describe('generateShareJson', () => {
  it('returns valid JSON', () => {
    const out = generateShareJson(mockSession);
    expect(() => JSON.parse(out)).not.toThrow();
  });

  it('includes name and tabs', () => {
    const parsed = JSON.parse(generateShareJson(mockSession));
    expect(parsed.name).toBe('work');
    expect(parsed.tabs).toHaveLength(2);
    expect(parsed.tabs[0].url).toBe('https://github.com');
  });
});

describe('shareSession', () => {
  beforeEach(() => {
    storage.loadSession.mockReturnValue(mockSession);
  });

  it('returns text by default', () => {
    const out = shareSession('work');
    expect(out).toContain('Session: work');
  });

  it('returns markdown when requested', () => {
    const out = shareSession('work', 'markdown');
    expect(out).toContain('# Session: work');
  });

  it('throws when session not found', () => {
    storage.loadSession.mockReturnValue(null);
    expect(() => shareSession('missing')).toThrow('Session "missing" not found.');
  });
});
