import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typewriter } from 'react-simple-typewriter';
import videoSrc from '../assets/videos/intro.mp4';
import '../styles/landingPage.scss';

const LandingPage = () => {
  const [showMessage, setShowMessage] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [transitionActive, setTransitionActive] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef();
  const typewriterCompleted = useRef(false);

  const words = ['Hi', 'My name is Victoria', 'Welcome to my website'];

  useEffect(() => {
    if (videoLoaded && !typewriterCompleted.current) {
      const totalAnimationTime = 9000;
      
      const transitionTimer = setTimeout(() => {
        setTransitionActive(true);
      }, totalAnimationTime - 500);
      
      const redirectTimer = setTimeout(() => {
        navigate('/home', { 
          replace: true,
          state: { transitioning: true } 
        });
      }, totalAnimationTime);

      return () => {
        clearTimeout(transitionTimer);
        clearTimeout(redirectTimer);
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

      {videoLoaded && showMessage && !typewriterCompleted.current && (
        <div className="message-container">
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
    </div>
  );
};

export default LandingPage;