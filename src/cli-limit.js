#!/usr/bin/env node
'use strict';

const { getLimit, setLimit, clearLimit, isAtLimit, guardLimit, enforceLimit } = require('./limit');

function printHelp() {
  console.log(`
tabflow limit - Manage per-session tab limits

Usage:
  tabflow limit <session> get         Show current limit for a session
  tabflow limit <session> set <n>     Set max tabs for a session
  tabflow limit <session> clear       Remove limit from a session
  tabflow limit <session> check       Check if session is at or over limit

Options:
  --help    Show this help message

Examples:
  tabflow limit work set 20
  tabflow limit work get
  tabflow limit work check
  tabflow limit work clear
`);
}

async function run(args) {
  if (!args.length || args.includes('--help')) {
    printHelp();
    process.exit(0);
  }

  const [sessionName, command, ...rest] = args;

  if (!sessionName || !command) {
    printHelp();
    process.exit(1);
  }

  const { loadSession, saveSession } = require('./storage');

  try {
    const session = await loadSession(sessionName);

    switch (command) {
      case 'get': {
        const limit = getLimit(session);
        if (limit === null || limit === undefined) {
          console.log(`No limit set for session "${sessionName}".`);
        } else {
          console.log(`Limit for "${sessionName}": ${limit} tabs`);
        }
        break;
      }
      case 'set': {
        const n = parseInt(rest[0], 10);
        if (isNaN(n) || n < 1) {
          console.error('Limit must be a positive integer.');
          process.exit(1);
        }
        const updated = setLimit(session, n);
        await saveSession(sessionName, updated);
        console.log(`Limit for "${sessionName}" set to ${n} tabs.`);
        break;
      }
      case 'clear': {
        const updated = clearLimit(session);
        await saveSession(sessionName, updated);
        console.log(`Limit cleared for "${sessionName}".`);
        break;
      }
      case 'check': {
        const atLimit = isAtLimit(session);
        const limit = getLimit(session);
        const tabCount = (session.tabs || []).length;
        if (limit === null || limit === undefined) {
          console.log(`No limit set for "${sessionName}" (${tabCount} tabs).`);
        } else if (atLimit) {
          console.log(`"${sessionName}" is AT or OVER limit: ${tabCount}/${limit} tabs.`);
        } else {
          console.log(`"${sessionName}" is within limit: ${tabCount}/${limit} tabs.`);
        }
        break;
      }
      default:
        console.error(`Unknown command: ${command}`);
        printHelp();
        process.exit(1);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { printHelp, run };

if (require.main === module) {
  run(process.argv.slice(2));
}
