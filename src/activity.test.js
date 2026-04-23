const { recordOpen, recordClose, getSessionActivity, formatDuration, getActivity } = require('./activity');
const storage = require('./storage');

jest.mock('./storage');

const mockSession = (extra = {}) => ({
  name: 'work',
  tabs: [],
  ...extra,
});

describe('getActivity', () => {
  it('returns defaults when no activity field', () => {
    const act = getActivity(mockSession());
    expect(act).toEqual({ openCount: 0, lastAccessed: null, totalMs: 0 });
  });

  it('returns existing activity', () => {
    const existing = { openCount: 3, lastAccessed: '2024-01-01', totalMs: 5000 };
    expect(getActivity(mockSession({ activity: existing }))).toEqual(existing);
  });
});

describe('recordOpen', () => {
  it('increments openCount and sets lastAccessed', async () => {
    storage.loadSession.mockResolvedValue(mockSession());
    storage.saveSession.mockResolvedValue();

    const result = await recordOpen('work');
    expect(result.openCount).toBe(1);
    expect(result.lastAccessed).toBeTruthy();

    const saved = storage.saveSession.mock.calls[0][1];
    expect(saved.activity.openCount).toBe(1);
  });

  it('throws if session not found', async () => {
    storage.loadSession.mockResolvedValue(null);
    await expect(recordOpen('ghost')).rejects.toThrow('not found');
  });
});

describe('recordClose', () => {
  it('accumulates totalMs', async () => {
    storage.loadSession.mockResolvedValue(mockSession({ activity: { openCount: 1, lastAccessed: null, totalMs: 2000 } }));
    storage.saveSession.mockResolvedValue();

    const result = await recordClose('work', 3000);
    expect(result.totalMs).toBe(5000);
  });
});

describe('getSessionActivity', () => {
  it('returns activity for existing session', async () => {
    storage.loadSession.mockResolvedValue(mockSession());
    const act = await getSessionActivity('work');
    expect(act.openCount).toBe(0);
  });
});

describe('formatDuration', () => {
  it('formats ms', () => expect(formatDuration(500)).toBe('500ms'));
  it('formats seconds', () => expect(formatDuration(45000)).toBe('45s'));
  it('formats minutes', () => expect(formatDuration(125000)).toBe('2m 5s'));
  it('formats hours', () => expect(formatDuration(3661000)).toBe('1h 1m'));
});
