const { compressSession, decompressSession, compressedSize, compressionStats } = require('./compress');

const sampleSession = {
  name: 'work',
  tabs: [
    { url: 'https://github.com', title: 'GitHub', pinned: false },
    { url: 'https://example.com', title: 'Example', pinned: true },
    { url: 'https://news.ycombinator.com', title: 'Hacker News', pinned: false },
  ],
  createdAt: '2024-01-15T10:00:00.000Z',
};

describe('compressSession', () => {
  test('returns a non-empty base64 string', () => {
    const result = compressSession(sampleSession);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  test('compressed output differs from raw JSON', () => {
    const result = compressSession(sampleSession);
    expect(result).not.toBe(JSON.stringify(sampleSession));
  });
});

describe('decompressSession', () => {
  test('round-trips a session correctly', () => {
    const compressed = compressSession(sampleSession);
    const restored = decompressSession(compressed);
    expect(restored).toEqual(sampleSession);
  });

  test('handles sessions with empty tabs array', () => {
    const empty = { name: 'empty', tabs: [], createdAt: '2024-01-01T00:00:00.000Z' };
    expect(decompressSession(compressSession(empty))).toEqual(empty);
  });

  test('throws on invalid input', () => {
    expect(() => decompressSession('not-valid-base64!!!')).toThrow();
  });
});

describe('compressedSize', () => {
  test('returns a positive number', () => {
    expect(compressedSize(sampleSession)).toBeGreaterThan(0);
  });

  test('larger sessions produce larger compressed sizes', () => {
    const big = { name: 'big', tabs: Array.from({ length: 100 }, (_, i) => ({ url: `https://site${i}.com`, title: `Site ${i}` })) };
    expect(compressedSize(big)).toBeGreaterThan(compressedSize(sampleSession));
  });
});

describe('compressionStats', () => {
  test('returns raw, compressed, and ratio fields', () => {
    const stats = compressionStats(sampleSession);
    expect(stats).toHaveProperty('raw');
    expect(stats).toHaveProperty('compressed');
    expect(stats).toHaveProperty('ratio');
  });

  test('raw size matches JSON byte length', () => {
    const stats = compressionStats(sampleSession);
    expect(stats.raw).toBe(Buffer.byteLength(JSON.stringify(sampleSession), 'utf8'));
  });

  test('ratio string ends with %', () => {
    const stats = compressionStats(sampleSession);
    expect(stats.ratio).toMatch(/%$/);
  });
});
