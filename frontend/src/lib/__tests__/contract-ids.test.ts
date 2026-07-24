import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("contract-ids", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it("returns contract IDs when env vars are set", async () => {
    process.env.NEXT_PUBLIC_CONTRACT_MAPA_GAME = "GAME123";
    process.env.NEXT_PUBLIC_CONTRACT_MAPA_LOCATION_VAULT = "VAULT456";
    const { CONTRACTS, requireContracts } = await import("../contract-ids");
    expect(CONTRACTS.mapaGame).toBe("GAME123");
    expect(CONTRACTS.mapaLocationVault).toBe("VAULT456");
    expect(requireContracts()).toEqual(CONTRACTS);
  });

  it("throws when contract IDs are missing", async () => {
    delete process.env.NEXT_PUBLIC_CONTRACT_MAPA_GAME;
    delete process.env.NEXT_PUBLIC_CONTRACT_MAPA_LOCATION_VAULT;
    const { requireContracts } = await import("../contract-ids");
    expect(requireContracts).toThrow("Contract IDs not configured");
  });

  it("defaults to empty string when env vars are not set", async () => {
    delete process.env.NEXT_PUBLIC_CONTRACT_MAPA_GAME;
    delete process.env.NEXT_PUBLIC_CONTRACT_MAPA_LOCATION_VAULT;
    const { CONTRACTS } = await import("../contract-ids");
    expect(CONTRACTS.mapaGame).toBe("");
    expect(CONTRACTS.mapaLocationVault).toBe("");
  });
});
