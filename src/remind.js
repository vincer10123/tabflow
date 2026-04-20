const { loadSession, saveSession } = require('./storage');

/**
 * Set a reminder on a session (ISO timestamp string)
 */
async function setReminder(sessionName, isoDate) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found`);
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) throw new Error(`Invalid date: ${isoDate}`);
  session.reminder = date.toISOString();
  await saveSession(sessionName, session);
  return session.reminder;
}

/**
 * Clear the reminder from a session
 */
async function clearReminder(sessionName) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found`);
  delete session.reminder;
  await saveSession(sessionName, session);
}

/**
 * Get the reminder for a session, or null if not set
 */
async function getReminder(sessionName) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found`);
  return session.reminder || null;
}

/**
 * Return all sessions that have reminders due on or before `now`
 */
async function getDueReminders(sessions, now = new Date()) {
  const due = [];
  for (const session of sessions) {
    if (session.reminder) {
      const reminderDate = new Date(session.reminder);
      if (reminderDate <= now) {
        due.push(session);
      }
    }
  }
  return due;
}

module.exports = { setReminder, clearReminder, getReminder, getDueReminders };
