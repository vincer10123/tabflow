const { formatRestoreUrls, generateRestoreCommand, restoreSession, restoreAllSessions } = require('./restore');

jest.mock('./sessions');
const { getSession, getAllSessions } = require('./sessions');

const mockSession = {
  name: 'work',
  tabs: [
    { url: 'https://github.com', title: 'GitHub' },
    { url: 'https://notion.so', title: 'Notion' },
  ],
};

describe('formatRestoreUrls', () => {
  it('returns list of urls from session tabs', () => {
    expect(formatRestoreUrls(mockSession)).toEqual(['https://github.com', 'https://notion.so']);
  });

  it('returns empty array for empty tabs', () => {
    expect(formatRestoreUrls({ tabs: [] })).toEqual([]);
  });

  it('returns empty array for null session', () => {
    expect(formatRestoreUrls(null)).toEqual([]);
  });

  it('filters out tabs without urls', () => {
    const s = { tabs: [{ title: 'no url' }, { url: 'https://example.com' }] };
    expect(formatRestoreUrls(s)).toEqual(['https://example.com']);
  });
});

describe('generateRestoreCommand', () => {
  it('generates chrome command by default', () => {
    const cmd = generateRestoreCommand(mockSession);
    expect(cmd).toContain('Google Chrome');
    expect(cmd).toContain('https://github.com');
  });

  it('generates firefox command', () => {
    const cmd = generateRestoreCommand(mockSession, 'firefox');
    expect(cmd).toContain('Firefox');
  });

  it('returns null for empty session', () => {
    expect(generateRestoreCommand({ tabs: [] })).toBeNull();
  });
});

describe('restoreSession', () => {
  beforeEach(() => {
    getSession.mockReturnValue(mockSession);
  });

  it('returns ok result with urls and command', () => {
    const result = restoreSession('work');
    expect(result.ok).toBe(true);
    expect(result.tabCount).toBe(2);
    expect(result.urls).toHaveLength(2);
    expect(result.command).toBeTruthy();
  });

  it('returns error if session not found', () => {
    getSession.mockReturnValue(null);
    const result = restoreSession('missing');
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/not found/);
  });

  it('respects browser option', () => {
    const result = restoreSession('work', { browser: 'safari' });
    expect(result.browser).toBe('safari');
    expect(result.command).toContain('Safari');
  });
});

describe('restoreAllSessions', () => {
  it('returns restore results for all sessions', () => {
    getAllSessions.mockReturnValue([mockSession]);
    getSession.mockReturnValue(mockSession);
    const results = restoreAllSessions();
    expect(results).toHaveLength(1);
    expect(results[0].ok).toBe(true);
  });
});
