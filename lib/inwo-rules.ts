// ─────────────────────────────────────────────────────────────────────────────
// INWO Rule Engine — Core Logic
// ─────────────────────────────────────────────────────────────────────────────
import type {
  Alignment,
  AlignmentRelation,
  AttackCalcResult,
  AttackType,
  ControlNode,
  RollResult,
  SlotDirection,
} from "./inwo-types"
import { OPPOSED_PAIRS } from "./inwo-types"
import type { BaseCard, GroupLikeCard } from "./cards"

// ═══════════════════════════════════════════════════════════════════════════════
// 1. ALIGNMENT HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Determines the relationship between two alignment lists.
 * Returns "opposed" if ANY pair is directly opposed,
 * "same" if ANY alignment is shared, else "neutral".
 */
export function getAlignmentRelation(
  attackerAlignments: string[],
  defenderAlignments: string[],
): AlignmentRelation {
  const a = attackerAlignments as Alignment[]
  const d = defenderAlignments as Alignment[]

  for (const [x, y] of OPPOSED_PAIRS) {
    if ((a.includes(x) && d.includes(y)) || (a.includes(y) && d.includes(x))) {
      return "opposed"
    }
  }
  for (const al of a) {
    if (d.includes(al)) return "same"
  }
  return "neutral"
}

/**
 * Calculates the alignment combat bonus based on INWO rules:
 * - Attack to DESTROY: +4 if alignments are OPPOSED
 * - Attack to CONTROL: +4 if alignments are SAME
 * - Attack to NEUTRALIZE: +4 if opposed, others neutral
 */
