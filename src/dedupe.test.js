const { findDuplicatesInSession, dedupeSession, findCrossSessionDuplicates } = require('./dedupe');

const mockSession = (name, tabs) => ({ name, tabs });
const mockTab = (url, title = 'Tab') => ({ url, title });

describe('findDuplicatesInSession', () => {
  it('returns empty array when no duplicates', () => {
    const session = mockSession('work', [
      mockTab('https://github.com'),
      mockTab('https://google.com'),
    ]);
    expect(findDuplicatesInSession(session)).toEqual([]);
  });

  it('returns duplicate tabs', () => {
    const dup = mockTab('https://github.com', 'GitHub');
    const session = mockSession('work', [
      mockTab('https://github.com', 'GitHub'),
      mockTab('https://google.com'),
      dup,
    ]);
    const result = findDuplicatesInSession(session);
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe('https://github.com');
  });
});

describe('dedupeSession', () => {
  it('removes duplicate tabs keeping first occurrence', () => {
    const session = mockSession('work', [
      mockTab('https://github.com', 'First'),
      mockTab('https://google.com'),
      mockTab('https://github.com', 'Second'),
    ]);
    const result = dedupeSession(session);
    expect(result.tabs).toHaveLength(2);
    expect(result.tabs[0].title).toBe('First');
  });

  it('does not mutate original session', () => {
    const session = mockSession('work', [
      mockTab('https://github.com'),
      mockTab('https://github.com'),
    ]);
    dedupeSession(session);
    expect(session.tabs).toHaveLength(2);
  });
});

describe('findCrossSessionDuplicates', () => {
  it('finds tabs shared across sessions', () => {
    const sessions = [
      mockSession('work', [mockTab('https://github.com'), mockTab('https://docs.com')]),
      mockSession('personal', [mockTab('https://github.com'), mockTab('https://news.com')]),
    ];
    const result = findCrossSessionDuplicates(sessions);
    expect(result['https://github.com']).toHaveLength(2);
    expect(result['https://docs.com']).toBeUndefined();
  });

  it('returns empty object when no cross-session duplicates', () => {
    const sessions = [
      mockSession('work', [mockTab('https://github.com')]),
      mockSession('personal', [mockTab('https://google.com')]),
    ];
    expect(findCrossSessionDuplicates(sessions)).toEqual({});
  });
});
