import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { FUGA, FUGA_WEIGHT, HAUS, HAUS_WEIGHT, type Pt } from "../Monolith/wordmark3d";

/**
 * A pair of modern over-ear headphones in silver, floating in the lab's dark beside the record.
 * A wide flat band, grey padding under it, that runs down without a break into each housing: seen
 * from the side, a tall rounded square, the arm straight at the back and sweeping out in a curve
 * at the front. Cushions as broad and nearly as thick as the housings, and on each back, gently
 * domed, a disc of spun metal. It turns slowly and leans a little towards the pointer.
 */

// satin rather than polished: the light spreads over it softly instead of gathering in bright streaks
const SILVER = new THREE.MeshPhysicalMaterial({ color: "#c4c5ca", metalness: 0.8, roughness: 0.52 });
const PAD = new THREE.MeshStandardMaterial({ color: "#4a4b50", metalness: 0, roughness: 1 });
const HOLLOW = new THREE.MeshStandardMaterial({ color: "#3a3b3f", roughness: 0.95, side: THREE.DoubleSide });

// The proportions, in one place
const CX = 1.36; // the housings' middle plane, either side
const A = 0.72, B = 0.82, SQ = 2.2; // the cup: half width, half height, and how square its round
const CUP = -0.1; // the cup sits a little forward of the arm
const NECK = 1.1; // where the housing meets the band
const ARM = 0.24; // half the band's width
const BAND = 0.06; // half the band's thickness
const DOME = 0.035; // how far the outer face swells

// The housing's depth either side of its middle plane: thin at the top where it is the band, and
// on the outside opening out towards the bottom, so the back leans out as in a wedge; the inside
// stays upright against the cushion
const settle = (y: number) => {
  const u = Math.min(1, Math.max(0, (y - 0.45) / (NECK - 0.45)));
  return u * u * (3 - 2 * u);
};
const outer = (y: number) => { const c = 0.13 - 0.06 * y; return c + (BAND - c) * settle(y); };
const inner = (y: number) => 0.08 + (BAND - 0.08) * settle(y);

// a point on a superellipse: a rounded square, as squared as `p`
const sup = (a: number, b: number, p: number, t: number) =>
  new THREE.Vector2(a * Math.sign(Math.cos(t)) * Math.pow(Math.abs(Math.cos(t)), 2 / p), b * Math.sign(Math.sin(t)) * Math.pow(Math.abs(Math.sin(t)), 2 / p));

// The studio's wordmark cut into the disc, from the same strokes as every logo on the site: a dark
// line for the cut, a fine light one on its lower edge where the wall of the cut catches the light
function engrave(x: CanvasRenderingContext2D, relief = false, strong = false) {
  const line = (pts: Pt[]) => {
    x.beginPath();
    x.moveTo(pts[0][0], pts[0][1]);
    for (let k = 1; k < pts.length - 1; k++) {
      const [px, py, r] = pts[k];
      if (r) x.arcTo(px, py, pts[k + 1][0], pts[k + 1][1], r);
      else x.lineTo(px, py);
    }
    x.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
    x.stroke();
  };
  const all = (dx: number, dy: number, style: string, thin: number) => {
    x.save();
    x.translate(dx, dy);
    x.strokeStyle = style;
    x.lineWidth = FUGA_WEIGHT - thin;
    FUGA.flat().forEach(line);
    x.lineWidth = HAUS_WEIGHT - thin * 0.4;
    HAUS.forEach(line);
    x.restore();
  };
  x.save();
  x.globalAlpha = 1;
  x.lineCap = "butt";
  x.lineJoin = "miter";
  // the logo spans about x 250–1640, y 680–1080 in its own units: fitted across the disc's middle
  const s = 560 / 1390;
  x.translate(512, 512);
  x.scale(s, s);
  x.translate(-945, -880);
  if (relief) {
    // the height of the letters for the bump map: soft shoulders, then the flat top
    x.filter = "blur(6px)";
    all(0, 0, "#fff", -6);
    x.filter = "blur(2px)";
    all(0, 0, "#fff", 0);
    x.filter = "none";
  } else {
    all(0, 5, strong ? "rgba(250,250,252,0.35)" : "rgba(250,250,252,0.4)", 6);
    all(0, 0, strong ? "rgba(70,71,77,0.42)" : "rgba(90,91,97,0.45)", 0);
  }
  x.restore();
}

