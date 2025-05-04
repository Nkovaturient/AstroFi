"use client";

import React, { useEffect } from 'react'

const FundTransfer = () => {
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
    <div>FundTransfer</div>
  )
}

export default FundTransfer