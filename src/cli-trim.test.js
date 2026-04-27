jest.mock('./sessions');
jest.mock('./trim');
jest.mock('./storage');

const { getSession } = require('./sessions');
const { trimToCount, trimByIndices, trimTail, trimByPattern } = require('./trim');
const { saveSession } = require('./storage');
const { run, printHelp } = require('./cli-trim');

const mockSession = {
  name: 'work',
  tabs: [
    { url: 'https://a.com', title: 'A' },
    { url: 'https://b.com', title: 'B' },
    { url: 'https://c.com', title: 'C' },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  getSession.mockResolvedValue(mockSession);
  saveSession.mockResolvedValue();
  trimToCount.mockReturnValue({ ...mockSession, tabs: mockSession.tabs.slice(0, 2) });
  trimTail.mockReturnValue({ ...mockSession, tabs: mockSession.tabs.slice(0, 1) });
  trimByIndices.mockReturnValue({ ...mockSession, tabs: [mockSession.tabs[1]] });
  trimByPattern.mockReturnValue({ ...mockSession, tabs: [mockSession.tabs[0]] });
});

describe('cli-trim run', () => {
  it('calls trimToCount and saves for count subcommand', async () => {
    await run(['work', 'count', '2']);
    expect(trimToCount).toHaveBeenCalledWith(mockSession, 2);
    expect(saveSession).toHaveBeenCalled();
  });

  it('calls trimTail and saves for tail subcommand', async () => {
    await run(['work', 'tail', '2']);
    expect(trimTail).toHaveBeenCalledWith(mockSession, 2);
    expect(saveSession).toHaveBeenCalled();
  });

  it('calls trimByIndices and saves for indices subcommand', async () => {
    await run(['work', 'indices', '0,2']);
    expect(trimByIndices).toHaveBeenCalledWith(mockSession, [0, 2]);
    expect(saveSession).toHaveBeenCalled();
  });

  it('calls trimByPattern and saves for pattern subcommand', async () => {
    await run(['work', 'pattern', 'ads\.com']);
    expect(trimByPattern).toHaveBeenCalledWith(mockSession, 'ads\.com');
    expect(saveSession).toHaveBeenCalled();
  });

  it('exits with error for unknown subcommand', async () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(run(['work', 'unknown', '5'])).rejects.toThrow('exit');
    exitSpy.mockRestore();
  });

  it('exits when session not found', async () => {
    getSession.mockResolvedValue(null);
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(run(['missing', 'count', '2'])).rejects.toThrow('exit');
    exitSpy.mockRestore();
  });

  it('prints help when no args', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    await run([]);
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });
});
