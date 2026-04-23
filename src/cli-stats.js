#!/usr/bin/env node
const { getAllSessions, getSession } = require('./sessions');
const { getSessionStats, getGlobalStats } = require('./stats');

function printHelp() {
  console.log(`
Usage: tabflow stats [session-name]

Options:
  --global    Show aggregate stats across all sessions
  --help      Show this help message

Examples:
  tabflow stats work
  tabflow stats --global
`.trim());
}

function printSessionStats(stats) {
  console.log(`\nSession: ${stats.name}`);
  console.log(`  Tabs:           ${stats.tabCount}`);
  console.log(`  Pinned:         ${stats.pinnedCount}`);
  console.log(`  Tags:           ${stats.tagCount}`);
  console.log(`  Unique domains: ${stats.uniqueDomains}`);
  if (stats.topDomain) {
    console.log(`  Top domain:     ${stats.topDomain}`);
  }
  if (stats.createdAt) console.log(`  Created:        ${stats.createdAt}`);
  if (stats.updatedAt) console.log(`  Updated:        ${stats.updatedAt}`);
}

function printGlobalStats(stats) {
  console.log('\nGlobal Stats');
  console.log(`  Sessions:          ${stats.sessionCount}`);
  console.log(`  Total tabs:        ${stats.totalTabs}`);
  console.log(`  Avg tabs/session:  ${stats.avgTabsPerSession}`);
  console.log(`  Unique domains:    ${stats.uniqueDomains}`);
  if (stats.topDomains.length) {
    console.log('  Top domains:');
    stats.topDomains.forEach(({ domain, count }) => {
      console.log(`    ${domain} (${count})`);
    });
  }
}

function run(args = process.argv.slice(2)) {
  if (args.includes('--help')) {
    printHelp();
    return;
  }

  if (args.includes('--global') || args.length === 0) {
    const sessions = getAllSessions();
    const stats = getGlobalStats(sessions);
    printGlobalStats(stats);
    return;
  }

  const name = args[0];
  const session = getSession(name);
  if (!session) {
    console.error(`Session "${name}" not found.`);
    process.exit(1);
  }

  const stats = getSessionStats(session);
  printSessionStats(stats);
}

if (require.main === module) run();
module.exports = { run, printHelp };
