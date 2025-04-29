"use client";

import HeroSection from "@/app/components/HeroSection";
import AboutSection from "@/app/components/AboutSection.jsx";
import DiscoveriesSection from "@/app/components/DiscoverSection.jsx";
import Footer from "@/app/components/Footer.jsx";
import { useEffect } from "react";

export default function LandingPage() {

  const connectDB= async()=>{
    try{
      const response = await fetch('/api/seed', {
        method: "GET",
      });
      const data = await response.json();
      console.log(response);

    }catch(err){
      console.log(err.message)
    }
  }


  return (
    <main className="min-h-screen flex flex-col">
      <HeroSection />
      <AboutSection />
      <DiscoveriesSection />
      <Footer />
    </main>
  );
}
