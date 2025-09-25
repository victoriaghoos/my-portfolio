import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typewriter } from 'react-simple-typewriter';
import videoSrc from '../assets/videos/intro.mp4';
import '../styles/landingPage.scss';

const LandingPage = () => {
  const [showMessage] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [transitionActive, setTransitionActive] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef();
  const typewriterCompleted = useRef(false);
  const transitionTimeoutRef = useRef(null);
  const redirectTimeoutRef = useRef(null);
  const words = ['Hi', 'My name is Victoria', 'Welcome to my website'];

  const skipIntro = () => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }
    
    setTransitionActive(true);
    
    setTimeout(() => {
      navigate('/home', { 
        replace: true,
        state: { transitioning: true } 
      });
    }, 700);
  };

  useEffect(() => {
    if (videoLoaded && !typewriterCompleted.current) {
      const skipButtonTimer = setTimeout(() => {
        setShowSkipButton(true);
      }, 1500);

      transitionTimeoutRef.current = setTimeout(() => {
        setTransitionActive(true);
      }, 8500); 
      
      redirectTimeoutRef.current = setTimeout(() => {
        navigate('/home', { 
          replace: true,
          state: { transitioning: true } 
        });
      }, 9000); 

      return () => {
        clearTimeout(skipButtonTimer);
        clearTimeout(transitionTimeoutRef.current);
        clearTimeout(redirectTimeoutRef.current);
      };
    }
  }, [videoLoaded, navigate]);

  return (
    <div className={`landing-page ${transitionActive ? 'page-exit' : ''}`}>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        className="background-video"
        onLoadedData={() => setVideoLoaded(true)}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      <div className="gradient-overlay" />

      <div className="particles">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              '--delay': `${i * 0.2}s`,
              '--size': `${Math.random() * 4 + 2}px`,
              '--x': `${Math.random() * 100}%`,
              '--y': `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {showSkipButton && !transitionActive && (
        <button 
          className="skip-intro-button"
          onClick={skipIntro}
          aria-label="Skip introduction"
        >
          Skip Intro
        </button>
      )}

      {videoLoaded && showMessage && !typewriterCompleted.current && (
        <div className="message-container">
          <div className="message-backdrop" />
          <h1>
            <Typewriter
              words={words}
              loop={1}
              typeSpeed={80}
              deleteSpeed={30}
              delaySpeed={1500}
              cursor
              cursorStyle="|"
              onLoopDone={() => typewriterCompleted.current = true}
            />
          </h1>
        </div>
      )}

      {transitionActive && <div className="transition-overlay" />}
    </div>
  );
};

export default LandingPage;