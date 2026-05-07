import { useEffect, useRef, type CSSProperties } from "react";
import * as THREE from "three";
import "./ColorBends.css";

type ColorBendsProps = {
  autoRotate?: number;
  bandWidth?: number;
  className?: string;
  colors?: string[];
  frequency?: number;
  intensity?: number;
  iterations?: number;
  mouseInfluence?: number;
  noise?: number;
  parallax?: number;
  rotation?: number;
  scale?: number;
  speed?: number;
  style?: CSSProperties;
  transparent?: boolean;
  warpStrength?: number;
};

const MAX_COLORS = 8 as const;

const fragmentShader = `
#define MAX_COLORS ${MAX_COLORS}
uniform vec2 uCanvas;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uRot;
uniform int uColorCount;
uniform vec3 uColors[MAX_COLORS];
uniform int uTransparent;
uniform float uScale;
uniform float uFrequency;
uniform float uWarpStrength;
uniform vec2 uPointer;
uniform float uMouseInfluence;
uniform float uParallax;
uniform float uNoise;
uniform int uIterations;
uniform float uIntensity;
uniform float uBandWidth;
varying vec2 vUv;

void main() {
  float t = uTime * uSpeed;
  vec2 p = vUv * 2.0 - 1.0;
  p += uPointer * uParallax * 0.1;
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
  vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);
  q /= max(uScale, 0.0001);
  q /= 0.5 + 0.2 * dot(q, q);
  q += 0.2 * cos(t) - 7.56;
  vec2 toward = (uPointer - rp);
  q += toward * uMouseInfluence * 0.2;

  for (int j = 0; j < 5; j++) {
    if (j >= uIterations - 1) break;
    vec2 rr = sin(1.5 * (q.yx * uFrequency) + 2.0 * cos(q * uFrequency));
    q += (rr - q) * 0.15;
  }

  vec3 col = vec3(0.0);
  float a = 1.0;

  if (uColorCount > 0) {
    vec2 s = q;
    vec3 sumCol = vec3(0.0);
    float cover = 0.0;
    for (int i = 0; i < MAX_COLORS; ++i) {
      if (i >= uColorCount) break;
      s -= 0.01;
      vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
      float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
      float kBelow = clamp(uWarpStrength, 0.0, 1.0);
      float kMix = pow(kBelow, 0.3);
      float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
      vec2 disp = (r - s) * kBelow;
      vec2 warped = s + disp * gain;
      float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
      float m = mix(m0, m1, kMix);
      float w = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
      sumCol += uColors[i] * w;
      cover = max(cover, w);
    }
    col = clamp(sumCol, 0.0, 1.0);
    a = uTransparent > 0 ? cover : 1.0;
  } else {
    vec2 s = q;
    for (int k = 0; k < 3; ++k) {
      s -= 0.01;
      vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
      float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(k)) / 4.0);
      float kBelow = clamp(uWarpStrength, 0.0, 1.0);
      float kMix = pow(kBelow, 0.3);
      float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
      vec2 disp = (r - s) * kBelow;
      vec2 warped = s + disp * gain;
      float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(k)) / 4.0);
      float m = mix(m0, m1, kMix);
      col[k] = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
    }
    a = uTransparent > 0 ? max(max(col.r, col.g), col.b) : 1.0;
  }

  col *= uIntensity;

  if (uNoise > 0.0001) {
    float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);
    col += (n - 0.5) * uNoise;
    col = clamp(col, 0.0, 1.0);
  }

  vec3 rgb = (uTransparent > 0) ? col * a : col;
  gl_FragColor = vec4(rgb, a);
}
`;

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const parseHexColor = (hex: string) => {
  const normalized = hex.replace("#", "").trim();
  if (normalized.length === 3) {
    const r = parseInt(normalized[0] + normalized[0], 16);
    const g = parseInt(normalized[1] + normalized[1], 16);
    const b = parseInt(normalized[2] + normalized[2], 16);
    return new THREE.Vector3(r / 255, g / 255, b / 255);
  }
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return new THREE.Vector3(r / 255, g / 255, b / 255);
};

