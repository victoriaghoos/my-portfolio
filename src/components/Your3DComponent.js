import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const Your3DComponent = () => {
  const ref = useRef();

  useFrame((state, delta) => {
    ref.current.rotation.y += delta;
  });

  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={'orange'} />
    </mesh>
  );
};

export default Your3DComponent;
