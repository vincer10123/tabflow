#!/usr/bin/env node

'use strict';

const { getRecentSessions, getRecentlyModifiedSessions, getLastSession } = require('./recent');

function printHelp() {
  console.log(`
tabflow recent - View recently accessed or modified sessions

Usage:
  tabflow recent [options]

Options:
  --modified         Show recently modified sessions instead of accessed
  --last             Show only the last accessed session
  --limit <n>        Number of sessions to show (default: 5)
  --help             Show this help message

Examples:
  tabflow recent
  tabflow recent --modified
  tabflow recent --last
  tabflow recent --limit 10
`);
}

async function run(args = []) {
  if (args.includes('--help')) {
    printHelp();
    return;
  }

  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : 5;

  if (isNaN(limit) || limit < 1) {
    console.error('Error: --limit must be a positive number');
    process.exit(1);
  }

  if (args.includes('--last')) {
    const session = await getLastSession();
    if (!session) {
      console.log('No sessions found.');
      return;
    }
    console.log(`Last session: ${session.name} (${session.tabs.length} tab(s))`);
    return;
  }

  const sessions = args.includes('--modified')
    ? await getRecentlyModifiedSessions(limit)
    : await getRecentSessions(limit);

  if (!sessions.length) {
    console.log('No recent sessions found.');
    return;
  }

  const label = args.includes('--modified') ? 'recently modified' : 'recently accessed';
  console.log(`\nTop ${sessions.length} ${label} sessions:\n`);

  sessions.forEach((s, i) => {
    const date = new Date(s.updatedAt || s.createdAt).toLocaleString();
    console.log(`  ${i + 1}. ${s.name} — ${s.tabs.length} tab(s) — ${date}`);
  });

  console.log('');
}

module.exports = { printHelp, run };

if (require.main === module) {
  run(process.argv.slice(2)).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}
