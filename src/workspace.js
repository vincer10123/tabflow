const { getAllSessions } = require('./sessions');
const { saveSession, loadSession } = require('./storage');

/**
 * A workspace groups multiple sessions under a named collection.
 * Stored as a special session with metadata.type = 'workspace'
 */

function createWorkspace(name, sessionNames = []) {
  return {
    name,
    type: 'workspace',
    sessionNames,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function saveWorkspace(name, sessionNames) {
  const workspace = createWorkspace(name, sessionNames);
  await saveSession(`workspace::${name}`, workspace);
  return workspace;
}

async function loadWorkspace(name) {
  const data = await loadSession(`workspace::${name}`);
  if (!data || data.type !== 'workspace') {
    throw new Error(`Workspace "${name}" not found`);
  }
  return data;
}

async function listWorkspaces() {
  const all = await getAllSessions();
  return all
    .filter((s) => s.name && s.name.startsWith('workspace::'))
    .map((s) => ({
      ...s,
      displayName: s.name.replace('workspace::', ''),
    }));
}

async function addSessionToWorkspace(workspaceName, sessionName) {
  const workspace = await loadWorkspace(workspaceName);
  if (workspace.sessionNames.includes(sessionName)) return workspace;
  workspace.sessionNames.push(sessionName);
  workspace.updatedAt = new Date().toISOString();
  await saveSession(`workspace::${workspaceName}`, workspace);
  return workspace;
}

async function removeSessionFromWorkspace(workspaceName, sessionName) {
  const workspace = await loadWorkspace(workspaceName);
  workspace.sessionNames = workspace.sessionNames.filter((n) => n !== sessionName);
  workspace.updatedAt = new Date().toISOString();
  await saveSession(`workspace::${workspaceName}`, workspace);
  return workspace;
}

module.exports = {
  createWorkspace,
  saveWorkspace,
  loadWorkspace,
  listWorkspaces,
  addSessionToWorkspace,
  removeSessionFromWorkspace,
};
