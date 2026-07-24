import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/Orbitron";

const { fontFamily } = loadFont("normal", {
  weights: ["700"],
  subsets: ["latin"],
});

const STEPS = [
  { num: "01", label: "Connect Wallet", desc: "Freighter, xBull, Lobstr, Hana" },
  { num: "02", label: "Stake & Explore", desc: "1 XLM entry fee" },
  { num: "03", label: "Drop Your Pin", desc: "Guess the location" },
  { num: "04", label: "Win Prizes", desc: "Closer = bigger payout" },
];

export const SceneHowItWorks: React.FC = () => {
  const frame = useCurrentFrame();

  const headingOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const headingY = interpolate(frame, [0, 15], [20, 0], {
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
          marginBottom: 60,
          textTransform: "uppercase",
          textShadow: "0 0 20px rgba(0,242,255,0.2)",
        }}
      >
        How It Works
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          width: "100%",
          maxWidth: 800,
        }}
      >
        {STEPS.map((step, i) => {
          const itemDelay = 15 + i * 12;
          const itemOpacity = interpolate(
            frame,
            [itemDelay, itemDelay + 10],
            [0, 1],
            { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
          );
          const itemX = interpolate(
            frame,
            [itemDelay, itemDelay + 10],
            [-30, 0],
            { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
          );

          return (
            <div
              key={step.num}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                opacity: itemOpacity,
                transform: `translateX(${itemX}px)`,
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontFamily: "monospace",
                  color: "#3d494e",
                  minWidth: 32,
                  letterSpacing: "0.05em",
                }}
              >
                {step.num}
              </div>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  padding: "16px 24px",
                  borderLeft: "1px solid rgba(0, 242, 255, 0.12)",
                }}
              >
                <span
                  style={{
                    fontSize: 22,
                    fontFamily: "monospace",
                    color: "#e1e2e7",
                    letterSpacing: "0.05em",
                  }}
                >
                  {step.label}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontFamily: "monospace",
                    color: "#748288",
                  }}
                >
                  {step.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
