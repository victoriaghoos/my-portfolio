import { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";
import "../styles/home.scss";

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
import CatOutlineStars from "./CatOutlineStars.js";
import CameraOutlineStars from "./CameraOutlineStars.js";
import BookOutlineStars from "./BookOutlineStars.js";
import FlowerOutlineStars from "./FlowerOutlineStars.js";
import NightSkyBackground from "./NightSkyBackground.js";
import InteractivePanel from "./InteractivePanel.js";
import CentralHologram from "./CentralHologram.js";
import HeadsetOutlineStars from "./HeadsetOutlineStars.js";
import OutlineStars from "./OutlineStars.js";

const icons = [
  {
    png: socialsPng,
    video: socialsVideo,
    label: "Socials",
    color: new THREE.Color(0.4, 0.7, 0.9),
  },
  {
    png: resumePng,
    video: resumeVideo,
    label: "Resume",
    color: new THREE.Color(0.9, 0.6, 0.4),
  },
  {
    png: codePng,
    video: codeVideo,
    label: "Projects",
    color: new THREE.Color(0.4, 0.8, 0.6),
  },
  {
    png: avatarPng,
    video: avatarVideo,
    label: "About",
    color: new THREE.Color(0.8, 0.5, 0.9),
  },
  {
    png: skillPng,
    video: skillVideo,
    label: "Skills",
    color: new THREE.Color(0.7, 0.5, 0.9),
  },
];

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
  const [active, setActive] = useState(null);
  const radius = 10;
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
    <section
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
          : initialRotationComplete
          ? "grab"
          : "default",
      }}
    >
      <div className="home-3d">
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

          <CatOutlineStars active={active === "About"} position={[-12, 0, 0]} />
          <CameraOutlineStars
            active={active === "Socials"}
            position={[-14, -6, 0]}
          />
          <BookOutlineStars
            active={active === "Resume"}
            position={[-14, 4, 0]}
          />
          <FlowerOutlineStars
            active={active === "Skills"}
            position={[14, 4, 0]}
          />
          <HeadsetOutlineStars
            active={active === "Projects"}
            position={[12, -6, 0]}
          />
        </Canvas>
      </div>
    </section>
  );
};

export default Home;