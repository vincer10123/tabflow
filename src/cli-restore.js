#!/usr/bin/env node
// cli-restore.js — CLI interface for restoring tab sessions

const { restoreSession, restoreAllSessions } = require('./restore');
const { getAllSessions } = require('./sessions');

function printHelp() {
  console.log(`
tabflow restore — restore browser tab sessions

Usage:
  tabflow restore <session>           Print restore command for a session
  tabflow restore <session> --run     Execute the restore command directly
  tabflow restore --all               List restore commands for all sessions
  tabflow restore --list              List all available sessions

Options:
  --browser <name>   Browser to use: chrome (default), firefox, safari
  --run              Execute the generated command
  --all              Restore all sessions
  --list             List sessions available for restore
  --help             Show this help
`.trim());
}

function run(args = process.argv.slice(2)) {
  if (args.includes('--help') || args.length === 0) {
    printHelp();
    return;
  }

  const browser = args.includes('--browser')
    ? args[args.indexOf('--browser') + 1]
    : 'chrome';

  const shouldRun = args.includes('--run');
  const all = args.includes('--all');
  const list = args.includes('--list');

  if (list) {
    const sessions = getAllSessions();
    if (sessions.length === 0) {
      console.log('No sessions found.');
      return;
    }
    sessions.forEach(s => console.log(`  ${s.name} (${s.tabs?.length ?? 0} tabs)`));
    return;
  }

  if (all) {
    const results = restoreAllSessions({ browser });
    results.forEach(r => {
      if (r.ok) {
        console.log(`\n[${r.name}] ${r.tabCount} tabs`);
        console.log(`  ${r.command}`);
      } else {
        console.error(`  Error: ${r.error}`);
      }
    });
    return;
  }

  const name = args.find(a => !a.startsWith('--'));
  if (!name) {
    console.error('Error: session name required. Use --help for usage.');
    process.exit(1);
  }

  const result = restoreSession(name, { browser });
  if (!result.ok) {
    console.error(`Error: ${result.error}`);
    process.exit(1);
  }

  console.log(`Restoring "${result.name}" — ${result.tabCount} tab(s) in ${result.browser}`);
  console.log(`\n  ${result.command}\n`);

  if (shouldRun) {
    const { execSync } = require('child_process');
    try {
      execSync(result.command, { stdio: 'inherit' });
    } catch (e) {
      console.error('Failed to execute restore command:', e.message);
      process.exit(1);
    }
  }
}

if (require.main === module) run();
module.exports = { run, printHelp };
