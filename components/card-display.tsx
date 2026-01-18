"use client"

import type { BaseCard, FactionCard, GroupLikeCard } from "@/lib/cards" // Import specific card types

interface CardDisplayProps {
  card: BaseCard
  onClick?: (card: BaseCard) => void
  className?: string
  size?: "small" | "medium" | "large" | "xlarge"
  imageFit?: "cover" | "contain"
  isFaceDown?: boolean // New prop for face-down cards
  lockAspect?: boolean
  showStats?: boolean
  showAlignments?: boolean
}

export default function CardDisplay({
  card,
  onClick,
  className,
  size = "medium",
  imageFit = "cover",
  isFaceDown = false, // Default to face up
  lockAspect = true,
  showStats = true,
  showAlignments = true,
}: CardDisplayProps) {
  const sizeDimensions: Record<NonNullable<CardDisplayProps["size"]>, { width: number; height: number }> = {
    small: { width: 150, height: 225 },
    medium: { width: 210, height: 315 },
    large: { width: 280, height: 420 },
    xlarge: { width: 360, height: 540 },
  }

  const { width, height } = sizeDimensions[size]
  const containerStyle = lockAspect ? { width, height } : { width }
  const imageDimensionsClass = lockAspect ? "h-full w-full" : "w-full h-auto"

  const isGroupLike =
    card.type === "Group" ||
    card.type === "Resource" ||
    card.type === "Place" ||
    card.type === "Personality" ||
    card.type === "Organization" ||
    card.type === "Artifact"

  const groupCard = isGroupLike ? (card as GroupLikeCard) : null
  const factionCard = card.type === "Faction" ? (card as FactionCard) : null
  const alignments = (card as Partial<GroupLikeCard>).alignments ?? []
  const paletteByType: Record<string, { from: string; via: string; to: string }> = {
    Faction: { from: "#FF512F", via: "#F09819", to: "#FF512F" },
    Group: { from: "#4776E6", via: "#8E54E9", to: "#4776E6" },
    Plot: { from: "#fc00ff", via: "#00dbde", to: "#fc00ff" },
    Resource: { from: "#00B4DB", via: "#0083B0", to: "#00B4DB" },
    Personality: { from: "#FF5F6D", via: "#FFC371", to: "#FF5F6D" },
    Artifact: { from: "#36D1DC", via: "#5B86E5", to: "#36D1DC" },
    Place: { from: "#11998E", via: "#38EF7D", to: "#11998E" },
    Organization: { from: "#8E2DE2", via: "#4A00E0", to: "#8E2DE2" },
    Special: { from: "#3A1C71", via: "#D76D77", to: "#FFAF7B" },
    Goal: { from: "#FBD786", via: "#f7797d", to: "#FBD786" },
    Disaster: { from: "#ba8b02", via: "#181818", to: "#ba8b02" },
    "New World Order": { from: "#1D976C", via: "#93F9B9", to: "#1D976C" },
  }
  const palette = paletteByType[card.type] ?? { from: "#FF324A", via: "#FFBA56", to: "#6C5CE7" }

  return (
    <div style={containerStyle} className={`inline-flex ${className}`}>
      <div
        className={`group relative w-full h-full rounded-2xl p-[2px] shadow-[0_15px_30px_rgba(0,0,0,0.45)] transition-all duration-300 ${
          onClick ? "cursor-pointer hover:-translate-y-1" : ""
        }`}
        style={{
          backgroundImage: `linear-gradient(135deg, ${palette.from}, ${palette.via}, ${palette.to})`,
        }}
        onClick={() => onClick?.(card)}
      >
        <div className="relative h-full w-full rounded-[18px] overflow-hidden bg-[#05060A]">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_#ffffff33,_transparent_55%)]" />
          {isFaceDown ? (
            <div className="relative z-10 flex h-full w-full items-center justify-center border-2 border-gray-700 bg-gradient-to-br from-gray-800 to-gray-950 text-xl font-bold text-gray-500">
              INWO
            </div>
          ) : (
            <>
              <img
                src={card.imageUrl || "/placeholder.svg"}
                alt={card.name}
                width={width}
                height={height}
                loading="lazy"
                className={`relative z-0 ${imageDimensionsClass} object-${imageFit}`}
              />
              {card.isUnique && (
                <span className="absolute right-2 top-2 rounded-full bg-[#FFBA56] px-2 py-1 text-xs font-bold text-black">
                  Unique
                </span>
              )}
              {showAlignments && alignments.length > 0 && (
                <div className="absolute left-2 top-2 flex max-w-[80%] flex-wrap gap-1">
                  {alignments.slice(0, 3).map((alignment) => (
                    <span
                      key={`${card.id}-${alignment}`}
                      className="rounded-full border border-white/10 bg-black/65 px-2 py-[2px] text-[0.55rem] uppercase tracking-wide text-white"
                    >
                      {alignment}
                    </span>
                  ))}
                  {alignments.length > 3 && (
                    <span className="rounded-full border border-white/10 bg-black/65 px-2 py-[2px] text-[0.55rem] uppercase tracking-wide text-white">
                      +{alignments.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Stats for Group-like cards */}
              {showStats && groupCard && (
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between rounded-lg border border-white/10 bg-black/70 px-2 py-1 text-[0.65rem] text-white backdrop-blur-sm">
                  <span className="font-mono">
                    P:<span className="ml-1 font-semibold">{groupCard.power}</span>
                  </span>
                  <span className="font-mono">
                    R:<span className="ml-1 font-semibold">{groupCard.resistance}</span>
                  </span>
                  <span className="font-mono">
                    I:<span className="ml-1 font-semibold">{groupCard.income}</span>
                  </span>
                </div>
              )}

              {/* Stats for Faction cards (Power) */}
              {showStats && factionCard && (
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between rounded-lg border border-white/10 bg-black/70 px-2 py-1 text-[0.65rem] text-white backdrop-blur-sm">
                  <span className="font-semibold">Power: {factionCard.power}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
