"use client";

import { checkConnection } from "./soroban/freighter";

export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center text-center py-24 px-6 min-h-screen bg-space bg-no-repeat bg-cover">
      <h1 className="text-5xl md:text-7xl font-bold mb-6">
        Welcome to AstroFi
      </h1>
      <p className="text-lg md:text-2xl mb-8">
        Fueling the Next Frontier of Space Research through Stellar Blockchain
      </p>
      
    </section>
  );
}
