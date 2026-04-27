const { trimToCount, trimByIndices, trimTail, trimByPattern } = require('./trim');

const makeSession = (urls) => ({
  name: 'test',
  tabs: urls.map(url => ({ url, title: url })),
});

describe('trimToCount', () => {
  it('keeps first N tabs', () => {
    const s = makeSession(['a.com', 'b.com', 'c.com']);
    expect(trimToCount(s, 2).tabs).toHaveLength(2);
    expect(trimToCount(s, 2).tabs[0].url).toBe('a.com');
  });
  it('returns all tabs when maxTabs >= length', () => {
    const s = makeSession(['a.com', 'b.com']);
    expect(trimToCount(s, 5).tabs).toHaveLength(2);
  });
  it('returns empty when maxTabs is 0', () => {
    expect(trimToCount(makeSession(['a.com']), 0).tabs).toHaveLength(0);
  });
  it('throws on invalid session', () => {
    expect(() => trimToCount(null, 2)).toThrow();
  });
});

describe('trimByIndices', () => {
  it('removes tabs at given indices', () => {
    const s = makeSession(['a.com', 'b.com', 'c.com']);
    const result = trimByIndices(s, [1]);
    expect(result.tabs).toHaveLength(2);
    expect(result.tabs.map(t => t.url)).toEqual(['a.com', 'c.com']);
  });
  it('handles empty indices array', () => {
    const s = makeSession(['a.com', 'b.com']);
    expect(trimByIndices(s, []).tabs).toHaveLength(2);
  });
  it('throws on invalid session', () => {
    expect(() => trimByIndices({}, [0])).toThrow();
  });
});

describe('trimTail', () => {
  it('removes N tabs from end', () => {
    const s = makeSession(['a.com', 'b.com', 'c.com']);
    expect(trimTail(s, 2).tabs).toHaveLength(1);
    expect(trimTail(s, 2).tabs[0].url).toBe('a.com');
  });
  it('returns empty when count >= length', () => {
    expect(trimTail(makeSession(['a.com', 'b.com']), 5).tabs).toHaveLength(0);
  });
  it('throws on negative count', () => {
    expect(() => trimTail(makeSession(['a.com']), -1)).toThrow();
  });
});

describe('trimByPattern', () => {
  it('removes tabs matching pattern', () => {
    const s = makeSession(['https://ads.com/x', 'https://news.com', 'https://ads.net/y']);
    const result = trimByPattern(s, /ads\.(com|net)/);
    expect(result.tabs).toHaveLength(1);
    expect(result.tabs[0].url).toBe('https://news.com');
  });
  it('accepts string pattern', () => {
    const s = makeSession(['tracker.io', 'good.io']);
    expect(trimByPattern(s, 'tracker').tabs).toHaveLength(1);
  });
  it('throws on invalid session', () => {
    expect(() => trimByPattern(null, 'x')).toThrow();
  });
});
