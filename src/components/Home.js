import { useState, useRef, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { useTranslation } from "react-i18next";
import { Environment } from "@react-three/drei";
import { motion, useInView } from "framer-motion";
import * as THREE from "three";
import "../styles/home.scss";

import MusicPlayer from "./MusicPlayer.js";
import LanguageSelector from "./LanguageSelector.js";

import avatarVideo from "../assets/images/avatar.mp4";
import avatarPng from "../assets/images/avatar.png";
import skillVideo from "../assets/images/think.mp4";
import skillPng from "../assets/images/think.png";
import codeVideo from "../assets/images/web-developer.mp4";
import codePng from "../assets/images/web-developer.png";
import resumeVideo from "../assets/images/resume.mp4";
import resumePng from "../assets/images/resume.png";
import socialsVideo from "../assets/images/social-media.mp4";
import socialsPng from "../assets/images/social-media.png";
import NightSkyBackground from "./NightSkyBackground.js";
import InteractivePanel from "./InteractivePanel.js";
import CentralHologram from "./CentralHologram.js";
import OutlineStars from "./OutlineStars.js";
import SectionsContainer from "./sections/SectionsContainer.js";

import catPoints from "../catPoints.json";
import cameraPoints from "../cameraPoints.json";
import bookPoints from "../bookPoints.json";
import flowerPoints from "../flowerPoints.json";
import headsetPoints from "../headsetPoints.json";

const DragHint = ({ isVisible }) => {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div className={`drag-hint ${!isVisible ? "fade-out" : ""}`}>
      Drag to rotate the cosmos
    </div>
  );
};

