// Sort sessions and tabs by various criteria

function sortTabsByTitle(tabs) {
  return [...tabs].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
}

function sortTabsByUrl(tabs) {
  return [...tabs].sort((a, b) => (a.url || '').localeCompare(b.url || ''));
}

function sortTabsByDate(tabs) {
  return [...tabs].sort((a, b) => {
    const dateA = a.addedAt ? new Date(a.addedAt) : new Date(0);
    const dateB = b.addedAt ? new Date(b.addedAt) : new Date(0);
    return dateA - dateB;
  });
}

function sortSessionsByName(sessions) {
  return [...sessions].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

function sortSessionsByTabCount(sessions) {
  return [...sessions].sort((a, b) => {
    const countA = Array.isArray(a.tabs) ? a.tabs.length : 0;
    const countB = Array.isArray(b.tabs) ? b.tabs.length : 0;
    return countB - countA;
  });
}

function sortSessionsByDate(sessions) {
  return [...sessions].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
    return dateB - dateA;
  });
}

function sortSession(session, by = 'title') {
  if (!session || !Array.isArray(session.tabs)) return session;
  const sorters = {
    title: sortTabsByTitle,
    url: sortTabsByUrl,
    date: sortTabsByDate,
  };
  const sorter = sorters[by] || sortTabsByTitle;
  return { ...session, tabs: sorter(session.tabs) };
}

module.exports = {
  sortTabsByTitle,
  sortTabsByUrl,
  sortTabsByDate,
  sortSessionsByName,
  sortSessionsByTabCount,
  sortSessionsByDate,
  sortSession,
};
