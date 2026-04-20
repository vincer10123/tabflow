import { describe, it, expect, vi } from 'vitest';
import { withLockGuard, applyLockGuards } from './lock-middleware.js';

const lockedSession = { name: 'work', locked: true, tabs: [] };
const openSession = { name: 'personal', locked: false, tabs: [] };

describe('withLockGuard', () => {
  it('calls the wrapped function when session is not locked', async () => {
    const fn = vi.fn().mockResolvedValue({ ...openSession, tabs: [{ url: 'https://example.com' }] });
    const guarded = withLockGuard(fn);
    const result = await guarded(openSession, 'extra-arg');
    expect(fn).toHaveBeenCalledWith(openSession, 'extra-arg');
    expect(result.tabs).toHaveLength(1);
  });

  it('throws when session is locked', async () => {
    const fn = vi.fn();
    const guarded = withLockGuard(fn);
    await expect(guarded(lockedSession)).rejects.toThrow(/locked/);
    expect(fn).not.toHaveBeenCalled();
  });

  it('propagates errors from the wrapped function', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('save failed'));
    const guarded = withLockGuard(fn);
    await expect(guarded(openSession)).rejects.toThrow('save failed');
  });
});

describe('applyLockGuards', () => {
  it('returns an object with the same keys', () => {
    const ops = {
      addTab: vi.fn(),
      removeTab: vi.fn(),
    };
    const guarded = applyLockGuards(ops);
    expect(Object.keys(guarded)).toEqual(['addTab', 'removeTab']);
  });

  it('all returned functions enforce lock guard', async () => {
    const addTab = vi.fn().mockResolvedValue(lockedSession);
    const guarded = applyLockGuards({ addTab });
    await expect(guarded.addTab(lockedSession, {})).rejects.toThrow(/locked/);
    expect(addTab).not.toHaveBeenCalled();
  });

  it('all returned functions pass through when unlocked', async () => {
    const addTab = vi.fn().mockResolvedValue(openSession);
    const guarded = applyLockGuards({ addTab });
    await guarded.addTab(openSession, {});
    expect(addTab).toHaveBeenCalledWith(openSession, {});
  });
});
