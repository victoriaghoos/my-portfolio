import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "../styles/home.scss";
import avatarGif from "../assets/images/avatar.gif";
import avatarPng from "../assets/images/avatar.png";
import skillGif from "../assets/images/think.gif";
import skillPng from "../assets/images/think.png";
import codeGif from "../assets/images/web-developer.gif";
import codePng from "../assets/images/web-developer.png";
import resumeGif from "../assets/images/resume.gif";
import resumePng from "../assets/images/resume.png";
import socialsGif from "../assets/images/social-media.gif";
import socialsPng from "../assets/images/social-media.png";
import circularImage from "../assets/images/me.png";

const icons = [
  { png: socialsPng, gif: socialsGif },
  { png: resumePng, gif: resumeGif },
  { png: codePng, gif: codeGif },
  { png: avatarPng, gif: avatarGif },
  { png: skillPng, gif: skillGif },
];

const Home = () => {
  const [animationPhase, setAnimationPhase] = useState("entering");
  const [centerImageSize, setCenterImageSize] = useState(0);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const circleSize = (5 * window.innerWidth) / 100;
  useEffect(() => {
    const size = Math.min(window.innerWidth * 0.25, 400);
    setCenterImageSize(size);

    if (animationPhase === "entering") {
      const timer = setTimeout(() => {
        setAnimationPhase("transitioning");
      }, 2500);
      return () => clearTimeout(timer);
    }

    if (animationPhase === "transitioning") {
      let startTime = null;
      const transitionDuration = 2000; 

      const animateTransition = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / transitionDuration, 1);
        setTransitionProgress(progress);

        if (progress >= 1) {
          setAnimationPhase("firstCircleComplete");
        } else {
          requestAnimationFrame(animateTransition);
        }
      };

      requestAnimationFrame(animateTransition);
    }
  }, [animationPhase]);

  const minRadius = centerImageSize / 2 + circleSize / 2 + 20; 
  const radius = Math.max(window.innerWidth * 0.26, minRadius);
  const entryEndX = -(centerImageSize / 2 + 100);

  const getCirclePosition = (index) => {
    if (animationPhase === "entering") {
      const targetX = -index * 100 + entryEndX;
      return { x: targetX, y: -40 };
    }
  
    if (animationPhase === "transitioning") {
      if (index === 0) {
        const startAngle = 180;
        const rotationAmount = 315;
        
        const easedProgress = 1 - Math.pow(1 - transitionProgress, 3);
        const currentAngle = startAngle - (rotationAmount * easedProgress);
        const radians = (currentAngle * Math.PI) / 180;
        return {
          x: Math.cos(radians) * radius,
          y: Math.sin(radians) * radius
        };
      }
      
      return {
        x: -index * 100 + entryEndX,
        y: -40
      };
    }
  
    if (animationPhase === "firstCircleComplete") {
      if (index === 0) {
        const finalAngle = -135;
        const radians = (finalAngle * Math.PI) / 180;
        return {
          x: Math.cos(radians) * radius,
          y: Math.sin(radians) * radius
        };
      }
      
      return {
        x: -index * 100 + entryEndX,
        y: -40
      };
    }
  };

  return (
    <section className="home">
      <div className="circular-image-container">
        <img
          src={circularImage}
          alt="Circular"
          className="circular-image"
          style={{
            width: `${centerImageSize}px`,
            height: `${centerImageSize}px`,
          }}
        />
      </div>

      {icons.map((icon, index) => {
        const position = getCirclePosition(index);

        return (
          <motion.div
            key={`circle-${index}`}
            className="circle"
            initial={{
              x: -window.innerWidth - (icons.length - 1 - index) * 100,
              y: 0,
            }}
            animate={{
              x: position?.x || 0,
              y: position?.y || 0,
              transition: {
                duration: animationPhase === "entering" ? 1.5 : 0.5,
                ease: animationPhase === "transitioning" ? [0.17, 0.67, 0.83, 0.67] : "linear",
                delay: animationPhase === "entering" ? index * 0.1 : 0,
              },
            }}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              zIndex: 10 - index,
            }}
          >
            <img
              src={icon.png}
              alt={`icon-${index}`}
              onMouseEnter={(e) => (e.currentTarget.src = icon.gif)}
              onMouseLeave={(e) => (e.currentTarget.src = icon.png)}
            />
          </motion.div>
        );
      })}
    </section>
  );
};

export default Home;