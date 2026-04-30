const {
  getAuditLog,
  recordAudit,
  clearAuditLog,
  getRecentAuditEntries,
  getAllAuditLogs,
  summarizeAuditLog,
} = require('./audit');

beforeEach(() => {
  clearAuditLog('work');
  clearAuditLog('personal');
});

test('recordAudit stores an entry', () => {
  const entry = recordAudit('work', 'create', { user: 'cli' });
  expect(entry.action).toBe('create');
  expect(entry.user).toBe('cli');
  expect(entry.timestamp).toBeDefined();
});

test('getAuditLog returns all entries for session', () => {
  recordAudit('work', 'create');
  recordAudit('work', 'update');
  const log = getAuditLog('work');
  expect(log).toHaveLength(2);
});

test('getAuditLog returns empty array for unknown session', () => {
  expect(getAuditLog('unknown')).toEqual([]);
});

test('getRecentAuditEntries respects limit', () => {
  for (let i = 0; i < 15; i++) recordAudit('work', 'update');
  const recent = getRecentAuditEntries('work', 5);
  expect(recent).toHaveLength(5);
});

test('clearAuditLog removes entries', () => {
  recordAudit('work', 'delete');
  clearAuditLog('work');
  expect(getAuditLog('work')).toEqual([]);
});

test('getAllAuditLogs returns all sessions', () => {
  recordAudit('work', 'create');
  recordAudit('personal', 'create');
  const all = getAllAuditLogs();
  const names = all.map((a) => a.sessionName);
  expect(names).toContain('work');
  expect(names).toContain('personal');
});

test('summarizeAuditLog counts actions', () => {
  recordAudit('work', 'create');
  recordAudit('work', 'update');
  recordAudit('work', 'update');
  const summary = summarizeAuditLog('work');
  expect(summary.total).toBe(3);
  expect(summary.counts.update).toBe(2);
  expect(summary.counts.create).toBe(1);
});
