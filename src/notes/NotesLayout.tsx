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
  const { i18n } = useTranslation();

  useEffect(() => {
    document.title = `${title} · Victoria Ghoos`;
    return () => {
      document.title = 'Victoria Ghoos';
    };
  }, [title]);

  return (
    <div className="notes-page" lang={i18n.language}>
      <div className="notes-page-bg" aria-hidden="true" />
      <NotesStars count={260} className="notes-page-stars" />

      <header className="notes-topbar">
        <Link to={backTo} className="notes-back">
          <ArrowLeft size={18} strokeWidth={1.8} />
          <span>{backLabel}</span>
        </Link>
      </header>
      <LanguageSelector />

      <main className="notes-main">{children}</main>

      <footer className="notes-footer">© 2026 Victoria Ghoos</footer>
    </div>
  );
};

export default NotesLayout;
