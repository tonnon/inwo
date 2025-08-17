"use client"

import type { BaseCard, FactionCard, GroupLikeCard } from "@/lib/cards" // Import specific card types

interface CardDisplayProps {
  card: BaseCard
  onClick?: (card: BaseCard) => void
  className?: string
  size?: "small" | "medium" | "large"
  imageFit?: "cover" | "contain"
  isFaceDown?: boolean // New prop for face-down cards
}

export default function CardDisplay({
  card,
  onClick,
  className,
  size = "medium",
  imageFit = "cover",
  isFaceDown = false, // Default to face up
}: CardDisplayProps) {
  // Increased dimensions for 'small' and 'medium' sizes
  const width = size === "small" ? 120 : size === "medium" ? 180 : 250
  const height = size === "small" ? 180 : size === "medium" ? 270 : 375

  const isGroupLike =
    card.type === "Group" ||
    card.type === "Resource" ||
    card.type === "Place" ||
    card.type === "Personality" ||
    card.type === "Organization" ||
    card.type === "Artifact"

  const groupCard = isGroupLike ? (card as GroupLikeCard) : null
  const factionCard = card.type === "Faction" ? (card as FactionCard) : null

  return (
    <div
      className={`relative group rounded-md overflow-hidden shadow-lg transition-all duration-200 ease-in-out
        ${onClick ? "cursor-pointer hover:scale-105 hover:shadow-xl hover:shadow-[#FF324A]/30" : ""}
        ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
      onClick={() => onClick?.(card)}
    >
      {isFaceDown ? (
        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-950 border-2 border-gray-700 flex items-center justify-center text-gray-500 text-xl font-bold">
          INWO
        </div>
      ) : (
        <>
          <img
            src={card.imageUrl || "/placeholder.svg"}
            alt={card.name}
            width={width}
            height={height}
            className={`w-full h-full object-${imageFit}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2">
            <h4 className="text-sm font-bold text-white truncate">{card.name}</h4>
            <p className="text-xs text-gray-300 line-clamp-2">{card.description}</p>
          </div>
          {card.isUnique && (
            <span className="absolute top-1 right-1 bg-[#FFBA56] text-black text-xs px-2 py-1 rounded-full font-bold">
              Unique
            </span>
          )}

          {/* Card Type Tag */}
          <span className="absolute top-1 left-1 bg-black/70 text-white text-[0.6rem] px-1.5 py-0.5 rounded-md font-mono">
            {card.type}
          </span>

          {/* Stats for Group-like cards */}
          {groupCard && (
            <div className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-[0.6rem] p-1 rounded-md flex justify-between items-center">
              <span>P:{groupCard.power}</span>
              <span>R:{groupCard.resistance}</span>
              <span>I:{groupCard.income}</span>
            </div>
          )}

          {/* Stats for Faction cards (Power) */}
          {factionCard && (
            <div className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-[0.6rem] p-1 rounded-md flex justify-between items-center">
              <span>Power: {factionCard.power}</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
