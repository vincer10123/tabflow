#!/usr/bin/env node
// cli-hotkey.js — CLI interface for managing session hotkeys

const { setHotkey, clearHotkey, getHotkey, listHotkeys } = require('./hotkey');
const { getAllSessions } = require('./sessions');

function printHelp() {
  console.log(`
tabflow hotkey <command> [args]

Commands:
  set <session> <key>   Assign a hotkey (1-2 chars) to a session
  clear <session>       Remove the hotkey from a session
  get <session>         Show the hotkey for a session
  list                  List all sessions with hotkeys

Examples:
  tabflow hotkey set work w
  tabflow hotkey clear work
  tabflow hotkey list
`);
}

async function run(args) {
  const [cmd, ...rest] = args;

  if (!cmd || cmd === '--help' || cmd === '-h') {
    printHelp();
    return;
  }

  try {
    if (cmd === 'set') {
      const [sessionName, hotkey] = rest;
      if (!sessionName || !hotkey) {
        console.error('Usage: tabflow hotkey set <session> <key>');
        process.exit(1);
      }
      await setHotkey(sessionName, hotkey);
      console.log(`Hotkey "${hotkey.toLowerCase()}" assigned to session "${sessionName}".`);

    } else if (cmd === 'clear') {
      const [sessionName] = rest;
      if (!sessionName) {
        console.error('Usage: tabflow hotkey clear <session>');
        process.exit(1);
      }
      await clearHotkey(sessionName);
      console.log(`Hotkey cleared from session "${sessionName}".`);

    } else if (cmd === 'get') {
      const [sessionName] = rest;
      if (!sessionName) {
        console.error('Usage: tabflow hotkey get <session>');
        process.exit(1);
      }
      const key = await getHotkey(sessionName);
      console.log(key ? `Hotkey for "${sessionName}": ${key}` : `No hotkey set for "${sessionName}".`);

    } else if (cmd === 'list') {
      const sessions = await getAllSessions();
      const list = await listHotkeys(sessions);
      if (list.length === 0) {
        console.log('No hotkeys assigned.');
      } else {
        list.forEach(({ hotkey, name }) => console.log(`  [${hotkey}]  ${name}`));
      }

    } else {
      console.error(`Unknown command: ${cmd}`);
      printHelp();
      process.exit(1);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  run(process.argv.slice(2));
}

module.exports = { printHelp, run };
