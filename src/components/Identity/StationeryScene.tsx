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

async function build(host: HTMLDivElement, onReady: () => void, paused: { current: boolean } = { current: false }): Promise<() => void> {
  // stills from the studio's own film, printed in the brochure and shown on the phone's site
  const loadImg = (src: string) =>
    new Promise<HTMLImageElement>((ok) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => ok(i);
      i.src = src;
    });
  const [beach, facade] = await Promise.all(["beach", "facade"].map((n) => loadImg(`/concepts/stationery/${n}.jpg`)));
  const photos = { beach, facade };
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  // drawn at least at 1.5× even on ordinary screens: the small print and the foil stay crisp
  // (phones a little softer: the difference barely shows on a small screen, the work halves)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.matchMedia("(max-width: 767px)").matches ? 1.25 : 1.5));
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
  // A small box covered in linen, its lid set down beside it: inside, folded tissue and a card, the
  // way the house leaves a welcome in the room. The lid carries the sign in silver
  {
    const linen = (() => {
      const S = 512, [c, x] = canvas(S, S);
      x.fillStyle = "#3f6466";
      x.fillRect(0, 0, S, S);
      // the weave: fine threads both ways, each a shade off
      for (let k = 0; k < S; k += 2) {
        x.fillStyle = `rgba(255,255,255,${0.03 + Math.random() * 0.05})`;
        x.fillRect(0, k, S, 1);
        x.fillStyle = `rgba(0,0,0,${0.03 + Math.random() * 0.05})`;
        x.fillRect(k, 0, 1, S);
      }
      for (let k = 0; k < 220; k++) {
        x.fillStyle = `rgba(255,255,255,${Math.random() * 0.08})`;
        x.fillRect(Math.random() * S, Math.random() * S, 1 + Math.random() * 14, 1);
      }
      const t = tex(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, 2);
      return t;
    })();
    const cloth = new THREE.MeshStandardMaterial({ map: linen, roughness: 0.95 });
    const BW = 1.3, BD = 0.95, BH = 0.34, WALL = 0.035;
    const g = new THREE.Group();
    // the base: four walls and a floor, open at the top
    const wall = (w: number, d: number, x: number, z: number) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, BH, d), cloth);
      m.position.set(x, BH / 2, z);
      g.add(m);
    };
    wall(BW, WALL, 0, -BD / 2 + WALL / 2);
    wall(BW, WALL, 0, BD / 2 - WALL / 2);
    wall(WALL, BD, -BW / 2 + WALL / 2, 0);
    wall(WALL, BD, BW / 2 - WALL / 2, 0);
    const floorB = new THREE.Mesh(new THREE.BoxGeometry(BW, 0.02, BD), cloth);
    floorB.position.y = 0.01;
    g.add(floorB);
    // inside: white tissue folded over, lying in soft ridges, and a card tucked in it
    {
      const tg = new THREE.PlaneGeometry(BW - WALL * 2.2, BD - WALL * 2.2, 40, 30);
      const p = tg.attributes.position;
      for (let k = 0; k < p.count; k++) {
        const px = p.getX(k), py = p.getY(k);
        p.setZ(k, 0.025 * Math.sin(px * 9 + Math.sin(py * 5) * 1.5) + 0.012 * Math.sin(py * 17 + px * 3));
      }
      tg.computeVertexNormals();
      const tissue = new THREE.Mesh(tg, new THREE.MeshStandardMaterial({ color: "#f4f3ef", roughness: 0.9, side: THREE.DoubleSide }));
      tissue.rotation.x = -Math.PI / 2;
      tissue.position.y = BH - 0.08;
      g.add(tissue);
      const [c, x] = canvas(600, 400);
      x.fillStyle = PAPER;
      x.fillRect(0, 0, 600, 400);
      x.strokeStyle = "#2b2e32";
      x.fillStyle = "#2b2e32";
      sign(x, 300, 120, 48, 4);
      x.textAlign = "center";
      x.font = "italic 40px Georgia, serif";
      x.fillText("Benvida.", 300, 260);
      x.fillStyle = "#6f767a";
      x.font = `20px ${SANS}`;
      x.fillText("unha lembranza da ría para levar", 300, 310);
      const card = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.008, 0.4), [
        new THREE.MeshStandardMaterial({ color: PAPER }), new THREE.MeshStandardMaterial({ color: PAPER }),
        new THREE.MeshStandardMaterial({ map: tex(c), roughness: 0.8 }), new THREE.MeshStandardMaterial({ color: PAPER }),
        new THREE.MeshStandardMaterial({ color: PAPER }), new THREE.MeshStandardMaterial({ color: PAPER }),
      ]);
      card.position.set(0.12, BH - 0.035, 0.08);
      card.rotation.set(0.06, -0.18, 0.04);
      g.add(card);
      // three beach pebbles from the ría, worn smooth, resting on the tissue beside the card
      const stone = (base: [number, number, number], speck: string) => {
        const [sc, sx] = canvas(256, 256);
        const img = sx.createImageData(256, 256), d = img.data;
        for (let k = 0; k < d.length; k += 4) {
          const n = (Math.random() - 0.5) * 16;
          d[k] = base[0] + n; d[k + 1] = base[1] + n; d[k + 2] = base[2] + n; d[k + 3] = 255;
        }
        sx.putImageData(img, 0, 0);
        sx.fillStyle = speck;
        for (let k = 0; k < 260; k++) sx.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 2, 1 + Math.random() * 2);
        return new THREE.MeshStandardMaterial({ map: tex(sc), roughness: 0.62 });
      };
      const pebble = (r: number, sx: number, sz: number, mat: THREE.Material, x: number, z: number, rot: number, seed: number) => {
        const geo = new THREE.SphereGeometry(r, 40, 24);
        const p = geo.attributes.position;
        for (let k = 0; k < p.count; k++) {
          const vx = p.getX(k), vy = p.getY(k), vz = p.getZ(k);
          // flattened like a beach stone, its outline a little uneven
          const wob = 1 + Math.sin(vx * 18 + seed) * 0.03 + Math.sin(vz * 15 + seed * 2) * 0.03;
          p.setXYZ(k, vx * sx * wob, vy * (vy < 0 ? 0.32 : 0.42), vz * sz * wob);
        }
        geo.computeVertexNormals();
        const m = new THREE.Mesh(geo, mat);
        // pressed a little into the tissue, so it rests rather than hovers
        m.position.set(x, BH - 0.08 + r * 0.32 * 0.7, z);
        m.rotation.y = rot;
        g.add(m);
        // its shadow: dark and tight right under it, the way a stone sits on paper
        const sh = contact(r * 2 * sx * 0.8, r * 2 * sz * 0.8);
        (sh.material as THREE.MeshBasicMaterial).opacity = 0.9;
        sh.position.set(x + 0.01, BH - 0.08 + 0.004, z + 0.01);
        sh.rotation.z = rot;
        g.add(sh);
      };
      pebble(0.15, 1.25, 0.95, stone([150, 150, 146], "rgba(255,255,255,0.35)"), -0.38, -0.12, 0.4, 1);
      pebble(0.12, 1.1, 0.9, stone([205, 199, 186], "rgba(90,85,78,0.4)"), -0.22, 0.2, -0.6, 2.3);
      pebble(0.1, 1.3, 1.0, stone([86, 92, 94], "rgba(230,230,225,0.3)"), -0.47, 0.22, 1.1, 4.1);
    }
    g.add(contact(BW, BD));
    g.position.set(-2.55, 0, -0.55);
    add(g);
    // the lid, set down beside it: a shallow cover in the same linen, the sign in silver on top
    const LW = BW + 0.04, LD = BD + 0.04, LH = 0.1;
    const lid = new THREE.Group();
    const top = (() => {
      const [c, x] = canvas(1024, 750);
      x.drawImage((linen.image as HTMLCanvasElement), 0, 0, 1024, 750);
      return tex(c);
    })();
    const lidTop = new THREE.Mesh(new THREE.BoxGeometry(LW, LH, LD), [cloth, cloth, new THREE.MeshStandardMaterial({ map: top, roughness: 0.95 }), cloth, cloth, cloth]);
    lidTop.position.y = LH / 2;
    const [mc, mx] = canvas(1024, 750);
    mx.fillStyle = "#000";
    mx.fillRect(0, 0, 1024, 750);
    mx.strokeStyle = "#fff";
    mx.fillStyle = "#fff";
    // small and quiet on the linen
    sign(mx, 512, 330, 70, 6);
    word(mx, 512 - 100, 430, 200, 4);
    const mask = tex(mc, false);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(LW, LD), foilMat(mask));
    f.rotation.x = -Math.PI / 2;
    f.position.y = LH + 0.002;
    lid.add(lidTop, f, contact(LW, LD));
    lid.position.set(-2.55, 0, 0.74);
    lid.rotation.y = 0.04;
    add(lid);
  }
  // A notebook in Swiss binding: the sewn spine left bare, its signatures and coral thread on
  // show, the graphite cover glued only to the back, the sign in silver small on its front
  {
    const NW = 1.9, ND = 1.3, NT = 0.11, BOARD = 0.018;
    const g = new THREE.Group();
    // the page block: white edges with the fine lines of the leaves
    const leaves = (() => {
      const [c, x] = canvas(1024, 64);
      x.fillStyle = "#f2f1ec";
      x.fillRect(0, 0, 1024, 64);
      for (let y = 0; y < 64; y += 2) {
        x.fillStyle = `rgba(150,148,140,${0.12 + Math.random() * 0.1})`;
        x.fillRect(0, y, 1024, 1);
      }
      return tex(c);
    })();
    // the spine: the signatures stacked, each a slightly rounded band, the thread passing through
    // them in stitches, and the kettle stitches at each end
    const spine = (() => {
      const [c, x] = canvas(2048, 128);
      x.fillStyle = "#ece9e1";
      x.fillRect(0, 0, 2048, 128);
      const n = 7, bh = 128 / n;
      for (let i = 0; i < n; i++) {
        const g2 = x.createLinearGradient(0, i * bh, 0, (i + 1) * bh);
        g2.addColorStop(0, "rgba(255,255,255,0.5)");
        g2.addColorStop(0.5, "rgba(255,255,255,0)");
        g2.addColorStop(1, "rgba(80,76,68,0.28)");
        x.fillStyle = g2;
        x.fillRect(0, i * bh, 2048, bh);
      }
      x.fillStyle = "#d0664a";
      const stations = [140, 520, 900, 1148, 1528, 1908];
      for (let i = 0; i < n; i++)
        stations.forEach((sx, k) => {
          // the thread runs along inside each signature between stations, shows across the spine
          if (k % 2 === 0) x.fillRect(sx, i * bh + bh * 0.42, stations[k + 1] - sx, bh * 0.16);
          x.fillRect(sx - 4, i * bh + 2, 8, bh - 4);
        });
      return tex(c);
    })();
    const white = new THREE.MeshStandardMaterial({ color: "#f2f1ec", roughness: 0.85 });
    const leafMat = new THREE.MeshStandardMaterial({ map: leaves, roughness: 0.9 });
    const spineMat = new THREE.MeshStandardMaterial({ map: spine, roughness: 0.85 });
    // faces: +x, -x, +y, -y, +z (the spine, towards us), -z
    const block = new THREE.Mesh(new THREE.BoxGeometry(NW - 0.03, NT, ND - 0.03), [leafMat, leafMat, white, white, spineMat, leafMat]);
    block.position.y = BOARD + NT / 2;
    // the back cover, the one the block is glued to
    const coverMat = new THREE.MeshStandardMaterial({ color: GRAPHITE, roughness: 0.7 });
    const backB = new THREE.Mesh(new THREE.BoxGeometry(NW, BOARD, ND), coverMat);
    backB.position.y = BOARD / 2;
    // the front cover, lying on the block, stopping short of the bare spine
    const SHORT = 0.07;
    const [c, x] = canvas(1024, 700);
    x.fillStyle = "#000";
    x.fillRect(0, 0, 1024, 700);
    x.strokeStyle = "#fff";
    x.fillStyle = "#fff";
    sign(x, 512, 300, 56, 5);
    word(x, 512 - 90, 390, 180, 3.5);
    const frontMask = tex(c, false);
    const frontB = new THREE.Mesh(new THREE.BoxGeometry(NW, BOARD * 0.7, ND - SHORT), coverMat);
    frontB.position.set(0, BOARD + NT + (BOARD * 0.7) / 2, -SHORT / 2);
    const foil = new THREE.Mesh(new THREE.PlaneGeometry(NW, ND - SHORT), foilMat(frontMask));
    foil.rotation.x = -Math.PI / 2;
    foil.position.set(0, BOARD + NT + BOARD * 0.7 + 0.002, -SHORT / 2);
    g.add(block, backB, frontB, foil, contact(NW, ND));
    // up level with the palette, clear above the cards
    g.position.set(2.72, 0, -1.42);
    add(g);
  }
  // A card as it is cut: a thin slab with rounded corners, its faces printed edge to edge
  const roundedSlab = (w: number, d: number, t: number, r: number, cap: THREE.Material, edge: THREE.Material) => {
    const sh = new THREE.Shape();
    sh.moveTo(-w / 2 + r, -d / 2);
    sh.lineTo(w / 2 - r, -d / 2);
    sh.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r);
    sh.lineTo(w / 2, d / 2 - r);
    sh.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2);
    sh.lineTo(-w / 2 + r, d / 2);
    sh.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r);
    sh.lineTo(-w / 2, -d / 2 + r);
    sh.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false, curveSegments: 8 });
    // the faces take the whole picture, corner to corner
    const p = geo.attributes.position, uv = geo.attributes.uv;
    for (let k = 0; k < p.count; k++) uv.setXY(k, (p.getX(k) + w / 2) / w, (p.getY(k) + d / 2) / d);
    geo.rotateX(-Math.PI / 2);
    return new THREE.Mesh(geo, [cap, edge]);
  };

  // business cards: a stack of heavy white cotton card, and one on it that turns over to show its
  // graphite back. Front: the name and the role set small, the sign and the name of the house
  const front = face(850, 550, "#f5f4f0", (x) => {
    x.fillStyle = "#2b2e32";
    x.font = "30px Georgia, serif";
    x.fillText("Lúa Couto", 70, 380);
    x.fillStyle = "#7d8488";
    x.font = `20px ${SANS}`;
    x.fillText("directora", 70, 414);
    x.fillText("ola@ourela.gal · +34 981 000 404", 70, 480);
    x.fillStyle = "#d0664a";
    x.fillRect(70, 440, 34, 2);
    // the sign and the name of the house, printed in graphite: silver vanishes on white card
    x.strokeStyle = "#2b2e32";
    sign(x, 108, 112, 38, 4);
    word(x, 160, 96, 150, 2.6);
  });
  // back: graphite, the sign alone and large, off centre, in silver
  const back = face(850, 550, GRAPHITE, () => {}, (x) => {
    sign(x, 640, 300, 130, 7);
  });
  const cotton = new THREE.MeshStandardMaterial({ map: front.map, roughness: 0.9 });
  const cottonEdge = new THREE.MeshStandardMaterial({ color: "#f1efe9", roughness: 0.95 });
  for (let k = 0; k < 7; k++) {
    const cardK = roundedSlab(0.85, 0.55, 0.009, 0.02, cotton, cottonEdge);
    const g = new THREE.Group();
    g.add(cardK);
    if (k === 0) g.add(contact(0.85, 0.55));
    g.position.set(2.025 + (k % 2) * 0.004, k * 0.009, 0.025 - k * 0.0015);
    g.rotation.y = (k % 3) * 0.006 - 0.006;
    add(g);
  }
  const flip = new THREE.Group();
  {
    const t = 0.0045;
    const top = roundedSlab(0.85, 0.55, t, 0.02, cotton, cottonEdge);
    const backMap = back.map;
    backMap.wrapS = THREE.RepeatWrapping;
    backMap.repeat.x = -1; // seen from below, its picture turned to read right once the card is over
    const under = roundedSlab(0.85, 0.55, t, 0.02, new THREE.MeshStandardMaterial({ map: backMap, roughness: 0.75 }), new THREE.MeshStandardMaterial({ color: GRAPHITE, roughness: 0.8 }));
    under.position.y = -t;
    flip.add(top, under);
    const backMask = back.mask!;
    backMask.wrapS = THREE.RepeatWrapping;
    backMask.repeat.x = -1;
    const f2 = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.55), foilMat(backMask));
    f2.rotation.x = Math.PI / 2;
    f2.position.y = -t - 0.002;
    flip.add(f2);
    flip.position.set(2.025, 0.068, 0.025);
    add(flip);
  }
  // the room key: a glossy card in the sea blue, the house's own colour for its rooms. The room's
  // number large in silver, the sign, the contactless mark, and a fine white rule
  const key = new THREE.Group();
  {
    const KW = 0.856, KD = 0.54;
    const art = face(856, 540, "#2f5f62", (x) => {
      x.fillStyle = "rgba(255,255,255,0.85)";
      x.font = `500 18px ${SANS}`;
      x.fillText("H A B I T A C I Ó N", 60, 92);
      x.fillStyle = "rgba(255,255,255,0.35)";
      x.fillRect(60, 420, 736, 1.5);
      x.fillStyle = "rgba(255,255,255,0.7)";
      x.font = `18px ${SANS}`;
      x.fillText("ourela · casa de mar · cedeira", 60, 470);
      // the contactless mark: three arcs
      x.strokeStyle = "rgba(255,255,255,0.7)";
      x.lineWidth = 3;
      x.lineCap = "round";
      [14, 24, 34].forEach((rr) => {
        x.beginPath();
        x.arc(760, 92, rr, -Math.PI / 4, Math.PI / 4);
        x.stroke();
      });
    }, (x) => {
      x.font = "200px Georgia, serif";
      x.fillText("04", 56, 330);
      sign(x, 700, 300, 70, 5);
    });
    const pvc = new THREE.MeshPhysicalMaterial({ map: art.map, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.12 });
    const slab = roundedSlab(KW, KD, 0.012, 0.035, pvc, new THREE.MeshStandardMaterial({ color: "#264e51", roughness: 0.4 }));
    const foil = new THREE.Mesh(new THREE.PlaneGeometry(KW, KD), foilMat(art.mask!));
    foil.rotation.x = -Math.PI / 2;
    foil.position.y = 0.0135;
    key.add(slab, foil, contact(KW, KD));
    key.position.set(2.025, 0, 0.72);
    add(key);
  }

  // a lanyard laid along the foot of the brochure: a flat strap in the brand's green with the name
  // woven along it, drawn out into a long loop, its two ends meeting at a steel clip
  {
    const [c, x] = canvas(2048, 64);
    x.fillStyle = "#2f5f62";
    x.fillRect(0, 0, 2048, 64);
    // the weave's fine ribs
    for (let px = 0; px < 2048; px += 3) {
      x.fillStyle = `rgba(0,0,0,${0.05 + Math.random() * 0.05})`;
      x.fillRect(px, 0, 1, 64);
    }
    x.fillStyle = "#e6e2da";
    x.font = `400 28px ${SANS}`;
    for (let px = 30; px < 2048; px += 300) x.fillText("O U R E L A", px, 42);
    const strapTex = tex(c);
    strapTex.wrapS = THREE.RepeatWrapping;
    const L = 1.3; // half the loop's length
    // let fall onto the table as it would be: loose, the strap wandering in soft bends, the loop
    // turning back over itself once on the way to the clip
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(L + 0.05, 0, 0.02),
      new THREE.Vector3(L * 0.7, 0, -0.16),
      new THREE.Vector3(L * 0.25, 0, -0.08),
      new THREE.Vector3(-L * 0.2, 0, -0.27),
      new THREE.Vector3(-L * 0.7, 0, -0.2),
      new THREE.Vector3(-L * 0.98, 0, 0.02),
      new THREE.Vector3(-L * 0.78, 0, 0.24),
      new THREE.Vector3(-L * 0.35, 0, 0.12),
      new THREE.Vector3(-L * 0.05, 0, -0.14),
      new THREE.Vector3(L * 0.3, 0, 0.1),
      new THREE.Vector3(L * 0.62, 0, 0.2),
      new THREE.Vector3(L + 0.05, 0, 0.06),
    ]);
    // a ribbon following the curve, flat on the table
    const N = 300, SWD = 0.075;
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, p = curve.getPoint(u), tg = curve.getTangent(u);
      const nx = -tg.z, nz = tg.x, l = Math.hypot(nx, nz) || 1;
      const py = 0.004 + u * 0.006; // the later length lies over the earlier where they cross
      pos.push(p.x + (nx / l) * SWD / 2, py, p.z + (nz / l) * SWD / 2, p.x - (nx / l) * SWD / 2, py, p.z - (nz / l) * SWD / 2);
      // the woven name reads the right way round, as on the real strap
      uv.push(u * 2.6, 0, u * 2.6, 1);
      if (i < N) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const strap = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: strapTex, roughness: 0.8, side: THREE.DoubleSide }));
    strap.receiveShadow = true;
    // the clip: a steel crimp where the ends meet, and the swivel hook beyond it
    const steelM = new THREE.MeshStandardMaterial({ color: "#c9ced1", metalness: 1, roughness: 0.3 });
    const crimp = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.03, 0.1), steelM);
    crimp.position.set(L + 0.08, 0.015, 0);
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 10, 30), steelM);
    hook.rotation.x = Math.PI / 2;
    hook.position.set(L + 0.19, 0.012, 0);
    const g = new THREE.Group();
    g.add(strap, crimp, hook);
    g.position.set(0.0, 0, 1.62);
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
    // up top, to the right of the vase, above the brochure; it fans open away from it
    fan.position.set(-0.85, 0.008, -1.4);
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
    // off centre, towards the left column, so the brochure keeps the middle to itself
    vase.position.set(-1.4, 0, -1.55);
    add(vase);
  }
  // The phone, lying beside the cards, with the house's site on its screen: the brand's digital side
  let screenMap: THREE.Texture;
  {
    // the page as long as its content, so scrolled to its foot it never shows an empty screen
    const W = 460, H = 2000, SANS2 = SANS;
    const [c, x] = canvas(W, H);
    x.fillStyle = "#f6f5f2";
    x.fillRect(0, 0, W, H);
    // a photograph cropped to fill a box, as a site's image block does
    const cover = (img: HTMLImageElement, bx: number, by: number, bw: number, bh: number, r = 0) => {
      const s = Math.max(bw / img.width, bh / img.height), w = img.width * s, h = img.height * s;
      x.save();
      x.beginPath();
      x.roundRect(bx, by, bw, bh, r);
      x.clip();
      x.drawImage(img, bx + (bw - w) / 2, by + (bh - h) / 2, w, h);
      x.restore();
    };
    // the first view: the beach, full bleed, the header and the line over it
    cover(photos.beach, 0, 0, W, 900);
    const shade = x.createLinearGradient(0, 380, 0, 900);
    shade.addColorStop(0, "rgba(20,30,34,0)");
    shade.addColorStop(1, "rgba(20,30,34,0.62)");
    x.fillStyle = shade;
    x.fillRect(0, 0, W, 900);
    const top = x.createLinearGradient(0, 0, 0, 160);
    top.addColorStop(0, "rgba(20,30,34,0.35)");
    top.addColorStop(1, "rgba(20,30,34,0)");
    x.fillStyle = top;
    x.fillRect(0, 0, W, 160);
    // status bar
    x.fillStyle = "#ffffff";
    x.font = `600 17px ${SANS2}`;
    x.fillText("9:41", 34, 40);
    x.fillRect(372, 28, 24, 12);
    x.fillRect(400, 28, 30, 12);
    // header
    x.strokeStyle = "#ffffff";
    sign(x, 50, 100, 20, 2.6);
    word(x, 82, 91, 100, 2);
    x.fillRect(398, 94, 28, 2);
    x.fillRect(398, 104, 28, 2);
    // the line and the button
    x.fillStyle = "#ffffff";
    x.font = "44px Georgia, serif";
    x.fillText("Volver", 34, 710);
    x.fillText("á ourela.", 34, 762);
    x.font = `16px ${SANS2}`;
    x.fillStyle = "rgba(255,255,255,0.85)";
    x.fillText("Seis habitacións fronte á ría de Cedeira", 36, 800);
    x.beginPath();
    x.roundRect(34, 830, 180, 48, 24);
    x.fillStyle = "#f6f5f2";
    x.fill();
    x.fillStyle = "#1f2a30";
    x.textAlign = "center";
    x.font = `600 16px ${SANS2}`;
    x.fillText("Reservar", 124, 860);
    x.textAlign = "left";
    // the rooms, as a quiet list: name, a line about it, the price, a hairline between
    x.fillStyle = "#1f2a30";
    x.font = "italic 30px Georgia, serif";
    x.fillText("Habitacións", 34, 980);
    const rooms: [string, string, string][] = [
      ["Salitre", "vista á ría · 24 m²", "140 €"],
      ["Area", "terraza ao sur · 20 m²", "120 €"],
      ["Cons", "xanela ao xardín · 18 m²", "110 €"],
      ["Ourizo", "baixo cuberta · 22 m²", "125 €"],
      ["Faro", "a máis alta · 26 m²", "150 €"],
      ["Ribeira", "porta á rúa · 19 m²", "115 €"],
    ];
    rooms.forEach(([name, line, price], i) => {
      const y = 1060 + i * 120;
      x.fillStyle = "#1f2a30";
      x.font = "26px Georgia, serif";
      x.fillText(name, 34, y);
      x.fillStyle = "#7d8488";
      x.font = `15px ${SANS2}`;
      x.fillText(line, 34, y + 30);
      x.textAlign = "right";
      x.fillStyle = "#1f2a30";
      x.font = `16px ${SANS2}`;
      x.fillText(price, 426, y);
      x.textAlign = "left";
      x.fillStyle = "#e1e3e3";
      x.fillRect(34, y + 58, 392, 1.5);
    });
    // the address and the booking line at the foot
    x.fillStyle = "#1f2a30";
    x.font = "italic 26px Georgia, serif";
    x.fillText("Como chegar", 34, 1860);
    x.fillStyle = "#7d8488";
    x.font = `15px ${SANS2}`;
    ["Rúa da Ribeira 4, 15350 Cedeira", "A 45 minutos de Ferrol", "ola@ourela.gal · +34 981 000 404"].forEach((l, i) => x.fillText(l, 34, 1900 + i * 28));    screenMap = tex(c);
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
    // the glass over the screen takes the window's light as a soft sheen across it
    const sheen = (() => {
      const [sc, sx] = canvas(256, 512);
      const sg = sx.createLinearGradient(0, 0, 256, 512);
      sg.addColorStop(0, "rgba(255,255,255,0)");
      sg.addColorStop(0.42, "rgba(255,255,255,0)");
      sg.addColorStop(0.5, "rgba(255,255,255,0.10)");
      sg.addColorStop(0.62, "rgba(255,255,255,0)");
      sx.fillStyle = sg;
      sx.fillRect(0, 0, 256, 512);
      return tex(sc);
    })();
    const gloss = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 1.52), new THREE.MeshBasicMaterial({ map: sheen, transparent: true, depthWrite: false }));
    gloss.rotation.x = -Math.PI / 2;
    gloss.position.y = 0.0825;
    gloss.userData.flat = true;
    phone.add(body, glass, screen, gloss, contact(0.76, 1.56));
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
      // the text, set as print is: a serif at reading size, ragged right
      x.fillStyle = "#5a6064";
      x.font = "19px Georgia, serif";
      ["Unha casa de indianos na ribeira,", "restaurada pedra a pedra. Seis", "habitacións, todas co mar diante;", "almorzo na mesa grande, con pan", "do forno da vila e marmelada de", "figo feita na casa."].forEach((l, i) => x.fillText(l, 60, 470 + i * 30));
      // the house, photographed
      const img = photos.facade, bw = 380, bh = 300, bx = 60, by = 690;
      const sc = Math.max(bw / img.width, bh / img.height);
      x.save();
      x.beginPath();
      x.rect(bx, by, bw, bh);
      x.clip();
      x.drawImage(img, bx + (bw - img.width * sc) / 2, by + (bh - img.height * sc) / 2, img.width * sc, img.height * sc);
      x.restore();
      x.fillStyle = "#8d9397";
      x.font = `16px ${SANS}`;
      x.fillText("A fachada, desde a rúa da Ribeira", 60, 1020);
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
    // opened, a folded sheet never lies quite flat: the side panels keep a little lift at the fold
    leftHinge.rotation.z = -Math.PI * (1 - openL) - 0.035 * openL;
    rightHinge.rotation.z = Math.PI * (1 - openR) + 0.035 * openR;
    bShadow.scale.x = 1 + openL + openR;
    bShadow.position.x = 0.035 + (PW * (openR - openL)) / 2;
    // the site on the phone scrolls down the page and back, as someone reads it
    // the top card turns over: lifted, turned in one easy arc, set down on the stack again (resting
    // on it exactly, so nothing jumps as it lands), and turned back before the loop ends
    const turn = span(t, 4.4, 6.0) - span(t, 9.0, 10.6);
    flip.rotation.x = Math.PI * turn;
    flip.position.y = 0.068 + Math.sin(Math.PI * turn) * 0.28;
    const slide = span(t, 5.2, 6.6) - span(t, 11.4, 12.6);
    key.position.z = 0.72 + (1 - slide) * 2.4;
    // the swatch book fans open, chip by chip, and closes again before the loop ends
    fanStrips.forEach((p, i) => {
      const open = span(t, 0.6 + i * 0.12, 2.2 + i * 0.12) - span(t, 11.2 - i * 0.08, 12.4 - i * 0.08);
      p.rotation.y = open * i * 0.09;
    });
  };
  animate(0);

  /* ---------- light: a window to the left, its frame falling across the table ---------- */
  scene.add(new THREE.HemisphereLight("#eef2f4", "#8a9296", 0.7));
  const sun = new THREE.SpotLight("#fff8f0", 340, 60, Math.PI / 8, 0.3, 1.2);
  sun.position.set(-13, 15, -5);
  sun.target.position.set(0.3, 0, 0.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1536, 1536);
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
    // while another discipline is on view, it holds still and draws nothing
    if (paused.current) return;
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

const StationeryScene: React.FC<{ className?: string; paused?: boolean }> = ({ className = "", paused = false }) => {
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
    <div className={`relative overflow-hidden transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"} ${className}`} style={{ background: BG }}>
      <div ref={host} className="absolute inset-0" />
      {/* a photograph's finish: the corners falling off a little, and a fine grain over all of it */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(30,34,38,0.28) 100%)" }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
    </div>
  );
};

export default StationeryScene;
