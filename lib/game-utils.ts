// ─────────────────────────────────────────────────────────────────────────────
// INWO Game Engine — Core State & Logic
// Replaces the previous Hearthstone-style combat with authentic INWO 2d6 rules
// ─────────────────────────────────────────────────────────────────────────────
import { cards as allCards, getCardById, type FactionCard, type BaseCard, type GroupLikeCard } from "./cards"
import { loadDeckFromLocalStorage } from "./deck-utils"
import {
  rollAttack,
  removeNodeFromTree,
  addCardToTree,
  createRootNode,
  canPlayCard,
  getCardPower,
  getCardResistance,
} from "./inwo-rules"
import type { ControlNode, AttackType } from "./inwo-types"

export type AIDifficulty = "easy" | "medium" | "hard"

// ─────────────────────────────────────────────────────────────────────────────
// FieldCard now uses INWO stats (power / resistance) visually
// ─────────────────────────────────────────────────────────────────────────────
export interface FieldCard extends BaseCard {
  /** Power value (used as attack strength in 2d6 rolls) */
  currentHP: number  // kept for UI compatibility — maps to resistance
  maxHP: number
  attack: number     // maps to power
  hasAttacked: boolean
  /** True if the parent node was destroyed and this card is cut off */
  isDisconnected: boolean
  alignments: string[]
}

// ─────────────────────────────────────────────────────────────────────────────
// GameState
// ─────────────────────────────────────────────────────────────────────────────
export interface GameState {
  // ── Player ──────────────────────────────────────────────────────────────────
  playerFaction:       FactionCard | null
  playerHP:            number
  playerHand:          BaseCard[]
  playerField:         FieldCard[]
  playerPower:         number
  playerMaxPower:      number
  playerPowerUsed:     number
  playerControlTree:   ControlNode[]
  playerActionTokens:  number
  playerDestroyedCount: number

  // ── Opponent ─────────────────────────────────────────────────────────────────
  opponentFaction:       FactionCard | null
  opponentHP:            number
  opponentHand:          BaseCard[]
  opponentField:         FieldCard[]
  opponentPower:         number
  opponentMaxPower:      number
  opponentPowerUsed:     number
  opponentControlTree:   ControlNode[]
  opponentActionTokens:  number
  opponentDestroyedCount: number

  // ── Shared ───────────────────────────────────────────────────────────────────
  mainDeck:      BaseCard[]
  discardPile:   BaseCard[]
  currentPhase:  "Draw" | "Main" | "End"
  turnNumber:    number
  isPlayerTurn:  boolean
  gameLog:       string[]
  winner:        "player" | "opponent" | null
  aiDifficulty:  AIDifficulty

