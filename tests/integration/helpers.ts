import {
  SorobanRpc,
  Contract,
  nativeToScVal,
  scValToNative,
  Address,
  xdr,
  Keypair,
  BASE_FEE,
  Networks,
  TransactionBuilder,
  Operation,
  Asset,
} from "@stellar/stellar-sdk";

const RPC_URL = process.env.SOROBAN_RPC || "https://soroban-testnet.stellar.org";
const NETWORK = Networks.TESTNET;

export function getRpc() {
  return new SorobanRpc.Server(RPC_URL);
}

export function getContract(contractId: string) {
  return new Contract(contractId);
}

export async function fundAccount(publicKey: string) {
  const rpc = getRpc();
  try {
    await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
  } catch {
    // friendbot may already have funded this account
  }
  await new Promise((r) => setTimeout(r, 3000));
}

export async function simulate(contractId: string, method: string, args: xdr.ScVal[]) {
  const rpc = getRpc();
  const contract = getContract(contractId);
  const tx = contract.call(method, ...args);
  const sim = await rpc.simulateContract(tx);
  return sim;
}

export async function submit(
  contractId: string,
  method: string,
  args: xdr.ScVal[],
  kp: Keypair
) {
  const rpc = getRpc();
  const contract = getContract(contractId);
  const tx = contract.call(method, ...args);

  const source = await rpc.getAccount(kp.publicKey());
  const transaction = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK,
  })
    .addOperation(tx)
    .setTimeout(30)
    .build();

  transaction.sign(kp);

  const result = await rpc.sendTransaction(transaction.toEnvelope().toXDR("base64"));
  if (result.status === "PENDING") {
    let attempts = 0;
    while (attempts < 30) {
      await new Promise((r) => setTimeout(r, 1000));
      const res = await rpc.getTransaction(result.hash);
      if (res.status === "SUCCESS") {
        return res;
      }
      if (res.status === "FAILED") {
        throw new Error(`Transaction failed: ${JSON.stringify(res)}`);
      }
      attempts++;
    }
    throw new Error("Transaction timeout");
  }
  throw new Error(`Submission failed: ${JSON.stringify(result)}`);
}

export const arg = {
  u64: (v: number) => nativeToScVal(v, { type: "u64" }),
  i128: (v: number | bigint) => nativeToScVal(v, { type: "i128" }),
  u128: (v: number | bigint) => nativeToScVal(v, { type: "u128" }),
  address: (v: string) => new Address(v).toScVal(),
  string: (v: string) => nativeToScVal(v, { type: "string" }),
  bool: (v: boolean) => nativeToScVal(v, { type: "bool" }),
};
