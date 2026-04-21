const { getSession } = require('./sessions');

/**
 * Compare two sessions and return a diff summary
 */
function diffSessions(sessionA, sessionB) {
  const urlsA = new Set(sessionA.tabs.map(t => t.url));
  const urlsB = new Set(sessionB.tabs.map(t => t.url));

  const added = sessionB.tabs.filter(t => !urlsA.has(t.url));
  const removed = sessionA.tabs.filter(t => !urlsB.has(t.url));
  const kept = sessionA.tabs.filter(t => urlsB.has(t.url));

  return { added, removed, kept };
}

/**
 * Compare two sessions by name and return diff
 */
function diffByName(nameA, nameB) {
  const sessionA = getSession(nameA);
  const sessionB = getSession(nameB);

  if (!sessionA) throw new Error(`Session not found: ${nameA}`);
  if (!sessionB) throw new Error(`Session not found: ${nameB}`);

  return diffSessions(sessionA, sessionB);
}

/**
 * Format a diff result as a human-readable string
 */
function formatDiff(diff, nameA, nameB) {
  const lines = [];
  lines.push(`Diff: ${nameA} → ${nameB}`);
  lines.push(`  + ${diff.added.length} added, - ${diff.removed.length} removed, = ${diff.kept.length} unchanged`);

  if (diff.added.length > 0) {
    lines.push('\nAdded:');
    diff.added.forEach(t => lines.push(`  + [${t.title || 'Untitled'}] ${t.url}`));
  }

  if (diff.removed.length > 0) {
    lines.push('\nRemoved:');
    diff.removed.forEach(t => lines.push(`  - [${t.title || 'Untitled'}] ${t.url}`));
  }

  return lines.join('\n');
}

module.exports = { diffSessions, diffByName, formatDiff };
