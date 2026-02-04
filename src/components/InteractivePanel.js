import { useState, useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, useTexture, Float } from "@react-three/drei";
import * as THREE from "three";

const InteractivePanel = ({ icon, setActive, index, position, isParentVisible, onIconClick, iconScale = 0.7, iconPlaneSize = 1.6, ringInner = 0.9, ringOuter = 1.0, labelMargin = 70 }) => {
  const ref = useRef();
  const pngTexture = useTexture(icon.png);
  const [hovered, setHovered] = useState(false);
  const [labelVisible, setLabelVisible] = useState(true);
  const videoRef = useRef();
  const videoTextureRef = useRef();
  const meshRef = useRef();
  const ringRef = useRef();
  const iconRef = useRef();
  const { camera } = useThree();

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current = null;
      }
      if (videoTextureRef.current) {
        videoTextureRef.current.dispose();
        videoTextureRef.current = null;
      }
    };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (
      videoTextureRef.current &&
      videoRef.current?.readyState >= videoRef.current.HAVE_CURRENT_DATA
    ) {
      videoTextureRef.current.needsUpdate = true;
    }

    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(t * 0.5 + index) * 0.1;
      ref.current.rotation.y = Math.sin(t * 0.3 + index) * 0.05;

      const panelPosition = ref.current.getWorldPosition(new THREE.Vector3());
      const direction = panelPosition.clone().sub(camera.position).normalize();

      const raycaster = new THREE.Raycaster(camera.position, direction);
      const hologramPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const intersectionPoint = new THREE.Vector3();
      const intersects = raycaster.ray.intersectPlane(
        hologramPlane,
        intersectionPoint
      );

      if (intersects) {
        const distToPanel = camera.position.distanceTo(panelPosition);
        const distToIntersection =
          camera.position.distanceTo(intersectionPoint);
        setLabelVisible(distToPanel < distToIntersection);
      } else {
        setLabelVisible(true);
      }
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.3;
      if (hovered) {
        ringRef.current.scale.setScalar(1.1 + Math.sin(t * 5) * 0.05);
      } else {
        ringRef.current.scale.setScalar(1);
      }
    }
    if (ringRef.current && ringRef.current.material) {
      ringRef.current.material.opacity = THREE.MathUtils.lerp(
        ringRef.current.material.opacity,
        hovered ? 0 : 0.3,
        0.1
      );
    }
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    setActive(icon.id);

    document.body.style.cursor = 'pointer';

    if (!videoTextureRef.current && icon.video) {
      const video = document.createElement("video");
      video.src = icon.video;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = "anonymous";
      video.play().catch(console.log);

      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      videoTexture.format = THREE.RGBAFormat;

      videoRef.current = video;
      videoTextureRef.current = videoTexture;
    } else if (videoRef.current) {
      videoRef.current.play().catch(console.log);
    }
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHovered(false);
    setActive(null);

    document.body.style.cursor = 'auto';

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

        <group ref={iconRef} scale={[iconScale, iconScale, 1]}>
          <mesh
            ref={meshRef}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            onClick={(e) => {
              e.stopPropagation();
              onIconClick(icon.label);
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

        {labelVisible && (
          <Html
            center
            style={{
              width: "100%",
              display: isParentVisible ? "flex" : "none",
              justifyContent: "center",
              marginTop: `${labelMargin}px`,
              pointerEvents: "none",
              opacity: hovered ? 1 : 0.9,
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
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(8px)",
                border: `1px solid rgba(200, 220, 240, 0.6)`,
                boxShadow: `
                    0 4px 12px rgba(0, 0, 0, 0.1),
                    0 0 15px ${icon.color.getStyle()}40
                  `,
                opacity: hovered ? 1 : 0.9,
                transition: "none",
                transform: hovered ? "translateY(-2px) scale(1.05)" : "translateY(0) scale(1)",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              {icon.label}
            </div>
          </Html>
        )}
      </Float>
    </group>
  );
};

export default InteractivePanel;