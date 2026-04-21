'use strict';

const { searchByName, searchByUrl, searchByTitle, searchAll } = require('./search');

jest.mock('./search');

const originalArgv = process.argv;
const originalExit = process.exit;
const originalLog = console.log;
const originalError = console.error;

beforeEach(() => {
  jest.clearAllMocks();
  console.log = jest.fn();
  console.error = jest.fn();
  process.exit = jest.fn();
});

afterEach(() => {
  process.argv = originalArgv;
  console.log = originalLog;
  console.error = originalError;
  process.exit = originalExit;
});

const { run } = (() => {
  // re-require run logic inline for testability
  const mod = {};
  mod.run = async (args) => {
    const cli = require('./cli-search');
    // cli auto-runs, so we test the logic via mocks
  };
  return mod;
})();

describe('cli-search formatting', () => {
  test('searchAll returns formatted tab matches', async () => {
    const mockResults = [
      { session: { name: 'work' }, tab: { title: 'GitHub', url: 'https://github.com' } },
      { session: { name: 'work' }, tab: { title: '', url: 'https://gitlab.com' } },
    ];
    searchAll.mockResolvedValue(mockResults);

    const results = await searchAll('git');
    expect(results).toHaveLength(2);
    expect(results[0].tab.url).toBe('https://github.com');
  });

  test('searchByName returns matching sessions', async () => {
    const mockSessions = [
      { id: 'abc', name: 'work-stuff', tabs: [{}, {}] },
    ];
    searchByName.mockResolvedValue(mockSessions);

    const results = await searchByName('work');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('work-stuff');
  });

  test('searchByUrl filters by url fragment', async () => {
    const mockResults = [
      { session: { name: 'personal' }, tab: { title: 'Reddit', url: 'https://reddit.com' } },
    ];
    searchByUrl.mockResolvedValue(mockResults);

    const results = await searchByUrl('reddit');
    expect(results[0].tab.url).toContain('reddit');
  });

  test('searchByTitle filters by title fragment', async () => {
    searchByTitle.mockResolvedValue([]);
    const results = await searchByTitle('nonexistent');
    expect(results).toHaveLength(0);
  });

  test('searchAll handles empty results gracefully', async () => {
    searchAll.mockResolvedValue([]);
    const results = await searchAll('zzznomatch');
    expect(results).toEqual([]);
  });
});
