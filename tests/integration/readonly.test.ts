import { describe, it, expect } from "vitest";
import { getRpc } from "./helpers";

const GAME_CONTRACT_ID = process.env.CONTRACT_MAPA_GAME || "";
const VAULT_CONTRACT_ID = process.env.CONTRACT_MAPA_LOCATION_VAULT || "";

// These are read-only smoke tests against the live testnet deployment
// Run with: CONTRACT_MAPA_GAME=xxx CONTRACT_MAPA_LOCATION_VAULT=xxx npx vitest run

describe("RPC Health", () => {
  it("should connect to Soroban RPC", async () => {
    const rpc = getRpc();
    const health = await rpc.getHealth();
    expect(health).toBeDefined();
  });
});

describe("MapaGame (read-only)", () => {
  it("should get entry fee", async () => {
    if (!GAME_CONTRACT_ID) return; // skip if not configured
    const { simulate, arg } = await import("./helpers");
    const sim = await simulate(GAME_CONTRACT_ID, "get_entry_fee", []);
    expect(sim.result).toBeDefined();
    if (sim.result) {
      const fee = sim.result.retval;
      expect(fee).toBeDefined();
    }
  });

  it("should fail to get non-existent game", async () => {
    if (!GAME_CONTRACT_ID) return;
    const { simulate, arg } = await import("./helpers");
    const sim = await simulate(GAME_CONTRACT_ID, "get_game", [arg.u64(99999)]);
    expect(sim.error).toBeDefined();
  });
});

describe("LocationVault (read-only)", () => {
  it("should get location count", async () => {
    if (!VAULT_CONTRACT_ID) return;
    const { simulate, arg } = await import("./helpers");
    const sim = await simulate(VAULT_CONTRACT_ID, "get_location_count", []);
    expect(sim.result).toBeDefined();
    if (sim.result) {
      const count = sim.result.retval;
      expect(Number(count)).toBeGreaterThanOrEqual(0);
    }
  });

  it("should fail to get non-existent location", async () => {
    if (!VAULT_CONTRACT_ID) return;
    const { simulate, arg } = await import("./helpers");
    const sim = await simulate(VAULT_CONTRACT_ID, "get_location", [arg.u64(99999)]);
    expect(sim.error).toBeDefined();
  });
});
