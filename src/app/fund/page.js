"use client";

import React, { useEffect } from 'react'

const page = () => {
    const getFundStatus= async()=>{
        try{
          const response = await fetch('/api/fund', {
            method: "POST",
          });
          const data = await response.json();
          console.log(response);
    
        }catch(err){
          console.log(err.message)
        }
    }

  useEffect(() => {
    getFundStatus()
  },[])

  return (
    <div>page</div>
  )
}

export default page