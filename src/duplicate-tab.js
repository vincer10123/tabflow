// duplicate-tab.js — duplicate a tab within or across sessions

const { getSession, createSession } = require('./sessions');

/**
 * Duplicate a single tab by index within a session.
 * Returns the new tab object.
 */
function duplicateTab(session, tabIndex) {
  if (!session || !Array.isArray(session.tabs)) {
    throw new Error('Invalid session');
  }
  if (tabIndex < 0 || tabIndex >= session.tabs.length) {
    throw new Error(`Tab index ${tabIndex} out of range`);
  }
  const original = session.tabs[tabIndex];
  const duplicate = {
    ...original,
    id: `${original.id || tabIndex}-copy-${Date.now()}`,
    title: `${original.title} (copy)`,
    duplicatedAt: new Date().toISOString(),
  };
  return duplicate;
}

/**
 * Duplicate a tab within the same session (inserted after the original).
 * Returns the updated session.
 */
function duplicateTabInSession(session, tabIndex) {
  const duplicate = duplicateTab(session, tabIndex);
  const tabs = [
    ...session.tabs.slice(0, tabIndex + 1),
    duplicate,
    ...session.tabs.slice(tabIndex + 1),
  ];
  return { ...session, tabs, updatedAt: new Date().toISOString() };
}

/**
 * Copy a tab from one session to another.
 * Returns the updated target session.
 */
function copyTabToSession(sourceSession, tabIndex, targetSession) {
  if (!sourceSession || !Array.isArray(sourceSession.tabs)) {
    throw new Error('Invalid source session');
  }
  if (!targetSession || !Array.isArray(targetSession.tabs)) {
    throw new Error('Invalid target session');
  }
  if (tabIndex < 0 || tabIndex >= sourceSession.tabs.length) {
    throw new Error(`Tab index ${tabIndex} out of range`);
  }
  const tab = {
    ...sourceSession.tabs[tabIndex],
    id: `copied-${Date.now()}`,
    copiedFrom: sourceSession.name,
    copiedAt: new Date().toISOString(),
  };
  const tabs = [...targetSession.tabs, tab];
  return { ...targetSession, tabs, updatedAt: new Date().toISOString() };
}

/**
 * Duplicate all tabs in a session, returning a new session with copies
 * of every tab appended after their originals.
 * Returns the updated session.
 */
function duplicateAllTabs(session) {
  if (!session || !Array.isArray(session.tabs)) {
    throw new Error('Invalid session');
  }
  const tabs = [];
  session.tabs.forEach((tab, index) => {
    tabs.push(tab);
    tabs.push(duplicateTab(session, index));
  });
  return { ...session, tabs, updatedAt: new Date().toISOString() };
}

module.exports = { duplicateTab, duplicateTabInSession, copyTabToSession, duplicateAllTabs };
