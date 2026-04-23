#!/usr/bin/env node
// CLI for focus mode management
const { setFocusMode, clearFocusMode, getFocusDomains, applyFocusFilter } = require('./focus');
const { loadSession } = require('./storage');

function printHelp() {
  console.log(`
tabflow focus <command> [options]

Commands:
  set <session> <domain,...>   Enable focus mode with allowed domains
  clear <session>              Disable focus mode
  show <session>               Show current focus domains
  preview <session>            Preview tabs visible under current focus

Examples:
  tabflow focus set work github.com,notion.so
  tabflow focus clear work
  tabflow focus show work
  tabflow focus preview work
`);
}

function run(args) {
  const [cmd, sessionName, ...rest] = args;

  if (!cmd || cmd === '--help' || cmd === '-h') {
    printHelp();
    return;
  }

  try {
    if (cmd === 'set') {
      if (!sessionName || rest.length === 0) {
        console.error('Usage: tabflow focus set <session> <domain,...>');
        process.exit(1);
      }
      const domains = rest.join(' ').split(',').map(d => d.trim()).filter(Boolean);
      setFocusMode(sessionName, domains);
      console.log(`Focus mode set for "${sessionName}": ${domains.join(', ')}`);

    } else if (cmd === 'clear') {
      if (!sessionName) { console.error('Session name required'); process.exit(1); }
      clearFocusMode(sessionName);
      console.log(`Focus mode cleared for "${sessionName}"`);

    } else if (cmd === 'show') {
      if (!sessionName) { console.error('Session name required'); process.exit(1); }
      const domains = getFocusDomains(sessionName);
      if (!domains) {
        console.log(`No focus mode active for "${sessionName}"`);
      } else {
        console.log(`Focus domains for "${sessionName}": ${domains.join(', ')}`);
      }

    } else if (cmd === 'preview') {
      if (!sessionName) { console.error('Session name required'); process.exit(1); }
      const session = loadSession(sessionName);
      if (!session) { console.error(`Session "${sessionName}" not found`); process.exit(1); }
      const filtered = applyFocusFilter(session);
      if (filtered.tabs.length === 0) {
        console.log('No tabs match the current focus filter.');
      } else {
        filtered.tabs.forEach((t, i) => console.log(`  ${i + 1}. ${t.title} — ${t.url}`));
      }

    } else {
      console.error(`Unknown command: ${cmd}`);
      printHelp();
      process.exit(1);
    }
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  run(process.argv.slice(2));
}

module.exports = { printHelp, run };
