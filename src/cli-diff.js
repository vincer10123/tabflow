#!/usr/bin/env node
const { diffByName, formatDiff } = require('./diff');

function printHelp() {
  console.log(`
tabflow diff - Compare two tab sessions

Usage:
  tabflow diff <sessionA> <sessionB> [options]

Options:
  --json        Output diff as JSON
  --short       Only show summary line
  --help        Show this help message

Examples:
  tabflow diff work work-backup
  tabflow diff morning evening --json
  tabflow diff v1 v2 --short
`);
}

function run(args = process.argv.slice(2)) {
  if (args.includes('--help') || args.length === 0) {
    printHelp();
    return;
  }

  const flags = args.filter(a => a.startsWith('--'));
  const names = args.filter(a => !a.startsWith('--'));

  if (names.length < 2) {
    console.error('Error: two session names are required.');
    printHelp();
    process.exit(1);
  }

  const [nameA, nameB] = names;
  const useJson = flags.includes('--json');
  const short = flags.includes('--short');

  try {
    const diff = diffByName(nameA, nameB);

    if (useJson) {
      console.log(JSON.stringify({ nameA, nameB, ...diff }, null, 2));
      return;
    }

    if (short) {
      console.log(`${nameA} → ${nameB}: +${diff.added.length} -${diff.removed.length} =${diff.kept.length}`);
      return;
    }

    console.log(formatDiff(diff, nameA, nameB));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) run();
module.exports = { run, printHelp };
