const fs = require('fs');
const path = require('path');
const { getSession, getAllSessions } = require('./sessions');

function exportSession(name, outputPath) {
  const session = getSession(name);
  if (!session) {
    throw new Error(`Session "${name}" not found`);
  }

  const data = JSON.stringify(session, null, 2);
  const filePath = outputPath || path.join(process.cwd(), `${name}.json`);
  fs.writeFileSync(filePath, data, 'utf8');
  return filePath;
}

function exportAllSessions(outputPath) {
  const sessions = getAllSessions();
  if (!sessions.length) {
    throw new Error('No sessions to export');
  }

  const data = JSON.stringify(sessions, null, 2);
  const filePath = outputPath || path.join(process.cwd(), 'tabflow-export.json');
  fs.writeFileSync(filePath, data, 'utf8');
  return filePath;
}

function importSessions(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error('Invalid JSON file');
  }

  const sessions = Array.isArray(parsed) ? parsed : [parsed];

  for (const session of sessions) {
    if (!session.name || !Array.isArray(session.tabs)) {
      throw new Error(`Invalid session format: missing name or tabs`);
    }
  }

  return sessions;
}

module.exports = { exportSession, exportAllSessions, importSessions };
