import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { SMALL } from "../../lib/type";

/**
 * The smart hc congress stand, rebuilt in 3D from the original design, in a
 * viewer that lives inside the case page: it turns slowly on its own, can be
 * dragged round, and steps between a few framed views with an eased glide.
 * The wheel is left to the page, so scrolling past it never gets caught.
 */

const ORANGE = "#f39200";
const GRAPHITE = "#2b2f33";
const BG = "#a9b8ba"; // the blue-grey of the presentation beside it
const BG_TOP = "#9baaac";
const BG_BOTTOM = "#c1cfd1";
const ASSETS = "/concepts/smarthc-stand";

type View = "general" | "pasillo" | "mostrador" | "pantalla";
type Api = { go: (v: View) => void; spin: (on: boolean) => void };

const VIEWS: Record<View, { pos: [number, number, number]; look: [number, number, number] }> = {
  general: { pos: [7.8, 3.1, 8.8], look: [0, 1.45, 0] },
  pasillo: { pos: [-3.6, 1.65, 8.4], look: [0.4, 1.55, -0.4] },
  mostrador: { pos: [1.9, 1.55, 4.6], look: [0.55, 1.0, 0.75] },
  pantalla: { pos: [1.1, 1.8, 1.9], look: [1.1, 1.8, -2] },
};

const LABELS: Record<View, string> = {
  general: "vista general",
  pasillo: "desde el pasillo",
  mostrador: "mostrador",
  pantalla: "pantalla",
};

const loadImg = (src: string) =>
  new Promise<HTMLImageElement>((ok, fail) => {
    const i = new Image();
    i.onload = () => ok(i);
    i.onerror = fail;
    i.src = src;
  });

