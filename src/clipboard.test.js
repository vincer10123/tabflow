const { copyUrlsToClipboard, copyAsText, copyAsMarkdown, copyTab, parseClipboardUrls } = require('./clipboard');

const mockSession = {
  name: 'work',
  tabs: [
    { url: 'https://github.com', title: 'GitHub' },
    { url: 'https://example.com', title: 'Example' }
  ]
};

describe('copyUrlsToClipboard', () => {
  it('returns urls joined by newline', () => {
    const result = copyUrlsToClipboard(mockSession);
    expect(result).toBe('https://github.com\nhttps://example.com');
  });

  it('throws on invalid session', () => {
    expect(() => copyUrlsToClipboard(null)).toThrow('Invalid session');
    expect(() => copyUrlsToClipboard({ name: 'x' })).toThrow('Invalid session');
  });
});

describe('copyAsText', () => {
  it('includes session name and numbered tabs', () => {
    const result = copyAsText(mockSession);
    expect(result).toContain('Session: work');
    expect(result).toContain('1. GitHub');
    expect(result).toContain('https://github.com');
    expect(result).toContain('2. Example');
  });

  it('throws on invalid session', () => {
    expect(() => copyAsText({})).toThrow('Invalid session');
  });
});

describe('copyAsMarkdown', () => {
  it('returns a non-empty string', () => {
    const result = copyAsMarkdown(mockSession);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('copyTab', () => {
  it('returns title and url when title present', () => {
    const result = copyTab({ url: 'https://github.com', title: 'GitHub' });
    expect(result).toBe('GitHub\nhttps://github.com');
  });

  it('returns only url when no title', () => {
    const result = copyTab({ url: 'https://github.com' });
    expect(result).toBe('https://github.com');
  });

  it('throws on invalid tab', () => {
    expect(() => copyTab(null)).toThrow('Invalid tab');
    expect(() => copyTab({})).toThrow('Invalid tab');
  });
});

describe('parseClipboardUrls', () => {
  it('parses valid urls from multiline text', () => {
    const text = 'https://github.com\nhttps://example.com\n  \nnot-a-url';
    const tabs = parseClipboardUrls(text);
    expect(tabs).toHaveLength(2);
    expect(tabs[0].url).toBe('https://github.com');
    expect(tabs[1].url).toBe('https://example.com');
  });

  it('returns empty array for no valid urls', () => {
    expect(parseClipboardUrls('no urls here')).toEqual([]);
  });

  it('throws on non-string input', () => {
    expect(() => parseClipboardUrls(null)).toThrow('Expected a string');
  });
});
