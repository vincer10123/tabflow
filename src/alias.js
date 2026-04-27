// alias.js — assign short aliases to saved sessions

const { loadSession, saveSession } = require('./storage');

const ALIAS_KEY = '__aliases__';

async function getAliasMap(sessions) {
  try {
    const data = await loadSession(ALIAS_KEY);
    return data && data.aliases ? data.aliases : {};
  } catch {
    return {};
  }
}

async function saveAliasMap(aliases) {
  await saveSession(ALIAS_KEY, { aliases });
}

async function setAlias(alias, sessionName) {
  if (!alias || !sessionName) throw new Error('alias and sessionName are required');
  if (!/^[a-z0-9_-]+$/i.test(alias)) throw new Error('Alias must be alphanumeric (dashes/underscores allowed)');
  const aliases = await getAliasMap();
  aliases[alias] = sessionName;
  await saveAliasMap(aliases);
  return aliases;
}

async function removeAlias(alias) {
  const aliases = await getAliasMap();
  if (!aliases[alias]) throw new Error(`Alias "${alias}" not found`);
  delete aliases[alias];
  await saveAliasMap(aliases);
  return aliases;
}

async function resolveAlias(nameOrAlias) {
  const aliases = await getAliasMap();
  return aliases[nameOrAlias] || nameOrAlias;
}

async function listAliases() {
  return getAliasMap();
}

async function getAliasesForSession(sessionName) {
  const aliases = await getAliasMap();
  return Object.entries(aliases)
    .filter(([, name]) => name === sessionName)
    .map(([alias]) => alias);
}

module.exports = { setAlias, removeAlias, resolveAlias, listAliases, getAliasesForSession };
