#!/usr/bin/env node
const { program } = require('commander');
const { exportSession, exportAllSessions, importSessions } = require('./export');
const { createSession } = require('./sessions');

program
  .command('export <name>')
  .description('Export a session to a JSON file')
  .option('-o, --output <path>', 'Output file path')
  .action((name, options) => {
    try {
      const filePath = exportSession(name, options.output);
      console.log(`Session "${name}" exported to ${filePath}`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('export-all')
  .description('Export all sessions to a JSON file')
  .option('-o, --output <path>', 'Output file path')
  .action((options) => {
    try {
      const filePath = exportAllSessions(options.output);
      console.log(`All sessions exported to ${filePath}`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('import <file>')
  .description('Import sessions from a JSON file')
  .action((file) => {
    try {
      const sessions = importSessions(file);
      for (const session of sessions) {
        createSession(session.name, session.tabs);
      }
      console.log(`Imported ${sessions.length} session(s) from ${file}`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
