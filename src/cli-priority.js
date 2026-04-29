#!/usr/bin/env node
'use strict';

const { getSession, saveSession } = require('./sessions');
const {
  setTabPriority,
  clearTabPriority,
  filterByPriority,
  sortByPriority,
  getPrioritySummary,
  PRIORITY_LEVELS,
} = require('./priority');

function printHelp() {
  console.log(`
tabflow priority <command> [options]

Commands:
  set <session> <index> <level>   Set priority for a tab (low|normal|high|critical)
  clear <session> <index>         Remove priority from a tab
  filter <session> <level>        List tabs with a given priority
  sort <session>                  Display tabs sorted by priority
  summary <session>               Show priority counts for a session

Priority levels: ${PRIORITY_LEVELS.join(', ')}
  `.trim());
}

async function run(argv) {
  const [cmd, sessionName, second, third] = argv;

  if (!cmd || cmd === '--help' || cmd === '-h') {
    printHelp();
    return;
  }

  if (cmd === 'set') {
    const session = await getSession(sessionName);
    const updated = setTabPriority(session, parseInt(second, 10), third);
    await saveSession(updated);
    console.log(`Set priority '${third}' on tab ${second} in '${sessionName}'`);
    return;
  }

  if (cmd === 'clear') {
    const session = await getSession(sessionName);
    const updated = clearTabPriority(session, parseInt(second, 10));
    await saveSession(updated);
    console.log(`Cleared priority on tab ${second} in '${sessionName}'`);
    return;
  }

  if (cmd === 'filter') {
    const session = await getSession(sessionName);
    const tabs = filterByPriority(session, second);
    if (tabs.length === 0) {
      console.log(`No tabs with priority '${second}' in '${sessionName}'`);
      return;
    }
    tabs.forEach((tab, i) => console.log(`  [${i}] ${tab.url} (${tab.title || 'no title'})`));
    return;
  }

  if (cmd === 'sort') {
    const session = await getSession(sessionName);
    const sorted = sortByPriority(session);
    sorted.tabs.forEach((tab, i) => {
      const p = tab.priority || 'normal';
      console.log(`  [${i}] [${p}] ${tab.url}`);
    });
    return;
  }

  if (cmd === 'summary') {
    const session = await getSession(sessionName);
    const summary = getPrioritySummary(session);
    PRIORITY_LEVELS.forEach(level => {
      console.log(`  ${level}: ${summary[level]}`);
    });
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  printHelp();
}

if (require.main === module) {
  run(process.argv.slice(2)).catch(err => {
    console.error(err.message);
    process.exit(1);
  });
}

module.exports = { printHelp, run };
