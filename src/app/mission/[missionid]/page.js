"use client"

import { useParams } from 'next/navigation';
import React, { useEffect, useState, useContext } from 'react';
import { useSmartContract } from '@/app/components/soroban/smartContractInteraction';
import { WalletContext } from '@/walletContext/WalletConnect';
import { toast } from 'react-toastify';
import { Mission } from '@/app/api/db/schema';

function MissionDetails () {
  const { missionID } = useParams();
  const { fundMission, getMission, getRemainingFunds, getNftMetadata } = useSmartContract();
  const { walletAddress } = useContext(WalletContext);

  const [mission, setMission] = useState(null);
  const [remainingFunds, setRemainingFunds] = useState(null);
  const [isFunding, setIsFunding] = useState(false);

  const fetchMissionById= async() =>{
    try {
        const data = await Mission.findById(missionID)
        console.log("mission data=", data)
        if (!data) {
          toast.error("Mission not found");
        } else {
          toast.success("Mission details fetched successfully");
        }
        
    } catch (error) {
      console.log(error.message)
      toast.error("Error fetching mission details");
        
    }
  }


  const fetchMissionDetails = async () => {
    try {
      const missionData = await fetchMissionById(missionID);
      if (missionData) {
        setMission(missionData);
      }

      const remaining = await getRemainingFunds(missionID);
      setRemainingFunds(remaining);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load mission data");
    }
  };

  const handleFundMission = async () => {
    setIsFunding(true);
    try {
      const fundAmount = prompt("Enter amount to fund:");
      if (!fundAmount) return;

      await fundMission(missionID, fundAmount);
      toast.success("Mission funded successfully!");

      // Mint NFT post-funding
      const metadata = await getNftMetadata(missionID);
      console.log("NFT Minted:", metadata);

      const updatedFunds = await getRemainingFunds(missionID);
      setRemainingFunds(updatedFunds);
    } catch (error) {
      console.error(error);
      toast.error("Funding failed or canceled");
    } finally {
      setIsFunding(false);
    }
  };

  useEffect(() => {
    if (walletAddress && missionID) {
      fetchMissionDetails();
    }
  }, [walletAddress, missionID]);

  if (!mission) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        Loading mission data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0c29] text-white p-8">
      <div className="max-w-4xl mx-auto bg-[#1e1e2f] p-6 rounded-xl shadow-lg">
        <img src={mission.img_url || '/astro3.webp'} alt={mission.title} className="w-full h-72 object-cover rounded-lg mb-6" />
        <h2 className="text-3xl font-bold text-teal-400 mb-4">{mission.title}</h2>
        <p className="text-gray-300 mb-4">{mission.desc}</p>
        <div className="text-lg mb-2">Target: {mission.target_amount} Lumens</div>
        <div className="text-lg mb-6">Remaining Funds: {remainingFunds ?? 'Loading...'} Lumens</div>
        <button
          onClick={handleFundMission}
          disabled={isFunding}
          className="bg-teal-500 hover:bg-teal-600 transition px-6 py-2 rounded text-white font-semibold"
        >
          {isFunding ? "Processing..." : "Fund This Mission"}
        </button>
      </div>
    </div>
  );
};


export default MissionDetails