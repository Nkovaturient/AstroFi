"use client";

import React, {useContext} from "react";
import { WalletContext } from "../../walletContext/WalletConnect";

export default function ConnectWalletButton() {
  const { connectWallet } = useContext(WalletContext);

  return (
    <button
      onClick={connectWallet}
      className="bg-neonPurple px-6 py-3 rounded-lg hover:bg-purple-700 transition-all duration-300 font-semibold"
    >
      Connect Wallet
    </button>
  );
}
