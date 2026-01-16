import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Typewriter } from "react-simple-typewriter";
import videoSrc from "../assets/videos/intro.mp4";
import posterSrc from "../assets/images/intro.png"; 
import "../styles/landingPage.scss";

const LandingPage = () => {
  const [transitionActive, setTransitionActive] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const navigate = useNavigate();
  const typewriterCompleted = useRef(false);

  useEffect(() => {
    const skipButtonTimer = setTimeout(() => setShowSkipButton(true), 1500);
    const transitionTimer = setTimeout(() => setTransitionActive(true), 8500);
    const redirectTimer = setTimeout(() => {
      navigate("/home", { replace: true, state: { transitioning: true } });
    }, 9000);

    return () => {
      clearTimeout(skipButtonTimer);
      clearTimeout(transitionTimer);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

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
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="particle" style={{
            "--delay": `${i * 0.2}s`,
            "--size": `${Math.random() * 4 + 2}px`,
            "--x": `${Math.random() * 100}%`,
            "--y": `${Math.random() * 100}%`,
          }} />
        ))}
      </div>

      {showSkipButton && !transitionActive && (
        <button className="skip-intro-button" onClick={() => setTransitionActive(true)}>
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
              onLoopDone={() => (typewriterCompleted.current = true)}
            />
          </span>
        </h1>
      </div>

      {transitionActive && <div className="transition-overlay" />}
    </div>
  );
};

export default LandingPage;