export default function ColorBends({
  autoRotate = 0,
  bandWidth = 6,
  className,
  colors = [],
  frequency = 1,
  intensity = 1.5,
  iterations = 1,
  mouseInfluence = 1,
  noise = 0.15,
  parallax = 0.5,
  rotation = 90,
  scale = 1,
  speed = 0.2,
  style,
  transparent = true,
  warpStrength = 1,
}: ColorBendsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const rafRef = useRef<number | null>(null);
  const rotationRef = useRef<number>(rotation);
  const autoRotateRef = useRef<number>(autoRotate);
  const pointerTargetRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const pointerCurrentRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const pointerSmoothingRef = useRef<number>(8);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const colorUniforms = Array.from({ length: MAX_COLORS }, () => new THREE.Vector3(0, 0, 0));

    const material = new THREE.ShaderMaterial({
      fragmentShader,
      uniforms: {
        uBandWidth: { value: bandWidth },
        uCanvas: { value: new THREE.Vector2(1, 1) },
        uColorCount: { value: 0 },
        uColors: { value: colorUniforms },
        uFrequency: { value: frequency },
        uIntensity: { value: intensity },
        uIterations: { value: iterations },
        uMouseInfluence: { value: mouseInfluence },
        uNoise: { value: noise },
        uParallax: { value: parallax },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uRot: { value: new THREE.Vector2(1, 0) },
        uScale: { value: scale },
        uSpeed: { value: speed },
        uTime: { value: 0 },
        uTransparent: { value: transparent ? 1 : 0 },
        uWarpStrength: { value: warpStrength },
      },
      premultipliedAlpha: true,
      transparent: true,
      vertexShader,
    });
    materialRef.current = material;

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    rendererRef.current = renderer;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, transparent ? 0 : 1);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.width = "100%";
    container.appendChild(renderer.domElement);

    const resize = () => {
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;
      renderer.setSize(width, height, false);
      (material.uniforms.uCanvas.value as THREE.Vector2).set(width, height);
    };
    resize();

    window.addEventListener("resize", resize);
    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(resize);
      observer.observe(container);
      resizeObserverRef.current = observer;
    }

    const clock = new THREE.Clock();
    const animate = () => {
      const dt = clock.getDelta();
      const elapsed = clock.elapsedTime;

      material.uniforms.uTime.value = elapsed;
      const degree = (rotationRef.current % 360) + autoRotateRef.current * elapsed;
      const radian = (degree * Math.PI) / 180;
      const cos = Math.cos(radian);
      const sin = Math.sin(radian);
      (material.uniforms.uRot.value as THREE.Vector2).set(cos, sin);

      const current = pointerCurrentRef.current;
      const target = pointerTargetRef.current;
      const lerpAmount = Math.min(1, dt * pointerSmoothingRef.current);
      current.lerp(target, lerpAmount);
      (material.uniforms.uPointer.value as THREE.Vector2).copy(current);

      renderer.render(scene, camera);
      rafRef.current = window.requestAnimationFrame(animate);
    };
    rafRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      window.removeEventListener("resize", resize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    const material = materialRef.current;
    const renderer = rendererRef.current;
    if (!material) return;

    rotationRef.current = rotation;
    autoRotateRef.current = autoRotate;
    material.uniforms.uSpeed.value = speed;
    material.uniforms.uScale.value = scale;
    material.uniforms.uFrequency.value = frequency;
    material.uniforms.uWarpStrength.value = warpStrength;
    material.uniforms.uMouseInfluence.value = mouseInfluence;
    material.uniforms.uParallax.value = parallax;
    material.uniforms.uNoise.value = noise;
    material.uniforms.uIterations.value = iterations;
    material.uniforms.uIntensity.value = intensity;
    material.uniforms.uBandWidth.value = bandWidth;
    material.uniforms.uTransparent.value = transparent ? 1 : 0;

    const parsedColors = colors.filter(Boolean).slice(0, MAX_COLORS).map(parseHexColor);
    for (let index = 0; index < MAX_COLORS; index += 1) {
      const color = (material.uniforms.uColors.value as THREE.Vector3[])[index];
      if (index < parsedColors.length) {
        color.copy(parsedColors[index]);
      } else {
        color.set(0, 0, 0);
      }
    }
    material.uniforms.uColorCount.value = parsedColors.length;

    if (renderer) {
      renderer.setClearColor(0x000000, transparent ? 0 : 1);
    }
  }, [
    autoRotate,
    bandWidth,
    colors,
    frequency,
    intensity,
    iterations,
    mouseInfluence,
    noise,
    parallax,
    rotation,
    scale,
    speed,
    transparent,
    warpStrength,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / (bounds.width || 1)) * 2 - 1;
      const y = -(((event.clientY - bounds.top) / (bounds.height || 1)) * 2 - 1);
      pointerTargetRef.current.set(x, y);
    };

    container.addEventListener("pointermove", handlePointerMove);
    return () => {
      container.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  const classes = ["color-bends-container", className].filter(Boolean).join(" ");
  return <div ref={containerRef} className={classes} style={style} />;
}
