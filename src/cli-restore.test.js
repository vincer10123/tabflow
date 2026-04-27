const { run, printHelp } = require('./cli-restore');

jest.mock('./restore');
jest.mock('./sessions');

const { restoreSession, restoreAllSessions } = require('./restore');
const { getAllSessions } = require('./sessions');

const mockResult = {
  ok: true,
  name: 'work',
  tabCount: 2,
  browser: 'chrome',
  command: 'open -a "Google Chrome" "https://github.com" "https://notion.so"',
  urls: ['https://github.com', 'https://notion.so'],
};

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  restoreSession.mockReturnValue(mockResult);
  restoreAllSessions.mockReturnValue([mockResult]);
  getAllSessions.mockReturnValue([{ name: 'work', tabs: [{}, {}] }]);
});

afterEach(() => jest.restoreAllMocks());

describe('printHelp', () => {
  it('prints usage info', () => {
    printHelp();
    expect(console.log).toHaveBeenCalled();
    const output = console.log.mock.calls[0][0];
    expect(output).toContain('restore');
    expect(output).toContain('--browser');
  });
});

describe('run', () => {
  it('prints help with no args', () => {
    run([]);
    expect(console.log).toHaveBeenCalled();
  });

  it('prints help with --help', () => {
    run(['--help']);
    expect(console.log).toHaveBeenCalled();
  });

  it('lists sessions with --list', () => {
    run(['--list']);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('work'));
  });

  it('handles empty sessions list', () => {
    getAllSessions.mockReturnValue([]);
    run(['--list']);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No sessions'));
  });

  it('restores single session by name', () => {
    run(['work']);
    expect(restoreSession).toHaveBeenCalledWith('work', { browser: 'chrome' });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('work'));
  });

  it('passes browser option', () => {
    run(['work', '--browser', 'firefox']);
    expect(restoreSession).toHaveBeenCalledWith('work', { browser: 'firefox' });
  });

  it('restores all sessions with --all', () => {
    run(['--all']);
    expect(restoreAllSessions).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('work'));
  });

  it('shows error when session not found', () => {
    restoreSession.mockReturnValue({ ok: false, error: 'Session "nope" not found' });
    const exit = jest.spyOn(process, 'exit').mockImplementation(() => {});
    run(['nope']);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('not found'));
    exit.mockRestore();
  });

  it('shows error when no name given', () => {
    const exit = jest.spyOn(process, 'exit').mockImplementation(() => {});
    run(['--browser', 'chrome']);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('session name required'));
    exit.mockRestore();
  });
});
