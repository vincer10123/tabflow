#!/usr/bin/env node
const { moveTab, moveTabs } = require('./move');

function printHelp() {
  console.log(`
tabflow move — move tabs between sessions

Usage:
  tabflow move <from> <tabIndex> <to>          Move a single tab by index
  tabflow move <from> <i,j,k> <to>             Move multiple tabs (comma-separated indices)

Examples:
  tabflow move work 2 personal
  tabflow move work 0,1,3 archive
`);
}

async function run(args) {
  if (!args.length || args[0] === '--help' || args[0] === '-h') {
    printHelp();
    return;
  }

  const [fromSession, rawIndices, toSession] = args;

  if (!fromSession || rawIndices === undefined || !toSession) {
    console.error('Error: requires <from> <tabIndex> <to>');
    printHelp();
    process.exit(1);
  }

  const indices = String(rawIndices)
    .split(',')
    .map((s) => parseInt(s.trim(), 10));

  if (indices.some(isNaN)) {
    console.error('Error: tab indices must be integers');
    process.exit(1);
  }

  try {
    if (indices.length === 1) {
      const { tab, fromSession: from, toSession: to } = await moveTab(
        fromSession,
        indices[0],
        toSession
      );
      console.log(`Moved tab "${tab.title || tab.url}" from "${from.name}" to "${to.name}"`);
    } else {
      const { moved, fromSession: from, toSession: to } = await moveTabs(
        fromSession,
        indices,
        toSession
      );
      console.log(
        `Moved ${moved.length} tab(s) from "${from.name}" to "${to.name}"`
      );
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  run(process.argv.slice(2));
}

module.exports = { run, printHelp };
