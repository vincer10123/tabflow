const { withTimeoutGuard, applyTimeoutGuards } = require('./timeout-middleware');
const timeoutModule = require('./timeout');

jest.mock('./timeout');

beforeEach(() => jest.clearAllMocks());

test('allows operation when session is not timed out', () => {
  timeoutModule.isTimedOut.mockReturnValue(false);
  const op = jest.fn().mockReturnValue('ok');
  const guarded = withTimeoutGuard(op);
  expect(guarded('work')).toBe('ok');
  expect(op).toHaveBeenCalledWith('work');
});

test('blocks operation when session is timed out', () => {
  timeoutModule.isTimedOut.mockReturnValue(true);
  const op = jest.fn();
  const guarded = withTimeoutGuard(op);
  expect(() => guarded('work')).toThrow('timed out');
  expect(op).not.toHaveBeenCalled();
});

test('autoClear clears timeout and proceeds', () => {
  timeoutModule.isTimedOut.mockReturnValue(true);
  timeoutModule.clearTimeout = jest.fn();
  const op = jest.fn().mockReturnValue('done');
  const guarded = withTimeoutGuard(op, { autoClear: true });
  const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  expect(guarded('work')).toBe('done');
  expect(timeoutModule.clearTimeout).toHaveBeenCalledWith('work');
  expect(op).toHaveBeenCalled();
  spy.mockRestore();
});

test('passes extra args to wrapped function', () => {
  timeoutModule.isTimedOut.mockReturnValue(false);
  const op = jest.fn();
  const guarded = withTimeoutGuard(op);
  guarded('work', { tabs: [] }, 'extra');
  expect(op).toHaveBeenCalledWith('work', { tabs: [] }, 'extra');
});

test('applyTimeoutGuards wraps all operations', () => {
  timeoutModule.isTimedOut.mockReturnValue(false);
  const ops = { save: jest.fn(), load: jest.fn() };
  const guarded = applyTimeoutGuards(ops);
  guarded.save('s1');
  guarded.load('s2');
  expect(ops.save).toHaveBeenCalledWith('s1');
  expect(ops.load).toHaveBeenCalledWith('s2');
});

test('does not throw if isTimedOut errors (no timeout set)', () => {
  timeoutModule.isTimedOut.mockImplementation(() => { throw new Error('no timeout'); });
  const op = jest.fn().mockReturnValue('fine');
  const guarded = withTimeoutGuard(op);
  expect(guarded('work')).toBe('fine');
});
