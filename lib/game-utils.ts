import { cards as allCards, getCardById, type FactionCard, type BaseCard, type GroupLikeCard } from "./cards"
import { loadDeckFromLocalStorage } from "./deck-utils"

/**
 * Shuffles an array in place using the Fisher-Yates (Knuth) algorithm.
 * @param array The array to shuffle.
 * @returns The shuffled array.
 */
function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--
    ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
  }
  return array
}

export interface GameState {
  playerFaction: FactionCard | null
  playerHand: BaseCard[]
  playerField: BaseCard[]
  playerMoney: number
  opponentFaction: FactionCard | null
  opponentHand: BaseCard[]
  opponentField: BaseCard[]
  opponentMoney: number
  mainDeck: BaseCard[]
  discardPile: BaseCard[]
  currentPhase: "Collect Income" | "Main Actions" | "Reposition Groups" | "End Turn"
  turnNumber: number
  gameLog: string[]
  winner: "player" | "opponent" | null
}

/**
 * Initializes the game state for a new game.
 * @returns The initial game state.
 */
export function initializeGame(): GameState {
  const savedDeckData = loadDeckFromLocalStorage()
  let playerFaction: FactionCard | null = null
  let playerDeck: BaseCard[] = []

  if (savedDeckData && savedDeckData.factionId) {
    const faction = getCardById(savedDeckData.factionId)
    if (faction && faction.type === "Faction") {
      playerFaction = faction as FactionCard
      playerDeck = savedDeckData.deck // This is the built deck, not the main game deck
    }
  }

  if (!playerFaction) {
    // Fallback if no faction is selected or saved deck is invalid
    // For now, let's pick a default or prompt the user to go back to deck management
    console.error("No player faction found. Please select a faction first.")
    // In a real game, you'd redirect or show an error. For now, we'll use a placeholder.
    playerFaction = allCards.find((card) => card.id === "bavarian-illuminati") as FactionCard
    playerDeck = allCards.filter((card) => card.type !== "Faction") // Use all non-faction cards as a default deck
  }

  // Create the main game deck from all available Group and Plot cards
  // Filter out the player's faction card from the main deck pool
  const availableGameCards = allCards.filter(
    (card) =>
      card.type !== "Faction" &&
      (card.type === "Group" ||
        card.type === "Resource" ||
        card.type === "Place" ||
        card.type === "Personality" ||
        card.type === "Organization" ||
        card.type === "Artifact" ||
        card.type === "Plot" ||
        card.type === "Special" ||
        card.type === "Goal" ||
        card.type === "Disaster" ||
        card.type === "New World Order"),
  )

  const mainDeck = shuffle([...availableGameCards]) // Shuffle all available game cards

  // Draw initial hands
  const playerHand: BaseCard[] = []
  const opponentHand: BaseCard[] = []

  // Draw 4 Group cards for player
  for (let i = 0; i < 4; i++) {
    const groupCardIndex = mainDeck.findIndex(
      (card) =>
        card.type === "Group" ||
        card.type === "Resource" ||
        card.type === "Place" ||
        card.type === "Personality" ||
        card.type === "Organization" ||
        card.type === "Artifact",
    )
    if (groupCardIndex !== -1) {
      playerHand.push(mainDeck.splice(groupCardIndex, 1)[0])
    } else {
      console.warn("Not enough group cards in the main deck for player initial draw.")
      break
    }
  }

  // Draw 4 Plot cards for player
  for (let i = 0; i < 4; i++) {
    const plotCardIndex = mainDeck.findIndex(
      (card) =>
        card.type === "Plot" ||
        card.type === "Special" ||
        card.type === "Goal" ||
        card.type === "Disaster" ||
        card.type === "New World Order",
    )
    if (plotCardIndex !== -1) {
      playerHand.push(mainDeck.splice(plotCardIndex, 1)[0])
    } else {
      console.warn("Not enough plot cards in the main deck for player initial draw.")
      break
    }
  }

  // For opponent, draw 8 random cards (simplified for now)
  for (let i = 0; i < 8; i++) {
    if (mainDeck.length > 0) {
      opponentHand.push(mainDeck.shift()!)
    } else {
      console.warn("Not enough cards in the main deck for opponent initial draw.")
      break
    }
  }

  // Set initial money based on Illuminati's Power
  const playerMoney = Number.parseInt(playerFaction.power.split("/")[0]) || 0 // Assuming power is "X/Y"
  const opponentFaction = allCards.find((card) => card.id === "servants-of-cthulhu") as FactionCard // Placeholder opponent
  const opponentMoney = Number.parseInt(opponentFaction.power.split("/")[0]) || 0

  return {
    playerFaction,
    playerHand,
    playerField: [playerFaction], // Illuminati starts in the field
    playerMoney,
    opponentFaction,
    opponentHand,
    opponentField: [opponentFaction], // Opponent Illuminati starts in the field
    opponentMoney,
    mainDeck,
    discardPile: [],
    currentPhase: "Collect Income",
    turnNumber: 1,
    gameLog: ["Game started!", `Player chose ${playerFaction.name}.`, `Opponent chose ${opponentFaction.name}.`],
    winner: null,
  }
}

