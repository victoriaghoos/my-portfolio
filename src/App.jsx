import './App.css';
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';

const Home = lazy(() => import('./components/Home'));

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/home"
            element={
              <Suspense fallback={<div className="section-placeholder" aria-hidden="true" />}>
                <Home />
              </Suspense>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
