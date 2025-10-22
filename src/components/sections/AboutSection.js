import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import '../../styles/sections/AboutSection.scss';
import foto1 from '../../assets/images/foto1.jpg';

const AboutSection = ({ id }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const textVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <section id={id} ref={sectionRef} className="about-section">
      <div className="cosmic-background">
        <div className="floating-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
        <div className="star-field"></div>
      </div>

      <div className="section-content">
        <motion.div 
          className="about-container"
          variants={staggerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          <motion.div className="section-header" variants={textVariants}>
            <h2 className="section-title">
              <span className="title-glow">About Me</span>
            </h2>
            <div className="title-underline"></div>
          </motion.div>

          <div className="about-grid">
            <motion.div className="avatar-container" variants={textVariants}>
              <div className="hologram-avatar">
                <div className="avatar-glitch"></div>
                <div className="avatar-glow"></div>
                <img 
                  src={foto1} 
                  alt="Profile" 
                  className="avatar-image"
                />
              </div>
              <div className="avatar-orbits">
                <div className="orbit-ring ring-1"></div>
                <div className="orbit-ring ring-2"></div>
                <div className="orbit-ring ring-3"></div>
              </div>
            </motion.div>

            <motion.div className="bio-container" variants={textVariants}>
              <div className="bio-content">
  <h3 className="bio-greeting">
    Hello, I'm <span className="name-glow">Victoria</span> 👋
  </h3>
  
  <div className="bio-text">
    <p>
      I'm a <span className="highlight">Belgian software engineering student</span> with a passion that grew from hobbyist Python coding into a professional career path. What started as solving LeetCode problems for fun led me to pursue an associate's degree at Howest, where I graduated <span className="highlight">with high honors</span>.
    </p>
    
    <p>
      Currently further expanding my skills with a Bachelor of Applied Computer Science specializing in software engineering, I'm balancing academic projects with personal ventures like building this website. When I'm not coding, you'll find me <span className="highlight">learning Japanese N4</span>, hiking the Belgian countryside, or capturing moments through photography.
    </p>

    <p>
      I'm actively working toward my goal of a <span className="highlight">Tokyo internship in 2027</span>, with plans to relocate permanently to Saitama after graduation. I believe in blending technical precision with creative expression, whether I'm debugging code or composing the perfect picture.
    </p>
  </div>
</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;