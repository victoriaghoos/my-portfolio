import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
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
  const containerControls = useAnimation();

  useEffect(() => {
    const size = Math.min(window.innerWidth * 0.25, 400);
    setCenterImageSize(size);

    if (animationPhase === "entering") {
      const timer = setTimeout(() => {
        setAnimationPhase("forming");
        // Start container rotation when forming begins
        containerControls.start({
          rotate: -360,
          transition: {
            duration: 2, // rotation time
            ease: "easeInOut"
          }
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [animationPhase, containerControls]);

  const getInitialPosition = (index) => {
    return {
      x: -window.innerWidth - (icons.length - 1 - index) * 100,
      y: 0,
    };
  };

  const getChainPosition = (index) => {
    const shiftLeft = centerImageSize / 2 + 80;
    return {
      x: -index * 100 - shiftLeft,
      y: 0,
    };
  };

  const getCircleLayoutPosition = (index) => {
    const angle = (index / icons.length) * Math.PI * 2 - Math.PI / 2;
    const distanceFromCenter = centerImageSize / 2 + 120 + 40;
    return {
      x: Math.cos(angle) * distanceFromCenter,
      y: Math.sin(angle) * distanceFromCenter,
    };
  };

  return (
    <section className="home">
      <div className="circular-image-container">
        <img src={circularImage} alt="Circular" className="circular-image" />
      </div>

      <motion.div
        className="circle-container"
        animate={containerControls}
        style={{ position: "absolute" }}
      >
        {icons.map((icon, index) => {
          let position;
          if (animationPhase === "entering") {
            position = getChainPosition(index);
          } else {
            position = getCircleLayoutPosition(index);
          }

          return (
            <motion.div
              key={index}
              className="circle"
              initial={getInitialPosition(index)}
              animate={{
                x: position.x,
                y: position.y,
                transition: {
                  duration: 1.5,
                  ease: "easeOut",
                  delay: animationPhase === "forming" ? index * 0.1 : 0,
                },
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
      </motion.div>
    </section>
  );
};

export default Home;