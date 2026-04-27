const { isFavorited, getFavoritedTabs } = require('./favorite');

/**
 * Wraps a session operation to inject favorited tab metadata before execution.
 */
function withFavoriteInfo(fn) {
  return async function (sessionName, ...args) {
    const favoritedTabs = await getFavoritedTabs(sessionName).catch(() => []);
    const favoritedUrls = new Set(favoritedTabs.map(t => t.url));
    return fn(sessionName, ...args, { favoritedUrls });
  };
}

/**
 * Middleware that filters out non-favorited tabs before passing to a handler.
 */
function withFavoritesOnly(fn) {
  return async function (sessionName, ...args) {
    const favoritedTabs = await getFavoritedTabs(sessionName).catch(() => []);
    return fn(sessionName, favoritedTabs, ...args);
  };
}

/**
 * Annotates tabs in a session result with isFavorited flag without mutating storage.
 */
async function annotateFavorites(sessionName, tabs) {
  return Promise.all(
    tabs.map(async tab => ({
      ...tab,
      isFavorited: await isFavorited(sessionName, tab.url)
    }))
  );
}

/**
 * Partitions tabs into favorited and non-favorited groups.
 * Returns { favorited, rest } without mutating the original array.
 */
async function partitionByFavorite(sessionName, tabs) {
  const annotated = await annotateFavorites(sessionName, tabs);
  const favorited = annotated.filter(t => t.isFavorited);
  const rest = annotated.filter(t => !t.isFavorited);
  return { favorited, rest };
}

module.exports = { withFavoriteInfo, withFavoritesOnly, annotateFavorites, partitionByFavorite };
