import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass.js";

/**
 * A stand for an invented Galician cannery, Brétema, at a gourmet fair: the example of the
 * "spaces and events" discipline on the studio page. The same light pavilion as the smart hc
 * stand, and on it a wall of tins set as a mosaic in diagonal bands of colour, a tasting
 * counter faced in blue-and-white tiles, pendant lamps and an oak floor. It turns slowly on
 * its own; nothing on it to read but the brand.
 */

const NAVY = "#1f3550";
const CREAM = "#f1e7d2";
const BG_FAR = "#c9cdce";
const BG = "#a9b8ba";
const SERIF = '"Times New Roman", Georgia, serif';

// The tins' labels: colour, ink and product, in the order the mosaic's bands run
const LABELS = [
  { bg: "#1f3550", ink: "#f1e7d2", accent: "#e2a93b", name: "Sardinillas" },
  { bg: "#2f7f86", ink: "#f4ecdb", accent: "#f1e7d2", name: "Mejillones" },
  { bg: "#8fb5c6", ink: "#1f3550", accent: "#1f3550", name: "Berberechos" },
  { bg: "#f1e7d2", ink: "#1f3550", accent: "#d9583b", name: "Zamburiñas" },
  { bg: "#e2a93b", ink: "#1f3550", accent: "#1f3550", name: "Ventresca" },
  { bg: "#d9583b", ink: "#f8efe0", accent: "#f1e7d2", name: "Pulpo" },
];

// Near eye level, as the photographed people were taken, so they stand on the floor with the camera
const VIEW = { pos: [4.0, 2.1, 9.4] as [number, number, number], look: [0.1, 1.35, 0] as [number, number, number] };

