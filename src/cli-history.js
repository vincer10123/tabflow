#!/usr/bin/env node
const { program } = require('commander');
const { getHistory, clearHistory, getHistoryForSession } = require('./history');

program
  .name('tabflow-history')
  .description('View and manage tab session history');

program
  .command('list')
  .description('List recent session activity')
  .option('-n, --limit <number>', 'Max entries to show', '20')
  .action(async (opts) => {
    const history = await getHistory();
    const limit = parseInt(opts.limit, 10);
    const entries = history.slice(0, limit);
    if (!entries.length) {
      console.log('No history found.');
      return;
    }
    entries.forEach((e) => {
      console.log(`[${e.timestamp}] ${e.action.toUpperCase()} — ${e.sessionName}`);
    });
  });

program
  .command('session <name>')
  .description('Show history for a specific session')
  .action(async (name) => {
    const entries = await getHistoryForSession(name);
    if (!entries.length) {
      console.log(`No history for session "${name}".`);
      return;
    }
    entries.forEach((e) => {
      console.log(`[${e.timestamp}] ${e.action.toUpperCase()}`);
    });
  });

program
  .command('clear')
  .description('Clear all session history')
  .action(async () => {
    await clearHistory();
    console.log('History cleared.');
  });

program.parseAsync(process.argv).catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
