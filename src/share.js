const { loadSession } = require('./storage');

/**
 * Generate a shareable plain-text summary of a session.
 */
function generateShareText(session) {
  const lines = [`Session: ${session.name}`];
  if (session.notes) lines.push(`Notes: ${session.notes}`);
  lines.push(`Tabs (${session.tabs.length}):`);
  session.tabs.forEach((tab, i) => {
    const title = tab.title ? ` — ${tab.title}` : '';
    lines.push(`  ${i + 1}. ${tab.url}${title}`);
  });
  return lines.join('\n');
}

/**
 * Generate a markdown summary of a session.
 */
function generateShareMarkdown(session) {
  const lines = [`# Session: ${session.name}`];
  if (session.notes) lines.push(`> ${session.notes}\n`);
  lines.push(`**${session.tabs.length} tab(s)**\n`);
  session.tabs.forEach((tab, i) => {
    const title = tab.title || tab.url;
    lines.push(`${i + 1}. [${title}](${tab.url})`);
  });
  return lines.join('\n');
}

/**
 * Generate a JSON share payload for a session.
 */
function generateShareJson(session) {
  return JSON.stringify(
    {
      name: session.name,
      notes: session.notes || null,
      tabs: session.tabs.map((t) => ({ url: t.url, title: t.title || null })),
    },
    null,
    2
  );
}

/**
 * Share a session by name in the given format.
 * @param {string} name - session name
 * @param {'text'|'markdown'|'json'} format
 * @returns {string}
 */
function shareSession(name, format = 'text') {
  const session = loadSession(name);
  if (!session) throw new Error(`Session "${name}" not found.`);
  switch (format) {
    case 'markdown':
      return generateShareMarkdown(session);
    case 'json':
      return generateShareJson(session);
    case 'text':
    default:
      return generateShareText(session);
  }
}

module.exports = { shareSession, generateShareText, generateShareMarkdown, generateShareJson };
