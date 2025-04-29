"use client";

export default function AboutSection() {
  return (
    <section className="py-20 px-6 text-center bg-spaceBlue">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-neonPurple">
          About AstroFi
        </h2>
        <p className="text-lg md:text-xl text-starWhite leading-relaxed">
          AstroFi is pioneering space research by connecting enthusiasts and researchers through decentralized funding.
          Each contribution helps launch missions, fund telescopic discoveries, and mint historic cosmic NFTs representing your journey in space exploration.
          Powered by Stellar blockchain and Soroban smart contracts, AstroFi is the future of celestial science collaboration.
        </p>
      </div>
    </section>
  );
}
