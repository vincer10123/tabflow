#!/usr/bin/env node
'use strict';

const { saveAsTemplate, instantiateTemplate, listTemplates } = require('./template');
const { getSession, createSession } = require('./sessions');

function printHelp() {
  console.log(`
tabflow template - manage session templates

Usage:
  tabflow template list                        List all available templates
  tabflow template save <session> [name]       Save a session as a template
  tabflow template use <template> [session]    Create a new session from a template

Options:
  -h, --help   Show this help message
`);
}

async function run(args = process.argv.slice(2)) {
  const [cmd, ...rest] = args;

  if (!cmd || cmd === '--help' || cmd === '-h') {
    printHelp();
    return;
  }

  if (cmd === 'list') {
    const templates = listTemplates();
    if (templates.length === 0) {
      console.log('No templates found.');
    } else {
      console.log('Available templates:');
      templates.forEach((t) => console.log(`  - ${t}`));
    }
    return;
  }

  if (cmd === 'save') {
    const [sessionName, templateName] = rest;
    if (!sessionName) {
      console.error('Error: session name is required');
      process.exit(1);
    }
    try {
      const session = getSession(sessionName);
      const tmpl = saveAsTemplate(session, templateName);
      console.log(`Saved template "${tmpl.name}" with ${tmpl.tabs.length} tab(s).`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  if (cmd === 'use') {
    const [templateName, newSessionName] = rest;
    if (!templateName) {
      console.error('Error: template name is required');
      process.exit(1);
    }
    try {
      const session = instantiateTemplate(templateName, newSessionName);
      createSession(session.name, session.tabs);
      console.log(`Created session "${session.name}" from template "${templateName}" (${session.tabs.length} tab(s)).`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  printHelp();
  process.exit(1);
}

if (require.main === module) run();

module.exports = { run, printHelp };