/**
 * Draws a specified number of cards from the main deck.
 * @param deck The current main deck.
 * @param hand The current hand to add cards to.
 * @param numCards The number of cards to draw.
 * @returns An object containing the updated deck and hand.
 */
export function drawCards(deck: BaseCard[], hand: BaseCard[], numCards: number) {
  const newDeck = [...deck]
  const newHand = [...hand]
  const drawnCards: BaseCard[] = []

  for (let i = 0; i < numCards; i++) {
    if (newDeck.length > 0) {
      const card = newDeck.shift()!
      newHand.push(card)
      drawnCards.push(card)
    } else {
      console.warn("Deck is empty! Cannot draw more cards.")
      break
    }
  }
  return { newDeck, newHand, drawnCards }
}

/**
 * Simulates collecting income for a player.
 * @param currentMoney Player's current money.
 * @param playerField Player's field (groups controlled).
 * @returns Updated money.
 */
export function collectIncome(currentMoney: number, playerField: BaseCard[]): number {
  let income = 0
  playerField.forEach((card) => {
    // Only GroupLikeCards have income
    if (
      card.type === "Group" ||
      card.type === "Resource" ||
      card.type === "Place" ||
      card.type === "Personality" ||
      card.type === "Organization" ||
      card.type === "Artifact"
    ) {
      income += (card as GroupLikeCard).income
    }
  })
  return currentMoney + income
}

/**
 * Simulates buying a card from the main deck.
 * @param currentMoney Player's current money.
 * @param mainDeck The current main deck.
 * @param playerHand Player's current hand.
 * @param cost The cost to buy a card.
 * @returns An object with updated money, deck, hand, and a success boolean.
 */
export function buyCard(currentMoney: number, mainDeck: BaseCard[], playerHand: BaseCard[], cost: number) {
  if (currentMoney < cost) {
    return {
      success: false,
      message: "Not enough money to buy a card.",
      newMoney: currentMoney,
      newDeck: mainDeck,
      newHand: playerHand,
    }
  }
  if (mainDeck.length === 0) {
    return {
      success: false,
      message: "The deck is empty.",
      newMoney: currentMoney,
      newDeck: mainDeck,
      newHand: playerHand,
    }
  }

  const { newDeck, newHand, drawnCards } = drawCards(mainDeck, playerHand, 1)
  if (drawnCards.length > 0) {
    return {
      success: true,
      message: `Bought ${drawnCards[0].name} for ${cost} money.`,
      newMoney: currentMoney - cost,
      newDeck,
      newHand,
    }
  } else {
    return {
      success: false,
      message: "Could not draw a card.",
      newMoney: currentMoney,
      newDeck: mainDeck,
      newHand: playerHand,
    }
  }
}
