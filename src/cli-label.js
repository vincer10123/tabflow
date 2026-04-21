#!/usr/bin/env node
const { addLabel, removeLabel, getLabels, groupByLabel } = require('./label');
const { getAllSessions } = require('./sessions');

function printHelp() {
  console.log(`
tabflow label - manage labels on sessions

Usage:
  tabflow label add <session> <label>      Add a label to a session
  tabflow label remove <session> <label>   Remove a label from a session
  tabflow label list <session>             List labels for a session
  tabflow label group                      Group all sessions by label
  tabflow label --help                     Show this help
`);
}

async function run(args = process.argv.slice(2)) {
  const [sub, ...rest] = args;

  if (!sub || sub === '--help') return printHelp();

  if (sub === 'add') {
    const [sessionName, label] = rest;
    if (!sessionName || !label) {
      console.error('Usage: tabflow label add <session> <label>');
      process.exit(1);
    }
    const labels = await addLabel(sessionName, label);
    console.log(`Labels for "${sessionName}": ${labels.join(', ') || '(none)'}`);
    return;
  }

  if (sub === 'remove') {
    const [sessionName, label] = rest;
    if (!sessionName || !label) {
      console.error('Usage: tabflow label remove <session> <label>');
      process.exit(1);
    }
    const labels = await removeLabel(sessionName, label);
    console.log(`Labels for "${sessionName}": ${labels.join(', ') || '(none)'}`);
    return;
  }

  if (sub === 'list') {
    const [sessionName] = rest;
    if (!sessionName) {
      console.error('Usage: tabflow label list <session>');
      process.exit(1);
    }
    const labels = await getLabels(sessionName);
    console.log(labels.length ? labels.join(', ') : '(no labels)');
    return;
  }

  if (sub === 'group') {
    const sessions = await getAllSessions();
    const groups = await groupByLabel(sessions);
    for (const [label, items] of Object.entries(groups)) {
      console.log(`\n[${label}]`);
      items.forEach(s => console.log(`  - ${s.name}`));
    }
    return;
  }

  console.error(`Unknown subcommand: ${sub}`);
  printHelp();
  process.exit(1);
}

if (require.main === module) run();
module.exports = { run, printHelp };
