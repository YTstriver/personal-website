import type { ComponentType } from "react";
import RawFloatingLines from "./FloatingLines.jsx";

type WaveName = "top" | "middle" | "bottom";

type WavePosition = {
  rotate?: number;
  x?: number;
  y?: number;
};

type FloatingLinesProps = {
  animationSpeed?: number;
  bendRadius?: number;
  bendStrength?: number;
  enabledWaves?: WaveName[];
  interactive?: boolean;
  lineCount?: number | number[];
  lineDistance?: number | number[];
  linesGradient?: string[];
  middleWavePosition?: WavePosition;
  mixBlendMode?: string;
  mouseDamping?: number;
  parallax?: boolean;
  parallaxStrength?: number;
  bottomWavePosition?: WavePosition;
  topWavePosition?: WavePosition;
};

const FloatingLines = RawFloatingLines as ComponentType<FloatingLinesProps>;

export default FloatingLines;
