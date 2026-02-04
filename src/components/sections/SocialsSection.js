import React, { memo, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Cloud, Stars, Sparkles, Float } from "@react-three/drei";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, ArrowUpCircle } from "lucide-react";
import { useTranslation } from 'react-i18next';
import "../../styles/sections/SocialsSection.scss";

const CLOUD_URL = "https://raw.githubusercontent.com/pmndrs/drei-assets/456060a26bbeb8fdf9d32ff4dd80fa95863c129e/cloud.png";

const CloudPuff = ({ position, speed, opacity }) => {
  return (
    <Cloud
      position={position}
      opacity={opacity}
      speed={speed}
      width={10}
      depth={1.5}
      segments={40}
      texture={CLOUD_URL}
      color="#fff0f5"
      bounds={[6, 2, 2]}
      volume={10}
    />
  );
};

const SilkSkyScene = memo(() => {
  const cloudPositions = useMemo(() => {
    const pos = [];
    const cloudCount = 40;
    for (let i = 0; i < cloudCount; i++) {
      const xPos = (Math.random() - 0.5) * 90;
      const distanceFromCenter = Math.abs(xPos);
      const yBase = -5;
      const yVariation = Math.random() * 3;
      const yPos = yBase + distanceFromCenter * 0.05 + yVariation;

      pos.push({
        x: xPos,
        y: yPos,
        z: (Math.random() - 0.5) * 20,
        scale: 1.3 + Math.random(),
        speed: 0.1 + Math.random() * 0.1,
        opacity: 0.6 + Math.random() * 0.4,
      });
    }
    return pos;
  }, []);

  return (
    <>
      <ambientLight intensity={1.1} color="#d8b4fe" />
      <pointLight position={[0, -10, -20]} intensity={2.0} color="#fb923c" distance={60} />
      <directionalLight position={[0, 5, 5]} intensity={1.0} color="#f472b6" />
      <Stars radius={100} depth={50} count={1500} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={80} scale={[40, 10, 10]} size={3} speed={0.4} opacity={0.6} color="#fff" position={[0, -2, 0]} />
      <group position={[0, -10, -10]}>
        <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
          {cloudPositions.map((cloud, i) => (
            <group key={i} scale={cloud.scale}>
              <CloudPuff position={[cloud.x, cloud.y, cloud.z]} speed={cloud.speed} opacity={cloud.opacity} />
            </group>
          ))}
        </Float>
      </group>
      <fog attach="fog" args={["#ffedd5", 5, 50]} />
    </>
  );
});

const SocialCard = ({ icon: Icon, title, handle, link, delay, strokeWidth = 1.5 }) => {
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
        <Icon size={32} strokeWidth={strokeWidth} />
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
  const flyToCosmos = () => {
  const home = document.getElementById("home-3d");
  if (home) {
    window.scrollTo({ top: window.scrollY, behavior: 'auto' });
    
    setTimeout(() => {
      home.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 10);
  }
};

  const { t } = useTranslation();
  return (
    <section id={id} className="socials-section">
      <div className="transition-gradient-top"></div>
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 0, 14], fov: 45 }} resize={{ scroll: false }} dpr={[1, 2]}>
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
          <h2 className="section-title">{t('contact')}</h2>
          <p className="section-subtitle">{t('socials.subtitle')}</p>
        </motion.div>

        <div className="cards-grid">  
          <SocialCard
            icon={Linkedin}
            title="LinkedIn"
            handle={t('socials.linkedin_handle')}
            link="https://linkedin.com/in/jouwnaam"
            delay={0.2}
            strokeWidth={1.5}
          />
          <SocialCard
            icon={Github}
            title="GitHub"
            handle={t('socials.github_handle')} 
            link="https://github.com/victoriaghoos"
            delay={0.4}
            strokeWidth={1.7} 
          />
          <SocialCard
            icon={Mail}
            title="Email"
            handle={t('socials.email_handle')}
            link="mailto:victoriamarinus@gmail.com"
            delay={0.6}
            strokeWidth={1.2} 
          />
        </div>

        <motion.div
          className="footer-action"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.button 
            onTap={flyToCosmos} 
            className="return-orb"
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUpCircle size={24} strokeWidth={1.5} />
            <span>{t('socials.return_cosmos')}</span>
          </motion.button>
          <p className="copyright">© 2026 Victoria Portfolio.</p>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialsSection;