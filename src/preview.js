// preview.js — generate a text preview of a session's tabs

function previewSession(session, options = {}) {
  const { maxTabs = 10, showUrl = true, showTitle = true, indent = '  ' } = options;

  if (!session || !Array.isArray(session.tabs)) {
    throw new Error('Invalid session: missing tabs array');
  }

  const tabs = session.tabs.slice(0, maxTabs);
  const truncated = session.tabs.length > maxTabs;

  const lines = [
    `Session: ${session.name}`,
    `Tabs: ${session.tabs.length}${truncated ? ` (showing first ${maxTabs})` : ''}`,
    '---',
  ];

  tabs.forEach((tab, i) => {
    const parts = [`${indent}[${i + 1}]`];
    if (showTitle && tab.title) parts.push(tab.title);
    if (showUrl && tab.url) parts.push(`<${tab.url}>`);
    lines.push(parts.join(' '));
  });

  if (truncated) {
    lines.push(`${indent}... and ${session.tabs.length - maxTabs} more`);
  }

  return lines.join('\n');
}

function previewAllSessions(sessions, options = {}) {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return 'No sessions found.';
  }

  return sessions
    .map(s => previewSession(s, { ...options, maxTabs: options.maxTabs ?? 3 }))
    .join('\n\n');
}

function previewTab(tab) {
  if (!tab) throw new Error('No tab provided');
  const lines = [];
  if (tab.title) lines.push(`Title : ${tab.title}`);
  if (tab.url)   lines.push(`URL   : ${tab.url}`);
  if (tab.pinned) lines.push('Pinned: yes');
  if (tab.tags && tab.tags.length) lines.push(`Tags  : ${tab.tags.join(', ')}`);
  return lines.join('\n');
}

module.exports = { previewSession, previewAllSessions, previewTab };
