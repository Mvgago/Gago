import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * The project image, full-bleed and untouched: an unlit plane in front of a
 * perspective camera, the photograph at 100% sharpness — no shader, no filter,
 * no tone mapping. The only motion is the camera: a slow dolly in Z and a few
 * millimetres of drift, following the pointer on a damped spring.
 *
 * The damped pointer is shared through `motion` so the HTML HUD on top can move
 * by the same amount at other depths (parallax without touching the picture).
 * Rendering is on demand: nothing is drawn while the camera is at rest.
 */

export type CameraMotion = { x: number; y: number; z: number };

type Props = {
  image: string;
  /** A silent looping film to show instead of the image: full size, a lighter one for phones, and its first frame */
  film?: { src: string; small: string; poster: string; posterSmall: string };
  /** Receives the camera's damped offset each frame it moves (for the HUD's parallax) */
  onMotion?: (m: CameraMotion) => void;
  className?: string;
};

// The projects page's graphite, so nothing else ever shows before the picture
const BG = "#2f2b2a";
const CAMERA_Z = 5;
const FOV = 30;
// The plane is a little larger than the view, so the camera's drift never reveals an edge
const BLEED = 1.025;
// Playback speed of the background film (1 = as recorded)
const FILM_SPEED = 1.35;

const damp = (a: number, b: number, rate: number, dt: number) => a + (b - a) * (1 - Math.exp(-rate * dt));

/** Plane = the visible frustum at z = 0 (times the bleed); the media is cropped to it like object-fit: cover */
function usePlane(texture: THREE.Texture, mediaAspect: number) {
  const { size, invalidate } = useThree();
  const { width, height } = useMemo(() => {
    const h = 2 * CAMERA_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * BLEED;
    return { width: h * (size.width / size.height), height: h };
  }, [size.width, size.height]);

  useEffect(() => {
    if (!mediaAspect) return;
    const planeAspect = width / height;
    if (mediaAspect > planeAspect) {
      const s = planeAspect / mediaAspect;
      texture.repeat.set(s, 1);
      texture.offset.set((1 - s) / 2, 0);
    } else {
      const s = mediaAspect / planeAspect;
      texture.repeat.set(1, s);
      texture.offset.set(0, (1 - s) / 2);
    }
    invalidate();
  }, [texture, mediaAspect, width, height, invalidate]);

  return { width, height };
}

const Picture: React.FC<{ image: string }> = ({ image }) => {
  const texture = useLoader(THREE.TextureLoader, image);
  const { gl, invalidate } = useThree();

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = gl.capabilities.getMaxAnisotropy();
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;
    invalidate();
  }, [texture, gl, invalidate]);

  const img = texture.image as { width: number; height: number };
  const { width, height } = usePlane(texture, img.width / img.height);

  return (
    <mesh>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
};

/** The camera: a damped dolly in Z and a slight drift, from the pointer */
const Rig: React.FC<{
  pointer: React.MutableRefObject<{ x: number; y: number; active: number }>;
  onMotion?: (m: CameraMotion) => void;
}> = ({ pointer, onMotion }) => {
  const { camera, invalidate } = useThree();
  const state = useRef<CameraMotion>({ x: 0, y: 0, z: 0 });

  useFrame((_, dt) => {
    const s = state.current;
    // Drift a few hundredths; dolly in a touch as the pointer comes onto the picture
    const tx = pointer.current.x * 0.035;
    const ty = pointer.current.y * 0.02;
    const tz = -0.06 * pointer.current.active;
    s.x = damp(s.x, tx, 2.2, dt);
    s.y = damp(s.y, ty, 2.2, dt);
    s.z = damp(s.z, tz, 1.6, dt);
    camera.position.set(s.x, s.y, CAMERA_Z + s.z);
    camera.lookAt(s.x * 0.4, s.y * 0.4, 0);
    onMotion?.(s);
    if (Math.abs(s.x - tx) + Math.abs(s.y - ty) + Math.abs(s.z - tz) > 1e-4) invalidate();
  });
  return null;
};

