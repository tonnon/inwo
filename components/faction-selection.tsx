"use client"

// import Image from "next/image" // Removed next/image import
import { getFactionCards, type FactionCard } from "@/lib/cards"

interface FactionSelectionProps {
  onFactionSelected: (faction: FactionCard) => void
}

export default function FactionSelection({ onFactionSelected }: FactionSelectionProps) {
  const factions = getFactionCards()

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-[#FF324A] font-mono">Choose Your Faction</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
        {factions.map((faction) => (
          <div
            key={faction.id}
            onClick={() => onFactionSelected(faction)}
            className="bg-gradient-to-br from-gray-900 to-black border border-[#FF324A]/20 rounded-xl p-6 text-center cursor-pointer transition-all duration-300 hover:border-[#FF324A] hover:shadow-lg hover:shadow-[#FF324A]/20 hover:-translate-y-2 group relative overflow-hidden"
          >
            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF324A]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />

            <div className="relative w-full max-w-full mx-auto mb-4 flex items-center justify-center overflow-hidden rounded-md aspect-[8/5]">
              <img // Changed from Image to img
                src={faction.imageUrl || "/placeholder.svg"}
                alt={`${faction.name} card`}
                width={200} // Native img width attribute
                height={125} // Native img height attribute
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#FF324A] font-mono">{faction.name}</h3>
            <p className="text-gray-400 leading-relaxed line-clamp-3">{faction.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
