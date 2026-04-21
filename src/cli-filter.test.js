'use strict';

const { run, printHelp } = require('./cli-filter');
const { getAllSessions } = require('./sessions');

jest.mock('./sessions');

const mockSessions = [
  {
    name: 'work',
    tabs: [
      { url: 'https://github.com/foo', title: 'GitHub', pinned: true, tags: ['dev'] },
      { url: 'https://docs.github.com', title: 'Docs', pinned: false, tags: [] },
      { url: 'https://slack.com', title: 'Slack', pinned: false, tags: ['comms'] },
    ],
  },
  {
    name: 'tiny',
    tabs: [
      { url: 'https://example.com', title: 'Example', pinned: false, tags: [] },
    ],
  },
];

beforeEach(() => {
  getAllSessions.mockResolvedValue(mockSessions);
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

test('printHelp prints usage info', () => {
  printHelp();
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('tabflow filter'));
});

test('run with no args prints help', async () => {
  await run([]);
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('tabflow filter'));
});

test('filter sessions --min-tabs filters correctly', async () => {
  await run(['sessions', '--min-tabs', '2']);
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('work'));
  const calls = console.log.mock.calls.map(c => c[0]);
  expect(calls.some(c => c.includes('tiny'))).toBe(false);
});

test('filter tabs by domain', async () => {
  await run(['tabs', 'work', '--domain', 'github.com']);
  const calls = console.log.mock.calls.map(c => c[0]);
  expect(calls.some(c => c.includes('GitHub') || c.includes('Docs'))).toBe(true);
  expect(calls.some(c => c.includes('Slack'))).toBe(false);
});

test('filter tabs --pinned', async () => {
  await run(['tabs', 'work', '--pinned']);
  const calls = console.log.mock.calls.map(c => c[0]);
  expect(calls.some(c => c.includes('GitHub'))).toBe(true);
  expect(calls.some(c => c.includes('Slack'))).toBe(false);
});

test('filter tabs by tag', async () => {
  await run(['tabs', 'work', '--tag', 'comms']);
  const calls = console.log.mock.calls.map(c => c[0]);
  expect(calls.some(c => c.includes('Slack'))).toBe(true);
  expect(calls.some(c => c.includes('GitHub'))).toBe(false);
});

test('filter tabs with unknown session shows error', async () => {
  await run(['tabs', 'nope']);
  expect(console.error).toHaveBeenCalledWith(expect.stringContaining('not found'));
});

test('no matching tabs shows message', async () => {
  await run(['tabs', 'work', '--tag', 'nonexistent']);
  expect(console.log).toHaveBeenCalledWith('No tabs match the filter.');
});
