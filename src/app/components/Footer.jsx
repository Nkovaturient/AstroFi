"use client";

export default function Footer() {
  return (
    <footer className="py-6 px-6 bg-black text-center text-sm text-gray-400">
      <p>
        © {new Date().getFullYear()} AstroFund | Powered by Stellar, Soroban, and Cosmic Dreams ✨
      </p>
    </footer>
  );
}
