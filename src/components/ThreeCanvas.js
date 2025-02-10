import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Your3DComponent from './Your3DComponent';

const ThreeCanvas = () => {
    return (
      <Canvas>
        <ambientLight intensity={2} />
        <pointLight position={[10, 10, 10]} />
        <Your3DComponent />
        <OrbitControls />
      </Canvas>
    );
  };

export default ThreeCanvas;
