"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { saveDifficultyToLocalStorage } from "@/lib/deck-utils"
import type { AIDifficulty } from "@/lib/game-utils"

interface DifficultyModalProps {
  isOpen: boolean
  onClose: () => void
}

const difficulties: {
  id: AIDifficulty
  label: string
  emoji: string
  description: string
  color: string
  borderColor: string
  glowColor: string
  traits: string[]
}[] = [
  {
    id: "easy",
    label: "Easy",
    emoji: "🌱",
    description: "The AI plays randomly, with no real strategy. Good for learning the game.",
    color: "from-emerald-500/20 to-emerald-900/10",
    borderColor: "border-emerald-500/40 hover:border-emerald-400",
    glowColor: "hover:shadow-emerald-500/20",
    traits: ["Random card selection", "No tactical thinking", "Beginner-friendly"],
  },
  {
    id: "medium",
    label: "Medium",
    emoji: "⚡",
    description: "The AI prefers high-cost cards and tries to build its field quickly.",
    color: "from-amber-500/20 to-amber-900/10",
    borderColor: "border-amber-500/40 hover:border-amber-400",
    glowColor: "hover:shadow-amber-500/20",
    traits: ["Prefers high-power cards", "Builds field efficiently", "May play multiple cards"],
  },
  {
    id: "hard",
    label: "Hard",
    emoji: "💀",
    description: "The AI plays strategically, prioritizes Group cards and maximizes power usage.",
    color: "from-red-500/20 to-red-900/10",
    borderColor: "border-red-500/40 hover:border-red-400",
    glowColor: "hover:shadow-red-500/20",
    traits: ["Prioritizes Group cards", "Strategic power usage", "Aggressive multi-play"],
  },
]

export default function DifficultyModal({ isOpen, onClose }: DifficultyModalProps) {
  const [selected, setSelected] = useState<AIDifficulty>("medium")
  const [isStarting, setIsStarting] = useState(false)
  const router = useRouter()

  const handleStart = useCallback(() => {
    setIsStarting(true)
    saveDifficultyToLocalStorage(selected)
    setTimeout(() => {
      router.push("/game")
    }, 400)
  }, [selected, router])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl animate-difficulty-enter">
        {/* Glow ring */}
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-violet-500/30 via-red-500/20 to-amber-500/30 blur-sm" />

        <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-gray-950 via-[#0a0a12] to-black overflow-hidden">
          {/* Header glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-violet-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="relative p-8">
            {/* Title */}
            <div className="text-center mb-8">
              <p className="text-xs uppercase tracking-[0.5em] text-violet-400/80 mb-2">New Game</p>
              <h2 className="text-3xl font-black text-white mb-2">Choose Difficulty</h2>
              <p className="text-gray-400 text-sm">Select your opponent&apos;s AI level before the battle begins</p>
            </div>

            {/* Difficulty options */}
            <div className="grid grid-cols-1 gap-3 mb-8 sm:grid-cols-3">
              {difficulties.map((diff) => (
                <button
                  key={diff.id}
                  id={`difficulty-${diff.id}`}
                  onClick={() => setSelected(diff.id)}
                  className={`
                    relative group rounded-2xl border p-5 text-left transition-all duration-300 cursor-pointer
                    bg-gradient-to-br ${diff.color}
                    ${diff.borderColor}
                    ${diff.glowColor}
                    hover:shadow-lg
                    ${selected === diff.id ? "ring-2 ring-white/30 scale-[1.02]" : ""}
                  `}
                >
                  {selected === diff.id && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white/90 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-black" />
                    </div>
                  )}
                  <div className="text-3xl mb-3">{diff.emoji}</div>
                  <div className="font-black text-lg text-white mb-1">{diff.label}</div>
                  <p className="text-xs text-gray-400 leading-relaxed mb-3">{diff.description}</p>
                  <ul className="space-y-1">
                    {diff.traits.map((trait) => (
                      <li key={trait} className="flex items-center gap-1.5 text-xs text-gray-300">
                        <span className="w-1 h-1 rounded-full bg-white/40 flex-shrink-0" />
                        {trait}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="start-game-btn"
                onClick={handleStart}
                disabled={isStarting}
                className="flex-[2] rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 py-3 text-sm font-black text-white uppercase tracking-widest transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isStarting ? "Entering Battle..." : "⚔️ Start Battle"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes difficultyEnter {
          0% { opacity: 0; transform: scale(0.92) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-difficulty-enter {
          animation: difficultyEnter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  )
}
