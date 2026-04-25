#!/usr/bin/env node
'use strict';

const { setTimeout_, clearTimeout_, getTimeout, getDueTimeouts } = require('./timeout');
const { getAllSessions } = require('./sessions');

function printHelp() {
  console.log(`
tabflow timeout - auto-expire sessions after a set duration

Usage:
  tabflow timeout set <session> <minutes>   Set a timeout for a session
  tabflow timeout clear <session>           Remove timeout from a session
  tabflow timeout get <session>             Show timeout info for a session
  tabflow timeout due                       List all sessions that have timed out
  tabflow timeout help                      Show this help message
`);
}

function run(args) {
  const [sub, sessionName, value] = args;

  if (!sub || sub === 'help') {
    printHelp();
    return;
  }

  if (sub === 'set') {
    if (!sessionName || !value) {
      console.error('Usage: tabflow timeout set <session> <minutes>');
      process.exit(1);
    }
    const minutes = parseInt(value, 10);
    if (isNaN(minutes) || minutes <= 0) {
      console.error('Minutes must be a positive integer.');
      process.exit(1);
    }
    const sessions = getAllSessions();
    if (!sessions[sessionName]) {
      console.error(`Session "${sessionName}" not found.`);
      process.exit(1);
    }
    const updated = setTimeout_(sessions[sessionName], minutes);
    console.log(`Timeout set: session "${sessionName}" will expire in ${minutes} minute(s).`);
    console.log(`Expires at: ${new Date(updated.timeout.expiresAt).toLocaleString()}`);
    return;
  }

  if (sub === 'clear') {
    if (!sessionName) {
      console.error('Usage: tabflow timeout clear <session>');
      process.exit(1);
    }
    const sessions = getAllSessions();
    if (!sessions[sessionName]) {
      console.error(`Session "${sessionName}" not found.`);
      process.exit(1);
    }
    clearTimeout_(sessions[sessionName]);
    console.log(`Timeout cleared for session "${sessionName}".`);
    return;
  }

  if (sub === 'get') {
    if (!sessionName) {
      console.error('Usage: tabflow timeout get <session>');
      process.exit(1);
    }
    const sessions = getAllSessions();
    if (!sessions[sessionName]) {
      console.error(`Session "${sessionName}" not found.`);
      process.exit(1);
    }
    const info = getTimeout(sessions[sessionName]);
    if (!info) {
      console.log(`No timeout set for session "${sessionName}".`);
    } else {
      const expired = isTimedOut(sessions[sessionName]);
      console.log(`Session: ${sessionName}`);
      console.log(`Expires at: ${new Date(info.expiresAt).toLocaleString()}`);
      console.log(`Status: ${expired ? 'EXPIRED' : 'active'}`);
    }
    return;
  }

  if (sub === 'due') {
    const sessions = getAllSessions();
    const due = getDueTimeouts(Object.values(sessions));
    if (due.length === 0) {
      console.log('No sessions have timed out.');
    } else {
      console.log('Timed out sessions:');
      due.forEach(s => {
        console.log(`  - ${s.name} (expired: ${new Date(s.timeout.expiresAt).toLocaleString()})`);
      });
    }
    return;
  }

  console.error(`Unknown subcommand: ${sub}`);
  printHelp();
  process.exit(1);
}

module.exports = { printHelp, run };
