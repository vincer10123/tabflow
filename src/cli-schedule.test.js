const { run } = require('./cli-schedule');

jest.mock('./schedule', () => ({
  scheduleSession: jest.fn(),
  unscheduleSession: jest.fn(),
  getSchedule: jest.fn(),
  loadSession: jest.fn(),
}));

jest.mock('./storage', () => ({
  listSessions: jest.fn(() => ['work', 'personal']),
  loadSession: jest.fn((name) => ({ name, tabs: [] })),
}));

const schedule = require('./schedule');
const storage = require('./storage');

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.log.mockRestore();
  console.error.mockRestore();
});

test('set schedules a session', () => {
  run(['set', 'work', '2030-01-01T09:00:00Z']);
  expect(schedule.scheduleSession).toHaveBeenCalledWith('work', '2030-01-01T09:00:00Z');
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('work'));
});

test('set exits with error if name or datetime missing', () => {
  const exit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  expect(() => run(['set', 'work'])).toThrow('exit');
  expect(console.error).toHaveBeenCalled();
  exit.mockRestore();
});

test('clear unschedules a session', () => {
  run(['clear', 'work']);
  expect(schedule.unscheduleSession).toHaveBeenCalledWith('work');
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('work'));
});

test('list shows sessions with schedules', () => {
  schedule.getSchedule.mockImplementation((s) =>
    s.name === 'work' ? new Date('2030-01-01T09:00:00Z') : null
  );
  run(['list']);
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('work'));
});

test('list shows message when none scheduled', () => {
  schedule.getSchedule.mockReturnValue(null);
  run(['list']);
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No scheduled'));
});

test('due shows sessions that are due', () => {
  schedule.getSchedule.mockImplementation((s) =>
    s.name === 'personal' ? new Date('2000-01-01T00:00:00Z') : null
  );
  run(['due']);
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('personal'));
});

test('unknown command prints help and exits', () => {
  const exit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  expect(() => run(['unknown'])).toThrow('exit');
  exit.mockRestore();
});
