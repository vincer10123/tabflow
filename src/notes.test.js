const { addNote, getNotes, removeNote, clearNotes } = require('./notes');
const { loadSession, saveSession } = require('./storage');

jest.mock('./storage');

const mockSession = () => ({ name: 'work', tabs: [], notes: [] });

beforeEach(() => jest.clearAllMocks());

test('addNote appends a note to the session', async () => {
  const session = mockSession();
  loadSession.mockResolvedValue(session);
  saveSession.mockResolvedValue();
  const notes = await addNote('work', 'remember to close jira tabs');
  expect(notes).toHaveLength(1);
  expect(notes[0].text).toBe('remember to close jira tabs');
  expect(notes[0].createdAt).toBeDefined();
  expect(saveSession).toHaveBeenCalledWith('work', expect.objectContaining({ notes }));
});

test('getNotes returns notes array', async () => {
  const session = { ...mockSession(), notes: [{ text: 'hi', createdAt: '2024-01-01' }] };
  loadSession.mockResolvedValue(session);
  const notes = await getNotes('work');
  expect(notes).toHaveLength(1);
  expect(notes[0].text).toBe('hi');
});

test('getNotes returns empty array if no notes', async () => {
  loadSession.mockResolvedValue(mockSession());
  const notes = await getNotes('work');
  expect(notes).toEqual([]);
});

test('removeNote removes note by index', async () => {
  const session = { ...mockSession(), notes: [{ text: 'a' }, { text: 'b' }] };
  loadSession.mockResolvedValue(session);
  saveSession.mockResolvedValue();
  const removed = await removeNote('work', 0);
  expect(removed.text).toBe('a');
  expect(saveSession).toHaveBeenCalledWith('work', expect.objectContaining({ notes: [{ text: 'b' }] }));
});

test('removeNote throws on invalid index', async () => {
  loadSession.mockResolvedValue(mockSession());
  await expect(removeNote('work', 5)).rejects.toThrow('out of range');
});

test('clearNotes empties notes array', async () => {
  const session = { ...mockSession(), notes: [{ text: 'x' }] };
  loadSession.mockResolvedValue(session);
  saveSession.mockResolvedValue();
  await clearNotes('work');
  expect(saveSession).toHaveBeenCalledWith('work', expect.objectContaining({ notes: [] }));
});

test('throws if session not found', async () => {
  loadSession.mockResolvedValue(null);
  await expect(addNote('ghost', 'hi')).rejects.toThrow("Session 'ghost' not found");
});
