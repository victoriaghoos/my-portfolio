// The WebGL part of the hub: rotating 3D icons, the hologram photo and the constellations.
// It's a separate chunk that only loads on desktop with a mouse, because three.js and the
// point clouds are by far the heaviest part of the site. Phones and tablets get a plain image.
import {
  memo,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from 'react';
import { suspend } from 'suspend-react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { motion, useReducedMotion } from 'framer-motion';
import * as THREE from 'three';

import InteractivePanel, { type PanelIcon } from './InteractivePanel';
import CentralHologram from './CentralHologram';
import OutlineStars from './OutlineStars';
import CanvasErrorBoundary from './webgl/CanvasErrorBoundary';
import { useContextLossHandler } from './webgl/webgl';
import type { ConstellationScales, ScalingConfig } from './hubTypes';

import catPoints from '../catPoints.json';
import cameraPoints from '../cameraPoints.json';
import bookPoints from '../bookPoints.json';
import flowerPoints from '../flowerPoints.json';
import headsetPoints from '../headsetPoints.json';

const sunsetHdri = import('@pmndrs/assets/hdri/sunset.exr');

// framer-motion's DOM types don't model react-three-fiber's `group` primitive, but the
// resulting element is interpreted by whichever reconciler renders it (r3f's, here), so this
// animates the underlying THREE.Group exactly like motion.div animates a real DOM element.
const MotionGroup = (motion as unknown as { group: typeof motion.div }).group;

const RotatingPanels = memo(function RotatingPanels({
  navEnabled,
  icons,
  scalingConfig,
  setActive,
  panelPositions,
  handleIconClick,
  onPanelPointerUp,
  isInView,
  initialRotationComplete,
  onInitialRotationComplete,
  rotationYRef,
  targetRotationYRef,
}: {
  navEnabled: boolean;
  icons: PanelIcon[];
  scalingConfig: ScalingConfig;
  setActive: (id: string | null) => void;
  panelPositions: [number, number, number][];
  handleIconClick: (id: string) => void;
  onPanelPointerUp: () => void;
  isInView: boolean;
  initialRotationComplete: boolean;
  onInitialRotationComplete: () => void;
  rotationYRef: MutableRefObject<number>;
  targetRotationYRef: MutableRefObject<number>;
}) {
  const panelsGroupRef = useRef<THREE.Group>(null);
  const introStartTimeRef = useRef<number | null>(null);
  const introSpeedRef = useRef(0.6);
  const reduceMotion = useReducedMotion();

  useFrame(({ clock }, delta) => {
    if (!panelsGroupRef.current) {
      return;
    }

    if (!navEnabled || !isInView) {
      panelsGroupRef.current.rotation.y = rotationYRef.current;
      return;
    }

    if (!initialRotationComplete && reduceMotion) {
      // no spinning intro for visitors who prefer reduced motion
      onInitialRotationComplete();
    } else if (!initialRotationComplete) {
      if (introStartTimeRef.current === null) {
        introStartTimeRef.current = clock.getElapsedTime();
      }

      const introElapsed = clock.getElapsedTime() - introStartTimeRef.current;
      if (introElapsed >= 0.2) {
        const frameFactor = delta * 60;
        rotationYRef.current += introSpeedRef.current * frameFactor;
        introSpeedRef.current *= Math.pow(0.96, frameFactor);
        targetRotationYRef.current = rotationYRef.current;

        if (introSpeedRef.current < 0.001) {
          onInitialRotationComplete();
        }
      }
    } else {
      rotationYRef.current = THREE.MathUtils.lerp(
        rotationYRef.current,
        targetRotationYRef.current,
        0.35,
      );
    }

    panelsGroupRef.current.rotation.y = rotationYRef.current;
  });

  if (!navEnabled) {
    return null;
  }

  return (
    <group ref={panelsGroupRef}>
      {icons.map((icon, i) => (
        <MotionGroup
          key={i}
          initial={{ opacity: 0, scale: scalingConfig.iconScale, y: 1 }}
          animate={{ opacity: 1, scale: scalingConfig.iconScale, y: 0 }}
          transition={{
            duration: 1.2,
            delay: 0.5 + i * 0.15,
            ease: [0.6, 0.01, 0.05, 0.95],
          }}
        >
          <InteractivePanel
            icon={icon}
            setActive={setActive}
            index={i}
            position={panelPositions[i]}
            orbitRotationYRef={rotationYRef}
            onIconClick={() => handleIconClick(icon.id)}
            onPanelPointerUp={onPanelPointerUp}
            isParentVisible={isInView}
            iconScale={scalingConfig.iconScale}
            iconPlaneSize={scalingConfig.iconPlaneSize}
            ringInner={scalingConfig.ringInner}
            ringOuter={scalingConfig.ringOuter}
            labelMargin={scalingConfig.labelMargin}
          />
        </MotionGroup>
      ))}
    </group>
  );
});

export interface HubSceneProps {
  eventSource: RefObject<HTMLElement>;
  navEnabled: boolean;
  isInView: boolean;
  icons: PanelIcon[];
  scalingConfig: ScalingConfig;
  active: string | null;
  setActive: (id: string | null) => void;
  panelPositions: [number, number, number][];
  handleIconClick: (id: string) => void;
  onPanelPointerUp: () => void;
  constellationScales: ConstellationScales;
  initialRotationComplete: boolean;
  onInitialRotationComplete: () => void;
  rotationYRef: MutableRefObject<number>;
  targetRotationYRef: MutableRefObject<number>;
  onWebglFailure: () => void;
}

// Replaces drei's <Preload all />, which compiled every shader synchronously and rendered the
// whole scene six times into a cube camera: one ~0.7 s task that froze the page while the hub
// loaded. compileAsync lets the GPU compile in the background (KHR_parallel_shader_compile);
// the scene is only drawn once that is done, so it still appears in one go.
const COMPILE_TIMEOUT_MS = 4000;

const CompileShaders = ({ onCompiled }: { onCompiled: () => void }) => {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      onCompiled();
    };

    // compiles hidden objects too, like Preload's `all`
    gl.compileAsync(scene, camera).then(finish, finish);

    // never leave the hub blank if the browser doesn't report back
    const timer = window.setTimeout(finish, COMPILE_TIMEOUT_MS);
    return () => {
      done = true;
      window.clearTimeout(timer);
    };
  }, [gl, scene, camera, onCompiled]);

  return null;
};

