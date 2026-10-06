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
  /** A silent looping video to show instead of the image (the image stays as its poster) */
  video?: string;
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

export const CinematicViewer: React.FC<Props> = ({ image, video, onMotion, className = "" }) => {
  const pointer = useRef({ x: 0, y: 0, active: 0 });
  const invalidateRef = useRef<() => void>(() => {});
  const videoRef = useRef<HTMLVideoElement>(null);
  const [filmReady, setFilmReady] = React.useState(false);
  const [frameReady, setFrameReady] = React.useState(false);

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
      {video && (
        <video
          ref={videoRef}
          key={video}
          src={video}
          muted
          loop
          playsInline
          preload="auto"
          // Start only once enough is buffered to play through, at its final speed from
          // the first frame (changing speed mid-play makes it stutter), then lift the cloud
          // once frames are actually flowing
          onCanPlayThrough={(e) => {
            const v = e.currentTarget;
            v.defaultPlaybackRate = FILM_SPEED;
            v.playbackRate = FILM_SPEED;
            if (v.paused) void v.play().catch(() => {});
          }}
          onPlaying={() => window.setTimeout(() => setFilmReady(true), 120)}
          // A fixed grade, not animated: a touch darker and firmer, so the file's own
          // softness reads as atmosphere rather than as low resolution
          style={{ filter: "brightness(0.8) contrast(1.08) saturate(0.9)" }}
          // Shown from its own first frame (no poster: a still framed differently made the
          // picture jump when the film took over), so it is in place from the first instant
          onLoadedData={() => setFrameReady(true)}
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            frameReady ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
      {/* A pale cloud over the first frame, dissipating once the film has started:
          the haze lifts and its soft patches drift apart and fade (opacity and scale only, on the compositor) */}
      {video && (
        // The cloud comes with the first frame, never over the empty graphite (that read as a grey flash)
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-500 ${
            frameReady ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* The haze: frosted, pale, thinning */}
          <div
            className="absolute inset-0"
            // Only opacity animates: an animated backdrop blur over a playing video stalls it
            style={{
              background: "rgba(244,242,239,0.55)",
              opacity: filmReady ? 0 : 1,
              transition: "opacity 1.4s ease-out 0.1s",
              willChange: "opacity",
            }}
          />
          {/* Billows of cloud that swell slightly as they fade, each at its own pace */}
          {[
            { x: "22%", y: "38%", w: "70vmax", d: 0.3 },
            { x: "74%", y: "30%", w: "60vmax", d: 0.6 },
            { x: "48%", y: "78%", w: "75vmax", d: 0.45 },
          ].map((c) => (
            <div
              key={c.x}
              className="absolute rounded-full"
              style={{
                left: c.x,
                top: c.y,
                width: c.w,
                height: c.w,
                translate: "-50% -50%",
                background: "radial-gradient(closest-side, rgba(250,249,247,0.75), rgba(250,249,247,0.3) 55%, transparent)",
                filter: "blur(30px)",
                opacity: filmReady ? 0 : 1,
                scale: filmReady ? "1.35" : "1",
                transition: `opacity 1.2s ease-out ${c.d / 2}s, scale 1.6s ease-out ${c.d / 2}s`,
                willChange: "opacity, scale",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CinematicViewer;