export function calculateAlignmentBonus(
  attackType: AttackType,
  relation: AlignmentRelation,
): { bonus: number; label: string } {
  if (attackType === "control") {
    if (relation === "same") return { bonus: 4, label: "+4 (same alignment)" }
    if (relation === "opposed") return { bonus: -4, label: "-4 (opposed alignment)" }
  } else if (attackType === "destroy") {
    if (relation === "opposed") return { bonus: 4, label: "+4 (opposed alignment)" }
    if (relation === "same") return { bonus: -4, label: "-4 (same alignment)" }
  } else {
    // neutralize
    if (relation === "opposed") return { bonus: 4, label: "+4 (opposed alignment)" }
  }
  return { bonus: 0, label: "" }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. COMBAT PROBABILITY ENGINE (2d6)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * 2d6 probability table: given a target number N,
 * returns the number of 2d6 outcomes that produce a sum <= N.
 */
function countSuccessfulOutcomes(neededRoll: number): number {
  if (neededRoll >= 12) return 36
  if (neededRoll <= 1)  return 0
  let count = 0
  for (let d1 = 1; d1 <= 6; d1++) {
    for (let d2 = 1; d2 <= 6; d2++) {
      if (d1 + d2 <= neededRoll) count++
    }
  }
  return count
}

/**
 * Core INWO combat calculation.
 *
 * Formula: netStrength = attackerPower + alignmentBonus + actionTokens
 * Success condition: 2d6 roll <= (netStrength - targetResistance)
 *
 * @param attackerPower  The attacking card / Illuminati's power value
 * @param attackerAlignments  Aligned attributes of the attacker
 * @param targetResistance  The defending card's resistance
 * @param targetAlignments  Aligned attributes of the defender
 * @param attackType  "control" | "destroy" | "neutralize"
 * @param actionTokens  Extra tokens spent on this attack (each +1 to netStrength)
 */
export function calculateSuccessChance(
  attackerPower: number,
  attackerAlignments: string[],
  targetResistance: number,
  targetAlignments: string[],
  attackType: AttackType,
  actionTokens = 0,
): AttackCalcResult {
  const relation = getAlignmentRelation(attackerAlignments, targetAlignments)
  const { bonus: alignmentBonus, label: alignmentBonusLabel } = calculateAlignmentBonus(attackType, relation)

  const netStrength = attackerPower + alignmentBonus + actionTokens
  const neededRoll  = netStrength - targetResistance

  const successfulOutcomes = countSuccessfulOutcomes(neededRoll)
  const probability = Math.round((successfulOutcomes / 36) * 100)

  return {
    netStrength,
    targetResistance,
    neededRoll,
    probability,
    alignmentBonus,
    alignmentBonusLabel,
  }
}

/**
 * Executes an actual 2d6 attack roll.
 * Returns whether it succeeded and a log string for the game log.
 */
export function rollAttack(
  attackerName: string,
  attackerPower: number,
  attackerAlignments: string[],
  targetName: string,
  targetResistance: number,
  targetAlignments: string[],
  attackType: AttackType,
  actionTokens = 0,
): RollResult {
  const calc = calculateSuccessChance(
    attackerPower, attackerAlignments,
    targetResistance, targetAlignments,
    attackType, actionTokens,
  )

  const die1 = Math.ceil(Math.random() * 6)
  const die2 = Math.ceil(Math.random() * 6)
  const roll  = die1 + die2
  const success = roll <= calc.neededRoll

  const typeLabel = attackType.toUpperCase()
  const bonusStr  = calc.alignmentBonusLabel ? ` ${calc.alignmentBonusLabel}` : ""
  const breakdown =
    `[${typeLabel}] ${attackerName} (${attackerPower}${bonusStr}+${actionTokens}t = ${calc.netStrength})` +
    ` vs ${targetName} (R:${targetResistance}) — needed ≤${calc.neededRoll}, rolled ${die1}+${die2}=${roll} → ` +
    (success ? "✅ SUCCESS" : "❌ FAILURE")

  return { success, die1, die2, roll, breakdown }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. CONTROL TREE — Connection Validation
// ═══════════════════════════════════════════════════════════════════════════════

/** Maximum output slots for each card type */
const MAX_OUTPUT_SLOTS: Record<string, number> = {
  Faction: 4,      // Illuminati root: can use all 4 directions
  Group: 3,        // Standard group: bottom, left, right
  Organization: 3,
  Personality: 3,
  Place: 3,
  Resource: 1,     // Resources are leaf nodes (no children)
  Artifact: 1,
  Plot: 0,
  Special: 0,
  Goal: 0,
  Disaster: 0,
  "New World Order": 0,
}

/** Which slots are valid OUTPUT slots per card type */
const VALID_OUTPUT_SLOTS: Record<string, SlotDirection[]> = {
  Faction:      ["top", "bottom", "left", "right"],
  Group:        ["bottom", "left", "right"],
  Organization: ["bottom", "left", "right"],
  Personality:  ["bottom", "left", "right"],
  Place:        ["bottom", "left", "right"],
  Resource:     [],
  Artifact:     [],
}

/**
 * Validates whether a card can be connected as a child of parentCard in the given slot.
 *
 * Rules checked:
 * 1. The slot must be a valid output slot for the parent type
 * 2. The slot must currently be empty
 * 3. The child card type must accept an input (i.e. can be placed in a power structure)
 * 4. The child card must not already be in the tree
 *
 * @returns `{ valid: true }` or `{ valid: false, reason: string }`
 */
export function validateConnection(
  parentNode: ControlNode,
  parentCard: BaseCard,
  childCard: BaseCard,
  slot: SlotDirection,
  existingTree: ControlNode[],
): { valid: boolean; reason?: string } {
  // 1. Slot must be a valid output for parent type
  const validSlots = VALID_OUTPUT_SLOTS[parentCard.type] ?? []
  if (!validSlots.includes(slot)) {
    return { valid: false, reason: `${parentCard.type} cards cannot output from the '${slot}' slot.` }
  }

  // 2. Slot must be empty
  if (parentNode.slots[slot] !== null) {
    return { valid: false, reason: `Slot '${slot}' on ${parentCard.name} is already occupied.` }
  }

  // 3. Child card type must accept input connections (be placeable)
  const childMaxOut = MAX_OUTPUT_SLOTS[childCard.type] ?? 0
  const childIsBranchable = childMaxOut >= 0 &&
    ["Group","Organization","Personality","Place","Resource","Artifact"].includes(childCard.type)
  if (!childIsBranchable) {
    return { valid: false, reason: `${childCard.type} cards cannot be placed in a power structure.` }
  }

  // 4. Child must not already exist in the tree (no duplicates)
  if (existingTree.some(n => n.cardId === childCard.id)) {
    return { valid: false, reason: `${childCard.name} is already in the power structure.` }
  }

  return { valid: true }
}

/**
 * Checks whether a new card CAN be played (Rule of Thumb: there must be at
 * least one free output slot somewhere in the tree).
 */
export function canPlayCard(
  controlTree: ControlNode[],
  cardToPlay: BaseCard,
): { canPlay: boolean; reason?: string } {
  if (controlTree.length === 0) {
    return { canPlay: false, reason: "No Illuminati in play yet." }
  }

  // Check if any non-disconnected node has a free valid output slot
  for (const node of controlTree) {
    if (node.isDisconnected) continue
    const nodeCard = { type: node.isIlluminati ? "Faction" : "Group" } as BaseCard
    const validSlots = VALID_OUTPUT_SLOTS[nodeCard.type === "Faction" ? "Faction" : "Group"] ?? []
    for (const slot of validSlots) {
      if (node.slots[slot] === null) {
        return { canPlay: true }
      }
    }
  }

  return { canPlay: false, reason: "No free output slots in your power structure." }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. POWER FLOW — Cascade Disconnection
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * When a card (node) is destroyed or captured, ALL nodes that depend on it
 * (its children, grandchildren, etc.) must be marked as Disconnected.
 *
 * This implements the "Power Flow" rule from INWO.
 *
 * @param tree  The full control tree (mutated copy returned)
 * @param destroyedCardId  The cardId of the destroyed/captured node
 * @returns Updated tree with disconnected nodes flagged
 */
export function applyPowerFlow(
  tree: ControlNode[],
  destroyedCardId: string,
): ControlNode[] {
  const updated = tree.map(n => ({ ...n, slots: { ...n.slots } }))

  // BFS/DFS to find all descendants of the destroyed node
  const toDisconnect = new Set<string>()
  const queue = [destroyedCardId]

  while (queue.length > 0) {
    const current = queue.shift()!
    const node = updated.find(n => n.cardId === current)
    if (!node) continue

    // All children of this node become disconnected
    for (const slot of ["top", "bottom", "left", "right"] as SlotDirection[]) {
      const childId = node.slots[slot]
      if (childId && !toDisconnect.has(childId)) {
        toDisconnect.add(childId)
        queue.push(childId)
      }
    }

    // Detach from parent's slot reference
    if (node.parentId) {
      const parentNode = updated.find(n => n.cardId === node.parentId)
      if (parentNode && node.occupiedSlot) {
        parentNode.slots[node.occupiedSlot] = null
      }
    }
  }

  // Mark all descendants as disconnected
  return updated.map(n =>
    toDisconnect.has(n.cardId) ? { ...n, isDisconnected: true } : n
  )
}

/**
 * Removes the destroyed card entirely and disconnects its children.
 * Returns the cleaned tree (destroyed card removed, children marked).
 */
export function removeNodeFromTree(
  tree: ControlNode[],
  destroyedCardId: string,
): ControlNode[] {
  const afterFlow = applyPowerFlow(tree, destroyedCardId)
  return afterFlow.filter(n => n.cardId !== destroyedCardId)
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. TREE BUILDER HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Creates the root Illuminati node for a new game */
export function createRootNode(factionCardId: string): ControlNode {
  return {
    cardId: factionCardId,
    isIlluminati: true,
    parentId: null,
    occupiedSlot: null,
    slots: { top: null, bottom: null, left: null, right: null },
    isDisconnected: false,
    actionTokens: 0,
  }
}

/** Creates a new Group node and attaches it to a parent */
export function createGroupNode(
  card: BaseCard,
  parentNode: ControlNode,
  slot: SlotDirection,
): ControlNode {
  return {
    cardId: card.id,
    isIlluminati: false,
    parentId: parentNode.cardId,
    occupiedSlot: slot,
    slots: { top: null, bottom: null, left: null, right: null },
    isDisconnected: false,
    actionTokens: 0,
  }
}

/**
 * Adds a card to the control tree, attaching it to the first available slot
 * found in BFS order (mimicking a player placing into the "open" slot).
 * Returns the updated tree, or the unchanged tree if no slot is available.
 */
export function addCardToTree(
  tree: ControlNode[],
  card: BaseCard,
): ControlNode[] {
  const SLOT_PRIORITY: SlotDirection[] = ["bottom", "left", "right", "top"]

  for (const node of tree) {
    if (node.isDisconnected) continue
    const validSlots = node.isIlluminati
      ? SLOT_PRIORITY
      : SLOT_PRIORITY.filter(s => s !== "top") // Groups output bottom/left/right

    for (const slot of validSlots) {
      if (node.slots[slot] === null) {
        const newNode = createGroupNode(card, node, slot)
        const updatedParent = { ...node, slots: { ...node.slots, [slot]: card.id } }
        return tree.map(n => n.cardId === node.cardId ? updatedParent : n).concat(newNode)
      }
    }
  }
  return tree // No free slot found
}

/** Returns the power value of a card, or 0 if not a group-like card */
export function getCardPower(card: BaseCard): number {
  const g = card as GroupLikeCard
  return typeof g.power === "number" ? g.power : 0
}

/** Returns the resistance value of a card */
export function getCardResistance(card: BaseCard): number {
  const g = card as GroupLikeCard
  return typeof g.resistance === "number" ? g.resistance : 0
}

/** Total power in a control tree (sum of all connected non-disconnected nodes) */
export function totalTreePower(
  tree: ControlNode[],
  cardMap: Map<string, BaseCard>,
): number {
  return tree
    .filter(n => !n.isDisconnected)
    .reduce((sum, n) => {
      const card = cardMap.get(n.cardId)
      return sum + (card ? getCardPower(card) : 0)
    }, 0)
}
