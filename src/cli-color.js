#!/usr/bin/env node
// cli-color.js — CLI for color-tagging sessions and tabs

const { setColor, clearColor, getColor, filterByColor, groupByColor } = require('./color');
const { getAllSessions, getSession, saveSession } = require('./sessions');

function printHelp() {
  console.log(`
tabflow color — Tag sessions with colors

Usage:
  tabflow color set <session> <color>    Set a color for a session
  tabflow color clear <session>          Remove color from a session
  tabflow color get <session>            Show color for a session
  tabflow color filter <color>           List sessions with a given color
  tabflow color group                    Group all sessions by color
  tabflow color list                     Show all sessions with their colors

Available colors: red, orange, yellow, green, blue, purple, pink, gray
`);
}

async function run(args) {
  const [cmd, ...rest] = args;

  if (!cmd || cmd === '--help' || cmd === '-h') {
    printHelp();
    return;
  }

  if (cmd === 'set') {
    const [sessionName, color] = rest;
    if (!sessionName || !color) {
      console.error('Usage: tabflow color set <session> <color>');
      process.exit(1);
    }
    const session = await getSession(sessionName);
    const updated = setColor(session, color);
    await saveSession(updated);
    console.log(`Color "${color}" set for session "${sessionName}".`);
    return;
  }

  if (cmd === 'clear') {
    const [sessionName] = rest;
    if (!sessionName) {
      console.error('Usage: tabflow color clear <session>');
      process.exit(1);
    }
    const session = await getSession(sessionName);
    const updated = clearColor(session);
    await saveSession(updated);
    console.log(`Color cleared for session "${sessionName}".`);
    return;
  }

  if (cmd === 'get') {
    const [sessionName] = rest;
    if (!sessionName) {
      console.error('Usage: tabflow color get <session>');
      process.exit(1);
    }
    const session = await getSession(sessionName);
    const color = getColor(session);
    console.log(color ? `Session "${sessionName}" color: ${color}` : `No color set for "${sessionName}".`);
    return;
  }

  if (cmd === 'filter') {
    const [color] = rest;
    if (!color) {
      console.error('Usage: tabflow color filter <color>');
      process.exit(1);
    }
    const sessions = await getAllSessions();
    const matches = filterByColor(sessions, color);
    if (matches.length === 0) {
      console.log(`No sessions with color "${color}".`);
    } else {
      console.log(`Sessions with color "${color}":`);
      matches.forEach(s => console.log(`  - ${s.name}`));
    }
    return;
  }

  if (cmd === 'group') {
    const sessions = await getAllSessions();
    const groups = groupByColor(sessions);
    for (const [color, list] of Object.entries(groups)) {
      console.log(`\n[${color}]`);
      list.forEach(s => console.log(`  - ${s.name}`));
    }
    return;
  }

  if (cmd === 'list') {
    const sessions = await getAllSessions();
    sessions.forEach(s => {
      const color = getColor(s);
      console.log(`  ${s.name}: ${color || '(none)'}`);
    });
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  printHelp();
  process.exit(1);
}

module.exports = { printHelp, run };

if (require.main === module) {
  run(process.argv.slice(2));
}
