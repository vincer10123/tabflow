#!/usr/bin/env node
// cli-audit.js — CLI interface for viewing session audit logs

const { getAuditLog, getRecentAuditEntries, summarizeAuditLog, getAllAuditLogs } = require('./audit');

function printHelp() {
  console.log(`
tabflow audit <command> [options]

Commands:
  log <session>          Show full audit log for a session
  recent <session> [n]   Show last N entries (default 10)
  summary <session>      Show action counts for a session
  all                    Show audit logs for all sessions

Examples:
  tabflow audit log work
  tabflow audit recent work 5
  tabflow audit summary personal
  tabflow audit all
`);
}

function formatEntry(entry) {
  const meta = Object.entries(entry)
    .filter(([k]) => !['action', 'timestamp'].includes(k))
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join(' ');
  return `[${entry.timestamp}] ${entry.action}${meta ? '  ' + meta : ''}`;
}

function run(argv) {
  const [cmd, sessionName, extra] = argv;

  if (!cmd || cmd === 'help' || cmd === '--help') {
    printHelp();
    return;
  }

  if (cmd === 'log') {
    if (!sessionName) { console.error('Session name required'); process.exit(1); }
    const log = getAuditLog(sessionName);
    if (!log.length) { console.log(`No audit entries for "${sessionName}"`); return; }
    log.forEach((e) => console.log(formatEntry(e)));
    return;
  }

  if (cmd === 'recent') {
    if (!sessionName) { console.error('Session name required'); process.exit(1); }
    const limit = parseInt(extra, 10) || 10;
    const entries = getRecentAuditEntries(sessionName, limit);
    if (!entries.length) { console.log(`No recent entries for "${sessionName}"`); return; }
    entries.forEach((e) => console.log(formatEntry(e)));
    return;
  }

  if (cmd === 'summary') {
    if (!sessionName) { console.error('Session name required'); process.exit(1); }
    const s = summarizeAuditLog(sessionName);
    console.log(`Session: ${s.sessionName}  Total: ${s.total}`);
    Object.entries(s.counts).forEach(([action, count]) => {
      console.log(`  ${action}: ${count}`);
    });
    return;
  }

  if (cmd === 'all') {
    const all = getAllAuditLogs();
    if (!all.length) { console.log('No audit logs found.'); return; }
    all.forEach(({ sessionName: name, entries }) => {
      console.log(`\n--- ${name} (${entries.length} entries) ---`);
      entries.forEach((e) => console.log(formatEntry(e)));
    });
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  printHelp();
  process.exit(1);
}

if (require.main === module) {
  run(process.argv.slice(2));
}

module.exports = { printHelp, run, formatEntry };
