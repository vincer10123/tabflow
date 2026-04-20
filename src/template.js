const { getAllSessions } = require('./sessions');
const { saveSession } = require('./storage');

/**
 * Built-in starter templates
 */
const BUILT_IN_TEMPLATES = {
  work: {
    name: 'work',
    tabs: [
      { title: 'Gmail', url: 'https://mail.google.com' },
      { title: 'Calendar', url: 'https://calendar.google.com' },
      { title: 'GitHub', url: 'https://github.com' },
    ],
  },
  research: {
    name: 'research',
    tabs: [
      { title: 'Google Scholar', url: 'https://scholar.google.com' },
      { title: 'Wikipedia', url: 'https://wikipedia.org' },
    ],
  },
};

/**
 * Save a session as a reusable template
 */
function saveAsTemplate(session, templateName) {
  if (!session || !session.tabs) throw new Error('Invalid session');
  const name = templateName || session.name;
  if (!name) throw new Error('Template name is required');
  const template = {
    name,
    tabs: session.tabs.map(({ title, url }) => ({ title, url })),
    createdAt: new Date().toISOString(),
    isTemplate: true,
  };
  saveSession(`template__${name}`, template);
  return template;
}

/**
 * Instantiate a template into a new session
 */
function instantiateTemplate(templateName, newSessionName) {
  const builtIn = BUILT_IN_TEMPLATES[templateName];
  const stored = (() => {
    try {
      const { loadSession } = require('./storage');
      return loadSession(`template__${templateName}`);
    } catch {
      return null;
    }
  })();

  const template = stored || builtIn;
  if (!template) throw new Error(`Template "${templateName}" not found`);

  return {
    name: newSessionName || `${templateName}-${Date.now()}`,
    tabs: template.tabs.map((t) => ({ ...t })),
    createdAt: new Date().toISOString(),
  };
}

/**
 * List all available templates (built-in + saved)
 */
function listTemplates() {
  const { listSessions } = require('./storage');
  const all = listSessions();
  const saved = all
    .filter((name) => name.startsWith('template__'))
    .map((name) => name.replace('template__', ''));
  const builtInNames = Object.keys(BUILT_IN_TEMPLATES);
  const combined = [...new Set([...builtInNames, ...saved])];
  return combined;
}

module.exports = { saveAsTemplate, instantiateTemplate, listTemplates, BUILT_IN_TEMPLATES };
