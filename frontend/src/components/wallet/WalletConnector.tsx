"use client";

import { useWallet } from "./WalletProvider";

export function WalletConnector() {
  const { publicKey, isConnected, isConnecting, connect, disconnect } = useWallet();

  if (isConnected && publicKey) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm text-white/70 font-mono">
            {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
          </span>
        </div>
        <button
          onClick={disconnect}
          className="text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="px-4 py-2 rounded-full bg-mapa-500 hover:bg-mapa-600 disabled:opacity-50 text-sm font-medium transition-all"
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
