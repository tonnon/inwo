// ─────────────────────────────────────────────────────────────────────────────
// INWO Rule Engine — Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

// ── Alignment system ──────────────────────────────────────────────────────────
export type Alignment =
  | "Government"
  | "Criminal"
  | "Violent"
  | "Peaceful"
  | "Liberal"
  | "Conservative"
  | "Corporate"
  | "Fanatic"
  | "Straight"
  | "Weird"
  | "Secret"
  | "Magic"
  | "Computer"
  | "Media"
  | "Science"

/** Pairs of directly opposed alignments in INWO */
export const OPPOSED_PAIRS: [Alignment, Alignment][] = [
  ["Government", "Criminal"],
  ["Violent",    "Peaceful"],
  ["Liberal",    "Conservative"],
  ["Corporate",  "Fanatic"],
  ["Straight",   "Weird"],
]

export type AlignmentRelation = "opposed" | "same" | "neutral"

// ── Control-tree graph ────────────────────────────────────────────────────────

/** Which directional slot is being used for a connection */
export type SlotDirection = "top" | "bottom" | "left" | "right"

/**
 * A node in the player's power-structure (control tree).
 * The Illuminati card is always the root (parentId === null).
 * Group cards can have up to 3 child slots (bottom / left / right).
 * The Illuminati root can have unlimited output arrows (all 4 directions).
 */
export interface ControlNode {
  /** Matches BaseCard.id */
  cardId: string
  /** true = Illuminati / Faction card (root); false = Group card */
  isIlluminati: boolean
  /** Parent node cardId; null means this IS the root */
  parentId: string | null
  /** Which slot on the PARENT this node occupies */
  occupiedSlot: SlotDirection | null
  /** Child card IDs per slot on THIS node */
  slots: Record<SlotDirection, string | null>
  /** Set to true when the parent is destroyed → card is captured/removed */
  isDisconnected: boolean
  /** Extra action tokens placed on this card */
  actionTokens: number
}

// ── Attack system ─────────────────────────────────────────────────────────────

export type AttackType = "control" | "destroy" | "neutralize"

export interface AttackCalcResult {
  /** Net offensive strength = power + alignment bonus + action tokens */
  netStrength: number
  /** Resistance the attacker must overcome */
  targetResistance: number
  /**
   * The highest 2d6 roll that results in SUCCESS.
   * Success = roll <= netStrength - targetResistance
   * (negative or 0 means automatic failure)
   */
  neededRoll: number
  /** Probability of success 0–100 */
  probability: number
  /** Human-readable alignment bonus description */
  alignmentBonusLabel: string
  alignmentBonus: number
}

export interface RollResult {
  success: boolean
  die1: number
  die2: number
  roll: number
  /** Full breakdown for the game log */
  breakdown: string
}

// ── Victory conditions ────────────────────────────────────────────────────────

export interface VictoryStatus {
  winner: "player" | "opponent" | null
  /** How many groups the player currently controls (0–12) */
  playerGroupCount: number
  /** 0–100 % progress towards special goal */
  playerSpecialProgress: number
  /** e.g. "Destroy 8 Groups: 3/8" */
  playerSpecialLabel: string
  opponentGroupCount: number
  opponentSpecialProgress: number
  opponentSpecialLabel: string
}
