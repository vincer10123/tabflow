#!/usr/bin/env node
// cli-notes.js — CLI interface for session notes

const { addNote, getNotes, removeNote, clearNotes } = require('./notes');

const [,, command, sessionName, ...rest] = process.argv;

function printHelp() {
  console.log(`Usage: tabflow notes <command> <session>`);
  console.log(`  add <session> <text>   Add a note to a session`);
  console.log(`  list <session>         List all notes for a session`);
  console.log(`  remove <session> <i>   Remove note at index i`);
  console.log(`  clear <session>        Clear all notes from a session`);
}

async function main() {
  if (!command || !sessionName) return printHelp();

  try {
    if (command === 'add') {
      const text = rest.join(' ');
      if (!text) { console.error('Note text is required'); process.exit(1); }
      const notes = await addNote(sessionName, text);
      console.log(`Note added. Total notes: ${notes.length}`);

    } else if (command === 'list') {
      const notes = await getNotes(sessionName);
      if (notes.length === 0) { console.log('No notes for this session.'); return; }
      notes.forEach((n, i) => console.log(`[${i}] ${n.text}  (${n.createdAt})`));

    } else if (command === 'remove') {
      const index = parseInt(rest[0], 10);
      if (isNaN(index)) { console.error('Valid index required'); process.exit(1); }
      const removed = await removeNote(sessionName, index);
      console.log(`Removed note: "${removed.text}"`);

    } else if (command === 'clear') {
      await clearNotes(sessionName);
      console.log(`All notes cleared from '${sessionName}'.`);

    } else {
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();
