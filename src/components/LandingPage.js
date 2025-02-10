import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typewriter } from 'react-simple-typewriter';
import videoSrc from '../assets/videos/intro.mp4';
import '../styles/landingPage.scss';

const LandingPage = () => {
  const [showMessage, setShowMessage] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  const words = ['', 'Hi', 'My name is Victoria', 'Welcome to my website'];

  useEffect(() => {
    if (videoLoaded) {
      const hideMessageTimer = setTimeout(() => setShowMessage(false), 9500);
      const fadeOutTimer = setTimeout(() => setFadeOut(true), 10000); 
      const redirectTimer = setTimeout(() => navigate('/home'), 15000); 

      return () => {
        clearTimeout(hideMessageTimer);
        clearTimeout(fadeOutTimer);
        clearTimeout(redirectTimer);
      };
    }
  }, [videoLoaded, navigate]);

  return (
    <div className={`landing-page ${fadeOut ? 'fade-out' : ''}`}>
      <video
        autoPlay
        loop
        muted
        className="background-video"
        onLoadedData={() => setVideoLoaded(true)}
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {videoLoaded && showMessage && (
        <div className="message-container">
          <h1>
            <Typewriter
              words={words}
              loop={false}
              typeSpeed={80}
              deleteSpeed={30}
              delaySpeed={1500}
            />
          </h1>
        </div>
      )}
    </div>
  );
};

export default LandingPage;