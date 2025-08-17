"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import FactionSelection from "@/components/faction-selection"
import DeckBuilder from "@/components/deck-builder"
import { type FactionCard, getCardById } from "@/lib/cards"
import { loadDeckFromLocalStorage } from "@/lib/deck-utils"

export default function DeckManagementPage() {
  const [selectedFaction, setSelectedFaction] = useState<FactionCard | null>(null)

  useEffect(() => {
    // Attempt to load a previously selected faction from local storage
    const saved = loadDeckFromLocalStorage()
    if (saved && saved.factionId) {
      const faction = getCardById(saved.factionId)
      // Ensure the loaded card is indeed a Faction card
      if (faction && faction.type === "Faction") {
        // Updated type check to "Faction"
        setSelectedFaction(faction as FactionCard)
      }
    }
  }, [])

  const handleFactionSelected = (faction: FactionCard) => {
    setSelectedFaction(faction)
  }

  const handleBackToFactionSelection = () => {
    setSelectedFaction(null)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-black border-b border-[#FF324A]/20 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#FF324A] font-mono">INWO - Deck Management</h1>
          <Link href="/">
            <Button className="bg-gradient-to-r from-[#FF324A] to-[#FFBA56] text-black font-semibold px-6 py-2 rounded-full hover:shadow-lg hover:shadow-[#FF324A]/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {selectedFaction ? (
          <DeckBuilder selectedFaction={selectedFaction} onBackToFactionSelection={handleBackToFactionSelection} />
        ) : (
          <FactionSelection onFactionSelected={handleFactionSelected} />
        )}
      </main>

      {/* Footer (optional, can be a shared layout component) */}
      <footer className="relative py-6 px-4 md:px-8 bg-black overflow-hidden mt-auto">
        <div className="absolute inset-0 footer-background-image"></div>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
        <div className="relative z-10 text-center text-gray-400">
          <p className="text-sm font-mono text-[#FF324A]">INWO - Illuminati: New World Order</p>
          <p className="text-xs">&copy; {new Date().getFullYear()} All Rights Reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        .footer-background-image {
          background-image: url('/footer-background.jpeg');
          background-size: cover;
          background-position: center;
          filter: blur(3px) grayscale(50%);
          opacity: 0.3;
          transform: scale(1.05);
        }
      `}</style>
    </div>
  )
}
