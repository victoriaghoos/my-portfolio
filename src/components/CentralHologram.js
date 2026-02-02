import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import circularImage from "../assets/images/me.png";


const CentralHologram = ({ scale = 1, radius = 5, halo = [5.2, 5.4] }) => {
  const texture = useTexture(circularImage);
  const ref = useRef();
  const haloRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.position.y = Math.sin(t * 0.8) * 0.05;
    }
    if (haloRef.current) {
      haloRef.current.rotation.z = t * 0.1;
      const pulse = Math.sin(t * 2) * 0.03;
      haloRef.current.scale.set(1 + pulse, 1 + pulse, 1);
    }
  });

  return (
    <group ref={ref} scale={[scale, scale, scale]}>
      <mesh ref={haloRef}>
        <ringGeometry args={[halo[0], halo[1], 64]} />
        <meshBasicMaterial
          color="#7c9eff"
          transparent={true}
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0]}>
        <circleGeometry args={[radius, 64]} />
        <meshStandardMaterial
          map={texture}
          transparent={true}
          side={THREE.DoubleSide}
          emissive="#7c9eff"
          emissiveIntensity={0.02}
        />
      </mesh>
    </group>
  );
};

export default CentralHologram;