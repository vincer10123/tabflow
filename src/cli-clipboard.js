#!/usr/bin/env node
const { getSession } = require('./sessions');
const { copyUrlsToClipboard, copyAsText, copyAsMarkdown, copyTab, parseClipboardUrls } = require('./clipboard');
const { createSession } = require('./sessions');

function printHelp() {
  console.log(`
tabflow clipboard <command> [options]

Commands:
  urls <session>           Print all URLs (one per line)
  text <session>           Print session as plain text
  markdown <session>       Print session as markdown
  tab <session> <index>    Print a single tab as text
  import <session> <file>  Import newline-separated URLs as a new session

Examples:
  tabflow clipboard urls work
  tabflow clipboard markdown work | pbcopy
  tabflow clipboard tab work 0
  tabflow clipboard import newsession urls.txt
  `);
}

async function run(args) {
  const [command, sessionName, extra] = args;

  if (!command || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  if (command === 'urls' || command === 'text' || command === 'markdown') {
    if (!sessionName) {
      console.error('Error: session name required');
      process.exit(1);
    }
    const session = await getSession(sessionName);
    if (!session) {
      console.error(`Session "${sessionName}" not found`);
      process.exit(1);
    }
    if (command === 'urls') console.log(copyUrlsToClipboard(session));
    else if (command === 'text') console.log(copyAsText(session));
    else console.log(copyAsMarkdown(session));
    return;
  }

  if (command === 'tab') {
    const index = parseInt(extra, 10);
    const session = await getSession(sessionName);
    if (!session) { console.error(`Session "${sessionName}" not found`); process.exit(1); }
    const tab = session.tabs[index];
    if (!tab) { console.error(`Tab index ${index} not found`); process.exit(1); }
    console.log(copyTab(tab));
    return;
  }

  if (command === 'import') {
    const fs = require('fs');
    const filePath = extra;
    if (!sessionName || !filePath) {
      console.error('Usage: tabflow clipboard import <session> <file>');
      process.exit(1);
    }
    const text = fs.readFileSync(filePath, 'utf8');
    const tabs = parseClipboardUrls(text);
    if (tabs.length === 0) { console.error('No valid URLs found in file'); process.exit(1); }
    await createSession(sessionName, tabs);
    console.log(`Imported ${tabs.length} tabs into session "${sessionName}"`);
    return;
  }

  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}

module.exports = { printHelp, run };
