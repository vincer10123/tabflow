#!/usr/bin/env node
// cli-visibility.js — CLI for hiding/showing sessions

const { getAllSessions, saveSession } = require('./sessions');
const { hideSession, showSession, getHiddenNames, filterVisible } = require('./visibility');

function printHelp() {
  console.log(`
tabflow visibility — hide or show sessions from listings

Usage:
  tabflow visibility hide <name>      Hide a session
  tabflow visibility show <name>      Unhide a session
  tabflow visibility list             List hidden sessions
  tabflow visibility list --all       List all sessions including hidden

Options:
  --help    Show this help message
`);
}

async function run(args = process.argv.slice(2)) {
  const [sub, name] = args;

  if (!sub || sub === '--help') {
    printHelp();
    return;
  }

  const sessions = await getAllSessions({ includeHidden: true });

  if (sub === 'hide') {
    if (!name) { console.error('Error: session name required'); process.exit(1); }
    const updated = hideSession(sessions, name);
    await saveSession(name, updated[name]);
    console.log(`Session "${name}" is now hidden.`);
    return;
  }

  if (sub === 'show') {
    if (!name) { console.error('Error: session name required'); process.exit(1); }
    const updated = showSession(sessions, name);
    await saveSession(name, updated[name]);
    console.log(`Session "${name}" is now visible.`);
    return;
  }

  if (sub === 'list') {
    const showAll = args.includes('--all');
    const toList = showAll ? sessions : sessions;
    const names = showAll
      ? Object.keys(toList)
      : getHiddenNames(toList);
    if (names.length === 0) {
      console.log(showAll ? 'No sessions found.' : 'No hidden sessions.');
    } else {
      const label = showAll ? 'All sessions' : 'Hidden sessions';
      console.log(`${label}:`);
      names.forEach(n => {
        const flag = sessions[n].hidden ? ' [hidden]' : '';
        console.log(`  ${n}${flag}`);
      });
    }
    return;
  }

  console.error(`Unknown subcommand: ${sub}`);
  printHelp();
  process.exit(1);
}

if (require.main === module) run();
module.exports = { run, printHelp };
