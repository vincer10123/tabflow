/**
 * Assigns and retrieves color labels for sessions.
 * Colors help visually categorize sessions in terminal output.
 */

const VALID_COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'gray'];

/**
 * Set a color label on a session.
 * @param {object} session
 * @param {string} color
 * @returns {object} updated session
 */
function setColor(session, color) {
  if (!VALID_COLORS.includes(color)) {
    throw new Error(`Invalid color "${color}". Valid colors: ${VALID_COLORS.join(', ')}`);
  }
  return { ...session, color };
}

/**
 * Remove the color label from a session.
 * @param {object} session
 * @returns {object} updated session
 */
function clearColor(session) {
  const updated = { ...session };
  delete updated.color;
  return updated;
}

/**
 * Get the color of a session, or null if unset.
 * @param {object} session
 * @returns {string|null}
 */
function getColor(session) {
  return session.color || null;
}

/**
 * Filter a list of sessions by color.
 * @param {object[]} sessions
 * @param {string} color
 * @returns {object[]}
 */
function filterByColor(sessions, color) {
  if (!VALID_COLORS.includes(color)) {
    throw new Error(`Invalid color "${color}". Valid colors: ${VALID_COLORS.join(', ')}`);
  }
  return sessions.filter(s => s.color === color);
}

/**
 * Group sessions by their color label.
 * Sessions without a color are grouped under 'none'.
 * @param {object[]} sessions
 * @returns {object} map of color -> sessions[]
 */
function groupByColor(sessions) {
  return sessions.reduce((acc, session) => {
    const key = session.color || 'none';
    if (!acc[key]) acc[key] = [];
    acc[key].push(session);
    return acc;
  }, {});
}

module.exports = { VALID_COLORS, setColor, clearColor, getColor, filterByColor, groupByColor };
