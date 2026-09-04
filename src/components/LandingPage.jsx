import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Typewriter } from "react-simple-typewriter";
import videoWebm from "../assets/videos/intro.webm";
import videoMp4 from "../assets/videos/intro.mp4";
import posterSrc from "../assets/images/intro.png"; 
import "../styles/landingPage.scss";

const SKIP_BUTTON_DELAY_MS = 500;
// Safety net only. The typewriter's onLoopDone is the primary exit trigger.
const AUTO_EXIT_FALLBACK_MS = 12000;
const REDUCED_MOTION_EXIT_MS = 2500;
// Keep this in sync with `lp-overlayReveal` duration in landingPage.scss.
const TRANSITION_DURATION_MS = 1500;
const TRANSITION_FAILSAFE_MS = TRANSITION_DURATION_MS + 500;
const REDUCED_MOTION_FAILSAFE_MS = 300;
const INTRO_SEEN_KEY = "intro-seen";
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const TYPEWRITER_WORDS = ["Hi", "My name is Victoria", "Welcome to my world"];
const HEADING_LABEL = `${TYPEWRITER_WORDS.join(". ")}.`;

const LandingPage = () => {
  const [transitionActive, setTransitionActive] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [reducedMotion] = useState(prefersReducedMotion);
  const [cursorIdle, setCursorIdle] = useState(false);
  const navigate = useNavigate();
  const skipButtonTimerRef = useRef(null);
  const autoExitTimerRef = useRef(null);
  const idleTimerRef = useRef(null);
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
    clearTimeout(idleTimerRef.current);
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

  const handleType = useCallback(() => {
    setCursorIdle(false);
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => setCursorIdle(true), 400);
  }, []);

  const handleTransitionComplete = useCallback((event) => {
    if (event && event.target !== event.currentTarget) {
      return;
    }

    if (hasNavigatedRef.current) {
      return;
    }

    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch {
      // ignore
    }

    hasNavigatedRef.current = true;
    navigate("/home", { replace: true });
  }, [navigate]);

  const completeRef = useRef(handleTransitionComplete);

  useEffect(() => {
    completeRef.current = handleTransitionComplete;
  }, [handleTransitionComplete]);

  useEffect(() => {
    if (!transitionActive) {
      return undefined;
    }

    const delay = reducedMotion
      ? REDUCED_MOTION_FAILSAFE_MS
      : TRANSITION_FAILSAFE_MS;

    const failsafeTimer = setTimeout(() => completeRef.current(), delay);

    return () => {
      clearTimeout(failsafeTimer);
    };
  }, [transitionActive, reducedMotion]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        startExitAndNavigate();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [startExitAndNavigate]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(INTRO_SEEN_KEY)) {
        hasNavigatedRef.current = true;
        navigate("/home", { replace: true });
        return undefined;
      }
    } catch {
      // sessionStorage can throw in privacy mode
    }

    skipButtonTimerRef.current = setTimeout(
      () => setShowSkipButton(true),
      SKIP_BUTTON_DELAY_MS,
    );

    autoExitTimerRef.current = setTimeout(
      startExitAndNavigate,
      reducedMotion ? REDUCED_MOTION_EXIT_MS : AUTO_EXIT_FALLBACK_MS,
    );

    return () => {
      clearTimers();
    };
  }, [clearTimers, reducedMotion, startExitAndNavigate, navigate]);

  return (
    <div className={`landing-page ${transitionActive ? "page-exit" : ""}`}>
      {reducedMotion ? (
        <img
          src={posterSrc}
          alt=""
          aria-hidden="true"
          className="background-media"
        />
      ) : (
        <video
          poster={posterSrc}
          autoPlay loop muted playsInline
          className="background-media"
          aria-hidden="true"
          onError={handleVideoError}
        >
          <source src={videoWebm} type="video/webm" />
          <source src={videoMp4} type="video/mp4" />
        </video>
      )}

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

      <button
        className={`skip-intro-button ${showSkipButton ? "is-visible" : ""}`}
        onClick={startExitAndNavigate}
        disabled={transitionActive}
        title="Skip intro (Esc)"
      >
        Skip Intro
      </button>

      <div className="message-container">
        <h1 aria-label={HEADING_LABEL}>
          {reducedMotion ? (
            <span className="typewriter-text" aria-hidden="true">
              Welcome to my world
            </span>
          ) : (
            <>
              <span className="typewriter-text" aria-hidden="true">
                <Typewriter
                  words={TYPEWRITER_WORDS}
                  loop={1}
                  typeSpeed={80}
                  deleteSpeed={30}
                  delaySpeed={1500}
                  cursor={false}
                  onType={handleType}
                  onDelete={handleType}
                  onLoopDone={startExitAndNavigate}
                />
              </span>
              <span className={`typewriter-cursor ${cursorIdle ? "is-blinking" : ""}`} aria-hidden="true">
                |
              </span>
            </>
          )}
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