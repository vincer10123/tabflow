#!/usr/bin/env node
const { favoriteTab, unfavoriteTab, getFavoritedTabs } = require('./favorite');

function printHelp() {
  console.log(`
tabflow favorite - manage favorited tabs

Usage:
  tabflow favorite add <session> <url>      Mark a tab as favorite
  tabflow favorite remove <session> <url>   Remove favorite from a tab
  tabflow favorite list <session>           List all favorited tabs in a session
  tabflow favorite help                     Show this help message
`);
}

async function run(args) {
  const [command, sessionName, tabUrl] = args;

  if (!command || command === 'help') {
    printHelp();
    return;
  }

  if (!sessionName) {
    console.error('Error: session name is required');
    process.exit(1);
  }

  try {
    if (command === 'add') {
      if (!tabUrl) { console.error('Error: tab URL is required'); process.exit(1); }
      const tab = await favoriteTab(sessionName, tabUrl);
      console.log(`⭐ Favorited "${tab.title || tabUrl}" in session "${sessionName}"`);

    } else if (command === 'remove') {
      if (!tabUrl) { console.error('Error: tab URL is required'); process.exit(1); }
      const tab = await unfavoriteTab(sessionName, tabUrl);
      console.log(`Removed favorite from "${tab.title || tabUrl}" in session "${sessionName}"`);

    } else if (command === 'list') {
      const tabs = await getFavoritedTabs(sessionName);
      if (tabs.length === 0) {
        console.log(`No favorited tabs in session "${sessionName}"`);
        return;
      }
      console.log(`⭐ Favorited tabs in "${sessionName}" (${tabs.length}):`);
      tabs.forEach(tab => {
        console.log(`  [${tab.favoritedAt ? new Date(tab.favoritedAt).toLocaleDateString() : '?'}] ${tab.title || tab.url}`);
        console.log(`    ${tab.url}`);
      });

    } else {
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
run(args);

module.exports = { printHelp, run };
