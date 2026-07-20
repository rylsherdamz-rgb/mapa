"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { GoogleMapsProvider } from "@/components/game/GoogleMapsProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <GoogleMapsProvider>
          {children}
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: "#14181a",
                border: "1px solid #1e2629",
                color: "#e1e2e7",
                fontSize: "13px",
                fontFamily: "Geist Mono, monospace",
              },
            }}
          />
        </GoogleMapsProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}
