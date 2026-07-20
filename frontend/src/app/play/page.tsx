"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, MapPin, Target, ArrowLeft, Globe, Play } from "lucide-react";
import { WalletConnector } from "@/components/wallet/WalletConnector";
import { StreetView } from "@/components/game/StreetView";
import { MapView } from "@/components/game/MapView";
import { ResultScreen } from "@/components/game/ResultScreen";
import { useWallet } from "@/components/wallet/WalletProvider";
import {
  startGame,
  submitGuess,
  getGame,
  getLocation,
  getRandomLocation,
  Game,
  Location,
  GameState,
  calculateDistance,
  formatDistance,
} from "@/lib/game";

type Phase = "start" | "streetview" | "guessing" | "result";

export default function PlayPage() {
  const { isConnected, publicKey, signTx, connect } = useWallet();
  const [phase, setPhase] = useState<Phase>("start");
  const [loading, setLoading] = useState(false);
  const [gameId, setGameId] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [guess, setGuess] = useState<{ lat: number; lng: number } | null>(null);
  const [result, setResult] = useState<{ distance: number; score: number } | null>(null);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
        <Globe className="w-16 h-16 text-mapa-400/50" />
        <h1 className="text-2xl font-bold">Connect Your Wallet</h1>
        <p className="text-white/40 text-center max-w-md">
          You need a Stellar wallet to play. Freighter, xBull, or Lobstr — connect one to get started.
        </p>
        <button
          onClick={connect}
          className="px-8 py-3 rounded-full bg-mapa-500 hover:bg-mapa-600 font-medium transition-all"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  async function handleStartGame() {
    setLoading(true);
    try {
      const locationId = await getRandomLocation();
      const location = await getLocation(locationId);
      setCurrentLocation(location);

      const gid = await startGame(publicKey!, signTx);
      setGameId(gid);
      setPhase("streetview");
    } catch (err) {
      console.error("Failed to start game:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleMapClick(lat: number, lng: number) {
    setGuess({ lat, lng });
  }

  async function handleConfirmGuess() {
    if (!guess || !gameId || !currentLocation) return;
    setLoading(true);
    try {
      await submitGuess(gameId, guess.lat, guess.lng, publicKey!, signTx);
      const game = await getGame(gameId);
      setResult({
        distance: calculateDistance(guess.lat, guess.lng, currentLocation.lat, currentLocation.lng),
        score: game.score,
      });
      setPhase("result");
    } catch (err) {
      console.error("Failed to submit guess:", err);
    } finally {
      setLoading(false);
    }
  }

  function handlePlayAgain() {
    setPhase("start");
    setGuess(null);
    setResult(null);
    setCurrentLocation(null);
    setGameId(null);
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <nav className="flex items-center justify-between mb-6">
        <button
          onClick={() => (phase === "start" ? (window.location.href = "/") : handlePlayAgain())}
          className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {phase === "start" ? "Home" : "New Game"}
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/30 font-mono">{publicKey?.slice(0, 6)}...</span>
          <WalletConnector />
        </div>
      </nav>

      {phase === "start" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[60vh] gap-8"
        >
          <div className="glass-panel p-12 text-center max-w-md">
            <Target className="w-16 h-16 text-mapa-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-3">Ready to Play?</h2>
            <p className="text-white/40 mb-2">Entry fee: <span className="text-gold font-bold">0.1 XLM</span></p>
            <p className="text-sm text-white/30 mb-8">
              See a street view, guess the location, win XLM based on accuracy.
            </p>
            <button
              onClick={handleStartGame}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-mapa-500 hover:bg-mapa-600 disabled:opacity-50 font-medium transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Game
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {(phase === "streetview" || phase === "guessing") && currentLocation && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm text-white/40 mb-2 flex items-center gap-2">
              <Target className="w-3 h-3" />
              Where is this?
            </h3>
            <StreetView lat={currentLocation.lat} lng={currentLocation.lng} />
          </div>

          <div>
            <h3 className="text-sm text-white/40 mb-2 flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              {guess ? "You guessed here" : "Click the map to place your guess"}
            </h3>
            <MapView onClick={handleMapClick} guess={guess} interactive />

            {guess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 glass-panel p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-white/40">Your Guess</p>
                    <p className="text-sm font-mono">
                      {guess.lat.toFixed(4)}°, {guess.lng.toFixed(4)}°
                    </p>
                  </div>
                  {currentLocation && (
                    <div className="text-right">
                      <p className="text-xs text-white/40">Actual (hidden)</p>
                      <p className="text-sm text-white/20">???</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleConfirmGuess}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 disabled:opacity-50 font-medium transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Confirm Guess"
                  )}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {phase === "result" && currentLocation && result && (
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <StreetView lat={currentLocation.lat} lng={currentLocation.lng} />
            <MapView
              lat={currentLocation.lat}
              lng={currentLocation.lng}
              guess={guess!}
              actual={{ lat: currentLocation.lat, lng: currentLocation.lng }}
              interactive={false}
            />
          </div>

          <ResultScreen
            distance={result.distance}
            score={result.score}
            locationName={`${currentLocation.lat.toFixed(4)}°, ${currentLocation.lng.toFixed(4)}°`}
            onPlayAgain={handlePlayAgain}
            onClose={handlePlayAgain}
          />
        </div>
      )}
    </div>
  );
}
