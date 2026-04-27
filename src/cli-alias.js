#!/usr/bin/env node
// cli-alias.js — CLI interface for session aliases

const { setAlias, removeAlias, resolveAlias, listAliases, getAliasesForSession } = require('./alias');

function printHelp() {
  console.log(`
tabflow alias — manage short aliases for sessions

Usage:
  alias set <alias> <session>   Assign an alias to a session
  alias remove <alias>          Remove an alias
  alias resolve <alias>         Print the session name for an alias
  alias list                    List all aliases
  alias for <session>           List all aliases for a session
`);
}

async function run(args = process.argv.slice(2)) {
  const [sub, ...rest] = args;

  if (!sub || sub === '--help' || sub === '-h') {
    printHelp();
    return;
  }

  try {
    if (sub === 'set') {
      const [alias, session] = rest;
      if (!alias || !session) { printHelp(); return; }
      await setAlias(alias, session);
      console.log(`Alias "${alias}" → "${session}" saved.`);

    } else if (sub === 'remove') {
      const [alias] = rest;
      if (!alias) { printHelp(); return; }
      await removeAlias(alias);
      console.log(`Alias "${alias}" removed.`);

    } else if (sub === 'resolve') {
      const [alias] = rest;
      if (!alias) { printHelp(); return; }
      const name = await resolveAlias(alias);
      console.log(name);

    } else if (sub === 'list') {
      const aliases = await listAliases();
      const entries = Object.entries(aliases);
      if (entries.length === 0) {
        console.log('No aliases defined.');
      } else {
        entries.forEach(([a, s]) => console.log(`  ${a.padEnd(16)} → ${s}`));
      }

    } else if (sub === 'for') {
      const [session] = rest;
      if (!session) { printHelp(); return; }
      const aliases = await getAliasesForSession(session);
      if (aliases.length === 0) {
        console.log(`No aliases for "${session}".`);
      } else {
        console.log(`Aliases for "${session}": ${aliases.join(', ')}`);
      }

    } else {
      console.error(`Unknown subcommand: ${sub}`);
      printHelp();
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) run();

module.exports = { printHelp, run };
