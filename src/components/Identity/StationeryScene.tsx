import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * The identity of an invented guesthouse on the Galician coast, Ourela ("shore"), shown as a
 * brand is handed over: its stationery laid out on a pale stone table in the light of a window.
 * Letterhead, envelope, business cards, the room key, a pen and a tri-fold that opens on a map of the ría, in the studio's
 * own cool palette: cold white paper, graphite card, and the sign in silver foil that catches
 * the light as the camera drifts slowly over the table. Units are decimetres.
 */

const PAPER = "#f3f3f1";
const GRAPHITE = "#2b2e32";
const MIST = "#a9b8ba";
const BG = "#c9cfd1";
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

// The monoline letters of the name, each in a 100 × 140 box, and where each sits
const LETTERS: Record<string, string> = {
  O: "M50 0 C78 0 100 31 100 70 C100 109 78 140 50 140 C22 140 0 109 0 70 C0 31 22 0 50 0 Z",
  U: "M0 0 V88 C0 117 22 140 50 140 C78 140 100 117 100 88 V0",
  R: "M0 140 V0 H52 C72 0 88 16 88 36 C88 56 72 72 52 72 H0 M48 72 L100 140",
  E: "M100 0 H0 V140 H100 M0 70 H78",
  L: "M0 0 V140 H96",
  A: "M0 140 L50 0 L100 140 M20 88 H80",
};
const ADV = [0, 150, 300, 450, 592, 704];
const WORD_W = 804;

