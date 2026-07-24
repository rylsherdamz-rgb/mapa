import Link from "next/link";

export default function PromoPage() {
  return (
    <div className="min-h-screen bg-[#0d0f10] text-[#e1e2e7] font-mono">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-12">
          <Link
            href="/"
            className="text-[#748288] hover:text-[#00f2ff] text-xs tracking-widest uppercase transition-colors"
          >
            ← Back to Mapa
          </Link>
        </div>

        <div className="text-center mb-16">
          <h1 className="text-6xl font-black tracking-[0.15em] text-[#00f2ff] mb-4">
            MAPA
          </h1>
          <p className="text-lg text-[#748288] tracking-[0.3em] uppercase">
            Promotional Video
          </p>
        </div>

        <div className="mb-16 border border-[#1e2629] rounded overflow-hidden">
          <div className="relative aspect-video bg-[#14181a]">
            <video
              src="/mapa-promo.mp4"
              poster="/promo-still.png"
              controls
              className="w-full h-full object-contain"
              preload="metadata"
            />
          </div>
          <div className="p-3 bg-[#14181a] text-center text-[#3d494e] text-xs tracking-widest uppercase">
            Mapa Promotional Video — 1920 × 1080 · 30fps · ~28s
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="border border-[#1e2629] rounded p-6">
            <div className="text-[#3d494e] text-xs tracking-widest uppercase mb-4">
              Video Specs
            </div>
            <div className="space-y-3">
              {[
                ["Resolution", "1920 × 1080"],
                ["FPS", "30"],
                ["Duration", "~28 seconds"],
                ["Format", "Landscape"],
                ["Audio", "ElevenLabs TTS (Alice)"],
                ["Scenes", "5"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-[#748288] text-sm">{label}</span>
                  <span className="text-[#e1e2e7] text-sm">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-[#1e2629] rounded p-6">
            <div className="text-[#3d494e] text-xs tracking-widest uppercase mb-4">
              Voiceover Script
            </div>
            <div className="space-y-4">
              {[
                ["01", "Mapa. GeoGuessr, decentralized."],
                ["02", "Connect your wallet. Stake XLM. Explore street view imagery from anywhere in the world."],
                ["03", "Drop your pin on the map. The closer your guess, the bigger your payout, powered by smart contracts on the Stellar network."],
                ["04", "Every room is fair, every prize automated. No central server, no hidden rules. Just pure on-chain competition."],
                ["05", "Ready to explore the world? Play Mapa now."],
              ].map(([num, text]) => (
                <div key={num} className="flex gap-3">
                  <span className="text-[#3d494e] text-xs min-w-[20px]">{num}</span>
                  <span className="text-[#e1e2e7] text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border border-[#1e2629] rounded p-8 mb-16">
          <div className="text-[#3d494e] text-xs tracking-widest uppercase mb-6">
            Scene Breakdown
          </div>

          <div className="space-y-6">
            {[
              {
                scene: "Scene 1 — Title",
                frames: "~97",
                desc: "Mapa logo reveal with tactical grid background, scanning line effect, and subtitle 'GeoGuessr on Stellar'",
              },
              {
                scene: "Scene 2 — How It Works",
                frames: "~172",
                desc: "Four-step terminal-style readout: Connect Wallet → Stake & Explore → Drop Your Pin → Win Prizes",
              },
              {
                scene: "Scene 3 — Smart Contracts",
                frames: "~232",
                desc: "Contract architecture display showing MapaGame, LocationVault, scoring engine with tech badges",
              },
              {
                scene: "Scene 4 — How It Works (reprise)",
                frames: "~267",
                desc: "Repeated how-it-works with deeper emphasis on decentralization and fairness",
              },
              {
                scene: "Scene 5 — Call to Action",
                frames: "~102",
                desc: "Mapa logo with glow pulse, URL display, and 'Connect & Play' button with live indicator",
              },
            ].map((s) => (
              <div
                key={s.scene}
                className="border-l border-[#00f2ff]/20 pl-4"
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[#00f2ff] text-sm">{s.scene}</span>
                  <span className="text-[#3d494e] text-xs">{s.frames} frames</span>
                </div>
                <p className="text-[#748288] text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-[#1e2629] rounded p-6 mb-16">
          <div className="text-[#3d494e] text-xs tracking-widest uppercase mb-4">
            How to Preview
          </div>
          <div className="space-y-3 text-sm text-[#e1e2e7]">
            <p>
              The Remotion project is at <code className="text-[#00f2ff]">video/</code> in the project root.
            </p>
            <div className="bg-[#14181a] border border-[#1e2629] rounded p-4 font-mono text-xs">
              <p className="text-[#748288] mb-2"># Start Remotion Studio:</p>
              <p className="text-[#e1e2e7]">
                cd video &amp;&amp; npm run dev
              </p>
            </div>
            <div className="bg-[#14181a] border border-[#1e2629] rounded p-4 font-mono text-xs">
              <p className="text-[#748288] mb-2"># Render video:</p>
              <p className="text-[#e1e2e7]">
                cd video &amp;&amp; npx remotion render MapaPromo
              </p>
            </div>
            <div className="bg-[#14181a] border border-[#1e2629] rounded p-4 font-mono text-xs">
              <p className="text-[#748288] mb-2"># Regenerate voiceover (if needed):</p>
              <p className="text-[#e1e2e7]">
                cd video &amp;&amp; npm run generate-voiceover
              </p>
            </div>
          </div>
        </div>

        <div className="border border-[#1e2629] rounded p-6">
          <div className="text-[#3d494e] text-xs tracking-widest uppercase mb-4">
            Commands Reference
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {[
              ["npm run dev", "Start Remotion Studio"],
              ["npm run build", "Bundle video for production"],
              ["npm run generate-voiceover", "Generate ElevenLabs TTS audio"],
              ["npx tsc --noEmit", "Type-check all files"],
            ].map(([cmd, desc]) => (
              <div key={cmd} className="bg-[#14181a] border border-[#1e2629] rounded p-3">
                <code className="text-[#00f2ff] text-xs">{cmd}</code>
                <p className="text-[#748288] text-xs mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
