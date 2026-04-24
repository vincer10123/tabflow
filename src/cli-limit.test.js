'use strict';

const { run, printHelp } = require('./cli-limit');

jest.mock('./storage');
jest.mock('./limit');

const storage = require('./storage');
const limit = require('./limit');

const mockSession = { name: 'work', tabs: [{ url: 'https://a.com' }, { url: 'https://b.com' }], meta: {} };

beforeEach(() => {
  jest.clearAllMocks();
  storage.loadSession = jest.fn().mockResolvedValue(mockSession);
  storage.saveSession = jest.fn().mockResolvedValue();
  limit.getLimit = jest.fn().mockReturnValue(10);
  limit.setLimit = jest.fn().mockReturnValue({ ...mockSession, meta: { limit: 10 } });
  limit.clearLimit = jest.fn().mockReturnValue({ ...mockSession, meta: {} });
  limit.isAtLimit = jest.fn().mockReturnValue(false);
});

describe('cli-limit', () => {
  test('printHelp does not throw', () => {
    expect(() => printHelp()).not.toThrow();
  });

  test('get command prints limit', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await run(['work', 'get']);
    expect(storage.loadSession).toHaveBeenCalledWith('work');
    expect(limit.getLimit).toHaveBeenCalledWith(mockSession);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('10'));
    spy.mockRestore();
  });

  test('get command with no limit set', async () => {
    limit.getLimit.mockReturnValue(null);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await run(['work', 'get']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No limit'));
    spy.mockRestore();
  });

  test('set command saves updated session', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await run(['work', 'set', '20']);
    expect(limit.setLimit).toHaveBeenCalledWith(mockSession, 20);
    expect(storage.saveSession).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('20'));
    spy.mockRestore();
  });

  test('set command rejects non-numeric value', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const exit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(run(['work', 'set', 'abc'])).rejects.toThrow('exit');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('positive integer'));
    spy.mockRestore();
    exit.mockRestore();
  });

  test('clear command removes limit', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await run(['work', 'clear']);
    expect(limit.clearLimit).toHaveBeenCalledWith(mockSession);
    expect(storage.saveSession).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('cleared'));
    spy.mockRestore();
  });

  test('check command shows within limit', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await run(['work', 'check']);
    expect(limit.isAtLimit).toHaveBeenCalledWith(mockSession);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('within limit'));
    spy.mockRestore();
  });

  test('check command shows at limit', async () => {
    limit.isAtLimit.mockReturnValue(true);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await run(['work', 'check']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('AT or OVER'));
    spy.mockRestore();
  });

  test('unknown command exits with error', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const exit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(run(['work', 'unknown'])).rejects.toThrow('exit');
    spy.mockRestore();
    exit.mockRestore();
  });
});
