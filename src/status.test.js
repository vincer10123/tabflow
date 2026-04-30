const { getSessionStatus, getStatusSummary, filterByStatus, formatStatus } = require('./status');

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const now = Date.now();

const session = (name) => ({ name, tabs: [] });
const log = (hoursAgo) => ({ lastAccessed: new Date(now - hoursAgo * HOUR).toISOString() });

describe('getSessionStatus', () => {
  test('returns active if accessed within 24h', () => {
    expect(getSessionStatus(session('s'), log(1), now)).toBe('active');
  });

  test('returns idle if accessed 25-167 hours ago', () => {
    expect(getSessionStatus(session('s'), log(48), now)).toBe('idle');
  });

  test('returns stale if not accessed for 7+ days', () => {
    expect(getSessionStatus(session('s'), log(24 * 8), now)).toBe('stale');
  });

  test('returns new if no access log', () => {
    expect(getSessionStatus(session('s'), {}, now)).toBe('new');
  });
});

describe('getStatusSummary', () => {
  test('groups sessions by status', () => {
    const sessions = [session('a'), session('b'), session('c')];
    const logs = {
      a: log(1),
      b: log(48),
      c: log(24 * 8),
    };
    const summary = getStatusSummary(sessions, logs, now);
    expect(summary.active).toContain('a');
    expect(summary.idle).toContain('b');
    expect(summary.stale).toContain('c');
  });

  test('puts sessions with no log in new', () => {
    const sessions = [session('x')];
    const summary = getStatusSummary(sessions, {}, now);
    expect(summary.new).toContain('x');
  });
});

describe('filterByStatus', () => {
  test('filters to only matching status', () => {
    const sessions = [session('a'), session('b')];
    const logs = { a: log(1), b: log(48) };
    const result = filterByStatus(sessions, 'active', logs, now);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('a');
  });
});

describe('formatStatus', () => {
  test('formats known statuses with icons', () => {
    expect(formatStatus('active')).toContain('active');
    expect(formatStatus('stale')).toContain('🔴');
    expect(formatStatus('idle')).toContain('🟡');
    expect(formatStatus('new')).toContain('🔵');
  });

  test('handles unknown status gracefully', () => {
    expect(formatStatus('unknown')).toContain('unknown');
  });
});
