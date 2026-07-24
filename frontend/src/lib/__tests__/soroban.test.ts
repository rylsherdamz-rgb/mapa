import { describe, it, expect, vi, beforeEach } from "vitest";
import { xdr, nativeToScVal } from "@stellar/stellar-sdk";
import { arg } from "../soroban";

vi.mock("@stellar/stellar-sdk", async () => {
  const actual = await vi.importActual("@stellar/stellar-sdk");
  return {
    ...(actual as object),
    nativeToScVal: vi.fn(),
    xdr: {
      ScVal: {
        scvVec: vi.fn((items) => ({ _type: "vec", items })),
      },
    },
  };
});

describe("arg helper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("u64 calls nativeToScVal with u64 type", () => {
    arg.u64(42);
    expect(nativeToScVal).toHaveBeenCalledWith(42, { type: "u64" });
  });

  it("i128 calls nativeToScVal with i128 type", () => {
    arg.i128(100);
    expect(nativeToScVal).toHaveBeenCalledWith(100, { type: "i128" });
  });

  it("i128 accepts bigint", () => {
    arg.i128(BigInt(1_000_000));
    expect(nativeToScVal).toHaveBeenCalledWith(BigInt(1_000_000), { type: "i128" });
  });

  it("u128 calls nativeToScVal with u128 type", () => {
    arg.u128(255);
    expect(nativeToScVal).toHaveBeenCalledWith(255, { type: "u128" });
  });

  it("string calls nativeToScVal with string type", () => {
    arg.string("hello");
    expect(nativeToScVal).toHaveBeenCalledWith("hello", { type: "string" });
  });

  it("bool calls nativeToScVal with no type option", () => {
    arg.bool(true);
    expect(nativeToScVal).toHaveBeenCalledWith(true);
  });

  it("vec wraps items with scvVec", () => {
    const items = [xdr.ScVal.scvVec([])];
    const result = arg.vec(items);
    expect(result).toEqual({ _type: "vec", items });
  });
});
