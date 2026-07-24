import { describe, it, expect } from "vitest";
import { RoomState, calculateDistance, formatScore, formatDistance, formatStroops } from "../game";

describe("RoomState", () => {
  it("has expected enum values", () => {
    expect(RoomState.Waiting).toBe(0);
    expect(RoomState.Ready).toBe(1);
    expect(RoomState.Guessed1).toBe(2);
    expect(RoomState.Guessed2).toBe(3);
    expect(RoomState.Completed).toBe(4);
    expect(RoomState.Claimed).toBe(5);
  });
});

describe("calculateDistance", () => {
  it("returns 0 for the same point", () => {
    expect(calculateDistance(0, 0, 0, 0)).toBe(0);
  });

  it("returns ~111km for 1 degree of latitude at equator", () => {
    const dist = calculateDistance(0, 0, 1, 0);
    expect(dist).toBeGreaterThan(110_000);
    expect(dist).toBeLessThan(112_000);
  });

  it("returns 0 for the same known coordinate", () => {
    const dist = calculateDistance(48.8566, 2.3522, 48.8566, 2.3522);
    expect(dist).toBe(0);
  });

  it("gives a reasonable distance between Paris and London", () => {
    const paris = { lat: 48.8566, lng: 2.3522 };
    const london = { lat: 51.5074, lng: -0.1278 };
    const dist = calculateDistance(paris.lat, paris.lng, london.lat, london.lng);
    expect(dist).toBeGreaterThan(300_000);
    expect(dist).toBeLessThan(400_000);
  });

  it("is symmetric", () => {
    const d1 = calculateDistance(40.7128, -74.006, 34.0522, -118.244);
    const d2 = calculateDistance(34.0522, -118.244, 40.7128, -74.006);
    expect(d1).toBeCloseTo(d2, 0);
  });
});

describe("formatScore", () => {
  it("returns percentage of 1_000_000", () => {
    expect(formatScore(1_000_000)).toBe(100);
    expect(formatScore(500_000)).toBe(50);
    expect(formatScore(0)).toBe(0);
    expect(formatScore(750_000)).toBe(75);
  });
});

describe("formatDistance", () => {
  it("shows meters for small distances", () => {
    expect(formatDistance(500)).toBe("500m");
    expect(formatDistance(999)).toBe("999m");
  });

  it("shows km for large distances", () => {
    expect(formatDistance(1000)).toBe("1.0km");
    expect(formatDistance(1500)).toBe("1.5km");
    expect(formatDistance(12345)).toBe("12.3km");
  });
});

describe("formatStroops", () => {
  it("converts stroops to XLM", () => {
    expect(formatStroops(10_000_000)).toBe("1.00");
    expect(formatStroops(55_000_000)).toBe("5.50");
    expect(formatStroops(0)).toBe("0.00");
    expect(formatStroops(1_234_560)).toBe("0.12");
  });
});
