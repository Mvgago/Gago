import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * A cinematic, dim stage for one project at a time: a back wall and a floor in
 * near-darkness (#0A0B0C), and the project's image on a satin plaque standing a
 * little off the wall. A spotlight follows the pointer with inertia, raking
 * across the plaque (a soft specular sheen) and casting its real, soft shadow
 * onto the wall and floor. The plaque leans a few degrees towards the pointer.
 *
 * Rendering is on demand (frameloop "demand"): frames are drawn only while the
 * pointer moves or the light and plaque are still settling — at rest, no GPU work.
 */

const BG = "#0a0b0c";

type Props = {
  image: string;
  className?: string;
};

/** Pointer in -1…1, shared without re-rendering */
type Pointer = { x: number; y: number };

const lerp = THREE.MathUtils.lerp;
const damp = (a: number, b: number, rate: number, dt: number) => lerp(a, b, 1 - Math.exp(-rate * dt));

/** The plaque: the project image on a thin satin panel */
const Plaque: React.FC<{ image: string; pointer: React.MutableRefObject<Pointer> }> = ({ image, pointer }) => {
  // Loaded with fiber's own loader (suspends until ready); no extra library needed
  const texture = useLoader(THREE.TextureLoader, image);
  const group = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  const { viewport } = useThree();

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    invalidate();
  }, [texture, invalidate]);

  // Size: fit the plaque to the view, keeping the image's proportions
  const [w, h] = useMemo(() => {
    const img = texture.image as { width: number; height: number };
    const aspect = img.width / img.height;
    const maxW = Math.min(viewport.width * 0.5, 5.2);
    const maxH = viewport.height * 0.4;
    const width = Math.min(maxW, maxH * aspect);
    return [width, width / aspect];
  }, [texture, viewport.width, viewport.height]);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    // Lean towards the pointer, at most ~7° — damped, so it settles like a spring
    const ty = pointer.current.x * THREE.MathUtils.degToRad(7);
    const tx = -pointer.current.y * THREE.MathUtils.degToRad(5);
    g.rotation.y = damp(g.rotation.y, ty, 4, dt);
    g.rotation.x = damp(g.rotation.x, tx, 4, dt);
    if (Math.abs(g.rotation.y - ty) + Math.abs(g.rotation.x - tx) > 1e-4) invalidate();
  });

  return (
    <group ref={group} position={[0, 0.45, 0.55]}>
      {/* The panel's thickness, dark satin */}
      <mesh castShadow position={[0, 0, -0.03]}>
        <boxGeometry args={[w + 0.06, h + 0.06, 0.05]} />
        <meshStandardMaterial color="#1a1b1d" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* The image face: satin, so the passing light leaves a soft sheen */}
      <mesh castShadow>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={texture} roughness={0.3} metalness={0.1} />
      </mesh>
    </group>
  );
};

/** The key light: a spotlight that follows the pointer with inertia */
const KeyLight: React.FC<{ pointer: React.MutableRefObject<Pointer> }> = ({ pointer }) => {
  const light = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const invalidate = useThree((s) => s.invalidate);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    target.position.set(0, 0.35, 0.5);
    scene.add(target);
    if (light.current) light.current.target = target;
    return () => {
      scene.remove(target);
    };
  }, [scene, target]);

  useFrame((_, dt) => {
    const l = light.current;
    if (!l) return;
    const tx = pointer.current.x * 3.2;
    const ty = 2.4 + pointer.current.y * 1.6;
    l.position.x = damp(l.position.x, tx, 2.5, dt);
    l.position.y = damp(l.position.y, ty, 2.5, dt);
    if (Math.abs(l.position.x - tx) + Math.abs(l.position.y - ty) > 1e-3) invalidate();
  });

  return (
    <spotLight
      ref={light}
      position={[0, 2.4, 4.2]}
      angle={0.62}
      penumbra={1}
      intensity={34}
      distance={14}
      decay={2}
      color="#fff4ea"
      castShadow
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
      shadow-bias={-0.0004}
      shadow-radius={14}
      shadow-blurSamples={16}
    />
  );
};

/** Wall and floor: near-black, but they receive the light and the shadow */
const Room: React.FC = () => (
  <group>
    <mesh receiveShadow position={[0, 1.5, -0.4]}>
      <planeGeometry args={[30, 12]} />
      <meshStandardMaterial color="#1c1d20" roughness={0.92} metalness={0} />
    </mesh>
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 4]}>
      <planeGeometry args={[30, 12]} />
      <meshStandardMaterial color="#17181a" roughness={0.85} metalness={0} />
    </mesh>
  </group>
);

/** Keeps the camera framing the plaque across screen shapes */
const Framing: React.FC = () => {
  const { camera, size } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const portrait = size.width / size.height < 0.9;
    cam.fov = portrait ? 58 : 38;
    cam.position.set(0, 0.45, portrait ? 7.2 : 7);
    cam.lookAt(0, 0.3, 0);
    cam.updateProjectionMatrix();
  }, [camera, size.width, size.height]);
  return null;
};

export const AtmosphericStage: React.FC<Props> = ({ image, className = "" }) => {
  const pointer = useRef<Pointer>({ x: 0, y: 0 });
  const host = useRef<HTMLDivElement>(null);
  const invalidateRef = useRef<() => void>(() => {});

  // Pointer anywhere over the stage; reduced motion keeps everything still
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.current.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
      invalidateRef.current();
    };
    const onLeave = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
      invalidateRef.current();
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={host} className={className} style={{ background: BG }}>
      <Canvas
        frameloop="demand"
        shadows="variance"
        dpr={[1, 1.75]}
        camera={{ fov: 38, position: [0, 0.45, 7], near: 0.1, far: 50 }}
        gl={{ antialias: true }}
        onCreated={({ invalidate, gl }) => {
          invalidateRef.current = invalidate;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <color attach="background" args={[BG]} />
        <fog attach="fog" args={[BG, 9, 18]} />
        <ambientLight intensity={0.06} />
        <Framing />
        <Room />
        <KeyLight pointer={pointer} />
        <Suspense fallback={null}>
          <Plaque key={image} image={image} pointer={pointer} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default AtmosphericStage;
