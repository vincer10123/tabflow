const {
  setSchedule,
  clearSchedule,
  getSchedule,
  isScheduledNow,
  getDueSchedules,
  scheduleSession,
  unscheduleSession,
} = require('./schedule');

const baseSession = { name: 'work', tabs: [] };

test('setSchedule stores ISO date string', () => {
  const result = setSchedule(baseSession, '2030-01-01T10:00:00Z');
  expect(result.__schedule__).toBe('2030-01-01T10:00:00.000Z');
});

test('setSchedule throws on invalid date', () => {
  expect(() => setSchedule(baseSession, 'not-a-date')).toThrow('Invalid date');
});

test('clearSchedule removes schedule key', () => {
  const scheduled = setSchedule(baseSession, '2030-01-01T10:00:00Z');
  const result = clearSchedule(scheduled);
  expect(result.__schedule__).toBeUndefined();
});

test('getSchedule returns Date object', () => {
  const scheduled = setSchedule(baseSession, '2030-06-15T08:00:00Z');
  const date = getSchedule(scheduled);
  expect(date).toBeInstanceOf(Date);
  expect(date.getFullYear()).toBe(2030);
});

test('getSchedule returns null when not set', () => {
  expect(getSchedule(baseSession)).toBeNull();
});

test('isScheduledNow returns false for future schedule', () => {
  const scheduled = setSchedule(baseSession, '2099-01-01T00:00:00Z');
  expect(isScheduledNow(scheduled)).toBe(false);
});

test('isScheduledNow returns true for past schedule', () => {
  const scheduled = setSchedule(baseSession, '2000-01-01T00:00:00Z');
  expect(isScheduledNow(scheduled)).toBe(true);
});

test('getDueSchedules filters sessions due now', () => {
  const past = setSchedule({ name: 'a', tabs: [] }, '2000-01-01T00:00:00Z');
  const future = setSchedule({ name: 'b', tabs: [] }, '2099-01-01T00:00:00Z');
  const none = { name: 'c', tabs: [] };
  const due = getDueSchedules([past, future, none]);
  expect(due).toHaveLength(1);
  expect(due[0].name).toBe('a');
});

test('scheduleSession saves updated session', () => {
  const session = { name: 'test', tabs: [] };
  const load = jest.fn(() => session);
  const save = jest.fn();
  scheduleSession('test', '2030-01-01T00:00:00Z', { load, save });
  expect(save).toHaveBeenCalledWith('test', expect.objectContaining({ __schedule__: expect.any(String) }));
});

test('unscheduleSession removes schedule from session', () => {
  const session = setSchedule({ name: 'test', tabs: [] }, '2030-01-01T00:00:00Z');
  const load = jest.fn(() => session);
  const save = jest.fn();
  unscheduleSession('test', { load, save });
  const saved = save.mock.calls[0][1];
  expect(saved.__schedule__).toBeUndefined();
});