  /** Last combat roll details for display */
  lastRollResult?: { breakdown: string; success: boolean }
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────
function shuffle<T>(array: T[]): T[] {
  let cur = array.length, rnd: number
  while (cur !== 0) {
    rnd = Math.floor(Math.random() * cur--)
    ;[array[cur], array[rnd]] = [array[rnd], array[cur]]
  }
  return array
}

function getFactionPowerBase(faction: FactionCard): number {
  const parsed = parseInt(faction.power.split("/")[0])
  return isNaN(parsed) ? 7 : Math.floor(parsed / 2)
}

function createFieldCard(card: BaseCard): FieldCard {
  const isGroup = ["Group","Organization","Personality","Place","Resource","Artifact"].includes(card.type)
  const glc = card as GroupLikeCard
  const attack     = isGroup ? glc.power      : Math.max(1, Math.floor(card.powerCost * 0.8))
  const resistance = isGroup ? glc.resistance : Math.max(1, card.powerCost * 2)

  return {
    ...card,
    attack,
    maxHP:     resistance,
    currentHP: resistance,
    hasAttacked:    true,   // summoning sickness
    isDisconnected: false,
    alignments: isGroup ? glc.alignments : [],
  }
}

const MAX_HAND_SIZE = 8

// ─────────────────────────────────────────────────────────────────────────────
// Initialize
// ─────────────────────────────────────────────────────────────────────────────
export function initializeGame(difficulty: AIDifficulty = "medium"): GameState {
  const savedDeckData = loadDeckFromLocalStorage()
  let playerFaction: FactionCard | null = null

  if (savedDeckData?.factionId) {
    const f = getCardById(savedDeckData.factionId)
    if (f?.type === "Faction") playerFaction = f as FactionCard
  }
  if (!playerFaction) {
    playerFaction = allCards.find(c => c.id === "bavarian-illuminati") as FactionCard
  }

  const mainDeck = shuffle([...allCards.filter(c => c.type !== "Faction")])

  const playerHand:   BaseCard[] = []
  const opponentHand: BaseCard[] = []
  for (let i = 0; i < 4; i++) {
    if (mainDeck.length > 0) playerHand.push(mainDeck.shift()!)
    if (mainDeck.length > 0) opponentHand.push(mainDeck.shift()!)
  }

  const opponentFaction = allCards.find(c => c.id === "servants-of-cthulhu") as FactionCard

  // Build root control-tree nodes (the Illuminati cards)
  const playerControlTree:   ControlNode[] = [createRootNode(playerFaction.id)]
  const opponentControlTree: ControlNode[] = [createRootNode(opponentFaction.id)]

  const playerMaxPower   = Math.min(10, getFactionPowerBase(playerFaction))
  const opponentMaxPower = Math.min(10, getFactionPowerBase(opponentFaction))

  return {
    playerFaction,
    playerHP: 30,
    playerHand,
    playerField: [],
    playerPower: 1,
    playerMaxPower,
    playerPowerUsed: 0,
    playerControlTree,
    playerActionTokens: 0,
    playerDestroyedCount: 0,

    opponentFaction,
    opponentHP: 30,
    opponentHand,
    opponentField: [],
    opponentPower: 1,
    opponentMaxPower,
    opponentPowerUsed: 0,
    opponentControlTree,
    opponentActionTokens: 0,
    opponentDestroyedCount: 0,

    mainDeck,
    discardPile: [],
    currentPhase: "Draw",
    turnNumber: 1,
    isPlayerTurn: true,
    gameLog: [
      "Game started!",
      `Player chose ${playerFaction.name}.`,
      `Opponent chose ${opponentFaction.name}.`,
      `Difficulty: ${difficulty.toUpperCase()}`,
    ],
    winner: null,
    aiDifficulty: difficulty,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Draw
// ─────────────────────────────────────────────────────────────────────────────
export function drawCards(deck: BaseCard[], hand: BaseCard[], numCards: number) {
  const newDeck = [...deck]
  const newHand = [...hand]
  const drawnCards: BaseCard[] = []

  for (let i = 0; i < numCards; i++) {
    if (newDeck.length === 0) break
    const card = newDeck.shift()!
    // Enforce hand limit — discard oldest if over MAX_HAND_SIZE
    if (newHand.length >= MAX_HAND_SIZE) {
      const discarded = newHand.shift()!
      drawnCards.push(discarded) // track for log if desired
    }
    newHand.push(card)
    drawnCards.push(card)
  }
  return { newDeck, newHand, drawnCards }
}

export function executeDraw(state: GameState): GameState {
  if (state.currentPhase !== "Draw") return state

  const { newDeck, newHand, drawnCards } = drawCards(state.mainDeck, state.playerHand, 1)
  const turnPower = Math.min(10, state.turnNumber)

  // Wake up cards (remove summoning sickness)
  const newPlayerField = state.playerField.map(c => ({ ...c, hasAttacked: false }))

  return {
    ...state,
    mainDeck: newDeck,
    playerHand: newHand,
    playerField: newPlayerField,
    playerPower: turnPower,
    playerPowerUsed: 0,
    playerActionTokens: 1, // refresh 1 action token per turn (INWO rule)
    currentPhase: "Main",
    gameLog: [
      ...state.gameLog,
      drawnCards.length > 0
        ? `Drew ${drawnCards[drawnCards.length - 1].name}. Power: ${turnPower}/${turnPower}`
        : `No cards to draw. Power: ${turnPower}/${turnPower}`,
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Play Card — with control tree integration
// ─────────────────────────────────────────────────────────────────────────────
export function playCard(
  state: GameState,
  card: BaseCard,
): { success: boolean; newState: GameState; message: string } {
  if (!state.isPlayerTurn || state.currentPhase !== "Main") {
    return { success: false, newState: state, message: "You can only play cards during your Main phase." }
  }

  const powerAvailable = state.playerPower - state.playerPowerUsed
  if (card.powerCost > powerAvailable) {
    return { success: false, newState: state, message: `Not enough power! Need ${card.powerCost}, have ${powerAvailable}.` }
  }

  // INWO Rule of Gold: must have a free output slot
  const slotCheck = canPlayCard(state.playerControlTree, card)
  if (!slotCheck.canPlay) {
    return { success: false, newState: state, message: slotCheck.reason ?? "No free slots in your power structure." }
  }

  const newHand     = state.playerHand.filter(c => c.id !== card.id)
  const newField    = [...state.playerField, createFieldCard(card)]
  const newPowerUsed = state.playerPowerUsed + card.powerCost

  // Add card to control tree
  const newTree = addCardToTree(state.playerControlTree, card)

  const newState: GameState = {
    ...state,
    playerHand: newHand,
    playerField: newField,
    playerPowerUsed: newPowerUsed,
    playerControlTree: newTree,
    gameLog: [...state.gameLog, `Player played ${card.name} (cost: ${card.powerCost} power)`],
  }

  return { success: true, newState, message: `Played ${card.name}` }
}

// ─────────────────────────────────────────────────────────────────────────────
// Attack — using INWO 2d6 combat
// ─────────────────────────────────────────────────────────────────────────────
export function attackCard(
  state: GameState,
  attackerIdx: number,
  targetIdx: number | "hero",
  attackType: AttackType = "destroy",
): GameState {
  if (!state.isPlayerTurn || state.currentPhase !== "Main") return state

  const attacker = state.playerField[attackerIdx]
  if (!attacker || attacker.hasAttacked || attacker.isDisconnected) return state

  let newState = { ...state }
  const newPlayerField   = [...state.playerField]
  const newOpponentField = [...state.opponentField]
  let newPlayerTree      = [...state.playerControlTree]
  let newOpponentTree    = [...state.opponentControlTree]
  let destroyedCount     = state.opponentDestroyedCount

  if (targetIdx === "hero") {
    // Direct attack on the opponent's Illuminati (destroy attempt)
    const factionPower = parseInt(state.opponentFaction?.power.split("/")[0] ?? "7")
    const result = rollAttack(
      attacker.name, attacker.attack, attacker.alignments,
      state.opponentFaction?.name ?? "Illuminati",
      factionPower,
      [], // Illuminati has no specific alignment in this simplified version
      "destroy",
      state.playerActionTokens,
    )

    if (result.success) {
      newState.opponentHP = Math.max(0, newState.opponentHP - attacker.attack)
    }

    newState.lastRollResult  = result
    newState.gameLog = [...state.gameLog, result.breakdown]
  } else {
    const target = state.opponentField[targetIdx]
    if (!target) return state

    const result = rollAttack(
      attacker.name, attacker.attack, attacker.alignments,
      target.name, target.currentHP,  // resistance
      target.alignments,
      attackType,
      state.playerActionTokens,
    )

    newState.lastRollResult = result
    const logs: string[] = [...state.gameLog, result.breakdown]

    if (result.success) {
      if (attackType === "destroy") {
        // Target is destroyed
        logs.push(`💥 ${target.name} was DESTROYED!`)
        newOpponentField.splice(targetIdx, 1)
        newOpponentTree  = removeNodeFromTree(newOpponentTree, target.id)
        destroyedCount  += 1

        // Attacker takes retaliatory "wound" on failure of defense
        // House rule: attacker also risks on destroy — attacker takes damage equal to resistance/4
        const retaliationDamage = Math.floor(target.currentHP / 4)
        const attackerCopy = { ...newPlayerField[attackerIdx] }
        attackerCopy.currentHP = Math.max(0, attackerCopy.currentHP - retaliationDamage)
        if (attackerCopy.currentHP <= 0) {
          logs.push(`💀 ${attacker.name} was also DESTROYED in battle!`)
          newPlayerField.splice(attackerIdx, 1)
          newPlayerTree = removeNodeFromTree(newPlayerTree, attacker.id)
        } else {
          newPlayerField[attackerIdx] = attackerCopy
        }
      } else if (attackType === "control") {
        // Target is captured by player
        logs.push(`🎯 ${target.name} is now CONTROLLED by you!`)
        const capturedFieldCard: FieldCard = { ...target, isDisconnected: false, hasAttacked: true }
        newOpponentField.splice(targetIdx, 1)
        newOpponentTree = removeNodeFromTree(newOpponentTree, target.id)
        newPlayerField.push(capturedFieldCard)
        newPlayerTree  = addCardToTree(newPlayerTree, target)
      }
    } else {
      // Failed attack: attacker takes partial retaliation
      const dmg = Math.floor(target.currentHP / 6)
      if (dmg > 0) {
        const attackerCopy = { ...newPlayerField[attackerIdx] }
        attackerCopy.currentHP = Math.max(0, attackerCopy.currentHP - dmg)
        if (attackerCopy.currentHP <= 0) {
          logs.push(`💀 ${attacker.name} perished in the failed attack!`)
          newPlayerField.splice(attackerIdx, 1)
          newPlayerTree = removeNodeFromTree(newPlayerTree, attacker.id)
        } else {
          newPlayerField[attackerIdx] = attackerCopy
          logs.push(`${attacker.name} took ${dmg} retaliation damage.`)
        }
      }
    }

    // Mark attacker as having attacked this turn (if still alive)
    const survivorIdx = newPlayerField.findIndex(c => c.id === attacker.id)
    if (survivorIdx !== -1) {
      newPlayerField[survivorIdx] = { ...newPlayerField[survivorIdx], hasAttacked: true }
    }

    newState = {
      ...newState,
      playerField:         newPlayerField,
      opponentField:       newOpponentField,
      playerControlTree:   newPlayerTree,
      opponentControlTree: newOpponentTree,
      opponentDestroyedCount: destroyedCount,
      gameLog: logs,
    }
  }

  // Check HP-based win
  if (newState.opponentHP <= 0) {
    newState.winner = "player"
    newState.gameLog = [...newState.gameLog, "PLAYER WINS! (Illuminati destroyed)"]
  } else if (newState.playerHP <= 0) {
    newState.winner = "opponent"
  }

  return newState
}

// ─────────────────────────────────────────────────────────────────────────────
// AI helpers
// ─────────────────────────────────────────────────────────────────────────────
function aiSelectCard(
  hand: BaseCard[],
  availablePower: number,
  difficulty: AIDifficulty,
  field: BaseCard[],
  tree: ControlNode[],
): BaseCard | null {
  const affordable = hand.filter(c =>
    c.powerCost <= availablePower && canPlayCard(tree, c).canPlay
  )
  if (affordable.length === 0) return null

  if (difficulty === "easy") return affordable[Math.floor(Math.random() * affordable.length)]
  if (difficulty === "medium") return [...affordable].sort((a, b) => b.powerCost - a.powerCost)[0]

  // Hard: prefer Group cards that contribute to win condition
  const groups = affordable.filter(c =>
    ["Group","Organization","Personality","Place"].includes(c.type)
  )
  if (groups.length > 0) return groups.sort((a, b) => b.powerCost - a.powerCost)[0]
  return [...affordable].sort((a, b) => b.powerCost - a.powerCost)[0]
}

// ─────────────────────────────────────────────────────────────────────────────
// End Turn — AI executes its full turn with INWO rules
// ─────────────────────────────────────────────────────────────────────────────
export function executeEndTurn(state: GameState): GameState {
  if (state.currentPhase !== "Main") return state

  const logs: string[] = [...state.gameLog, "Player ended turn. Opponent's turn begins..."]

  const oppTurnPower = Math.min(10, state.turnNumber)

  // Opponent draws
  let oppHand = [...state.opponentHand]
  let oppDeck = [...state.mainDeck]
  if (oppDeck.length > 0) {
    // Respect hand limit
    if (oppHand.length >= MAX_HAND_SIZE) oppHand.shift()
    oppHand.push(oppDeck.shift()!)
    logs.push("Opponent drew a card.")
  }

  // Opponent plays cards
  let oppField = [...state.opponentField].map(c => ({ ...c, hasAttacked: false }))
  let oppTree  = [...state.opponentControlTree]
  let oppPowerUsed = 0
  let oppDestroyedCount = state.opponentDestroyedCount

  const maxPlays = state.aiDifficulty === "hard" ? 3 : state.aiDifficulty === "medium" ? 2 : 1
  for (let i = 0; i < maxPlays; i++) {
    const card = aiSelectCard(oppHand, oppTurnPower - oppPowerUsed, state.aiDifficulty, oppField, oppTree)
    if (!card) break
    oppHand      = oppHand.filter(c => c.id !== card.id)
    oppField     = [...oppField, createFieldCard(card)]
    oppTree      = addCardToTree(oppTree, card)
    oppPowerUsed += card.powerCost
    logs.push(`Opponent played ${card.name} (cost: ${card.powerCost})`)
  }

  // Opponent attacks
  let playerHP    = state.playerHP
  let playerField = [...state.playerField]
  let playerTree  = [...state.playerControlTree]

  for (const aiAttacker of oppField) {
    if (playerField.length > 0 && state.aiDifficulty !== "easy") {
      // AI targets weakest card
      let targetIdx = 0
      for (let j = 1; j < playerField.length; j++) {
        if (playerField[j].currentHP < playerField[targetIdx].currentHP) targetIdx = j
      }
      const target = playerField[targetIdx]

      const result = rollAttack(
        aiAttacker.name, aiAttacker.attack, aiAttacker.alignments,
        target.name, target.currentHP, target.alignments,
        "destroy", 0,
      )
      logs.push(result.breakdown)

      if (result.success) {
        logs.push(`💥 Your ${target.name} was DESTROYED!`)
        playerField.splice(targetIdx, 1)
        playerTree = removeNodeFromTree(playerTree, target.id)
      } else {
        // Defender survives, has a chance to counter-damage AI
        const counterDmg = Math.floor(target.attack / 4)
        if (counterDmg > 0) {
          const aiIdx = oppField.findIndex(c => c.id === aiAttacker.id)
          if (aiIdx !== -1) {
            const aiCopy = { ...oppField[aiIdx] }
            aiCopy.currentHP = Math.max(0, aiCopy.currentHP - counterDmg)
            oppField[aiIdx] = aiCopy
          }
        }
      }
    } else {
      // Easy: AI attacks hero directly
      const result = rollAttack(
        aiAttacker.name, aiAttacker.attack, aiAttacker.alignments,
        "Your Illuminati", 10, [], "destroy", 0,
      )
      logs.push(result.breakdown)
      if (result.success) {
        playerHP -= aiAttacker.attack
        logs.push(`Opponent's ${aiAttacker.name} hit your Illuminati for ${aiAttacker.attack}!`)
      }
    }
  }

  // Cleanup dead AI cards
  oppField = oppField.filter(c => c.currentHP > 0)

  let winner = state.winner
  if (playerHP <= 0) {
    winner = "opponent"
    logs.push("OPPONENT WINS!")
  }

  const nextTurn      = state.turnNumber + 1
  const nextTurnPower = Math.min(10, nextTurn)

  return {
    ...state,
    playerHP,
    playerField,
    playerControlTree: playerTree,
    opponentHand: oppHand,
    opponentField: oppField,
    opponentControlTree: oppTree,
    opponentPower: oppTurnPower,
    opponentMaxPower: Math.min(10, oppTurnPower),
    opponentPowerUsed: oppPowerUsed,
    opponentDestroyedCount: oppDestroyedCount,
    mainDeck: oppDeck,
    turnNumber: nextTurn,
    playerPower: nextTurnPower,
    playerMaxPower: Math.min(10, nextTurnPower),
    playerPowerUsed: 0,
    playerActionTokens: 1, // refresh
    currentPhase: "Draw",
    isPlayerTurn: true,
    winner,
    gameLog: logs,
  } as GameState
}
