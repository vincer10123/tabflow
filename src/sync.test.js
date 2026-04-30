const { diffProfiles, mergeProfiles, getSyncStatus } = require('./sync');

const makeSession = (name, tabs = [], updatedAt = 1000) => ({ name, tabs, updatedAt });

describe('diffProfiles', () => {
  it('identifies sessions only in A', () => {
    const a = [makeSession('work'), makeSession('shared')];
    const b = [makeSession('shared')];
    const { onlyInA } = diffProfiles(a, b);
    expect(onlyInA.map(s => s.name)).toEqual(['work']);
  });

  it('identifies sessions only in B', () => {
    const a = [makeSession('shared')];
    const b = [makeSession('shared'), makeSession('personal')];
    const { onlyInB } = diffProfiles(a, b);
    expect(onlyInB.map(s => s.name)).toEqual(['personal']);
  });

  it('identifies sessions in both', () => {
    const a = [makeSession('alpha'), makeSession('beta')];
    const b = [makeSession('beta'), makeSession('gamma')];
    const { inBoth } = diffProfiles(a, b);
    expect(inBoth.map(s => s.name)).toEqual(['beta']);
  });
});

describe('mergeProfiles', () => {
  it('union strategy keeps all unique sessions', () => {
    const a = [makeSession('a'), makeSession('shared')];
    const b = [makeSession('b'), makeSession('shared')];
    const result = mergeProfiles(a, b, 'union');
    expect(result.map(s => s.name).sort()).toEqual(['a', 'b', 'shared']);
  });

  it('overwrite strategy replaces with B values', () => {
    const a = [makeSession('s', [{ url: 'http://old.com' }], 500)];
    const b = [makeSession('s', [{ url: 'http://new.com' }], 999)];
    const result = mergeProfiles(a, b, 'overwrite');
    expect(result[0].tabs[0].url).toBe('http://new.com');
  });

  it('newer strategy keeps the more recent session', () => {
    const a = [makeSession('s', [], 2000)];
    const b = [makeSession('s', [], 500)];
    const result = mergeProfiles(a, b, 'newer');
    expect(result[0].updatedAt).toBe(2000);
  });
});

describe('getSyncStatus', () => {
  it('returns status objects for each session', () => {
    const sessions = [makeSession('work', [{ url: 'a' }, { url: 'b' }], Date.now() - 5000)];
    const status = getSyncStatus(sessions);
    expect(status[0].name).toBe('work');
    expect(status[0].tabCount).toBe(2);
    expect(status[0].age).toBeGreaterThanOrEqual(5);
  });
});
