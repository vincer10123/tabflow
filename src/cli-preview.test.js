import { describe, it, expect, vi, beforeEach } from 'vitest';
import { run, printHelp } from './cli-preview.js';
import * as preview from './preview.js';

vi.mock('./preview.js');

const mockSession = {
  name: 'work',
  tabs: [
    { title: 'GitHub', url: 'https://github.com', pinned: false },
    { title: 'Docs', url: 'https://docs.example.com', pinned: true },
  ],
  createdAt: '2024-01-01T00:00:00.000Z',
};

const mockAllSessions = [
  mockSession,
  {
    name: 'personal',
    tabs: [{ title: 'Reddit', url: 'https://reddit.com', pinned: false }],
    createdAt: '2024-01-02T00:00:00.000Z',
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('printHelp', () => {
  it('prints usage information', () => {
    printHelp();
    expect(console.log).toHaveBeenCalled();
    const output = console.log.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toMatch(/preview/);
    expect(output).toMatch(/--all/);
  });
});

describe('run', () => {
  it('shows help with --help flag', async () => {
    await run(['--help']);
    const output = console.log.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toMatch(/preview/);
  });

  it('previews a named session', async () => {
    preview.previewSession.mockResolvedValue(mockSession);
    await run(['work']);
    expect(preview.previewSession).toHaveBeenCalledWith('work');
    const output = console.log.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toMatch(/work/);
    expect(output).toMatch(/GitHub/);
  });

  it('previews all sessions with --all flag', async () => {
    preview.previewAllSessions.mockResolvedValue(mockAllSessions);
    await run(['--all']);
    expect(preview.previewAllSessions).toHaveBeenCalled();
    const output = console.log.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toMatch(/work/);
    expect(output).toMatch(/personal/);
  });

  it('shows tab count in preview', async () => {
    preview.previewSession.mockResolvedValue(mockSession);
    await run(['work']);
    const output = console.log.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toMatch(/2/);
  });

  it('shows pinned indicator for pinned tabs', async () => {
    preview.previewSession.mockResolvedValue(mockSession);
    await run(['work']);
    const output = console.log.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toMatch(/pinned|📌|\[P\]/i);
  });

  it('handles session not found error', async () => {
    preview.previewSession.mockRejectedValue(new Error('Session not found: missing'));
    await run(['missing']);
    expect(console.error).toHaveBeenCalled();
    const errOutput = console.error.mock.calls.map(c => c.join(' ')).join('\n');
    expect(errOutput).toMatch(/not found|missing/i);
  });

  it('prints error when no session name provided', async () => {
    await run([]);
    expect(console.error).toHaveBeenCalled();
  });

  it('previews all sessions showing empty state when none exist', async () => {
    preview.previewAllSessions.mockResolvedValue([]);
    await run(['--all']);
    const output = console.log.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toMatch(/no sessions|empty/i);
  });
});
