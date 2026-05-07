import type { FC } from "react";

export type SplashCursorProps = {
  SIM_RESOLUTION?: number;
  DYE_RESOLUTION?: number;
  CAPTURE_RESOLUTION?: number;
  DENSITY_DISSIPATION?: number;
  VELOCITY_DISSIPATION?: number;
  PRESSURE?: number;
  PRESSURE_ITERATIONS?: number;
  CURL?: number;
  SPLAT_RADIUS?: number;
  SPLAT_FORCE?: number;
  SHADING?: boolean;
  COLOR_UPDATE_SPEED?: number;
  BACK_COLOR?: {
    r: number;
    g: number;
    b: number;
  };
  FRAME_RATE?: number;
  MAX_PIXEL_RATIO?: number;
  TRANSPARENT?: boolean;
};

declare const SplashCursor: FC<SplashCursorProps>;
export default SplashCursor;
