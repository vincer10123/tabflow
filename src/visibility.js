// visibility.js — hide/show sessions from listings without deleting them

const { loadSession, saveSession } = require('./storage');

function hideSession(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  return {
    ...sessions,
    [name]: { ...session, hidden: true, hiddenAt: new Date().toISOString() }
  };
}

function showSession(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  const updated = { ...session };
  delete updated.hidden;
  delete updated.hiddenAt;
  return { ...sessions, [name]: updated };
}

function isHidden(session) {
  return session && session.hidden === true;
}

function filterVisible(sessions) {
  return Object.fromEntries(
    Object.entries(sessions).filter(([, s]) => !isHidden(s))
  );
}

function filterHidden(sessions) {
  return Object.fromEntries(
    Object.entries(sessions).filter(([, s]) => isHidden(s))
  );
}

function getHiddenNames(sessions) {
  return Object.keys(filterHidden(sessions));
}

module.exports = {
  hideSession,
  showSession,
  isHidden,
  filterVisible,
  filterHidden,
  getHiddenNames
};
