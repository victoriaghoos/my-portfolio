import { useEffect, type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import LanguageSelector from '../components/LanguageSelector';
import NotesStars from './NotesStars';
import '../styles/notes.scss';

interface NotesLayoutProps {
  title: string;
  backTo: string;
  backLabel: string;
  children: ReactNode;
}

const NotesLayout = ({ title, backTo, backLabel, children }: NotesLayoutProps) => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = `${title} · Victoria Ghoos`;
    return () => {
      document.title = 'Victoria Ghoos';
    };
  }, [title]);

  return (
    <div className="notes-page" lang={i18n.language}>
      <a className="skip-link" href="#main">
        {t('a11y.skip_to_content')}
      </a>
      <div className="notes-page-bg" aria-hidden="true" />
      <NotesStars count={260} className="notes-page-stars" />

      <header className="notes-topbar">
        <Link to={backTo} className="notes-back">
          <ArrowLeft size={18} strokeWidth={1.8} />
          <span>{backLabel}</span>
        </Link>
      </header>
      <LanguageSelector />

      <main id="main" tabIndex={-1} className="notes-main">
        {children}
      </main>

      <footer className="notes-footer">© 2026 Victoria Ghoos</footer>
    </div>
  );
};

export default NotesLayout;
