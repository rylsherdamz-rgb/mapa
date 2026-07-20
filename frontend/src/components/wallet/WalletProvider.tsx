"use client";

import { createContext, useContext, useCallback, useState, useEffect, ReactNode } from "react";
import { isAllowed, setAllowed, signTransaction as freighterSign } from "@stellar/freighter-api";

interface WalletContextType {
  publicKey: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  signTx: (tx: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType>({
  publicKey: null,
  isConnected: false,
  isConnecting: false,
  connect: async () => {},
  disconnect: () => {},
  signTx: async (tx: string) => tx,
});

export function useWallet() {
  return useContext(WalletContext);
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    try {
      const allowed = await isAllowed();
      if (allowed) {
        const { address } = await window.freighterApi.getAddress({ network: "testnet" });
        setPublicKey(address);
      }
    } catch {
      // Freighter not available
    }
  }

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      await setAllowed();
      const { address } = await window.freighterApi.getAddress({ network: "testnet" });
      setPublicKey(address);
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setPublicKey(null);
  }, []);

  const signTx = useCallback(async (tx: string): Promise<string> => {
    const { signedTx } = await freighterSign(tx, { network: "testnet" });
    return signedTx;
  }, []);

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        isConnected: !!publicKey,
        isConnecting,
        connect,
        disconnect,
        signTx,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
