export type NoteType = 'event' | 'hackathon' | 'podcast' | 'project' | 'site' | 'other';

const NOTE_TYPES: readonly NoteType[] = [
  'event',
  'hackathon',
  'podcast',
  'project',
  'site',
  'other',
];

export interface Note {
  slug: string;
  title: string;
  date: string;
  type: NoteType;
  location?: string;
  excerpt: string;
  cover?: string;
  draft: boolean;
  body: string;
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

const unquote = (value: string) => value.trim().replace(/^(['"])(.*)\1$/, '$2');

// Minimal frontmatter parser: flat `key: value` pairs only, which is all a note needs.
export const parseNote = (slug: string, raw: string): Note => {
  const match = FRONTMATTER.exec(raw);
  const meta: Record<string, string> = {};
  const body = match ? match[2] : raw;

  if (match) {
    for (const line of match[1].split(/\r?\n/)) {
      const separator = line.indexOf(':');
      if (separator === -1 || line.trimStart().startsWith('#')) continue;
      meta[line.slice(0, separator).trim()] = unquote(line.slice(separator + 1));
    }
  }

  const type = NOTE_TYPES.includes(meta.type as NoteType) ? (meta.type as NoteType) : 'other';

  return {
    slug,
    title: meta.title || slug,
    date: meta.date || '',
    type,
    location: meta.location || undefined,
    excerpt: meta.excerpt || '',
    cover: meta.cover || undefined,
    draft: meta.draft === 'true',
    body: body.trim(),
  };
};

export const sortNewestFirst = (notes: Note[]) =>
  [...notes].sort((a, b) => b.date.localeCompare(a.date));
