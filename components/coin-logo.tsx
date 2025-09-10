"use client"

import { useEffect, useState } from 'react'
import '@/styles/shared.css'

export default function CoinLogo() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="mb-8 perspective-1000 flex justify-center w-full">
      <div
        className={`coin-container w-64 h-64 md:w-80 md:h-80 animate-coin-flip transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        style={{ opacity: mounted ? 1 : 0 }}
      >
        {/* Back layers for depth with logo */}
        <div className="coin-layer coin-back-4">
          <img
            src="/logo.png"
            alt="INWO Logo Back"
            className="w-full h-full object-contain opacity-20 transform scale-x-[-1]"
          />
        </div>
        <div className="coin-layer coin-back-3">
          <img
            src="/logo.png"
            alt="INWO Logo Back"
            className="w-full h-full object-contain opacity-30 transform scale-x-[-1]"
          />
        </div>
        <div className="coin-layer coin-back-2">
          <img
            src="/logo.png"
            alt="INWO Logo Back"
            className="w-full h-full object-contain opacity-40 transform scale-x-[-1]"
          />
        </div>
        <div className="coin-layer coin-back-1">
          <img
            src="/logo.png"
            alt="INWO Logo Back"
            className="w-full h-full object-contain opacity-60 transform scale-x-[-1]"
          />
        </div>
        {/* Main coin face */}
        <div className="coin-layer coin-front">
          <img src="/logo.png" alt="INWO Logo" className="w-full h-full object-contain" />
          {/* Shine effect */}
          <div className="coin-shine"></div>
        </div>
        {/* Edge highlight */}
        <div className="coin-edge"></div>
      </div>
    </div>
  )
}
