'use strict';

const { run, printHelp } = require('./cli-sort');
const sessions = require('./sessions');
const sort = require('./sort');

jest.mock('./sessions');
jest.mock('./sort');

describe('cli-sort', () => {
  let consoleSpy;
  let errorSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    errorSpy.mockRestore();
  });

  test('printHelp prints usage info', () => {
    printHelp();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('tabflow sort'));
  });

  test('--help flag prints help', async () => {
    await run(['--help']);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('tabflow sort'));
  });

  test('sorts tabs by title (default)', async () => {
    const mockTabs = [{ title: 'B', url: 'http://b.com' }, { title: 'A', url: 'http://a.com' }];
    sessions.getSession.mockResolvedValue({ name: 'work', tabs: mockTabs });
    sort.sortTabsByTitle.mockReturnValue([...mockTabs].reverse());
    sessions.createSession.mockResolvedValue();

    await run(['tabs', 'work', '--by', 'title']);

    expect(sort.sortTabsByTitle).toHaveBeenCalledWith(mockTabs, false);
    expect(sessions.createSession).toHaveBeenCalledWith('work', expect.any(Array));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Sorted'));
  });

  test('sorts tabs by url descending', async () => {
    const mockTabs = [{ url: 'http://z.com' }, { url: 'http://a.com' }];
    sessions.getSession.mockResolvedValue({ name: 'work', tabs: mockTabs });
    sort.sortTabsByUrl.mockReturnValue([...mockTabs]);
    sessions.createSession.mockResolvedValue();

    await run(['tabs', 'work', '--by', 'url', '--desc']);

    expect(sort.sortTabsByUrl).toHaveBeenCalledWith(mockTabs, true);
  });

  test('errors if session not found', async () => {
    sessions.getSession.mockResolvedValue(null);
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    await expect(run(['tabs', 'ghost', '--by', 'title'])).rejects.toThrow('exit');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));
    exitSpy.mockRestore();
  });

  test('lists sorted sessions by name', async () => {
    const mockSessions = [
      { name: 'beta', tabs: [1, 2] },
      { name: 'alpha', tabs: [1] }
    ];
    sessions.getAllSessions.mockResolvedValue(mockSessions);
    sort.sortSessionsByName.mockReturnValue([...mockSessions].reverse());

    await run(['sessions', '--by', 'name']);

    expect(sort.sortSessionsByName).toHaveBeenCalledWith(mockSessions, false);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Sessions sorted'));
  });
});
