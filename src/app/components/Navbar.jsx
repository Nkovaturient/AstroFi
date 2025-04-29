"use client";

import { useContext } from "react";
import { WalletContext } from "../../walletContext/WalletConnect.jsx";

export default function Navbar() {
  const { walletAddress, connectWallet } = useContext(WalletContext);

  return (
    <nav className="flex justify-between items-center py-6 px-10 bg-black bg-opacity-80 backdrop-blur-sm">
      <div className="text-3xl font-bold text-white">AstroFi</div>
      <div className="flex items-center space-x-6">
        <a href="/" className="text-white hover:text-neonPurple transition">
          Home
        </a>
        <a href="/discoveries" className="text-white hover:text-neonPurple transition">
          Discoveries
        </a>
        <a href="/mission" className="text-white hover:text-neonPurple transition">
          Space Missions
        </a>
        <a href="/dashboard" className="text-white hover:text-neonPurple transition">
          Profile
        </a>

        {walletAddress ? (
          <button
            className="bg-neonPurple text-white font-bold py-2 px-4 rounded-xl transition hover:scale-105"
            disabled
          >
            {walletAddress.slice(0, 5)}...{walletAddress.slice(-4)}
          </button>
        ) : (
          <button
            onClick={connectWallet}
            className="bg-neonPurple text-white font-bold py-2 px-4 rounded-xl hover:scale-105 transition"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}