async function build(host: HTMLDivElement, onReady: () => void, paused: { current: boolean } = { current: false }): Promise<() => void> {
  document.fonts.load("300 100px Jura").catch(() => {});
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.display = "block";
  host.appendChild(renderer.domElement);
  const aniso = renderer.capabilities.getMaxAnisotropy();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG_FAR);
  scene.fog = new THREE.Fog(BG_FAR, 30, 95);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
  scene.environmentIntensity = 0.22;

  // the near plane well out from the lens: depth stays precise down at the floor's thin layers
  const camera = new THREE.PerspectiveCamera(36, 1, 0.3, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableRotate = false; // it turns on its own here; the page keeps the pointer

  /* ---------- textures ---------- */
  const canvas = (w: number, h: number) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return [c, c.getContext("2d")!] as const;
  };
  const tex = (c: HTMLCanvasElement) => {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = aniso;
    return t;
  };
  // A sardine, drawn as the brand draws it: a long body with its belly fuller than its back (no
  // dorsal fin: drawn alone it read as a shark's), the forked tail, the gill cover, an eye with its
  // pupil, the lateral line and a row of spots along the flank. With `line` it is drawn in strokes of one ink (the logo); without, filled
  // (the labels)
  const fish = (x: CanvasRenderingContext2D, cx: number, cy: number, len: number, col: string, line = 0) => {
    const L = len / 2, h = len * 0.19;
    const lw = line || len * 0.008;
    const ink = line ? col : "rgba(255,255,255,0.55)";
    x.save();
    x.translate(cx, cy);
    x.lineCap = "round";
    x.lineJoin = "round";
    // the body, to the narrow of the tail
    const body = () => {
      x.beginPath();
      x.moveTo(-L, h * 0.06);
      x.bezierCurveTo(-L * 0.8, -h * 0.95, L * 0.2, -h * 1.0, L * 0.7, -h * 0.2);
      x.lineTo(L * 0.74, h * 0.2);
      x.bezierCurveTo(L * 0.2, h * 1.12, -L * 0.75, h * 1.0, -L, h * 0.06);
      x.closePath();
    };
    // the forked tail, its lobes curving out
    const tail = () => {
      x.beginPath();
      x.moveTo(L * 0.68, -h * 0.16);
      x.quadraticCurveTo(L * 0.86, -h * 0.5, L, -h * 0.95);
      x.quadraticCurveTo(L * 0.9, -h * 0.25, L * 0.88, 0);
      x.quadraticCurveTo(L * 0.9, h * 0.25, L, h * 0.95);
      x.quadraticCurveTo(L * 0.86, h * 0.5, L * 0.72, h * 0.18);
      x.closePath();
    };
    tail();
    if (line) {
      x.strokeStyle = col;
      x.lineWidth = lw;
      x.stroke();
    } else {
      x.fillStyle = col;
      x.fill();
    }
    body();
    if (line) {
      x.strokeStyle = col;
      x.lineWidth = lw;
      x.stroke();
    } else {
      // the back darker than the silver belly
      const g = x.createLinearGradient(0, -h, 0, h);
      g.addColorStop(0, col);
      g.addColorStop(0.55, col);
      g.addColorStop(1, "rgba(255,255,255,0.35)");
      x.fillStyle = col;
      x.fill();
      x.fillStyle = g;
      x.fill();
    }
    // the lateral line and the spots along the flank
    x.strokeStyle = ink;
    x.lineWidth = lw * 0.7;
    x.beginPath();
    x.moveTo(-L * 0.62, -h * 0.28);
    x.bezierCurveTo(-L * 0.2, -h * 0.42, L * 0.3, -h * 0.3, L * 0.7, -h * 0.02);
    x.stroke();
    x.fillStyle = line ? col : "rgba(20,30,45,0.45)";
    for (let k = 0; k < 6; k++) {
      x.beginPath();
      x.arc(-L * 0.42 + k * L * 0.14, -h * (0.5 - k * 0.04), len * (0.011 - k * 0.0008), 0, 7);
      x.fill();
    }
    // the gill cover
    x.strokeStyle = ink;
    x.lineWidth = lw;
    x.beginPath();
    x.moveTo(-L * 0.6, -h * 0.72);
    x.quadraticCurveTo(-L * 0.47, h * 0.05, -L * 0.6, h * 0.78);
    x.stroke();
    // the eye: a ring, the pupil and a point of light
    const ex = -L * 0.8, ey = -h * 0.18, er = len * 0.026;
    x.fillStyle = line ? "rgba(0,0,0,0)" : "rgba(255,255,255,0.92)";
    x.beginPath();
    x.arc(ex, ey, er, 0, 7);
    x.fill();
    x.strokeStyle = ink;
    x.lineWidth = lw * 0.8;
    x.stroke();
    x.fillStyle = line ? col : "#141c27";
    x.beginPath();
    x.arc(ex + er * 0.12, ey, er * 0.55, 0, 7);
    x.fill();
    x.fillStyle = "rgba(255,255,255,0.9)";
    x.beginPath();
    x.arc(ex - er * 0.12, ey - er * 0.22, er * 0.18, 0, 7);
    x.fill();
    x.restore();
  };
  const label = (l: (typeof LABELS)[number]) => {
    const [c, x] = canvas(512, 332);
    x.fillStyle = l.bg;
    x.fillRect(0, 0, 512, 332);
    x.strokeStyle = l.accent;
    x.lineWidth = 6;
    x.strokeRect(18, 18, 476, 296);
    x.lineWidth = 2;
    x.strokeRect(30, 30, 452, 272);
    fish(x, 256, 150, 250, l.accent);
    x.fillStyle = l.ink;
    x.textAlign = "center";
    x.font = `600 30px ${SERIF}`;
    x.fillText("BRÉTEMA", 256, 74);
    x.font = `italic 40px ${SERIF}`;
    x.fillText(l.name, 256, 252);
    x.font = `400 17px ${SERIF}`;
    x.fillText("EN ACEITE DE OLIVA · RÍA DE AROUSA", 256, 284);
    return tex(c);
  };
  // Blue-and-white tiles for the counter's face, 4 × 4 to a sheet, with their grout
  const tiles = (() => {
    const S = 1024, T = S / 4, [c, x] = canvas(S, S);
    x.fillStyle = "#c9c4b8";
    x.fillRect(0, 0, S, S);
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++) {
        const ox = i * T, oy = j * T;
        x.fillStyle = "#f4f1ea";
        x.fillRect(ox + 4, oy + 4, T - 8, T - 8);
        x.strokeStyle = "#24508f";
        x.fillStyle = "#24508f";
        x.lineWidth = 6;
        const cx = ox + T / 2, cy = oy + T / 2;
        // quarter circles at the corners, so four tiles make a ring
        [[ox, oy], [ox + T, oy], [ox, oy + T], [ox + T, oy + T]].forEach(([qx, qy]) => {
          x.beginPath();
          x.arc(qx, qy, T * 0.32, 0, 7);
          x.stroke();
        });
        // a four-petal flower in the middle
        for (let k = 0; k < 4; k++) {
          x.save();
          x.translate(cx, cy);
          x.rotate((k * Math.PI) / 2);
          x.beginPath();
          x.ellipse(0, -T * 0.13, T * 0.06, T * 0.13, 0, 0, 7);
          x.fill();
          x.restore();
        }
        x.fillStyle = "#f4f1ea";
        x.beginPath();
        x.arc(cx, cy, T * 0.04, 0, 7);
        x.fill();
      }
    const t = tex(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  })();
  // Light oak boards for the stand's floor: 1 unit of texture = 2 m
  const oak = (() => {
    const S = 1024, [c, x] = canvas(S, S);
    const boardW = S / 10;
    for (let b = 0; b < 10; b++) {
      let y = -Math.random() * S;
      while (y < S) {
        const len = S * (0.4 + Math.random() * 0.5);
        const tone = 186 + Math.random() * 22;
        x.fillStyle = `rgb(${tone},${tone * 0.8},${tone * 0.58})`;
        x.fillRect(b * boardW, y, boardW, len);
        for (let g = 0; g < 14; g++) {
          x.strokeStyle = `rgba(120,84,50,${0.05 + Math.random() * 0.08})`;
          x.lineWidth = 1 + Math.random() * 2;
          const gx = b * boardW + Math.random() * boardW;
          x.beginPath();
          x.moveTo(gx, y);
          x.bezierCurveTo(gx + 6, y + len * 0.3, gx - 6, y + len * 0.7, gx + 2, y + len);
          x.stroke();
        }
        x.fillStyle = "rgba(70,48,28,0.35)";
        x.fillRect(b * boardW, y, boardW, 2);
        y += len;
      }
      x.fillStyle = "rgba(70,48,28,0.3)";
      x.fillRect(b * boardW, 0, 2, S);
    }
    const t = tex(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(0.5, 0.5);
    return t;
  })();
  // The brand's sign for the canopy and the side wall
  const brandSheet = (w: number, h: number, ink: string, withFish: boolean, sub = true, layout = { fishY: 0.3, fishLen: 0.62, textY: 0.62 }) => {
    const [c, x] = canvas(w, h);
    x.fillStyle = ink;
    x.textAlign = "center";
    const big = h * (withFish ? 0.16 : 0.5);
    if (withFish) fish(x, w / 2, h * layout.fishY, w * layout.fishLen, ink, w * 0.006);
    x.font = `600 ${big}px ${SERIF}`;
    const ty = withFish ? h * layout.textY : h * 0.58;
    // set wide, as the brand's letters are
    const word = "BRÉTEMA".split("").join(String.fromCharCode(8202));
    x.fillText(word, w / 2, ty);
    if (sub) {
      x.font = `italic ${big * 0.32}px ${SERIF}`;
      x.fillText("conservas da ría · desde 1924", w / 2, ty + big * 0.55);
    }
    return tex(c);
  };

  /* ---------- materials ---------- */
  const P = 0.12;
  const m = {
    oak: new THREE.MeshStandardMaterial({ map: oak, roughness: 0.55 }),
    oakSolid: new THREE.MeshStandardMaterial({ color: "#c79c6e", roughness: 0.5 }),
    navy: new THREE.MeshPhysicalMaterial({ color: NAVY, roughness: 0.4, clearcoat: 0.5, clearcoatRoughness: 0.25 }),
    plaster: new THREE.MeshStandardMaterial({ color: "#e6ddcc", roughness: 0.92 }),
    marble: new THREE.MeshPhysicalMaterial({ color: "#f3f1ec", roughness: 0.18, clearcoat: 0.6 }),
    tile: new THREE.MeshPhysicalMaterial({ map: tiles, roughness: 0.15, clearcoat: 0.8, clearcoatRoughness: 0.08 }),
    tin: new THREE.MeshStandardMaterial({ color: "#d4d8da", roughness: 0.28, metalness: 0.9 }),
    ledWarm: new THREE.MeshStandardMaterial({ color: "#000", emissive: "#ffe2bd", emissiveIntensity: 1.1 }),
    opal: new THREE.MeshStandardMaterial({ color: "#fff6ea", emissive: "#ffdcae", emissiveIntensity: 1.6, roughness: 0.4 }),
    chrome: new THREE.MeshStandardMaterial({ color: "#c9ced1", roughness: 0.18, metalness: 0.95 }),
    glass: new THREE.MeshPhysicalMaterial({ color: "#eef3f1", roughness: 0.05, transmission: 0.9, thickness: 0.02, ior: 1.5, transparent: true }),
    bottle: new THREE.MeshPhysicalMaterial({ color: "#3d5b3a", roughness: 0.08, transmission: 0.55, thickness: 0.05, transparent: true }),
    graphite: new THREE.MeshPhysicalMaterial({ color: "#2b2f33", roughness: 0.25, clearcoat: 0.6 }),
  };
  const add = <T extends THREE.Object3D>(o: T, shadow = true) => {
    o.traverse((c) => {
      if ((c as THREE.Mesh).isMesh) {
        c.castShadow = shadow;
        c.receiveShadow = true;
      }
    });
    scene.add(o);
    return o;
  };
  const box = (w: number, h: number, d: number, mat: THREE.Material | THREE.Material[], x: number, y: number, z: number, shadow = true) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    b.position.set(x, y, z);
    return add(b, shadow);
  };
  const decal = (t: THREE.Texture, w: number, h: number, pos: [number, number, number], rotY = 0, glow = 0) => {
    const p = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.5, emissive: glow ? "#ffffff" : "#000000", emissiveMap: glow ? t : null, emissiveIntensity: glow }),
    );
    p.position.set(...pos);
    p.rotation.y = rotY;
    p.receiveShadow = true;
    scene.add(p);
    return p;
  };
  const roundedRect = (w: number, d: number, r: [number, number, number, number]) => {
    const s = new THREE.Shape();
    const x0 = -w / 2, z0 = -d / 2;
    const [rbl, rbr, rfr, rfl] = r;
    s.moveTo(x0 + rbl, z0);
    s.lineTo(x0 + w - rbr, z0);
    s.quadraticCurveTo(x0 + w, z0, x0 + w, z0 + rbr);
    s.lineTo(x0 + w, z0 + d - rfr);
    s.quadraticCurveTo(x0 + w, z0 + d, x0 + w - rfr, z0 + d);
    s.lineTo(x0 + rfl, z0 + d);
    s.quadraticCurveTo(x0, z0 + d, x0, z0 + d - rfl);
    s.lineTo(x0, z0 + rbl);
    s.quadraticCurveTo(x0, z0, x0 + rbl, z0);
    return s;
  };
  const slab = (shape: THREE.Shape, h: number, mat: THREE.Material | THREE.Material[], y: number) => {
    const g = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2, curveSegments: 32 });
    g.rotateX(Math.PI / 2);
    g.translate(0, y + h, 0);
    return add(new THREE.Mesh(g, mat));
  };

  /* ---------- the hall: the same light pavilion as the smart hc stand ---------- */
  const HX = 30, HZ0 = -22, HZ1 = 28, HH = 12;
  const HW = HX * 2, HD = HZ1 - HZ0, HCZ = (HZ0 + HZ1) / 2;
  {
    const S = 512, [c, x] = canvas(S, S);
    x.fillStyle = "#b9bab8";
    x.fillRect(0, 0, S, S);
    const img = x.getImageData(0, 0, S, S), d = img.data;
    for (let k = 0; k < d.length; k += 4) {
      const n = (Math.random() - 0.5) * 36 + (Math.random() > 0.985 ? 24 : 0);
      d[k] += n * 0.92; d[k + 1] += n * 0.97; d[k + 2] += n;
    }
    x.putImageData(img, 0, 0);
    const t = tex(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(HW / 4, HD / 4);
    const hall = new THREE.Mesh(new THREE.PlaneGeometry(HW, HD), new THREE.MeshStandardMaterial({ map: t, roughness: 1 }));
    hall.rotation.x = -Math.PI / 2;
    hall.position.set(0, 0.002, HCZ);
    hall.receiveShadow = true;
    scene.add(hall);
  }
  const cladding = (len: number) => {
    const PX = 24, W = Math.round(len * PX), H = HH * PX, plinth = H - 2.4 * PX;
    const [c, x] = canvas(W, H);
    const g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#d3d6d7");
    g.addColorStop(plinth / H, "#dfe1e1");
    g.addColorStop(plinth / H, "#c4c7c7");
    g.addColorStop(1, "#bcbfbf");
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);
    for (let px = 2.5 * PX; px < W; px += 5 * PX) {
      x.save();
      x.translate(px, 0);
      x.scale(1, 1.9);
      const r = 2.6 * PX, wg = x.createRadialGradient(0, 0, 0, 0, 0, r);
      wg.addColorStop(0, "rgba(255,228,196,0.42)");
      wg.addColorStop(0.55, "rgba(255,228,196,0.14)");
      wg.addColorStop(1, "rgba(255,228,196,0)");
      x.fillStyle = wg;
      x.fillRect(-r, 0, r * 2, r);
      x.restore();
    }
    x.fillStyle = "rgba(45,48,48,0.28)";
    for (let px = 0; px < W; px += 3 * PX) x.fillRect(px, 0, 1, plinth);
    x.fillRect(0, H - 6 * PX, W, 1);
    x.fillStyle = "rgba(30,32,32,0.45)";
    x.fillRect(0, plinth, W, 2);
    return tex(c);
  };
  const wall = (w: number, x: number, z: number, rotY: number) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, HH), new THREE.MeshStandardMaterial({ map: cladding(w), roughness: 0.9, color: "#d3d6d7" }));
    p.position.set(x, HH / 2, z);
    p.rotation.y = rotY;
    scene.add(p);
  };
  wall(HW, 0, HZ0, 0);
  wall(HW, 0, HZ1, Math.PI);
  wall(HD, -HX, HCZ, Math.PI / 2);
  wall(HD, HX, HCZ, -Math.PI / 2);
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(HW, HD), new THREE.MeshStandardMaterial({ color: "#d0d3d4", roughness: 1 }));
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, HH, HCZ);
  scene.add(ceiling);
  const steel = new THREE.MeshStandardMaterial({ color: "#aab2b5", roughness: 0.5, metalness: 0.4 });
  for (let z = HZ0 + 5; z < HZ1; z += 10) {
    box(0.6, HH, 0.6, steel, -HX + 0.3, HH / 2, z, false);
    box(0.6, HH, 0.6, steel, HX - 0.3, HH / 2, z, false);
  }
  for (let x = -HX + 10; x < HX; x += 10) box(0.6, HH, 0.6, steel, x, HH / 2, HZ0 + 0.3, false);
  const TOP = HH - 0.5, BOT = HH - 1.7, STEP = 1.2;
  const trussZ: number[] = [];
  for (let z = HZ0 + 4; z < HZ1; z += 8) trussZ.push(z);
  {
    const trussMat = new THREE.MeshStandardMaterial({ color: "#a7b0b3", roughness: 0.55, metalness: 0.4 });
    const webCount = Math.ceil(HW / STEP);
    const web = new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, 1, 0.07), trussMat, trussZ.length * webCount);
    const tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpS = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    let wi = 0;
    trussZ.forEach((z) => {
      box(HW, 0.14, 0.14, trussMat, 0, TOP, z, false);
      box(HW, 0.14, 0.14, trussMat, 0, BOT, z, false);
      for (let k = 0; k < webCount; k++) {
        const x0 = -HX + k * STEP, x1 = x0 + STEP;
        const a = new THREE.Vector3(x0, k % 2 ? TOP : BOT, z), b = new THREE.Vector3(x1, k % 2 ? BOT : TOP, z);
        const dir = b.clone().sub(a), len = dir.length();
        tmpQ.setFromUnitVectors(up, dir.normalize());
        tmpS.set(1, len, 1);
        tmpM.compose(a.clone().add(b).multiplyScalar(0.5), tmpQ, tmpS);
        web.setMatrixAt(wi++, tmpM);
      }
    });
    scene.add(web);
    const lampBody = new THREE.MeshStandardMaterial({ color: "#2a2f31", roughness: 0.45, metalness: 0.5 });
    const lamp = new THREE.MeshStandardMaterial({ color: "#000", emissive: "#ffe6c4", emissiveIntensity: 1.2 });
    for (const z of trussZ)
      for (let x = -HX + 7.5; x < HX; x += 7.5) {
        const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.5, 0.35, 24, 1, true), lampBody);
        hood.position.set(x, BOT - 0.45, z);
        const glow = new THREE.Mesh(new THREE.CircleGeometry(0.46, 24), lamp);
        glow.rotation.x = Math.PI / 2;
        glow.position.set(x, BOT - 0.62, z);
        scene.add(hood, glow);
      }
  }
  // The pavilion's number on the back wall
  {
    const [c, x] = canvas(512, 768);
    x.fillStyle = "rgba(52,60,63,0.78)";
    x.font = "500 64px Jura, sans-serif";
    x.textAlign = "center";
    x.fillText("PABELLÓN", 256, 90);
    x.font = "300 600px Jura, sans-serif";
    x.fillText("5", 256, 690);
    const n = new THREE.Mesh(new THREE.PlaneGeometry(4, 6), new THREE.MeshStandardMaterial({ map: tex(c), transparent: true, roughness: 0.9 }));
    n.position.set(4.6, 5.5, HZ0 + 0.04);
    scene.add(n);
  }

  /* ---------- the stand: 6 × 4 m, open to the front and the right ---------- */
  const W = 6, D = 4, H = 3.0;
  slab(roundedRect(W + 0.2, D + 0.2, [0, 0, 0.9, 0]), P, [m.oak, m.oakSolid], 0);
  // a thin line of warm light at the floor's foot, just proud of its edge (flush, the two flickered)
  box(W - 0.7, 0.02, 0.02, m.ledWarm, -0.35, 0.05, D / 2 + 0.125, false);
  box(0.02, 0.02, D - 0.7, m.ledWarm, W / 2 + 0.125, 0.05, -0.35, false);
  // its soft contact shadow on the carpet
  {
    const EX = 4.6, EZ = 3.6, PXM = 64;
    const [c, x] = canvas(Math.round(EX * 2 * PXM), Math.round(EZ * 2 * PXM));
    const at = (wx: number, wz: number): [number, number] => [(wx + EX) * PXM, (wz + EZ) * PXM];
    const footprint = (grow: number) => {
      const w = W + 0.2 + grow * 2, d = D + 0.2 + grow * 2, rp = (0.9 + grow) * PXM;
      const [x0, z0] = at(-w / 2, -d / 2), [x1, z1] = at(w / 2, d / 2);
      x.beginPath();
      x.moveTo(x0, z0);
      x.lineTo(x1, z0);
      x.lineTo(x1, z1 - rp);
      x.quadraticCurveTo(x1, z1, x1 - rp, z1);
      x.lineTo(x0, z1);
      x.closePath();
    };
    x.fillStyle = "rgba(0,0,0,0.5)";
    x.filter = "blur(26px)";
    footprint(0.12);
    x.fill();
    x.filter = "blur(7px)";
    footprint(0.02);
    x.fill();
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(EX * 2, EZ * 2), new THREE.MeshBasicMaterial({ map: tex(c), transparent: true, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2;
    sh.position.y = 0.007;
    sh.renderOrder = 1;
    scene.add(sh);
  }

  // Back wall in navy, and the side wall in warm plaster with the brand on it
  const BACK_Z = -D / 2 + 0.07;
  box(W, H, 0.14, m.navy, 0, P + H / 2, BACK_Z);
  box(0.14, H, D, m.plaster, -W / 2 + 0.07, P + H / 2, 0);
  decal(brandSheet(1400, 1600, NAVY, true), D * 0.55, D * 0.55 * (1600 / 1400), [-W / 2 + 0.145, P + H * 0.52, -0.25], Math.PI / 2);

  // The wall of tins: oak ledges across the back wall, and on them the tins standing upright, label
  // out, in diagonal bands of colour. A backlit cream panel with the brand is left open in the middle
  {
    const TW = 0.2, TH = 0.13, TD = 0.035, PITCH_X = 0.218, PITCH_Y = 0.19;
    const x0 = -W / 2 + 0.32, x1 = W / 2 - 0.2, y0 = P + 0.32, y1 = P + H - 0.22;
    const cols = Math.floor((x1 - x0) / PITCH_X), rows = Math.floor((y1 - y0) / PITCH_Y);
    const ox = x0 + (x1 - x0 - cols * PITCH_X) / 2 + PITCH_X / 2;
    const front = BACK_Z + 0.07;
    // the brand's panel, over the counter
    // high on the wall: its top level with the tops of the highest row of tins, its foot with the
    // tops of the row five below, so it sits in line with the shelving
    // and across, on the middle column of the wall, so the tins either side match
    const PCX = ox + ((cols - 1) / 2) * PITCH_X, PCY = P + 2.065, PW = 1.75, PH = 0.95;
    const inPanel = (x: number, y: number) => Math.abs(x - PCX) < PW / 2 + 0.06 && Math.abs(y - PCY) < PH / 2 + 0.08;
    const tinGeo = new THREE.BoxGeometry(TW, TH, TD);
    const meshes = LABELS.map((l) => {
      const mats = [m.tin, m.tin, m.tin, m.tin, new THREE.MeshStandardMaterial({ map: label(l), roughness: 0.35, metalness: 0.15 }), m.tin];
      return new THREE.InstancedMesh(tinGeo, mats, cols * rows);
    });
    const counts = LABELS.map(() => 0);
    const M = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1), e = new THREE.Euler();
    for (let r = 0; r < rows; r++) {
      const ledgeY = y0 + r * PITCH_Y;
      // the ledge, broken where the panel is
      const segs: [number, number][] = [];
      const ly = ledgeY + TH / 2;
      if (Math.abs(ly - PCY) < PH / 2 + 0.08) segs.push([x0, PCX - PW / 2 - 0.08], [PCX + PW / 2 + 0.08, x1]);
      else segs.push([x0, x1]);
      segs.forEach(([a, b]) => box(b - a, 0.02, 0.07, m.oakSolid, (a + b) / 2, ledgeY - 0.01, front + 0.035, false));
      for (let k = 0; k < cols; k++) {
        const x = ox + k * PITCH_X, y = ledgeY + TH / 2;
        if (inPanel(x, y)) continue;
        // the bands: a slow diagonal wave through the six labels
        const band = Math.floor((k * 0.55 + r * 0.9 + Math.sin(k * 0.35) * 1.6) / 1.9);
        const d = ((band % LABELS.length) + LABELS.length) % LABELS.length;
        // each tin leans back a touch against the wall, by its own small amount
        e.set(-0.06 - Math.random() * 0.04, (Math.random() - 0.5) * 0.04, 0);
        q.setFromEuler(e);
        M.compose(new THREE.Vector3(x, y, front + TD / 2 + 0.012), q, s);
        meshes[d].setMatrixAt(counts[d]++, M);
      }
    }
    meshes.forEach((mesh, i) => {
      mesh.count = counts[i];
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    });
    // the panel: cream, lit from within, the brand in navy
    box(PW, PH, 0.06, m.oakSolid, PCX, PCY, front + 0.03);
    const [c, x] = canvas(1400, 760);
    x.fillStyle = CREAM;
    x.fillRect(0, 0, 1400, 760);
    // the fish high in the panel, well clear of the name below it
    const brand = brandSheet(1400, 760, NAVY, true, true, { fishY: 0.25, fishLen: 0.5, textY: 0.71 }).image as HTMLCanvasElement;
    x.drawImage(brand, 0, 0);
    const pt = tex(c);
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(PW - 0.08, PH - 0.08), new THREE.MeshStandardMaterial({ map: pt, emissive: "#ffffff", emissiveMap: pt, emissiveIntensity: 0.06, roughness: 0.6 }));
    panel.position.set(PCX, PCY, front + 0.061);
    scene.add(panel);
  }

  // Canopy: a navy band over the stand, its front-right corner swept round, warm light beneath
  const outer = roundedRect(W + 0.2, D + 0.2, [0.02, 0.02, 1.0, 0.02]);
  outer.holes.push(roundedRect(W - 0.6, D - 0.6, [0.02, 0.02, 0.62, 0.02]));
  slab(outer, 0.42, m.navy, P + H);
  const ledRing = roundedRect(W + 0.16, D + 0.16, [0.02, 0.02, 0.98, 0.02]);
  ledRing.holes.push(roundedRect(W + 0.08, D + 0.08, [0.02, 0.02, 0.94, 0.02]));
  slab(ledRing, 0.02, m.ledWarm, P + H - 0.02);
  decal(brandSheet(2048, 320, CREAM, false, false), 0.32 * (2048 / 320), 0.32, [-1.2, P + H + 0.21, D / 2 + 0.125]);
  {
    const [c, x] = canvas(512, 256);
    fish(x, 256, 128, 400, CREAM);
    decal(tex(c), 0.7, 0.35, [W / 2 + 0.125, P + H + 0.21, -0.9], Math.PI / 2);
  }

  // The tasting counter: faced in tiles on its front and sides, a white marble top, a navy plinth
  {
    const CW = 2.4, CH = 1.0, CD = 0.62, cx = 0.55, cz = 0.75;
    const face = (rx: number) => {
      const t = tiles.clone();
      t.needsUpdate = true;
      t.repeat.set(rx, CH / 0.6);
      return new THREE.MeshPhysicalMaterial({ map: t, roughness: 0.15, clearcoat: 0.8, clearcoatRoughness: 0.08 });
    };
    const side = face(CD / 0.6), front = face(CW / 0.6);
    box(CW, CH - 0.1, CD, [side, side, m.marble, m.marble, front, front], cx, P + 0.1 + (CH - 0.1) / 2, cz);
    box(CW - 0.04, 0.1, CD - 0.04, m.navy, cx, P + 0.05, cz);
    box(CW + 0.12, 0.05, CD + 0.14, m.marble, cx, P + CH + 0.025, cz);
    const T = P + CH + 0.05;
    // on it: an oak board with three open tins, a bottle of albariño and two glasses
    box(0.6, 0.025, 0.28, m.oakSolid, cx - 0.4, T + 0.0125, cz + 0.02);
    [-0.6, -0.4, -0.2].forEach((dx, i) => {
      const tin = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.1), m.tin);
      tin.position.set(cx + dx, T + 0.04, cz + 0.02);
      tin.rotation.y = (i - 1) * 0.2;
      add(tin);
      const oil = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.004, 0.08), new THREE.MeshStandardMaterial({ color: "#c98a3c", roughness: 0.2 }));
      oil.position.set(cx + dx, T + 0.056, cz + 0.02);
      oil.rotation.y = tin.rotation.y;
      scene.add(oil);
    });
    const bottleProfile = [
      [0, 0], [0.04, 0], [0.042, 0.01], [0.042, 0.2], [0.036, 0.24], [0.016, 0.28], [0.014, 0.33], [0.016, 0.335], [0, 0.335],
    ].map(([r, y]) => new THREE.Vector2(r, y));
    const bottle = new THREE.Mesh(new THREE.LatheGeometry(bottleProfile, 32), m.bottle);
    bottle.position.set(cx + 0.35, T, cz - 0.05);
    add(bottle);
    const glassProfile = [[0, 0], [0.035, 0], [0.036, 0.004], [0.004, 0.01], [0.004, 0.09], [0.03, 0.11], [0.038, 0.15], [0.034, 0.19], [0.032, 0.19]].map(
      ([r, y]) => new THREE.Vector2(r, y),
    );
    [0.55, 0.7].forEach((dx, i) => {
      const g = new THREE.Mesh(new THREE.LatheGeometry(glassProfile, 32), m.glass);
      g.position.set(cx + dx, T, cz + 0.08 - i * 0.12);
      add(g, false);
    });
    // three opal pendants over it, hanging from the lighting bar
    [-0.6, 0.0, 0.6].forEach((dx) => {
      const y = P + 1.8;
      const globe = new THREE.Mesh(new THREE.SphereGeometry(0.13, 32, 20), m.opal);
      globe.position.set(cx + dx, y, cz);
      scene.add(globe);
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, P + H + 0.12 - y, 6), new THREE.MeshStandardMaterial({ color: "#1d1f21" }));
      cable.position.set(cx + dx, (y + P + H + 0.12) / 2, cz);
      scene.add(cable);
      const glow = new THREE.PointLight("#ffd6a3", 1.6, 2.6, 2);
      glow.position.set(cx + dx, y - 0.15, cz);
      scene.add(glow);
    });
  }

  // A high oak table with two stools on the open front-left, and the plant in the back right
  {
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.04, 48), m.oakSolid);
    top.position.set(-1.8, P + 1.06, 1.15);
    add(top);
    box(0.06, 1.04, 0.06, m.graphite, -1.8, P + 0.52, 1.15);
    const stool = (x: number, z: number) => {
      const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.17, 0.06, 32), m.navy);
      seat.position.set(x, P + 0.76, z);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.72, 14), m.graphite);
      pole.position.set(x, P + 0.38, z);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 32), m.graphite);
      base.position.set(x, P + 0.01, z);
      [seat, pole, base].forEach((o) => add(o));
    };
    stool(-2.35, 1.4);
    stool(-1.3, 1.6);
    const px = 2.3, pz = -1.35, POT = 0.6;
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.19, POT, 40), m.plaster);
    pot.position.set(px, P + POT / 2, pz);
    add(pot);
    new GLTFLoader().load("/models/plant/plant.gltf", (gltf) => {
      const plant = gltf.scene;
      plant.traverse((o) => {
        if (o.name.endsWith("_pot")) o.visible = false;
        if ((o as THREE.Mesh).isMesh) o.castShadow = o.receiveShadow = true;
      });
      const db = new THREE.Box3().setFromObject(plant.getObjectByName("potted_plant_02_dirt")!);
      plant.position.set(-(db.min.x + db.max.x) / 2, -db.max.y, -(db.min.z + db.max.z) / 2);
      const holder = new THREE.Group();
      holder.add(plant);
      holder.scale.setScalar(0.44 / (db.max.x - db.min.x));
      holder.position.set(px, P + POT - 0.02, pz);
      holder.rotation.y = 0.6;
      scene.add(holder);
    });
  }

  /* ---------- the fair around it: an aisle and the neighbouring stands ---------- */
  // A charcoal runner down the aisle in front of the stand
  {
    const runner = new THREE.Mesh(new THREE.PlaneGeometry(HW, 3.4), new THREE.MeshStandardMaterial({ color: "#a9abab", roughness: 1 }));
    runner.rotation.x = -Math.PI / 2;
    runner.position.set(0, 0.004, 4.1);
    runner.receiveShadow = true;
    scene.add(runner);
  }
  // Neighbouring stands, simpler, in their own colours: the stand is one of many in the hall
  const neighbour = (x: number, z: number, rotY: number, wall: string, header: string, word: string) => {
    const g = new THREE.Group();
    // held a few shades down, so none of them competes with Brétema
    const mat = (c: string, r = 0.8) => new THREE.MeshStandardMaterial({ color: new THREE.Color(c).lerp(new THREE.Color("#d9dbdb"), 0.72), roughness: r });
    const part = (w: number, h: number, d: number, mt: THREE.Material, px: number, py: number, pz: number) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mt);
      b.position.set(px, py, pz);
      g.add(b);
    };
    part(5, 0.1, 4, mat("#d8d2c8"), 0, 0.05, 0);
    part(5, 2.8, 0.1, mat(wall), 0, 1.5, -1.95);
    part(0.1, 2.8, 4, mat(wall), -2.45, 1.5, 0);
    part(1.8, 0.95, 0.55, mat("#f2f0eb", 0.5), 0.6, 0.57, 0.6);
    // the header board with their trade
    const [c, cx] = canvas(1024, 160);
    cx.fillStyle = "#" + new THREE.Color(header).lerp(new THREE.Color("#d9dbdb"), 0.72).getHexString();
    cx.fillRect(0, 0, 1024, 160);
    cx.fillStyle = "#ffffff";
    cx.font = "400 78px Jura, sans-serif";
    cx.textAlign = "center";
    cx.fillText(word, 512, 108);
    const hb = new THREE.Mesh(new THREE.BoxGeometry(5, 0.5, 0.12), [mat(header), mat(header), mat(header), mat(header), new THREE.MeshStandardMaterial({ map: tex(c), roughness: 0.7 }), mat(header)]);
    hb.position.set(0, 3.15, -1.85);
    g.add(hb);
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    add(g);
  };
  neighbour(-8.6, 0, 0, "#c96f4a", "#8e4a33", "QUESOS");
  neighbour(8.4, 0.4, 0, "#7d8a63", "#56603f", "ACEITES");
  neighbour(-6.5, -7.5, 0, "#e9e5dc", "#2f3a3d", "PANADERÍA");
  neighbour(5.5, -7.8, 0, "#b9a37e", "#6b5a3e", "VINOS");

  // People: photographic cut-outs (Skalgubbar, free for visualising unbuilt spaces, skalgubbar.se),
  // as architects populate their views. Each stands upright and turns to face the camera, with a
  // soft shadow at its feet, so as the stand sways they never show their edge
  const people: THREE.Mesh[] = [];
  {
    const blob = (() => {
      // round on its canvas; the plane it lies on stretches it into an ellipse
      const [c, x] = canvas(128, 128);
      const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, "rgba(0,0,0,0.7)");
      g.addColorStop(0.45, "rgba(0,0,0,0.35)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = g;
      x.fillRect(0, 0, 128, 128);
      return tex(c);
    })();
    const loader = new THREE.TextureLoader();
    // [image, x, z, height, floor]: one person to a picture, so each stands on its own floor. A lady
    // at the counter, one at the tins, one by the high table, the one serving, and a few in the aisle
    const cast: [string, number, number, number, number][] = [
      // a step back from the counter, walking up to it, so oak shows between her feet and its plinth
      ["p03b", 0.5, 1.85, 1.6, P],
      ["p09", 1.05, 0.05, 1.8, P],
      ["p07", -2.15, -1.05, 1.66, P],
      ["p14", -0.55, 2.05, 1.68, P],
      ["p03a", 3.7, 3.3, 1.78, 0],
      ["p13", -3.4, 3.6, 1.66, 0],
    ];
    cast.forEach(([name, x, z, h, floor]) => {
      const mat = new THREE.MeshBasicMaterial({ transparent: true, alphaTest: 0.35, side: THREE.DoubleSide, color: new THREE.Color(1, 1, 1) });
      // muted and lightened, so they read as life round the stand and never outweigh it: at the
      // stand a little, along the aisle a good deal more
      const mute = floor ? 0.2 : 0.4, lift = floor ? 0.04 : 0.14;
      mat.onBeforeCompile = (sh) => {
        sh.fragmentShader = sh.fragmentShader.replace(
          "#include <map_fragment>",
          `#include <map_fragment>
          float lum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(lum), ${mute.toFixed(2)});
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.86, 0.87, 0.87), ${lift.toFixed(2)});`,
        );
      };
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
      plane.position.set(x, floor + h / 2, z);
      plane.visible = false;
      scene.add(plane);
      people.push(plane);
      loader.load(`/concepts/cannery/people/${name}.webp`, (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = aniso;
        const img = t.image as HTMLImageElement;
        // where the figure really starts and ends in its picture, so the feet sit on the floor
        // and the height is the person's, not the picture's
        const SW = 64, SH = Math.round((64 * img.height) / img.width);
        const [pc, px] = canvas(SW, SH);
        px.drawImage(img, 0, 0, SW, SH);
        const a = px.getImageData(0, 0, SW, SH).data;
        let top = 0, bot = SH - 1, minX = SW, maxX = 0;
        const solid = (r: number) => {
          for (let c = 0; c < SW; c++) if (a[(r * SW + c) * 4 + 3] > 140) return true;
          return false;
        };
        while (top < SH && !solid(top)) top++;
        while (bot > 0 && !solid(bot)) bot--;
        for (let r = top; r <= bot; r++) for (let c = 0; c < SW; c++) if (a[(r * SW + c) * 4 + 3] > 140) { minX = Math.min(minX, c); maxX = Math.max(maxX, c); }
        pc.width = 0;
        const topF = top / SH, botF = (bot + 1) / SH;
        const Hp = h / (botF - topF), Wp = (Hp * img.width) / img.height;
        plane.scale.set(Wp, Hp, 1);
        plane.position.y = floor - Hp * (1 - botF) + Hp / 2 - 0.01;
        mat.map = t;
        mat.needsUpdate = true;
        plane.visible = true;
        // a tight dark shadow right under the feet, and a wider soft one around it
        const footW = Math.max(0.35, (Wp * (maxX - minX + 1)) / SW);
        // on the stand's lit oak a shadow has to be darker to read at all
        const k = floor ? 1 : 0.85;
        [[footW * 0.8, 0.16, k], [footW * 1.1, 0.3, 0.8 * k], [footW * 1.6, 0.65, 0.45 * k]].forEach(([w, d, o]) => {
          const shadow = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: blob, transparent: true, opacity: o, depthWrite: false }));
          shadow.rotation.x = -Math.PI / 2;
          shadow.position.set(x, floor + (floor ? 0.006 : 0.01), z);
          shadow.renderOrder = 2;
          scene.add(shadow);
        });
      });
    });
  }
  const facePeople = () => people.forEach((p) => (p.rotation.y = Math.atan2(camera.position.x - p.position.x, camera.position.z - p.position.z)));

  /* ---------- light ---------- */
  // The hall is kept dim, so the stand is the one bright place in it
  scene.add(new THREE.HemisphereLight("#f6f2ec", "#8d8a86", 0.3));
  const key = new THREE.DirectionalLight("#fff4e8", 0.34);
  key.position.set(5, 11, 8);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7 });
  key.shadow.bias = -0.0003;
  key.shadow.radius = 6;
  scene.add(key);
  const pool = new THREE.SpotLight("#fff3e6", 95, 30, Math.PI / 6.5, 0.8, 1.4);
  pool.position.set(0.3, 11.5, 0.6);
  pool.target.position.set(0.3, 0, 0.4);
  scene.add(pool, pool.target);
  const fixture = new THREE.MeshStandardMaterial({ color: "#16181a", roughness: 0.4, metalness: 0.6 });
  const spot = (x: number, z: number, tx: number, ty: number, tz: number, intensity: number, shadow = false) => {
    const l = new THREE.SpotLight("#fff1dc", intensity, 9, Math.PI / 5.2, 0.6, 1.6);
    l.position.set(x, P + H - 0.05, z);
    l.target.position.set(tx, ty, tz);
    l.castShadow = shadow;
    if (shadow) {
      l.shadow.mapSize.set(1024, 1024);
      l.shadow.bias = -0.0004;
      l.shadow.radius = 4;
    }
    scene.add(l, l.target);
    const f = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.16, 16), fixture);
    f.position.set(x, P + H - 0.1, z);
    f.lookAt(tx, ty, tz);
    f.rotateX(Math.PI / 2);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 8), fixture);
    stem.position.set(x, P + H + 0.02, z);
    scene.add(f, stem);
  };
  [0.4, 0.75, 1.4].forEach((z) => box(W - 0.4, 0.05, 0.05, fixture, 0, P + H + 0.12, z, false));
  // the tin wall washed in light, left and right, so every label reads
  spot(-1.6, 0.4, -1.6, 1.4, BACK_Z, 15, true);
  spot(-0.6, 0.4, -0.6, 1.0, BACK_Z, 9);
  spot(2.2, 0.4, 2.2, 1.4, BACK_Z, 13);
  spot(-2.3, 1.4, -W / 2, 1.7, -0.25, 12);
  spot(0.55, 1.4, 0.55, 0.9, 0.75, 22, true);

  /* ---------- post ---------- */
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { samples: 4, type: THREE.HalfFloatType }));
  composer.addPass(new RenderPass(scene, camera));
  // A shallow depth of field, as a camera would have: the stand sharp, the hall and the near
  // aisle softening away from it. The cut-outs are left out of its depth, so their picture's
  // empty corners never draw a blurred rectangle; each takes the depth of what is behind it
  const bokeh = new BokehPass(scene, camera, { focus: 9, aperture: 0.0011, maxblur: 0.0045 });
  const bokehRender = bokeh.render.bind(bokeh);
  bokeh.render = (...args: Parameters<typeof bokeh.render>) => {
    const shown = people.map((p) => p.visible);
    people.forEach((p) => (p.visible = false));
    bokehRender(...args);
    people.forEach((p, i) => (p.visible = shown[i]));
  };
  composer.addPass(bokeh);
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.05, 0.2, 0.98));
  composer.addPass(new OutputPass());

  /* ---------- size and loop ---------- */
  const fit = () => {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
  };
  const ro = new ResizeObserver(fit);
  ro.observe(host);
  fit();

  // On arrival the camera slides in from the corner and settles on the best side, then sways round it
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const look = new THREE.Vector3(...VIEW.look);
  const home = new THREE.Spherical().setFromVector3(new THREE.Vector3(...VIEW.pos).sub(look));
  const sph = new THREE.Spherical();
  const place = (s: THREE.Spherical) => {
    camera.position.copy(look).add(new THREE.Vector3().setFromSpherical(s));
    controls.target.copy(look);
    controls.update();
  };
  let start = 0;
  const loop = () => {
    // while another scene shares its frame, it holds still and draws nothing
    if (paused.current) return;
    const now = performance.now();
    if (!start) start = now;
    const t = (now - start) / 1000;
    const e = 1 - Math.pow(1 - Math.min(1, t / 3), 3);
    const sway = t > 3 ? Math.sin((t - 3) * 0.22) * 0.18 : 0;
    sph.set(home.radius * (1.16 - 0.16 * e), home.phi - 0.06 * (1 - e), home.theta + 0.5 * (1 - e) + sway);
    place(sph);
    facePeople();
    // kept on the stand as the camera breathes in and out
    (bokeh.uniforms as unknown as Record<string, { value: number }>).focus.value = camera.position.distanceTo(look);
    composer.render();
  };
  place(reduced ? home : new THREE.Spherical(home.radius * 1.16, home.phi - 0.06, home.theta + 0.5));
  const io = new IntersectionObserver(([entry]) => renderer.setAnimationLoop(entry.isIntersecting && !reduced ? loop : null), { rootMargin: "-15% 0px" });
  try {
    await renderer.compileAsync(scene, camera);
  } catch {
    /* compiled on the first frame instead */
  }
  composer.render();
  io.observe(host);
  onReady();

  return () => {
    io.disconnect();
    ro.disconnect();
    renderer.setAnimationLoop(null);
    controls.dispose();
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry.dispose();
        (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((mat) => {
          (mat as THREE.MeshStandardMaterial).map?.dispose();
          mat.dispose();
        });
      }
    });
    pmrem.dispose();
    composer.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}

const CanneryStand: React.FC<{ className?: string; paused?: boolean }> = ({ className = "", paused = false }) => {
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let dispose: (() => void) | null = null;
    let cancelled = false;
    if (!host.current) return;
    build(host.current, () => setReady(true), pausedRef).then((d) => {
      if (cancelled) d();
      else dispose = d;
    });
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);
  return (
    // Nothing shows until the model has its first picture
    <div className={`relative overflow-hidden transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"} ${className}`} style={{ background: BG }}>
      <div ref={host} className="absolute inset-0" />
      {/* the people's credit, as their licence asks: as quiet as a caption can be */}
      <a
        href="https://skalgubbar.se"
        target="_blank"
        rel="noreferrer"
        className="pointer-events-auto absolute bottom-2 right-3 font-mono text-[9px] lowercase tracking-[0.04em] text-white/35 transition-colors duration-500 hover:text-white/70"
      >
        personas · skalgubbar.se
      </a>
    </div>
  );
};

export default CanneryStand;
