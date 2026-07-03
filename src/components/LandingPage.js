import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Typewriter } from "react-simple-typewriter";
import videoSrc from "../assets/videos/intro.webm"; 
import posterSrc from "../assets/images/intro.png"; 
import "../styles/landingPage.scss";

const SKIP_BUTTON_DELAY_MS = 1500;
const AUTO_EXIT_DELAY_MS = 8500;
const TYPEWRITER_WORDS = ["Hi", "My name is Victoria", "Welcome to my world"];

const LandingPage = () => {
  const [transitionActive, setTransitionActive] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const navigate = useNavigate();
  const skipButtonTimerRef = useRef(null);
  const autoExitTimerRef = useRef(null);
  const hasNavigatedRef = useRef(false);
  // Keep a synchronous guard separate from render state so the exit callback can stay stable and avoid rescheduling the effect while still reflecting whether the transition has already begun.
  const transitionActiveRef = useRef(false);
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
  }, []);

  const handleVideoError = useCallback(() => {
    console.error("LandingPage background video failed to load; poster fallback will remain visible.");
  }, []);

  const startExitAndNavigate = useCallback(() => {
    if (hasNavigatedRef.current || transitionActiveRef.current) {
      return;
    }

    transitionActiveRef.current = true;
    clearTimeout(autoExitTimerRef.current);
    setTransitionActive(true);
  }, []);

  const handleTransitionComplete = useCallback(() => {
    if (hasNavigatedRef.current) {
      return;
    }

    hasNavigatedRef.current = true;
    navigate("/home", { replace: true, state: { transitioning: true } });
  }, [navigate]);

  useEffect(() => {
    skipButtonTimerRef.current = setTimeout(
      () => setShowSkipButton(true),
      SKIP_BUTTON_DELAY_MS,
    );

    autoExitTimerRef.current = setTimeout(startExitAndNavigate, AUTO_EXIT_DELAY_MS);

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
        aria-hidden="true"
        onError={handleVideoError}
      >
        <source src={videoSrc} type="video/webm" />
      </video>

      <div className="gradient-overlay" />

      <div className="particles" aria-hidden="true">
        {particles.map((particle) => (
          <div key={particle.id} className="particle" style={{
            "--delay": particle.delay,
            "--size": particle.size,
            "--x": particle.x,
            "--y": particle.y,
          }} />
        ))}
      </div>

      {!transitionActive && (
        <button 
          className={`skip-intro-button ${showSkipButton ? "is-visible" : "is-hidden"}`}
          onClick={startExitAndNavigate}
          aria-label="Skip Intro" 
        >
          Skip Intro
        </button>
      )}

      <div className="message-container">
        <h1>
          <span className="typewriter-text">
            <Typewriter
              words={TYPEWRITER_WORDS}
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

      {transitionActive && (
        <div
          className="transition-overlay"
          onAnimationEnd={handleTransitionComplete}
        />
      )}
    </div>
  );
};

export default LandingPage;