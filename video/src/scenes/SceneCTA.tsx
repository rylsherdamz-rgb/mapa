import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { loadFont } from "@remotion/google-fonts/Orbitron";

const { fontFamily } = loadFont("normal", {
  weights: ["700", "900"],
  subsets: ["latin"],
});

export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();

  const ctaOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const ctaScale = interpolate(frame, [0, 20], [0.85, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const urlOpacity = interpolate(frame, [20, 35], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const glowLooped = frame % 120;
  const glowPulse = interpolate(glowLooped, [0, 60, 120], [0.4, 0.8, 0.4], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const lineGrow = interpolate(frame, [5, 25], [0, 1], {
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
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          width: "60%",
          marginBottom: 40,
          opacity: urlOpacity,
        }}
      >
        <div
          style={{
            flex: 1,
            height: 1,
            background: `linear-gradient(90deg, transparent, rgba(0,242,255,${0.15 * lineGrow}))`,
            transform: `scaleX(${lineGrow})`,
            transformOrigin: "right",
          }}
        />
        <div
          style={{
            fontSize: 11,
            fontFamily: "monospace",
            color: "#3d494e",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          Play Now
        </div>
        <div
          style={{
            flex: 1,
            height: 1,
            background: `linear-gradient(270deg, transparent, rgba(0,242,255,${0.15 * lineGrow}))`,
            transform: `scaleX(${lineGrow})`,
            transformOrigin: "left",
          }}
        />
      </div>

      <div
        style={{
          fontSize: 80,
          fontWeight: 900,
          fontFamily,
          color: "#00f2ff",
          letterSpacing: "0.15em",
          opacity: ctaOpacity,
          transform: `scale(${ctaScale})`,
          textShadow: `0 0 ${40 * glowPulse}px rgba(0,242,255,${0.3 * glowPulse}), 0 0 ${80 * glowPulse}px rgba(0,242,255,${0.1 * glowPulse})`,
          marginBottom: 16,
        }}
      >
        MAPA
      </div>

      <div
        style={{
          fontSize: 18,
          fontFamily: "monospace",
          color: "#748288",
          marginTop: 8,
          opacity: urlOpacity,
          letterSpacing: "0.05em",
        }}
      >
        mapa-ecru.vercel.app
      </div>

      <div
        style={{
          marginTop: 50,
          opacity: urlOpacity,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 32px",
            border: "1px solid rgba(0, 242, 255, 0.25)",
            borderRadius: 4,
            background: "rgba(0, 242, 255, 0.05)",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#22c55e",
              boxShadow: "0 0 8px rgba(34,197,94,0.6)",
            }}
          />
          <span
            style={{
              fontSize: 16,
              fontFamily: "monospace",
              color: "#22c55e",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Connect & Play
          </span>
        </div>
      </div>
    </div>
  );
};
