"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { initializeGame, executeDraw, playCard, executeEndTurn, attackCard, type GameState, type AIDifficulty, type FieldCard } from "@/lib/game-utils"
import { loadDifficultyFromLocalStorage } from "@/lib/deck-utils"
import type { BaseCard, GroupLikeCard } from "@/lib/cards"
import { cards as allCards } from "@/lib/cards"
import CardPreviewModal from "@/components/card-preview-modal"
import TutorialOverlay from "@/components/tutorial-overlay"
import VictoryHUD from "@/components/victory-hud"
import ControlTreePanel from "@/components/control-tree-panel"
import { useVictoryCondition } from "@/hooks/use-victory-condition"
import { canPlayCard } from "@/lib/inwo-rules"
import type { AttackType } from "@/lib/inwo-types"

const isGroup = (c: BaseCard): c is GroupLikeCard =>
  ["Group", "Resource", "Place", "Personality", "Organization", "Artifact"].includes(c.type)

// ──── Faction → Weapon image map ────
const FACTION_WEAPON_MAP: Record<string, string> = {
  "adepts-of-hermes": "/weapons/adepts -of-hermes.png",
  "bavarian-illuminati": "/weapons/bavarian- illuminati.png",
  "bermuda-triangle": "/weapons/bermuda-triangle.png",
  "church-of-the-subgenius": "/weapons/church-of-the-subgenius.png",
  "discordian-society": "/weapons/discordian-society.png",
  "gnomes-of-zurich": "/weapons/gnomes-of-zurich.png",
  "servants-of-cthulhu": "/weapons/servants-of-cthulhu.png",
  "shangri-la": "/weapons/shangri-la.png",
  "society-of-assassins": "/weapons/society-of-assassins.png",
  "the-network": "/weapons/the-network.png",
  "ufos": "/weapons/ufos.png",
}

// ──── Faction Weapon display ────
function FactionWeapon({ factionId, flipped = false }: { factionId: string | null | undefined; flipped?: boolean }) {
  const src = factionId ? FACTION_WEAPON_MAP[factionId] : undefined
  if (!src) return null
  return (
    <div
      className="flex-none flex flex-col items-center gap-1"
      style={{ filter: flipped ? "hue-rotate(180deg) saturate(1.4)" : "saturate(1.3)" }}
    >
      <div
        className={`relative w-20 h-28 rounded-xl overflow-hidden border-2 shadow-2xl transition-all duration-300 ${flipped
            ? "border-red-500/60 shadow-red-900/40"
            : "border-yellow-500/60 shadow-amber-900/40"
          }`}
        style={{
          background: "radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.8) 100%)",
        }}
      >
        <img
          src={src}
          alt="faction weapon"
          className="w-full h-full object-contain p-1"
        />
        {/* Glow overlay */}
        <div
          className={`absolute inset-0 pointer-events-none ${flipped
              ? "bg-red-500/10"
              : "bg-amber-500/10"
            }`}
        />
      </div>
      <span className={`text-[9px] font-black uppercase tracking-widest ${flipped ? "text-red-400/70" : "text-amber-400/70"
        }`}>WEAPON</span>
    </div>
  )
}

