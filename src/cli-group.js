#!/usr/bin/env node
const { groupSessionByDomain, groupSessionByTag, groupTabsByDomain, groupTabsByTag } = require('./group');
const { loadSession } = require('./storage');

function printHelp() {
  console.log(`
Usage: tabflow group <command> <session>

Commands:
  by-domain <session>   Reorder tabs grouped by domain
  by-tag <session>      Reorder tabs grouped by tag
  show-domain <session> Print domain groups without saving
  show-tag <session>    Print tag groups without saving

Examples:
  tabflow group by-domain work
  tabflow group show-tag research
`);
}

async function run(args) {
  const [command, sessionName] = args;

  if (!command || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  if (!sessionName) {
    console.error('Error: session name required');
    process.exit(1);
  }

  if (command === 'by-domain') {
    const updated = await groupSessionByDomain(sessionName);
    console.log(`Grouped ${updated.tabs.length} tabs by domain in "${sessionName}"`);
    return;
  }

  if (command === 'by-tag') {
    const updated = await groupSessionByTag(sessionName);
    console.log(`Grouped ${updated.tabs.length} tabs by tag in "${sessionName}"`);
    return;
  }

  if (command === 'show-domain' || command === 'show-tag') {
    const session = await loadSession(sessionName);
    if (!session) { console.error(`Session "${sessionName}" not found`); process.exit(1); }
    const groups = command === 'show-domain' ? groupTabsByDomain(session) : groupTabsByTag(session);
    for (const [key, tabs] of Object.entries(groups).sort()) {
      console.log(`\n[${key}] (${tabs.length})`);
      for (const tab of tabs) console.log(`  - ${tab.title || tab.url}`);
    }
    return;
  }

  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}

if (require.main === module) {
  run(process.argv.slice(2)).catch(err => { console.error(err.message); process.exit(1); });
}

module.exports = { run, printHelp };
