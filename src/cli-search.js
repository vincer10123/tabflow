#!/usr/bin/env node

'use strict';

const { searchByName, searchByUrl, searchByTitle, searchAll } = require('./search');

function printHelp() {
  console.log(`
tabflow search - Search sessions and tabs

Usage:
  tabflow search <query>              Search everywhere (name, url, title)
  tabflow search --name <query>       Search sessions by name
  tabflow search --url <query>        Search tabs by URL
  tabflow search --title <query>      Search tabs by title

Options:
  --help    Show this help message
`);
}

function formatResults(results, mode) {
  if (results.length === 0) {
    console.log('No results found.');
    return;
  }

  if (mode === 'name') {
    console.log(`Found ${results.length} session(s):`);
    results.forEach(s => {
      console.log(`  [${s.id}] ${s.name} — ${s.tabs.length} tab(s)`);
    });
    return;
  }

  console.log(`Found ${results.length} match(es):`);
  results.forEach(({ session, tab }) => {
    console.log(`  Session: ${session.name}`);
    console.log(`    ${tab.title || '(no title)'}`);
    console.log(`    ${tab.url}`);
  });
}

async function run(args) {
  if (!args.length || args.includes('--help')) {
    printHelp();
    return;
  }

  const nameFlag = args.includes('--name');
  const urlFlag = args.includes('--url');
  const titleFlag = args.includes('--title');

  const flagIndex = args.findIndex(a => a.startsWith('--'));
  const query = flagIndex !== -1 ? args[flagIndex + 1] : args[0];

  if (!query) {
    console.error('Error: please provide a search query.');
    process.exit(1);
  }

  try {
    if (nameFlag) {
      const results = await searchByName(query);
      formatResults(results, 'name');
    } else if (urlFlag) {
      const results = await searchByUrl(query);
      formatResults(results, 'url');
    } else if (titleFlag) {
      const results = await searchByTitle(query);
      formatResults(results, 'title');
    } else {
      const results = await searchAll(query);
      formatResults(results, 'all');
    }
  } catch (err) {
    console.error('Search failed:', err.message);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
run(args);
