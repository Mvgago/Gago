import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { usePointerLight } from "../Light/PointerLight";
import { brandEnvironment, brandMetal, buildWordmark } from "../Monolith/wordmark3d";

/**
 * The FUGA wordmark as a sculpture, in real-time 3D.
 *
 * The bars of "Fuga" — the logo's exact flat-bar outline, extruded — are drawn as satin metal over a
 * brushed-steel backdrop with a soft shadow. Each section recomposes the letters like the voices of a
 * fugue: apart in depth, turning on themselves, fanning open. Clicking
 * holds the chosen composition while the camera steps slowly back.
 */

type Props = {
  /** Index into SECTIONS of the hovered section, or null at rest. */
  active: number | null;
  /** True once a section is clicked: the camera steps back as the light rises. */
  diving: boolean;
};

// Per-section compositions, one row per glyph: [dx, dy, dz, rotY, rotX].
// Index 0 is rest (the logo as drawn); 1–3 follow SECTIONS.
const LAYOUTS: number[][][] = [
  [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
  [[-0.4, 0.6, -1.4, 0.5, 0], [0, -0.2, 0.9, -0.3, 0], [0.3, 0.4, -0.6, 0.35, 0], [0.5, -0.5, 1.3, -0.5, 0]],
  [[0, 0, 0, 0, 1.2], [0, 0, 0, 0, -0.9], [0, 0, 0, 0, 0.7], [0, 0, 0, 0, -1.3]],
  // studio: unfolding outward, like a folding screen opening
  [[-0.55, 0, 0.2, 0.7, 0], [-0.18, 0, -0.1, 0.28, 0], [0.18, 0, -0.1, -0.28, 0], [0.55, 0, 0.2, -0.7, 0]],
];

/** A flat oval of light or shade lying on the floor, fading out to nothing at its rim. */
function floorGlow(inner: string, outer: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, inner);
  grad.addColorStop(1, outer);
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }),
  );
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

// Touch screens, at rest: logo → projects → logo → work → logo → studio…
const IDLE_CYCLE = [0, 1, 0, 2, 0, 3];

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
      // Transparent: the brushed-steel backdrop is a CSS gradient on the index behind it.
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      return;
    }
    // Touch screens are dense and small: 1.5× is indistinguishable and halves the pixels.
    const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, touch ? 1.5 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap; // soft, blurred penumbra
    renderer.domElement.style.display = "block";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // Same finish and reflections as the corner logo: one model, one material.
    const envTex = brandEnvironment(renderer);
    scene.environment = envTex;
    scene.environmentIntensity = 0.9;

    const camera = new THREE.PerspectiveCamera(28, 1, 0.05, 80);

    scene.add(new THREE.HemisphereLight("#fbf8f6", "#8f8579", 0.35));
    const key = new THREE.DirectionalLight("#ffffff", 1.1);
    // A high studio key, slightly in front: the letters' shadow falls almost straight
    // down, opening into the floor instead of stretching into a thin band.
    key.position.set(0.7, 6.5, 2.4);
    // The only shadow: each letter projected onto the floor, soft but still carrying
    // the shapes, so it follows the letters as they turn and recompose.
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.radius = 15;
    key.shadow.blurSamples = 24;
    key.shadow.bias = -0.0008;
    // Tight frustum around the piece (more shadow detail), still wider than the floor
    Object.assign(key.shadow.camera, { left: -4.5, right: 4.5, top: 4.5, bottom: -4.5, near: 1, far: 14 });
    scene.add(key);

    // The floor: invisible, it only shows what falls on it. The piece hovers just above it.
    const FLOOR_Y = -0.78;
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 5),
      new THREE.ShadowMaterial({ color: "#3e3640", opacity: 0.13 }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0, FLOOR_Y, -0.6);
    shadow.receiveShadow = true;
    scene.add(shadow);
    // Light pooling on the floor around the piece, so the shadow has a surface to land on
    const pool = floorGlow("rgba(255,255,255,0.55)", "rgba(255,255,255,0)");
    pool.position.set(0, FLOOR_Y - 0.002, -0.2);
    scene.add(pool);
    pool.renderOrder = 1;
    shadow.renderOrder = 2;
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
    // Set whenever the frame must be drawn even if nothing is moving (first frame, resize).
    let dirty = true;
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
      // Portrait: a narrower pool of light, so it fades out before the screen edges
      if (w / h < 1) pool.scale.set(3.1, 1.3, 1);
      else pool.scale.set(7.5, 3.2, 1);
      camera.updateProjectionMatrix();
      dirty = true;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // ── Loop ──────────────────────────────────────────────────────────
    // Slightly above the piece, so the floor (and what falls on it) opens up a little
    const camRest = new THREE.Vector3(0, 1.0, 9.5);
    // On click the camera eases back and up, as if stepping away from the piece.
    const camAway = new THREE.Vector3(0, 0.7, 3.2);
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
      // How far everything moved this frame; once it all settles, drawing stops.
      let motion = 0;
      const ease = (from: number, to: number, rate: number) => {
        const step = (to - from) * k(rate);
        motion += Math.abs(step);
        return from + step;
      };

      // Letters recompose for the hovered (or chosen) section and hold it.
      // Touch screens have no hover, so there the piece runs through the
      // compositions by itself, returning to the logo between each.
      const idle = touch && !reduced ? IDLE_CYCLE[Math.floor(t / 3.2) % IDLE_CYCLE.length] : 0;
      const L = LAYOUTS[a === null ? (isDiving ? 0 : idle) : a + 1];
      glyphs.forEach((h, i) => {
        const [dx, dy, dz, ry, rx] = L[i];
        const home = h.userData.home as THREE.Vector3;
        h.position.x = ease(h.position.x, home.x + dx, 2.4);
        h.position.y = ease(h.position.y, home.y + dy, 2.4);
        h.position.z = ease(h.position.z, home.z + dz, 2.4);
        h.rotation.y = ease(h.rotation.y, ry, 2.4);
        h.rotation.x = ease(h.rotation.x, rx, 2.4);
      });

      // The sculpture turns with the cursor, and sways slowly at rest.
      const sway = reduced || isDiving ? 0 : Math.sin(t * 0.35) * (touch ? 0.12 : 0.07);
      const turnY = isDiving ? 0 : nx.get() * 0.32 + sway;
      const turnX = isDiving ? 0 : ny.get() * 0.16;
      group.rotation.y = ease(group.rotation.y, turnY, 3);
      group.rotation.x = ease(group.rotation.x, turnX, 3);

      // Camera: at rest in front; on click it steps slowly back while the light rises.
      const nextDive = dive + ((isDiving ? 1 : 0) - dive) * (isDiving ? k(1.1) : 1);
      motion += Math.abs(nextDive - dive);
      dive = nextDive;
      camera.position.copy(camRest).addScaledVector(camAway, dive);
      look.set(0, lookY, 0);
      camera.lookAt(look);

      if (!document.hidden && (dirty || motion > 1e-5)) {
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
      mat.map?.dispose();
      mat.dispose();
      shadow.geometry.dispose();
      (shadow.material as THREE.Material).dispose();
      pool.geometry.dispose();
      pool.material.map?.dispose();
      pool.material.dispose();
      envTex.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [nx, ny]);

  return <div ref={host} aria-hidden className="absolute inset-0" />;
};

export default LogoSpace;
