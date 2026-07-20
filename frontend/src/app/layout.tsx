import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";

const geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mapa — GeoGuessr on Stellar",
  description: "Guess locations, win XLM. A decentralized geography game on Stellar Soroban.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistMono.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
