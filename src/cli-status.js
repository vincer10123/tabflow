#!/usr/bin/env node
// tabflow status — show session activity status

const { getAllSessions } = require('./sessions');
const { getStatusSummary, filterByStatus, formatStatus } = require('./status');
const { getAccessLog } = require('./access-log');

function printHelp() {
  console.log(`
tabflow status [--filter <status>]

Options:
  --filter <status>   Show only sessions with given status (active|idle|stale|new)
  --summary           Show counts per status group
  -h, --help          Show this help
  `);
}

async function run(args = process.argv.slice(2)) {
  if (args.includes('-h') || args.includes('--help')) {
    printHelp();
    return;
  }

  const filterIdx = args.indexOf('--filter');
  const filterStatus = filterIdx !== -1 ? args[filterIdx + 1] : null;
  const showSummary = args.includes('--summary');

  const sessions = await getAllSessions();
  const accessLogs = {};

  for (const session of sessions) {
    try {
      accessLogs[session.name] = await getAccessLog(session.name);
    } catch {
      accessLogs[session.name] = {};
    }
  }

  if (showSummary) {
    const summary = getStatusSummary(sessions, accessLogs);
    console.log('Session Status Summary');
    console.log('----------------------');
    for (const [status, names] of Object.entries(summary)) {
      console.log(`${formatStatus(status)}: ${names.length}`);
    }
    return;
  }

  const toShow = filterStatus
    ? filterByStatus(sessions, filterStatus, accessLogs)
    : sessions;

  if (toShow.length === 0) {
    console.log(filterStatus ? `No sessions with status: ${filterStatus}` : 'No sessions found.');
    return;
  }

  console.log('Session Status');
  console.log('--------------');
  for (const session of toShow) {
    const log = accessLogs[session.name] || {};
    const { getSessionStatus } = require('./status');
    const status = getSessionStatus(session, log);
    const tabs = session.tabs ? session.tabs.length : 0;
    console.log(`${formatStatus(status).padEnd(14)} ${session.name} (${tabs} tabs)`);
  }
}

if (require.main === module) run();
module.exports = { printHelp, run };
