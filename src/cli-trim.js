#!/usr/bin/env node
// cli-trim.js — CLI interface for trimming tabs from a session

const { getSession, getAllSessions } = require('./sessions');
const { trimToCount, trimByIndices, trimTail, trimByPattern } = require('./trim');
const { saveSession } = require('./storage');

function printHelp() {
  console.log(`
tabflow trim <session> <subcommand> [options]

Subcommands:
  count <n>          Keep only the first N tabs
  tail <n>           Remove the last N tabs
  indices <i,j,...>  Remove tabs at specific indices (0-based, comma-separated)
  pattern <regex>    Remove tabs whose URL matches the given pattern

Examples:
  tabflow trim work count 10
  tabflow trim work tail 3
  tabflow trim work indices 0,2,4
  tabflow trim work pattern "ads\\.com"
`.trim());
}

async function run(args) {
  if (!args.length || args[0] === '--help' || args[0] === '-h') {
    printHelp();
    return;
  }

  const [sessionName, subcommand, value] = args;

  if (!sessionName || !subcommand) {
    console.error('Usage: tabflow trim <session> <subcommand> [value]');
    process.exit(1);
  }

  const session = await getSession(sessionName);
  if (!session) {
    console.error(`Session "${sessionName}" not found.`);
    process.exit(1);
  }

  let trimmed;
  const before = session.tabs.length;

  switch (subcommand) {
    case 'count':
      trimmed = trimToCount(session, parseInt(value, 10));
      break;
    case 'tail':
      trimmed = trimTail(session, parseInt(value, 10));
      break;
    case 'indices': {
      const indices = value.split(',').map(n => parseInt(n.trim(), 10));
      trimmed = trimByIndices(session, indices);
      break;
    }
    case 'pattern':
      trimmed = trimByPattern(session, value);
      break;
    default:
      console.error(`Unknown subcommand: ${subcommand}`);
      printHelp();
      process.exit(1);
  }

  await saveSession(trimmed.name, trimmed);
  const removed = before - trimmed.tabs.length;
  console.log(`Trimmed ${removed} tab(s) from "${sessionName}". ${trimmed.tabs.length} tab(s) remaining.`);
}

module.exports = { printHelp, run };
