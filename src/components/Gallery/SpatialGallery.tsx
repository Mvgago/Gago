import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * A spatial gallery: each project is a textured plane floating in 3D space,
 * drawn with a custom shader — a liquid ripple driven by simplex noise and the
 * pointer's velocity, and chromatic aberration that opens at the edges. The
 * camera leans with the pointer; the plane under the cursor (raycast) comes
 * forward in Z, tilts towards the pointer and grows, all on damped springs.
 *
 * Pure three.js (the same engine as the logo sculpture), one canvas, one loop
 * that only runs while the canvas is on screen.
 */

export type GalleryItem = { slug: string; image: string };

type Props = {
  items: GalleryItem[];
  /** Per item: false fades it back and makes it unpickable (filtering) */
  visible: boolean[];
  onHover: (index: number | null) => void;
  onOpen: (index: number) => void;
  /** Set when WebGL is unavailable, so the page can fall back */
  onUnsupported?: () => void;
  className?: string;
};

const BG = new THREE.Color("#e2e2e2");

// ── Shaders ────────────────────────────────────────────────────────────────

const VERT = /* glsl */ `
  uniform float uHover;
  uniform float uTime;
  uniform vec2 uVel;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    // A soft bow towards the viewer on hover, and a wave that follows the pointer's motion
    float bow = sin(uv.x * 3.14159) * sin(uv.y * 3.14159);
    p.z += bow * uHover * 0.06;
    p.z += sin(uv.x * 6.0 + uTime * 2.0) * length(uVel) * 0.05;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

// 3D simplex noise — Ashima Arts / Stefan Gustavson (MIT)
const NOISE = /* glsl */ `
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
    vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
    i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
    vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
    vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
    return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uHover;
  uniform float uTime;
  uniform vec2 uVel;
  uniform float uOpacity;
  uniform float uCover;   // texture aspect / plane aspect, to crop like object-fit: cover
  varying vec2 vUv;
  ${NOISE}
  vec2 coverUv(vec2 uv) {
    vec2 s = uCover > 1.0 ? vec2(1.0 / uCover, 1.0) : vec2(1.0, uCover);
    return (uv - 0.5) * s + 0.5;
  }
  void main() {
    float speed = length(uVel);
    // Liquid ripple: noise displacement, quiet at rest, livelier on hover and with motion
    float n = snoise(vec3(vUv * 2.6, uTime * 0.22));
    float amt = 0.0025 + uHover * 0.012 + speed * 0.05;
    vec2 uv = vUv + vec2(n, snoise(vec3(vUv * 2.6 + 7.3, uTime * 0.22))) * amt;
    // Slight zoom-in on hover
    uv = (uv - 0.5) * (1.0 - uHover * 0.06) + 0.5;
    // Chromatic aberration, opening towards the edges
    vec2 dir = uv - 0.5;
    float edge = smoothstep(0.15, 0.75, length(dir));
    float ca = (0.0015 + uHover * 0.008 + speed * 0.04) * edge;
    vec3 col;
    col.r = texture2D(uTex, coverUv(uv + dir * ca)).r;
    col.g = texture2D(uTex, coverUv(uv)).g;
    col.b = texture2D(uTex, coverUv(uv - dir * ca)).b;
    // At rest a touch softened, full and clear when pointed at
    float l = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(l), col, 0.88 + uHover * 0.12);
    gl_FragColor = vec4(col, uOpacity);
  }
