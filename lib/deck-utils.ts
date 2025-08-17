import type { BaseCard, FactionCard } from "./cards"
import { cards as allCards } from "./cards"

export interface DeckValidationResult {
  isValid: boolean
  messages: string[]
  totalCards: number
  groupCount: number
  plotCount: number
  duplicateCards: { cardName: string; count: number }[]
}

export function validateDeck(faction: FactionCard | null, deck: BaseCard[]): DeckValidationResult {
  const messages: string[] = []
  let isValid = true

  const totalCards = deck.length
  const groupCount = deck.filter(
    (card) =>
      card.type === "Group" ||
      card.type === "Organization" ||
      card.type === "Personality" ||
      card.type === "Place" ||
      card.type === "Resource" ||
      card.type === "Artifact",
  ).length
  const plotCount = deck.filter(
    (card) =>
      card.type === "Plot" ||
      card.type === "Special" ||
      card.type === "Goal" ||
      card.type === "Disaster" ||
      card.type === "New World Order",
  ).length

  // Rule 1: Minimum 45 cards in total (excluding Faction)
  if (totalCards < 45) {
    messages.push(`Deck must have at least 45 cards. Current: ${totalCards}`)
    isValid = false
  }

  // Rule 2: Minimum 1/3 of the deck must be Groups (now GroupLikeCards)
  if (totalCards > 0 && groupCount / totalCards < 1 / 3) {
    messages.push(
      `At least 1/3 of your deck must be Groups (or Group-like cards). Current: ${groupCount} (${(
        (groupCount / totalCards) * 100
      ).toFixed(0)}%)`,
    )
    isValid = false
  }

  // Rule 3: Minimum 1/3 of the deck must be Plots (now EventLikeCards)
  if (totalCards > 0 && plotCount / totalCards < 1 / 3) {
    messages.push(
      `At least 1/3 of your deck must be Plots (or Event-like cards). Current: ${plotCount} (${(
        (plotCount / totalCards) * 100
      ).toFixed(0)}%)`,
    )
    isValid = false
  }

  // Rule 4: Maximum 2 copies of any non-Faction card. Only 1 Faction card. Cards marked “Unique” can only appear once.
  const cardCounts = new Map<string, number>()
  const duplicateCards: { cardName: string; count: number }[] = []

  deck.forEach((card) => {
    cardCounts.set(card.id, (cardCounts.get(card.id) || 0) + 1)
  })

  cardCounts.forEach((count, cardId) => {
    const card = allCards.find((c) => c.id === cardId)
    if (!card) return

    if (card.type === "Faction") {
      messages.push(`Faction card "${card.name}" should not be in the deck pool.`)
      isValid = false
    } else if (card.isUnique && count > 1) {
      messages.push(`Unique card "${card.name}" can only have 1 copy. Found: ${count}`)
      isValid = false
      duplicateCards.push({ cardName: card.name, count })
    } else if (count > 2) {
      messages.push(`Card "${card.name}" has too many copies. Max 2. Found: ${count}`)
      isValid = false
      duplicateCards.push({ cardName: card.name, count })
    }
  })

  return {
    isValid,
    messages,
    totalCards,
    groupCount,
    plotCount,
    duplicateCards,
  }
}

export function saveDeckToLocalStorage(factionId: string, deck: BaseCard[]) {
  try {
    const data = { factionId, deck: deck.map((card) => card.id) }
    localStorage.setItem("inwoDeck", JSON.stringify(data))
    console.log("Deck saved successfully!")
  } catch (error) {
    console.error("Failed to save deck to local storage:", error)
    alert("Failed to save deck. Please check your browser settings.")
  }
}

export function loadDeckFromLocalStorage(): { factionId: string | null; deck: BaseCard[] } | null {
  try {
    const savedData = localStorage.getItem("inwoDeck")
    if (savedData) {
      const { factionId, deck: savedDeckIds } = JSON.parse(savedData)
      const loadedDeck: BaseCard[] = savedDeckIds
        .map((id: string) => allCards.find((card) => card.id === id))
        .filter((card: BaseCard | undefined): card is BaseCard => card !== undefined)

      console.log("Deck loaded successfully!")
      return { factionId, deck: loadedDeck }
    }
  } catch (error) {
    console.error("Failed to load deck from local storage:", error)
    alert("Failed to load deck. The saved data might be corrupted.")
  }
  return null
}
