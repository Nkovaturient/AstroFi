import { Server, Keypair, TransactionBuilder, Networks, Operation, Asset } from "stellar-sdk";
import { invokeContractFunction } from "@stellar/soroban-client"; 

const server = new Server("https://soroban-testnet.stellar.org");

async function fundProject(userPublicKey, projectId, amount) {
  try {
    const account = await server.loadAccount(userPublicKey);

    // Build transaction
    const tx = new TransactionBuilder(account, {
      fee: await server.fetchBaseFee(),
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(Operation.payment({
        destination: YOUR_SMART_CONTRACT_ADDRESS,
        asset: Asset.native(),
        amount: amount.toString(),
      }))
      .setTimeout(30)
      .build();

    // Sign and submit
    await window.freighterApi.signTransaction(tx.toXDR(), { network: "TESTNET" });
    const txResponse = await server.submitTransaction(tx);
    console.log("Fund Payment TX Success", txResponse);

    // Then call Smart Contract to update backend
    await invokeContractFunction('fund_program', [projectId, userPublicKey, amount]);

  } catch (error) {
    console.error("Error funding project:", error);
  }
}


import {
  Keypair,
  Server,
  TransactionBuilder,
  Operation,
  Networks,
  BASE_FEE,
  Asset
} from "stellar-sdk";

async function sendPayment(senderSecret, destinationID, amount) {
  const sourceKeypair = Keypair.fromSecret(senderSecret);
  const server = new Server("https://horizon-testnet.stellar.org");

  const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());

  const fee = await server.fetchBaseFee();

  const transaction = new TransactionBuilder(sourceAccount, {
    fee,
    networkPassphrase: Networks.TESTNET
  })
    .addOperation(Operation.payment({
      destination: destinationID,
      asset: Asset.native(),
      amount: amount.toString(),
    }))
    .setTimeout(30)
    .build();

  transaction.sign(sourceKeypair);

  try {
    const result = await server.submitTransaction(transaction);
    console.log("Payment Success!", result);
    return result.hash; // return txn hash
  } catch (e) {
    console.error("Payment Failed:", e);
    throw e;
  }
}



