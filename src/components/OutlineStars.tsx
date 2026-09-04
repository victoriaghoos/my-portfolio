import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OutlineStarsProps {
  active: boolean;
  position?: [number, number, number];
  pointsData: number[][];
  scale?: number;
  color?: string;
  pointSize?: number;
  samplingRate?: number;
  animationSpeed?: number;
  waveIntensity?: number;
}

const OutlineStars = ({
  active,
  position = [0, 0, 0],
  pointsData,
  scale = 0.8,
  color = '#7FFFD4',
  pointSize = 0.1,
  samplingRate = 1,
  animationSpeed = 2,
  waveIntensity = 0.003,
}: OutlineStarsProps) => {
  const particlesRef = useRef<THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>>(null);
  const opacityRef = useRef(0);

  const particlePositions = useMemo(() => {
    const positions: number[] = [];
    pointsData.forEach((point, i) => {
      if (i % samplingRate === 0) {
        const x = (point[0] / 100 - 5) * scale;
        const y = (-point[1] / 100 + 5) * scale;
        const z = (Math.random() - 0.5) * 0.5 * scale;
        positions.push(x, y, z);
      }
    });
    return new Float32Array(positions);
  }, [pointsData, scale, samplingRate]);

  const threeColor = useMemo(() => new THREE.Color(color), [color]);

  useFrame(({ clock }) => {
    const particles = particlesRef.current;
    if (!particles) return;

    const targetOpacity = active ? 0.9 : 0;
    const fadeSpeed = active ? 0.005 : 0.2;
    opacityRef.current += (targetOpacity - opacityRef.current) * fadeSpeed;
    particles.material.opacity = opacityRef.current;

    if (opacityRef.current < 0.01) {
      particles.visible = false;
      return;
    }

    particles.visible = true;

    const elapsedTime = clock.getElapsedTime();
    const positions = particles.geometry.attributes.position.array;
    for (let i = 2; i < positions.length; i += 3) {
      positions[i] = Math.sin(elapsedTime * animationSpeed + i) * waveIntensity * scale;
    }
    particles.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group position={position}>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlePositions.length / 3}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={pointSize * scale}
          color={threeColor}
          transparent
          opacity={0}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

export default OutlineStars;
