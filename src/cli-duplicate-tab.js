#!/usr/bin/env node

/**
 * CLI handler for duplicate-tab operations.
 * Supports duplicating a tab within a session or copying it to another session.
 */

const { duplicateTab, duplicateTabInSession, copyTabToSession } = require('./duplicate-tab');
const { getAllSessions } = require('./sessions');

function printHelp() {
  console.log(`
tabflow duplicate-tab — duplicate or copy tabs between sessions

Usage:
  tabflow duplicate-tab <sessionName> <tabIndex              Duplicate tab within same session
  tabflow duplicate-tab <sessionName> <tabIndex> --to <destCopy tab to another session
  tabflow duplicate-tab --list <sessionName>                  List tabs in a session with indices
	o <session>   Target session name for cross-session copy
  --list           List tabs with their indices
  --help           Show this help message

Examples:
  tabflow duplicate-tab work 2
  tabflow duplicate-tab work 2 --to personal
  tabflow duplicate-tab --list work
`);
}

function listTabsWithIndices(sessionName) {
  const sessions = getAllSessions();
  const session = sessions[sessionName];
  if (!session) {
    console.error(`Session "${sessionName}" not found.`);
    process.exit(1);
  }
  const tabs = session.tabs || [];
  if (tabs.length === 0) {
    console.log(`No tabs in session "${sessionName}".`);
    return;
  }
  console.log(`\nTabs in "${sessionName}":`);
  tabs.forEach((tab, i) => {
    const pinned = tab.pinned ? ' [pinned]' : '';
    console.log(`  [${i}] ${tab.title || '(no title)'}${pinned}`);
    console.log(`      ${tab.url}`);
  });
}

function run(args) {
  if (!args || args.length === 0 || args.includes('--help')) {
    printHelp();
    return;
  }

  // --list <sessionName>
  if (args[0] === '--list') {
    const sessionName = args[1];
    if (!sessionName) {
      console.error('Please provide a session name.');
      process.exit(1);
    }
    listTabsWithIndices(sessionName);
    return;
  }

  const sessionName = args[0];
  const tabIndex = parseInt(args[1], 10);

  if (!sessionName || isNaN(tabIndex)) {
    console.error('Please provide a session name and tab index.');
    printHelp();
    process.exit(1);
  }

  const toIdx = args.indexOf('--to');

  if (toIdx !== -1) {
    // Copy to another session
    const destSession = args[toIdx + 1];
    if (!destSession) {
      console.error('Please provide a destination session name after --to.');
      process.exit(1);
    }
    try {
      const updated = copyTabToSession(sessionName, tabIndex, destSession);
      const tab = (getAllSessions()[sessionName]?.tabs || [])[tabIndex];
      const title = tab ? tab.title || tab.url : `tab ${tabIndex}`;
      console.log(`Copied "${title}" from "${sessionName}" to "${destSession}".`);
      console.log(`"${destSession}" now has ${updated.tabs.length} tab(s).`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  } else {
    // Duplicate within same session
    try {
      const updated = duplicateTabInSession(sessionName, tabIndex);
      const tab = updated.tabs[tabIndex];
      const title = tab ? tab.title || tab.url : `tab ${tabIndex}`;
      console.log(`Duplicated "${title}" in "${sessionName}".`);
      console.log(`Session now has ${updated.tabs.length} tab(s).`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  run(process.argv.slice(2));
}

module.exports = { printHelp, run };
