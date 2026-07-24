import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/Orbitron";

const { fontFamily } = loadFont("normal", {
  weights: ["700"],
  subsets: ["latin"],
});

const CONTRACT_LINES = [
  'mapa_game  →  room lifecycle, scoring, prizes',
  'location_vault  →  7 curated locations, random selection',
  'engine  →  Haversine distance scoring',
  'network  →  Stellar Soroban (testnet)',
];

export const SceneTech: React.FC = () => {
  const frame = useCurrentFrame();

  const headingOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const headingY = interpolate(frame, [0, 15], [20, 0], {
    extrapolateRight: "clamp",
  });

  const badgeOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 120px",
      }}
    >
      <div
        style={{
          fontSize: 36,
          fontWeight: 700,
          fontFamily,
          color: "#00f2ff",
          letterSpacing: "0.2em",
          opacity: headingOpacity,
          transform: `translateY(${headingY}px)`,
          marginBottom: 16,
          textTransform: "uppercase",
          textShadow: "0 0 20px rgba(0,242,255,0.2)",
        }}
      >
        Smart Contracts
      </div>

      <div
        style={{
          fontSize: 14,
          fontFamily: "monospace",
          color: "#748288",
          letterSpacing: "0.1em",
          marginBottom: 50,
          opacity: badgeOpacity,
          padding: "6px 16px",
          border: "1px solid rgba(0, 242, 255, 0.15)",
          borderRadius: 4,
        }}
      >
        SOROBAN · RUST · STELLAR
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "100%",
          maxWidth: 800,
          background: "rgba(0, 242, 255, 0.02)",
          border: "1px solid rgba(0, 242, 255, 0.08)",
          borderRadius: 6,
          padding: 4,
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            padding: "10px 20px",
            fontSize: 12,
            color: "#3d494e",
            borderBottom: "1px solid rgba(0, 242, 255, 0.06)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Contract Architecture
        </div>
        {CONTRACT_LINES.map((line, i) => {
          const lineDelay = 25 + i * 8;
          const lineOpacity = interpolate(
            frame,
            [lineDelay, lineDelay + 8],
            [0, 1],
            { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
          );
          const lineX = interpolate(
            frame,
            [lineDelay, lineDelay + 8],
            [-20, 0],
            { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
          );

          return (
            <div
              key={i}
              style={{
                padding: "12px 20px",
                fontSize: 14,
                color: i === 0 ? "#00f2ff" : "#e1e2e7",
                opacity: lineOpacity,
                transform: `translateX(${lineX}px)`,
                borderBottom:
                  i < CONTRACT_LINES.length - 1
                    ? "1px solid rgba(0, 242, 255, 0.04)"
                    : undefined,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ color: "#3d494e", fontSize: 12, minWidth: 20 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{line}</span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 40,
          display: "flex",
          gap: 16,
          alignItems: "center",
        }}
      >
        {["decentralized", "trustless", "on-chain"].map((tag, i) => {
          const tagDelay = 60 + i * 6;
          const tagOpacity = interpolate(
            frame,
            [tagDelay, tagDelay + 6],
            [0, 1],
            { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
          );

          return (
            <div
              key={tag}
              style={{
                padding: "6px 14px",
                fontSize: 11,
                fontFamily: "monospace",
                color: "#3d494e",
                border: "1px solid rgba(0, 242, 255, 0.1)",
                borderRadius: 3,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                opacity: tagOpacity,
              }}
            >
              {tag}
            </div>
          );
        })}
      </div>
    </div>
  );
};
