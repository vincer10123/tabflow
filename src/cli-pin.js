#!/usr/bin/env node
const { pinTab, unpinTab, getPinnedTabs, clearPins } = require('./pin');

const [,, command, sessionName, tabUrl] = process.argv;

function printHelp() {
  console.log(`
tabflow pin <command> [session] [url]

Commands:
  add <session> <url>     Pin a tab in a session
  remove <session> <url>  Unpin a tab in a session
  list <session>          List all pinned tabs
  clear <session>         Clear all pins in a session
  `);
}

async function main() {
  if (!command || command === '--help') return printHelp();

  try {
    if (command === 'add') {
      if (!sessionName || !tabUrl) return console.error('Usage: tabflow pin add <session> <url>');
      const tab = await pinTab(sessionName, tabUrl);
      console.log(`Pinned: ${tab.title || tab.url}`);

    } else if (command === 'remove') {
      if (!sessionName || !tabUrl) return console.error('Usage: tabflow pin remove <session> <url>');
      const tab = await unpinTab(sessionName, tabUrl);
      console.log(`Unpinned: ${tab.title || tab.url}`);

    } else if (command === 'list') {
      if (!sessionName) return console.error('Usage: tabflow pin list <session>');
      const tabs = await getPinnedTabs(sessionName);
      if (tabs.length === 0) return console.log('No pinned tabs.');
      tabs.forEach(t => console.log(`  [pinned] ${t.title || t.url} — ${t.url}`));

    } else if (command === 'clear') {
      if (!sessionName) return console.error('Usage: tabflow pin clear <session>');
      await clearPins(sessionName);
      console.log(`All pins cleared from '${sessionName}'.`);

    } else {
      console.error(`Unknown command: ${command}`);
      printHelp();
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();
