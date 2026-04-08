"use client"

import { useMemo } from "react"
import type { GameState } from "@/lib/game-utils"
import type { BaseCard, GroupLikeCard, FactionCard } from "@/lib/cards"
import type { VictoryStatus } from "@/lib/inwo-types"
import { totalTreePower } from "@/lib/inwo-rules"

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const isGroupLike = (c: BaseCard): c is GroupLikeCard =>
  ["Group", "Organization", "Personality", "Place", "Resource", "Artifact"].includes(c.type)

const hasAlignment = (card: BaseCard, alignment: string): boolean =>
  isGroupLike(card) && card.alignments.includes(alignment)

function buildCardMap(state: GameState): Map<string, BaseCard> {
  const map = new Map<string, BaseCard>()
  ;[
    ...state.playerField,
    ...state.opponentField,
    ...state.playerHand,
    ...state.opponentHand,
  ].forEach(c => map.set(c.id, c))
  return map
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-faction special goal evaluation
// ─────────────────────────────────────────────────────────────────────────────

interface SpecialProgress {
  progress: number  // 0–100 %
  label: string
  achieved: boolean
}

function evaluateSpecialGoal(
  factionId: string | undefined,
  state: GameState,
  isPlayer: boolean,
): SpecialProgress {
  const field     = isPlayer ? state.playerField      : state.opponentField
  const destroyed = isPlayer ? state.playerDestroyedCount : state.opponentDestroyedCount
  const tree      = isPlayer ? state.playerControlTree : state.opponentControlTree
  const cardMap   = buildCardMap(state)
  const treeTotal = totalTreePower(tree, cardMap)

  switch (factionId) {
    // ── Servants of Cthulhu ── destroy 8 groups → win
    case "servants-of-cthulhu": {
      const need = 8
      const have = destroyed
      return {
        progress: Math.min(100, Math.round((have / need) * 100)),
        label: `Destroy ${need} Groups: ${have}/${need}`,
        achieved: have >= need,
      }
    }

    // ── Bavarian Illuminati ── 50 total power
    case "bavarian-illuminati": {
      const need = 50
      return {
        progress: Math.min(100, Math.round((treeTotal / need) * 100)),
        label: `Total Power ≥50: ${treeTotal}/${need}`,
        achieved: treeTotal >= need,
      }
    }

    // ── Bermuda Triangle ── 35 power + one group of each alignment
    case "bermuda-triangle": {
      const allAlignments = ["Government","Criminal","Violent","Peaceful","Liberal","Conservative","Corporate","Fanatic","Straight","Weird"]
      const coveredAlignments = allAlignments.filter(al =>
        field.some(c => hasAlignment(c, al))
      )
      const powerOk = treeTotal >= 35
      const alignOk = coveredAlignments.length >= allAlignments.length
      const steps   = (powerOk ? 1 : 0) + (alignOk ? 1 : 0)
      return {
        progress: Math.round((steps / 2) * 100),
        label: `Power≥35(${treeTotal}) + All Alignments(${coveredAlignments.length}/${allAlignments.length})`,
        achieved: powerOk && alignOk,
      }
    }

    // ── Discordian Society ── Weird groups (power ≥3) count double
    case "discordian-society": {
      const weirdGroups = field.filter(c => hasAlignment(c, "Weird") && isGroupLike(c) && (c as GroupLikeCard).power >= 3)
      const effective   = field.filter(c => !hasAlignment(c, "Weird")).length + weirdGroups.length * 2
      const need        = 12
      return {
        progress: Math.min(100, Math.round((effective / need) * 100)),
        label: `Weird ×2 groups: ${effective} effective/${need}`,
        achieved: effective >= need,
      }
    }

    // ── Gnomes of Zürich ── Corporate groups (power ≥4) count double
    case "gnomes-of-zurich": {
      const corpGroups = field.filter(c => hasAlignment(c, "Corporate") && isGroupLike(c) && (c as GroupLikeCard).power >= 4)
      const effective  = field.filter(c => !hasAlignment(c, "Corporate") || (isGroupLike(c) && (c as GroupLikeCard).power < 4)).length + corpGroups.length * 2
      const need       = 12
      return {
        progress: Math.min(100, Math.round((effective / need) * 100)),
        label: `Corporate ×2 groups: ${effective} effective/${need}`,
        achieved: effective >= need,
      }
    }

    // ── Shangri-La ── 30 power in Peaceful groups (any owner)
    case "shangri-la": {
      const allField  = [...state.playerField, ...state.opponentField]
      const peaceful  = allField.filter(c => hasAlignment(c, "Peaceful") && isGroupLike(c))
      const total     = peaceful.reduce((s, c) => s + (c as GroupLikeCard).power, 0)
      const need      = 30
      return {
        progress: Math.min(100, Math.round((total / need) * 100)),
        label: `Peaceful Power: ${total}/${need}`,
        achieved: total >= need,
      }
    }

    // ── Adepts of Hermes ── Magic Resources count as groups
    case "adepts-of-hermes": {
      const magicResources = field.filter(c => hasAlignment(c, "Magic") && c.type === "Resource").length
      const normal         = field.filter(c => !(hasAlignment(c, "Magic") && c.type === "Resource")).length
      const effective      = normal + magicResources
      const need           = 12
      return {
        progress: Math.min(100, Math.round((effective / need) * 100)),
        label: `Groups + Magic Resources: ${effective}/${need}`,
        achieved: effective >= need,
      }
    }

    // ── UFOs ── track special Goal cards in play (simplified: extra +3 groups if 3 goals)
    case "ufos": {
      const goalCards = field.filter(c => c.type === "Goal").length
      const need      = 3
      return {
        progress: Math.min(100, Math.round((goalCards / need) * 100)),
        label: `Goal Cards: ${goalCards}/${need}`,
        achieved: goalCards >= need,
      }
    }

    // ── Church of the SubGenius ── action tokens as groups
    case "church-of-the-subgenius": {
      const tokenNode = (isPlayer ? state.playerControlTree : state.opponentControlTree)
        .find(n => n.isIlluminati)
      const slack    = tokenNode?.actionTokens ?? 0
      const capped   = Math.min(3, slack)
      return {
        progress: Math.min(100, Math.round((capped / 3) * 100)),
        label: `Slack tokens (max 3): ${capped}/3`,
        achieved: capped >= 3,
      }
    }

    // ── Society of Assassins ── Fanatic/Secret groups strong
    case "society-of-assassins": {
      const secret  = field.filter(c => hasAlignment(c, "Secret")).length
      const fanatic = field.filter(c => hasAlignment(c, "Fanatic")).length
      const total   = secret + fanatic
      const need    = 6
      return {
        progress: Math.min(100, Math.round((total / need) * 100)),
        label: `Secret+Fanatic groups: ${total}/${need}`,
        achieved: total >= need,
      }
    }

    default:
      return { progress: 0, label: "No special goal", achieved: false }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main hook
// ─────────────────────────────────────────────────────────────────────────────

export const BASIC_GOAL_GROUPS = 12

/**
 * Monitors all victory conditions and returns the current VictoryStatus.
 * Runs on every game state change via useMemo (zero side-effects).
 */
export function useVictoryCondition(state: GameState): VictoryStatus {
  return useMemo<VictoryStatus>(() => {
    // ── Basic goal: 12 groups controlled ────────────────────────────────────
    const playerGroupCount   = state.playerField.filter(c => isGroupLike(c)).length
    const opponentGroupCount = state.opponentField.filter(c => isGroupLike(c)).length

    // ── Special goals ────────────────────────────────────────────────────────
    const playerSpecial   = evaluateSpecialGoal(state.playerFaction?.id,   state, true)
    const opponentSpecial = evaluateSpecialGoal(state.opponentFaction?.id, state, false)

    // ── Victory checks ───────────────────────────────────────────────────────
    // Already has a winner set by combat
    if (state.winner) {
      return {
        winner: state.winner,
        playerGroupCount,
        playerSpecialProgress: playerSpecial.progress,
        playerSpecialLabel:    playerSpecial.label,
        opponentGroupCount,
        opponentSpecialProgress: opponentSpecial.progress,
        opponentSpecialLabel:    opponentSpecial.label,
      }
    }

    // Player wins by basic goal
    if (playerGroupCount >= BASIC_GOAL_GROUPS) {
      return {
        winner: "player",
        playerGroupCount,
        playerSpecialProgress: 100,
        playerSpecialLabel:    `Controlled ${playerGroupCount} groups — VICTORY!`,
        opponentGroupCount,
        opponentSpecialProgress: opponentSpecial.progress,
        opponentSpecialLabel:    opponentSpecial.label,
      }
    }

    // Player wins by special goal
    if (playerSpecial.achieved) {
      return {
        winner: "player",
        playerGroupCount,
        playerSpecialProgress: 100,
        playerSpecialLabel:    playerSpecial.label + " — SPECIAL VICTORY!",
        opponentGroupCount,
        opponentSpecialProgress: opponentSpecial.progress,
        opponentSpecialLabel:    opponentSpecial.label,
      }
    }

    // Opponent wins by basic goal
    if (opponentGroupCount >= BASIC_GOAL_GROUPS) {
      return {
        winner: "opponent",
        playerGroupCount,
        playerSpecialProgress: playerSpecial.progress,
        playerSpecialLabel:    playerSpecial.label,
        opponentGroupCount,
        opponentSpecialProgress: 100,
        opponentSpecialLabel:   `Controlled ${opponentGroupCount} groups — VICTORY!`,
      }
    }

    // Opponent wins by special goal
    if (opponentSpecial.achieved) {
      return {
        winner: "opponent",
        playerGroupCount,
        playerSpecialProgress: playerSpecial.progress,
        playerSpecialLabel:    playerSpecial.label,
        opponentGroupCount,
        opponentSpecialProgress: 100,
        opponentSpecialLabel:    opponentSpecial.label + " — SPECIAL VICTORY!",
      }
    }

    return {
      winner: null,
      playerGroupCount,
      playerSpecialProgress: playerSpecial.progress,
      playerSpecialLabel:    playerSpecial.label,
      opponentGroupCount,
      opponentSpecialProgress: opponentSpecial.progress,
      opponentSpecialLabel:    opponentSpecial.label,
    }
  }, [state])
}
