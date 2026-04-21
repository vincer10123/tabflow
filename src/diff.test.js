const { diffSessions, formatDiff } = require('./diff');

const sessionA = {
  name: 'work',
  tabs: [
    { url: 'https://github.com', title: 'GitHub' },
    { url: 'https://notion.so', title: 'Notion' },
    { url: 'https://slack.com', title: 'Slack' },
  ],
};

const sessionB = {
  name: 'work-updated',
  tabs: [
    { url: 'https://github.com', title: 'GitHub' },
    { url: 'https://notion.so', title: 'Notion' },
    { url: 'https://linear.app', title: 'Linear' },
  ],
};

describe('diffSessions', () => {
  test('identifies added tabs', () => {
    const diff = diffSessions(sessionA, sessionB);
    expect(diff.added).toHaveLength(1);
    expect(diff.added[0].url).toBe('https://linear.app');
  });

  test('identifies removed tabs', () => {
    const diff = diffSessions(sessionA, sessionB);
    expect(diff.removed).toHaveLength(1);
    expect(diff.removed[0].url).toBe('https://slack.com');
  });

  test('identifies kept tabs', () => {
    const diff = diffSessions(sessionA, sessionB);
    expect(diff.kept).toHaveLength(2);
  });

  test('returns empty diff for identical sessions', () => {
    const diff = diffSessions(sessionA, sessionA);
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
    expect(diff.kept).toHaveLength(3);
  });
});

describe('formatDiff', () => {
  test('includes session names in header', () => {
    const diff = diffSessions(sessionA, sessionB);
    const output = formatDiff(diff, 'work', 'work-updated');
    expect(output).toContain('work → work-updated');
  });

  test('shows added and removed counts', () => {
    const diff = diffSessions(sessionA, sessionB);
    const output = formatDiff(diff, 'work', 'work-updated');
    expect(output).toContain('+ 1 added');
    expect(output).toContain('- 1 removed');
  });

  test('lists added urls', () => {
    const diff = diffSessions(sessionA, sessionB);
    const output = formatDiff(diff, 'work', 'work-updated');
    expect(output).toContain('https://linear.app');
  });

  test('lists removed urls', () => {
    const diff = diffSessions(sessionA, sessionB);
    const output = formatDiff(diff, 'work', 'work-updated');
    expect(output).toContain('https://slack.com');
  });
});
