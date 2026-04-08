"use client"

import { useState } from "react"
import type { VictoryStatus } from "@/lib/inwo-types"
import { BASIC_GOAL_GROUPS } from "@/hooks/use-victory-condition"

// ── Radial progress ring ─────────────────────────────────────────────────────
function RadialProgress({
  value, max, size = 56, stroke = 5, color, label, sublabel,
}: {
  value: number; max: number; size?: number; stroke?: number
  color: string; label: string; sublabel?: string
}) {
  const r   = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const pct  = Math.min(1, value / max)
  const dash = circ * pct

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        {/* fill */}
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray .6s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span className="text-[11px] font-black" style={{ color }}>{label}</span>
        {sublabel && <span className="text-[8px] text-white/40 font-mono">{sublabel}</span>}
      </div>
    </div>
  )
}

// ── Thin progress bar ─────────────────────────────────────────────────────────
function ProgressBar({ value, color, label }: { value: number; color: string; label: string }) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between">
        <span className="text-[8px] text-white/30 font-mono uppercase tracking-widest truncate max-w-[140px]">
          {label}
        </span>
        <span className="text-[8px] font-black font-mono" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }}
        />
      </div>
    </div>
  )
}

// ── Main VictoryHUD ───────────────────────────────────────────────────────────
interface VictoryHUDProps {
  victory: VictoryStatus
  playerFactionName?: string
  opponentFactionName?: string
}

export default function VictoryHUD({ victory, playerFactionName = "YOU", opponentFactionName = "OPP" }: VictoryHUDProps) {
  const [open, setOpen] = useState(true)

  const playerGroupPct   = Math.round((victory.playerGroupCount   / BASIC_GOAL_GROUPS) * 100)
  const opponentGroupPct = Math.round((victory.opponentGroupCount / BASIC_GOAL_GROUPS) * 100)

  const playerNear   = victory.playerGroupCount   >= 10 || victory.playerSpecialProgress   >= 80
  const opponentNear = victory.opponentGroupCount >= 10 || victory.opponentSpecialProgress >= 80

  return (
    <div
      className="absolute bottom-[136px] right-4 z-40 flex flex-col items-end gap-1"
      style={{ pointerEvents: "all" }}
    >
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-white/10
          backdrop-blur-sm text-[9px] text-white/50 hover:text-white/80 hover:border-white/20
          transition-all duration-200 cursor-pointer shadow-lg"
      >
        <span>{open ? "▼" : "▲"}</span>
        <span className="font-mono uppercase tracking-widest">Goals</span>
        {(playerNear || opponentNear) && (
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
        )}
      </button>

      {/* Panel */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${open ? "max-h-[260px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div
          className="w-[200px] rounded-2xl border border-white/10 bg-black/70 backdrop-blur-xl shadow-2xl p-3 flex flex-col gap-3"
          style={{ boxShadow: "0 0 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30">
              Victory Goals
            </span>
            <span className="text-[8px] font-mono text-white/20">
              {BASIC_GOAL_GROUPS} groups to win
            </span>
          </div>

          {/* Player section */}
          <div className={`flex flex-col gap-2 rounded-xl p-2 border transition-all duration-300 ${playerNear
            ? "border-yellow-500/30 bg-yellow-500/5 shadow-[0_0_20px_rgba(234,179,8,0.1)]"
            : "border-white/5 bg-white/[0.02]"
          }`}>
            <div className="flex items-center gap-2">
              <RadialProgress
                value={victory.playerGroupCount}
                max={BASIC_GOAL_GROUPS}
                size={48}
                stroke={4}
                color={playerNear ? "#fbbf24" : "#38bdf8"}
                label={`${victory.playerGroupCount}`}
                sublabel="grps"
              />
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-sky-300">{playerFactionName}</span>
                  {playerNear && (
                    <span className="text-[7px] font-black text-yellow-400 animate-pulse uppercase">
                      CLOSE!
                    </span>
                  )}
                </div>
                <ProgressBar
                  value={victory.playerSpecialProgress}
                  color={playerNear ? "#fbbf24" : "#a78bfa"}
                  label={victory.playerSpecialLabel}
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Opponent section */}
          <div className={`flex flex-col gap-2 rounded-xl p-2 border transition-all duration-300 ${opponentNear
            ? "border-red-500/30 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
            : "border-white/5 bg-white/[0.02]"
          }`}>
            <div className="flex items-center gap-2">
              <RadialProgress
                value={victory.opponentGroupCount}
                max={BASIC_GOAL_GROUPS}
                size={48}
                stroke={4}
                color={opponentNear ? "#ef4444" : "#f97316"}
                label={`${victory.opponentGroupCount}`}
                sublabel="grps"
              />
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-orange-300">{opponentFactionName}</span>
                  {opponentNear && (
                    <span className="text-[7px] font-black text-red-400 animate-pulse uppercase">
                      DANGER!
                    </span>
                  )}
                </div>
                <ProgressBar
                  value={victory.opponentSpecialProgress}
                  color={opponentNear ? "#ef4444" : "#fb923c"}
                  label={victory.opponentSpecialLabel}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
