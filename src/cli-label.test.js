const { run } = require('./cli-label');
const { addLabel, removeLabel, getLabels, groupByLabel } = require('./label');
const { getAllSessions } = require('./sessions');

jest.mock('./label');
jest.mock('./sessions');

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.log.mockRestore();
  console.error.mockRestore();
});

test('add subcommand calls addLabel and prints labels', async () => {
  addLabel.mockResolvedValue(['work', 'urgent']);
  await run(['add', 'mysession', 'urgent']);
  expect(addLabel).toHaveBeenCalledWith('mysession', 'urgent');
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('work, urgent'));
});

test('add subcommand prints error if args missing', async () => {
  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  await expect(run(['add', 'mysession'])).rejects.toThrow('exit');
  expect(console.error).toHaveBeenCalled();
  mockExit.mockRestore();
});

test('remove subcommand calls removeLabel', async () => {
  removeLabel.mockResolvedValue(['work']);
  await run(['remove', 'mysession', 'urgent']);
  expect(removeLabel).toHaveBeenCalledWith('mysession', 'urgent');
});

test('list subcommand calls getLabels and prints them', async () => {
  getLabels.mockResolvedValue(['dev', 'research']);
  await run(['list', 'mysession']);
  expect(getLabels).toHaveBeenCalledWith('mysession');
  expect(console.log).toHaveBeenCalledWith('dev, research');
});

test('list prints (no labels) when empty', async () => {
  getLabels.mockResolvedValue([]);
  await run(['list', 'mysession']);
  expect(console.log).toHaveBeenCalledWith('(no labels)');
});

test('group subcommand calls getAllSessions and groupByLabel', async () => {
  getAllSessions.mockResolvedValue([{ name: 'a', labels: ['work'] }]);
  groupByLabel.mockResolvedValue({ work: [{ name: 'a' }] });
  await run(['group']);
  expect(getAllSessions).toHaveBeenCalled();
  expect(groupByLabel).toHaveBeenCalled();
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('work'));
});

test('unknown subcommand prints error and exits', async () => {
  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  await expect(run(['bogus'])).rejects.toThrow('exit');
  expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Unknown subcommand'));
  mockExit.mockRestore();
});

test('no args prints help', async () => {
  await run([]);
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('tabflow label'));
});