/** The logo is white on transparent: recolour it to any tone */
function tinted(img: HTMLImageElement, color: string) {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const x = c.getContext("2d")!;
  x.drawImage(img, 0, 0);
  x.globalCompositeOperation = "source-in";
  x.fillStyle = color;
  x.fillRect(0, 0, c.width, c.height);
  return c;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

async function build(host: HTMLDivElement, onReady: () => void): Promise<{ api: Api; dispose: () => void }> {
  const [LOGO, SYMBOL] = await Promise.all([loadImg(`${ASSETS}/logo.png`), loadImg(`${ASSETS}/symbol.png`)]);
  try {
    await Promise.race([document.fonts.load("300 100px Jura"), new Promise((r) => setTimeout(r, 1500))]);
  } catch {
    /* fonts are a nicety */
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.display = "block";
  host.appendChild(renderer.domElement);
  const aniso = renderer.capabilities.getMaxAnisotropy();

  const scene = new THREE.Scene();
  {
    const c = document.createElement("canvas");
    c.width = 2;
    c.height = 256;
    const x = c.getContext("2d")!;
    const g = x.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, BG_TOP);
    g.addColorStop(1, BG_BOTTOM);
    x.fillStyle = g;
    x.fillRect(0, 0, 2, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    scene.background = t;
  }
  // Fog only far off, where the hall meets the background: the stand itself stays clear
  scene.fog = new THREE.Fog(BG, 26, 60);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
  scene.environmentIntensity = 0.35;

  const camera = new THREE.PerspectiveCamera(36, 1, 0.05, 100);
  camera.position.set(...VIEWS.general.pos);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(...VIEWS.general.look);
  controls.enableDamping = true;
  controls.dampingFactor = 0.035;
  controls.rotateSpeed = 0.6;
  controls.enableZoom = false; // the wheel scrolls the page
  controls.enablePan = false;
  controls.maxPolarAngle = Math.PI * 0.48;
  controls.autoRotate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  controls.autoRotateSpeed = 0.22;

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
  const concreteTex = (w: number, h: number, panel: number, base: [number, number, number]) => {
    const [c, x] = canvas(w, h);
    const img = x.createImageData(w, h);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * 22;
      d[i] = base[0] + n;
      d[i + 1] = base[1] + n;
      d[i + 2] = base[2] + n + 1;
      d[i + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    for (let i = 0; i < 90; i++) {
      const px = Math.random() * w;
      const py = Math.random() * h;
      const r = 40 + Math.random() * 220;
      const g = x.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, Math.random() > 0.5 ? "rgba(255,255,255,0.07)" : "rgba(20,24,26,0.09)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = g;
      x.fillRect(px - r, py - r, r * 2, r * 2);
    }
    x.strokeStyle = "rgba(30,34,36,0.35)";
    x.lineWidth = 3;
    for (let px = panel; px < w; px += panel) {
      x.beginPath();
      x.moveTo(px, 0);
      x.lineTo(px, h);
      x.stroke();
    }
    for (let py = panel * 0.6; py < h; py += panel * 0.6) {
      x.beginPath();
      x.moveTo(0, py);
      x.lineTo(w, py);
      x.stroke();
    }
    for (let px = panel / 4; px < w; px += panel / 2)
      for (let py = panel * 0.15; py < h; py += panel * 0.3) {
        x.fillStyle = "rgba(200,205,208,0.35)";
        x.beginPath();
        x.arc(px + 1, py + 1, 9, 0, 7);
        x.fill();
        x.fillStyle = "rgba(35,38,40,0.75)";
        x.beginPath();
        x.arc(px, py, 7, 0, 7);
        x.fill();
      }
    return tex(c);
  };
  const logoSheet = (img: HTMLImageElement, color: string, w: number, h: number, scale = 0.9) => {
    const [c, x] = canvas(w, h);
    const t = tinted(img, color);
    const k = Math.min((w * scale) / t.width, (h * scale) / t.height);
    x.drawImage(t, (w - t.width * k) / 2, (h - t.height * k) / 2, t.width * k, t.height * k);
    return tex(c);
  };
  const screenTex = () => {
    const [c, x] = canvas(1920, 1080);
    const g = x.createLinearGradient(0, 0, 1920, 1080);
    g.addColorStop(0, "#30353a");
    g.addColorStop(1, "#202427");
    x.fillStyle = g;
    x.fillRect(0, 0, 1920, 1080);
    x.fillStyle = ORANGE;
    x.beginPath();
    x.moveTo(1920, 1080);
    x.lineTo(1360, 1080);
    x.lineTo(1920, 700);
    x.fill();
    x.fillStyle = "#ffffff";
    x.font = "300 132px Jura, sans-serif";
    x.fillText("Encajamos contigo.", 150, 420);
    x.fillStyle = "rgba(255,255,255,0.8)";
    x.font = "300 64px Jura, sans-serif";
    x.fillText("La pieza que toda compañía", 154, 540);
    x.fillText("necesita para ser segura.", 154, 625);
    x.fillStyle = ORANGE;
    x.fillRect(154, 690, 140, 10);
    const t = tinted(LOGO, "#ffffff");
    const k = 520 / t.width;
    x.drawImage(t, 150, 820, t.width * k, t.height * k);
    return tex(c);
  };
  const sideWallTex = () => {
    const [c, x] = canvas(1600, 1920);
    x.drawImage(tinted(SYMBOL, ORANGE), 500, 380, 600, 600);
    const l = tinted(LOGO, "#ffffff");
    const k = 900 / l.width;
    x.drawImage(l, 350, 1120, l.width * k, l.height * k);
    return tex(c);
  };

  /* ---------- materials ---------- */
  const P = 0.12;
  const m = {
    platform: new THREE.MeshPhysicalMaterial({ color: "#25292c", roughness: 0.22, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.08 }),
    graphite: new THREE.MeshStandardMaterial({ color: "#2e3236", roughness: 0.62 }),
    graphiteGloss: new THREE.MeshPhysicalMaterial({ color: GRAPHITE, roughness: 0.25, clearcoat: 0.6 }),
    white: new THREE.MeshPhysicalMaterial({ color: "#f1f3f4", roughness: 0.28, clearcoat: 0.8, clearcoatRoughness: 0.15 }),
    // The band over the stand, in the brand's orange
    canopy: new THREE.MeshPhysicalMaterial({ color: ORANGE, roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.2 }),
    ledOrange: new THREE.MeshStandardMaterial({ color: "#000", emissive: ORANGE, emissiveIntensity: 4 }),
    ledWarm: new THREE.MeshStandardMaterial({ color: "#000", emissive: "#ffe2bd", emissiveIntensity: 1.1 }),
    chrome: new THREE.MeshStandardMaterial({ color: "#c9ced1", roughness: 0.18, metalness: 0.95 }),
    glass: new THREE.MeshPhysicalMaterial({ color: "#e8eef1", roughness: 0.06, transmission: 0.92, thickness: 0.02, ior: 1.5, transparent: true }),
    frost: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.6, transparent: true, opacity: 0.55 }),
    counter: new THREE.MeshPhysicalMaterial({ color: "#f4f6f7", roughness: 0.38, emissive: ORANGE, emissiveIntensity: 0.08, clearcoat: 0.5 }),
    floor: new THREE.MeshStandardMaterial({ color: "#aebcbe", roughness: 0.4, metalness: 0.05, transparent: true, opacity: 0.86 }),
    concrete: new THREE.MeshStandardMaterial({ map: concreteTex(1536, 896, 384, [124, 133, 138]), roughness: 0.88 }),
    concreteSide: new THREE.MeshStandardMaterial({ map: concreteTex(1024, 896, 384, [150, 158, 162]), roughness: 0.88 }),
  };

  const box = (w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number, shadow = true) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    b.position.set(x, y, z);
    b.castShadow = shadow;
    b.receiveShadow = true;
    scene.add(b);
    return b;
  };
  const decal = (t: THREE.Texture, w: number, h: number, pos: [number, number, number], rotY = 0, glow = 0) => {
    const mat = new THREE.MeshStandardMaterial({
      map: t,
      transparent: true,
      roughness: 0.5,
      emissive: glow ? "#ffffff" : "#000000",
      emissiveMap: glow ? t : null,
      emissiveIntensity: glow,
    });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    p.position.set(...pos);
    p.rotation.y = rotY;
    p.receiveShadow = true;
    scene.add(p);
    return p;
  };
  // A footprint with its own radius per corner: back-left, back-right, front-right, front-left
  const roundedRect = (w: number, d: number, r: [number, number, number, number]) => {
    const s = new THREE.Shape();
    const x0 = -w / 2;
    const z0 = -d / 2;
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
  const slab = (shape: THREE.Shape, h: number, mat: THREE.Material, y: number) => {
    const g = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2, curveSegments: 32 });
    g.rotateX(Math.PI / 2);
    g.translate(0, y + h, 0);
    const s = new THREE.Mesh(g, mat);
    s.castShadow = true;
    s.receiveShadow = true;
    scene.add(s);
    return s;
  };

  /* ---------- hall and stand: 6 × 4 m corner stand, open to the front and the right ---------- */
  const mirror = new Reflector(new THREE.PlaneGeometry(90, 90), { clipBias: 0.003, textureWidth: 512, textureHeight: 512, color: 0x9aa3a8 });
  mirror.rotation.x = -Math.PI / 2;
  scene.add(mirror);
  const hall = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), m.floor);
  hall.rotation.x = -Math.PI / 2;
  hall.position.y = 0.002;
  hall.receiveShadow = true;
  scene.add(hall);
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshStandardMaterial({ color: BG_TOP, roughness: 1 }));
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 12;
  scene.add(ceiling);
  const truss = new THREE.MeshStandardMaterial({ color: "#6d7a7d", roughness: 0.6, metalness: 0.5 });
  for (let z = -30; z <= 30; z += 6) box(80, 0.35, 0.35, truss, 0, 10.6, z, false);
  const lamp = new THREE.MeshStandardMaterial({ color: "#000", emissive: "#eef3f6", emissiveIntensity: 2.5 });
  for (let x = -30; x <= 30; x += 7.5)
    for (let z = -30; z <= 30; z += 6) {
      const l = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.1, 20), lamp);
      l.position.set(x, 10.35, z);
      scene.add(l);
    }


  const W = 6;
  const D = 4;
  const H = 3.0;
  slab(roundedRect(W + 0.2, D + 0.2, [0, 0, 0.9, 0]), P, m.platform, 0);
  box(W - 0.7, 0.025, 0.02, m.ledOrange, -0.35, 0.05, D / 2 + 0.11, false);
  box(0.02, 0.025, D - 0.7, m.ledOrange, W / 2 + 0.11, 0.05, -0.35, false);

  box(W, H, 0.14, m.concrete, 0, P + H / 2, -D / 2 + 0.07);
  box(0.14, H, D, m.concreteSide, -W / 2 + 0.07, P + H / 2, 0);
  decal(sideWallTex(), D * 0.6, H, [-W / 2 + 0.145, P + H / 2, -0.3], Math.PI / 2);
  box(2.72, 1.56, 0.06, new THREE.MeshStandardMaterial({ color: "#0c0d0e", roughness: 0.3 }), 1.1, P + 1.75, -D / 2 + 0.17);
  decal(screenTex(), 2.64, 1.485, [1.1, P + 1.75, -D / 2 + 0.205], 0, 0.85);

  // Canopy: an orange band over the whole stand, its front-right corner swept in a curve,
  // a line of warm light beneath it, the logo in white
  const outer = roundedRect(W + 0.2, D + 0.2, [0.02, 0.02, 1.0, 0.02]);
  outer.holes.push(roundedRect(W - 0.6, D - 0.6, [0.02, 0.02, 0.62, 0.02]));
  slab(outer, 0.42, m.canopy, P + H);
  const ledRing = roundedRect(W + 0.16, D + 0.16, [0.02, 0.02, 0.98, 0.02]);
  ledRing.holes.push(roundedRect(W + 0.08, D + 0.08, [0.02, 0.02, 0.94, 0.02]));
  slab(ledRing, 0.02, m.ledWarm, P + H - 0.02);
  // Same proportion as the sheet (2048 × 600), so the logo is never stretched
  decal(logoSheet(LOGO, "#ffffff", 2048, 600), 0.4 * (2048 / 600), 0.4, [-1.2, P + H + 0.21, D / 2 + 0.125]);
  decal(logoSheet(SYMBOL, "#ffffff", 512, 512), 0.34, 0.34, [W / 2 + 0.125, P + H + 0.21, -0.9], Math.PI / 2);

  // Vertical light fins on the open side
  for (let i = 0; i < 5; i++) box(0.04, H, 0.12, m.ledWarm, W / 2 - 0.12, P + H / 2, -1.75 + i * 0.26);
  box(0.08, H, 1.3, m.graphiteGloss, W / 2 - 0.2, P + H / 2, -1.23);

  // Demo point for their product, the Biometric PAD, in dark graphite: a tall totem with a portrait screen,
  // and a plinth with the tablet on it, ready to be tried
  {
    const [c, x] = canvas(608, 1080);
    const g = x.createLinearGradient(0, 0, 0, 1080);
    g.addColorStop(0, "#ffb12b");
    g.addColorStop(1, ORANGE);
    x.fillStyle = g;
    x.fillRect(0, 0, 608, 1080);
    x.drawImage(tinted(SYMBOL, "#ffffff"), 184, 170, 240, 240);
    x.fillStyle = "#ffffff";
    x.textAlign = "center";
    x.font = "400 74px Jura, sans-serif";
    x.fillText("Biometric", 304, 560);
    x.font = "300 74px Jura, sans-serif";
    x.fillText("PAD", 304, 640);
    x.font = "300 30px Jura, sans-serif";
    ["firma electrónica", "alta precisión", "pantalla hd"].forEach((t, i) => x.fillText(t, 304, 780 + i * 56));
    const totem = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.1, 0.22), m.graphiteGloss);
    body.position.y = 1.05;
    body.castShadow = true;
    body.receiveShadow = true;
    const scr = tex(c);
    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.56, 1.0),
      new THREE.MeshStandardMaterial({ map: scr, emissive: "#ffffff", emissiveMap: scr, emissiveIntensity: 0.7, roughness: 0.25 }),
    );
    screenMesh.position.set(0, 1.25, 0.111);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.03, 0.22), m.ledOrange);
    foot.position.y = 0.015;
    totem.add(body, screenMesh, foot);
    totem.position.set(-2.3, P, -1.3);
    totem.rotation.y = 0.45;
    scene.add(totem);
  }
  box(0.5, 1.0, 0.5, m.graphiteGloss, -1.25, P + 0.5, -1.05);
  box(0.5, 0.025, 0.5, m.ledOrange, -1.25, P + 1.0, -1.05, false);
  {
    const [c, x] = canvas(512, 360);
    const g = x.createLinearGradient(0, 0, 0, 360);
    g.addColorStop(0, "#ffb12b");
    g.addColorStop(1, ORANGE);
    x.fillStyle = g;
    x.fillRect(0, 0, 512, 360);
    x.drawImage(tinted(SYMBOL, "#ffffff"), 186, 110, 140, 140);
    const t = tex(c);
    const tablet = new THREE.Group();
    const tb = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.015, 0.24), new THREE.MeshStandardMaterial({ color: "#111315", roughness: 0.35, metalness: 0.4 }));
    tb.castShadow = true;
    const ts = new THREE.Mesh(new THREE.PlaneGeometry(0.31, 0.21), new THREE.MeshStandardMaterial({ map: t, emissive: "#ffffff", emissiveMap: t, emissiveIntensity: 0.8 }));
    ts.rotation.x = -Math.PI / 2;
    ts.position.y = 0.0085;
    tablet.add(tb, ts);
    tablet.position.set(-1.25, P + 1.05, -1.05);
    tablet.rotation.set(0.35, 0.4, 0);
    scene.add(tablet);
  }

  // The counter: a long capsule, backlit in orange, graphite top, logo on its face
  const counter = slab(roundedRect(2.4, 0.7, [0.35, 0.35, 0.35, 0.35]), 1.0, m.counter, P);
  counter.position.set(0.55, 0, 0.75);
  const top = slab(roundedRect(2.5, 0.8, [0.4, 0.4, 0.4, 0.4]), 0.05, m.graphiteGloss, P + 1.0);
  top.position.set(0.55, 0, 0.75);
  box(2.0, 0.02, 0.02, m.ledOrange, 0.55, P + 0.03, 1.12, false);
  decal(logoSheet(LOGO, GRAPHITE, 2048, 600), 1.5, 0.44, [0.55, P + 0.58, 1.122]);

  // A high table with three stools on the open front-left
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 48), m.white);
  bar.position.set(-1.75, P + 1.06, 1.15);
  bar.castShadow = true;
  scene.add(bar);
  box(0.06, 1.04, 0.06, m.chrome, -1.75, P + 0.52, 1.15);
  const stool = (x: number, z: number) => {
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.17, 0.07, 32), m.white);
    seat.position.set(x, P + 0.76, z);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.72, 14), m.chrome);
    pole.position.set(x, P + 0.38, z);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.02, 32), m.chrome);
    base.position.set(x, P + 0.01, z);
    [seat, pole, base].forEach((o) => {
      o.castShadow = true;
      o.receiveShadow = true;
      scene.add(o);
    });
  };
  stool(-2.35, 1.35);
  stool(-1.75, 1.8);
  stool(-1.15, 1.45);

  /* ---------- light ---------- */
  scene.add(new THREE.HemisphereLight("#e6eef0", "#8a989b", 0.45));
  const key = new THREE.DirectionalLight("#dfe8ee", 0.6);
  key.position.set(5, 11, 8);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7 });
  key.shadow.bias = -0.0003;
  key.shadow.radius = 6;
  scene.add(key);
  const fixture = new THREE.MeshStandardMaterial({ color: "#16181a", roughness: 0.4, metalness: 0.6 });
  const spot = (x: number, z: number, tx: number, ty: number, tz: number, intensity: number, shadow = false) => {
    const l = new THREE.SpotLight("#fff1dc", intensity, 9, Math.PI / 6.2, 0.55, 1.6);
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
    scene.add(f);
  };
  spot(1.1, 0.2, 1.1, 1.8, -D / 2, 34, true);
  spot(-2.2, 0.6, -W / 2, 1.8, -0.3, 13);
  spot(0.55, 1.4, 0.55, 0.8, 0.75, 30, true);
  spot(-1.75, 1.4, -1.75, 1.0, 1.15, 22);

  /* ---------- post ---------- */
  // A multisampled target, so edges stay crisp through the post-processing
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { samples: 4, type: THREE.HalfFloatType }));
  composer.addPass(new RenderPass(scene, camera));
  // Glow only on what truly emits light (LEDs, screens), never a haze over the white surfaces
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.16, 0.3, 0.97));
  composer.addPass(new OutputPass());

  /* ---------- size, views, loop ---------- */
  const fit = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
    const pr = renderer.getPixelRatio();
    mirror.getRenderTarget().setSize(Math.floor(w * pr * 0.6), Math.floor(h * pr * 0.6));
  };
  const ro = new ResizeObserver(fit);
  ro.observe(host);
  fit();

  // An eased glide between framed views, instead of a constant-rate chase
  let glide: { from: THREE.Vector3; to: THREE.Vector3; fromT: THREE.Vector3; toT: THREE.Vector3; start: number } | null = null;
  const api: Api = {
    go: (v) => {
      const target = VIEWS[v];
      controls.autoRotate = false;
      glide = {
        from: camera.position.clone(),
        to: new THREE.Vector3(...target.pos),
        fromT: controls.target.clone(),
        toT: new THREE.Vector3(...target.look),
        start: performance.now(),
      };
    },
    spin: (on) => {
      controls.autoRotate = on;
    },
  };
  controls.addEventListener("start", () => {
    glide = null;
  });

  const loop = () => {
    if (glide) {
      const t = Math.min(1, (performance.now() - glide.start) / 1700);
      const e = easeInOut(t);
      camera.position.lerpVectors(glide.from, glide.to, e);
      controls.target.lerpVectors(glide.fromT, glide.toT, e);
      if (t === 1) glide = null;
    }
    controls.update();
    composer.render();
  };

  // Render only while the viewer is on screen
  const io = new IntersectionObserver(([entry]) => renderer.setAnimationLoop(entry.isIntersecting ? loop : null), { rootMargin: "100px" });
  io.observe(host);
  onReady();

  const dispose = () => {
    io.disconnect();
    ro.disconnect();
    renderer.setAnimationLoop(null);
    controls.dispose();
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry.dispose();
        (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((mat) => {
          const tm = mat as THREE.MeshStandardMaterial;
          tm.map?.dispose();
          mat.dispose();
        });
      }
    });
    pmrem.dispose();
    composer.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
  return { api, dispose };
}

