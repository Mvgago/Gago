import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { usePointerLight } from "../Light/PointerLight";
import { brandEnvironment, brandMetal, buildWordmark } from "./wordmark3d";

/**
 * The corner logo, rendered from the same 3D model as the sculpture in the
 * index, in the brand's satin pearl. Small and nearly frontal, it turns a
 * few degrees with the cursor so the metal catches the light.
 *
 * The canvas is transparent and sized to the logo's own proportions.
 */

// Logo bounds in world units (from the wordmark's geometry, with a little air).
const BOUNDS = { w: 4.9, h: 1.55, cy: 0.07 };

const Logo3D: React.FC<{ className?: string }> = ({ className }) => {
  const host = useRef<HTMLDivElement>(null);
  const { nx, ny } = usePointerLight();

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio * 1.5, 3)); // extra density: it is small
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.display = "block";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const env = brandEnvironment(renderer);
    scene.environment = env;
    scene.environmentIntensity = 1.1;
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
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      // Distance at which the logo's height fills the frame
      const dist = BOUNDS.h / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      camera.position.set(0, 0, Math.max(dist, BOUNDS.w / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / camera.aspect));
      camera.updateProjectionMatrix();
    };
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
      mark.group.rotation.y += (nx.get() * 0.32 - mark.group.rotation.y) * k;
      mark.group.rotation.x += (ny.get() * 0.18 - mark.group.rotation.x) * k;
      if (!document.hidden) renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mark.dispose();
      material.dispose();
      env.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [nx, ny]);

  return (
    <div
      ref={host}
      role="img"
      aria-label="Fuga Haus"
      className={className}
      style={{ aspectRatio: `${BOUNDS.w} / ${BOUNDS.h}` }}
    />
  );
};

export default Logo3D;
