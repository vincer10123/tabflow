const { loadWorkspace, saveWorkspace } = require('./workspace');
const { getSession } = require('./sessions');

/**
 * Middleware helpers that sync session changes into any workspaces
 * that reference them. Wraps mutating session functions.
 */

function withWorkspaceSync(fn, workspaceName) {
  return async function (...args) {
    const result = await fn(...args);
    try {
      const ws = await loadWorkspace(workspaceName);
      ws.updatedAt = new Date().toISOString();
      await saveWorkspace(ws.name.replace('workspace::', ''), ws.sessionNames);
    } catch (_) {
      // workspace may not exist, that's fine
    }
    return result;
  };
}

async function resolveWorkspaceSessions(workspaceName) {
  const ws = await loadWorkspace(workspaceName);
  const results = [];
  for (const name of ws.sessionNames) {
    try {
      const session = await getSession(name);
      if (session) results.push(session);
    } catch (_) {
      // skip missing sessions
    }
  }
  return results;
}

module.exports = { withWorkspaceSync, resolveWorkspaceSessions };
