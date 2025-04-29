"use client"

import { Mission } from '@/app/api/db/schema';
import { useParams } from 'next/navigation'
import React, { useEffect } from 'react'
import { toast } from 'react-toastify';

const MissionRender = () => {
  const missionID = useParams();

  const fetchMissionById= async() =>{
    try {
        const data = await Mission.findById(missionID)
        // const data= response.data
        console.log(data)
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

useEffect(() => {
    fetchMissionById()
}, [missionID])


  return (
    <div>MissionRender</div>
  )
}

export default MissionRender