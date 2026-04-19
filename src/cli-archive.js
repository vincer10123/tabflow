#!/usr/bin/env node
const { archiveSession, restoreSession, listArchived } = require('./archive');

const [,, command, name] = process.argv;

function printHelp() {
  console.log('Usage: tabflow archive <command> [name]');
  console.log('Commands:');
  console.log('  archive <name>   Archive a session');
  console.log('  restore <name>   Restore an archived session');
  console.log('  list             List all archived sessions');
}

function run() {
  if (!command || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  if (command === 'list') {
    const sessions = listArchived();
    if (sessions.length === 0) {
      console.log('No archived sessions found.');
    } else {
      console.log('Archived sessions:');
      sessions.forEach(s => console.log(`  - ${s}`));
    }
    return;
  }

  if (!name) {
    console.error('Error: session name is required');
    process.exit(1);
  }

  if (command === 'archive') {
    try {
      archiveSession(name);
      console.log(`Session "${name}" archived.`);
    } catch (e) {
      console.error(`Error: ${e.message}`);
      process.exit(1);
    }
    return;
  }

  if (command === 'restore') {
    try {
      restoreSession(name);
      console.log(`Session "${name}" restored.`);
    } catch (e) {
      console.error(`Error: ${e.message}`);
      process.exit(1);
    }
    return;
  }

  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}

run();