// ──── Hover-zoom card ────
function Card({ card, faceDown = false, onClick, canPlay = false, isHand = false, idx = 0, total = 1, disabled = false, isSelected = false, onFieldClick }: {
  card: BaseCard | FieldCard; faceDown?: boolean; onClick?: (c: BaseCard) => void;
  canPlay?: boolean; isHand?: boolean; idx?: number; total?: number; disabled?: boolean
  isSelected?: boolean; onFieldClick?: (c: FieldCard) => void
}) {
  const fCard = card as FieldCard
  const hasStats = !isHand && !faceDown && fCard.currentHP !== undefined
  const [imgError, setImgError] = useState(false)

  const [hov, setHov] = useState(false)
  const mid = (total - 1) / 2
  const rot = isHand ? (idx - mid) * 5 : 0
  const offX = isHand ? (idx - mid) * 35 : 0
  const offY = isHand ? Math.abs(idx - mid) * 5 : 0

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="relative z-10 transition-transform duration-200"
      style={{
        transform: hov ? "scale(1.5) translateY(-20px)" : `rotate(${rot}deg) translate(${offX}px, ${offY}px)`,
        zIndex: hov ? 100 : idx,
      }}
    >
      {/* Card face */}
      <div
        onClick={() => {
          if (onFieldClick && fCard.currentHP !== undefined) {
            onFieldClick(fCard)
          } else {
            onClick?.(card)
          }
        }}
        className={`relative rounded-xl overflow-hidden border-2 transition-all duration-150 shadow-lg bg-gray-900/90 ${isHand ? "w-20 h-28" : "w-24 h-36"} ${faceDown ? "border-transparent cursor-default" : isSelected ? "border-cyan-400 shadow-cyan-400/80 scale-105" : canPlay ? "border-yellow-400 shadow-yellow-400/40 cursor-pointer" : "border-white/20"} ${disabled && !faceDown ? "opacity-50 cursor-pointer" : ""}`}
      >
        {faceDown ? (
          <img src="/back.png" alt="card back" className="w-full h-full object-cover" />
        ) : imgError ? (
          <div className="w-full h-full bg-gradient-to-br from-blue-900 to-indigo-950 flex flex-col items-center justify-center p-2 text-center">
            <span className="text-[6px] text-white/30 uppercase font-black tracking-tighter line-clamp-2">{card.name}</span>
          </div>
        ) : (
          <>
            <img
              src={card.imageUrl}
              alt={card.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
            <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-blue-600/90 flex items-center justify-center text-[10px] font-bold text-white shadow-sm border border-white/20">
              {card.powerCost}
            </div>
            {canPlay && <div className="absolute inset-0 bg-yellow-300/10 animate-pulse pointer-events-none" />}
            {hasStats && (
              <div className="absolute bottom-0 inset-x-0 bg-black/80 flex justify-between px-1.5 py-0.5 border-t border-white/10">
                <span className="text-[10px] font-black text-amber-400">{fCard.attack}</span>
                <span className="text-[10px] font-black text-red-500">{fCard.currentHP}</span>
              </div>
            )}
            {!isHand && !faceDown && fCard.hasAttacked === false && (
              <div className="absolute top-0 right-0 bg-yellow-500 rounded-bl-lg p-0.5 shadow-lg">
                <span className="text-[8px]">⚔️</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Hover zoom tooltip */}
      {hov && !faceDown && (
        <div className="absolute pointer-events-none z-[9999]" style={{ bottom: "110%", left: "50%", transform: "translateX(-50%)" }}>
          <div style={{ animation: "zoomIn .15s cubic-bezier(.34,1.56,.64,1) forwards" }} className="w-52 rounded-2xl overflow-hidden border border-white/20 bg-gray-950 shadow-2xl shadow-black">
            <div className="relative">
              <img src={card.imageUrl} alt={card.name} className="w-full h-auto object-cover block" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-80" />
            </div>
            <div className="p-3 bg-gray-900 border-t border-white/5 flex flex-col gap-2">
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">{card.type}</div>

              {isGroup(card) ? (
                <div className="flex items-center gap-1">
                  <div className="flex-1 bg-amber-950/30 border border-amber-500/20 rounded-lg py-1.5 text-center px-1">
                    <span className="block text-[8px] text-amber-500/60 font-black uppercase tracking-tighter">Power</span>
                    <span className="text-sm font-black text-amber-400">{card.power}</span>
                  </div>

                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 border border-blue-200/50 flex items-center justify-center text-sm font-black text-white shadow-lg shadow-blue-500/20 z-10">
                    {card.powerCost}
                  </div>

                  <div className="flex-1 bg-cyan-950/30 border border-cyan-500/20 rounded-lg py-1.5 text-center px-1">
                    <span className="block text-[8px] text-cyan-500/60 font-black uppercase tracking-tighter">Resist</span>
                    <span className="text-sm font-black text-cyan-300">{card.resistance}</span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center mt-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 border border-blue-200/50 flex items-center justify-center text-sm font-black text-white shadow-lg shadow-blue-500/20 z-10">
                    {card.powerCost}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-center"><div className="w-3 h-3 bg-gray-950 border-r border-b border-white/20 rotate-45 -mt-1.5" /></div>
        </div>
      )}
    </div>
  )
}

// ──── Hero portrait ────
function Hero({ faction, hp, flipped = false, onClick }: { faction: any; hp: number; flipped?: boolean; onClick?: () => void }) {
  const maxHp = 30
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100))
  const hpColor = pct > 60 ? "#22c55e" : pct > 30 ? "#eab308" : "#ef4444"
  const hpGlow  = pct > 60 ? "rgba(34,197,94,0.5)"  : pct > 30 ? "rgba(234,179,8,0.5)"  : "rgba(239,68,68,0.6)"
  const isLow   = pct <= 30

  return (
    <div onClick={onClick} className={`flex-shrink-0 group ${onClick ? "cursor-pointer" : ""}`}>
      <div className={`relative flex flex-row w-72 h-36 rounded-2xl overflow-hidden border-[3px] shadow-2xl transition-all duration-300 ${flipped ? "border-red-600/60 shadow-red-900/20 group-hover:border-red-400 group-hover:scale-105" : "border-yellow-500/60 shadow-amber-900/20 group-hover:border-yellow-300 group-hover:scale-105"}`}>
        {/* Left — Artwork */}
        <div className="relative w-36 flex-shrink-0 overflow-hidden">
          <img src={faction?.imageUrl || "/placeholder.svg"} alt={faction?.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-950/60" />
        </div>

        {/* Right — Info */}
        <div className="flex-1 flex flex-col justify-between p-3 bg-gray-950/90 border-l border-white/5">
          <div>
            <p className="text-sm font-black text-white uppercase tracking-tight leading-tight">{faction?.name}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] font-mono text-gray-400 uppercase">Power</span>
              <span className="text-base font-black text-amber-400">{faction?.power}</span>
            </div>
          </div>

          {/* HP Bar */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: hpColor }}>HP</span>
              <span className="text-[10px] font-black font-mono" style={{ color: hpColor }}>{hp}<span className="text-gray-600">/{maxHp}</span></span>
            </div>
            {/* Track */}
            <div className="relative h-3 w-full rounded-full bg-gray-800/80 overflow-hidden border border-white/5">
              {/* Segmented lines overlay */}
              <div className="absolute inset-0 z-10 flex pointer-events-none">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex-1 border-r border-black/30 last:border-r-0" />
                ))}
              </div>
              {/* Fill */}
              <div
                className={`h-full rounded-full transition-all duration-700 ${isLow ? "animate-pulse" : ""}`}
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${hpColor}99 0%, ${hpColor} 100%)`,
                  boxShadow: `0 0 8px ${hpGlow}, inset 0 1px 0 rgba(255,255,255,0.2)`,
                }}
              />
              {/* Shine */}
              <div className="absolute inset-x-0 top-0 h-1/2 rounded-full bg-white/10 pointer-events-none" />
            </div>
          </div>
        </div>

        {onClick && <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 animate-pulse pointer-events-none" />}
      </div>
    </div>
  )
}


// ──── Mana crystals ────
function Mana({ current, used, max }: { current: number; used: number; max: number }) {
  const avail = current - used
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-0.5 flex-wrap justify-center max-w-[56px]">
        {Array.from({ length: Math.max(max, 1) }).map((_, i) => {
          const n = i + 1
          return <div key={i} className={`w-3.5 h-[18px] rounded-[3px] border transition-all ${n <= avail ? "bg-gradient-to-b from-blue-300 to-blue-600 border-blue-200/50 shadow-sm shadow-blue-400/60" : n <= current ? "bg-blue-950/60 border-blue-800/20" : "bg-gray-900/30 border-gray-700/10"}`} />
        })}
      </div>
      <span className="text-[10px] font-bold text-blue-300 font-mono">{avail}/{current}</span>
    </div>
  )
}

// ──── Field zone ────
function Zone({ cards, empty, dim, onCardClick, selectedId }: { cards: FieldCard[]; empty: string; dim?: boolean; onCardClick?: (c: FieldCard) => void; selectedId?: string }) {
  return (
    <div className={`flex-1 flex items-center justify-center gap-3 min-h-[160px] relative rounded-2xl border-2 border-dashed ${dim ? "border-red-500/5 hover:border-red-500/10" : "border-blue-500/5 hover:border-blue-500/10"} mx-4 transition-all`}>
      {cards.length === 0 ? (
        <p className="text-[10px] text-white/5 uppercase tracking-widest font-black italic select-none">{empty}</p>
      ) : (
        cards.map((c, i) => (
          <Card
            key={`${c.id}-${i}`}
            card={c}
            onFieldClick={onCardClick}
            isSelected={selectedId === c.id}
          />
        ))
      )}
    </div>
  )
}

// ──── Main Page ────
export default function GamePage() {
  const [gs, setGs] = useState<GameState | null>(null)
  const [msg, setMsg] = useState("")
  const [busy, setBusy] = useState(false)
  const [previewCtx, setPreviewCtx] = useState<{ card: BaseCard, source: string, idx: number, canPlay?: boolean, hasAttacked?: boolean } | null>(null)
  const [tutorialStep, setTutorialStep] = useState<number | null>(null)
  const [attackType, setAttackType] = useState<AttackType>("destroy")

  useEffect(() => {
    const diff = loadDifficultyFromLocalStorage() as AIDifficulty
    setGs(initializeGame(diff))

    // Check if tutorial was already completed
    if (!localStorage.getItem("inwo_tutorial_completed")) {
      setTimeout(() => setTutorialStep(0), 1000) // Small delay for effect
    }
  }, [])

  // ── Victory condition hook ───────────────────────────────────────────────
  // Must call hook unconditionally — pass empty state if not loaded yet
  const victoryStatus = useVictoryCondition(gs ?? {
    playerField: [], opponentField: [], playerFaction: null, opponentFaction: null,
    playerControlTree: [], opponentControlTree: [], playerDestroyedCount: 0,
    opponentDestroyedCount: 0, winner: null,
    playerHand: [], opponentHand: [], mainDeck: [], discardPile: [],
    playerHP: 30, opponentHP: 30, playerPower: 0, playerMaxPower: 0,
    playerPowerUsed: 0, opponentPower: 0, opponentMaxPower: 0, opponentPowerUsed: 0,
    playerActionTokens: 0, opponentActionTokens: 0,
    currentPhase: "Draw", turnNumber: 1, isPlayerTurn: true,
    gameLog: [], aiDifficulty: "medium",
  })

  // ── Free slots count (for ControlTreePanel badge) ────────────────────────
  const freeSlotsCount = useMemo(() => {
    if (!gs) return 0
    let free = 0
    for (const node of gs.playerControlTree) {
      if (node.isDisconnected) continue
      const slots = node.isIlluminati
        ? ["top","bottom","left","right"]
        : ["bottom","left","right"]
      for (const slot of slots) {
        if (node.slots[slot as "top"|"bottom"|"left"|"right"] === null) free++
      }
    }
    return free
  }, [gs?.playerControlTree])

  const handleTutorialComplete = useCallback(() => {
    localStorage.setItem("inwo_tutorial_completed", "true")
    setTutorialStep(null)
  }, [])

  const tutHigh = (stepNum: number) =>
    tutorialStep === stepNum ? "relative z-[50001] ring-[6px] ring-yellow-400 rounded-3xl bg-black/60 shadow-[0_0_80px_rgba(234,179,8,0.6)] transition-all duration-500 scale-[1.02]" : "transition-all duration-500"

  const [selIdx, setSelIdx] = useState<number | null>(null)

  const handleDraw = useCallback(() => {
    if (!gs || gs.currentPhase !== "Draw") return
    setBusy(true)
    setTimeout(() => {
      setGs(executeDraw(gs))
      setMsg("Turn start! Battle or play cards.")
      setBusy(false)
    }, 200)
  }, [gs])

  const handlePlay = useCallback((card: BaseCard) => {
    if (!gs || gs.currentPhase !== "Main") return
    const { success, newState, message: m } = playCard(gs, card)
    if (success) setGs(newState)
    setMsg(m)
  }, [gs])

  const handleEnd = useCallback(() => {
    if (!gs || gs.currentPhase !== "Main") return
    setBusy(true)
    setSelIdx(null)
    setTimeout(() => { setGs(executeEndTurn(gs)); setMsg("Draw a card to start your turn!"); setBusy(false) }, 300)
  }, [gs])

  const onPlayerFieldClick = (c: FieldCard) => {
    if (!gs) return
    const idx = gs.playerField.findIndex(fc => fc.id === c.id)
    if (idx === selIdx) {
      setSelIdx(null)
      setMsg("Deselected.")
      return
    }
    setPreviewCtx({ card: c, source: 'playerField', idx, hasAttacked: c.hasAttacked })
  }

  const onEnemyFieldClick = (c: FieldCard) => {
    if (!gs) return
    if (selIdx !== null) {
      const targetIdx = gs.opponentField.findIndex(fc => fc.id === c.id)
      if (targetIdx !== -1) {
        const newGs = attackCard(gs, selIdx, targetIdx, attackType)
        setGs(newGs)
        // Show roll result
        if (newGs.lastRollResult) {
          setMsg(newGs.lastRollResult.success ? "✅ Attack succeeded!" : "❌ Attack failed!")
        }
        setSelIdx(null)
      }
    } else {
      const idx = gs.opponentField.findIndex(fc => fc.id === c.id)
      setPreviewCtx({ card: c, source: 'opponentField', idx })
    }
  }

  const onHandCardClick = (c: BaseCard, idx: number, cpFlag: boolean) => {
    setPreviewCtx({ card: c, source: 'hand', idx, canPlay: cpFlag })
  }

  const onEnemyHeroClick = () => {
    if (!gs || selIdx === null) return
    const newGs = attackCard(gs, selIdx, "hero", attackType)
    setGs(newGs)
    if (newGs.lastRollResult) {
      setMsg(newGs.lastRollResult.success ? "✅ Hero struck!" : "❌ Hero attack failed!")
    }
    setSelIdx(null)
  }

  if (!gs) return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="w-14 h-14 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
    </div>
  )

  const avail = gs.playerPower - gs.playerPowerUsed

  // Sync winner from victory hook into game state (special goal wins)
  if (!gs.winner && victoryStatus.winner && victoryStatus.winner !== gs.winner) {
    setGs(prev => prev ? { ...prev, winner: victoryStatus.winner } : prev)
  }

  return (
    <div className="fixed inset-0 overflow-auto md:overflow-hidden bg-[#05060a]" style={{ fontFamily: "sans-serif" }}>
      {/* BG */}
      <div className="absolute inset-0" style={{ backgroundImage: "url('/game-table-background.gif')", backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.4) saturate(1.2)" }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />

      {/* WINNER */}
      {gs.winner && (
        <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center">
          <div className="text-center space-y-5" style={{ animation: "zoomIn .5s ease forwards" }}>
            <div className="text-8xl">{gs.winner === "player" ? "🏆" : "💀"}</div>
            <h2 className={`text-6xl font-black ${gs.winner === "player" ? "text-yellow-400" : "text-red-500"}`}>{gs.winner === "player" ? "VICTORY!" : "DEFEAT!"}</h2>
            <Link href="/deck-management"><button className="px-10 py-4 rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 font-black text-black uppercase tracking-widest hover:scale-105 transition cursor-pointer">Play Again</button></Link>
          </div>
        </div>
      )}

      {/* LAYOUT */}
      <div className="relative z-10 flex flex-col h-full">

        {/* TOP BAR */}
        <div className="flex-none flex items-center justify-between px-5 py-2 bg-black/50 border-b border-white/5 backdrop-blur-sm">
          <div className="flex-1 flex justify-start">
            <Link href="/deck-management"><button className="text-xs text-gray-500 hover:text-white font-mono uppercase tracking-widest cursor-pointer">← Deck</button></Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-gray-600">Turn {gs.turnNumber}</span>
            <span className={`text-xs font-bold px-3 py-0.5 rounded-full ${gs.currentPhase === "Draw" ? "text-cyan-400 bg-cyan-400/10 border border-cyan-400/20" : gs.currentPhase === "Main" ? "text-green-400 bg-green-400/10 border border-green-400/20" : "text-orange-400 bg-orange-400/10"}`}>{gs.currentPhase}</span>
            <span className="text-xs text-gray-600">{{ easy: "🌱", medium: "⚡", hard: "💀" }[gs.aiDifficulty]}</span>
          </div>
          <div className="flex-1 flex items-center justify-end gap-4 overflow-hidden">
            {msg && <p className="text-[10px] text-yellow-300 font-mono truncate max-w-[200px]">{msg}</p>}
            <button
              onClick={() => setTutorialStep(0)}
              className="flex-none w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shadow-md"
              title="Replay Tutorial"
            >
              ?
            </button>
          </div>
        </div>

        {/* OPPONENT HAND */}
        <div className="flex-none flex justify-center items-end h-[90px] pb-1 relative">
          {/* Opponent Weapon — LEFT side, upside-down facing the enemy */}
          <div className="absolute left-4 bottom-0 flex items-end" style={{ transform: "scaleX(-1)" }}>
            <FactionWeapon factionId={gs.opponentFaction?.id} flipped />
          </div>
          <div className="flex items-end justify-center">
            {gs.opponentHand.map((c, i) => <Card key={i} card={c} faceDown isHand idx={i} total={gs.opponentHand.length} />)}
            {gs.opponentHand.length === 0 && <span className="text-xs text-gray-700 italic pb-6">No cards</span>}
          </div>
        </div>

        {/* BOARD + END TURN BUTTON */}
        <div className="flex-1 flex items-center justify-center px-4 min-h-0">
          <div className="flex items-center gap-4 w-full max-w-6xl h-full max-h-[650px]">

            {/* REALISTIC BOARD (Floating over table) */}
            <div
              className="flex-1 h-full flex flex-col relative"
            >
              {/* Subtle highlights */}
              <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-red-600/5 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-blue-600/5 to-transparent pointer-events-none" />

              {/* ── OPPONENT ZONE ── */}
              <div className={`flex-1 flex items-center justify-between gap-6 px-10 py-6 relative border-b border-white/5 ${tutHigh(3)}`}>
                <Hero faction={gs.opponentFaction} hp={gs.opponentHP} flipped onClick={selIdx !== null ? onEnemyHeroClick : undefined} />
                <Zone cards={gs.opponentField} empty={`No minions (${gs.opponentField.length}/5)`} dim onCardClick={onEnemyFieldClick} />
                <Mana current={gs.opponentPower} used={gs.opponentPowerUsed} max={gs.opponentMaxPower} />
              </div>

              {/* Center divider with eye */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 border border-white/10 flex items-center justify-center shadow-lg">
                <span className="text-sm opacity-30">👁</span>
              </div>
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

              {/* ── PLAYER ZONE ── */}
              <div className={`flex-1 flex items-center justify-between gap-6 px-10 py-6 relative ${tutHigh(2)}`}>
                <Hero faction={gs.playerFaction} hp={gs.playerHP} />
                <Zone cards={gs.playerField} empty={`Play cards here — 5 to win! (${gs.playerField.length}/5)`} onCardClick={onPlayerFieldClick} selectedId={selIdx !== null ? gs.playerField[selIdx]?.id : undefined} />
                <Mana current={gs.playerPower} used={gs.playerPowerUsed} max={gs.playerMaxPower} />
              </div>
            </div>

            {/* ── Attack type selector (between zones) ── */}
            {selIdx !== null && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex gap-1 bg-black/80 border border-white/10 rounded-xl px-2 py-1 backdrop-blur-sm shadow-xl" style={{ marginTop: 20 }}>
                {(["control", "destroy", "neutralize"] as AttackType[]).map(t => (
                  <button key={t} onClick={() => setAttackType(t)}
                    className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                      attackType === t
                        ? t === "control" ? "bg-sky-500/20 border-sky-400/50 text-sky-300"
                          : t === "destroy" ? "bg-red-500/20 border-red-400/50 text-red-300"
                          : "bg-purple-500/20 border-purple-400/50 text-purple-300"
                        : "bg-white/5 border-white/10 text-white/30 hover:border-white/20"
                    }`}
                  >{t}</button>
                ))}
              </div>
            )}

            {/* END TURN BUTTON (right of board) */}
            <div className={`flex-none flex flex-col gap-3 items-center p-3 ${tutHigh(4)}`}>
              {gs.currentPhase === "Draw" ? (
                <button id="draw-btn" onClick={handleDraw} disabled={busy}
                  className="w-28 py-5 rounded-xl font-black text-black text-xs uppercase tracking-widest cursor-pointer shadow-2xl shadow-amber-900/50 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all duration-150"
                  style={{ background: "linear-gradient(180deg,#fbbf24,#d97706)", border: "3px solid rgba(251,191,36,0.4)" }}>
                  🃏 DRAW
                </button>
              ) : (
                <button id="end-turn-btn" onClick={handleEnd} disabled={busy}
                  className="w-28 py-5 rounded-xl font-black text-black text-xs uppercase tracking-widest cursor-pointer shadow-2xl shadow-amber-900/50 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all duration-150"
                  style={{ background: "linear-gradient(180deg,#fbbf24,#d97706)", border: "3px solid rgba(251,191,36,0.4)" }}>
                  END TURN
                </button>
              )}
              {/* Deck counter */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-16 rounded-lg border-2 border-gray-600/50 bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center gap-0.5 shadow-inner">
                  <span className="text-lg font-black text-white font-mono">{gs.mainDeck.length}</span>
                </div>
                <span className="text-[9px] text-gray-600 uppercase tracking-widest mt-1 font-mono">Deck</span>
              </div>
            </div>
          </div>
        </div>

        {/* PLAYER HAND */}
        <div className={`flex-none flex justify-center items-start h-[120px] pt-4 pb-4 relative ${tutHigh(1)}`}>
          <div className="flex items-start justify-center">
            {gs.playerHand.map((c, i) => {
              const hasPower = c.powerCost <= avail && gs.currentPhase === "Main"
              const hasSlot  = canPlayCard(gs.playerControlTree, c).canPlay
              const cp       = hasPower && hasSlot
              return <Card key={`${c.id}-${i}`} card={c} onClick={() => onHandCardClick(c, i, cp)} canPlay={cp} disabled={!cp} isHand idx={i} total={gs.playerHand.length} />
            })}
            {gs.playerHand.length === 0 && <span className="text-xs text-gray-700 italic pt-8">No cards in hand</span>}
          </div>
          {/* Player Weapon — RIGHT side, normal orientation */}
          <div className="absolute right-4 top-0 flex items-start">
            <FactionWeapon factionId={gs.playerFaction?.id} />
          </div>
        </div>

        {/* ── INWO HUDs (overlay, outside normal flow) ── */}
        <VictoryHUD
          victory={victoryStatus}
          playerFactionName={gs.playerFaction?.name}
          opponentFactionName={gs.opponentFaction?.name}
        />
        <ControlTreePanel
          playerTree={gs.playerControlTree}
          opponentTree={gs.opponentControlTree}
          allCards={allCards}
          freeSlotsCount={freeSlotsCount}
        />

        {tutorialStep !== null && (
          <TutorialOverlay step={tutorialStep} setStep={setTutorialStep} onComplete={handleTutorialComplete} />
        )}
      </div>

      <style jsx global>{`
        @keyframes zoomIn {
          from { opacity:0; transform:translateX(-50%) scale(.85) translateY(6px); }
          to { opacity:1; transform:translateX(-50%) scale(1) translateY(0); }
        }
      `}</style>

      {previewCtx && (
        <CardPreviewModal
          card={previewCtx.card}
          onClose={() => setPreviewCtx(null)}
          actionLabel={
            previewCtx.source === 'hand' && previewCtx.canPlay ? "Play Card" :
              previewCtx.source === 'playerField' && previewCtx.hasAttacked === false && gs?.currentPhase === "Main" ? "Attack" :
                undefined
          }
          onAction={
            previewCtx.source === 'hand' && previewCtx.canPlay ? () => {
              handlePlay(previewCtx.card)
              setPreviewCtx(null)
            } :
              previewCtx.source === 'playerField' && previewCtx.hasAttacked === false && gs?.currentPhase === "Main" ? () => {
                setSelIdx(previewCtx.idx)
                setMsg(`Carta selecionada para atacar! Clique no alvo inimigo.`)
                setPreviewCtx(null)
              } :
                undefined
          }
        />
      )}
    </div>
  )
}