const HubScene = ({
  eventSource,
  navEnabled,
  isInView,
  icons,
  scalingConfig,
  active,
  setActive,
  panelPositions,
  handleIconClick,
  onPanelPointerUp,
  constellationScales,
  initialRotationComplete,
  onInitialRotationComplete,
  rotationYRef,
  targetRotationYRef,
  onWebglFailure,
}: HubSceneProps) => {
  const handleCanvasCreated = useContextLossHandler(onWebglFailure);
  const [compiled, setCompiled] = useState(false);
  const handleCompiled = useCallback(() => setCompiled(true), []);

  return (
    <CanvasErrorBoundary onError={onWebglFailure}>
      <Canvas
        frameloop={isInView && compiled ? 'always' : 'never'}
        camera={{ position: [0, 5, 20], fov: 45 }}
        eventSource={eventSource as MutableRefObject<HTMLElement>}
        eventPrefix="client"
        className="webgl-canvas"
        dpr={[1, 1.5]}
        style={{ pointerEvents: navEnabled ? 'auto' : 'none' }}
        onCreated={handleCanvasCreated}
      >
        <Suspense fallback={null}>
          <group>
            <Environment files={(suspend(sunsetHdri) as { default: string }).default} />

            <RotatingPanels
              navEnabled={navEnabled}
              icons={icons}
              scalingConfig={scalingConfig}
              setActive={setActive}
              panelPositions={panelPositions}
              handleIconClick={handleIconClick}
              onPanelPointerUp={onPanelPointerUp}
              isInView={isInView}
              initialRotationComplete={initialRotationComplete}
              onInitialRotationComplete={onInitialRotationComplete}
              rotationYRef={rotationYRef}
              targetRotationYRef={targetRotationYRef}
            />
          </group>

          <MotionGroup
            initial={{ opacity: 0, scale: scalingConfig.hologramScale * 0.85, y: -0.5 }}
            animate={{
              opacity: 1,
              scale: scalingConfig.hologramScale,
              y: scalingConfig.hologramY,
            }}
            transition={{
              duration: 1.5,
              delay: 1.2,
              ease: [0.6, 0.01, 0.05, 0.95],
            }}
          >
            <CentralHologram
              scale={scalingConfig.hologramScale}
              radius={scalingConfig.hologramRadius}
              halo={scalingConfig.hologramHalo}
            />
          </MotionGroup>

          {navEnabled && (
            <>
              <OutlineStars
                active={active === 'About'}
                position={[-scalingConfig.radius + 1, 0, 0]}
                pointsData={catPoints}
                scale={constellationScales.about}
              />
              <OutlineStars
                active={active === 'Socials'}
                position={[-scalingConfig.radius - 3, -scalingConfig.radius * 0.6, 0]}
                pointsData={cameraPoints}
                scale={constellationScales.socials}
              />
              <OutlineStars
                active={active === 'Resume'}
                position={[-scalingConfig.radius - 2, scalingConfig.radius * 0.4, 0]}
                pointsData={bookPoints}
                scale={constellationScales.resume}
              />
              <OutlineStars
                active={active === 'Skills'}
                position={[scalingConfig.radius + 2, scalingConfig.radius * 0.4, 0]}
                pointsData={flowerPoints}
                scale={constellationScales.skills}
              />
              <OutlineStars
                active={active === 'Projects'}
                position={[scalingConfig.radius - 1, -scalingConfig.radius * 0.6, 0]}
                pointsData={headsetPoints}
                scale={constellationScales.projects}
              />
            </>
          )}

          <CompileShaders onCompiled={handleCompiled} />
        </Suspense>
      </Canvas>
    </CanvasErrorBoundary>
  );
};

export default memo(HubScene);
