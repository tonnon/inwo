"use client"

import '@/styles/shared.css'
import ApocalypticSky from "./apocalyptic-sky"
import CoinLogo from "./coin-logo"
import GlitchTitle from "./glitch-title"

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 md:pt-28">
      {/* Apocalyptic red sky with clouds and fire */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <ApocalypticSky />
      </div>
      {/* Hero Content Centralizado */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full text-center min-h-[calc(100vh-6rem)]">
        <div className="flex flex-col items-center justify-center w-full">
          {/* 3D Coin Logo */}
          <CoinLogo />
          <GlitchTitle text="ILLUMINATI" />
        </div>
        <p className="text-lg md:text-xl lg:text-2xl text-gray-400 max-w-2xl mx-auto px-4 mb-8">
          New World Order - The Ultimate Conspiracy Card Game
        </p>
      </div>
    </section>
  )
}
