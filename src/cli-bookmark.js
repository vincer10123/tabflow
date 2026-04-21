#!/usr/bin/env node
'use strict';

const { getSession, getAllSessions } = require('./sessions');
const { bookmarkTab, unbookmarkTab, getBookmarkedTabs, getAllBookmarkedTabs } = require('./bookmark');
const { saveSession } = require('./storage');

function printHelp() {
  console.log(`
tabflow bookmark - manage bookmarked tabs

Usage:
  tabflow bookmark add <session> <tabIndex>     Bookmark a tab by index
  tabflow bookmark remove <session> <tabIndex>  Remove bookmark from a tab
  tabflow bookmark list <session>               List bookmarked tabs in a session
  tabflow bookmark list-all                     List all bookmarks across sessions
  tabflow bookmark help                         Show this help
`);
}

async function run(args) {
  const [cmd, ...rest] = args;

  if (!cmd || cmd === 'help') {
    printHelp();
    return;
  }

  if (cmd === 'add') {
    const [sessionName, idxStr] = rest;
    if (!sessionName || idxStr === undefined) return printHelp();
    const session = await getSession(sessionName);
    if (!session) return console.error(`Session "${sessionName}" not found`);
    const idx = parseInt(idxStr, 10);
    const updated = bookmarkTab(session, idx);
    await saveSession(sessionName, updated);
    console.log(`Bookmarked tab ${idx} in "${sessionName}"`);
    return;
  }

  if (cmd === 'remove') {
    const [sessionName, idxStr] = rest;
    if (!sessionName || idxStr === undefined) return printHelp();
    const session = await getSession(sessionName);
    if (!session) return console.error(`Session "${sessionName}" not found`);
    const idx = parseInt(idxStr, 10);
    const updated = unbookmarkTab(session, idx);
    await saveSession(sessionName, updated);
    console.log(`Removed bookmark from tab ${idx} in "${sessionName}"`);
    return;
  }

  if (cmd === 'list') {
    const [sessionName] = rest;
    if (!sessionName) return printHelp();
    const session = await getSession(sessionName);
    if (!session) return console.error(`Session "${sessionName}" not found`);
    const bookmarks = getBookmarkedTabs(session);
    if (bookmarks.length === 0) return console.log('No bookmarked tabs.');
    bookmarks.forEach((t, i) => console.log(`  [${i}] ${t.title} — ${t.url}`));
    return;
  }

  if (cmd === 'list-all') {
    const sessions = await getAllSessions();
    const all = getAllBookmarkedTabs(sessions);
    if (all.length === 0) return console.log('No bookmarks found.');
    all.forEach(({ sessionName, tab }) =>
      console.log(`  [${sessionName}] ${tab.title} — ${tab.url}`)
    );
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  printHelp();
}

if (require.main === module) {
  run(process.argv.slice(2)).catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}

module.exports = { run, printHelp };
