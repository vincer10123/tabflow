const { saveAsTemplate, instantiateTemplate, listTemplates, BUILT_IN_TEMPLATES } = require('./template');

jest.mock('./storage', () => {
  const store = {};
  return {
    saveSession: jest.fn((key, val) => { store[key] = val; }),
    loadSession: jest.fn((key) => {
      if (store[key]) return store[key];
      throw new Error('not found');
    }),
    listSessions: jest.fn(() => Object.keys(store)),
  };
});

const storage = require('./storage');

describe('saveAsTemplate', () => {
  it('saves a session as a template with isTemplate flag', () => {
    const session = { name: 'mysession', tabs: [{ title: 'GitHub', url: 'https://github.com', pinned: true }] };
    const tmpl = saveAsTemplate(session, 'mytemplate');
    expect(tmpl.isTemplate).toBe(true);
    expect(tmpl.name).toBe('mytemplate');
    expect(tmpl.tabs[0]).toEqual({ title: 'GitHub', url: 'https://github.com' });
    expect(storage.saveSession).toHaveBeenCalledWith('template__mytemplate', expect.objectContaining({ isTemplate: true }));
  });

  it('uses session name if no template name provided', () => {
    const session = { name: 'fallback', tabs: [{ title: 'X', url: 'https://x.com' }] };
    const tmpl = saveAsTemplate(session);
    expect(tmpl.name).toBe('fallback');
  });

  it('throws on invalid session', () => {
    expect(() => saveAsTemplate(null)).toThrow('Invalid session');
  });

  it('throws if no name can be determined', () => {
    expect(() => saveAsTemplate({ tabs: [] })).toThrow('Template name is required');
  });
});

describe('instantiateTemplate', () => {
  it('instantiates a built-in template', () => {
    const session = instantiateTemplate('work', 'my-work');
    expect(session.name).toBe('my-work');
    expect(session.tabs.length).toBe(BUILT_IN_TEMPLATES.work.tabs.length);
  });

  it('generates a name if none provided', () => {
    const session = instantiateTemplate('research');
    expect(session.name).toMatch(/^research-/);
  });

  it('throws for unknown template', () => {
    expect(() => instantiateTemplate('nonexistent')).toThrow('Template "nonexistent" not found');
  });
});

describe('listTemplates', () => {
  it('returns built-in template names', () => {
    storage.listSessions.mockReturnValue([]);
    const list = listTemplates();
    expect(list).toContain('work');
    expect(list).toContain('research');
  });

  it('includes saved templates', () => {
    storage.listSessions.mockReturnValue(['template__custom', 'session__other']);
    const list = listTemplates();
    expect(list).toContain('custom');
    expect(list).not.toContain('session__other');
  });
});
