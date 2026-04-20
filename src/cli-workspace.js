#!/usr/bin/env node
const {
  saveWorkspace,
  loadWorkspace,
  listWorkspaces,
  addSessionToWorkspace,
  removeSessionFromWorkspace,
} = require('./workspace');
const { resolveWorkspaceSessions } = require('./workspace-middleware');

function printHelp() {
  console.log(`
tabflow workspace <command> [options]

Commands:
  create <name> [sessions...]   Create a workspace with optional sessions
  add <workspace> <session>     Add a session to a workspace
  remove <workspace> <session>  Remove a session from a workspace
  list                          List all workspaces
  show <name>                   Show sessions in a workspace

Examples:
  tabflow workspace create work session1 session2
  tabflow workspace add work session3
  tabflow workspace show work
`);
}

async function run(args) {
  const [cmd, ...rest] = args;

  if (!cmd || cmd === '--help' || cmd === '-h') {
    printHelp();
    return;
  }

  if (cmd === 'create') {
    const [name, ...sessions] = rest;
    if (!name) { console.error('Workspace name required'); process.exit(1); }
    const ws = await saveWorkspace(name, sessions);
    console.log(`Created workspace "${ws.name}" with ${ws.sessionNames.length} session(s).`);
    return;
  }

  if (cmd === 'add') {
    const [wsName, sessionName] = rest;
    if (!wsName || !sessionName) { console.error('Usage: workspace add <workspace> <session>'); process.exit(1); }
    await addSessionToWorkspace(wsName, sessionName);
    console.log(`Added "${sessionName}" to workspace "${wsName}".`);
    return;
  }

  if (cmd === 'remove') {
    const [wsName, sessionName] = rest;
    if (!wsName || !sessionName) { console.error('Usage: workspace remove <workspace> <session>'); process.exit(1); }
    await removeSessionFromWorkspace(wsName, sessionName);
    console.log(`Removed "${sessionName}" from workspace "${wsName}".`);
    return;
  }

  if (cmd === 'list') {
    const workspaces = await listWorkspaces();
    if (!workspaces.length) { console.log('No workspaces found.'); return; }
    workspaces.forEach((ws) => console.log(`  ${ws.displayName} (${(ws.sessionNames || []).length} sessions)`));
    return;
  }

  if (cmd === 'show') {
    const [name] = rest;
    if (!name) { console.error('Workspace name required'); process.exit(1); }
    const sessions = await resolveWorkspaceSessions(name);
    if (!sessions.length) { console.log(`Workspace "${name}" has no sessions.`); return; }
    console.log(`Workspace "${name}":`);
    sessions.forEach((s) => console.log(`  - ${s.name} (${(s.tabs || []).length} tabs)`));
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  printHelp();
  process.exit(1);
}

module.exports = { printHelp, run };

if (require.main === module) {
  run(process.argv.slice(2)).catch((err) => { console.error(err.message); process.exit(1); });
}
