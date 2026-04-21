const { getRecentSessions, getRecentlyModifiedSessions, getLastSession } = require('./recent');
const { getAllSessions } = require('./sessions');

jest.mock('./sessions');

const mockSessions = [
  { id: 'a', name: 'Alpha', createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-03-01T10:00:00Z', tabs: [] },
  { id: 'b', name: 'Beta',  createdAt: '2024-02-01T10:00:00Z', updatedAt: '2024-02-15T10:00:00Z', tabs: [] },
  { id: 'c', name: 'Gamma', createdAt: '2024-03-01T10:00:00Z', updatedAt: '2024-01-20T10:00:00Z', tabs: [] },
];

beforeEach(() => {
  getAllSessions.mockReturnValue(mockSessions);
});

describe('getRecentSessions', () => {
  it('returns sessions sorted by createdAt descending', () => {
    const result = getRecentSessions();
    expect(result[0].id).toBe('c');
    expect(result[1].id).toBe('b');
    expect(result[2].id).toBe('a');
  });

  it('respects the limit parameter', () => {
    const result = getRecentSessions(2);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('c');
  });

  it('does not mutate the original array', () => {
    getRecentSessions();
    expect(getAllSessions()).toBe(mockSessions);
  });
});

describe('getRecentlyModifiedSessions', () => {
  it('returns sessions sorted by updatedAt descending', () => {
    const result = getRecentlyModifiedSessions();
    expect(result[0].id).toBe('a');
    expect(result[1].id).toBe('b');
    expect(result[2].id).toBe('c');
  });

  it('falls back to createdAt when updatedAt is missing', () => {
    getAllSessions.mockReturnValue([
      { id: 'x', name: 'X', createdAt: '2024-05-01T00:00:00Z', tabs: [] },
      { id: 'y', name: 'Y', createdAt: '2024-06-01T00:00:00Z', tabs: [] },
    ]);
    const result = getRecentlyModifiedSessions();
    expect(result[0].id).toBe('y');
  });
});

describe('getLastSession', () => {
  it('returns the most recently modified session', () => {
    const result = getLastSession();
    expect(result.id).toBe('a');
  });

  it('returns null when there are no sessions', () => {
    getAllSessions.mockReturnValue([]);
    expect(getLastSession()).toBeNull();
  });
});
