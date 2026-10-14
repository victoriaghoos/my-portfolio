import { useMemo } from 'react';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import NotesLayout from './NotesLayout';
import { formatNoteDate, getNote } from './notes';

const NotePage = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const note = getNote(slug, i18n.language);

  // Notes are my own Markdown files bundled at build time, so rendering their HTML is safe.
  const html = useMemo(
    () => (note ? (marked.parse(note.body, { async: false }) as string) : ''),
    [note],
  );

  if (!note) {
    return (
      <NotesLayout title={t('notes.title')} backTo="/notes" backLabel={t('notes.back_to_notes')}>
        <div className="notes-not-found">
          <p>{t('notes.not_found')}</p>
          <Link to="/notes" className="notes-about-link">
            {t('notes.back_to_notes')}
          </Link>
        </div>
      </NotesLayout>
    );
  }

  return (
    <NotesLayout title={note.title} backTo="/notes" backLabel={t('notes.back_to_notes')}>
      <article className="note-article" lang={note.lang}>
        <header className="note-article-header">
          <div className="note-meta">
            <span className={`note-type type-${note.type}`}>{t(`notes.types.${note.type}`)}</span>
            {note.draft && <span className="note-draft">{t('notes.draft')}</span>}
            <time dateTime={note.date}>{formatNoteDate(note.date, i18n.language)}</time>
            {note.location && <span>· {note.location}</span>}
          </div>
          <h1 className="notes-page-title">{note.title}</h1>
          <div className="notes-underline" />
        </header>

        {note.cover && <img className="note-cover" src={note.cover} alt="" />}

        <div className="note-prose" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </NotesLayout>
  );
};

export default NotePage;
