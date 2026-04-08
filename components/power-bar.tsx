"use client"

interface PowerBarProps {
  current: number
  max: number
  used: number
  label?: string
  color?: "purple" | "red"
}

export default function PowerBar({ current, max, used, label = "Power", color = "purple" }: PowerBarProps) {
  const available = current - used
  const crystalCount = 10

  const getCrystalStyle = (index: number) => {
    const crystalIndex = index + 1
    if (crystalIndex > max) {
      // Locked / not yet unlocked
      return "locked"
    }
    if (crystalIndex <= available) {
      // Full / available
      return "full"
    }
    if (crystalIndex <= current) {
      // Used this turn
      return "used"
    }
    return "locked"
  }

  const colorConfig = {
    purple: {
      full: "bg-gradient-to-b from-violet-300 to-violet-600 border-violet-400 shadow-violet-500/60",
      used: "bg-gradient-to-b from-violet-900/60 to-violet-950/60 border-violet-700/40",
      locked: "bg-gray-900/40 border-gray-700/20",
      fullGlow: "shadow-violet-500/60",
    },
    red: {
      full: "bg-gradient-to-b from-red-300 to-red-600 border-red-400 shadow-red-500/60",
      used: "bg-gradient-to-b from-red-900/60 to-red-950/60 border-red-700/40",
      locked: "bg-gray-900/40 border-gray-700/20",
      fullGlow: "shadow-red-500/60",
    },
  }

  const cfg = colorConfig[color]

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs font-bold uppercase tracking-widest text-white/60">{label}</span>
      <div className="flex gap-1 items-center">
        {Array.from({ length: crystalCount }).map((_, i) => {
          const style = getCrystalStyle(i)
          return (
            <div
              key={i}
              className={`
                relative w-5 h-6 rounded-sm border transition-all duration-300
                ${style === "full" ? `${cfg.full} shadow-lg` : ""}
                ${style === "used" ? cfg.used : ""}
                ${style === "locked" ? cfg.locked : ""}
              `}
              title={style === "full" ? "Available" : style === "used" ? "Used" : "Locked"}
            >
              {style === "full" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1.5 h-3 bg-white/30 rounded-full" />
                </div>
              )}
            </div>
          )
        })}
      </div>
      <span className="text-xs font-mono font-bold text-white/80">
        {available}/{current}
      </span>
    </div>
  )
}
