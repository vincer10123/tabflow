const fs = require('fs');
const path = require('path');
const { exportSession, exportAllSessions, importSessions } = require('./export');
const { createSession, getAllSessions } = require('./sessions');

jest.mock('./sessions');
jest.mock('fs');

describe('exportSession', () => {
  beforeEach(() => jest.clearAllMocks());

  test('exports a session to a file', () => {
    const session = { name: 'work', tabs: ['https://github.com'] };
    getSession = require('./sessions').getSession;
    require('./sessions').getSession.mockReturnValue(session);
    fs.writeFileSync.mockImplementation(() => {});

    const result = exportSession('work', '/tmp/work.json');
    expect(result).toBe('/tmp/work.json');
    expect(fs.writeFileSync).toHaveBeenCalledWith('/tmp/work.json', JSON.stringify(session, null, 2), 'utf8');
  });

  test('throws if session not found', () => {
    require('./sessions').getSession.mockReturnValue(null);
    expect(() => exportSession('ghost')).toThrow('Session "ghost" not found');
  });
});

describe('exportAllSessions', () => {
  test('exports all sessions', () => {
    const sessions = [{ name: 'work', tabs: [] }];
    require('./sessions').getAllSessions.mockReturnValue(sessions);
    fs.writeFileSync.mockImplementation(() => {});

    const result = exportAllSessions('/tmp/all.json');
    expect(result).toBe('/tmp/all.json');
  });

  test('throws if no sessions', () => {
    require('./sessions').getAllSessions.mockReturnValue([]);
    expect(() => exportAllSessions()).toThrow('No sessions to export');
  });
});

describe('importSessions', () => {
  test('imports valid session file', () => {
    const sessions = [{ name: 'home', tabs: ['https://example.com'] }];
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify(sessions));

    const result = importSessions('/tmp/home.json');
    expect(result).toEqual(sessions);
  });

  test('throws on missing file', () => {
    fs.existsSync.mockReturnValue(false);
    expect(() => importSessions('/tmp/nope.json')).toThrow('File not found');
  });

  test('throws on invalid session format', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify([{ bad: true }]));
    expect(() => importSessions('/tmp/bad.json')).toThrow('Invalid session format');
  });
});
