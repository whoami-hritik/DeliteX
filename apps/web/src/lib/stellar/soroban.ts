import { rpc, Contract, xdr, TransactionBuilder, Transaction } from "@stellar/stellar-sdk";
import { signTransaction, requestAccess, isConnected } from "@stellar/freighter-api";
import { STELLAR_NETWORK_PASSPHRASE, SOROBAN_RPC_URL } from "./config";

export async function invokeSorobanMethod(
  contractId: string,
  methodName: string,
  args: xdr.ScVal[] = []
): Promise<string> {
  const connected = await isConnected();
  if (!connected) throw new Error("Freighter not connected");

  const access = await requestAccess();
  const publicKey = typeof access === 'string' ? access : access.address;
  const server = new rpc.Server(SOROBAN_RPC_URL);
  const account = await server.getAccount(publicKey);
  
  const contract = new Contract(contractId);
  const op = contract.call(methodName, ...args);

  const tx = new TransactionBuilder(account, {
    fee: "100000", // Increased base fee for Soroban operations
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  })
    .addOperation(op)
    .setTimeout(120)
    .build();

  const preparedTx = await server.prepareTransaction(tx);
  const signedXdr = await signTransaction(preparedTx.toXDR(), { networkPassphrase: STELLAR_NETWORK_PASSPHRASE });
  
  if (!signedXdr || (typeof signedXdr === 'object' && 'error' in signedXdr)) {
    throw new Error(`Freighter signature failed or rejected`);
  }

  let finalXdr = typeof signedXdr === 'string' ? signedXdr : (signedXdr as any).signedTxXdr;
  if (!finalXdr) finalXdr = signedXdr;
  
  const signedTx = TransactionBuilder.fromXDR(finalXdr, STELLAR_NETWORK_PASSPHRASE) as Transaction;
  
  const sendRes = await server.sendTransaction(signedTx);
  if (sendRes.status === "ERROR") {
    throw new Error(`Transaction rejected by network: ` + JSON.stringify((sendRes as any).errorResultXdr || (sendRes as any).errorResult));
  }
  
  let status = "PENDING";
  let receipt;
  while (status === "PENDING") {
    await new Promise(r => setTimeout(r, 2000));
    receipt = await server.getTransaction(sendRes.hash);
    status = receipt.status;
  }
  
  if (status === "FAILED") {
    throw new Error(`Transaction failed on-chain`);
  }
  
  return sendRes.hash;
}
