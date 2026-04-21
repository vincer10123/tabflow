#!/usr/bin/env node

'use strict';

const { getSession, createSession } = require('./sessions');
const {
  sortTabsByTitle,
  sortTabsByUrl,
  sortTabsByDate,
  sortSessionsByName,
  sortSessionsByTabCount
} = require('./sort');
const { getAllSessions } = require('./sessions');

function printHelp() {
  console.log(`
tabflow sort - Sort tabs or sessions

Usage:
  tabflow sort tabs <session> --by <field> [--desc]
  tabflow sort sessions --by <field> [--desc]

Fields for tabs:     title, url, date
Fields for sessions: name, tabcount

Options:
  --desc     Sort in descending order
  --help     Show this help message

Examples:
  tabflow sort tabs work --by title
  tabflow sort tabs work --by url --desc
  tabflow sort sessions --by tabcount --desc
`);
}

const VALID_TAB_FIELDS = ['title', 'url', 'date'];
const VALID_SESSION_FIELDS = ['name', 'tabcount'];

async function run(args) {
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }

  const desc = args.includes('--desc');
  const byIndex = args.indexOf('--by');
  const by = byIndex !== -1 ? args[byIndex + 1] : 'title';

  if (args[0] === 'tabs') {
    const sessionName = args[1];
    if (!sessionName) {
      console.error('Error: session name required');
      process.exit(1);
    }

    if (!VALID_TAB_FIELDS.includes(by)) {
      console.error(`Error: invalid sort field "${by}" for tabs. Valid fields: ${VALID_TAB_FIELDS.join(', ')}`);
      process.exit(1);
    }

    const session = await getSession(sessionName);
    if (!session) {
      console.error(`Error: session "${sessionName}" not found`);
      process.exit(1);
    }

    let sorted;
    if (by === 'url') sorted = sortTabsByUrl(session.tabs, desc);
    else if (by === 'date') sorted = sortTabsByDate(session.tabs, desc);
    else sorted = sortTabsByTitle(session.tabs, desc);

    await createSession(sessionName, sorted);
    console.log(`Sorted ${sorted.length} tabs in "${sessionName}" by ${by}${desc ? ' (desc)' : ''}.`);

  } else if (args[0] === 'sessions') {
    if (!VALID_SESSION_FIELDS.includes(by)) {
      console.error(`Error: invalid sort field "${by}" for sessions. Valid fields: ${VALID_SESSION_FIELDS.join(', ')}`);
      process.exit(1);
    }

    const sessions = await getAllSessions();
    let sorted;
    if (by === 'tabcount') sorted = sortSessionsByTabCount(sessions, desc);
    else sorted = sortSessionsByName(sessions, desc);

    console.log(`Sessions sorted by ${by}${desc ? ' (desc)' : ''}:`);
    sorted.forEach(s => console.log(`  ${s.name} (${s.tabs.length} tabs)`));

  } else {
    printHelp();
  }
}

if (require.main === module) {
  run(process.argv.slice(2)).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}

module.exports = { printHelp, run };
