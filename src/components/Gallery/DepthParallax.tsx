import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * 2.5D volumetric parallax: a still image given depth. A fragment shader shifts
 * each pixel by the pointer, scaled by a depth map — near things move more than
 * far ones — so the photograph opens up like a scene seen through a window.
 * The response is weighted (damped springs), and while it moves a micro
 * chromatic aberration splits the RGB channels a hair.
 *
 * Depth: a real depth map (white = near) when one is given. Without one, an
 * approximation is computed from the image itself (lower and brighter = nearer),
 * good enough for a gentle effect but not a substitute for a proper map.
 *
 * Rendering is on demand: frames are drawn only while something moves.
 */

type Props = {
  image: string;
  /** Depth map, white = near. Optional: approximated from the image when missing */
  depth?: string;
  className?: string;
};

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0); // a full-frame quad
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uImage;
  uniform sampler2D uDepth;
  uniform vec2 uPointer;   // damped pointer, -1…1
  uniform vec2 uVelocity;  // damped pointer velocity
  uniform float uImageAspect;
  uniform float uViewAspect;
  uniform float uStrength;
  varying vec2 vUv;

  // Crop like object-fit: cover, with a little margin so displaced pixels never reach an edge
  vec2 cover(vec2 uv) {
    float r = uViewAspect / uImageAspect;
    vec2 s = r > 1.0 ? vec2(1.0, 1.0 / r) : vec2(r, 1.0);
    return (uv - 0.5) * s * 0.92 + 0.5;
  }

  void main() {
    vec2 uv = cover(vUv);
    float d = texture2D(uDepth, uv).r;
    // Near (white) moves with the pointer, far (black) against it: parallax around a mid plane
    vec2 shift = uPointer * (d - 0.45) * uStrength;
    vec2 p = uv + shift;
    // Micro chromatic aberration, only while moving, stronger for near pixels
    vec2 ca = uVelocity * (0.004 + d * 0.006);
    vec3 col;
    col.r = texture2D(uImage, p + ca).r;
    col.g = texture2D(uImage, p).g;
    col.b = texture2D(uImage, p - ca).b;
    gl_FragColor = vec4(col, 1.0);
  }
`;

/** Approximate depth from the image: lower and brighter reads as nearer; heavily blurred */
function approximateDepth(img: HTMLImageElement): THREE.CanvasTexture {
  const w = 256;
  const h = Math.max(1, Math.round((img.height / img.width) * w));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.filter = "blur(10px) grayscale(1)";
  g.drawImage(img, 0, 0, w, h);
  g.filter = "none";
  const data = g.getImageData(0, 0, w, h);
  for (let y = 0; y < h; y++) {
    const vertical = y / (h - 1); // top far, bottom near
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const lum = data.data[i] / 255;
      const v = Math.round((vertical * 0.7 + lum * 0.3) * 255);
      data.data[i] = data.data[i + 1] = data.data[i + 2] = v;
    }
  }
  g.putImageData(data, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.NoColorSpace;
  return tex;
}

const damp = (a: number, b: number, rate: number, dt: number) => a + (b - a) * (1 - Math.exp(-rate * dt));

const Scene: React.FC<{ image: string; depth?: string; pointer: React.MutableRefObject<{ x: number; y: number }> }> = ({
  image,
  depth,
  pointer,
}) => {
  const imageTex = useLoader(THREE.TextureLoader, image);
  const depthTex = useLoader(THREE.TextureLoader, depth ?? image);
  const { size, invalidate } = useThree();

  const uniforms = useMemo(
    () => ({
      uImage: { value: imageTex },
      uDepth: { value: null as THREE.Texture | null },
      uPointer: { value: new THREE.Vector2() },
      uVelocity: { value: new THREE.Vector2() },
      uImageAspect: { value: 1 },
      uViewAspect: { value: 1 },
      uStrength: { value: 0.035 },
    }),
    [imageTex],
  );

  // Textures: sampled as stored, so the shader writes sRGB straight to the screen
  useEffect(() => {
    imageTex.colorSpace = THREE.NoColorSpace;
    imageTex.needsUpdate = true;
    const img = imageTex.image as HTMLImageElement;
    uniforms.uImageAspect.value = img.width / img.height;
    let generated: THREE.CanvasTexture | null = null;
    if (depth) {
      depthTex.colorSpace = THREE.NoColorSpace;
      depthTex.needsUpdate = true;
      uniforms.uDepth.value = depthTex;
    } else {
      generated = approximateDepth(img);
      uniforms.uDepth.value = generated;
    }
    invalidate();
    return () => generated?.dispose();
  }, [imageTex, depthTex, depth, uniforms, invalidate]);

  useEffect(() => {
    uniforms.uViewAspect.value = size.width / size.height;
    invalidate();
  }, [size.width, size.height, uniforms, invalidate]);

  // Weighted response: the image follows the pointer slowly, and its velocity drives the colour split
  const last = useRef(new THREE.Vector2());
  useFrame((_, dt) => {
    const p = uniforms.uPointer.value;
    const nx = damp(p.x, pointer.current.x, 3.2, dt);
    const ny = damp(p.y, pointer.current.y, 3.2, dt);
    const v = uniforms.uVelocity.value;
    v.set(damp(v.x, (nx - last.current.x) / Math.max(dt, 1e-3), 6, dt), damp(v.y, (ny - last.current.y) / Math.max(dt, 1e-3), 6, dt));
    last.current.set(nx, ny);
    p.set(nx, ny);
    if (Math.abs(nx - pointer.current.x) + Math.abs(ny - pointer.current.y) + v.length() > 1e-3) invalidate();
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial vertexShader={VERT} fragmentShader={FRAG} uniforms={uniforms} />
    </mesh>
  );
};

export const DepthParallax: React.FC<Props> = ({ image, depth, className = "" }) => {
  const host = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const invalidateRef = useRef<() => void>(() => {});

  // The pointer anywhere on the page drives it (relative to the frame), so it is alive before you reach it
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (e: PointerEvent) => {
      const el = host.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      pointer.current.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      pointer.current.y = Math.max(-1, Math.min(1, -(((e.clientY - r.top) / r.height) * 2 - 1)));
      invalidateRef.current();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    // A clean mask with an ultra-thin reflective edge
    <div ref={host} className={`relative overflow-hidden rounded-[2px] ring-1 ring-white/15 ${className}`}>
      <Canvas
        frameloop="demand"
        dpr={[1, 1.75]}
        gl={{ antialias: false }}
        onCreated={({ invalidate }) => (invalidateRef.current = invalidate)}
      >
        <Suspense fallback={null}>
          <Scene key={image} image={image} depth={depth} pointer={pointer} />
        </Suspense>
      </Canvas>
      {/* The reflective edge catches a little light along the top */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
};

export default DepthParallax;
