#!/usr/bin/env node
// cli-sync.js — CLI interface for syncing/comparing session profiles

const { getAllSessions } = require('./sessions');
const { diffProfiles, mergeProfiles, getSyncStatus } = require('./sync');

function printHelp() {
  console.log(`
tabflow sync — compare and merge session profiles

Usage:
  tabflow sync diff <profileA> <profileB>   Show differences between two session lists
  tabflow sync merge <strategy>             Merge current sessions using strategy (union|overwrite|newer)
  tabflow sync status                       Show sync status (name, tab count, age)

Strategies:
  union      Keep all sessions, prefer A on conflict  (default)
  overwrite  Always use B values on conflict
  newer      Keep whichever session was updated most recently
`);
}

async function run(args) {
  const [cmd, ...rest] = args;

  if (!cmd || cmd === '--help' || cmd === '-h') {
    printHelp();
    return;
  }

  if (cmd === 'status') {
    const sessions = await getAllSessions();
    const status = getSyncStatus(sessions);
    if (!status.length) {
      console.log('No sessions found.');
      return;
    }
    console.log('\nSync Status:');
    for (const s of status) {
      const age = s.age !== null ? `${s.age}s ago` : 'unknown';
      console.log(`  ${s.name.padEnd(24)} tabs: ${s.tabCount}  updated: ${age}`);
    }
    return;
  }

  if (cmd === 'merge') {
    const strategy = rest[0] || 'union';
    const sessions = await getAllSessions();
    const merged = mergeProfiles(sessions, sessions, strategy);
    console.log(`Merged ${merged.length} sessions using strategy: ${strategy}`);
    return;
  }

  if (cmd === 'diff') {
    const sessions = await getAllSessions();
    const half = Math.ceil(sessions.length / 2);
    const a = sessions.slice(0, half);
    const b = sessions.slice(half);
    const { onlyInA, onlyInB, inBoth } = diffProfiles(a, b);
    console.log(`Only in A: ${onlyInA.map(s => s.name).join(', ') || 'none'}`);
    console.log(`Only in B: ${onlyInB.map(s => s.name).join(', ') || 'none'}`);
    console.log(`In both:   ${inBoth.map(s => s.name).join(', ') || 'none'}`);
    return;
  }

  console.error(`Unknown sync command: ${cmd}`);
  printHelp();
}

if (require.main === module) {
  run(process.argv.slice(2)).catch(err => {
    console.error(err.message);
    process.exit(1);
  });
}

module.exports = { printHelp, run };
