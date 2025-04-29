'use client';

import React, { useEffect, useState } from 'react';
import MissionCard from '@/app/components/MissionCard';
import { toast } from 'react-toastify';

const MissionCatalog = () => {
  const [missionList, setMissionList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMission = async () => {
    try {
      const response = await fetch('/api/mission', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (!data || data.length === 0) {
        toast.error("No missions found");
      } else {
        setMissionList(data);
        toast.success("Mission details fetched successfully");
      }
    } catch (error) {
      console.log(error.message);
      toast.error("Error fetching mission details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMission();
  }, []);

  return (
    <div className="min-h-screen w-full px-4 md:px-12 py-10 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      <h1 className="text-3xl md:text-5xl font-bold text-center mb-10 tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-cyan-400 to-teal-300 drop-shadow-xl">
        Explore Space Missions and Research Programs
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-60">
          <span className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></span>
        </div>
      ) : missionList.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {missionList.map((mission, index) => (
            <MissionCard key={index} mission={mission} />
          ))}
        </div>
      ) : (
        <div className="text-center mt-10 text-lg text-gray-300">
          No Research Programs or Missions Available.
        </div>
      )}
    </div>
  );
};

export default MissionCatalog;
