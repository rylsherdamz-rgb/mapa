import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { loadFont } from "@remotion/google-fonts/Orbitron";

const { fontFamily } = loadFont("normal", {
  weights: ["700", "900"],
  subsets: ["latin"],
});

export const SceneTitle: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const titleY = interpolate(frame, [0, 20], [30, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const subtitleOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const tagOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const borderScale = interpolate(frame, [0, 60], [0.3, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
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
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${borderScale})`,
          width: "80%",
          height: "55%",
          border: "1px solid rgba(0, 242, 255, 0.15)",
          borderRadius: 4,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -1,
            left: 60,
            width: 120,
            height: 1,
            background: "rgba(0, 242, 255, 0.4)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -1,
            right: 60,
            width: 120,
            height: 1,
            background: "rgba(0, 242, 255, 0.4)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 60,
            left: -1,
            width: 1,
            height: 40,
            background: "rgba(0, 242, 255, 0.4)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: -1,
            width: 1,
            height: 40,
            background: "rgba(0, 242, 255, 0.4)",
          }}
        />
      </div>

      <div
        style={{
          fontSize: 130,
          fontWeight: 900,
          fontFamily,
          color: "#00f2ff",
          letterSpacing: "0.15em",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textShadow: "0 0 40px rgba(0,242,255,0.3), 0 0 80px rgba(0,242,255,0.1)",
        }}
      >
        MAPA
      </div>

      <div
        style={{
          fontSize: 28,
          fontFamily: "monospace",
          color: "#748288",
          letterSpacing: "0.3em",
          marginTop: 20,
          opacity: subtitleOpacity,
          textTransform: "uppercase",
        }}
      >
        GeoGuessr on Stellar
      </div>

      <div
        style={{
          marginTop: 50,
          display: "flex",
          alignItems: "center",
          gap: 8,
          opacity: tagOpacity,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: "#22c55e",
            boxShadow: "0 0 6px rgba(34,197,94,0.6)",
          }}
        />
        <span
          style={{
            fontSize: 14,
            fontFamily: "monospace",
            color: "#22c55e",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Live on Stellar Testnet
        </span>
      </div>
    </div>
  );
};
