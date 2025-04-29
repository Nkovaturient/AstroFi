import React from 'react'
import {
    Contract,
    SorobanRpc,
    TransactionBuilder,
    Networks,
    BASE_FEE,
    nativeToScVal,
    Address,
  } from "@stellar/stellar-sdk";

import { toast } from "react-toastify";
import { WalletContext } from '@/walletContext/WalletConnect.jsx';
import { checkConnection, userSignTransaction, retrievePublicKey } from './freighter.jsx'

const smartContractInteraction = () => {

const StellarSdk = require('@stellar/stellar-sdk');
const { userSignTransaction } = require('@stellar/freighter-api');

const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const sorobanServer = new StellarSdk.SorobanRpc.Server('https://soroban-testnet.stellar.org');

const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS; 
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

// Helper function to convert values to ScVal
const toScVal = (value, type) => {
  switch (type) {
    case 'address':
      return new StellarSdk.Address(value).toScVal();
    case 'string':
      return StellarSdk.nativeToScVal(value);
    case 'i128':
      return StellarSdk.nativeToScVal(value, { type: 'i128' });
    case 'bytesN':
      return StellarSdk.nativeToScVal(value, { type: 'bytesN' });
    default:
      throw new Error('Unsupported type');
  }
};

// Endpoint to retrieve NFT metadata
const contractFunc = async (req, res) => {
  const { missionId } = req.params;

  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const sourceAccount = await sorobanServer.getAccount(CONTRACT_ID);

    const getNftTx = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call('get_nft_metadata', toScVal(missionId, 'bytesN')))
      .setTimeout(30)
      .build();

    const preparedTx = await sorobanServer.prepareTransaction(getNftTx);
    const signedXDR = await userSignTransaction(preparedTx.toXDR(), NETWORK_PASSPHRASE, CONTRACT_ID);
    const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXDR, NETWORK_PASSPHRASE);

    const txResponse = await sorobanServer.sendTransaction(signedTx);

    // Poll for transaction result
    let result = await sorobanServer.getTransaction(txResponse.hash);
    while (result.status === 'NOT_FOUND') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      result = await sorobanServer.getTransaction(txResponse.hash);
    }

    if (result.status !== 'SUCCESS') {
      throw new Error('Failed to retrieve NFT metadata');
    }

    res.json({ metadata: result.returnValue });
  } catch (error) {
    console.error('Error retrieving NFT metadata:', error);
    res.status(500).json({ error: error.message });
  }
};



  return (
    <div>smartContractInteraction</div>
  )
}

export default smartContractInteraction