#!/usr/bin/env node
// CLI for viewing tab and session activity over time

const { getActivity, formatDuration } = require('./activity');
const { getAllSessions } = require('./sessions');

function printHelp() {
  console.log(`
tabflow activity - view session and tab activity

Usage:
  tabflow activity [options]
  tabflow activity <session-name>

Options:
  --all             Show activity for all sessions
  --top <n>         Show top N most active sessions (default: 5)
  --format <fmt>    Output format: table (default), json
  --help            Show this help message

Examples:
  tabflow activity work
  tabflow activity --all
  tabflow activity --top 3
`);
}

function formatTable(activities) {
  if (!activities.length) {
    console.log('No activity data found.');
    return;
  }

  const nameWidth = Math.max(12, ...activities.map(a => a.name.length));
  const header = [
    'Session'.padEnd(nameWidth),
    'Tabs'.padStart(6),
    'Opens'.padStart(7),
    'Last Active'.padStart(20),
    'Total Time'.padStart(12),
  ].join('  ');

  console.log(header);
  console.log('-'.repeat(header.length));

  for (const a of activities) {
    const lastActive = a.lastActive
      ? new Date(a.lastActive).toLocaleString()
      : 'never';
    console.log([
      a.name.padEnd(nameWidth),
      String(a.tabCount).padStart(6),
      String(a.openCount).padStart(7),
      lastActive.padStart(20),
      formatDuration(a.totalTime).padStart(12),
    ].join('  '));
  }
}

async function run(args) {
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }

  const formatFlag = args.indexOf('--format');
  const format = formatFlag !== -1 ? args[formatFlag + 1] : 'table';

  const topFlag = args.indexOf('--top');
  const topN = topFlag !== -1 ? parseInt(args[topFlag + 1], 10) : null;

  const showAll = args.includes('--all');

  // Find positional session name (not a flag or flag value)
  const flagValues = new Set();
  ['--format', '--top'].forEach(flag => {
    const idx = args.indexOf(flag);
    if (idx !== -1) flagValues.add(idx + 1);
  });
  const sessionName = args.find((a, i) => !a.startsWith('--') && !flagValues.has(i));

  try {
    let activities;

    if (sessionName && !showAll) {
      const activity = await getActivity(sessionName);
      if (!activity) {
        console.error(`Session "${sessionName}" not found.`);
        process.exit(1);
      }
      activities = [activity];
    } else {
      const sessions = await getAllSessions();
      const names = sessions.map(s => s.name);
      activities = await Promise.all(names.map(n => getActivity(n)));
      activities = activities.filter(Boolean);

      // Sort by last active descending
      activities.sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0));

      if (topN && !isNaN(topN)) {
        activities = activities.slice(0, topN);
      }
    }

    if (format === 'json') {
      console.log(JSON.stringify(activities, null, 2));
    } else {
      formatTable(activities);
    }
  } catch (err) {
    console.error('Error fetching activity:', err.message);
    process.exit(1);
  }
}

module.exports = { printHelp, run };

if (require.main === module) {
  run(process.argv.slice(2));
}
