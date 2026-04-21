#!/usr/bin/env node
const { scheduleSession, unscheduleSession, getSchedule, loadSession } = require('./schedule');
const { listSessions, loadSession: ls } = require('./storage');

function printHelp() {
  console.log(`
tabflow schedule — manage scheduled tab session openings

Usage:
  schedule set <name> <datetime>   Schedule a session to open at a given time
  schedule clear <name>            Remove schedule from a session
  schedule list                    List all scheduled sessions
  schedule due                     Show sessions due to open now

Examples:
  tabflow schedule set work "2025-06-01T09:00:00"
  tabflow schedule clear work
  tabflow schedule list
  tabflow schedule due
`);
}

function run(args) {
  const [cmd, ...rest] = args;

  if (!cmd || cmd === '--help' || cmd === '-h') {
    return printHelp();
  }

  if (cmd === 'set') {
    const [name, datetime] = rest;
    if (!name || !datetime) {
      console.error('Usage: schedule set <name> <datetime>');
      process.exit(1);
    }
    try {
      scheduleSession(name, datetime);
      console.log(`Scheduled "${name}" to open at ${new Date(datetime).toLocaleString()}`);
    } catch (e) {
      console.error('Error:', e.message);
      process.exit(1);
    }
    return;
  }

  if (cmd === 'clear') {
    const [name] = rest;
    if (!name) { console.error('Usage: schedule clear <name>'); process.exit(1); }
    try {
      unscheduleSession(name);
      console.log(`Cleared schedule for "${name}"`);
    } catch (e) {
      console.error('Error:', e.message); process.exit(1);
    }
    return;
  }

  if (cmd === 'list') {
    const names = listSessions();
    const scheduled = names
      .map(n => ({ name: n, session: ls(n) }))
      .filter(({ session }) => getSchedule(session) !== null);
    if (!scheduled.length) { console.log('No scheduled sessions.'); return; }
    scheduled.forEach(({ name, session }) => {
      console.log(`  ${name}  →  ${getSchedule(session).toLocaleString()}`);
    });
    return;
  }

  if (cmd === 'due') {
    const names = listSessions();
    const due = names
      .map(n => ({ name: n, session: ls(n) }))
      .filter(({ session }) => {
        const d = getSchedule(session);
        return d && new Date() >= d;
      });
    if (!due.length) { console.log('No sessions due.'); return; }
    due.forEach(({ name }) => console.log(`  ${name} is due!`));
    return;
  }

  console.error('Unknown command:', cmd);
  printHelp();
  process.exit(1);
}

if (require.main === module) {
  run(process.argv.slice(2));
}

module.exports = { printHelp, run };
