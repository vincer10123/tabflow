#!/usr/bin/env node
const { renameSession } = require('./rename');

const args = process.argv.slice(2);

function printHelp() {
  console.log(`
Usage: tabflow rename <old-name> <new-name>

Renames an existing session.

Arguments:
  old-name   Current name of the session
  new-name   New name for the session

Examples:
  tabflow rename work work-backup
  tabflow rename personal personal-2024
  `);
}

async function main() {
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const [oldName, newName] = args;

  if (!oldName || !newName) {
    console.error('Error: Both old and new session names are required.');
    printHelp();
    process.exit(1);
  }

  try {
    const session = await renameSession(oldName, newName);
    console.log(`Session renamed: "${oldName}" → "${session.name}"`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();
