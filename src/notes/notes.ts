import { parseNote, sortNewestFirst, type Note } from './parseNote';

// Every .md file in ./posts is a note; the file name (without .md) becomes its URL slug.
const files = import.meta.glob('./posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const allNotes = Object.entries(files).map(([path, raw]) =>
  parseNote(path.replace(/^.*\/(.*)\.md$/, '$1'), raw),
);

// Drafts are visible while running `npm run dev`, but never end up in the production build.
export const notes: Note[] = sortNewestFirst(
  allNotes.filter((note) => import.meta.env.DEV || !note.draft),
);

export const getNote = (slug: string | undefined) => notes.find((note) => note.slug === slug);

const DATE_OPTIONS: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };

export const formatNoteDate = (date: string, language: string) => {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  try {
    return new Intl.DateTimeFormat(language, DATE_OPTIONS).format(parsed);
  } catch {
    // the language detector can hand us tags Intl rejects (e.g. "en-US@posix")
    return new Intl.DateTimeFormat('en', DATE_OPTIONS).format(parsed);
  }
};

export type { Note };
