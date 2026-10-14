import './App.css';
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';

const Home = lazy(() => import('./components/Home'));
const NotesIndexPage = lazy(() => import('./notes/NotesIndexPage'));
const NotePage = lazy(() => import('./notes/NotePage'));

const routeFallback = <div className="section-placeholder" aria-hidden="true" />;

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/home"
            element={
              <Suspense fallback={routeFallback}>
                <Home />
              </Suspense>
            }
          />
          <Route
            path="/notes"
            element={
              <Suspense fallback={routeFallback}>
                <NotesIndexPage />
              </Suspense>
            }
          />
          <Route
            path="/notes/:slug"
            element={
              <Suspense fallback={routeFallback}>
                <NotePage />
              </Suspense>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
