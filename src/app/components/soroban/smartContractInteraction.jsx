import {
  Contract,
  rpc,
  nativeToScVal,
  Address,
  xdr,
  BASE_FEE,
  scValToNative,
  Networks,
  TransactionBuilder,

} from "@stellar/stellar-sdk";
import { userSignTransaction } from "./freighter";
import { WalletContext } from "../../../walletContext/WalletConnect.jsx";
import { useContext } from "react";
import { useParams } from "next/navigation";

const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;
const contractId = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;


export const useSmartContract = async () => {
  const { walletAddress } = useContext(WalletContext);
  const server = new rpc.Server(RPC_URL, { allowHttp: true });
  const sourceAccount = await server.getAccount(walletAddress);
  const contract = new Contract(contractId);
  // let params= useParams()
  // let buildTx;

  // buildTx = new TransactionBuilder(sourceAccount, params)
  //   .addOperation(contract.call(functName))
  //   .setTimeout(30)
  //   .build();

  const simulateAndSend = async (tx) => {
    try {
      const simulated = await server.simulateTransaction(tx);
      const txWithFootprint = SorobanRpc.assembleTransaction(tx, {
        ...simulated,
        transactionData: simulated.transactionData,
      });

      const signedXDR = await userSignTransaction(txWithFootprint.toXDR(), NETWORK_PASSPHRASE, walletAddress);
      const signedTx = xdr.TransactionEnvelope.fromXDR(signedXDR, "base64");

      const sendResponse = await server.sendTransaction(signedTx);
      console.log("TX Submitted:", sendResponse);
      return sendResponse;
    } catch (error) {
      console.error("[simulateAndSend Error]:", error);
      return null;
    }
  };

  const registerMission = async (missionId, title, desc, imageUrl, targetAmount) => {
    const source = await server.getAccount(walletAddress);
    const tx = new TransactionBuilder(source, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call("register_mission", {
        mission_id: nativeToScVal(missionId, { type: "bytes" }),
        title: nativeToScVal(title),
        desc: nativeToScVal(desc),
        image_url: nativeToScVal(imageUrl),
        target_amount: nativeToScVal(targetAmount, { type: "i128" }),
        owner: new Address(walletAddress).toScVal(),
      }))
      .setTimeout(30)
      .build();

    return await simulateAndSend(tx);
  };

  const fundMission = async (missionId, amount) => {
    const source = await server.getAccount(walletAddress);
    const tx = new TransactionBuilder(source, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call("fund_mission", {
        mission_id: nativeToScVal(missionId, { type: "bytes" }),
        donor: new Address(walletAddress).toScVal(),
        amount: nativeToScVal(amount, { type: "i128" }),
      }))
      .setTimeout(30)
      .build();

    return await simulateAndSend(tx);
  };

  const getMission = async (missionId) => {
    try {
      const result = await server.getContractValue(contractId, {
        function: "get_mission",
        args: [
          nativeToScVal(missionId, { type: "bytes" }),
        ],
      });
      return result;
    } catch (err) {
      console.error("[getMission Error]:", err);
      return null;
    }
  };

  const getRemainingFunds = async (missionId) => {
    try {
      const result = await server.getContractValue(contractId, {
        function: "get_remaining_funds",
        args: [
          nativeToScVal(missionId, { type: "bytes" }),
        ],
      });
      return scValToNative(result.result);
    } catch (err) {
      console.error("[getRemainingFunds Error]:", err);
      return null;
    }
  };

  const getNftMetadata = async (missionId) => {
    try {
      const result = await server.getContractValue(contractId, {
        function: "get_nft_metadata",
        args: [
          nativeToScVal(missionId, { type: "bytes" }),
        ],
      });
      return result.result ? scValToNative(result.result) : null;
    } catch (err) {
      console.error("[getNftMetadata Error]:", err);
      return null;
    }
  };

  return {
    registerMission,
    fundMission,
    getMission,
    getRemainingFunds,
    getNftMetadata,
  };
};
