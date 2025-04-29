"use client";

import { createContext, useEffect, useState, useCallback } from "react";
import { checkConnection, retrievePublicKey } from "../app/components/soroban/freighter";
import { toast } from "react-toastify";

export const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = useCallback(async () => {
    try {
      const connection = await checkConnection();
      if (!connection) {
        toast.info("⚠ Please allow Freighter access to continue.");
        return;
      }

      const publicKey = await retrievePublicKey();
      console.log("Public Key:", publicKey);
      const address= publicKey.address;
      if (!publicKey) {
        throw new Error("Failed to retrieve public key.");
      }

      setWalletAddress(address);
      setIsConnected(true);
      localStorage.setItem("walletAddress", address);

      toast.success("✅ Wallet connected successfully!");
    } catch (error) {
      console.error("[connectWallet Error]:", error);
      toast.error("⚠ Failed to connect wallet. Please check Freighter permissions.");
    }
  }, []);

  useEffect(() => {
    const initializeWallet = async () => {
      try {
        const savedAddress = localStorage.getItem("walletAddress");
        if (savedAddress) {
          setWalletAddress(savedAddress);
          setIsConnected(true);
        } else {
          await connectWallet();
        }
      } catch (error) {
        console.error("[initializeWallet Error]:", error);
      }
    };

    initializeWallet();
  }, [connectWallet]);

  return (
    <WalletContext.Provider value={{ walletAddress, isConnected, connectWallet }}>
      {children}
    </WalletContext.Provider>
  );
}
