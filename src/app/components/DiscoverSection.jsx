"use client";

const discoveries = [
  {
    title: "The Next Earth-like Planet",
    description: "Join missions spotting habitable exoplanets beyond our galaxy.",
  },
  {
    title: "Dark Matter Research",
    description: "Fund investigations unraveling the mysteries of unseen cosmic energy.",
  },
  {
    title: "Galactic NFT Mint",
    description: "Own a piece of the cosmos through limited-edition reward NFTs.",
  },
];

export default function DiscoveriesSection() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-spaceBlue to-black text-center">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-neonPurple">
          Ongoing Discoveries
        </h2>
        <div className="grid gap-10 md:grid-cols-3">
          {discoveries.map((item, idx) => (
            <div
              key={idx}
              className="bg-spaceBlue border border-neonPurple rounded-xl p-6 hover:scale-105 transition-transform duration-300"
            >
              <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
              <p className="text-base text-starWhite">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
