import * as THREE from "three";

/**
 * The FUGA HAUS wordmark as solid geometry — the one model behind every
 * logo on the site, from the small corner mark to the sculpture in the index.
 *
 * Each stroke is the logo's exact outline: a flat bar following the same
 * centre-line, rounded where the logo is rounded and mitred where it is
 * sharp, extruded into a slab with a hairline bevel so the edges catch the
 * light. "haus" is built the same way with a finer bar, so both words have
 * real, balanced volume.
 */

const GAP = 30; // extra air before "ga", as on the logo
const UNIT = 300; // logo units per world unit
/** Bar weights in logo units. */
const FUGA_WEIGHT = 35;
const HAUS_WEIGHT = 7;
/** Extrusion depths in world units: Fuga a thin slab, haus a little shallower. */
const FUGA_DEPTH = 0.07;
const HAUS_DEPTH = 0.035;

type Pt = [x: number, y: number, r: number];

const FUGA: Pt[][][] = [
  // F
  [
    [[570, 695, 0], [267, 695, 33], [267, 976, 0]],
    [[267, 826, 0], [570, 826, 0]],
  ],
  // u
  [[[612, 755, 0], [612, 960, 35], [895, 960, 35], [895, 755, 0]]],
  // g
  [[[1225 + GAP, 960, 0], [950 + GAP, 960, 35], [950 + GAP, 772, 35], [1225 + GAP, 772, 0], [1225 + GAP, 1060, 35], [935 + GAP, 1060, 0]]],
  // a
  [[[1290 + GAP, 772, 0], [1590 + GAP, 772, 35], [1590 + GAP, 965, 0], [1300 + GAP, 965, 35], [1300 + GAP, 850, 35], [1590 + GAP, 850, 0]]],
];

// "haus" beneath the u, in the same geometric bar language as the wordmark:
// x-height 1010 → baseline 1071, the h's ascender rising to 988.
const HAUS: Pt[][] = [
  // h
  [[602, 988, 0], [602, 1071, 0]],
  [[602, 1010, 0], [660, 1010, 12], [660, 1071, 0]],
  // a
  [[678, 1010, 0], [740, 1010, 12], [740, 1071, 0], [682, 1071, 12], [682, 1040, 12], [740, 1040, 0]],
  // u
  [[756, 1010, 0], [756, 1071, 12], [818, 1071, 12], [818, 1010, 0]],
  // s
  [[898, 1010, 0], [838, 1010, 12], [838, 1040, 12], [898, 1040, 12], [898, 1071, 12], [836, 1071, 0]],
];

const toV2 = (x: number, y: number) => new THREE.Vector2((x - 945) / UNIT, -(y - 900) / UNIT);

/** Centre-line of one stroke as 2D points: straight runs, rounded corners sampled finely. */
function centreLine(pts: Pt[]): THREE.Vector2[] {
  const v = pts.map(([x, y]) => toV2(x, y));
  const out: THREE.Vector2[] = [v[0].clone()];
  for (let i = 1; i < v.length; i++) {
    const r = pts[i][2] / UNIT;
    const cur = v[i];
    if (r > 0 && i < v.length - 1) {
      const inDir = cur.clone().sub(v[i - 1]).normalize();
      const outDir = v[i + 1].clone().sub(cur).normalize();
      const a = cur.clone().addScaledVector(inDir, -r);
      const b = cur.clone().addScaledVector(outDir, r);
      out.push(a);
      new THREE.QuadraticBezierCurve(a, cur.clone(), b).getPoints(20).slice(1).forEach((p) => out.push(p));
    } else {
      out.push(cur.clone());
    }
  }
  return out;
}

/** Outline of a stroke of the given width around a centre-line (mitred joins, butt ends). */
function strokeOutline(line: THREE.Vector2[], width: number): THREE.Shape {
  const half = width / 2;
  const left: THREE.Vector2[] = [];
  const right: THREE.Vector2[] = [];
  const normal = (a: THREE.Vector2, b: THREE.Vector2) => {
    const d = b.clone().sub(a).normalize();
    return new THREE.Vector2(-d.y, d.x);
  };
  for (let i = 0; i < line.length; i++) {
    let n: THREE.Vector2;
    let len = half;
    if (i === 0) n = normal(line[0], line[1]);
    else if (i === line.length - 1) n = normal(line[i - 1], line[i]);
    else {
      const n1 = normal(line[i - 1], line[i]);
      const n2 = normal(line[i], line[i + 1]);
      n = n1.clone().add(n2).normalize();
      len = half / Math.max(n.dot(n1), 0.2); // miter
    }
    left.push(line[i].clone().addScaledVector(n, len));
    right.push(line[i].clone().addScaledVector(n, -len));
  }
  return new THREE.Shape([...left, ...right.reverse()]);
}