// The spun disc: a soft cross of light over fine rings, as turned metal catches it
function spun() {
  const c = document.createElement("canvas");
  c.width = c.height = 1024;
  const x = c.getContext("2d")!;
  const cone = x.createConicGradient(0.5, 512, 512);
  [0, 0.25, 0.5, 0.75, 1].forEach((p) => cone.addColorStop(p, "#6e6f75"));
  [0.125, 0.375, 0.625, 0.875].forEach((p) => cone.addColorStop(p, "#e8e9ec"));
  x.fillStyle = cone;
  x.fillRect(0, 0, 1024, 1024);
  x.globalAlpha = 0.3;
  for (let r = 512; r > 3; r -= 1.1) {
    const v = 140 + Math.round(Math.random() * 100);
    x.strokeStyle = `rgb(${v},${v},${v})`;
    x.lineWidth = 0.7;
    x.beginPath();
    x.arc(512, 512, r, 0, Math.PI * 2);
    x.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// The wordmark engraved in the band, just above where it meets each housing: a quiet cut, read on the
// flat of the silver without standing out from it (on the spun disc it was lost in the rings)
function bandMark() {
  const c = document.createElement("canvas");
  c.width = c.height = 1024;
  engrave(c.getContext("2d")!, false, true);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  // only the logo's own box of the square
  t.repeat.set(620 / 1024, 210 / 1024);
  t.offset.set((512 - 310) / 1024, (512 - 105) / 1024);
  return t;
}

// The housing's outline seen from the side (x forward-back, y up): the cup a tall rounded square,
// and from it the arm, the band's width, rising straight at the back and in a curve at the front
function outline() {
  const s = new THREE.Shape();
  const at = (deg: number) => sup(A, B, SQ, (deg * Math.PI) / 180).add(new THREE.Vector2(CUP, 0));
  // the way round the cup at a point, so the arm runs into it without a corner
  const along = (deg: number) => at(deg + 0.5).sub(at(deg - 0.5)).normalize();
  const F = 168, K = 392; // where the arm's curves meet the round, front and back
  const front = at(F), back = at(K);
  s.moveTo(-ARM, NECK);
  s.bezierCurveTo(-ARM, NECK - 0.32, front.x - along(F).x * 0.42, front.y - along(F).y * 0.42, front.x, front.y);
  for (let d = F + 2; d <= K; d += 2) {
    const p = at(d);
    s.lineTo(p.x, p.y);
  }
  s.bezierCurveTo(back.x + along(K).x * 0.42, back.y + along(K).y * 0.42, ARM, NECK - 0.32, ARM, NECK);  s.closePath();
  return s;
}

// The housing as one smooth solid: the outline with faces either side, rounded over at the edge;
// the outer face swells a little, and the depth draws in as it rises until at the top it is the
// band's own thickness
function housing() {
  const N = 240, C = new THREE.Vector2(CUP * 0.5, 0.25), EDGE = 0.02;
  const rim = outline().getSpacedPoints(N).slice(0, N);
  const prof: [number, number][] = []; // [where along it, which stretch: 0 outer face, 1 outer round, 2 side, 3 inner round, 4 inner face]
  const FLAT = 12, ROUND = 6, SIDE = 6;
  for (let i = 0; i <= FLAT; i++) prof.push([i / FLAT, 0]);
  for (let i = 1; i <= ROUND; i++) prof.push([i / ROUND, 1]);
  for (let i = 1; i < SIDE; i++) prof.push([i / SIDE, 2]);
  for (let i = 0; i < ROUND; i++) prof.push([i / ROUND, 3]);
  for (let i = FLAT; i >= 0; i--) prof.push([i / FLAT, 4]);
  const pos: number[] = [];
  for (let j = 0; j < N; j++) {
    const d = rim[j].clone().sub(C), L = d.length();
    const yo = rim[j].y, o = outer(yo), n = inner(yo);
    for (const [s, part] of prof) {
      let r: number, z: number;
      if (part === 0 || part === 4) {
        r = s * (L - EDGE);
        const p = C.clone().add(d.clone().multiplyScalar(r / L));
        // the outer face swells a little over the cup; the inner face is flat
        z = part === 0 ? outer(p.y) + DOME * (1 - s * s) * Math.min(1, outer(p.y) / 0.12) : -inner(p.y);
      } else if (part === 1) {
        // a small, tight round: the edge reads as a fine line of light
        const a = (s * Math.PI) / 2;
        r = L - EDGE + EDGE * Math.sin(a);
        z = o - EDGE + EDGE * Math.cos(a);
      } else if (part === 2) {
        r = L;
        z = o - EDGE + (-(n - EDGE) - (o - EDGE)) * s;
      } else {
        const a = Math.PI / 2 + (s * Math.PI) / 2;
        r = L - EDGE + EDGE * Math.sin(a);
        z = -(n - EDGE) + EDGE * Math.cos(a);
      }
      const q = C.clone().add(d.clone().multiplyScalar(r / L));
      pos.push(q.x, q.y, z);
    }
  }  return grid(pos, N, prof.length, true, false);
}

// Triangles over a grid of points, rows of `m`, wrapping round either way as asked
function grid(pos: number[], n: number, m: number, wrapN: boolean, wrapM: boolean, flip = false) {
  const idx: number[] = [];
  const rows = wrapN ? n : n - 1, cols = wrapM ? m : m - 1;
  for (let j = 0; j < rows; j++) {
    const jn = (j + 1) % n;
    for (let i = 0; i < cols; i++) {
      const inn = (i + 1) % m;
      const a = j * m + i, b = j * m + inn, c = jn * m + i, d = jn * m + inn;
      if (flip) idx.push(a, c, b, b, c, d);
      else idx.push(a, b, c, b, d, c);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

// The band's arch runs a little past a half ellipse at either end, so its ends come down leaning
// in, closing the round towards the head
const OVER = 0.13;
const SPAN = CX / Math.cos(OVER); // the arch's half width at its widest
// how far each housing leans in, to follow the band's end
const LEAN = (H: number) => Math.atan((SPAN * Math.sin(OVER)) / (H * Math.cos(OVER)));

// A strip swept along the band's arc, its section a rounded rectangle
function strip(a: number, b: number, inset: number, base: number, h: number, fade = false) {
  const NA = 160, NC = 48, P = 5;
  const pos: number[] = [];
  for (let i = 0; i <= NA; i++) {
    const t = -OVER + ((Math.PI + 2 * OVER) * i) / NA;
    const px = SPAN * Math.cos(t), py = base + h * Math.sin(t);
    const nx = h * Math.cos(t), ny = SPAN * Math.sin(t), nl = Math.hypot(nx, ny);
    // the padding thins to nothing towards each end and sinks into the band, short of the housing
    const e = Math.min(i, NA - i) / NA;
    const k = fade ? Math.min(1, Math.max(0, (e - 0.04) / 0.12)) : 1;
    const f = k * k * (3 - 2 * k);
    const aa = a * (0.05 + 0.95 * f), off = BAND - 0.01 + (inset - BAND + 0.01) * f;
    for (let j = 0; j < NC; j++) {
      const s = sup(aa, b, P, (2 * Math.PI * j) / NC);
      const u = s.x - (fade ? off : inset);
      pos.push(px + (nx / nl) * u, py + (ny / nl) * u, s.y);
    }
  }
  return grid(pos, NA + 1, NC, false, true, true);
}

// The ear cushion: a thick soft ring of the cup's own rounded square, its section a rounded
// block, swept round; centred on its own middle, its depth along x
function cushion(ra: number, rv: number) {
  const NA = 180, NC = 40;
  const pos: number[] = [], uv: number[] = [];
  // one row and one column more than the round needs, closing it on themselves, so the leather's
  // grain can be laid over it without a jump
  for (let i = 0; i <= NA; i++) {
    const t = (2 * Math.PI * (i % NA)) / NA;
    const p = sup(A - ra, B - ra, SQ, t);
    const q = sup(A - ra, B - ra, SQ, t + 0.001);
    const tx = q.x - p.x, ty = q.y - p.y, tl = Math.hypot(tx, ty);
    const nx = ty / tl, ny = -tx / tl; // out from the ring
    for (let j = 0; j <= NC; j++) {
      const w = (2 * Math.PI * (j % NC)) / NC;
      // a rounded block, but full, as a cushion plumped up
      const s = sup(ra, rv, 2.6, w);
      // the leather's soft pleats, round the outside of the ring
      const pleat = 1 + 0.035 * Math.sin(t * 64) * Math.max(0, Math.cos(w));
      pos.push(s.y, p.y + ny * s.x * pleat, p.x + nx * s.x * pleat);
      uv.push(i / NA, j / NC);
    }
  }
  const geo = grid(pos, NA + 1, NC + 1, false, false);
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  // the doubled seams share one normal, so the light runs on across them
  const n = geo.attributes.normal as THREE.BufferAttribute, M = NC + 1;
  const join = (a: number, b: number) => {
    const v = new THREE.Vector3().fromBufferAttribute(n, a).add(new THREE.Vector3().fromBufferAttribute(n, b)).normalize();
    n.setXYZ(a, v.x, v.y, v.z);
    n.setXYZ(b, v.x, v.y, v.z);
  };
  for (let j = 0; j <= NC; j++) join(j, NA * M + j);
  for (let i = 0; i <= NA; i++) join(i * M, i * M + NC);
  return geo;
}

// The cushions' surface: a fine irregular grain of soft pores, tiling seamlessly, for their height
function grain() {
  const S = 512;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const x = c.getContext("2d")!;
  x.fillStyle = "#808080";
  x.fillRect(0, 0, S, S);
  for (let k = 0; k < 5200; k++) {
    const px = Math.random() * S, py = Math.random() * S, r = 2 + Math.random() * 5;
    const dark = Math.random() < 0.6;
    for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {
      const cx = px + ox, cy = py + oy;
      if (cx < -r || cx > S + r || cy < -r || cy > S + r) continue;
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, dark ? "rgba(30,30,30,0.55)" : "rgba(220,220,220,0.45)");
      g.addColorStop(1, "rgba(128,128,128,0)");
      x.fillStyle = g;
      x.fillRect(cx - r, cy - r, 2 * r, 2 * r);
    }
  }
  // and the pores proper: small sharp pits all over, as open-cell foam under its cover, dense enough to read
  for (let k = 0; k < 20000; k++) {
    const px = Math.random() * S, py = Math.random() * S, r = 0.6 + Math.random() * 1.9;
    x.fillStyle = `rgba(10,10,10,${0.45 + Math.random() * 0.4})`;
    x.beginPath();
    x.arc(px, py, r, 0, Math.PI * 2);
    x.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(30, 6);
  t.anisotropy = 8;
  return t;
}

function headphones() {
  const g = new THREE.Group();
  const DISC = new THREE.MeshPhysicalMaterial({ map: spun(), metalness: 1, roughness: 0.26 });
  // the right disc shows the cylinder's other cap, which carries the picture a half turn round:
  // turned back, so the wordmark reads upright on both sides
  const half = (t: THREE.Texture) => {
    const c = t.clone();
    c.center.set(0.5, 0.5);
    c.rotation = Math.PI;
    return c;
  };
  const DISC_R = DISC.clone();
  DISC_R.map = half(DISC.map!);
  // a tall round arch, a touch higher than a half circle
  const H = 1.55, BASE = NECK - 0.12 + H * Math.sin(OVER);

  // the band, silver, and its grey padding underneath; both run down into the housings
  g.add(new THREE.Mesh(strip(BAND, ARM, 0, BASE, H), SILVER));
  g.add(new THREE.Mesh(strip(0.065, ARM - 0.015, BAND + 0.06, BASE, H, true), PAD));

  // the wordmark on the outside of the band, on either side a little above the housing, engraved along
  // the band's length
  {
    const MARK = new THREE.MeshStandardMaterial({ map: bandMark(), transparent: true, metalness: 0.5, roughness: 0.45, polygonOffset: true, polygonOffsetFactor: -2 });
    const W = 0.58, Hm = W * (210 / 620);
    const py = NECK + 0.4, t = Math.asin((py - BASE) / H);
    const speed = Math.hypot(SPAN * Math.sin(t), H * Math.cos(t)); // the arc's length per unit of its angle
    for (const side of [-1, 1]) {
      // laid along the band, centred between its edges, and bent with it: every point of the strip sits on
      // the band's own arc, so the letters follow its curve instead of touching it at one point; they read
      // from the top down, their tops towards the back on both sides
      const geo = new THREE.PlaneGeometry(W, Hm, 40, 1);
      const p = geo.attributes.position as THREE.BufferAttribute;
      for (let k = 0; k < p.count; k++) {
        const u = p.getX(k), v = p.getY(k);
        const tu = t - (side * u) / speed;
        const n = new THREE.Vector3(side * H * Math.cos(tu), SPAN * Math.sin(tu), 0).normalize();
        const at = new THREE.Vector3(side * SPAN * Math.cos(tu), BASE + H * Math.sin(tu), -v).addScaledVector(n, BAND + 0.004);
        p.setXYZ(k, at.x, at.y, at.z);
      }
      geo.computeVertexNormals();
      g.add(new THREE.Mesh(geo, MARK));
    }
  }

  const shell = housing();
  const RA = 0.19, RV = 0.2; // the cushion's half breadth and half thickness
  const ring = cushion(RA, RV);
  // the cushions soft and matte, a foam under a fine velour: no shine at all, only the grain and a
  // faint soft light at their edges, as cloth takes it
  const pores = grain();
  const LEATHER = new THREE.MeshPhysicalMaterial({
    color: "#4a4b50",
    roughness: 1,
    bumpMap: pores,
    bumpScale: 3.2,
    // the pits a touch darker in the colour too, so they show in soft light as well as in relief
    map: pores,
    sheen: 0.25,
    sheenRoughness: 1,
    sheenColor: new THREE.Color("#6e6e76"),
  });
  const hollow = new THREE.ShapeGeometry(
    new THREE.Shape(Array.from({ length: 96 }, (_, k) => sup(A - 2 * RA + 0.02, B - 2 * RA + 0.02, SQ, (2 * Math.PI * k) / 96))),
    1,
  );
  for (const side of [-1, 1]) {
    // each side leans in about the top of its housing, following the band's end
    const pivot = new THREE.Group();
    pivot.position.set(side * CX, NECK, 0);
    pivot.rotation.z = -side * LEAN(H);
    const part = new THREE.Group();
    part.position.set(-side * CX, -NECK, 0);
    pivot.add(part);
    g.add(pivot);

    // the housing: both turned the same way, the left one mirrored through its depth
    const h = new THREE.Mesh(shell, SILVER);
    h.rotation.y = Math.PI / 2;
    h.scale.z = side;
    h.position.x = side * CX;
    part.add(h);

    // the spun disc on the domed back
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.024, 128), [SILVER, DISC, side > 0 ? DISC_R : DISC]);
    // tilted with the face it sits on
    disc.rotation.set(0, 0, Math.PI / 2 + side * Math.atan(0.06));
    disc.position.set(side * (CX + outer(-0.06) + DOME + 0.008), -0.06, -CUP);
    part.add(disc);

    // the cushion against the inside of the cup, and the cloth in its hollow
    const c = new THREE.Mesh(ring, LEATHER);
    c.position.set(side * (CX - inner(0) - RV + 0.02), 0, -CUP);
    part.add(c);
    const cloth = new THREE.Mesh(hollow, HOLLOW);
    cloth.rotation.y = Math.PI / 2;
    cloth.position.set(side * (CX - inner(0) - 0.04), 0, -CUP);
    part.add(cloth);
  }
  g.position.y = -0.85;
  return g;
}
export const Headphones: React.FC<{ className?: string; active?: boolean }> = ({ className, active = false }) => {
  const host = useRef<HTMLDivElement>(null);
  // pointed at: they lift a little and turn to face the visitor
  const on = useRef(active);
  on.current = active;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // a little under, so the silver sits in the dim room and never glares
    // (brighter again in the lab's pale silver room: dimmed for the dark one, they read heavy and shadowed here)
    renderer.toneMappingExposure = 0.9;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = "block";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.8;
    // the lab's lights: a low lavender from the left, a violet from below right, a white key above
    const red = new THREE.PointLight("#9a8fc4", 2, 12);
    red.position.set(-3.2, 1.4, 2.2);
    const violet = new THREE.PointLight("#7a5aa8", 0.5, 12);
    violet.position.set(3, -1.6, 2);
    const key = new THREE.DirectionalLight("#ffffff", 0.9);
    key.position.set(1, 4, 3);
    scene.add(red, violet, key);

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    // drawn back a little: the headphones sit beside the record, not over its whole height
    camera.position.set(0, 0.2, 10.8);
    camera.lookAt(0, 0, 0);

    const phones = headphones();
    const turn = new THREE.Group();
    turn.add(phones);
    scene.add(turn);

    const size = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);

    // leaning towards the pointer, gently, wherever it is on the page
    const aim = { x: 0, y: 0 }, lean = { x: 0, y: 0 };
    let lift = 0;
    const onMove = (e: PointerEvent) => {
      aim.x = (e.clientX / window.innerWidth) * 2 - 1;
      aim.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // drawn only while on screen
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "20% 0px" });
    io.observe(el);

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clock = new THREE.Clock();
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const t = clock.getElapsedTime();
      lean.x += (aim.x - lean.x) * 0.04;
      lean.y += (aim.y - lean.y) * 0.04;
      const m = still ? 0 : 1;
      lift += ((on.current ? 1 : 0) - lift) * 0.06;
      turn.rotation.y = -0.95 + lift * 0.4 + m * (Math.sin(t * 0.35) * 0.32 * (1 - lift * 0.6) + lean.x * 0.25);
      turn.rotation.x = 0.12 - lift * 0.06 + m * (Math.sin(t * 0.27) * 0.05 + lean.y * 0.12);
      turn.rotation.z = -0.14 + lift * 0.1 + m * Math.sin(t * 0.22) * 0.04;
      turn.position.y = lift * 0.14 + m * Math.sin(t * 0.6) * 0.06;
      turn.scale.setScalar(1 + lift * 0.05);
      renderer.render(scene, camera);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      phones.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
      scene.environment?.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={host} aria-hidden className={className} />;
};

export default Headphones;
