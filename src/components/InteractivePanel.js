import { useState, useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, useTexture, Float, useCursor } from "@react-three/drei";
import * as THREE from "three";

const InteractivePanel = ({ icon, setActive, index, position, isParentVisible, onIconClick, iconScale = 0.7, iconPlaneSize = 1.6, ringInner = 0.9, ringOuter = 1.0, labelMargin = 70 }) => {
  const ref = useRef();
  const pngTexture = useTexture(icon.png);
  const [hovered, setHovered] = useState(false);
  const [labelVisible, setLabelVisible] = useState(true);
  const videoRef = useRef();
  const videoTextureRef = useRef();
  const ringRef = useRef();
  const labelVisibleRef = useRef(true);
  const panelPositionRef = useRef(new THREE.Vector3());
  const directionRef = useRef(new THREE.Vector3());
  const intersectionPointRef = useRef(new THREE.Vector3());
  const raycasterRef = useRef(new THREE.Raycaster());
  const hologramPlaneRef = useRef(
    new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
  );
  const { camera } = useThree();

  useCursor(hovered, "pointer", "auto");

  const updateVideoTexture = (video) => {
    if (
      hovered &&
      videoTextureRef.current &&
      video &&
      !video.paused &&
      !video.ended &&
      video.readyState >= video.HAVE_CURRENT_DATA
    ) {
      videoTextureRef.current.needsUpdate = true;
    }
  };

  const updatePanelTransform = (elapsedTime) => {
    if (!ref.current) {
      return null;
    }

    ref.current.position.y = position[1] + Math.sin(elapsedTime * 0.5 + index) * 0.1;
    ref.current.rotation.y = Math.sin(elapsedTime * 0.3 + index) * 0.05;

    return ref.current.getWorldPosition(panelPositionRef.current);
  };

  const updateLabelVisibility = (panelPosition) => {
    if (!panelPosition) {
      return;
    }

    const direction = directionRef.current
      .copy(panelPosition)
      .sub(camera.position)
      .normalize();

    raycasterRef.current.set(camera.position, direction);
    const intersectionPoint = intersectionPointRef.current;
    const intersects = raycasterRef.current.ray.intersectPlane(
      hologramPlaneRef.current,
      intersectionPoint,
    );

    let nextLabelVisible = true;

    if (intersects) {
      const distToPanel = camera.position.distanceTo(panelPosition);
      const distToIntersection =
        camera.position.distanceTo(intersectionPoint);
      nextLabelVisible = distToPanel < distToIntersection;
    }

    if (labelVisibleRef.current !== nextLabelVisible) {
      labelVisibleRef.current = nextLabelVisible;
      setLabelVisible(nextLabelVisible);
    }
  };

  const updateRingAnimation = (elapsedTime) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = elapsedTime * 0.3;
      if (hovered) {
        ringRef.current.scale.setScalar(1.1 + Math.sin(elapsedTime * 7) * 0.05);
      } else {
        ringRef.current.scale.setScalar(1);
      }
    }

    if (ringRef.current && ringRef.current.material) {
      ringRef.current.material.opacity = THREE.MathUtils.lerp(
        ringRef.current.material.opacity,
        hovered ? 0 : 0.3,
        0.25,
      );
    }
  };

  const disposeVideoResources = (
    video = videoRef.current,
    videoTexture = videoTextureRef.current,
  ) => {
    if (video) {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }

    if (videoTexture) {
      videoTexture.dispose();
    }

    if (videoRef.current === video) {
      videoRef.current = null;
    }

    if (videoTextureRef.current === videoTexture) {
      videoTextureRef.current = null;
    }
  };

  useEffect(() => {
    disposeVideoResources();

    if (!icon.video) {
      return undefined;
    }

    const video = document.createElement("video");
    video.src = icon.video;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    video.preload = "auto";
    videoRef.current = video;

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBAFormat;
    videoTextureRef.current = videoTexture;

    return () => {
      disposeVideoResources(video, videoTexture);
    };
  }, [icon.video]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const video = videoRef.current;

    updateVideoTexture(video);
    const panelPosition = updatePanelTransform(t);
    updateLabelVisibility(panelPosition);
    updateRingAnimation(t);
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    setActive(icon.id);

    if (icon.video && videoRef.current) {
      videoRef.current.play().catch(console.log);
    }
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHovered(false);
    setActive(null);

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <group ref={ref} position={position}>
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={ringRef}>
          <ringGeometry args={[ringInner, ringOuter, 32]} />
          <meshBasicMaterial
            color={icon.color}
            transparent
            opacity={hovered ? 0 : 0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        <group scale={[iconScale, iconScale, 1]}>
          <mesh
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            onClick={(e) => {
              e.stopPropagation();
              onIconClick(icon.id);
            }}
          >
            <planeGeometry args={[iconPlaneSize, iconPlaneSize]} />
            <meshStandardMaterial
              map={
                hovered && videoTextureRef.current
                  ? videoTextureRef.current
                  : pngTexture
              }
              transparent={true}
              opacity={hovered ? 1 : 0.9}
              emissive={icon.color}
              emissiveIntensity={hovered ? 0.1 : 0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>

        <Html
          center
          style={{
            width: "100%",
            display: isParentVisible ? "flex" : "none",
            justifyContent: "center",
            marginTop: `${labelMargin}px`,
            pointerEvents: "none",
            transition: "none",
          }}
          transform
        >
          <div
            style={{
              color: "#2c3e50",
              fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
              fontSize: "0.65rem",
              fontWeight: "600",
              textAlign: "center",
              padding: "6px 12px",
              borderRadius: "4px",
              background: "rgba(255, 255, 255, 0.85)",
              border: `1px solid rgba(200, 220, 240, 0.6)`,
              boxShadow: `
                  0 4px 12px rgba(0, 0, 0, 0.1),
                  0 0 15px ${icon.color.getStyle()}40
                `,
              opacity: labelVisible ? (hovered ? 1 : 0.9) : 0,
              visibility: labelVisible ? "visible" : "hidden",
              transition: "none",
              transform: hovered ? "translateY(-2px) scale(1.05)" : "translateY(0) scale(1)",
              letterSpacing: "1px",
              textTransform: "uppercase",
              userSelect: "none",
            }}
          >
            {icon.label}
          </div>
        </Html>
      </Float>
    </group>
  );
};

export default InteractivePanel;