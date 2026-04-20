const { VALID_COLORS, setColor, clearColor, getColor, filterByColor, groupByColor } = require('./color');

const makeSession = (name, color) => ({ name, tabs: [], ...(color ? { color } : {}) });

describe('setColor', () => {
  it('sets a valid color on a session', () => {
    const session = makeSession('work');
    const updated = setColor(session, 'blue');
    expect(updated.color).toBe('blue');
    expect(updated.name).toBe('work');
  });

  it('overwrites an existing color', () => {
    const session = makeSession('work', 'red');
    const updated = setColor(session, 'green');
    expect(updated.color).toBe('green');
  });

  it('throws for an invalid color', () => {
    const session = makeSession('work');
    expect(() => setColor(session, 'magenta')).toThrow('Invalid color');
  });

  it('does not mutate the original session', () => {
    const session = makeSession('work');
    setColor(session, 'blue');
    expect(session.color).toBeUndefined();
  });
});

describe('clearColor', () => {
  it('removes the color from a session', () => {
    const session = makeSession('work', 'purple');
    const updated = clearColor(session);
    expect(updated.color).toBeUndefined();
  });

  it('is a no-op if no color is set', () => {
    const session = makeSession('work');
    const updated = clearColor(session);
    expect(updated.color).toBeUndefined();
    expect(updated.name).toBe('work');
  });
});

describe('getColor', () => {
  it('returns the color if set', () => {
    expect(getColor(makeSession('s', 'red'))).toBe('red');
  });

  it('returns null if no color is set', () => {
    expect(getColor(makeSession('s'))).toBeNull();
  });
});

describe('filterByColor', () => {
  const sessions = [
    makeSession('a', 'red'),
    makeSession('b', 'blue'),
    makeSession('c', 'red'),
    makeSession('d'),
  ];

  it('returns only sessions with the given color', () => {
    const result = filterByColor(sessions, 'red');
    expect(result).toHaveLength(2);
    expect(result.map(s => s.name)).toEqual(['a', 'c']);
  });

  it('returns empty array if no match', () => {
    expect(filterByColor(sessions, 'green')).toHaveLength(0);
  });

  it('throws for an invalid color', () => {
    expect(() => filterByColor(sessions, 'neon')).toThrow('Invalid color');
  });
});

describe('groupByColor', () => {
  it('groups sessions by color', () => {
    const sessions = [
      makeSession('a', 'red'),
      makeSession('b', 'blue'),
      makeSession('c', 'red'),
      makeSession('d'),
    ];
    const groups = groupByColor(sessions);
    expect(groups.red).toHaveLength(2);
    expect(groups.blue).toHaveLength(1);
    expect(groups.none).toHaveLength(1);
  });

  it('returns empty object for empty input', () => {
    expect(groupByColor([])).toEqual({});
  });
});

describe('VALID_COLORS', () => {
  it('exports a non-empty array of color strings', () => {
    expect(Array.isArray(VALID_COLORS)).toBe(true);
    expect(VALID_COLORS.length).toBeGreaterThan(0);
    VALID_COLORS.forEach(c => expect(typeof c).toBe('string'));
  });
});
