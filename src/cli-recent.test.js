'use strict';

const { run, printHelp } = require('./cli-recent');
const recent = require('./recent');

jest.mock('./recent');

const mockSessions = [
  { name: 'work', tabs: [{ url: 'https://a.com' }, { url: 'https://b.com' }], createdAt: '2024-01-10T10:00:00Z', updatedAt: '2024-01-10T12:00:00Z' },
  { name: 'research', tabs: [{ url: 'https://c.com' }], createdAt: '2024-01-09T08:00:00Z', updatedAt: '2024-01-09T09:00:00Z' },
];

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.log.mockRestore();
  console.error.mockRestore();
});

test('printHelp outputs usage info', () => {
  printHelp();
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('tabflow recent'));
});

test('run with no args shows recent sessions', async () => {
  recent.getRecentSessions.mockResolvedValue(mockSessions);
  await run([]);
  expect(recent.getRecentSessions).toHaveBeenCalledWith(5);
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('work'));
});

test('run with --modified shows recently modified sessions', async () => {
  recent.getRecentlyModifiedSessions.mockResolvedValue([mockSessions[0]]);
  await run(['--modified']);
  expect(recent.getRecentlyModifiedSessions).toHaveBeenCalledWith(5);
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('recently modified'));
});

test('run with --last shows last session', async () => {
  recent.getLastSession.mockResolvedValue(mockSessions[0]);
  await run(['--last']);
  expect(recent.getLastSession).toHaveBeenCalled();
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Last session: work'));
});

test('run with --last and no sessions shows message', async () => {
  recent.getLastSession.mockResolvedValue(null);
  await run(['--last']);
  expect(console.log).toHaveBeenCalledWith('No sessions found.');
});

test('run with --limit sets the limit', async () => {
  recent.getRecentSessions.mockResolvedValue(mockSessions);
  await run(['--limit', '10']);
  expect(recent.getRecentSessions).toHaveBeenCalledWith(10);
});

test('run with invalid --limit exits with error', async () => {
  const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  await expect(run(['--limit', 'abc'])).rejects.toThrow('exit');
  expect(console.error).toHaveBeenCalledWith(expect.stringContaining('positive number'));
  exitSpy.mockRestore();
});

test('run with no sessions shows empty message', async () => {
  recent.getRecentSessions.mockResolvedValue([]);
  await run([]);
  expect(console.log).toHaveBeenCalledWith('No recent sessions found.');
});

test('run with --help shows help', async () => {
  await run(['--help']);
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('--modified'));
});
