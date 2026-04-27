// restore.js — restore sessions to browser via CLI output or protocol

const { getSession, getAllSessions } = require('./sessions');

function formatRestoreUrls(session) {
  if (!session || !session.tabs || session.tabs.length === 0) {
    return [];
  }
  return session.tabs.map(tab => tab.url).filter(Boolean);
}

function generateRestoreCommand(session, browser = 'chrome') {
  const urls = formatRestoreUrls(session);
  if (urls.length === 0) return null;

  const commands = {
    chrome: `open -a "Google Chrome" ${urls.map(u => `"${u}"`).join(' ')}`,
    firefox: `open -a Firefox ${urls.map(u => `"${u}"`).join(' ')}`,
    safari: `open -a Safari ${urls.map(u => `"${u}"`).join(' ')}`,
  };

  return commands[browser] || commands.chrome;
}

function restoreSession(name, options = {}) {
  const session = getSession(name);
  if (!session) {
    return { ok: false, error: `Session "${name}" not found` };
  }

  const urls = formatRestoreUrls(session);
  if (urls.length === 0) {
    return { ok: false, error: `Session "${name}" has no tabs to restore` };
  }

  const browser = options.browser || 'chrome';
  const command = generateRestoreCommand(session, browser);

  return {
    ok: true,
    name: session.name,
    tabCount: urls.length,
    urls,
    command,
    browser,
  };
}

function restoreAllSessions(options = {}) {
  const sessions = getAllSessions();
  return sessions.map(s => restoreSession(s.name, options));
}

module.exports = { formatRestoreUrls, generateRestoreCommand, restoreSession, restoreAllSessions };
