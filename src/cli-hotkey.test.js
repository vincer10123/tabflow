const { run } = require('./cli-hotkey');
const hotkey = require('./hotkey');
const sessions = require('./sessions');

jest.mock('./hotkey');
jest.mock('./sessions');

let logSpy, errorSpy, exitSpy;

beforeEach(() => {
  jest.clearAllMocks();
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
});

afterEach(() => jest.restoreAllMocks());

test('prints help when no args given', async () => {
  await run([]);
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('tabflow hotkey'));
});

test('set command assigns hotkey', async () => {
  hotkey.setHotkey.mockResolvedValue({ name: 'work', hotkey: 'w' });
  await run(['set', 'work', 'w']);
  expect(hotkey.setHotkey).toHaveBeenCalledWith('work', 'w');
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('assigned'));
});

test('set command exits if missing args', async () => {
  await expect(run(['set', 'work'])).rejects.toThrow('exit');
  expect(errorSpy).toHaveBeenCalled();
});

test('clear command removes hotkey', async () => {
  hotkey.clearHotkey.mockResolvedValue({ name: 'work' });
  await run(['clear', 'work']);
  expect(hotkey.clearHotkey).toHaveBeenCalledWith('work');
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('cleared'));
});

test('get command shows hotkey', async () => {
  hotkey.getHotkey.mockResolvedValue('w');
  await run(['get', 'work']);
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('w'));
});

test('get command shows message when no hotkey', async () => {
  hotkey.getHotkey.mockResolvedValue(null);
  await run(['get', 'work']);
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No hotkey'));
});

test('list command shows all hotkeys', async () => {
  sessions.getAllSessions.mockResolvedValue([]);
  hotkey.listHotkeys.mockResolvedValue([{ hotkey: 'w', name: 'work' }]);
  await run(['list']);
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[w]'));
});

test('list command shows message when empty', async () => {
  sessions.getAllSessions.mockResolvedValue([]);
  hotkey.listHotkeys.mockResolvedValue([]);
  await run(['list']);
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No hotkeys'));
});

test('unknown command exits with error', async () => {
  await expect(run(['banana'])).rejects.toThrow('exit');
  expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown command'));
});
