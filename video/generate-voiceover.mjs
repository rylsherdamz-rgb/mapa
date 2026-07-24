import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const VOICE_ID = "Xb7hH8MSUJpSbSDYk0k2"; // Alice - Clear, Engaging Educator

const SCENES = [
  { id: "scene-01-title", text: "Mapa. GeoGuessr, decentralized." },
  {
    id: "scene-02-connect",
    text: "Connect your wallet. Stake XLM. Explore street view imagery from anywhere in the world.",
  },
  {
    id: "scene-03-guess",
    text: "Drop your pin on the map. The closer your guess, the bigger your payout, powered by smart contracts on the Stellar network.",
  },
  {
    id: "scene-04-tech",
    text: "Every room is fair, every prize automated. No central server, no hidden rules. Just pure on-chain competition.",
  },
  {
    id: "scene-05-cta",
    text: "Ready to explore the world? Play Mapa now.",
  },
];

async function generateVoiceover() {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    console.error("ELEVENLABS_API_KEY environment variable is required");
    process.exit(1);
  }

  const outputDir = resolve(__dirname, "public", "voiceover", "mapa-promo");
  mkdirSync(outputDir, { recursive: true });

  for (const scene of SCENES) {
    console.log(`Generating voiceover for: ${scene.id}...`);
    console.log(`  Text: "${scene.text}"`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: scene.text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.75,
            style: 0.2,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`  Failed: ${errorText}`);
      continue;
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    const filePath = resolve(outputDir, `${scene.id}.mp3`);
    writeFileSync(filePath, audioBuffer);
    console.log(`  Saved: ${filePath}`);
  }

  console.log("\nDone! All voiceover files generated.");
}

generateVoiceover().catch(console.error);
