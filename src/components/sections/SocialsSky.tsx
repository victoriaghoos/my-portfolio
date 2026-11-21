// The WebGL clouds behind the contact section. A separate chunk, loaded only when the section
// comes near, so three.js isn't downloaded and run while the rest of the page is loading.
import { memo, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Cloud, Clouds, Sparkles, Float } from '@react-three/drei';
import { useReducedMotion } from 'framer-motion';
import CanvasErrorBoundary from '../webgl/CanvasErrorBoundary';
import { useContextLossHandler } from '../webgl/webgl';
// Self-hosted copy of drei's default cloud sprite (drei otherwise fetches it from rawcdn.githack.com)
import cloudTexture from '../../assets/images/cloud.png';

const CLOUD_COUNT = 18;
const CLOUD_SEGMENTS = 20;

interface CloudPuffProps {
  position: [number, number, number];
  speed: number;
  opacity: number;
}

const CloudPuff = ({ position, speed, opacity }: CloudPuffProps) => {
  return (
    <Cloud
      position={position}
      opacity={opacity}
      speed={speed}
      segments={CLOUD_SEGMENTS}
      color="#fff0f5"
      bounds={[6, 2, 2]}
      volume={10}
    />
  );
};

const SilkSkyScene = memo(function SilkSkyScene() {
  const reduceMotion = useReducedMotion();
  const cloudPositions = useMemo(() => {
    const pos: {
      x: number;
      y: number;
      z: number;
      scale: number;
      speed: number;
      opacity: number;
    }[] = [];
    for (let i = 0; i < CLOUD_COUNT; i++) {
      const xPos = (Math.random() - 0.5) * 90;
      const distanceFromCenter = Math.abs(xPos);
      const yBase = -5;
      const yVariation = Math.random() * 3;
      const yPos = yBase + distanceFromCenter * 0.05 + yVariation;

      pos.push({
        x: xPos,
        y: yPos,
        z: (Math.random() - 0.5) * 20,
        scale: 1.1 + Math.random() * 0.8,
        speed: 0.06 + Math.random() * 0.08,
        opacity: 0.55 + Math.random() * 0.35,
      });
    }
    return pos;
  }, []);

  return (
    <>
      <ambientLight intensity={1.1} color="#d8b4fe" />
      <pointLight position={[0, -10, -20]} intensity={2.0} color="#fb923c" distance={60} />
      <directionalLight position={[0, 5, 5]} intensity={1.0} color="#f472b6" />
      <Sparkles
        count={80}
        scale={[40, 10, 10]}
        size={3}
        speed={reduceMotion ? 0 : 0.4}
        opacity={0.6}
        color="#fff"
        position={[0, -2, 0]}
      />
      {/* One shared Clouds parent: a single instanced mesh for every puff, using the local texture */}
      <Clouds texture={cloudTexture} limit={CLOUD_COUNT * CLOUD_SEGMENTS}>
        <group position={[0, -10, -10]}>
          <Float speed={reduceMotion ? 0 : 0.5} rotationIntensity={0.1} floatIntensity={0.2}>
            {cloudPositions.map((cloud, i) => (
              <group key={i} scale={cloud.scale}>
                <CloudPuff
                  position={[cloud.x, cloud.y, cloud.z]}
                  speed={reduceMotion ? 0 : cloud.speed}
                  opacity={cloud.opacity}
                />
              </group>
            ))}
          </Float>
        </group>
      </Clouds>
      <fog attach="fog" args={['#ffedd5', 5, 50]} />
    </>
  );
});

interface SocialsSkyProps {
  isVisible: boolean;
  onWebglFailure: () => void;
}

const SocialsSky = ({ isVisible, onWebglFailure }: SocialsSkyProps) => {
  const handleCanvasCreated = useContextLossHandler(onWebglFailure);

  return (
    <CanvasErrorBoundary onError={onWebglFailure}>
      <Canvas
        frameloop={isVisible ? 'always' : 'never'}
        camera={{ position: [0, 0, 14], fov: 45 }}
        resize={{ scroll: false }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5, max: 1 }}
        onCreated={handleCanvasCreated}
      >
        <SilkSkyScene />
      </Canvas>
    </CanvasErrorBoundary>
  );
};

export default SocialsSky;