async function build(host: HTMLDivElement, onReady: () => void): Promise<() => void> {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  // drawn at least at 1.5× even on ordinary screens: the small print and the foil stay crisp
  renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio, 1.5), 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.52;
  renderer.shadowMap.enabled = true;
  // soft filtered shadows (the variance kind left a dotted halo round the cards)
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.display = "block";
  host.appendChild(renderer.domElement);
  const aniso = renderer.capabilities.getMaxAnisotropy();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.32;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 120);

  /* ---------- drawing ---------- */
  const canvas = (w: number, h: number) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return [c, c.getContext("2d")!] as const;
  };
  const tex = (c: HTMLCanvasElement, color = true) => {
    const t = new THREE.CanvasTexture(c);
    if (color) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = aniso;
    return t;
  };
  // the sign: a circle, the sea's line crossing its lower half, a finer wave below it
  const sign = (x: CanvasRenderingContext2D, cx: number, cy: number, r: number, w: number) => {
    x.save();
    x.translate(cx, cy);
    x.lineWidth = w;
    x.lineCap = "round";
    x.beginPath();
    x.arc(0, 0, r, 0, Math.PI * 2);
    x.stroke();
    x.beginPath();
    x.moveTo(-r * 0.82, r * 0.28);
    x.bezierCurveTo(-r * 0.5, r * 0.08, -r * 0.25, r * 0.48, 0, r * 0.28);
    x.bezierCurveTo(r * 0.25, r * 0.08, r * 0.5, r * 0.08, r * 0.82, r * 0.28);
    x.stroke();
    x.lineWidth = w * 0.6;
    x.beginPath();
    x.moveTo(-r * 0.55, r * 0.55);
    x.bezierCurveTo(-r * 0.3, r * 0.42, -r * 0.15, r * 0.68, r * 0.05, r * 0.55);
    x.bezierCurveTo(r * 0.25, r * 0.42, r * 0.38, r * 0.42, r * 0.55, r * 0.55);
    x.stroke();
    x.restore();
  };
  // the name in its monoline letters, `width` wide, its top at y
  const word = (x: CanvasRenderingContext2D, left: number, top: number, width: number, w: number) => {
    const k = width / WORD_W;
    x.save();
    x.translate(left, top);
    x.scale(k, k);
    x.lineWidth = w / k;
    x.lineCap = "round";
    x.lineJoin = "round";
    "OURELA".split("").forEach((ch, i) => {
      x.save();
      x.translate(ADV[i], 0);
      x.stroke(new Path2D(LETTERS[ch]));
      x.restore();
    });
    x.restore();
  };
  // A printed face: `paint` draws the ink on paper; `foil`, if given, draws what is stamped in
  // silver, kept as its own mask so it can shine
  const face = (w: number, h: number, ground: string, paint: (x: CanvasRenderingContext2D) => void, foil?: (x: CanvasRenderingContext2D) => void) => {
    const [c, x] = canvas(w, h);
    x.fillStyle = ground;
    x.fillRect(0, 0, w, h);
    // the paper's fibre, faint
    const img = x.getImageData(0, 0, w, h), d = img.data;
    for (let k = 0; k < d.length; k += 4) {
      const n = (Math.random() - 0.5) * 6;
      d[k] += n; d[k + 1] += n; d[k + 2] += n;
    }
    x.putImageData(img, 0, 0);
    paint(x);
    let mask: THREE.Texture | null = null;
    if (foil) {
      const [mc, mx] = canvas(w, h);
      mx.fillStyle = "#000";
      mx.fillRect(0, 0, w, h);
      mx.strokeStyle = "#fff";
      mx.fillStyle = "#fff";
      foil(mx);
      mask = tex(mc, false);
    }
    return { map: tex(c), mask };
  };

  /* ---------- materials ---------- */
  const foilMat = (mask: THREE.Texture) =>
    // a bright silver: it has to read on graphite card as well as on white paper
    new THREE.MeshStandardMaterial({ color: "#eef1f3", emissive: "#7c858a", metalness: 0.9, roughness: 0.28, alphaMap: mask, transparent: true, alphaTest: 0.4 });
  const add = <T extends THREE.Object3D>(o: T) => {
    o.traverse((c) => {
      if ((c as THREE.Mesh).isMesh && !c.userData.flat) {
        c.castShadow = true;
        c.receiveShadow = true;
      }
    });
    scene.add(o);
    return o;
  };
  // A sheet or card lying on the table: a thin box, its top printed, its foil just above the ink
  const sheet = (w: number, d: number, t: number, ground: string, printed: { map: THREE.Texture; mask: THREE.Texture | null }, x: number, z: number, rot: number, y = 0) => {
    const g = new THREE.Group();
    const edge = new THREE.MeshStandardMaterial({ color: ground, roughness: 0.85 });
    const top = new THREE.MeshStandardMaterial({ map: printed.map, roughness: 0.82 });
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, t, d), [edge, edge, top, edge, edge, edge]);
    b.position.y = t / 2;
    g.add(b);
    if (printed.mask) {
      const f = new THREE.Mesh(new THREE.PlaneGeometry(w, d), foilMat(printed.mask));
      f.rotation.x = -Math.PI / 2;
      f.position.y = t + 0.002;
      g.add(f);
    }
    // only what lies on the table casts its soft contact shadow there
    if (y === 0) {
      g.add(contact(w, d));
    }
    g.position.set(x, y, z);
    g.rotation.y = rot;
    return add(g);
  };

  /* ---------- the table: a smooth matte surface in a cool light grey, its grain barely there ---------- */
  {
    const S = 1024, [c, x] = canvas(S, S);
    x.fillStyle = "#aeb5b8";
    x.fillRect(0, 0, S, S);
    const img = x.getImageData(0, 0, S, S), d = img.data;
    for (let k = 0; k < d.length; k += 4) {
      const n = (Math.random() - 0.5) * 4;
      d[k] += n; d[k + 1] += n; d[k + 2] += n;
    }
    x.putImageData(img, 0, 0);
    const t = tex(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(6, 6);
    const mat = new THREE.MeshStandardMaterial({ map: t, roughness: 0.78 });
    const table = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), mat);
    table.rotation.x = -Math.PI / 2;
    table.receiveShadow = true;
    scene.add(table);
  }
  // A contact shadow: the soft dark a sheet leaves where it lies, a little longer away from the window
  const contactTex = (() => {
    const [c, x] = canvas(256, 256);
    x.filter = "blur(14px)";
    x.fillStyle = "rgba(0,0,0,0.55)";
    x.fillRect(40, 40, 176, 176);
    x.filter = "blur(4px)";
    x.fillStyle = "rgba(0,0,0,0.5)";
    x.fillRect(52, 52, 152, 152);
    return tex(c);
  })();
  const contact = (w: number, d: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.45, d * 1.45), new THREE.MeshBasicMaterial({ map: contactTex, transparent: true, depthWrite: false, opacity: 0.55 }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(0.035, 0.0015, 0.03);
    m.renderOrder = 1;
    m.userData.flat = true; // it lies on the table: it casts nothing itself
    return m;
  };

  /* ---------- the stationery, laid square on the table ---------- */
  const SANS = "'Helvetica Neue', Arial, sans-serif";
  // letterhead, A4: the sign and name at the head, the address, a letter set in grey lines
  sheet(
    2.1, 2.97, 0.008, PAPER,
    face(1240, 1754, PAPER, (x) => {
      x.fillStyle = "#8d9397";
      x.font = `22px ${SANS}`;
      x.fillText("Rúa da Ribeira 4 · 15350 Cedeira · A Coruña", 140, 1640);
      x.fillText("ola@ourela.gal · +34 981 000 404", 140, 1676);
      x.fillStyle = "#c3c8cb";
      for (let k = 0; k < 15; k++) x.fillRect(140, 560 + k * 46, k % 5 === 4 ? 520 : 940 - (k % 3) * 60, 12);
      x.fillStyle = "#6f767a";
      x.font = "italic 30px Georgia, serif";
      x.fillText("Cedeira, 12 de maio", 140, 470);
    }, (x) => {
      sign(x, 210, 210, 62, 7);
      word(x, 310, 170, 300, 6);
    }),
    -2.75, -0.15, 0,
  );
  // envelope, DL, in graphite, the sign stamped in silver on its flap
  sheet(
    2.2, 1.1, 0.03, GRAPHITE,
    face(1100, 550, GRAPHITE, (x) => {
      x.strokeStyle = "rgba(0,0,0,0.35)";
      x.lineWidth = 3;
      x.beginPath();
      x.moveTo(0, 6);
      x.lineTo(550, 300);
      x.lineTo(1100, 6);
      x.stroke();
    }, (x) => sign(x, 550, 300, 70, 7)),
    2.7, -0.95, 0,
  );
  // a wax seal on the envelope's flap, in the sea's green, the sign pressed into it
  {
    const [c, x] = canvas(256, 256);
    x.fillStyle = "#2f6f73";
    x.fillRect(0, 0, 256, 256);
    x.strokeStyle = "#1d4a4d";
    sign(x, 128, 128, 62, 7);
    const pts: THREE.Vector2[] = [];
    // the edge where the wax spread, uneven, then the raised rim round the stamp
    for (let k = 0; k <= 10; k++) pts.push(new THREE.Vector2(0.17 - k * 0.0005, k * 0.003));
    pts.push(new THREE.Vector2(0.16, 0.032), new THREE.Vector2(0.135, 0.034), new THREE.Vector2(0.13, 0.026), new THREE.Vector2(0, 0.026));
    const geo = new THREE.LatheGeometry(pts, 64);
    const pos = geo.attributes.position;
    for (let k = 0; k < pos.count; k++) {
      const a = Math.atan2(pos.getZ(k), pos.getX(k)), r = Math.hypot(pos.getX(k), pos.getZ(k));
      const wob = 1 + Math.sin(a * 5) * 0.04 + Math.sin(a * 11 + 1) * 0.025;
      pos.setX(k, Math.cos(a) * r * wob);
      pos.setZ(k, Math.sin(a) * r * wob);
    }
    geo.computeVertexNormals();
    const wax = new THREE.MeshPhysicalMaterial({ color: "#2f6f73", roughness: 0.38, clearcoat: 0.5, clearcoatRoughness: 0.3 });
    const seal = new THREE.Mesh(geo, wax);
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.13, 48), new THREE.MeshPhysicalMaterial({ map: tex(c), roughness: 0.4, clearcoat: 0.5 }));
    face.rotation.x = -Math.PI / 2;
    face.position.y = 0.0265;
    const g = new THREE.Group();
    g.add(seal, face);
    g.position.set(2.7, 0.03, -0.9);
    g.rotation.y = 0.3;
    add(g);
  }
  // a fan of colour chips: the palette, as a printer's swatch book pinned at one end; it fans open
  const fanStrips: THREE.Group[] = [];
  const fan = new THREE.Group();
  {
    const chips: [string, string, string][] = [
      ["#e6dccb", "area", "#2b2e32"],
      ["#a9c4c3", "salitre", "#2b2e32"],
      ["#6f8f5e", "algas", "#f7f4ee"],
      ["#d0664a", "tella", "#f7f4ee"],
      ["#2f6f73", "mar", "#f7f4ee"],
      ["#1f2a30", "noite", "#f7f4ee"],
    ];
    const SL = 1.7, SW = 0.42;
    chips.forEach(([col, name, ink], i) => {
      const [c, x] = canvas(680, 168);
      x.fillStyle = PAPER;
      x.fillRect(0, 0, 680, 168);
      x.fillStyle = col;
      x.fillRect(150, 0, 530, 168);
      x.fillStyle = ink;
      x.font = `600 26px ${SANS}`;
      x.fillText(name.toUpperCase().split("").join(" "), 190, 98);
      x.fillStyle = "#6f767a";
      x.font = `18px ${SANS}`;
      x.fillText(col.toUpperCase(), 22, 70);
      x.fillText(`OU ${String(i + 1).padStart(2, "0")}`, 22, 104);
      x.fillStyle = "#c3c8cb";
      x.beginPath();
      x.arc(40, 140, 9, 0, 7);
      x.fill();
      const edge = new THREE.MeshStandardMaterial({ color: PAPER, roughness: 0.8 });
      const strip = new THREE.Mesh(new THREE.BoxGeometry(SL, 0.006, SW), [edge, edge, new THREE.MeshStandardMaterial({ map: tex(c), roughness: 0.55 }), edge, edge, edge]);
      // pinned near its end: it turns about the pin
      strip.position.set(SL / 2 - 0.1, 0.003 + i * 0.0065, -SW / 2 + 0.1);
      const pivot = new THREE.Group();
      pivot.add(strip);
      fan.add(pivot);
      fanStrips.push(pivot);
    });
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.06, 20), new THREE.MeshStandardMaterial({ color: "#c9ced1", metalness: 1, roughness: 0.3 }));
    pin.position.y = 0.03;
    fan.add(pin);
    const fs = contact(1.7, 0.42);
    fs.position.set(0.8, 0.0015, -0.08);
    fan.add(fs);
    fan.position.set(-3.05, 0.008, 2.1);
    add(fan);
  }
  // A narrow, straight-sided bud vase in clear glass, and in it a single lilac flower: the one living thing on the table
  {
    const vase = new THREE.Group();
    // the glass: a narrow upright block with straight sides, a heavy clear base, the walls thin
    const VW = 0.22, VH = 0.85;
    const clear = new THREE.MeshPhysicalMaterial({ color: "#f4f8f8", roughness: 0.02, transmission: 1, thickness: 0.03, ior: 1.5, transparent: true, side: THREE.DoubleSide, envMapIntensity: 1.3 });
    const glass = new THREE.Mesh(new RoundedBoxGeometry(VW, VH, VW, 2, 0.008), clear);
    // lifted a hair off the table: flush with it, the two faces flickered
    glass.position.y = VH / 2 + 0.004;
    glass.userData.flat = true; // clear glass: it throws no solid shadow
    const base = new THREE.Mesh(
      new RoundedBoxGeometry(VW - 0.008, 0.07, VW - 0.008, 2, 0.006),
      new THREE.MeshPhysicalMaterial({ color: "#e3eeec", roughness: 0.02, transmission: 0.95, thickness: 0.15, ior: 1.5, transparent: true }),
    );
    base.position.y = 0.042;
    base.userData.flat = true;
    // what draws glass in a photograph: its edges, catching the light as fine bright lines
    const rim = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(VW, VH, VW)),
      new THREE.LineBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.55 }),
    );
    rim.position.y = VH / 2 + 0.004;
    rim.userData.flat = true;
    // a little water in it
    const water = new THREE.Mesh(
      new THREE.BoxGeometry(VW - 0.014, 0.2, VW - 0.014),
      new THREE.MeshPhysicalMaterial({ color: "#e8f1f0", roughness: 0.02, transmission: 1, thickness: 0.1, ior: 1.33, transparent: true }),
    );
    water.position.y = 0.17;
    water.userData.flat = true;
    // the stem, rising from the neck and leaning out, with one leaf
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.05, 0),
      new THREE.Vector3(0.02, 0.6, 0.01),
      new THREE.Vector3(0.1, 1.1, 0.22),
      new THREE.Vector3(0.24, 1.42, 0.6),
    ]);
    const green = new THREE.MeshPhysicalMaterial({ color: "#5d7a46", roughness: 0.5, sheen: 0.4, sheenColor: new THREE.Color("#a9c48e") });
    const stem = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.009, 10, false), green);
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.quadraticCurveTo(0.09, 0.16, 0, 0.42);
    leafShape.quadraticCurveTo(-0.09, 0.16, 0, 0);
    const leaf = new THREE.Mesh(new THREE.ShapeGeometry(leafShape, 12), new THREE.MeshStandardMaterial({ color: "#6b8757", roughness: 0.55, side: THREE.DoubleSide }));
    leaf.position.copy(curve.getPoint(0.45));
    leaf.rotation.set(0.4, 0.6, -0.9);
    // The flower, an anemone in lilac, built as a real one is: six to eight thin petals, each a
    // little different, veined, paler and translucent at the edge, deeper at the base, their rims
    // waved and their tips curling back; a dark, velvety centre ringed with fine stamens
    const flower = new THREE.Group();
    // the petal's own picture: its colour running from the base out, the veins fanning through it,
    // and its outline, a little uneven, kept as its alpha
    const petalTex = (() => {
      const W = 256, H = 384, [c, x] = canvas(W, H);
      const g = x.createLinearGradient(0, H, 0, 0);
      g.addColorStop(0, "#5b3f86");
      g.addColorStop(0.18, "#8f74c4");
      g.addColorStop(0.6, "#b9a3e2");
      g.addColorStop(1, "#ddd0f3");
      x.fillStyle = g;
      x.beginPath();
      x.moveTo(W / 2, H);
      x.bezierCurveTo(W * 0.02, H * 0.72, W * 0.02, H * 0.18, W * 0.3, H * 0.04);
      x.quadraticCurveTo(W * 0.42, 0, W * 0.5, H * 0.03);
      x.quadraticCurveTo(W * 0.6, 0, W * 0.72, H * 0.05);
      x.bezierCurveTo(W * 0.98, H * 0.2, W * 0.98, H * 0.72, W / 2, H);
      x.fill();
      x.globalCompositeOperation = "source-atop";
      // veins, from the base, branching faintly
      for (let k = 0; k < 15; k++) {
        const a = -0.62 + (k / 14) * 1.24;
        x.strokeStyle = `rgba(82,52,128,${0.18 + Math.random() * 0.12})`;
        x.lineWidth = 1 + Math.random() * 0.8;
        x.beginPath();
        x.moveTo(W / 2, H);
        x.bezierCurveTo(W / 2 + a * 60, H * 0.7, W / 2 + a * 130, H * 0.35, W / 2 + a * 150, H * 0.04);
        x.stroke();
      }
      // a fine mottling of the tissue, and the pale margin
      for (let k = 0; k < 900; k++) {
        x.fillStyle = `rgba(${Math.random() > 0.5 ? "255,255,255" : "70,40,110"},${Math.random() * 0.05})`;
        x.fillRect(Math.random() * W, Math.random() * H, 2 + Math.random() * 3, 2 + Math.random() * 6);
      }
      const edge = x.createRadialGradient(W / 2, H, H * 0.55, W / 2, H, H * 1.02);
      edge.addColorStop(0, "rgba(255,255,255,0)");
      edge.addColorStop(1, "rgba(245,240,255,0.35)");
      x.fillStyle = edge;
      x.fillRect(0, 0, W, H);
      return tex(c);
    })();
    const petalMat = new THREE.MeshPhysicalMaterial({
      map: petalTex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide,
      roughness: 0.62, sheen: 0.6, sheenColor: new THREE.Color("#f0e8ff"), sheenRoughness: 0.5,
      // petals let the light through: lit from behind they glow
      transmission: 0.22, thickness: 0.004, ior: 1.35,
    });
    // a petal: a finely divided sheet, cupped across, arched along, its rim waved and its tip curled back
    const petalGeo = (len: number, wid: number, seed: number) => {
      const g = new THREE.PlaneGeometry(wid, len, 14, 22);
      g.translate(0, len / 2, 0);
      const p = g.attributes.position;
      for (let k = 0; k < p.count; k++) {
        const px = p.getX(k), py = p.getY(k), u = py / len, v = px / (wid / 2);
        const cup = v * v * wid * 0.22 * (0.4 + u);
        const arch = Math.sin(u * Math.PI * 0.8) * len * 0.16 - Math.pow(Math.max(0, u - 0.7) / 0.3, 2) * len * 0.12;
        const wave = Math.sin(v * 5 + seed * 3) * Math.pow(u, 2) * wid * 0.05 * Math.abs(v);
        p.setZ(k, cup + arch + wave);
      }
      g.computeVertexNormals();
      return g;
    };
    const N = 7;
    for (let k = 0; k < N; k++) {
      const seed = k * 1.7;
      const len = 0.25 + Math.sin(seed) * 0.025, wid = 0.19 + Math.cos(seed * 1.3) * 0.02;
      const p = new THREE.Mesh(petalGeo(len, wid, seed), petalMat);
      p.castShadow = true;
      // the shadow keeps the petal's own outline
      p.customDepthMaterial = new THREE.MeshDepthMaterial({ map: petalTex, alphaTest: 0.5 });
      // opened out from the centre, each at its own angle
      p.rotation.x = -Math.PI / 2 + 0.42 + Math.sin(seed * 2.1) * 0.12;
      const holder = new THREE.Group();
      holder.rotation.y = (k / N) * Math.PI * 2 + Math.sin(seed) * 0.15;
      holder.add(p);
      flower.add(holder);
    }
    // the centre: a dark, velvety boss, and round it a ring of stamens on fine filaments
    const velvet = new THREE.MeshPhysicalMaterial({ color: "#1d1630", roughness: 0.95, sheen: 1, sheenColor: new THREE.Color("#4a3a70") });
    const boss = new THREE.Mesh(new THREE.SphereGeometry(0.04, 24, 16), velvet);
    boss.scale.y = 0.7;
    boss.position.y = 0.025;
    flower.add(boss);
    const filament = new THREE.MeshStandardMaterial({ color: "#2a2140", roughness: 0.7 });
    const anther = new THREE.MeshStandardMaterial({ color: "#3a2f55", roughness: 0.8 });
    const pollen = new THREE.MeshStandardMaterial({ color: "#d9c27a", roughness: 0.9 });
    for (let k = 0; k < 34; k++) {
      const a = (k / 34) * Math.PI * 2 + (k % 3) * 0.05, r = 0.045 + (k % 2) * 0.012, h = 0.04 + (k % 4) * 0.006;
      const fil = new THREE.Mesh(new THREE.CylinderGeometry(0.0018, 0.0022, h, 4), filament);
      fil.position.set(Math.cos(a) * r, 0.02 + h / 2, Math.sin(a) * r);
      fil.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 8, 6), k % 5 === 0 ? pollen : anther);
      tip.position.set(Math.cos(a) * (r + h * 0.45), 0.02 + h, Math.sin(a) * (r + h * 0.45));
      flower.add(fil, tip);
    }
    // the green collar just under the flower, where the stem meets it
    const collar = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 10), green);
    collar.scale.y = 0.6;
    collar.position.y = -0.015;
    flower.add(collar);
    // at the top of the stem, its face turned up to the light and a little towards us
    flower.position.copy(curve.getPoint(1));
    flower.rotation.set(0.55, 0, -0.35);
    vase.add(glass, base, rim, water, stem, leaf, flower);
    const vs = contact(VW, VW);
    vs.material.opacity = 0.75;
    vase.add(vs);
    // glass throws a shadow: an unseen block of its size casts it, smooth like the others (a
    // dithered, paler one came out grainy)
    {
      const proxy = new THREE.Mesh(new THREE.BoxGeometry(VW * 0.96, VH, VW * 0.96), new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }));
      proxy.position.y = VH / 2 + 0.004;
      vase.add(proxy);
    }
    vase.scale.setScalar(1.25);
    vase.position.set(-0.95, 0, -1.4);
    add(vase);
  }
  // business cards: a white stack, and one card on it that turns over to show its graphite back
  const front = face(850, 550, PAPER, (x) => {
    x.fillStyle = "#2b2e32";
    x.font = "34px Georgia, serif";
    x.fillText("Lúa Couto", 70, 360);
    x.fillStyle = "#7d8488";
    x.font = `22px ${SANS}`;
    x.fillText("dirección · ola@ourela.gal", 70, 402);
  }, (x) => {
    sign(x, 110, 120, 42, 5);
    word(x, 70, 450, 170, 3.2);
  });
  for (let k = 0; k < 7; k++) sheet(0.85, 0.55, 0.006, PAPER, front, 2.025 + (k % 2) * 0.006, 0.025 - k * 0.002, (k % 3) * 0.008 - 0.008, k * 0.006);
  const back = face(850, 550, GRAPHITE, () => {}, (x) => {
    sign(x, 425, 210, 80, 6.5);
    word(x, 300, 335, 250, 4);
  });
  // the turning card: front on top, back beneath, each with its foil; it turns about its long axis
  const flip = new THREE.Group();
  {
    const t = 0.006;
    const edge = new THREE.MeshStandardMaterial({ color: PAPER, roughness: 0.85 });
    const card = new THREE.Mesh(new THREE.BoxGeometry(0.85, t, 0.55), [
      edge, edge, new THREE.MeshStandardMaterial({ map: front.map, roughness: 0.82 }),
      new THREE.MeshStandardMaterial({ map: back.map, roughness: 0.82 }), edge, edge,
    ]);
    flip.add(card);
    const f1 = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.55), foilMat(front.mask!));
    f1.rotation.x = -Math.PI / 2;
    f1.position.y = t / 2 + 0.002;
    const f2 = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.55), foilMat(back.mask!));
    f2.rotation.x = Math.PI / 2;
    f2.position.y = -t / 2 - 0.002;
    flip.add(f1, f2);
    flip.position.set(2.025, 0.05, 0.025);
    add(flip);
  }
  // the room key: graphite card, the sign and the number in silver; it slides in beside the cards
  const key = sheet(0.86, 0.54, 0.012, GRAPHITE, face(860, 540, GRAPHITE, (x) => {
    x.fillStyle = MIST;
    x.fillRect(0, 470, 860, 14);
  }, (x) => {
    sign(x, 170, 230, 92, 7);
    x.font = "150px Georgia, serif";
    x.fillText("04", 360, 290);
    x.font = `26px ${SANS}`;
    x.fillText("H A B I T A C I Ó N", 366, 128);
  }), 2.025, 0.72, 0);

  // The phone, lying beside the cards, with the house's site on its screen: the brand's digital side
  let screenMap: THREE.Texture;
  {
    const W = 460, H = 2400, SANS2 = SANS;
    const [c, x] = canvas(W, H);
    x.fillStyle = PAPER;
    x.fillRect(0, 0, W, H);
    // status bar and the site's header
    x.fillStyle = "#2b2e32";
    x.font = `600 18px ${SANS2}`;
    x.fillText("9:41", 30, 38);
    x.fillRect(370, 26, 52, 14);
    x.strokeStyle = "#2b2e32";
    sign(x, 52, 104, 22, 3);
    word(x, 88, 94, 110, 2.2);
    x.fillRect(400, 96, 30, 2.5);
    x.fillRect(400, 106, 30, 2.5);
    x.fillRect(400, 116, 30, 2.5);
    // the first view: the sea, the line, the button
    const g = x.createLinearGradient(0, 150, 0, 820);
    g.addColorStop(0, "#c7d3d5");
    g.addColorStop(0.5, "#6f8a8e");
    g.addColorStop(1, "#2f4246");
    x.fillStyle = g;
    x.fillRect(0, 150, W, 670);
    x.strokeStyle = "rgba(247,244,238,0.35)";
    sign(x, 360, 420, 150, 5);
    x.fillStyle = PAPER;
    x.font = "48px Georgia, serif";
    x.fillText("Volver", 34, 680);
    x.fillText("á ourela.", 34, 736);
    x.font = `17px ${SANS2}`;
    x.fillText("Casa de mar en Cedeira", 36, 776);
    x.beginPath();
    x.roundRect(34, 880, 392, 64, 32);
    x.fillStyle = "#2b2e32";
    x.fill();
    x.fillStyle = PAPER;
    x.textAlign = "center";
    x.font = `600 19px ${SANS2}`;
    x.fillText("Reservar", W / 2, 920);
    x.textAlign = "left";
    // the rooms, as a list of cards
    x.fillStyle = "#4f6b70";
    x.font = "italic 34px Georgia, serif";
    x.fillText("Habitacións", 34, 1040);
    ["Area", "Cons", "Salitre", "Ourizo"].forEach((r, i) => {
      const y = 1080 + i * 250;
      const rg = x.createLinearGradient(0, y, 0, y + 170);
      rg.addColorStop(0, ["#d5dcdd", "#c9d1d2", "#dcdfdf", "#c3cccd"][i]);
      rg.addColorStop(1, "#8fa2a5");
      x.fillStyle = rg;
      x.fillRect(34, y, 392, 170);
      x.fillStyle = "#2b2e32";
      x.font = "28px Georgia, serif";
      x.fillText(r, 34, y + 212);
      x.fillStyle = "#8d9397";
      x.font = `16px ${SANS2}`;
      x.fillText(`0${i + 1} · vista ao mar`, 300, y + 210);
    });
    // and the way there
    x.fillStyle = "#dfe4e5";
    x.fillRect(34, 2100, 392, 220);
    x.strokeStyle = "#4f6b70";
    x.lineWidth = 2;
    x.beginPath();
    x.moveTo(34, 2160);
    x.bezierCurveTo(160, 2150, 200, 2260, 300, 2230);
    x.bezierCurveTo(360, 2210, 400, 2140, 426, 2130);
    x.stroke();
    x.fillStyle = "#2b2e32";
    x.beginPath();
    x.arc(300, 2230, 7, 0, 7);
    x.fill();
    screenMap = tex(c);
    screenMap.repeat.set(1, 993 / H);
    screenMap.offset.y = 1 - 993 / H;

    const phone = new THREE.Group();
    const body = new THREE.Mesh(new RoundedBoxGeometry(0.76, 0.08, 1.56, 4, 0.11), new THREE.MeshStandardMaterial({ color: "#3a3e43", metalness: 0.85, roughness: 0.32 }));
    body.position.y = 0.04;
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 1.52), new THREE.MeshPhysicalMaterial({ color: "#0b0c0d", roughness: 0.08, clearcoat: 1 }));
    glass.rotation.x = -Math.PI / 2;
    glass.position.y = 0.0805;
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.69, 1.49),
      new THREE.MeshStandardMaterial({ color: "#000", emissive: "#ffffff", emissiveMap: screenMap, emissiveIntensity: 0.95, roughness: 0.12, metalness: 0 }),
    );
    screen.rotation.x = -Math.PI / 2;
    screen.position.y = 0.081;
    phone.add(body, glass, screen, contact(0.76, 1.56));
    phone.position.set(2.98, 0, 0.53);
    add(phone);
  }

  // The brochure: a tri-fold, closed in graphite with the sign; it opens on the house, a map of
  // the ría with the house marked on it, and the rooms
  const PW = 1.0, PD = 2.1, PT = 0.006;
  const panelFace = (paint: (x: CanvasRenderingContext2D) => void, foil?: (x: CanvasRenderingContext2D) => void, ground = PAPER) => face(500, 1050, ground, paint, foil);
  const inside = [
    panelFace((x) => {
      x.fillStyle = "#4f6b70";
      x.font = "italic 46px Georgia, serif";
      x.fillText("A casa", 60, 150);
      x.fillStyle = MIST;
      x.fillRect(60, 178, 70, 3);
      x.fillStyle = "#2b2e32";
      x.font = "26px Georgia, serif";
      ["Seis habitacións", "fronte ao mar,", "nunha casa de", "pedra de 1908."].forEach((l, i) => x.fillText(l, 60, 270 + i * 40));
      x.fillStyle = "#c3c8cb";
      for (let k = 0; k < 9; k++) x.fillRect(60, 470 + k * 34, k % 4 === 3 ? 220 : 380 - (k % 2) * 40, 10);
      // a photograph of the house, as a soft block of sea and stone
      const g = x.createLinearGradient(0, 800, 0, 990);
      g.addColorStop(0, "#c2ced0");
      g.addColorStop(1, "#6f8589");
      x.fillStyle = g;
      x.fillRect(60, 800, 380, 190);
    }),
    // the map: the land in a pale grey with its contour lines, the ría cutting in, the house marked
    panelFace((x) => {
      x.fillStyle = "#dfe4e5";
      x.fillRect(0, 0, 500, 1050);
      const ria = () => {
        x.beginPath();
        x.moveTo(0, 0);
        x.lineTo(500, 0);
        x.lineTo(500, 120);
        x.bezierCurveTo(420, 180, 380, 260, 330, 330);
        x.bezierCurveTo(300, 380, 330, 470, 290, 540);
        x.bezierCurveTo(250, 610, 200, 600, 180, 520);
        x.bezierCurveTo(160, 430, 120, 360, 60, 300);
        x.bezierCurveTo(30, 270, 10, 240, 0, 230);
        x.closePath();
      };
      ria();
      x.fillStyle = "#b9c8ca";
      x.fill();
      // contour lines over the land
      x.save();
      x.beginPath();
      x.rect(0, 0, 500, 1050);
      ria();
      x.clip("evenodd");
      x.strokeStyle = "rgba(79,107,112,0.28)";
      x.lineWidth = 2;
      for (let k = 1; k < 12; k++) {
        x.beginPath();
        for (let px = -20; px <= 520; px += 20) {
          const py = 560 + k * 42 + Math.sin(px * 0.018 + k) * 26 - Math.max(0, 250 - Math.abs(px - 240)) * 0.5;
          if (px === -20) x.moveTo(px, py);
          else x.lineTo(px, py);
        }
        x.stroke();
      }
      x.restore();
      x.strokeStyle = "#4f6b70";
      x.lineWidth = 2.5;
      ria();
      x.stroke();
      // the house
      x.fillStyle = "#2b2e32";
      x.beginPath();
      x.arc(300, 600, 9, 0, 7);
      x.fill();
      x.strokeStyle = "#2b2e32";
      x.lineWidth = 2;
      x.beginPath();
      x.arc(300, 600, 22, 0, 7);
      x.stroke();
      x.font = "italic 30px Georgia, serif";
      x.fillText("Ourela", 330, 610);
      x.fillStyle = "#4f6b70";
      x.font = `18px ${SANS}`;
      x.fillText("R Í A   D E   C E D E I R A", 140, 380);
      x.fillStyle = "#6f767a";
      x.fillText("Cedeira", 120, 720);
      x.fillText("Serra da Capelada", 200, 960);
      x.fillStyle = "#2b2e32";
      x.font = `16px ${SANS}`;
      x.fillText("N", 440, 990);
      x.fillRect(446, 930, 2, 36);
    }),
    panelFace((x) => {
      x.fillStyle = "#4f6b70";
      x.font = "italic 46px Georgia, serif";
      x.fillText("Habitacións", 60, 150);
      x.fillStyle = MIST;
      x.fillRect(60, 178, 70, 3);
      ["Area", "Cons", "Salitre", "Ourizo", "Faro", "Ribeira"].forEach((r, i) => {
        x.fillStyle = "#8d9397";
        x.font = `20px ${SANS}`;
        x.fillText(`0${i + 1}`, 60, 300 + i * 110);
        x.fillStyle = "#2b2e32";
        x.font = "32px Georgia, serif";
        x.fillText(r, 120, 302 + i * 110);
        x.fillStyle = "#d4d8da";
        x.fillRect(60, 336 + i * 110, 380, 2);
      });
    }),
  ];
  const cover = panelFace(() => {}, (x) => {
    sign(x, 250, 420, 120, 9);
    word(x, 120, 600, 260, 5);
  }, GRAPHITE);
  const backs = [panelFace(() => {}, undefined, GRAPHITE), panelFace(() => {}, undefined, GRAPHITE)];
  // a panel: its inside on top, its outside beneath, laid from its hinge along `dir`
  const panel = (inner: { map: THREE.Texture }, outer: { map: THREE.Texture; mask: THREE.Texture | null }, dir: number) => {
    const edge = new THREE.MeshStandardMaterial({ color: "#d9dcdd", roughness: 0.85 });
    const m = new THREE.Mesh(new THREE.BoxGeometry(PW, PT, PD), [
      edge, edge, new THREE.MeshStandardMaterial({ map: inner.map, roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ map: outer.map, roughness: 0.6 }), edge, edge,
    ]);
    m.position.x = (dir * PW) / 2;
    m.castShadow = m.receiveShadow = true;
    const g = new THREE.Group();
    g.add(m);
    if (outer.mask) {
      // folded over, the outside comes up turned half round: its print is turned too, so it reads upright
      outer.mask.wrapS = outer.mask.wrapT = THREE.RepeatWrapping;
      outer.mask.repeat.set(-1, -1);
      const f = new THREE.Mesh(new THREE.PlaneGeometry(PW, PD), foilMat(outer.mask));
      f.rotation.x = Math.PI / 2;
      f.position.set((dir * PW) / 2, -PT / 2 - 0.002, 0);
      g.add(f);
    }
    return g;
  };
  const brochure = new THREE.Group();
  const middle = panel(inside[1], backs[0], 0);
  middle.position.y = PT / 2;
  // the right panel folds in first, the left over it: the left's outside is the cover
  const rightHinge = new THREE.Group();
  rightHinge.position.set(PW / 2, PT * 1.5 + 0.001, 0);
  rightHinge.add(panel(inside[2], backs[1], 1));
  const leftHinge = new THREE.Group();
  leftHinge.position.set(-PW / 2, PT * 2.5 + 0.003, 0);
  leftHinge.add(panel(inside[0], cover, -1));
  brochure.add(middle, rightHinge, leftHinge);
  // its shadow on the table widens as it opens
  const bShadow = contact(PW, PD);
  brochure.add(bShadow);
  brochure.position.set(0, 0, 0.1);
  add(brochure);

  // The loop's script, in seconds: the brochure opens, the card turns, the key slides in; all of
  // it held a while, then folded back
  const LOOP = 13;
  const ease = (v: number) => (v <= 0 ? 0 : v >= 1 ? 1 : v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);
  const span = (t: number, a: number, b: number) => ease((t - a) / (b - a));
  const animate = (time: number) => {
    const t = time % LOOP;
    const openL = span(t, 1.2, 2.8) - span(t, 10.4, 11.8);
    const openR = span(t, 2.2, 3.8) - span(t, 9.6, 11.0);
    leftHinge.rotation.z = -Math.PI * (1 - openL);
    rightHinge.rotation.z = Math.PI * (1 - openR);
    bShadow.scale.x = 1 + openL + openR;
    bShadow.position.x = 0.035 + (PW * (openR - openL)) / 2;
    const turn = span(t, 4.4, 5.6) - span(t, 9.2, 10.4);
    flip.rotation.x = Math.PI * turn;
    flip.position.y = 0.05 + Math.sin(Math.PI * turn) * 0.32;
    const slide = span(t, 5.2, 6.6) - span(t, 11.4, 12.6);
    key.position.z = 0.72 + (1 - slide) * 2.4;
    // the site on the phone scrolls down the page and back, as someone reads it
    // held on its first view most of the loop, a short read of the rooms, then back up
    const read = span(t, 6.5, 8.3) - span(t, 9.4, 10.8);
    screenMap.offset.y = (1 - screenMap.repeat.y) * (1 - read);
    // the swatch book fans open, chip by chip, and closes again before the loop ends
    fanStrips.forEach((p, i) => {
      const open = span(t, 0.6 + i * 0.12, 2.2 + i * 0.12) - span(t, 11.2 - i * 0.08, 12.4 - i * 0.08);
      p.rotation.y = open * i * 0.17;
    });
  };
  animate(0);

  /* ---------- light: a window to the left, its frame falling across the table ---------- */
  scene.add(new THREE.HemisphereLight("#eef2f4", "#8a9296", 0.7));
  const sun = new THREE.SpotLight("#fff8f0", 340, 60, Math.PI / 8, 0.3, 1.2);
  sun.position.set(-13, 15, -5);
  sun.target.position.set(0.3, 0, 0.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.radius = 9;
  sun.shadow.bias = -0.0002;
  sun.shadow.normalBias = 0.01;
  // the light's cone held close round the table, so its shadow map is fine where it falls
  sun.shadow.camera.near = 8;
  sun.shadow.camera.far = 32;
  // the window's frame, projected through the light
  {
    const [c, x] = canvas(512, 512);
    x.fillStyle = "#fff";
    x.fillRect(0, 0, 512, 512);
    // a window of six panes in fine mullions, its shade soft and never black: the room's light fills it
    x.fillStyle = "#6a6a6a";
    x.filter = "blur(2.5px)";
    [128, 256, 384].forEach((px) => x.fillRect(px - 4, 0, 8, 512));
    [200, 400].forEach((py) => x.fillRect(0, py - 3, 512, 6));
    x.fillRect(0, 0, 512, 10);
    sun.map = tex(c);
  }
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight("#dfe8ee", 0.45);
  fill.position.set(8, 6, 8);
  scene.add(fill);

  /* ---------- post ---------- */
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { samples: 4, type: THREE.HalfFloatType }));
  composer.addPass(new RenderPass(scene, camera));

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

  // The camera drifts slowly over the table, so the foil catches and loses the light
  const look = new THREE.Vector3(0.4, 0, 0.15);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const place = (t: number) => {
    // over the table, as a flat lay is shot, breathing only a little
    const a = Math.sin(t * 0.16) * 0.07, lift = Math.sin(t * 0.11) * 0.12;
    camera.position.set(look.x + Math.sin(a) * 4.4, 7.4 + lift, look.z + Math.cos(a) * 4.4);
    camera.lookAt(look);
  };
  place(0);
  let start = 0;
  const loop = () => {
    const now = performance.now();
    if (!start) start = now;
    const s = (now - start) / 1000;
    place(s);
    animate(s);
    composer.render();
  };
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
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry.dispose();
        (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((mat) => {
          const sm = mat as THREE.MeshStandardMaterial;
          sm.map?.dispose();
          sm.alphaMap?.dispose();
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

const StationeryScene: React.FC<{ className?: string }> = ({ className = "" }) => {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let dispose: (() => void) | null = null;
    let cancelled = false;
    if (!host.current) return;
    build(host.current, () => setReady(true)).then((d) => {
      if (cancelled) d();
      else dispose = d;
    });
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);
  return (
    <div className={`relative overflow-hidden transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"} ${className}`} style={{ background: BG }}>
      <div ref={host} className="absolute inset-0" />
      {/* a photograph's finish: the corners falling off a little, and a fine grain over all of it */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(30,34,38,0.28) 100%)" }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
    </div>
  );
};

export default StationeryScene;
