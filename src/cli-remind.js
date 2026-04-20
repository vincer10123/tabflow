#!/usr/bin/env node
const { setReminder, clearReminder, getReminder } = require('./remind');

function printHelp() {
  console.log(`
Usage: tabflow remind <command> [options]

Commands:
  set <session> <date>   Set a reminder for a session (ISO 8601 date)
  clear <session>        Remove the reminder from a session
  get <session>          Show the current reminder for a session

Examples:
  tabflow remind set work 2025-12-01T09:00:00
  tabflow remind clear work
  tabflow remind get work
`);
}

async function run(args) {
  const [command, sessionName, dateArg] = args;

  if (!command || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  if (!sessionName) {
    console.error('Error: session name is required');
    process.exit(1);
  }

  try {
    if (command === 'set') {
      if (!dateArg) {
        console.error('Error: date argument is required for set');
        process.exit(1);
      }
      const reminder = await setReminder(sessionName, dateArg);
      console.log(`Reminder set for "${sessionName}": ${reminder}`);
    } else if (command === 'clear') {
      await clearReminder(sessionName);
      console.log(`Reminder cleared for "${sessionName}"`);
    } else if (command === 'get') {
      const reminder = await getReminder(sessionName);
      if (reminder) {
        console.log(`Reminder for "${sessionName}": ${reminder}`);
      } else {
        console.log(`No reminder set for "${sessionName}"`);
      }
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

if (require.main === module) {
  run(process.argv.slice(2));
}

module.exports = { run, printHelp };
