const fs = require('fs');
const path = require('path');
const os = require('os');

const SESSIONS_DIR = path.join(os.homedir(), '.tabflow', 'sessions');

function ensureSessionsDir() {
  if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  }
}

function saveSession(name, tabs) {
  ensureSessionsDir();
  const sessionPath = path.join(SESSIONS_DIR, `${name}.json`);
  const session = {
    name,
    savedAt: new Date().toISOString(),
    tabs,
  };
  fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));
  return sessionPath;
}

function loadSession(name) {
  const sessionPath = path.join(SESSIONS_DIR, `${name}.json`);
  if (!fs.existsSync(sessionPath)) {
    throw new Error(`Session "${name}" not found.`);
  }
  const raw = fs.readFileSync(sessionPath, 'utf-8');
  return JSON.parse(raw);
}

function listSessions() {
  ensureSessionsDir();
  return fs.readdirSync(SESSIONS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
}

function deleteSession(name) {
  const sessionPath = path.join(SESSIONS_DIR, `${name}.json`);
  if (!fs.existsSync(sessionPath)) {
    throw new Error(`Session "${name}" not found.`);
  }
  fs.unlinkSync(sessionPath);
}

module.exports = { saveSession, loadSession, listSessions, deleteSession, SESSIONS_DIR };
