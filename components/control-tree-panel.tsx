"use client"

import { useState } from "react"
import type { ControlNode } from "@/lib/inwo-types"
import type { BaseCard } from "@/lib/cards"

// ─────────────────────────────────────────────────────────────────────────────
// Single tree node visual
// ─────────────────────────────────────────────────────────────────────────────
function NodePill({
  node, card, depth,
}: {
  node: ControlNode; card: BaseCard | undefined; depth: number
}) {
  const isRoot  = node.isIlluminati
  const usedSlots = (["top","bottom","left","right"] as const).filter(s => node.slots[s] !== null).length
  const totalSlots = isRoot ? 4 : 3
  const freeSlots  = totalSlots - usedSlots

  const statusColor = node.isDisconnected
    ? "border-red-600/40 bg-red-950/30 text-red-400"
    : isRoot
      ? "border-yellow-500/40 bg-yellow-950/20 text-yellow-300"
      : "border-emerald-600/30 bg-emerald-950/20 text-emerald-300"

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[8px] font-mono transition-all ${statusColor}`}
      style={{ marginLeft: depth * 10 }}
    >
      {/* Icon */}
      <span>{isRoot ? "👁" : node.isDisconnected ? "🔴" : "🔗"}</span>

      {/* Card name */}
      <span className="truncate max-w-[80px] font-bold">
        {card?.name ?? node.cardId.slice(0, 12)}
      </span>

      {/* Slot indicators */}
      <div className="flex gap-0.5 ml-auto flex-shrink-0">
        {Array.from({ length: totalSlots }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-[2px] border ${i < usedSlots
              ? "bg-emerald-500/60 border-emerald-400/40"
              : "bg-white/5 border-white/10"
            }`}
          />
        ))}
      </div>

      {/* Action tokens */}
      {node.actionTokens > 0 && (
        <span className="text-amber-400">×{node.actionTokens}</span>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Render tree recursively
// ─────────────────────────────────────────────────────────────────────────────
function renderTree(
  nodes: ControlNode[],
  cardMap: Map<string, BaseCard>,
  parentId: string | null,
  depth: number,
): React.ReactNode {
  return nodes
    .filter(n => n.parentId === parentId)
    .map(n => (
      <div key={n.cardId} className="flex flex-col gap-0.5">
        <NodePill node={n} card={cardMap.get(n.cardId)} depth={depth} />
        {renderTree(nodes, cardMap, n.cardId, depth + 1)}
      </div>
    ))
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
interface ControlTreePanelProps {
  playerTree:   ControlNode[]
  opponentTree: ControlNode[]
  allCards:     BaseCard[]
  freeSlotsCount: number
}

export default function ControlTreePanel({
  playerTree, opponentTree, allCards, freeSlotsCount,
}: ControlTreePanelProps) {
  const [open, setOpen] = useState(false)

  const cardMap = new Map<string, BaseCard>()
  allCards.forEach(c => cardMap.set(c.id, c))

  const playerNodes   = playerTree.length
  const opponentNodes = opponentTree.length

  return (
    <div className="absolute bottom-[136px] left-4 z-40 flex flex-col items-start gap-1">
      {/* Toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-white/10
          backdrop-blur-sm text-[9px] text-white/50 hover:text-white/80 hover:border-white/20
          transition-all duration-200 cursor-pointer shadow-lg"
      >
        <span>{open ? "▼" : "▲"}</span>
        <span className="font-mono uppercase tracking-widest">Power Structure</span>
        <span
          className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${freeSlotsCount > 0
            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {freeSlotsCount} free
        </span>
      </button>

      {/* Panel */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${open ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div
          className="w-[220px] rounded-2xl border border-white/10 bg-black/70 backdrop-blur-xl
            shadow-2xl p-3 flex flex-col gap-3 overflow-y-auto max-h-[280px]"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Player tree */}
          <div className="flex flex-col gap-1">
            <span className="text-[7px] font-black uppercase tracking-[0.2em] text-sky-400/60 mb-0.5">
              Your Power Structure ({playerNodes} nodes)
            </span>
            <div className="flex flex-col gap-0.5">
              {renderTree(playerTree, cardMap, null, 0)}
              {playerTree.filter(n => n.isDisconnected).length > 0 && (
                <p className="text-[7px] text-red-400/60 italic mt-1 pl-1">
                  🔴 {playerTree.filter(n => n.isDisconnected).length} disconnected card(s)
                </p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Opponent tree*/}
          <div className="flex flex-col gap-1">
            <span className="text-[7px] font-black uppercase tracking-[0.2em] text-red-400/60 mb-0.5">
              Opponent Structure ({opponentNodes} nodes)
            </span>
            <div className="flex flex-col gap-0.5">
              {renderTree(opponentTree, cardMap, null, 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
