'use strict';

const { run, printHelp } = require('./cli-timeout');
const { getAllSessions } = require('./sessions');
const { setTimeout_, clearTimeout_, getTimeout, getDueTimeouts } = require('./timeout');

jest.mock('./sessions');
jest.mock('./timeout');

describe('cli-timeout', () => {
  let consoleSpy;
  let errorSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('printHelp prints usage info', () => {
    printHelp();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('tabflow timeout'));
  });

  test('run with no args prints help', () => {
    run([]);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('tabflow timeout'));
  });

  test('run set applies timeout to session', () => {
    const session = { name: 'work', tabs: [] };
    getAllSessions.mockReturnValue({ work: session });
    setTimeout_.mockReturnValue({ ...session, timeout: { expiresAt: Date.now() + 60000 } });

    run(['set', 'work', '10']);

    expect(setTimeout_).toHaveBeenCalledWith(session, 10);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Timeout set'));
  });

  test('run set exits if session not found', () => {
    getAllSessions.mockReturnValue({});
    expect(() => run(['set', 'ghost', '5'])).toThrow('exit');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));
  });

  test('run set exits if minutes invalid', () => {
    expect(() => run(['set', 'work', 'abc'])).toThrow('exit');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('positive integer'));
  });

  test('run clear removes timeout', () => {
    const session = { name: 'work', tabs: [] };
    getAllSessions.mockReturnValue({ work: session });
    clearTimeout_.mockReturnValue({ ...session });

    run(['clear', 'work']);

    expect(clearTimeout_).toHaveBeenCalledWith(session);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('cleared'));
  });

  test('run get shows no timeout when none set', () => {
    const session = { name: 'work', tabs: [] };
    getAllSessions.mockReturnValue({ work: session });
    getTimeout.mockReturnValue(null);

    run(['get', 'work']);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No timeout'));
  });

  test('run due lists expired sessions', () => {
    const expired = { name: 'old', tabs: [], timeout: { expiresAt: Date.now() - 1000 } };
    getAllSessions.mockReturnValue({ old: expired });
    getDueTimeouts.mockReturnValue([expired]);

    run(['due']);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('old'));
  });

  test('run due shows empty message when none due', () => {
    getAllSessions.mockReturnValue({});
    getDueTimeouts.mockReturnValue([]);

    run(['due']);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No sessions'));
  });

  test('run unknown sub exits with error', () => {
    expect(() => run(['foobar'])).toThrow('exit');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown subcommand'));
  });
});
