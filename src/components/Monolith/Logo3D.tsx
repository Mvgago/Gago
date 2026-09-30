import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { usePointerLight } from "../Light/PointerLight";
import { brandEnvironment, brandMetal, buildWordmark } from "./wordmark3d";
import { Monolith } from "./Monolith";

/**
 * The corner logo, rendered from the same 3D model as the sculpture in the
 * index, in the brand's satin pearl. Small and nearly frontal, it turns a
 * few degrees with the cursor so the metal catches the light.
 *
 * The canvas is transparent and sized to the logo's own proportions.
 */

// Logo bounds in world units (from the wordmark's geometry, with a little air).
const BOUNDS = { w: 4.9, h: 1.55, cy: 0.07 };
/** The canvas overhangs the logo's box by this factor, so the turning letters never clip. */
const BLEED = 1.4;

type Props = {
  className?: string;
  /** Stop drawing while hidden (e.g. behind the open index). */
  paused?: boolean;
};

const Logo3D: React.FC<Props> = ({ className, paused = false }) => {
  const host = useRef<HTMLDivElement>(null);
  const [noWebGL, setNoWebGL] = useState(false);
  const { nx, ny } = usePointerLight();
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // No WebGL (old device, disabled GPU): keep the 2D mark rather than an empty corner.
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setNoWebGL(true);
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio * 1.5, 3)); // extra density: it is small
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // Canvas overhangs the box on every side; the logo itself stays exactly in its slot.
    Object.assign(renderer.domElement.style, {
      display: "block",
      position: "absolute",
      left: `${(-(BLEED - 1) / 2) * 100}%`,
      top: `${(-(BLEED - 1) / 2) * 100}%`,
      width: `${BLEED * 100}%`,
      height: `${BLEED * 100}%`,
      pointerEvents: "none",
    });
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const env = brandEnvironment(renderer);
    scene.environment = env;
    scene.environmentIntensity = 0.9;
    scene.add(new THREE.HemisphereLight("#fbf8f6", "#8f8579", 0.35));
    const key = new THREE.DirectionalLight("#ffffff", 1.1);
    key.position.set(1.2, 5, 4);
    scene.add(key);

    const material = brandMetal();
    const mark = buildWordmark(material);
    mark.group.position.y = -BOUNDS.cy;
    scene.add(mark.group);

    // A long lens so the small logo reads nearly flat, with just enough depth.
    const camera = new THREE.PerspectiveCamera(12, BOUNDS.w / BOUNDS.h, 0.1, 100);
    const fit = () => {
      const w = el.clientWidth * BLEED;
      const h = el.clientHeight * BLEED;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Distance at which the logo fills the inner box (the canvas minus its bleed)
      const half = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      camera.position.set(0, 0, (BOUNDS.h * BLEED) / 2 / half);
      camera.updateProjectionMatrix();
      dirty = true;
    };
    // Set whenever the frame must be drawn even if the logo is still (first frame, resize).
    let dirty = true;
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);

    let last = performance.now();
    let raf = 0;
    const tick = () => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const k = reduced ? 1 : 1 - Math.exp(-dt * 2.5);
      const stepY = (nx.get() * 0.26 - mark.group.rotation.y) * k;
      const stepX = (ny.get() * 0.18 - mark.group.rotation.x) * k;
      mark.group.rotation.y += stepY;
      mark.group.rotation.x += stepX;
      // Draw only while it turns (on touch screens it is nearly always still).
      const moving = Math.abs(stepY) + Math.abs(stepX) > 1e-5;
      if (!document.hidden && !pausedRef.current && (dirty || moving)) {
        renderer.render(scene, camera);
        dirty = false;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mark.dispose();
      material.map?.dispose();
      material.dispose();
      env.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [nx, ny]);

  if (noWebGL) return <Monolith tilt={false} tone="warm" reveal={false} className={className} />;

  return (
    <div
      ref={host}
      role="img"
      aria-label="Fuga Haus"
      className={`relative ${className ?? ""}`}
      style={{ aspectRatio: `${BOUNDS.w} / ${BOUNDS.h}` }}
    />
  );
};

export default Logo3D;
