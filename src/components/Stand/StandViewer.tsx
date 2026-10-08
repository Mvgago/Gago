import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
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
// The far end of the hall, in shadow: the same blue-grey, deeper, so the room has a back to it
const BG_FAR = "#cfd5d7";
const ASSETS = "/concepts/smarthc-stand";

type View = "general" | "pasillo" | "mostrador" | "pantalla";
type Api = { go: (v: View) => void; spin: (on: boolean) => void };

const VIEWS: Record<View, { pos: [number, number, number]; look: [number, number, number] }> = {
  // Turned about 22° off the front: the open side still shows, but the stand faces you
  general: { pos: [4.4, 3.1, 10.9], look: [0, 1.45, 0] },
  pasillo: { pos: [-3.6, 1.65, 8.4], look: [0.4, 1.55, -0.4] },
  mostrador: { pos: [1.9, 1.55, 4.6], look: [0.55, 1.0, 0.75] },
  pantalla: { pos: [1.1, 1.8, 1.9], look: [1.1, 1.8, -2] },
};

const LABELS: Record<View, string> = {
  general: "general",
  pasillo: "pasillo",
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
  // Jura (the back screen's type) is not waited for: the screen is redrawn every other frame,
  // so it takes the face as soon as it arrives
  document.fonts.load("300 100px Jura").catch(() => {});
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
  // Behind everything, the hall's far end in shadow; floor and ceiling fade into it
  scene.background = new THREE.Color(BG_FAR);
  // The far walls sink into shade with distance; the stand itself stays clear
  scene.fog = new THREE.Fog(BG_FAR, 20, 70);
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
  // Phones: a vertical swipe scrolls the page as anywhere else; a sideways drag turns the stand
  renderer.domElement.style.touchAction = "pan-y";
  controls.maxPolarAngle = Math.PI * 0.48;

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
  // The back screen plays a short loop: the claim, then what they do, crossfading every five seconds
  const [scrC, scrX] = canvas(1920, 1080);
  const screenT = tex(scrC);
  const scrLogo = tinted(LOGO, "#ffffff");
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
  const easeOut = (v: number) => 1 - Math.pow(1 - clamp01(v), 3);
  const drawScreen = (time: number) => {
    const x = scrX;
    const t = time % 10, slide = t < 5 ? 0 : 1, st = t % 5;
    const g = x.createLinearGradient(0, 0, 1920, 1080);
    g.addColorStop(0, "#5a6166");
    g.addColorStop(1, "#3c4246");
    x.fillStyle = g;
    x.fillRect(0, 0, 1920, 1080);
    // a warm glow drifting slowly behind
    const glow = (gx: number, gy: number, r: number, col: string) => {
      const rg = x.createRadialGradient(gx, gy, 0, gx, gy, r);
      rg.addColorStop(0, col);
      rg.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = rg;
      x.fillRect(0, 0, 1920, 1080);
    };
    glow(1350 + Math.sin(time * 0.25) * 220, 380 + Math.cos(time * 0.2) * 140, 900, "rgba(243,146,0,0.13)");
   // a fine dot grid, lit where the warm glow passes
    for (let gy = 60; gy < 1080; gy += 60)
      for (let gx = 60; gx < 1920; gx += 60) {
        const d = Math.hypot(gx - (1350 + Math.sin(time * 0.25) * 220), gy - (380 + Math.cos(time * 0.2) * 140));
        x.fillStyle = `rgba(255,255,255,${0.06 + Math.max(0, 1 - d / 700) * 0.14})`;
        x.fillRect(gx - 2, gy - 2, 4, 4);
      }
    // The corner: an orange triangle, from the brand's lighter orange to its deep one, breathing
    // slowly, with a soft light passing over it now and then
    {
      const b = 1 + Math.sin(time * 0.9) * 0.04;
      const tw = 640 * b, th = 430 * b;
      const tri = () => {
        x.beginPath();
        x.moveTo(1920, 1080);
        x.lineTo(1920 - tw, 1080);
        x.lineTo(1920, 1080 - th);
        x.closePath();
      };
      tri();
      const tgr = x.createLinearGradient(1920 - tw * 0.6, 1080 - th * 0.6, 1920, 1080);
      tgr.addColorStop(0, "#ffab2a");
      tgr.addColorStop(1, "#e47f00");
      x.fillStyle = tgr;
      x.fill();
      x.save();
      tri();
      x.clip();
      const sx = ((time * 0.18) % 1) * 1400 + 1100;
      const sh = x.createLinearGradient(sx - 140, 0, sx + 140, 0);
      sh.addColorStop(0, "rgba(255,255,255,0)");
      sh.addColorStop(0.5, "rgba(255,255,255,0.22)");
      sh.addColorStop(1, "rgba(255,255,255,0)");
      x.fillStyle = sh;
      x.fillRect(1100, 600, 820, 480);
      x.restore();
    }
    // A phone over the corner, with their biometric signing app: a signature written, then verified
    {
      const PX = 1440, PY = 400, PWd = 340, PHt = 690, R = 44;
      // part of the film: smaller, rising in with each slide and leaving with it
      const pin = easeOut(st / 0.9), pout = 1 - clamp01((st - 4.5) / 0.5);
      x.save();
      x.globalAlpha = pin * pout;
      // small and a little turned, its centre over the corner's edge
      x.translate(1585, 700 + (1 - pin) * 60);
      x.rotate(-0.14);
      x.scale(0.64, 0.64);
      x.translate(-PX - PWd / 2, -PY - PHt / 2);
      const rr = (rx: number, ry: number, w: number, h: number, r: number) => {
        x.beginPath();
        x.roundRect(rx, ry, w, h, r);
      };
      x.save();
      x.shadowColor = "rgba(0,0,0,0.45)";
      x.shadowBlur = 50;
      x.shadowOffsetY = 24;
      rr(PX, PY, PWd, PHt, R);
      // a white aluminium body, lit from above
      const body = x.createLinearGradient(PX, PY, PX + PWd, PY + PHt);
      body.addColorStop(0, "#f6f7f8");
      body.addColorStop(1, "#cfd5d8");
      x.fillStyle = body;
      x.fill();
      x.restore();
      rr(PX + 1, PY + 1, PWd - 2, PHt - 2, R - 1);
      x.strokeStyle = "rgba(31,35,38,0.35)";
      x.lineWidth = 3;
      x.stroke();
      // the black glass around the display, as on any phone, white or not
      rr(PX + 9, PY + 9, PWd - 18, PHt - 18, R - 9);
      x.fillStyle = "#1b1e20";
      x.fill();
      const SX = PX + 19, SY = PY + 19, SW = PWd - 38, SH = PHt - 38;
      x.save();
      rr(SX, SY, SW, SH, R - 14);
      x.clip();
      x.fillStyle = "#eef0f1";
      x.fillRect(SX, SY, SW, SH);
      // app bar
      x.fillStyle = "#1f2326";
      x.fillRect(SX, SY, SW, 96);
      x.fillStyle = ORANGE;
      x.fillRect(SX, SY + 96, SW * 0.66, 4);
      x.fillStyle = "#ffffff";
      x.font = "600 22px Jura, sans-serif";
      x.fillText("Firma biométrica", SX + 24, SY + 64);
      x.fillStyle = "#1f2326";
      x.font = "600 24px Jura, sans-serif";
      x.fillText("Firme aquí", SX + 24, SY + 150);
      x.fillStyle = "#6b7479";
      x.font = "400 17px Jura, sans-serif";
      x.fillText("María López · contrato 2048", SX + 24, SY + 180);
      // the pad, and the signature drawing itself
      const PDX = SX + 20, PDY = SY + 205, PDW = SW - 40, PDH = 230;
      x.fillStyle = "#ffffff";
      x.fillRect(PDX, PDY, PDW, PDH);
      const p = easeOut((st - 0.6) / 2.4), done = st > 3.2;
      x.strokeStyle = done ? "rgba(46,160,90,0.8)" : "rgba(31,35,38,0.18)";
      x.lineWidth = 2;
      x.strokeRect(PDX, PDY, PDW, PDH);
      x.strokeStyle = "rgba(31,35,38,0.3)";
      x.lineWidth = 1.5;
      x.beginPath();
      x.moveTo(PDX + 20, PDY + PDH - 50);
      x.lineTo(PDX + PDW - 20, PDY + PDH - 50);
      x.stroke();
      x.strokeStyle = "#16263d";
      x.lineWidth = 3.2;
      x.lineCap = "round";
      x.lineJoin = "round";
      x.beginPath();
      const N = 120, n = Math.floor(N * p);
      for (let k = 0; k <= n; k++) {
        const u = k / N;
        // a quick scribble: a tall loop, shrinking waves, a stroke back underneath
        const sx = u < 0.82 ? PDX + 30 + u / 0.82 * (PDW - 70) : PDX + PDW - 40 - (u - 0.82) / 0.18 * (PDW - 90);
        const amp = u < 0.15 ? 70 : u < 0.82 ? 38 * (1 - (u - 0.15) * 0.9) : 0;
        const sy = u < 0.82 ? PDY + 120 - Math.abs(Math.sin(u * 30)) * amp + (u < 0.15 ? Math.sin(u * 40) * 20 : 0) : PDY + 150 + Math.sin((u - 0.82) * 9) * 10;
        if (k) x.lineTo(sx, sy);
        else x.moveTo(sx, sy);
      }
      x.stroke();
      // the reading, and the action
      x.fillStyle = ORANGE;
      x.fillRect(PDX, PDY + PDH + 30, PDW * p, 4);
      x.fillStyle = "rgba(31,35,38,0.1)";
      x.fillRect(PDX + PDW * p, PDY + PDH + 30, PDW * (1 - p), 4);
      x.fillStyle = "#6b7479";
      x.font = "400 16px Jura, sans-serif";
      x.fillText(`${Math.round(p * 472)} puntos capturados`, PDX, PDY + PDH + 66);
      x.fillStyle = done ? "#2ea05a" : p > 0.98 ? ORANGE : "rgba(243,146,0,0.5)";
      x.fillRect(PDX, SY + SH - 110, PDW, 64);
      x.fillStyle = "#ffffff";
      x.font = "600 21px Jura, sans-serif";
      x.textAlign = "center";
      x.fillText(done ? "✓  Firma verificada" : "Confirmar firma", PDX + PDW / 2, SY + SH - 70);
      x.textAlign = "left";
      x.restore();
      x.restore();
    }
    // each slide comes in line by line, and fades out at its end
    const out = 1 - clamp01((st - 4.5) / 0.5);
    const line = (txt: string, y: number, size: number, col: string, delay: number, indent = 0) => {
      const e = easeOut((st - delay) / 0.7);
      x.globalAlpha = e * out;
      x.fillStyle = col;
      x.font = `300 ${size}px Jura, sans-serif`;
      x.fillText(txt, 150 + indent + (1 - e) * -60, y);
      x.globalAlpha = 1;
    };
    if (slide === 0) {
      line("Encajamos contigo.", 420, 132, "#ffffff", 0.1);
      line("La pieza que toda compañía", 540, 64, "#e4e8ea", 0.5);
      line("necesita para ser segura.", 625, 64, "#e4e8ea", 0.7);
    } else {
      line("Ciberseguridad a medida", 330, 96, "#ffffff", 0.1);
      ["Auditoría y consultoría", "Firma biométrica", "Formación de equipos"].forEach((txt, k) => {
        const e = easeOut((st - 0.6 - k * 0.3) / 0.6) * out;
        x.globalAlpha = e;
        x.fillStyle = ORANGE;
        x.fillRect(154 + (1 - e) * -40, 430 + k * 92, 14, 14);
        x.globalAlpha = 1;
        line(txt, 456 + k * 92, 58, "#e4e8ea", 0.6 + k * 0.3, 52);
      });
    }
    x.globalAlpha = out;
    x.fillStyle = ORANGE;
    x.fillRect(154, 690 + (slide ? 30 : 0), 140 * easeOut((st - 1) / 0.6), 10);
    x.globalAlpha = 1;
    // the logo stays
    const k = 520 / scrLogo.width;
    x.drawImage(scrLogo, 150, 820, scrLogo.width * k, scrLogo.height * k);
    // the orange band along the bottom, with a fine light line counting the slide's time
    x.fillStyle = ORANGE;
    x.fillRect(0, 1062, 1920, 18);
    x.fillStyle = "rgba(255,255,255,0.45)";
    x.fillRect(0, 1062, 1920 * (st / 5), 3);
    screenT.needsUpdate = true;
  };
  drawScreen(0);
  // An image cropped to its visible pixels, so it centres by its shape, not by its padding
  const trimmed = (img: HTMLCanvasElement) => {
    const d = img.getContext("2d")!.getImageData(0, 0, img.width, img.height).data;
    let x0 = img.width, y0 = img.height, x1 = 0, y1 = 0;
    for (let y = 0; y < img.height; y++)
      for (let x = 0; x < img.width; x++)
        if (d[(y * img.width + x) * 4 + 3] > 20) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
    const [c, x] = canvas(x1 - x0 + 1, y1 - y0 + 1);
    x.drawImage(img, -x0, -y0);
    return c;
  };
  // The side wall's sign: the symbol over the logotype, both centred on the same axis. Drawn
  // twice: the letters themselves, and the soft shadow they cast on the concrete
  const SIGN_W = 1600, SIGN_H = 1920;
  const sideWallSign = (shadow: boolean) => {
    const [c, x] = canvas(SIGN_W, SIGN_H);
    const sym = trimmed(tinted(SYMBOL, shadow ? "#000000" : ORANGE));
    const logo = trimmed(tinted(LOGO, shadow ? "#000000" : "#ffffff"));
    const sw = 560, sh = (sym.height / sym.width) * sw;
    const lw = 980, lh = (logo.height / logo.width) * lw;
    const gap = 150, top = (SIGN_H - (sh + gap + lh)) / 2;
    if (shadow) {
      // lit from above: the shadow falls a little below and spreads
      x.filter = "blur(14px)";
      x.globalAlpha = 0.42;
      x.translate(6, 26);
    }
    x.drawImage(sym, (SIGN_W - sw) / 2, top, sw, sh);
    x.drawImage(logo, (SIGN_W - lw) / 2, top + sh + gap, lw, lh);
    return tex(c);
  };

  /* ---------- materials ---------- */
  const P = 0.12;
  const m = {
    platform: new THREE.MeshPhysicalMaterial({ color: "#25292c", roughness: 0.22, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.08 }),
    graphite: new THREE.MeshStandardMaterial({ color: "#2e3236", roughness: 0.62 }),
    graphiteGloss: new THREE.MeshPhysicalMaterial({ color: GRAPHITE, roughness: 0.25, clearcoat: 0.6 }),
    // satin white, as real furniture is: lit by a spot it reads as white, not as a light
    white: new THREE.MeshStandardMaterial({ color: "#bfc3c4", roughness: 0.6 }),
    // The band over the stand, in the brand's orange
    canopy: new THREE.MeshPhysicalMaterial({ color: ORANGE, roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.2 }),
    ledOrange: new THREE.MeshStandardMaterial({ color: "#000", emissive: ORANGE, emissiveIntensity: 4 }),
    ledWarm: new THREE.MeshStandardMaterial({ color: "#000", emissive: "#ffe2bd", emissiveIntensity: 1.1 }),
    chrome: new THREE.MeshStandardMaterial({ color: "#c9ced1", roughness: 0.18, metalness: 0.95 }),
    glass: new THREE.MeshPhysicalMaterial({ color: "#e8eef1", roughness: 0.06, transmission: 0.92, thickness: 0.02, ior: 1.5, transparent: true }),
    frost: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.6, transparent: true, opacity: 0.55 }),
    counter: new THREE.MeshPhysicalMaterial({ color: "#f4f6f7", roughness: 0.38, emissive: ORANGE, emissiveIntensity: 0.08, clearcoat: 0.5 }),
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
  /* The hall: an exhibition pavilion, empty but for this stand. A closed nave of 60 × 50 m and
     12 m high: polished concrete with its joints, a concrete plinth and metal cladding on the
     walls, steel columns, lattice trusses with high-bay lamps, an exit sign. The far walls sink
     into shade with distance, so the stand stands in a real room with depth behind it. */
  const HX = 30, HZ0 = -22, HZ1 = 28, HH = 12;
  const HW = HX * 2, HD = HZ1 - HZ0, HCZ = (HZ0 + HZ1) / 2;
  // The hall is carpeted, as fairs are: a blue-grey needle-felt, its fibre a fine, even
  // speckle that tiles seamlessly, so no grid shows
  const carpet = (() => {
    const S = 512, [c, x] = canvas(S, S);
    x.fillStyle = "#7d8c94";
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
    return t;
  })();
  const hall = new THREE.Mesh(new THREE.PlaneGeometry(HW, HD), new THREE.MeshStandardMaterial({ map: carpet, roughness: 1, metalness: 0 }));
  hall.rotation.x = -Math.PI / 2;
  hall.position.set(0, 0.002, HCZ);
  hall.receiveShadow = true;
  scene.add(hall);

  // Walls of a congress venue, not a shed: large smooth panels in a warm light grey over a
  // darker plinth, and warm wall-washers under the roof drawing soft arcs of light down them
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
    // the washers' arcs, every 5 m
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
    // panel joints: every 3 m across, and one course line at 6 m
    x.fillStyle = "rgba(45,48,48,0.28)";
    for (let px = 0; px < W; px += 3 * PX) x.fillRect(px, 0, 1, plinth);
    x.fillRect(0, H - 6 * PX, W, 1);
    x.fillStyle = "rgba(30,32,32,0.45)";
    x.fillRect(0, plinth, W, 2);
    return tex(c);
  };
  const wall = (w: number, x: number, z: number, rotY: number) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, HH), new THREE.MeshStandardMaterial({ map: cladding(w), roughness: 0.9 }));
    p.position.set(x, HH / 2, z);
    p.rotation.y = rotY;
    scene.add(p);
  };
  wall(HW, 0, HZ0, 0); // back
  wall(HW, 0, HZ1, Math.PI); // behind the visitor
  wall(HD, -HX, HCZ, Math.PI / 2); // left
  wall(HD, HX, HCZ, -Math.PI / 2); // right
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(HW, HD), new THREE.MeshStandardMaterial({ color: "#d5dadb", roughness: 1 }));
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, HH, HCZ);
  scene.add(ceiling);

  // steel columns along the walls, every 10 m
  const steel = new THREE.MeshStandardMaterial({ color: "#aab2b5", roughness: 0.5, metalness: 0.4 });
  for (let z = HZ0 + 5; z < HZ1; z += 10) {
    box(0.6, HH, 0.6, steel, -HX + 0.3, HH / 2, z, false);
    box(0.6, HH, 0.6, steel, HX - 0.3, HH / 2, z, false);
  }
  for (let x = -HX + 10; x < HX; x += 10) box(0.6, HH, 0.6, steel, x, HH / 2, HZ0 + 0.3, false);

  // lattice trusses across the hall every 8 m: two chords and a zigzag web, as one instanced set
  const trussMat = new THREE.MeshStandardMaterial({ color: "#a7b0b3", roughness: 0.55, metalness: 0.4 });
  const TOP = HH - 0.5, BOT = HH - 1.7, STEP = 1.2;
  const trussZ: number[] = [];
  for (let z = HZ0 + 4; z < HZ1; z += 8) trussZ.push(z);
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
  // high-bay lamps hung under the trusses
  const lampBody = new THREE.MeshStandardMaterial({ color: "#2a2f31", roughness: 0.45, metalness: 0.5 });
  const lamp = new THREE.MeshStandardMaterial({ color: "#000", emissive: "#ffe6c4", emissiveIntensity: 2.4 });
  for (const z of trussZ)
    for (let x = -HX + 7.5; x < HX; x += 7.5) {
      const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.5, 0.35, 24, 1, true), lampBody);
      hood.position.set(x, BOT - 0.45, z);
      const glow = new THREE.Mesh(new THREE.CircleGeometry(0.46, 24), lamp);
      glow.rotation.x = Math.PI / 2;
      glow.position.set(x, BOT - 0.62, z);
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.3, 4), lampBody);
      cable.position.set(x, BOT - 0.15, z);
      scene.add(hood, glow, cable);
    }

  // The hall's number, painted large on the back wall, as venues mark their pavilions
  {
    const [c, x] = canvas(512, 768);
    x.fillStyle = "rgba(52,60,63,0.78)";
    x.font = "500 64px Jura, sans-serif";
    x.textAlign = "center";
    x.fillText("PABELLÓN", 256, 90);
    x.font = "300 600px Jura, sans-serif";
    x.fillText("3", 256, 690);
    const t = tex(c);
    const n = new THREE.Mesh(new THREE.PlaneGeometry(4, 6), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.9 }));
    // on the stretch of wall just right of the stand in the general view, between two columns
    n.position.set(4.6, 5.5, HZ0 + 0.04);
    scene.add(n);
  }
  // A congress banner hung from the trusses, behind the stand
  {
    const [c, x] = canvas(1600, 352);
    x.fillStyle = "#2c3134";
    x.fillRect(0, 0, 1600, 352);
    x.fillStyle = "#9fb3ba";
    x.fillRect(0, 316, 1600, 12);
    x.fillStyle = "#ffffff";
    x.font = "300 112px Jura, sans-serif";
    x.textAlign = "center";
    x.fillText("Congreso de Ciberseguridad", 800, 190);
    x.fillStyle = "rgba(255,255,255,0.7)";
    x.font = "400 54px Jura, sans-serif";
    x.fillText("2026", 800, 268);
    const t = tex(c);
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.2), new THREE.MeshStandardMaterial({ map: t, roughness: 0.85, side: THREE.DoubleSide }));
    const bz = -10, by = 8.4; // under the truss at z -10
    banner.position.set(-1, by, bz);
    scene.add(banner);
    const wire = new THREE.MeshStandardMaterial({ color: "#2a2f31" });
    const top = by + 1.1, len = BOT - top;
    [-5.6, 3.6].forEach((wx) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, len, 4), wire);
      w.position.set(wx, top + len / 2, bz);
      scene.add(w);
    });
  }

  // a green emergency exit sign over a door in the back wall
  {
    const [c, x] = canvas(512, 192);
    x.fillStyle = "#1f8a4c";
    x.fillRect(0, 0, 512, 192);
    x.fillStyle = "#ffffff";
    x.font = "600 92px Jura, sans-serif";
    x.textAlign = "center";
    x.fillText("SALIDA", 300, 128);
    x.beginPath();
    x.moveTo(40, 96); x.lineTo(110, 50); x.lineTo(110, 142); x.closePath();
    x.fill();
    const st = tex(c);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.6), new THREE.MeshStandardMaterial({ map: st, emissive: "#ffffff", emissiveMap: st, emissiveIntensity: 0.9 }));
    sign.position.set(-12, 4.2, HZ0 + 0.06);
    scene.add(sign);
    box(3, 3.4, 0.08, new THREE.MeshStandardMaterial({ color: "#4a5457", roughness: 0.6, metalness: 0.3 }), -12, 1.7, HZ0 + 0.05, false);
  }

  const W = 6;
  const D = 4;
  const H = 3.0;
  slab(roundedRect(W + 0.2, D + 0.2, [0, 0, 0.9, 0]), P, m.platform, 0);
  box(W - 0.7, 0.025, 0.02, m.ledOrange, -0.35, 0.05, D / 2 + 0.11, false);
  box(0.02, 0.025, D - 0.7, m.ledOrange, W / 2 + 0.11, 0.05, -0.35, false);

  // Grounding: the platform presses on the carpet. A soft contact shadow hugs its edge, and the
  // LED lines at its foot spill warm light onto the carpet in front of them
  {
    const EX = 4.6, EZ = 3.6, PXM = 64;
    const CWp = Math.round(EX * 2 * PXM), CHp = Math.round(EZ * 2 * PXM);
    const at = (wx: number, wz: number): [number, number] => [(wx + EX) * PXM, (wz + EZ) * PXM];
    const plate = (paint: (x: CanvasRenderingContext2D) => void, additive: boolean) => {
      const [c, x] = canvas(CWp, CHp);
      paint(x);
      const t = tex(c);
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(EX * 2, EZ * 2),
        new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending }),
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = additive ? 0.006 : 0.004;
      mesh.renderOrder = 1;
      scene.add(mesh);
    };
    // the platform's footprint, as drawn on the floor plan (its front-right corner rounded)
    const footprint = (x: CanvasRenderingContext2D, grow: number) => {
      const w = W + 0.2 + grow * 2, d = D + 0.2 + grow * 2, r = 0.9 + grow;
      const [x0, z0] = at(-w / 2, -d / 2), [x1, z1] = at(w / 2, d / 2), rp = r * PXM;
      x.beginPath();
      x.moveTo(x0, z0);
      x.lineTo(x1, z0);
      x.lineTo(x1, z1 - rp);
      x.quadraticCurveTo(x1, z1, x1 - rp, z1);
      x.lineTo(x0, z1);
      x.closePath();
    };
    plate((x) => {
      x.fillStyle = "rgba(0,0,0,0.55)";
      x.filter = "blur(26px)";
      footprint(x, 0.12);
      x.fill();
      x.fillStyle = "rgba(0,0,0,0.6)";
      x.filter = "blur(7px)";
      footprint(x, 0.02);
      x.fill();
    }, false);
    plate((x) => {
      x.strokeStyle = "rgba(243,146,0,0.22)";
      x.lineCap = "round";
      x.lineWidth = 0.32 * PXM;
      x.filter = "blur(18px)";
      x.beginPath();
      x.moveTo(...at(-3.0, D / 2 + 0.3));
      x.lineTo(...at(2.3, D / 2 + 0.3));
      x.moveTo(...at(W / 2 + 0.3, -2.0));
      x.lineTo(...at(W / 2 + 0.3, 1.3));
      x.stroke();
    }, true);
  }

  box(W, H, 0.14, m.concrete, 0, P + H / 2, -D / 2 + 0.07);
  box(0.14, H, D, m.concreteSide, -W / 2 + 0.07, P + H / 2, 0);
  // standoff letters, 3 cm off the concrete, their shadow on the wall behind them
  decal(sideWallSign(true), D * 0.6, H, [-W / 2 + 0.143, P + H / 2, -0.3], Math.PI / 2);
  const letters = decal(sideWallSign(false), D * 0.6, H, [-W / 2 + 0.175, P + H / 2, -0.3], Math.PI / 2);
  (letters.material as THREE.MeshStandardMaterial).roughness = 0.3;
  box(2.72, 1.56, 0.06, new THREE.MeshStandardMaterial({ color: "#0c0d0e", roughness: 0.3 }), 1.1, P + 1.75, -D / 2 + 0.17);
  // a screen gives its own light: not lit by the spots, with a faint glow at its brightest
  const screen = decal(screenT, 2.64, 1.485, [1.1, P + 1.75, -D / 2 + 0.205]);
  screen.material.dispose();
  (screen as THREE.Mesh).material = new THREE.MeshBasicMaterial({ map: screenT, color: new THREE.Color(0.94, 0.94, 0.94) });

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
  // an orange band wrapping the counter's foot, flush with the floor
  const band = slab(roundedRect(2.42, 0.72, [0.36, 0.36, 0.36, 0.36]), 0.15, m.canopy, P);
  band.position.set(0.55, 0, 0.75);

  // A real plant (a scanned CC0 model), its leaves set in a tall graphite pot, in the back right corner
  {
    const px = 2.2, pz = -1.45, POT = 0.6;
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.19, POT, 40), m.graphiteGloss);
    pot.position.set(px, P + POT / 2, pz);
    pot.castShadow = pot.receiveShadow = true;
    scene.add(pot);
    new GLTFLoader().load("/models/plant/plant.gltf", (gltf) => {
      const plant = gltf.scene;
      // its own clay pot is left out: only the leaves and the soil
      plant.traverse((o) => {
        if (o.name.endsWith("_pot")) o.visible = false;
        if ((o as THREE.Mesh).isMesh) o.castShadow = o.receiveShadow = true;
      });
      // centred on its soil, scaled so the soil fills the pot's mouth
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
  decal(logoSheet(LOGO, GRAPHITE, 4096, 1200), 1.5, 0.44, [0.55, P + 0.58, 1.122]);

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
  scene.add(new THREE.HemisphereLight("#f6f2ec", "#8d8a86", 0.5));
  const key = new THREE.DirectionalLight("#fff4e8", 0.6);
  key.position.set(5, 11, 8);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7 });
  key.shadow.bias = -0.0003;
  key.shadow.radius = 6;
  scene.add(key);
  // A wide, soft pool of light from the roof onto the stand and the carpet round it: the stand
  // is the bright place in the hall
  const pool = new THREE.SpotLight("#fff3e6", 50, 30, Math.PI / 5.5, 1, 1.4);
  pool.position.set(0.3, 11.5, 0.6);
  pool.target.position.set(0.3, 0, 0.4);
  scene.add(pool, pool.target);
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
    // each spot hangs from its bar on a short stem
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 8), fixture);
    stem.position.set(x, P + H + 0.02, z);
    scene.add(f, stem);
  };
  // Two lighting bars across the canopy's opening, from one side of the band to the other
  [0.4, 1.4].forEach((z) => box(W - 0.4, 0.05, 0.05, fixture, 0, P + H + 0.12, z, false));
  spot(1.1, 0.4, 1.1, 1.8, -D / 2, 34, true);
  spot(-2.2, 0.4, -W / 2, 1.8, -0.3, 13);
  spot(0.55, 1.4, 0.55, 0.8, 0.75, 30, true);
  spot(-1.75, 1.4, -1.75, 1.0, 1.15, 9);
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
  };
  const ro = new ResizeObserver(fit);
  ro.observe(host);
  fit();

  // An eased glide between framed views, instead of a constant-rate chase
  let glide: { from: THREE.Vector3; to: THREE.Vector3; fromT: THREE.Vector3; toT: THREE.Vector3; start: number } | null = null;
  // The general view is the stand's best side. On arrival the camera slides in from the other
  // side, further out, and settles on it; then it sways gently around it rather than spinning away.
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const homeLook = new THREE.Vector3(...VIEWS.general.look);
  const home = new THREE.Spherical().setFromVector3(new THREE.Vector3(...VIEWS.general.pos).sub(homeLook));
  let intro: { start: number } | null = null;
  let introDone = false;
  let swayFrom = 0; // sway runs while > 0 and now > swayFrom
  const api: Api = {
    go: (v) => {
      const target = VIEWS[v];
      intro = null;
      swayFrom = v === "general" ? performance.now() + 1900 : 0;
      glide = {
        from: camera.position.clone(),
        to: new THREE.Vector3(...target.pos),
        fromT: controls.target.clone(),
        toT: new THREE.Vector3(...target.look),
        start: performance.now(),
      };
    },
    spin: (on) => {
      swayFrom = on ? performance.now() : 0;
    },
  };
  controls.autoRotate = false;
  controls.addEventListener("start", () => {
    glide = null;
    intro = null;
    swayFrom = 0;
  });
  // After a drag, it drifts back to its best side and sways again a few seconds later
  controls.addEventListener("end", () => {
    if (!reduced) swayFrom = performance.now() + 4000;
  });
  const sph = new THREE.Spherical();
  const startIntro = () => {
    if (introDone) return;
    introDone = true;
    if (reduced) return;
    intro = { start: performance.now() };
  };

  let frameN = 0;
  const loop = () => {
    const now = performance.now();
    if (++frameN % 2 === 0) drawScreen(now / 1000);
    if (intro) {
      const t = Math.min(1, (now - intro.start) / 3000);
      const e = 1 - Math.pow(1 - t, 3);
      // from the corner (+0.5 rad), a little further out and higher, gently onto the best side
      sph.set(home.radius * (1.16 - 0.16 * e), home.phi - 0.06 * (1 - e), home.theta + 0.5 * (1 - e));
      camera.position.copy(homeLook).add(new THREE.Vector3().setFromSpherical(sph));
      controls.target.copy(homeLook);
      if (t === 1) { intro = null; swayFrom = now; }
    } else if (swayFrom && now > swayFrom && !glide) {
      sph.setFromVector3(camera.position.clone().sub(controls.target));
      const theta = home.theta + Math.sin((now - swayFrom) / 1000 * .22) * .18;
      sph.theta += (theta - sph.theta) * .02;
      sph.phi += (home.phi - sph.phi) * .02;
      sph.radius += (home.radius - sph.radius) * .02;
      controls.target.lerp(homeLook, .02);
      camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(sph));
    }
    if (glide) {
      const t = Math.min(1, (now - glide.start) / 1700);
      const e = easeInOut(t);
      camera.position.lerpVectors(glide.from, glide.to, e);
      controls.target.lerpVectors(glide.fromT, glide.toT, e);
      if (t === 1) glide = null;
    }
    controls.update();
    composer.render();
  };

  // Render only while the viewer is on screen
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) startIntro();
    renderer.setAnimationLoop(entry.isIntersecting ? loop : null);
  }, { rootMargin: "-15% 0px" });
  // Shown only once it has a picture: the camera waits where the intro begins, every shader is
  // compiled ahead (off the main thread where the browser allows it) and a first frame is drawn
  if (!reduced) {
    const s0 = new THREE.Spherical(home.radius * 1.16, home.phi - 0.06, home.theta + 0.5);
    camera.position.copy(homeLook).add(new THREE.Vector3().setFromSpherical(s0));
    controls.target.copy(homeLook);
    controls.update();
  }
  try {
    await renderer.compileAsync(scene, camera);
  } catch {
    /* compiled on the first frame instead */
  }
  composer.render();
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
  const [touched, setTouched] = useState(false);

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
    `relative shrink-0 whitespace-nowrap py-1 transition-colors duration-500 ${active ? "text-platinum" : "text-platinum/55 hover:text-platinum/85"}`;

  return (
    // Nothing shows until the model has its first picture: no empty frame while it builds
    <div
      className={`relative overflow-hidden transition-opacity duration-700 ${ready || poster ? "opacity-100" : "opacity-0"} ${className}`}
      style={{ background: BG }}
    >
      {/* The still holds the place until the model is built, then the model fades over it */}
      {poster && (
        <img
          src={poster}
          alt=""
          aria-hidden
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}
        />
      )}
      <div
        ref={host}
        onPointerDown={() => setTouched(true)}
        className={`absolute inset-0 cursor-grab transition-opacity duration-700 active:cursor-grabbing ${ready ? "opacity-100" : "opacity-0"}`}
      />
      {/* An invitation to touch it, gone at the first drag: a hand swaying from side to side */}
      <style>{`@keyframes stand-sway { 0%,100% { transform: translateX(-14px) rotate(-8deg); } 50% { transform: translateX(14px) rotate(8deg); } }`}</style>
      <div
        aria-hidden
        className={`${SMALL} pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-full bg-[#1c2124]/55 px-5 py-2.5 normal-case text-platinum backdrop-blur-sm transition-opacity duration-700 ${
          ready && !touched ? "opacity-100" : "opacity-0"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" style={{ animation: "stand-sway 1.8s ease-in-out infinite" }}>
          <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V11m0-.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-.6a6 6 0 0 1-4.6-2.2L4.3 15.6a1.5 1.5 0 0 1 2.2-2l2.5 2.4" />
        </svg>
        arrastra para girar
      </div>
      {label && <p className={`${SMALL} pointer-events-none absolute left-4 top-3 normal-case text-[#2f3a3d]/70`}>{label}</p>}
      <nav aria-label="Vistas" // One line always: tighter on phones, scrolling sideways if it still doesn't fit
        className={`${SMALL} absolute inset-x-0 bottom-0 flex gap-x-3 overflow-x-auto [&>*:first-child]:ml-auto px-3 pb-2.5 pt-8 [scrollbar-width:none] sm:gap-x-5 sm:px-4 sm:pb-3 [&::-webkit-scrollbar]:hidden`} style={{ background: "linear-gradient(to top, rgba(28,33,36,0.55), transparent)" }}>
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
