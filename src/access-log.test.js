const {
  recordAccess,
  getLastAccessed,
  getAccessCount,
  getAccessHistory,
  clearAccessLog,
  getMostAccessed,
  getRecentlyAccessed,
} = require('./access-log');

const makeSession = (name, tabs = []) => ({ name, tabs });

describe('recordAccess', () => {
  it('sets lastAccessed and increments count', () => {
    const s = makeSession('work');
    const updated = recordAccess(s, 'view');
    expect(getLastAccessed(updated)).toBeTruthy();
    expect(getAccessCount(updated)).toBe(1);
  });

  it('increments count on repeated access', () => {
    let s = makeSession('work');
    s = recordAccess(s, 'view');
    s = recordAccess(s, 'restore');
    expect(getAccessCount(s)).toBe(2);
  });

  it('appends to history', () => {
    let s = makeSession('work');
    s = recordAccess(s, 'view');
    s = recordAccess(s, 'restore');
    const hist = getAccessHistory(s);
    expect(hist).toHaveLength(2);
    expect(hist[0].action).toBe('view');
    expect(hist[1].action).toBe('restore');
  });

  it('caps history at 50 entries', () => {
    let s = makeSession('work');
    for (let i = 0; i < 55; i++) s = recordAccess(s, 'view');
    expect(getAccessHistory(s)).toHaveLength(50);
  });
});

describe('getLastAccessed', () => {
  it('returns null for unaccessed session', () => {
    expect(getLastAccessed(makeSession('x'))).toBeNull();
  });
});

describe('clearAccessLog', () => {
  it('removes the access log from session', () => {
    let s = recordAccess(makeSession('work'), 'view');
    s = clearAccessLog(s);
    expect(getLastAccessed(s)).toBeNull();
    expect(getAccessCount(s)).toBe(0);
  });
});

describe('getMostAccessed', () => {
  it('sorts sessions by access count descending', () => {
    let a = makeSession('a');
    let b = makeSession('b');
    a = recordAccess(a); a = recordAccess(a);
    b = recordAccess(b);
    const sorted = getMostAccessed([b, a]);
    expect(sorted[0].name).toBe('a');
  });
});

describe('getRecentlyAccessed', () => {
  it('returns sessions sorted by most recent access', () => {
    let a = makeSession('a');
    let b = makeSession('b');
    a = recordAccess(a, 'view');
    setTimeout(() => {}, 0);
    b = recordAccess(b, 'view');
    const result = getRecentlyAccessed([a, b], 2);
    expect(result[0].name).toBe('b');
  });

  it('excludes sessions with no access log', () => {
    const a = makeSession('a');
    const b = recordAccess(makeSession('b'), 'view');
    const result = getRecentlyAccessed([a, b]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('b');
  });
});
