export type VoiceoverScene = {
  id: string;
  text: string;
  durationSeconds: number;
};

export const VOICEOVER_SCENES: VoiceoverScene[] = [
  {
    id: "scene-01-title",
    text: "Mapa. GeoGuessr, decentralized.",
    durationSeconds: 2.55,
  },
  {
    id: "scene-02-connect",
    text: "Connect your wallet. Stake XLM. Explore street view imagery from anywhere in the world.",
    durationSeconds: 5.06,
  },
  {
    id: "scene-03-guess",
    text: "Drop your pin on the map. The closer your guess, the bigger your payout, powered by smart contracts on the Stellar network.",
    durationSeconds: 7.06,
  },
  {
    id: "scene-04-tech",
    text: "Every room is fair, every prize automated. No central server, no hidden rules. Just pure on-chain competition.",
    durationSeconds: 8.22,
  },
  {
    id: "scene-05-cta",
    text: "Ready to explore the world? Play Mapa now.",
    durationSeconds: 2.74,
  },
];
