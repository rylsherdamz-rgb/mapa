export const CONTRACTS = {
  mapaGame: process.env.NEXT_PUBLIC_CONTRACT_MAPA_GAME || "",
  mapaLocationVault: process.env.NEXT_PUBLIC_CONTRACT_MAPA_LOCATION_VAULT || "",
} as const;

export function requireContracts() {
  if (!CONTRACTS.mapaGame || !CONTRACTS.mapaLocationVault) {
    throw new Error("Contract IDs not configured. Set NEXT_PUBLIC_CONTRACT_MAPA_GAME and NEXT_PUBLIC_CONTRACT_MAPA_LOCATION_VAULT");
  }
  return CONTRACTS;
}
