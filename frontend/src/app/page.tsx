"use client";

import { useEffect, useState } from "react";
import { MapPin, Crosshair, Globe, ArrowRight, Radio } from "lucide-react";
import { WalletConnector } from "@/components/wallet/WalletConnector";
import { useWallet } from "@/components/wallet/WalletProvider";
import { useRouter } from "next/navigation";
import { BackgroundGrid } from "@/components/BackgroundGrid";
import { getMinStake, getOpenRooms, formatStroops } from "@/lib/game";
import { CONTRACTS } from "@/lib/contract-ids";

export default function LandingPage() {
  const { isConnected } = useWallet();
  const router = useRouter();
  const [minStake, setMinStake] = useState<number | null>(null);
  const [openRoomCount, setOpenRoomCount] = useState<number | null>(null);

  useEffect(() => {
    getMinStake().then(setMinStake).catch(() => {});
    getOpenRooms().then((r) => setOpenRoomCount(r.length)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <BackgroundGrid />

      <nav className="sticky top-0 z-50 bg-[#0d0f10]/80 backdrop-blur-lg border-b border-white/[0.04]">
        <div className="flex items-center justify-between px-3 md:px-6 h-10 md:h-12 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-mapa-400/10 flex items-center justify-center">
              <Crosshair className="w-2.5 h-2.5 text-mapa-400" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Mapa</span>
            <span className="hidden sm:inline text-[9px] uppercase tracking-[0.2em] text-white/20 font-mono ml-1">Terminal</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/play")}
              className="text-[11px] text-white/40 hover:text-white/70 transition-colors font-mono tracking-wide flex items-center gap-1"
            >
              <Radio className="w-3 h-3" />
              <span className="hidden sm:inline">Play</span>
            </button>
            <WalletConnector />
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <section className="px-3 md:px-6 py-16 md:py-28 max-w-3xl mx-auto">
          <div className="mb-3">
            <span className="text-[10px] font-mono tracking-widest text-mapa-400/50 uppercase">
              Live on Stellar Soroban
            </span>
          </div>

          <h1 className="text-[clamp(2rem,8vw,4.5rem)] font-bold leading-[0.95] tracking-tight mb-4">
            Guess the World,{" "}
            <span className="text-mapa-400">Win on Stellar</span>
          </h1>

          <p className="text-sm md:text-base text-white/40 leading-relaxed max-w-lg mb-8 font-mono">
            A multiplayer geography game. Stake XLM, drop a pin on the satellite map,
            and the closest guess takes the pot.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-3 mb-10">
            <button
              onClick={() => router.push("/play")}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-mapa-400 text-[#0d0f10] font-semibold text-sm hover:bg-mapa-300 transition-all flex items-center justify-center gap-2"
            >
              {isConnected ? "Enter Arena" : "Connect to Play"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {openRoomCount !== null && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/[0.05] text-[11px] text-white/30 font-mono">
                <Radio className="w-3 h-3 text-mapa-400/50" />
                <span>{openRoomCount} open room{openRoomCount !== 1 ? "s" : ""}</span>
                {minStake !== null && (
                  <span className="text-white/15">· {formatStroops(minStake)} XLM min</span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { icon: MapPin, label: "Street View", desc: "Random location" },
              { icon: Crosshair, label: "Drop Pin", desc: "Guess on satellite map" },
              { icon: Globe, label: "Win XLM", desc: "Closest takes the pot" },
            ].map((f) => (
              <div key={f.label} className="border border-white/[0.04] rounded-lg p-3 hover:border-white/[0.08] transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <f.icon className="w-3 h-3 text-mapa-400" />
                  <span className="text-xs font-medium">{f.label}</span>
                </div>
                <p className="text-[11px] text-white/30 font-mono">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-white/[0.04] px-3 md:px-6 py-12 md:py-20 max-w-3xl mx-auto">
          <div className="mb-8">
            <span className="text-[10px] font-mono tracking-widest text-mapa-400/50 uppercase mb-2 block">
              Watch
            </span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              See Mapa in Action
            </h2>
          </div>
          <div className="border border-[#1e2629] rounded-lg overflow-hidden bg-[#14181a]">
            <div className="relative aspect-video">
              <video
                src="/mapa-promo.mp4"
                poster="/promo-still.png"
                controls
                className="w-full h-full object-contain"
                preload="metadata"
              />
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.04] px-3 md:px-6 py-12 md:py-20 max-w-3xl mx-auto">
          <div className="mb-8">
            <span className="text-[10px] font-mono tracking-widest text-mapa-400/50 uppercase mb-2 block">
              Gallery
            </span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Screenshots
            </h2>
          </div>
          <div className="space-y-6">
            <div className="border border-[#1e2629] rounded-lg overflow-hidden">
              <img
                src="/mobile-landing.png"
                alt="Mapa Landing Page"
                className="w-full h-auto md:hidden"
              />
              <img
                src="/landing.png"
                alt="Mapa Landing Page"
                className="w-full h-auto hidden md:block"
              />
              <div className="p-3 bg-[#14181a] text-center text-[#3d494e] text-xs tracking-widest uppercase">
                Landing — Mobile / Desktop
              </div>
            </div>
            <div className="border border-[#1e2629] rounded-lg overflow-hidden">
              <img
                src="/mobile-play.png"
                alt="Mapa Gameplay"
                className="w-full h-auto md:hidden"
              />
              <img
                src="/play.png"
                alt="Mapa Gameplay"
                className="w-full h-auto hidden md:block"
              />
              <div className="p-3 bg-[#14181a] text-center text-[#3d494e] text-xs tracking-widest uppercase">
                Gameplay — Mobile / Desktop
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.04] px-3 md:px-6 py-12 md:py-20 max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-start">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-mapa-400/50 uppercase mb-2 block">
                Smart Contract
              </span>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-4">
                Stellar-Powered Prize Pools
              </h2>
              <div className="space-y-2">
                {[
                  "Stake locked in Soroban contract until round resolves",
                  "Both players submit guesses, contract calculates winner",
                  "Funds released instantly — no middlemen, no delays",
                ].map((text) => (
                  <div key={text} className="flex items-start gap-2 text-sm text-white/40 font-mono">
                    <span className="text-mapa-400 mt-0.5 shrink-0">-</span>
                    {text}
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-white/[0.05] rounded-lg p-4 space-y-3 bg-white/[0.01]">
              <div className="flex items-center gap-2 text-[10px] font-mono text-white/25 tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Deployed on Testnet
              </div>
              <div>
                <div className="data-label">Game Contract</div>
                <div className="text-[11px] font-mono text-white/40 truncate">{CONTRACTS.mapaGame}</div>
              </div>
              <div>
                <div className="data-label">Vault Contract</div>
                <div className="text-[11px] font-mono text-white/40 truncate">{CONTRACTS.mapaLocationVault}</div>
              </div>
              {minStake !== null && (
                <div>
                  <div className="data-label">Minimum Stake</div>
                  <div className="text-sm font-mono text-gold">{formatStroops(minStake)} XLM</div>
                </div>
              )}
            </div>
          </div>
        </section>

        <footer className="border-t border-white/[0.04] px-3 md:px-6 py-5">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <Crosshair className="w-3 h-3 text-white/20" />
              <span className="text-white/40">Mapa</span>
              <span className="text-white/15 font-mono">v0.1</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-white/20 font-mono">
              <button className="hover:text-white/40 transition-colors">GitHub</button>
              <button className="hover:text-white/40 transition-colors">Terms</button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
