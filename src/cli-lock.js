#!/usr/bin/env node

import { lockSession, unlockSession, isLocked, guardLocked } from './lock.js';
import { getSession } from './sessions.js';

function printHelp() {
  console.log(`
tabflow lock - Protect sessions from modification or deletion

Usage:
  tabflow lock <session>         Lock a session
  tabflow lock --unlock <session> Unlock a session
  tabflow lock --status <session> Check lock status

Options:
  --unlock   Remove lock from a session
  --status   Show whether a session is locked
  -h, --help Show this help message
`);
}

export async function run(args = process.argv.slice(2)) {
  if (args.includes('-h') || args.includes('--help') || args.length === 0) {
    printHelp();
    return;
  }

  const unlockFlag = args.includes('--unlock');
  const statusFlag = args.includes('--status');
  const name = args.find(a => !a.startsWith('--'));

  if (!name) {
    console.error('Error: session name is required');
    process.exit(1);
  }

  try {
    const session = await getSession(name);
    if (!session) {
      console.error(`Error: session "${name}" not found`);
      process.exit(1);
    }

    if (statusFlag) {
      const locked = isLocked(session);
      console.log(`Session "${name}" is ${locked ? 'locked 🔒' : 'unlocked 🔓'}`);
      return;
    }

    if (unlockFlag) {
      const updated = unlockSession(session);
      console.log(`Unlocked session "${name}" 🔓`);
      return updated;
    }

    const updated = lockSession(session);
    console.log(`Locked session "${name}" 🔒`);
    return updated;
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

run();
