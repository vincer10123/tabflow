const fs = require('fs');
const path = require('path');
const os = require('os');
const { saveSession, loadSession, listSessions, deleteSession } = require('./storage');

const TEST_TABS = [
  { title: 'GitHub', url: 'https://github.com' },
  { title: 'MDN', url: 'https://developer.mozilla.org' },
];

const TEST_SESSION = 'test-session-' + Date.now();

afterEach(() => {
  try { deleteSession(TEST_SESSION); } catch (_) {}
});

test('saveSession writes a JSON file and returns the path', () => {
  const filePath = saveSession(TEST_SESSION, TEST_TABS);
  expect(fs.existsSync(filePath)).toBe(true);
});

test('loadSession returns the saved session with correct data', () => {
  saveSession(TEST_SESSION, TEST_TABS);
  const session = loadSession(TEST_SESSION);
  expect(session.name).toBe(TEST_SESSION);
  expect(session.tabs).toHaveLength(2);
  expect(session.tabs[0].url).toBe('https://github.com');
  expect(session.savedAt).toBeDefined();
});

test('loadSession throws if session does not exist', () => {
  expect(() => loadSession('nonexistent-session-xyz')).toThrow('not found');
});

test('listSessions includes saved session', () => {
  saveSession(TEST_SESSION, TEST_TABS);
  const sessions = listSessions();
  expect(sessions).toContain(TEST_SESSION);
});

test('deleteSession removes the session file', () => {
  saveSession(TEST_SESSION, TEST_TABS);
  deleteSession(TEST_SESSION);
  expect(() => loadSession(TEST_SESSION)).toThrow('not found');
});

test('deleteSession throws if session does not exist', () => {
  expect(() => deleteSession('nonexistent-session-xyz')).toThrow('not found');
});