const Home = () => {
  const { t } = useTranslation();
  const icons = useMemo(() => [
    {
      id: "Socials", 
      label: t('nav.socials'), 
      png: socialsPng,
      video: socialsVideo,
      color: new THREE.Color(0.4, 0.7, 0.9),
    },
    {
      id: "Resume",
      label: t('nav.resume'),
      png: resumePng,
      video: resumeVideo,
      color: new THREE.Color(0.9, 0.6, 0.4),
    },
    {
      id: "Projects",
      label: t('nav.projects'),
      png: codePng,
      video: codeVideo,
      color: new THREE.Color(0.4, 0.8, 0.6),
    },
    {
      id: "About",
      label: t('nav.about'), 
      png: avatarPng,
      video: avatarVideo,
      color: new THREE.Color(0.8, 0.5, 0.9),
    },
    {
      id: "Skills",
      label: t('nav.skills'),
      png: skillPng,
      video: skillVideo,
      color: new THREE.Color(0.7, 0.5, 0.9),
    },
  ], [t]); 

  const [active, setActive] = useState(null);
  const homeRef = useRef(null);
  
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [isDragCapable, setIsDragCapable] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(pointer: fine) and (hover: hover)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(pointer: fine) and (hover: hover)');
      const update = () => setIsDragCapable(mq.matches);
      mq.addEventListener('change', update);
      update();
      return () => mq.removeEventListener('change', update);
    }
  }, []);

  const isDesktop = dimensions.width >= 1024;
  const isTablet = !isDesktop && dimensions.width < 1024 && dimensions.width >= 600;
  const show3DNav = isDesktop && isDragCapable;

  const scalingConfig = useMemo(() => {
    if (isDesktop) {
      return {
        radius: 10,
        iconScale: 0.7,
        iconPlaneSize: 1.6,
        ringInner: 0.9,
        ringOuter: 1.0,
        labelMargin: 70,
        hologramScale: 1,
        hologramRadius: 5,
        hologramHalo: [5.2, 5.4],
        hologramY: 0, 
      };
    } else if (isTablet) {
      return {
        radius: 7.5,
        iconScale: 0.55,
        iconPlaneSize: 1.2,
        ringInner: 0.7,
        ringOuter: 0.8,
        labelMargin: 48,
        hologramScale: 0.9, 
        hologramRadius: 4.5, 
        hologramHalo: [4.7, 4.9],
        hologramY: 0.5, 
      };
    } else { 
      return {
        radius: 5.2,
        iconScale: 0.42,
        iconPlaneSize: 0.95,
        ringInner: 0.55,
        ringOuter: 0.65,
        labelMargin: 32,
        hologramScale: 0.7, 
        hologramRadius: 4.0, 
        hologramHalo: [4.2, 4.4],
        hologramY: 1.2, 
      };
    }
  }, [isDesktop, isTablet]);

  const isInView = useInView(homeRef, { amount: 1 });
  const numberOfIcons = icons.length;

  const [rotationY, setRotationY] = useState(0);
  const dragRef = useRef({
    dragging: false,
    startX: 0,
    startRot: 0,
    hasInteracted: false,
  });  

  const [initialRotationComplete, setInitialRotationComplete] = useState(false);
  const rotationSpeedRef = useRef(0.2);

  const [mouse, setMouse] = useState(null);
  const [clicks, setClicks] = useState({ count: 0, pos: null });
  const [hasDragged, setHasDragged] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleIconClick = (iconId) => {
    const sectionMap = {
      About: "about-section",
      Skills: "skills-section",
      Projects: "projects-section",
      Resume: "resume-section",
      Socials: "socials-section",
    };
    scrollToSection(sectionMap[iconId]);
  };

  useEffect(() => {
    if (!show3DNav) return; 

    const rotationInterval = setInterval(() => {
      if (!initialRotationComplete) {
        setRotationY((prev) => prev + rotationSpeedRef.current);
        rotationSpeedRef.current *= 0.98;
        if (rotationSpeedRef.current < 0.001) {
          setInitialRotationComplete(true);
          clearInterval(rotationInterval);
        }
      }
    }, 16);
    return () => clearInterval(rotationInterval);
  }, [initialRotationComplete, show3DNav]);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragRef.current.dragging || !initialRotationComplete || !show3DNav) return;
      const deltaX = e.clientX - dragRef.current.startX;
      const rotationSpeed = 0.003;
      setRotationY(dragRef.current.startRot + deltaX * rotationSpeed);

      if (!hasDragged && Math.abs(deltaX) > 5) {
        setHasDragged(true);
      }
    };

    const onMouseUp = (e) => {
      if (dragRef.current.dragging) {
        dragRef.current.hasInteracted = true;
        if (!hasDragged) {
          setClicks((prev) => ({
            count: prev.count + 1,
            pos: { x: e.clientX, y: e.clientY },
          }));
        }
      }
      dragRef.current.dragging = false;
    };

    const onPointerMove = (e) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("pointermove", onPointerMove);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [initialRotationComplete, hasDragged, show3DNav]);

  const panelPositions = useMemo(() => icons.map((_, i) => {
    const angle = (i / numberOfIcons) * 2 * Math.PI;
    const finalAngle = angle + rotationY;
    const x = scalingConfig.radius * Math.cos(finalAngle);
    const z = scalingConfig.radius * Math.sin(finalAngle);
    return [x, 0, z];
  }), [icons, numberOfIcons, rotationY, scalingConfig.radius]);

  const constellationScales = {
    about: isDesktop ? 1.3 : 0.9,
    socials: isDesktop ? 0.8 : 0.6,
    resume: isDesktop ? 0.8 : 0.6,
    skills: isDesktop ? 0.8 : 0.6,
    projects: isDesktop ? 0.8 : 0.6,
  };

  return (
    <>
      <div className="main-container">
        <LanguageSelector />
        <MusicPlayer />
        
        <section
          ref={homeRef}
          className="home-3d"
          onMouseDown={show3DNav ? (e) => {
            if (!initialRotationComplete) return;
            dragRef.current.dragging = true;
            dragRef.current.startX = e.clientX;
            dragRef.current.startRot = rotationY;
          } : undefined}
          style={{
            cursor: show3DNav
              ? dragRef.current.dragging ? "grabbing" : "grab"
              : "default",
          }}
        >
          <div id="home-3d" className="home-3d-content">
            <NightSkyBackground mouse={mouse} clicks={clicks} />

            {show3DNav && initialRotationComplete && !hasDragged && (
              <DragHint isVisible={!hasDragged} />
            )}

            <Canvas
              camera={{ position: [0, 5, 20], fov: 45 }}
              eventSource={document.getElementById("root")}
              eventPrefix="client"
              className="webgl-canvas"
            >
              <group>
                <Environment preset="sunset" />
                
                {show3DNav && icons.map((icon, i) => (
                  <motion.group
                    key={i}
                    initial={{ opacity: 0, scale: scalingConfig.iconScale, y: 1 }}
                    animate={{ opacity: 1, scale: scalingConfig.iconScale, y: 0 }}
                    transition={{
                      duration: 1.2,
                      delay: 0.5 + i * 0.15,
                      ease: [0.6, 0.01, 0.05, 0.95],
                    }}
                  >
                    <InteractivePanel
                      icon={icon}
                      active={active}
                      setActive={setActive}
                      index={i}
                      position={panelPositions[i]}
                      onIconClick={() => handleIconClick(icon.id)}
                      isParentVisible={isInView}
                      iconScale={scalingConfig.iconScale}
                      iconPlaneSize={scalingConfig.iconPlaneSize}
                      ringInner={scalingConfig.ringInner}
                      ringOuter={scalingConfig.ringOuter}
                      labelMargin={scalingConfig.labelMargin}
                      enableHover={true}
                    />
                  </motion.group>
                ))}
              </group>

              <motion.group
                initial={{ opacity: 0, scale: scalingConfig.hologramScale * 0.85, y: -0.5 }}
                animate={{ opacity: 1, scale: scalingConfig.hologramScale, y: scalingConfig.hologramY }}
                transition={{
                  duration: 1.5,
                  delay: 1.2,
                  ease: [0.6, 0.01, 0.05, 0.95],
                }}
              >
                <CentralHologram
                  scale={scalingConfig.hologramScale}
                  radius={scalingConfig.hologramRadius}
                  halo={scalingConfig.hologramHalo}
                />
              </motion.group>

              {show3DNav && (
                <>
                  <OutlineStars
                    active={active === "About"}
                    position={[-scalingConfig.radius + 1, 0, 0]}
                    pointsData={catPoints}
                    scale={constellationScales.about}
                  />
                  <OutlineStars
                    active={active === "Socials"}
                    position={[-scalingConfig.radius - 3, -scalingConfig.radius * 0.6, 0]}
                    pointsData={cameraPoints}
                    scale={constellationScales.socials}
                  />
                  <OutlineStars
                    active={active === "Resume"}
                    position={[-scalingConfig.radius - 2, scalingConfig.radius * 0.4, 0]}
                    pointsData={bookPoints}
                    scale={constellationScales.resume}
                  />
                  <OutlineStars
                    active={active === "Skills"}
                    position={[scalingConfig.radius + 2, scalingConfig.radius * 0.4, 0]}
                    pointsData={flowerPoints}
                    scale={constellationScales.skills}
                  />
                  <OutlineStars
                    active={active === "Projects"}
                    position={[scalingConfig.radius - 1, -scalingConfig.radius * 0.6, 0]}
                    pointsData={headsetPoints}
                    scale={constellationScales.projects}
                  />
                </>
              )}
            </Canvas>

            {!show3DNav && (
              <motion.div 
                className="static-menu-overlay mobile-home-layout"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <div className="menu-grid">
                  {icons.map((icon) => (
                    <button 
                      key={icon.id}
                      className="menu-item"
                      onClick={() => handleIconClick(icon.id)}
                      style={{ '--item-color': `#${icon.color.getHexString()}` }}
                    >
                      <div className="icon-wrapper">
                        <img src={icon.png} alt={icon.label} />
                      </div>
                      <span className="label">{icon.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </section>

        <SectionsContainer />
      </div>
    </>
  );
};

export default Home;