const StandViewer: React.FC<{ poster?: string; label?: string; className?: string }> = ({ poster, label, className = "" }) => {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<Api | null>(null);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View>("general");

  useEffect(() => {
    let dispose: (() => void) | null = null;
    let cancelled = false;
    if (!host.current) return;
    build(host.current, () => setReady(true)).then((r) => {
      if (cancelled) r.dispose();
      else {
        api.current = r.api;
        dispose = r.dispose;
      }
    });
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  // The model turns slowly on its own until a view is chosen or it is dragged
  const go = (v: View) => {
    setView(v);
    api.current?.go(v);
  };
  const button = (active: boolean) =>
    `relative py-1 transition-colors duration-500 ${active ? "text-platinum" : "text-platinum/55 hover:text-platinum/85"}`;

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: BG }}>
      {/* The still holds the place until the model is built, then the model fades over it */}
      {poster && (
        <img
          src={poster}
          alt=""
          aria-hidden
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}
        />
      )}
      <div ref={host} className={`absolute inset-0 cursor-grab transition-opacity duration-700 active:cursor-grabbing ${ready ? "opacity-100" : "opacity-0"}`} />
      {label && <p className={`${SMALL} pointer-events-none absolute left-4 top-3 normal-case text-[#2f3a3d]/70`}>{label}</p>}
      <nav aria-label="Vistas" className={`${SMALL} absolute inset-x-0 bottom-0 flex flex-wrap justify-end gap-x-5 gap-y-1 px-4 pb-3 pt-8`} style={{ background: "linear-gradient(to top, rgba(28,33,36,0.55), transparent)" }}>
        {(Object.keys(VIEWS) as View[]).map((v) => (
          <button key={v} type="button" onClick={() => go(v)} aria-pressed={view === v} className={button(view === v)}>
            {LABELS[v]}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default StandViewer;
