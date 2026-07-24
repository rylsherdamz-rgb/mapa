import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

const BG = "#0d0f10";
const GRID = "rgba(0, 242, 255, 0.04)";
const HALO = "rgba(0, 242, 255, 0.03)";
const GLOW = "rgba(0, 242, 255, 0.06)";

export const Background: React.FC = () => {
  const frame = useCurrentFrame();

  const loopedFrame = frame % 240;
  const scanY = interpolate(loopedFrame, [0, 240], [0, 1080], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const pulseLooped = frame % 120;
  const pulse = interpolate(pulseLooped, [0, 60, 120], [0.3, 0.6, 0.3], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: BG,
        overflow: "hidden",
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <pattern
            id="grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke={GRID}
              strokeWidth="0.5"
            />
          </pattern>
          <radialGradient id="halo" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor={HALO} stopOpacity="1" />
            <stop offset="100%" stopColor={HALO} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={GLOW} stopOpacity="1" />
            <stop offset="100%" stopColor={GLOW} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <rect width="100%" height="100%" fill="url(#halo)" />
        <rect width="100%" height="100%" fill="url(#glow)" />
      </svg>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 2,
          top: scanY,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(0,242,255,0.15) 50%, transparent 100%)",
          opacity: pulse,
          boxShadow: "0 0 8px rgba(0,242,255,0.1)",
        }}
      />
    </div>
  );
};
