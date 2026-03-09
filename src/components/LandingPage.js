import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Typewriter } from "react-simple-typewriter";
import videoSrc from "../assets/videos/intro.webm"; 
import posterSrc from "../assets/images/intro.png"; 
import "../styles/landingPage.scss";

const SKIP_BUTTON_DELAY_MS = 1500;
const AUTO_EXIT_DELAY_MS = 8500;
const EXIT_TO_NAVIGATION_DELAY_MS = 500;

const LandingPage = () => {
  const [transitionActive, setTransitionActive] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const navigate = useNavigate();
  const skipButtonTimerRef = useRef(null);
  const autoExitTimerRef = useRef(null);
  const navigationTimerRef = useRef(null);
  const hasNavigatedRef = useRef(false);
  const particles = useMemo(
    () => Array.from({ length: 15 }, (_, index) => ({
      id: index,
      delay: `${index * 0.2}s`,
      size: `${Math.random() * 4 + 2}px`,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
    })),
    [],
  );

  const clearTimers = useCallback(() => {
    clearTimeout(skipButtonTimerRef.current);
    clearTimeout(autoExitTimerRef.current);
    clearTimeout(navigationTimerRef.current);
  }, []);

  const startExitAndNavigate = useCallback(() => {
    if (hasNavigatedRef.current) {
      return;
    }

    clearTimeout(autoExitTimerRef.current);
    clearTimeout(navigationTimerRef.current);
    setTransitionActive(true);

    navigationTimerRef.current = setTimeout(() => {
      if (hasNavigatedRef.current) {
        return;
      }

      hasNavigatedRef.current = true;
      navigate("/home", { replace: true, state: { transitioning: true } });
    }, EXIT_TO_NAVIGATION_DELAY_MS);
  }, [navigate]);

  useEffect(() => {
    skipButtonTimerRef.current = setTimeout(
      () => setShowSkipButton(true),
      SKIP_BUTTON_DELAY_MS,
    );

    autoExitTimerRef.current = setTimeout(() => {
      startExitAndNavigate();
    }, AUTO_EXIT_DELAY_MS);

    return () => {
      clearTimers();
    };
  }, [clearTimers, startExitAndNavigate]);

  return (
    <div className={`landing-page ${transitionActive ? "page-exit" : ""}`}>
      <video
        poster={posterSrc}
        autoPlay loop muted playsInline
        className="background-video"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      <div className="gradient-overlay" />

      <div className="particles">
        {particles.map((particle) => (
          <div key={particle.id} className="particle" style={{
            "--delay": particle.delay,
            "--size": particle.size,
            "--x": particle.x,
            "--y": particle.y,
          }} />
        ))}
      </div>

      {showSkipButton && !transitionActive && (
        <button 
          className="skip-intro-button" 
          onClick={startExitAndNavigate}
          style={{ pointerEvents: showSkipButton ? 'auto' : 'none', opacity: showSkipButton ? 1 : 0 }}
          aria-label="Skip Intro" 
        >
          Skip Intro
        </button>
      )}

      <div className="message-container">
        <h1>
          <span className="typewriter-text">
            <Typewriter
              words={["Hi", "My name is Victoria", "Welcome to my world"]}
              loop={1}
              typeSpeed={80}
              deleteSpeed={30}
              delaySpeed={1500}
              cursor
              cursorStyle="|"
            />
          </span>
        </h1>
      </div>

      {transitionActive && <div className="transition-overlay" />}
    </div>
  );
};

export default LandingPage;