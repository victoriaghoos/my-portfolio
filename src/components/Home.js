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
import circularImage from "../assets/images/me.png";
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
  // Responsive scaling logic
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Detect drag-capable screens (pointer: fine, hover: hover, not touch)
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
  const isMobile = !isDesktop && dimensions.width < 600;

  // Radius for icon circle
  let radius = 10;
  if (isTablet) radius = 7.5;
  if (isMobile) radius = 5.2;
  const numberOfIcons = icons.length;
  const isInView = useInView(homeRef, { amount: 1 });

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

  // Add navigation function
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
  }, [initialRotationComplete]);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragRef.current.dragging || !initialRotationComplete) return;
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
  }, [initialRotationComplete, hasDragged]);

  // Panel Y position (vertical centering)
  let panelY = 0;
  if (isTablet) panelY = -0.5;
  if (isMobile) panelY = -1.2;

  // Responsive icon/constellation scale
  const iconScale = isDesktop ? 0.7 : isTablet ? 0.55 : 0.42;
  const iconPlaneSize = isDesktop ? 1.6 : isTablet ? 1.2 : 0.95;
  const ringInner = isDesktop ? 0.9 : isTablet ? 0.7 : 0.55;
  const ringOuter = isDesktop ? 1.0 : isTablet ? 0.8 : 0.65;
  const labelMargin = isDesktop ? 70 : isTablet ? 48 : 32;
  const centralHologramScale = isDesktop ? 1 : isTablet ? 0.7 : 0.5;
  const centralHologramRadius = isDesktop ? 5 : isTablet ? 3.5 : 2.5;
  const centralHologramHalo = isDesktop ? [5.2, 5.4] : isTablet ? [3.7, 3.9] : [2.7, 2.9];
  const constellationScales = {
    about: isDesktop ? 1.3 : isTablet ? 0.95 : 0.7,
    socials: isDesktop ? 0.8 : isTablet ? 0.6 : 0.45,
    resume: isDesktop ? 0.8 : isTablet ? 0.6 : 0.45,
    skills: isDesktop ? 0.8 : isTablet ? 0.6 : 0.45,
    projects: isDesktop ? 0.8 : isTablet ? 0.6 : 0.45,
  };

  // For mobile, icons are not in 3D, but in a horizontal row below the hologram
  const panelPositions = icons.map((_, i) => {
    if (isMobile) return [0, 0, 0];
    const angle = (i / numberOfIcons) * 2 * Math.PI;
    const finalAngle = angle + rotationY;
    const x = radius * Math.cos(finalAngle);
    const z = radius * Math.sin(finalAngle);
    return [x, panelY, z];
  });

  return (
    <>
      <div className="main-container">
        <LanguageSelector />
        <MusicPlayer />
        <section
          ref={homeRef}
          className="home-3d"
          onMouseDown={isDesktop && isDragCapable ? (e) => {
            if (!initialRotationComplete) return;
            dragRef.current.dragging = true;
            dragRef.current.startX = e.clientX;
            dragRef.current.startRot = rotationY;
          } : undefined}
          style={{
            cursor: isDesktop && isDragCapable
              ? dragRef.current.dragging
                ? "grabbing"
                : active
                  ? "pointer"
                  : initialRotationComplete
                    ? "grab"
                    : "default"
              : "default",
          }}
        >
          <div id="home-3d" className="home-3d">
            <NightSkyBackground mouse={mouse} clicks={clicks} />

            {/* Only show drag hint for drag-capable screens */}
            {isDesktop && isDragCapable && initialRotationComplete && !hasDragged && (
              <DragHint isVisible={!hasDragged} />
            )}

            {isDesktop || isTablet ? (
              <Canvas
                camera={{ position: [0, 5, 20], fov: 45 }}
                eventSource={document.getElementById("root")}
                eventPrefix="client"
              >
                <group>
                  <Environment preset="sunset" />
                  {icons.map((icon, i) => (
                    <motion.group
                      key={i}
                      initial={{ opacity: 0, scale: iconScale, y: 1 }}
                      animate={{ opacity: 1, scale: iconScale, y: 0 }}
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
                        iconScale={iconScale}
                        iconPlaneSize={iconPlaneSize}
                        ringInner={ringInner}
                        ringOuter={ringOuter}
                        labelMargin={labelMargin}
                        enableHover={true}
                      />
                    </motion.group>
                  ))}
                </group>

                <motion.group
                  initial={{ opacity: 0, scale: centralHologramScale * 0.85, y: -0.5 }}
                  animate={{ opacity: 1, scale: centralHologramScale, y: 0 }}
                  transition={{
                    duration: 1.5,
                    delay: 1.2,
                    ease: [0.6, 0.01, 0.05, 0.95],
                  }}
                >
                  <CentralHologram
                    scale={centralHologramScale}
                    radius={centralHologramRadius}
                    halo={centralHologramHalo}
                  />
                </motion.group>

                <OutlineStars
                  active={active === "About"}
                  position={[-radius + 1, 0, 0]}
                  pointsData={catPoints}
                  scale={constellationScales.about}
                />
                <OutlineStars
                  active={active === "Socials"}
                  position={[-radius - 3, -radius * 0.6, 0]}
                  pointsData={cameraPoints}
                  scale={constellationScales.socials}
                />
                <OutlineStars
                  active={active === "Resume"}
                  position={[-radius - 2, radius * 0.4, 0]}
                  pointsData={bookPoints}
                  scale={constellationScales.resume}
                />
                <OutlineStars
                  active={active === "Skills"}
                  position={[radius + 2, radius * 0.4, 0]}
                  pointsData={flowerPoints}
                  scale={constellationScales.skills}
                />
                <OutlineStars
                  active={active === "Projects"}
                  position={[radius - 1, -radius * 0.6, 0]}
                  pointsData={headsetPoints}
                  scale={constellationScales.projects}
                />
              </Canvas>
            ) : (
              <div className="mobile-home-layout">
                <div className="mobile-hologram-wrapper">
                  <img
                    src={circularImage}
                    alt="avatar"
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: '50%',
                      boxShadow: '0 2px 12px #7c9eff44',
                      background: '#fff',
                      objectFit: 'cover',
                      border: '3px solid #7c9eff',
                    }}
                  />
                </div>
                {/* Remove icons row for non-desktop, or you can add a different UI here if desired */}
              </div>
            )}
          </div>
        </section>

        <SectionsContainer />
      </div>
    </>
  );
};

export default Home;