/** The same damped camera motion as the Rig, without a canvas: a rAF loop that sleeps at rest */
const MotionLoop: React.FC<{
  pointer: React.MutableRefObject<{ x: number; y: number; active: number }>;
  onMotion: (m: CameraMotion) => void;
  invalidateRef: React.MutableRefObject<() => void>;
}> = ({ pointer, onMotion, invalidateRef }) => {
  useEffect(() => {
    const s: CameraMotion = { x: 0, y: 0, z: 0 };
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      last = now;
      const tx = pointer.current.x * 0.035;
      const ty = pointer.current.y * 0.02;
      const tz = -0.06 * pointer.current.active;
      s.x = damp(s.x, tx, 2.2, dt);
      s.y = damp(s.y, ty, 2.2, dt);
      s.z = damp(s.z, tz, 1.6, dt);
      onMotion(s);
      if (Math.abs(s.x - tx) + Math.abs(s.y - ty) + Math.abs(s.z - tz) > 1e-4) raf = requestAnimationFrame(tick);
      else {
        raf = 0;
        last = 0;
      }
    };
    invalidateRef.current = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    return () => {
      cancelAnimationFrame(raf);
      invalidateRef.current = () => {};
    };
  }, [pointer, onMotion, invalidateRef]);
  return null;
};

export const CinematicViewer: React.FC<Props> = ({ image, film, onMotion, className = "" }) => {
  // phones get the lighter film: it starts in a moment instead of after a long download
  const phone = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
  const video = film ? (phone ? film.small : film.src) : undefined;
  const poster = film ? (phone ? film.posterSmall : film.poster) : undefined;
  const pointer = useRef({ x: 0, y: 0, active: 0 });
  const invalidateRef = useRef<() => void>(() => {});
  const videoRef = useRef<HTMLVideoElement>(null);
  const [frameReady, setFrameReady] = React.useState(false);
  // Phones (iOS above all) don't load a film until asked to play it: ask straight away.
  // If it never plays, the still underneath simply stays
  useEffect(() => {
    const v = videoRef.current;
    if (!video || !v) return;
    v.defaultPlaybackRate = FILM_SPEED;
    v.playbackRate = FILM_SPEED;
    void v.play().catch(() => {});
  }, [video]);

  // The camera's motion, passed on to the HUD and mirrored on the film as a transform
  const handleMotion = React.useCallback(
    (m: CameraMotion) => {
      // The film is kept pixel-exact: no zoom, no drift (any scaling softens it).
      // The camera's motion still moves the HUD and the still underneath.
      onMotion?.(m);
    },
    [onMotion],
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
      pointer.current.active = 1;
      invalidateRef.current();
    };
    const onLeave = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
      pointer.current.active = 0;
      invalidateRef.current();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className={`overflow-hidden ${className}`} style={{ background: BG }}>
      {/* With a film, no WebGL at all: a canvas uploading a large still while the video
          starts was what made its first second catch. The camera's damped motion then
          comes from a light loop that only runs while it moves. */}
      {video ? (
        <MotionLoop pointer={pointer} onMotion={handleMotion} invalidateRef={invalidateRef} />
      ) : (
        <Canvas
          frameloop="demand"
          dpr={[1, 2]}
          flat
          linear={false}
          camera={{ fov: FOV, position: [0, 0, CAMERA_Z], near: 0.1, far: 20 }}
          gl={{ antialias: true }}
          onCreated={({ invalidate }) => (invalidateRef.current = invalidate)}
        >
          <color attach="background" args={[BG]} />
          <Rig pointer={pointer} onMotion={handleMotion} />
          <Suspense fallback={null}>
            <Picture key={image} image={image} />
          </Suspense>
        </Canvas>
      )}
      {/* The film is drawn by the browser itself, not resampled through WebGL: its own
          high-quality scaler keeps it as sharp as the file allows. It follows the same
          damped camera motion only through the HUD: the film itself stays pixel-exact. */}
      {/* The project's picture under the film from the first instant: while the film loads it
          is what shows, never the empty graphite, and the film dissolves in over it. If the
          phone won't play the film at all (low-power mode, data saver), it simply stays */}
      {video && (
        <img src={poster} alt="" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
      )}
      {video && (
        <video
          ref={videoRef}
          key={video}
          src={video}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          poster={poster}
          // Start as soon as it can play, at its final speed from the first frame (changing
          // speed mid-play makes it stutter), then lift the cloud once frames are flowing
          onCanPlay={(e) => {
            const v = e.currentTarget;
            v.defaultPlaybackRate = FILM_SPEED;
            v.playbackRate = FILM_SPEED;
            if (v.paused) void v.play().catch(() => {});
          }}
          onPlaying={() => setFrameReady(true)}
          // Over its own first frame (the same picture, so nothing jumps), it simply takes over
          onLoadedData={() => setFrameReady(true)}
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            frameReady ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
};

export default CinematicViewer;
