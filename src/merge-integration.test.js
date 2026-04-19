const { mergeSessions } = require('./merge');
const { createSession, getSession } = require('./sessions');
const { ensureSessionsDir } = require('./storage');
const path = require('path');
const fs = require('fs');
const os = require('os');

let tmpDir;

beforeAll(async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tabflow-merge-'));
  process.env.TABFLOW_DIR = tmpDir;
  await ensureSessionsDir();
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  delete process.env.TABFLOW_DIR;
});

test('full merge flow saves and retrieves merged session', async () => {
  await createSession('alpha', [
    { url: 'https://example.com', title: 'Example' },
    { url: 'https://nodejs.org', title: 'Node.js' },
  ]);

  await createSession('beta', [
    { url: 'https://nodejs.org', title: 'Node.js' },
    { url: 'https://npmjs.com', title: 'npm' },
  ]);

  const merged = await mergeSessions(['alpha', 'beta'], 'combined', { dedupe: true });

  expect(merged.tabs).toHaveLength(3);
  expect(merged.mergedFrom).toContain('alpha');
  expect(merged.mergedFrom).toContain('beta');

  const loaded = await getSession('combined');
  expect(loaded).not.toBeNull();
  expect(loaded.tabs).toHaveLength(3);
});
