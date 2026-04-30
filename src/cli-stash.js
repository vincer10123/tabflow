#!/usr/bin/env node
'use strict';

const { stashTabs, popStash, listStashes, dropStash, peekStash } = require('./stash');

function printHelp() {
  console.log(`
tabflow stash - temporarily park tabs aside

Usage:
  tabflow stash <session> <indices...> [--name <stashName>]  Stash tabs by index
  tabflow stash pop <stashName> [--to <session>]             Restore stash into session
  tabflow stash list                                         List all stashes
  tabflow stash drop <stashName>                             Discard a stash
  tabflow stash peek <stashName>                             Preview stash contents

Examples:
  tabflow stash work 0 2 4 --name sidebar
  tabflow stash pop sidebar --to work
  tabflow stash list
  tabflow stash drop sidebar
`.trim());
}

function run(argv = process.argv.slice(2)) {
  const [sub, ...rest] = argv;

  if (!sub || sub === '--help' || sub === '-h') {
    printHelp();
    return;
  }

  if (sub === 'list') {
    const stashes = listStashes();
    if (stashes.length === 0) { console.log('No stashes found.'); return; }
    for (const s of stashes) {
      const date = new Date(s.stashedAt).toLocaleString();
      console.log(`  ${s.name}  (${s.tabCount} tab${s.tabCount !== 1 ? 's' : ''}, from "${s.stashedFrom}", ${date})`);
    }
    return;
  }

  if (sub === 'pop') {
    const [stashName, ...flags] = rest;
    const toIdx = flags.indexOf('--to');
    const target = toIdx !== -1 ? flags[toIdx + 1] : undefined;
    const result = popStash(stashName, target);
    console.log(`Restored ${result.count} tab(s) into "${result.dest}".`);
    return;
  }

  if (sub === 'drop') {
    const [stashName] = rest;
    dropStash(stashName);
    console.log(`Stash "${stashName}" dropped.`);
    return;
  }

  if (sub === 'peek') {
    const [stashName] = rest;
    const s = peekStash(stashName);
    console.log(`Stash "${stashName}" (from "${s.stashedFrom}"):\n`);
    s.tabs.forEach((t, i) => console.log(`  [${i}] ${t.title || t.url}  ${t.url}`));
    return;
  }

  // default: stash tabs from a session
  const sessionName = sub;
  const nameIdx = rest.indexOf('--name');
  const stashName = nameIdx !== -1 ? rest[nameIdx + 1] : undefined;
  const rawIndices = rest.filter((_, i) => {
    if (rest[i - 1] === '--name') return false;
    if (rest[i] === '--name') return false;
    return true;
  });
  const indices = rawIndices.map(Number).filter(n => !isNaN(n));
  if (indices.length === 0) { console.error('No valid tab indices provided.'); process.exit(1); }

  const result = stashTabs(sessionName, indices, stashName);
  console.log(`Stashed ${result.count} tab(s) as "${result.stashName.replace(/^__stash__/, '')}".`);
}

if (require.main === module) run();
module.exports = { printHelp, run };