/** One stroke as an extruded slab centred on z = 0, with a hairline bevel. */
function strokeSlab(pts: Pt[], weight: number, depth: number): THREE.ExtrudeGeometry {
  const bevel = Math.min(0.006, (weight / UNIT) * 0.18);
  const geo = new THREE.ExtrudeGeometry(strokeOutline(centreLine(pts), weight / UNIT), {
    depth,
    bevelEnabled: true,
    bevelSize: bevel,
    bevelThickness: bevel * 1.3,
    bevelSegments: 3,
    curveSegments: 12,
  });
  geo.translate(0, 0, -depth / 2);
  geo.computeVertexNormals();
  return geo;
}

export type Wordmark = {
  /** Root group, centred on the logo's origin. */
  group: THREE.Group;
  /** One holder per letter of "Fuga", pivoting on its own centre; `userData.home` is its rest position. "haus" travels with the u. */
  glyphs: THREE.Group[];
  dispose: () => void;
};

/** Build the whole wordmark — Fuga and haus — from one material. */
export function buildWordmark(material: THREE.Material): Wordmark {
  const group = new THREE.Group();
  const geos: THREE.BufferGeometry[] = [];
  const addSlab = (parent: THREE.Object3D, pts: Pt[], weight: number, depth: number) => {
    const geo = strokeSlab(pts, weight, depth);
    geos.push(geo);
    const mesh = new THREE.Mesh(geo, material);
    parent.add(mesh);
    return mesh;
  };

  const glyphs = FUGA.map((strokes) => {
    const inner = new THREE.Group();
    strokes.forEach((s) => addSlab(inner, s, FUGA_WEIGHT, FUGA_DEPTH));
    const c = new THREE.Box3().setFromObject(inner).getCenter(new THREE.Vector3());
    inner.children.forEach((m) => m.position.sub(c));
    const holder = new THREE.Group();
    holder.position.copy(c);
    holder.userData.home = c.clone();
    holder.add(inner);
    group.add(holder);
    return holder;
  });

  // haus rides with the u, set just behind the Fuga face so the two words sit flush at the back
  const u = glyphs[1];
  const uInner = u.children[0] as THREE.Group;
  const home = u.userData.home as THREE.Vector3;
  HAUS.forEach((s) => {
    const mesh = addSlab(uInner, s, HAUS_WEIGHT, HAUS_DEPTH);
    mesh.position.set(-home.x, -home.y, (HAUS_DEPTH - FUGA_DEPTH) / 2);
  });

  return { group, glyphs, dispose: () => geos.forEach((g) => g.dispose()) };
}

/**
 * The brand finish: brushed satin metal in the logo's warm pearl, with the
 * long anisotropic highlight of a machined plate. Same on every logo.
 */
export function brandMetal(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: "#cfc5bd",
    metalness: 1,
    roughness: 0.3,
    anisotropy: 0.75,
    clearcoat: 0.35,
    clearcoatRoughness: 0.25,
  });
}

/**
 * A reflection environment painted in the landing's own colours: mauve high
 * on the left, pearl light on the right, sage-olive low down, and two soft
 * studio windows. The metal reflects the page it sits on.
 */
export function brandEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const g = c.getContext("2d")!;
  const base = g.createLinearGradient(0, 0, 1024, 512);
  base.addColorStop(0, "#6d5f66");
  base.addColorStop(0.35, "#9a9294");
  base.addColorStop(0.6, "#d6d1ce");
  base.addColorStop(1, "#f2eeec");
  g.fillStyle = base;
  g.fillRect(0, 0, 1024, 512);
  const pool = (x: number, y: number, r: number, color: string) => {
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, color);
    rg.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = rg;
    g.fillRect(0, 0, 1024, 512);
  };
  pool(120, 470, 320, "rgba(170,166,130,0.85)");
  pool(160, 60, 300, "rgba(98,80,100,0.7)");
  g.fillStyle = "rgba(255,255,255,0.95)";
  g.fillRect(560, 70, 260, 60);
  g.fillStyle = "rgba(255,255,255,0.6)";
  g.fillRect(250, 150, 140, 30);

  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(tex).texture;
  tex.dispose();
  pmrem.dispose();
  return env;
}

/** A soft contact shadow: a blurred ellipse to lie under the word. */
export function contactShadow(width = 6.5, depth = 1.6, strength = 0.55): THREE.Mesh {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const g = c.getContext("2d")!;
  const rg = g.createRadialGradient(256, 64, 0, 256, 64, 256);
  rg.addColorStop(0, `rgba(40,32,30,${strength})`);
  rg.addColorStop(0.45, `rgba(40,32,30,${strength * 0.4})`);
  rg.addColorStop(1, "rgba(40,32,30,0)");
  g.setTransform(1, 0, 0, 0.25, 0, 48);
  g.fillStyle = rg;
  g.fillRect(0, -200, 512, 600);
  const tex = new THREE.CanvasTexture(c);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }),
  );
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}
