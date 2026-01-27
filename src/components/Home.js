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
  const radius = 10;
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

  const panelPositions = icons.map((_, i) => {
    const angle = (i / numberOfIcons) * 2 * Math.PI;
    const finalAngle = angle + rotationY;
    const x = radius * Math.cos(finalAngle);
    const z = radius * Math.sin(finalAngle);
    return [x, 0, z];
  });

  return (
    <>
      <div className="main-container">
        <LanguageSelector />
        <MusicPlayer />
        <section
          ref={homeRef}
          className="home-3d"
          onMouseDown={(e) => {
            if (!initialRotationComplete) return;
            dragRef.current.dragging = true;
            dragRef.current.startX = e.clientX;
            dragRef.current.startRot = rotationY;
          }}
          style={{
            cursor: dragRef.current.dragging
              ? "grabbing"
              : active
                ? "pointer"
                : initialRotationComplete
                  ? "grab"
                  : "default",
          }}
        >
          <div id="home-3d" className="home-3d">
            <NightSkyBackground mouse={mouse} clicks={clicks} />

            {initialRotationComplete && !hasDragged && (
              <DragHint isVisible={!hasDragged} />
            )}
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
                    initial={{ opacity: 0, scale: 0.7, y: 1 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
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
                    />
                  </motion.group>
                ))}
              </group>

              <motion.group
                initial={{ opacity: 0, scale: 0.85, y: -0.5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 1.5,
                  delay: 1.2,
                  ease: [0.6, 0.01, 0.05, 0.95],
                }}
              >
                <CentralHologram />
              </motion.group>

              <OutlineStars
                active={active === "About"}
                position={[-11, 0, 0]}
                pointsData={catPoints}
                scale={1.3}
              />
              <OutlineStars
                active={active === "Socials"}
                position={[-14, -6, 0]}
                pointsData={cameraPoints}
                scale={0.8}
              />
              <OutlineStars
                active={active === "Resume"}
                position={[-13, 4, 0]}
                pointsData={bookPoints}
                scale={0.8}
              />
              <OutlineStars
                active={active === "Skills"}
                position={[14, 4, 0]}
                pointsData={flowerPoints}
                scale={0.8}
              />
              <OutlineStars
                active={active === "Projects"}
                position={[12, -6, 0]}
                pointsData={headsetPoints}
                scale={0.8}
              />
            </Canvas>
          </div>
        </section>

        <SectionsContainer />
      </div>
    </>
  );
};

export default Home;