`;

// ── Layout ─────────────────────────────────────────────────────────────────

/** Positions in space: a loose, staggered constellation (wide) or a column (portrait) */
function layout(n: number, portrait: boolean) {
  const out: { pos: THREE.Vector3; w: number }[] = [];
  for (let i = 0; i < n; i++) {
    if (portrait) {
      out.push({
        pos: new THREE.Vector3(i % 2 ? 0.35 : -0.35, 1.9 - i * 1.3, i % 2 ? -0.3 : 0.1),
        w: 2.1,
      });
    } else {
      const span = 4.1;
      const x = n === 1 ? 0 : -span / 2 + (span / (n - 1)) * i;
      out.push({
        pos: new THREE.Vector3(x, i % 2 ? -0.38 : 0.38, i % 2 ? 0.2 : -0.35),
        w: 1.4,
      });
    }
  }
  return out;
}

const damp = (from: number, to: number, rate: number, dt: number) => from + (to - from) * (1 - Math.exp(-rate * dt));

// ── Component ──────────────────────────────────────────────────────────────

export const SpatialGallery: React.FC<Props> = ({ items, visible, onHover, onOpen, onUnsupported, className = "" }) => {
  const host = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(visible);
  visibleRef.current = visible;
  const cb = useRef({ onHover, onOpen });
  cb.current = { onHover, onOpen };

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      onUnsupported?.();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(BG);
    Object.assign(renderer.domElement.style, { display: "block", width: "100%", height: "100%" });
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    camera.position.set(0, 0, 6);

    // Studio light from above. The planes' shader is unlit (images keep their own light);
    // these lights are here for any lit object added to the scene later.
    scene.add(new THREE.AmbientLight("#ffffff", 0.6));
    const key = new THREE.DirectionalLight("#ffffff", 0.8);
    key.position.set(0, 6, 3);
    scene.add(key);

    const loader = new THREE.TextureLoader();
    const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);

    type Plane = {
      mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
      home: THREE.Vector3;
      width: number;
      aspect: number; // height / width of the plane
      hover: number;
      opacity: number;
    };

    const planes: Plane[] = items.map((item) => {
      const material = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        uniforms: {
          uTex: { value: null },
          uHover: { value: 0 },
          uTime: { value: 0 },
          uVel: { value: new THREE.Vector2() },
          uOpacity: { value: 0 },
          uCover: { value: 1 },
        },
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      const plane: Plane = { mesh, home: new THREE.Vector3(), width: 1.6, aspect: 0.66, hover: 0, opacity: 0 };
      loader.load(item.image, (tex) => {
        // Sampled as stored: the shader writes sRGB straight to the screen
        tex.colorSpace = THREE.NoColorSpace;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.anisotropy = 4;
        const img = tex.image as { width: number; height: number };
        material.uniforms.uTex.value = tex;
        material.uniforms.uCover.value = img.width / img.height / (1 / plane.aspect);
      });
      return plane;
    });

    const place = (portrait: boolean) => {
      const spots = layout(planes.length, portrait);
      planes.forEach((p, i) => {
        p.home.copy(spots[i].pos);
        p.width = spots[i].w;
        p.aspect = portrait ? 0.62 : 0.68;
        const tex = p.mesh.material.uniforms.uTex.value as THREE.Texture | null;
        if (tex) {
          const img = tex.image as { width: number; height: number };
          p.mesh.material.uniforms.uCover.value = img.width / img.height / (1 / p.aspect);
        }
      });
    };

    let portrait = false;
    const fit = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      portrait = w / h < 0.9;
      camera.fov = portrait ? 52 : 35;
      camera.updateProjectionMatrix();
      place(portrait);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);

    // Pointer: normalised position, smoothed velocity, picking
    const pointer = new THREE.Vector2(0, 0);
    const prev = new THREE.Vector2(0, 0);
    const velocity = new THREE.Vector2();
    let inside = false;
    const raycaster = new THREE.Raycaster();
    let hovered: number | null = null;

    const toNdc = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    };
    const pick = (): number | null => {
      raycaster.setFromCamera(pointer, camera);
      const pickable = planes.filter((_, i) => visibleRef.current[i] !== false).map((p) => p.mesh);
      const hit = raycaster.intersectObjects(pickable, false)[0];
      return hit ? planes.findIndex((p) => p.mesh === hit.object) : null;
    };
    const onMove = (e: PointerEvent) => {
      inside = true;
      toNdc(e);
    };
    const onLeave = () => {
      inside = false;
    };
    const onClick = (e: PointerEvent) => {
      toNdc(e);
      const i = pick();
      if (i !== null) cb.current.onOpen(i);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("click", onClick as EventListener);

    let visibleOnScreen = true;
    const io = new IntersectionObserver(([entry]) => (visibleOnScreen = entry.isIntersecting));
    io.observe(el);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!visibleOnScreen || document.hidden) return;
      const t = clock.elapsedTime;

      // Pointer velocity, smoothed, fading to rest
      velocity.x = damp(velocity.x, (pointer.x - prev.x) / Math.max(dt, 1e-3) * 0.02, 8, dt);
      velocity.y = damp(velocity.y, (pointer.y - prev.y) / Math.max(dt, 1e-3) * 0.02, 8, dt);
      prev.copy(pointer);
      if (reduced) velocity.set(0, 0);

      // Hover by raycast
      const next = inside ? pick() : null;
      if (next !== hovered) {
        hovered = next;
        el.style.cursor = hovered !== null ? "pointer" : "default";
        cb.current.onHover(hovered);
      }

      // Camera leans with the pointer
      const lean = reduced ? 0 : 1;
      camera.position.x = damp(camera.position.x, pointer.x * 0.45 * lean, 2.2, dt);
      camera.position.y = damp(camera.position.y, pointer.y * 0.28 * lean, 2.2, dt);
      camera.lookAt(0, portrait ? 0 : 0, 0);

      planes.forEach((p, i) => {
        const on = hovered === i ? 1 : 0;
        const shown = visibleRef.current[i] !== false;
        p.hover = damp(p.hover, on, 6, dt);
        p.opacity = damp(p.opacity, shown ? 1 : 0.1, 5, dt);
        // Forward in Z, tilt towards the pointer, grow: spring-like damping
        p.mesh.position.set(p.home.x, p.home.y, p.home.z + p.hover * 0.7);
        p.mesh.rotation.y = damp(p.mesh.rotation.y, on * pointer.x * 0.25, 5, dt);
        p.mesh.rotation.x = damp(p.mesh.rotation.x, on * -pointer.y * 0.18, 5, dt);
        const s = 1 + p.hover * 0.1;
        p.mesh.scale.set(p.width * s, p.width * p.aspect * s, 1);
        const u = p.mesh.material.uniforms;
        u.uHover.value = p.hover;
        u.uTime.value = reduced ? 0 : t;
        (u.uVel.value as THREE.Vector2).copy(velocity).multiplyScalar(on || 0.3);
        u.uOpacity.value = p.opacity;
      });

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("click", onClick as EventListener);
      planes.forEach((p) => {
        (p.mesh.material.uniforms.uTex.value as THREE.Texture | null)?.dispose();
        p.mesh.material.dispose();
      });
      geometry.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
    // The scene is built once per set of items; visibility and callbacks are read through refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return <div ref={host} className={className} />;
};

export default SpatialGallery;
