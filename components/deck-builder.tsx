"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link" // Import Link for navigation
import { getGroupLikeCards, getEventLikeCards, type FactionCard, type BaseCard } from "@/lib/cards"
import {
  validateDeck,
  saveDeckToLocalStorage,
  loadDeckFromLocalStorage,
  type DeckValidationResult,
} from "@/lib/deck-utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import CardDisplay from "./card-display"

interface DeckBuilderProps {
  selectedFaction: FactionCard
  onBackToFactionSelection: () => void
}

export default function DeckBuilder({ selectedFaction, onBackToFactionSelection }: DeckBuilderProps) {
  const [deck, setDeck] = useState<BaseCard[]>([])
  const [validation, setValidation] = useState<DeckValidationResult | null>(null)
  const [activeTab, setActiveTab] = useState<"groups" | "plots">("groups")

  const allGroupLikeCards = getGroupLikeCards()
  const allEventLikeCards = getEventLikeCards()

  // Load deck from local storage on mount
  useEffect(() => {
    const saved = loadDeckFromLocalStorage()
    if (saved && saved.factionId === selectedFaction.id) {
      setDeck(saved.deck)
    }
  }, [selectedFaction.id])

  // Validate deck whenever it changes
  useEffect(() => {
    setValidation(validateDeck(selectedFaction, deck))
  }, [deck, selectedFaction])

  const addCardToDeck = useCallback(
    (card: BaseCard) => {
      setDeck((prevDeck) => {
        const newDeck = [...prevDeck, card]
        const currentValidation = validateDeck(selectedFaction, newDeck)

        // Prevent adding if it violates unique or 2-copy rule immediately
        const cardCount = newDeck.filter((c) => c.id === card.id).length
        if (card.isUnique && cardCount > 1) {
          alert(`Cannot add more than 1 copy of Unique card: ${card.name}`)
          return prevDeck
        }
        if (!card.isUnique && cardCount > 2) {
          alert(`Cannot add more than 2 copies of card: ${card.name}`)
          return prevDeck
        }

        return newDeck
      })
    },
    [selectedFaction],
  )

  const removeCardFromDeck = useCallback((cardToRemove: BaseCard) => {
    setDeck((prevDeck) => {
      const index = prevDeck.findIndex((card) => card.id === cardToRemove.id)
      if (index > -1) {
        const newDeck = [...prevDeck]
        newDeck.splice(index, 1)
        return newDeck
      }
      return prevDeck
    })
  }, [])

  const handleSaveDeck = () => {
    saveDeckToLocalStorage(selectedFaction.id, deck)
  }

  const handleLoadDeck = () => {
    const saved = loadDeckFromLocalStorage()
    if (saved) {
      if (saved.factionId !== selectedFaction.id) {
        alert(`Loaded deck is for a different faction (${saved.factionId}). Please select that faction first.`)
      } else {
        setDeck(saved.deck)
      }
    } else {
      alert("No saved deck found for this faction.")
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-[#FF324A] font-mono">Build Your Deck</h2>

      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <h3 className="text-2xl font-bold text-[#FFBA56]">Your Faction: {selectedFaction.name}</h3>
          <span className="bg-[#FF324A] text-white text-xs px-2 py-1 rounded-full font-bold">Faction</span>
        </div>
        <CardDisplay card={selectedFaction} size="large" className="mx-auto mb-1" imageFit="contain" />
        <Button
          onClick={onBackToFactionSelection}
          variant="ghost"
          className="text-[#FFBA56] hover:text-white hover:bg-gray-800/50 cursor-pointer"
        >
          Change Faction
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Available Cards Pool */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-black border border-[#FF324A]/20 p-6">
          <h3 className="text-2xl font-bold text-[#FFBA56] mb-4">Available Cards</h3>
          <div className="flex mb-4 border-b border-gray-700">
            <Button
              variant="ghost"
              className={`flex-1 rounded-none border-b-2 ${
                activeTab === "groups" ? "border-[#FF324A] text-[#FF324A]" : "border-transparent text-gray-500"
              } cursor-pointer`}
              onClick={() => setActiveTab("groups")}
            >
              Groups ({allGroupLikeCards.length})
            </Button>
            <Button
              variant="ghost"
              className={`flex-1 rounded-none border-b-2 ${
                activeTab === "plots" ? "border-[#FF324A] text-[#FF324A]" : "border-transparent text-gray-500"
              } cursor-pointer`}
              onClick={() => setActiveTab("plots")}
            >
              Plots ({allEventLikeCards.length})
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[600px] overflow-y-auto pr-2">
            {activeTab === "groups" &&
              allGroupLikeCards.map((card) => (
                <CardDisplay key={card.id} card={card} onClick={addCardToDeck} size="small" />
              ))}
            {activeTab === "plots" &&
              allEventLikeCards.map((card) => (
                <CardDisplay key={card.id} card={card} onClick={addCardToDeck} size="small" />
              ))}
          </div>
        </Card>

        {/* Deck Summary and Current Deck */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          {/* Deck Summary */}
          <Card className="bg-gradient-to-br from-gray-900 to-black border border-[#FFBA56]/20 p-6">
            <h3 className="text-2xl font-bold text-[#FFBA56] mb-4">Deck Summary</h3>
            {validation && (
              <div className="space-y-2 text-gray-300">
                <p>
                  Total Cards: <span className="font-semibold text-white">{validation.totalCards}</span>
                </p>
                <p>
                  Groups: <span className="font-semibold text-white">{validation.groupCount}</span>
                </p>
                <p>
                  Plots: <span className="font-semibold text-white">{validation.plotCount}</span>
                </p>

                {validation.messages.length > 0 && (
                  <div className="mt-4 p-3 bg-red-900/30 border border-red-500 text-red-300 rounded-md">
                    <p className="font-bold mb-2">Warnings/Errors:</p>
                    <ul className="list-disc list-inside">
                      {validation.messages.map((msg, i) => (
                        <li key={i}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {validation.isValid && (
                  <div className="mt-4 p-3 bg-green-900/30 border border-green-500 text-green-300 rounded-md">
                    <p className="font-bold">Deck is valid!</p>
                  </div>
                )}
              </div>
            )}
            <div className="mt-6 flex flex-col gap-3">
              <Button
                onClick={handleSaveDeck}
                className="bg-gradient-to-r from-[#FF324A] to-[#FFBA56] text-black font-semibold hover:shadow-lg hover:shadow-[#FF324A]/30 transition-all duration-300 cursor-pointer"
              >
                Save Deck
              </Button>
              <Button
                onClick={handleLoadDeck}
                variant="outline"
                className="border-[#FFBA56] text-[#FFBA56] hover:bg-[#FFBA56]/10 hover:text-white transition-all duration-300 bg-transparent cursor-pointer"
              >
                Load Deck
              </Button>
              {validation?.isValid && ( // Conditionally render the "Start Playing" button
                <Link href="/game" className="w-full">
                  <Button className="w-full bg-gradient-to-r from-green-400 to-blue-400 text-black font-semibold hover:shadow-lg hover:shadow-green-400/30 transition-all duration-300 cursor-pointer mt-4">
                    Start Playing!
                  </Button>
                </Link>
              )}
            </div>
          </Card>

          {/* Current Deck */}
          <Card className="flex-1 bg-gradient-to-br from-gray-900 to-black border border-[#FF324A]/20 p-6">
            <h3 className="text-2xl font-bold text-[#FFBA56] mb-4">Your Deck ({deck.length})</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[400px] overflow-y-auto pr-2">
              {deck.length === 0 ? (
                <p className="text-gray-500 col-span-full text-center">Your deck is empty. Add some cards!</p>
              ) : (
                deck.map((card, index) => (
                  <CardDisplay key={`${card.id}-${index}`} card={card} onClick={removeCardFromDeck} size="small" />
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
