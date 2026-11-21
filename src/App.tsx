import './App.css';
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';

// The intro is switched off for now (see INTRO_DISABLED_UNTIL), so it shouldn't weigh down the
// first download for everyone: it's lazy-loaded like the other pages
const LandingPage = lazy(() => import('./components/LandingPage'));
const Home = lazy(() => import('./components/Home'));
const NotesIndexPage = lazy(() => import('./notes/NotesIndexPage'));
const NotePage = lazy(() => import('./notes/NotePage'));

const routeFallback = <div className="section-placeholder" aria-hidden="true" />;

// The intro animation is switched off while I'm applying for jobs, so visitors land straight on
// the portfolio. It comes back automatically from this date on (or set it to '' to bring it back now).
const INTRO_DISABLED_UNTIL = '2027-07-01';
const showIntro = () =>
  !INTRO_DISABLED_UNTIL || Date.now() >= new Date(`${INTRO_DISABLED_UNTIL}T00:00:00`).getTime();

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              showIntro() ? (
                <Suspense fallback={routeFallback}>
                  <LandingPage />
                </Suspense>
              ) : (
                <Navigate to="/home" replace />
              )
            }
          />
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
