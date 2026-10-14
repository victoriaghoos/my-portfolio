import { parseNote, sortNewestFirst } from '../../src/notes/parseNote';
import { formatNoteDate } from '../../src/notes/notes';

describe('parseNote', () => {
  it('reads frontmatter and body', () => {
    const note = parseNote(
      'tech-meet',
      `---\ntitle: "Tech&Meet: Kubernetes"\ndate: 2026-10-13\ntype: event\nlocation: Howest, Bruges\nexcerpt: Short summary\ndraft: true\n---\n\n## Heading\n\nBody text`,
    );

    expect(note).toMatchObject({
      slug: 'tech-meet',
      title: 'Tech&Meet: Kubernetes',
      date: '2026-10-13',
      type: 'event',
      location: 'Howest, Bruges',
      excerpt: 'Short summary',
      draft: true,
    });
    expect(note.body).toBe('## Heading\n\nBody text');
  });

  it('falls back to safe defaults', () => {
    const note = parseNote('plain', 'Just text');
    expect(note).toMatchObject({ title: 'plain', type: 'other', draft: false, body: 'Just text' });
  });

  it('handles Windows line endings and unknown types', () => {
    const note = parseNote('crlf', '---\r\ntitle: CRLF\r\ntype: party\r\n---\r\nBody');
    expect(note.title).toBe('CRLF');
    expect(note.type).toBe('other');
    expect(note.body).toBe('Body');
  });

  it('sorts newest first', () => {
    const a = parseNote('a', '---\ndate: 2026-10-01\n---\n');
    const b = parseNote('b', '---\ndate: 2026-11-24\n---\n');
    expect(sortNewestFirst([a, b]).map((n) => n.slug)).toEqual(['b', 'a']);
  });
});

describe('formatNoteDate', () => {
  it('formats in the requested language', () => {
    expect(formatNoteDate('2026-10-13', 'en')).toBe('October 13, 2026');
    expect(formatNoteDate('2026-10-13', 'nl')).toBe('13 oktober 2026');
  });

  it('falls back to English for language tags Intl rejects', () => {
    expect(formatNoteDate('2026-10-13', 'en-US@posix')).toBe('October 13, 2026');
  });

  it('returns the raw value for invalid dates', () => {
    expect(formatNoteDate('', 'en')).toBe('');
  });
});
