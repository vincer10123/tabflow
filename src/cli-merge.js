#!/usr/bin/env node
'use strict';

const { mergeSessions, mergeAllSessions } = require('./merge');

const args = process.argv.slice(2);

function printHelp() {
  console.log(`
tabflow merge — merge sessions into one

Usage:
  merge <session1> <session2> [..more] --into <target> [--dedupe]
  merge --all --into <target> [--dedupe]

Options:
  --into <name>   Name for the resulting merged session (required)
  --dedupe        Remove duplicate URLs during merge
  --all           Merge all existing sessions
  --help          Show this help message
`);
}

async function main() {
  if (args.includes('--help') || args.length === 0) {
    printHelp();
    process.exit(0);
  }

  const intoIdx = args.indexOf('--into');
  if (intoIdx === -1 || !args[intoIdx + 1]) {
    console.error('Error: --into <target> is required');
    process.exit(1);
  }

  const targetName = args[intoIdx + 1];
  const dedupe = args.includes('--dedupe');
  const mergeAll = args.includes('--all');

  try {
    let result;
    if (mergeAll) {
      result = await mergeAllSessions(targetName, { dedupe });
    } else {
      const sessionNames = args.filter(
        (a, i) => !a.startsWith('--') && i !== intoIdx + 1
      );
      if (sessionNames.length < 2) {
        console.error('Error: provide at least two session names or use --all');
        process.exit(1);
      }
      result = await mergeSessions(sessionNames, targetName, { dedupe });
    }
    console.log(`Merged ${result.mergedFrom.length} sessions into "${result.name}" (${result.tabs.length} tabs)`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
