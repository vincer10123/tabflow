#!/usr/bin/env node
const { program } = require('commander');
const { takeSnapshot, listSnapshots, restoreSnapshot, deleteSnapshot, pruneSnapshots } = require('./snapshots');
const { loadSession, saveSession } = require('./storage');

program
  .command('take <session>')
  .description('Take a snapshot of a session')
  .action(async (session) => {
    const data = await loadSession(session);
    if (!data) return console.error(`Session not found: ${session}`);
    const name = await takeSnapshot(session, data);
    console.log(`Snapshot taken: ${name}`);
  });

program
  .command('list <session>')
  .description('List snapshots for a session')
  .action(async (session) => {
    const snaps = await listSnapshots(session);
    if (!snaps.length) return console.log('No snapshots found.');
    snaps.forEach(s => console.log(s));
  });

program
  .command('restore <snapshot>')
  .description('Restore a snapshot by name')
  .action(async (snapshot) => {
    const data = await restoreSnapshot(snapshot);
    await saveSession(data.snapshotOf, data);
    console.log(`Restored ${snapshot} -> ${data.snapshotOf}`);
  });

program
  .command('delete <snapshot>')
  .description('Delete a specific snapshot')
  .action(async (snapshot) => {
    await deleteSnapshot(snapshot);
    console.log(`Deleted snapshot: ${snapshot}`);
  });

program
  .command('prune <session>')
  .option('-k, --keep <n>', 'Number of snapshots to keep', '5')
  .description('Prune old snapshots for a session')
  .action(async (session, opts) => {
    const deleted = await pruneSnapshots(session, parseInt(opts.keep));
    console.log(`Pruned ${deleted.length} snapshot(s).`);
  });

program.parse(process.argv);
