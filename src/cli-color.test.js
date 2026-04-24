const { run, printHelp } = require('./cli-color');
const { setColor, clearColor, getColor, filterByColor, groupByColor } = require('./color');
const { getAllSessions, getSession, saveSession } = require('./sessions');

jest.mock('./color');
jest.mock('./sessions');

describe('cli-color', () => {
  let consoleSpy, errorSpy;

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
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('tabflow color'));
  });

  test('run with no args prints help', async () => {
    await run([]);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('tabflow color'));
  });

  test('set command sets color on session', async () => {
    const session = { name: 'work', tabs: [] };
    const updated = { ...session, color: 'blue' };
    getSession.mockResolvedValue(session);
    setColor.mockReturnValue(updated);
    saveSession.mockResolvedValue(updated);

    await run(['set', 'work', 'blue']);

    expect(getSession).toHaveBeenCalledWith('work');
    expect(setColor).toHaveBeenCalledWith(session, 'blue');
    expect(saveSession).toHaveBeenCalledWith(updated);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('blue'));
  });

  test('set command errors without args', async () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(run(['set'])).rejects.toThrow('exit');
    expect(errorSpy).toHaveBeenCalled();
    exitSpy.mockRestore();
  });

  test('clear command clears color from session', async () => {
    const session = { name: 'work', color: 'blue' };
    const updated = { name: 'work' };
    getSession.mockResolvedValue(session);
    clearColor.mockReturnValue(updated);
    saveSession.mockResolvedValue(updated);

    await run(['clear', 'work']);

    expect(clearColor).toHaveBeenCalledWith(session);
    expect(saveSession).toHaveBeenCalledWith(updated);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('cleared'));
  });

  test('get command shows session color', async () => {
    const session = { name: 'work', color: 'green' };
    getSession.mockResolvedValue(session);
    getColor.mockReturnValue('green');

    await run(['get', 'work']);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('green'));
  });

  test('get command shows none when no color', async () => {
    const session = { name: 'work' };
    getSession.mockResolvedValue(session);
    getColor.mockReturnValue(null);

    await run(['get', 'work']);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No color'));
  });

  test('filter command lists matching sessions', async () => {
    const sessions = [{ name: 'work', color: 'red' }, { name: 'personal', color: 'blue' }];
    getAllSessions.mockResolvedValue(sessions);
    filterByColor.mockReturnValue([sessions[0]]);

    await run(['filter', 'red']);

    expect(filterByColor).toHaveBeenCalledWith(sessions, 'red');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('work'));
  });

  test('group command groups sessions by color', async () => {
    const sessions = [{ name: 'work', color: 'red' }];
    getAllSessions.mockResolvedValue(sessions);
    groupByColor.mockReturnValue({ red: [sessions[0]] });

    await run(['group']);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[red]'));
  });

  test('unknown command shows error', async () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(run(['unknown'])).rejects.toThrow('exit');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown command'));
    exitSpy.mockRestore();
  });
});
