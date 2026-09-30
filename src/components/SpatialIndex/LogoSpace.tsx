import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { usePointerLight } from "../Light/PointerLight";
import { brandEnvironment, brandMetal, buildWordmark } from "../Monolith/wordmark3d";

/**
 * The FUGA wordmark as a sculpture, in real-time 3D.
 *
 * The bars of "Fuga" — the logo's exact flat-bar outline, extruded — are drawn as satin white metal in an infinite white studio with a
 * soft shadow. Each section recomposes the letters like the voices of a
 * fugue: apart in depth, turning on themselves, fanning open. Clicking
 * realigns them and the camera passes through the gap between "u" and "g".
 */

type Props = {
  /** Index into SECTIONS of the hovered section, or null at rest. */
  active: number | null;
  /** True once a section is clicked: the camera passes through the letters. */
  diving: boolean;
};

const BG = new THREE.Color("#f3f2f5");

const toV = (x: number, y: number) => new THREE.Vector3((x - 945) / 300, -(y - 900) / 300, 0);

// Per-section compositions, one row per glyph: [dx, dy, dz, rotY, rotX].
// Index 0 is rest (the logo as drawn); 1–3 follow SECTIONS.
const LAYOUTS: number[][][] = [
  [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
  [[-0.4, 0.6, -1.4, 0.5, 0], [0, -0.2, 0.9, -0.3, 0], [0.3, 0.4, -0.6, 0.35, 0], [0.5, -0.5, 1.3, -0.5, 0]],
  [[0, 0, 0, 0, 1.2], [0, 0, 0, 0, -0.9], [0, 0, 0, 0, 0.7], [0, 0, 0, 0, -1.3]],
  // studio: unfolding outward, like a folding screen opening
  [[-0.55, 0, 0.2, 0.7, 0], [-0.18, 0, -0.1, 0.28, 0], [0.18, 0, -0.1, -0.28, 0], [0.55, 0, 0.2, -0.7, 0]],
];

const LogoSpace: React.FC<Props> = ({ active, diving }) => {
  const host = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const divingRef = useRef(diving);
  const { nx, ny } = usePointerLight();

  activeRef.current = active;
  divingRef.current = diving;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── Renderer & studio ─────────────────────────────────────────────
    // No WebGL: the index still works, just without the sculpture.
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap; // soft, blurred penumbra
    renderer.domElement.style.display = "block";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = BG;
    // Same finish and reflections as the corner logo: one model, one material.
    const envTex = brandEnvironment(renderer);
    scene.environment = envTex;
    scene.environmentIntensity = 0.9;

    const camera = new THREE.PerspectiveCamera(28, 1, 0.05, 80);

    scene.add(new THREE.HemisphereLight("#fbf8f6", "#8f8579", 0.35));
    const key = new THREE.DirectionalLight("#ffffff", 1.1);
    key.position.set(0.8, 4.6, 4.6); // a studio key at ~45°: the letters' shapes fall softly onto the floor behind them
    // A real cast shadow: each letter projected onto the floor, very soft,
    // so it follows the letters as they recompose.
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.radius = 22;
    key.shadow.blurSamples = 24;
    key.shadow.bias = -0.0008;
    // Frustum much wider than the floor, so its edge never shows
    Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 25 });
    scene.add(key);

    // Floor that only shows the cast shadow
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 5),
      new THREE.ShadowMaterial({ color: "#4a4048", opacity: 0.22 }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0, -0.55, -1.2);
    shadow.receiveShadow = true;
    scene.add(shadow);
    // ── The wordmark ──────────────────────────────────────────────────
    const mat = brandMetal();
    const group = new THREE.Group();
    group.scale.setScalar(0.62);
    group.position.y = 0.2;
    scene.add(group);

    const mark = buildWordmark(mat);
    group.add(mark.group);
    const glyphs = mark.glyphs;
    // ── Sizing ────────────────────────────────────────────────────────
    let lookY = 0;
    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      // Portrait screens: widen the lens so the whole word fits
      camera.fov = w / h < 1 ? 50 : 28;
      // Portrait: aim below the piece so it rides in the upper third, clear of the stacked labels
      lookY = w / h < 1 ? -1.1 : 0;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // ── Loop ──────────────────────────────────────────────────────────
    // The gap between "u" and "g", in world space, for the pass-through.
    const gapPoint = toV(922, 870).multiplyScalar(0.62).add(new THREE.Vector3(0, 0.2, 0));
    const camRest = new THREE.Vector3(0, 0.3, 9.5);
    const camPos = camRest.clone();
    const look = new THREE.Vector3();
    let dive = 0;
    let last = performance.now();
    const start = last;
    let raf = 0;

    const tick = () => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = (now - start) / 1000;
      const k = (rate: number) => (reduced ? 1 : 1 - Math.exp(-dt * rate));
      const a = activeRef.current;
      const isDiving = divingRef.current;

      // Letters recompose for the hovered section; on click they realign.
      const L = LAYOUTS[isDiving || a === null ? 0 : a + 1];
      glyphs.forEach((h, i) => {
        const [dx, dy, dz, ry, rx] = L[i];
        const home = h.userData.home as THREE.Vector3;
        h.position.x += (home.x + dx - h.position.x) * k(2.4);
        h.position.y += (home.y + dy - h.position.y) * k(2.4);
        h.position.z += (home.z + dz - h.position.z) * k(2.4);
        h.rotation.y += (ry - h.rotation.y) * k(2.4);
        h.rotation.x += (rx - h.rotation.x) * k(2.4);
      });

      // The sculpture turns with the cursor, and sways slowly at rest.
      const sway = reduced || isDiving ? 0 : Math.sin(t * 0.35) * 0.07;
      const turnY = isDiving ? 0 : nx.get() * 0.32 + sway;
      const turnX = isDiving ? 0 : ny.get() * 0.16;
      group.rotation.y += (turnY - group.rotation.y) * k(3);
      group.rotation.x += (turnX - group.rotation.x) * k(3);

      // Camera: at rest in front; on click it flies through the u–g gap.
      dive += ((isDiving ? 1 : 0) - dive) * (isDiving ? k(1.3) : 1);
      const through = gapPoint.clone().setZ(-3);
      camPos.lerpVectors(camRest, through, dive * dive);
      camera.position.copy(camPos);
      look.lerpVectors(new THREE.Vector3(0, lookY, 0), gapPoint.clone().setZ(-10), dive);
      camera.lookAt(look);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mark.dispose();
      mat.map?.dispose();
      mat.dispose();
      shadow.geometry.dispose();
      (shadow.material as THREE.Material).dispose();
      envTex.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [nx, ny]);

  return <div ref={host} aria-hidden className="absolute inset-0" />;
};

export default LogoSpace;
