const { getLimit, setLimit, clearLimit, isAtLimit, guardLimit, trimToLimit } = require('./limit');

const makeSession = (tabs = [], tabLimit) => ({
  name: 'test',
  tabs,
  ...(tabLimit !== undefined ? { tabLimit } : {}),
});

const makeTab = (url) => ({ url, title: url });

describe('getLimit', () => {
  it('returns the session tabLimit when set', () => {
    expect(getLimit(makeSession([], 10))).toBe(10);
  });

  it('returns default (50) when no limit set', () => {
    expect(getLimit(makeSession())).toBe(50);
  });
});

describe('setLimit', () => {
  it('sets tabLimit on session', () => {
    const s = setLimit(makeSession(), 20);
    expect(s.tabLimit).toBe(20);
  });

  it('floors float values', () => {
    const s = setLimit(makeSession(), 7.9);
    expect(s.tabLimit).toBe(7);
  });

  it('throws for invalid limit', () => {
    expect(() => setLimit(makeSession(), 0)).toThrow();
    expect(() => setLimit(makeSession(), -5)).toThrow();
    expect(() => setLimit(makeSession(), 'ten')).toThrow();
  });
});

describe('clearLimit', () => {
  it('removes tabLimit from session', () => {
    const s = clearLimit(makeSession([], 15));
    expect(s.tabLimit).toBeUndefined();
  });

  it('leaves session intact if no limit was set', () => {
    const s = clearLimit(makeSession());
    expect(s.tabLimit).toBeUndefined();
  });
});

describe('isAtLimit', () => {
  it('returns true when tabs equal the limit', () => {
    const tabs = Array.from({ length: 5 }, (_, i) => makeTab(`http://t${i}.com`));
    expect(isAtLimit(makeSession(tabs, 5))).toBe(true);
  });

  it('returns false when under limit', () => {
    const tabs = [makeTab('http://a.com')];
    expect(isAtLimit(makeSession(tabs, 5))).toBe(false);
  });
});

describe('guardLimit', () => {
  it('adds tab when under limit', () => {
    const s = guardLimit(makeSession([], 3), makeTab('http://x.com'));
    expect(s.tabs).toHaveLength(1);
  });

  it('throws when at limit', () => {
    const tabs = Array.from({ length: 3 }, (_, i) => makeTab(`http://t${i}.com`));
    expect(() => guardLimit(makeSession(tabs, 3), makeTab('http://new.com'))).toThrow(/tab limit/);
  });
});

describe('trimToLimit', () => {
  it('trims tabs to the limit', () => {
    const tabs = Array.from({ length: 8 }, (_, i) => makeTab(`http://t${i}.com`));
    const s = trimToLimit(makeSession(tabs, 5));
    expect(s.tabs).toHaveLength(5);
  });

  it('returns session unchanged when under limit', () => {
    const tabs = [makeTab('http://a.com')];
    const s = trimToLimit(makeSession(tabs, 10));
    expect(s.tabs).toHaveLength(1);
  });
});
