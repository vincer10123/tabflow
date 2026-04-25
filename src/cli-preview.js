#!/usr/bin/env node
// cli-preview.js — CLI interface for previewing sessions

const { getAllSessions, getSession } = require('./sessions');
const { previewSession, previewAllSessions, previewTab } = require('./preview');

function printHelp() {
  console.log(`
tabflow preview — preview session tabs in the terminal

Usage:
  tabflow preview                    Preview all sessions (3 tabs each)
  tabflow preview <session>          Preview a specific session
  tabflow preview <session> --tab <n> Preview a single tab by index (1-based)
  tabflow preview --max <n>          Set max tabs shown per session
  tabflow preview --no-url           Hide URLs in output
  tabflow preview --no-title         Hide titles in output
  tabflow preview --help             Show this help
`.trim());
}

async function run(args = process.argv.slice(2)) {
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }

  const maxArg = args.indexOf('--max');
  const maxTabs = maxArg !== -1 ? parseInt(args[maxArg + 1], 10) : undefined;
  const showUrl = !args.includes('--no-url');
  const showTitle = !args.includes('--no-title');
  const tabArg = args.indexOf('--tab');
  const tabIndex = tabArg !== -1 ? parseInt(args[tabArg + 1], 10) - 1 : null;

  const flags = ['--max', '--tab', '--no-url', '--no-title'];
  const positional = args.filter((a, i) => {
    if (a.startsWith('--')) return false;
    const prev = args[i - 1];
    if (prev === '--max' || prev === '--tab') return false;
    return true;
  });

  const sessionName = positional[0];

  try {
    if (!sessionName) {
      const sessions = await getAllSessions();
      console.log(previewAllSessions(sessions, { maxTabs: maxTabs ?? 3, showUrl, showTitle }));
      return;
    }

    const session = await getSession(sessionName);
    if (!session) {
      console.error(`Session "${sessionName}" not found.`);
      process.exit(1);
    }

    if (tabIndex !== null) {
      const tab = session.tabs[tabIndex];
      if (!tab) {
        console.error(`Tab index ${tabIndex + 1} out of range (session has ${session.tabs.length} tabs).`);
        process.exit(1);
      }
      console.log(previewTab(tab));
      return;
    }

    console.log(previewSession(session, { maxTabs, showUrl, showTitle }));
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

if (require.main === module) run();
module.exports = { run, printHelp };
