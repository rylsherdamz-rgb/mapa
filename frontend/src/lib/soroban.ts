import { SorobanRpc, nativeToScVal, scValToNative, xdr, Address } from "@stellar/stellar-sdk";
import { getRpc, getContract } from "./stellar";

export const arg = {
  u64: (v: number) => nativeToScVal(v, { type: "u64" }),
  i128: (v: number | bigint) => nativeToScVal(v, { type: "i128" }),
  u128: (v: number | bigint) => nativeToScVal(v, { type: "u128" }),
  address: (v: string) => new Address(v).toScVal(),
  string: (v: string) => nativeToScVal(v, { type: "string" }),
  bool: (v: boolean) => nativeToScVal(v, { type: "bool" }),
  vec: (items: xdr.ScVal[]) => xdr.ScVal.scvVec(items),
};

export async function readContract(contractId: string, method: string, params: xdr.ScVal[]) {
  const rpc = getRpc();
  const contract = getContract(contractId);

  const result = await rpc.simulateContract(
    contract.tx.fromXDR(xdr.TransactionEnvelope, "") as any
  );

  const args = [contract.address().toScVal(), ...params];
  const tx = contract.call(method, ...args);

  const sim = await rpc.simulateContract(tx);
  if (!sim.result) {
    throw new Error("Simulation failed: " + JSON.stringify(sim));
  }

  return scValToNative(sim.result.retval);
}

export async function writeContract(
  contractId: string,
  method: string,
  params: xdr.ScVal[],
  publicKey: string,
  signTx: (tx: string) => Promise<string>
) {
  const rpc = getRpc();
  const contract = getContract(contractId);

  const args = [contract.address().toScVal(), ...params];
  const tx = contract.call(method, ...args);

  const account = await rpc.getAccount(publicKey);
  const fee = "100000";

  const transaction = new SorobanRpc.TransactionBuilder(account, {
    fee,
    networkPassphrase: process.env.NEXT_PUBLIC_STELLAR_NETWORK === "pubnet"
      ? "Public Global Stellar Network ; September 2015"
      : "Test SDF Network ; September 2015",
  })
    .addOperation(tx)
    .setTimeout(30)
    .build();

  const txXdr = transaction.toEnvelope().toXDR("base64");
  const signedXdr = await signTx(txXdr);
  const result = await rpc.sendTransaction(signedXdr);

  if (result.status === "PENDING") {
    const hash = result.hash;
    let attempts = 0;
    while (attempts < 30) {
      await new Promise((r) => setTimeout(r, 1000));
      const res = await rpc.getTransaction(hash);
      if (res.status === "SUCCESS") {
        return scValToNative(res.resultValue!);
      }
      if (res.status === "FAILED") {
        throw new Error("Transaction failed");
      }
      attempts++;
    }
    throw new Error("Transaction timeout");
  }

  throw new Error("Transaction submission failed: " + result.errorLog?.join(", "));
}
