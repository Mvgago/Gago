import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { usePointerLight } from "./PointerLight";

/**
 * A white room, as the opening of the light pages: a curved wall of satin white
 * wrapping the view, a fine line of light set high into it and another at the
 * skirting, a glossy floor that truly reflects, and a white haze that carries
 * the space away into the light. Not an object: the place itself.
 *
 * The camera leans a little with the cursor. It draws only when something moves,
 * and stays still for reduced motion.
 */

const WHITE = new THREE.Color("#f4f3f2");

/** A flat band following the curved wall: a line of light set into it */
function lightBand(radius: number, y: number, height: number, arc: number): THREE.Mesh {
  const geo = new THREE.CylinderGeometry(radius, radius, height, 160, 1, true, Math.PI - arc / 2, arc);
  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({ color: "#ffffff", side: THREE.BackSide, toneMapped: false }),
  );
  mesh.position.y = y;
  return mesh;
}

/** A soft glow around a band, faking the light spilling onto the wall */
function glowBand(radius: number, y: number, height: number, arc: number, strength: number): THREE.Mesh {
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, "rgba(255,255,255,0)");
  grad.addColorStop(0.5, `rgba(255,255,255,${strength})`);
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 4, 128);
  const tex = new THREE.CanvasTexture(c);
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius - 0.01, radius - 0.01, height, 160, 1, true, Math.PI - arc / 2, arc),
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      toneMapped: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  mesh.position.y = y;
  return mesh;
}

const WhiteRoom: React.FC<{ className?: string }> = ({ className = "" }) => {
  const host = useRef<HTMLDivElement>(null);
  const { nx, ny } = usePointerLight();

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      return; // no WebGL: the plain wall stays
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    Object.assign(renderer.domElement.style, { display: "block", width: "100%", height: "100%" });
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = WHITE;
    // White haze: the far side of the room dissolves into light
    scene.fog = new THREE.Fog(WHITE, 9, 22);

    scene.add(new THREE.HemisphereLight("#ffffff", "#d9d6d2", 1.6));
    const key = new THREE.DirectionalLight("#ffffff", 0.9);
    key.position.set(-3, 6, 4);
    scene.add(key);

    const R = 9; // radius of the curved wall
    const ARC = Math.PI * 1.15;
    const HEIGHT = 6.4;

    // The curved wall, satin white
    const wall = new THREE.Mesh(
      new THREE.CylinderGeometry(R, R, HEIGHT, 200, 1, true, Math.PI - ARC / 2, ARC),
      new THREE.MeshStandardMaterial({ color: "#f1efed", roughness: 0.55, metalness: 0, side: THREE.BackSide }),
    );
    wall.position.y = HEIGHT / 2;
    scene.add(wall);

    // Ceiling, a touch darker so the room has a lid
    const ceiling = new THREE.Mesh(
      new THREE.CircleGeometry(R, 120),
      new THREE.MeshStandardMaterial({ color: "#f2f1ef", emissive: "#e9e7e5", roughness: 0.9 }),
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = HEIGHT;
    scene.add(ceiling);

    // Lines of light set into the wall: one at eye level, one at the skirting (a cove)
    const bands = [lightBand(R - 0.02, 3.6, 0.035, ARC * 0.96), lightBand(R - 0.02, 0.05, 0.04, ARC * 0.98)];
    const glows = [glowBand(R, 3.6, 0.9, ARC * 0.96, 0.32), glowBand(R, 0.25, 0.7, ARC * 0.98, 0.4)];
    [...bands, ...glows].forEach((m) => scene.add(m));

    // The floor: a true mirror, under a veil of white so it reads as polished resin
    const mirror = new Reflector(new THREE.CircleGeometry(R, 120), {
      textureWidth: 1024,
      textureHeight: 1024,
      color: new THREE.Color("#c9c7c5"),
    });
    mirror.rotation.x = -Math.PI / 2;
    scene.add(mirror);
    const veil = new THREE.Mesh(
      new THREE.CircleGeometry(R, 120),
      new THREE.MeshStandardMaterial({ color: "#f3f2f0", roughness: 0.4, transparent: true, opacity: 0.72 }),
    );
    veil.rotation.x = -Math.PI / 2;
    veil.position.y = 0.002;
    scene.add(veil);

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
    const look = new THREE.Vector3(0, 1.9, -8);

    const fit = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      dirty = true;
    };
    let dirty = true;
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);

    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(el);

    const cam = new THREE.Vector3(0, 1.6, 7.6);
    let last = performance.now();
    let raf = 0;
    const tick = () => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const k = reduced ? 1 : 1 - Math.exp(-dt * 1.6);
      const tx = reduced ? 0 : nx.get() * 0.55;
      const ty = reduced ? 1.6 : 1.6 - ny.get() * 0.2;
      const step = Math.abs(tx - cam.x) + Math.abs(ty - cam.y);
      cam.x += (tx - cam.x) * k;
      cam.y += (ty - cam.y) * k;
      if (visible && !document.hidden && (dirty || step > 1e-4)) {
        camera.position.copy(cam);
        camera.lookAt(look);
        renderer.render(scene, camera);
        dirty = false;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          const m = o.material as THREE.MeshBasicMaterial;
          m.map?.dispose();
          m.dispose();
        }
      });
      mirror.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [nx, ny]);

  return <div ref={host} aria-hidden className={className} />;
};

export default WhiteRoom;
