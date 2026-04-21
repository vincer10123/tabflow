#!/usr/bin/env node
'use strict';

const { getAllSessions } = require('./sessions');
const { filterTabs, filterByPinned, filterByTag, filterByDomain, filterSessionsByMinTabs } = require('./filter');

function printHelp() {
  console.log(`
tabflow filter - Filter tabs and sessions

Usage:
  tabflow filter tabs <session> --domain <domain>
  tabflow filter tabs <session> --tag <tag>
  tabflow filter tabs <session> --pinned
  tabflow filter sessions --min-tabs <n>

Options:
  --domain <domain>   Filter tabs by domain
  --tag <tag>         Filter tabs by tag
  --pinned            Show only pinned tabs
  --min-tabs <n>      Filter sessions with at least n tabs
  --help              Show this help message
`);
}

async function run(args) {
  if (!args.length || args.includes('--help')) {
    printHelp();
    return;
  }

  const subcommand = args[0];

  if (subcommand === 'sessions') {
    const minTabsIdx = args.indexOf('--min-tabs');
    const minTabs = minTabsIdx !== -1 ? parseInt(args[minTabsIdx + 1], 10) : 1;
    const sessions = await getAllSessions();
    const filtered = filterSessionsByMinTabs(sessions, minTabs);
    if (!filtered.length) {
      console.log('No sessions match the filter.');
      return;
    }
    filtered.forEach(s => console.log(`${s.name} (${s.tabs.length} tabs)`));
    return;
  }

  if (subcommand === 'tabs') {
    const sessionName = args[1];
    if (!sessionName) {
      console.error('Error: session name required.');
      process.exit(1);
    }
    const sessions = await getAllSessions();
    const session = sessions.find(s => s.name === sessionName);
    if (!session) {
      console.error(`Error: session "${sessionName}" not found.`);
      process.exit(1);
    }

    let tabs = session.tabs;

    if (args.includes('--pinned')) {
      tabs = filterByPinned(tabs);
    }

    const domainIdx = args.indexOf('--domain');
    if (domainIdx !== -1) {
      tabs = filterByDomain(tabs, args[domainIdx + 1]);
    }

    const tagIdx = args.indexOf('--tag');
    if (tagIdx !== -1) {
      tabs = filterByTag(tabs, args[tagIdx + 1]);
    }

    if (!tabs.length) {
      console.log('No tabs match the filter.');
      return;
    }

    tabs.forEach((t, i) => console.log(`[${i}] ${t.title || t.url}`));
    return;
  }

  console.error(`Unknown subcommand: ${subcommand}`);
  printHelp();
}

module.exports = { printHelp, run };

if (require.main === module) {
  run(process.argv.slice(2)).catch(err => {
    console.error(err.message);
    process.exit(1);
  });
}
