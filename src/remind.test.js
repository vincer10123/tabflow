const { setReminder, clearReminder, getReminder, getDueReminders } = require('./remind');
const { loadSession, saveSession } = require('./storage');

jest.mock('./storage');

const mockSession = (extra = {}) => ({ name: 'work', tabs: [], ...extra });

beforeEach(() => jest.clearAllMocks());

test('setReminder stores ISO date on session', async () => {
  loadSession.mockResolvedValue(mockSession());
  saveSession.mockResolvedValue();
  const result = await setReminder('work', '2030-01-01T10:00:00.000Z');
  expect(result).toBe('2030-01-01T10:00:00.000Z');
  expect(saveSession).toHaveBeenCalledWith('work', expect.objectContaining({ reminder: '2030-01-01T10:00:00.000Z' }));
});

test('setReminder throws on invalid date', async () => {
  loadSession.mockResolvedValue(mockSession());
  await expect(setReminder('work', 'not-a-date')).rejects.toThrow('Invalid date');
});

test('setReminder throws if session not found', async () => {
  loadSession.mockResolvedValue(null);
  await expect(setReminder('missing', '2030-01-01')).rejects.toThrow('not found');
});

test('clearReminder removes reminder field', async () => {
  loadSession.mockResolvedValue(mockSession({ reminder: '2030-01-01T10:00:00.000Z' }));
  saveSession.mockResolvedValue();
  await clearReminder('work');
  const saved = saveSession.mock.calls[0][1];
  expect(saved.reminder).toBeUndefined();
});

test('getReminder returns reminder string', async () => {
  loadSession.mockResolvedValue(mockSession({ reminder: '2030-06-15T08:00:00.000Z' }));
  const r = await getReminder('work');
  expect(r).toBe('2030-06-15T08:00:00.000Z');
});

test('getReminder returns null when no reminder set', async () => {
  loadSession.mockResolvedValue(mockSession());
  const r = await getReminder('work');
  expect(r).toBeNull();
});

test('getDueReminders returns sessions with past reminders', async () => {
  const now = new Date('2025-06-01T12:00:00.000Z');
  const sessions = [
    { name: 'a', reminder: '2025-05-01T00:00:00.000Z' },
    { name: 'b', reminder: '2025-07-01T00:00:00.000Z' },
    { name: 'c' },
  ];
  const due = await getDueReminders(sessions, now);
  expect(due).toHaveLength(1);
  expect(due[0].name).toBe('a');
});

test('getDueReminders returns empty array when none are due', async () => {
  const now = new Date('2020-01-01T00:00:00.000Z');
  const sessions = [{ name: 'x', reminder: '2030-01-01T00:00:00.000Z' }];
  const due = await getDueReminders(sessions, now);
  expect(due).toHaveLength(0);
});
