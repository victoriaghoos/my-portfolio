import React, { memo, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Cloud, Stars, Sparkles, Float } from "@react-three/drei";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, ArrowUpCircle } from "lucide-react";
import "../../styles/sections/SocialsSection.scss";

// Component voor een enkel wolk-cluster
const CloudPuff = ({ position, speed, opacity, scale }) => {
  return (
    <Cloud
      position={position}
      opacity={opacity}
      speed={speed} 
      width={12}    // Iets breder gemaakt voor betere dekking
      depth={1.5}   
      segments={20} 
      texture="/clouds/cloud.png" 
      color="#ffedd5" 
    />
  );
};

const SilkSkyScene = memo(() => {
  // We genereren random posities voor het "tapijt" aan wolken
  const cloudPositions = useMemo(() => {
    const pos = [];
    const cloudCount = 50; // VERHOOGD: Van 25 naar 50 voor een dicht tapijt

    for (let i = 0; i < cloudCount; i++) {
      // We berekenen een 'bias' om te zorgen dat er ook echt wolken aan de zijkanten zijn
      // (Math.random() - 0.5) * 90 zorgt voor een spreiding van -45 tot +45
      const xPos = (Math.random() - 0.5) * 90; 
      
      // We maken ze iets hoger aan de zijkanten (kom-effect)
      // Als x ver van 0 is, mag y iets hoger zijn
      const distanceFromCenter = Math.abs(xPos);
      const yBase = -5;
      const yVariation = Math.random() * 3;
      const yPos = yBase + (distanceFromCenter * 0.05) + yVariation;

      pos.push({
        x: xPos, 
        y: yPos,     
        z: (Math.random() - 0.5) * 20, // Meer diepte variatie
        scale: 1.2 + Math.random(),    // Iets grotere wolken
        speed: 0.1 + Math.random() * 0.1,
        opacity: 0.5 + Math.random() * 0.5
      });
    }
    return pos;
  }, []);

  return (
    <>
      <ambientLight intensity={1.1} color="#d8b4fe" /> 
      <pointLight position={[0, -10, -20]} intensity={2.0} color="#fb923c" distance={60} />
      <directionalLight position={[0, 5, 5]} intensity={0.8} color="#f472b6" />

      <Stars radius={100} depth={50} count={1500} factor={4} saturation={0} fade speed={1} />

      <Sparkles 
        count={80} 
        scale={[40, 10, 10]} // Sparkles ook breder gemaakt
        size={3} 
        speed={0.4} 
        opacity={0.6}
        color="#fff"
        position={[0, -2, 0]}
      />

      {/* DE WOLKEN GROEP */}
      {/* Group iets omhoog gehaald (van -5 naar -4) zodat ze beter zichtbaar zijn */}
      <group position={[0, -4.7, -10]}>
        <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
          {cloudPositions.map((cloud, i) => (
            <group key={i} scale={cloud.scale}>
               <CloudPuff 
                  position={[cloud.x, cloud.y, cloud.z]} 
                  speed={cloud.speed}
                  opacity={cloud.opacity}
               />
            </group>
          ))}
        </Float>
      </group>

      <fog attach="fog" args={['#ffedd5', 5, 50]} />
    </>
  );
});

const SocialCard = ({ icon: Icon, title, handle, link, delay }) => {
  return (
    <motion.a 
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="social-card"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: delay, ease: "easeOut" }}
      whileHover={{ y: -10, scale: 1.02 }}
    >
      <div className="card-glow"></div>
      <div className="icon-wrapper">
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <div className="card-content">
        <h3>{title}</h3>
        <span className="handle">{handle}</span>
      </div>
      <div className="card-shine"></div>
    </motion.a>
  );
};

const SocialsSection = ({ id }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id={id} className="socials-section">
      <div className="transition-gradient-top"></div>
      
      <div className="canvas-container">
        <Canvas 
          camera={{ position: [0, 0, 14], fov: 45 }}
          resize={{ scroll: false }}
          dpr={[1, 2]} 
        >
          <SilkSkyScene />
        </Canvas>
      </div>

      <div className="content-overlay">
        <motion.div 
          className="header-container"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h2 className="section-title">Establish Connection</h2>
          <p className="section-subtitle">A new horizon awaits.</p>
        </motion.div>

        <div className="cards-grid">
          <SocialCard 
            icon={Linkedin} 
            title="LinkedIn" 
            handle="Let's Connect" 
            link="https://linkedin.com/in/jouwnaam"
            delay={0.2}
          />
          <SocialCard 
            icon={Github} 
            title="GitHub" 
            handle="View Projects" 
            link="https://github.com/jouwnaam"
            delay={0.4}
          />
          <SocialCard 
            icon={Mail} 
            title="Email" 
            handle="Contact Me" 
            link="mailto:victoria@example.com"
            delay={0.6}
          />
        </div>

        <motion.div 
          className="footer-action"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <button onClick={scrollToTop} className="return-orb">
            <ArrowUpCircle size={24} />
            <span>Return to Orbit</span>
          </button>
          <p className="copyright">© 2026 Victoria Portfolio.</p>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialsSection;