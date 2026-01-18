"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link" // Import Link for navigation
import { getCardById, prebuiltDecks, type FactionCard, type BaseCard, type GroupLikeCard } from "@/lib/cards"
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

const isGroupLikeCard = (card: BaseCard): card is GroupLikeCard =>
  card.type === "Group" ||
  card.type === "Resource" ||
  card.type === "Place" ||
  card.type === "Personality" ||
  card.type === "Organization" ||
  card.type === "Artifact"

export default function DeckBuilder({ selectedFaction, onBackToFactionSelection }: DeckBuilderProps) {
  const [deck, setDeck] = useState<BaseCard[]>([])
  const [validation, setValidation] = useState<DeckValidationResult | null>(null)
  const [tableCards, setTableCards] = useState<BaseCard[]>([])
  const [tableCardsLoading, setTableCardsLoading] = useState(true)
  const [tableCardsError, setTableCardsError] = useState<string | null>(null)
  const [previewCard, setPreviewCard] = useState<BaseCard | null>(null)

  // Load deck from local storage on mount
  useEffect(() => {
    const saved = loadDeckFromLocalStorage()
    if (saved && saved.factionId === selectedFaction.id && saved.deck.length > 0) {
      setDeck(saved.deck)
      return
    }

    const prebuiltIds = prebuiltDecks[selectedFaction.id]
    if (prebuiltIds?.length) {
      const prebuiltCards = prebuiltIds
        .map((id) => getCardById(id))
        .filter((card): card is NonNullable<ReturnType<typeof getCardById>> => Boolean(card))
      setDeck(prebuiltCards)
      return
    }

    setDeck([])
  }, [selectedFaction.id])

  useEffect(() => {
    let isMounted = true
    const loadTableCards = async () => {
      setTableCardsLoading(true)
      setTableCardsError(null)
      try {
        const response = await fetch("/api/table-cards")
        if (!response.ok) {
          throw new Error(`Failed to load cards (status ${response.status})`)
        }
        const data: { cards: BaseCard[] } = await response.json()
        if (isMounted) {
          setTableCards(data.cards)
        }
      } catch (error) {
        console.error("Failed to load table cards:", error)
        if (isMounted) {
          setTableCardsError("Unable to load the physical cards. Please try again later.")
        }
      } finally {
        if (isMounted) {
          setTableCardsLoading(false)
        }
      }
    }
    loadTableCards()
    return () => {
      isMounted = false
    }
  }, [])

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
    <>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-[#FF324A] font-mono">Build Your Deck</h2>

      <section className="relative mx-auto mb-12 max-w-5xl overflow-hidden rounded-3xl border border-[#FFBA56]/30 bg-gradient-to-br from-[#06060A] via-[#0B0C13] to-[#15161F] px-6 py-8 shadow-[0_35px_120px_-60px_rgba(255,186,86,0.9)]">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -top-28 right-0 h-64 w-64 rounded-full bg-[#FFBA56]/20 blur-[120px]" />
          <div className="absolute -bottom-32 left-2 h-72 w-72 rounded-full bg-[#FF324A]/15 blur-[140px]" />
        </div>

        <div className="relative grid gap-10 lg:grid-cols-[1.05fr,0.95fr] items-center">
          <div className="space-y-5 text-center lg:text-left">
            <p className="text-sm uppercase tracking-[0.55em] text-[#FFBA56]/80">Command Center</p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-[#FFBA56] lg:justify-start">
              <h3 className="text-3xl font-extrabold text-[#FFBA56]">Your Faction</h3>
              <span className="rounded-full bg-[#FF324A] px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
                Faction
              </span>
            </div>
            <p className="text-4xl font-black tracking-tight text-white lg:text-5xl">{selectedFaction.name}</p>
            <p className="text-base text-gray-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Lead this faction to victory by assembling synergistic groups and plots. Keep power balanced while you fine-tune the perfect Illuminati conspiracy.
            </p>

            <div className="grid gap-4 text-left text-sm text-white/90 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-[0.65rem] uppercase tracking-[0.45em] text-gray-400">Power Rating</p>
                <p className="text-2xl font-semibold text-white">{selectedFaction.power}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-gray-400">Special Goal</p>
                <p className="text-sm text-white/80">{selectedFaction.specialGoal}</p>
              </div>
              {selectedFaction.abilities?.length ? (
                <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                  <p className="text-[0.65rem] uppercase tracking-[0.35em] text-gray-400 mb-2">Signature Abilities</p>
                  <ul className="space-y-2 text-left text-sm text-gray-200">
                    {selectedFaction.abilities.slice(0, 2).map((ability, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="text-[#FFBA56]">➤</span>
                        <span>{ability}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <Button
              onClick={onBackToFactionSelection}
              variant="ghost"
              className="mx-auto w-full max-w-xs rounded-full border border-transparent text-[#FFBA56] transition-all duration-200 hover:border-[#FFBA56]/40 hover:bg-[#FFBA56]/10 hover:text-white lg:mx-0"
            >
              Change Faction
            </Button>
          </div>

          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-4 rounded-[34px] bg-gradient-to-br from-[#FFBA56]/40 via-transparent to-[#FF324A]/40 opacity-80 blur-2xl" />
              <div className="relative rounded-[32px] border border-white/10 bg-gradient-to-b from-[#07080F] via-[#050509] to-[#07080F] p-6 shadow-[0_25px_110px_rgba(0,0,0,0.65)]">
                <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.35em] text-[#FFBA56]/80">
                  <span>Illuminated Relic</span>
                  <span>Power {selectedFaction.power}</span>
                </div>

                <div className="relative mt-4">
                  <div className="absolute -inset-4 rounded-[28px] border border-[#FFBA56]/30 opacity-70" />
                  <div className="absolute -inset-2 rounded-[28px] bg-gradient-to-br from-[#FFBA56]/15 to-transparent blur-xl" />
                  <div className="relative flex justify-center">
                    <CardDisplay
                      card={selectedFaction}
                      size="large"
                      className="w-full max-w-[320px] justify-center drop-shadow-[0_25px_45px_rgba(0,0,0,0.65)]"
                      imageFit="contain"
                      lockAspect
                      showStats={false}
                    />
                  </div>
                  <div className="absolute -bottom-6 left-1/2 h-12 w-32 -translate-x-1/2 rounded-full bg-black/70 blur-2xl" />
                </div>

                <div className="mt-10 grid gap-4 text-sm">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/90">
                    <p className="text-[0.6rem] uppercase tracking-[0.45em] text-[#FFBA56]/80">Special Goal</p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-100">{selectedFaction.specialGoal}</p>
                  </div>
                  {selectedFaction.abilities?.[0] && (
                    <div className="rounded-2xl border border-[#FF324A]/30 bg-[#FF324A]/10 px-4 py-3 text-white">
                      <p className="text-[0.6rem] uppercase tracking-[0.45em] text-[#FFBA56]/80">Signature Move</p>
                      <p className="mt-2 text-sm leading-relaxed text-gray-100">{selectedFaction.abilities[0]}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Available Cards Pool */}
        <Card className="relative lg:col-span-2 overflow-hidden border border-[#FF324A]/40 bg-[#05060A] p-6 shadow-[0_45px_120px_-50px_rgba(255,50,74,0.6)]">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#FF324A] opacity-30 blur-[160px]" />
          <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-[#5B8CFF] opacity-30 blur-[140px]" />
          <div className="relative space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-[#FF324A]/90">Table • Visual Library</p>
                <h3 className="text-4xl font-extrabold text-white">Available Cards</h3>
                <p className="text-xs uppercase tracking-[0.45em] text-gray-400 mt-1">tap to zoom</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/90">
                <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Status: {tableCardsLoading ? "Loading..." : tableCardsError ? "Error" : "Ready"}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-semibold">
                  Total cards: {tableCards.length}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white">Table</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/70">Digitized</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/70">
                Interactive zoom
              </span>
            </div>

            <p className="text-sm text-gray-300">
              Every card below is a photo from the physical table deck (
              <code className="bg-white/10 px-1 rounded text-white">public/cards/table-cards</code>). Use the zoom view
              to inspect details before adding them to your build.
            </p>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur">
              {tableCardsLoading && <p className="text-gray-400 animate-pulse">Loading physical cards...</p>}
              {tableCardsError && <p className="text-red-400">{tableCardsError}</p>}
              {!tableCardsLoading && !tableCardsError && (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 auto-rows-fr">
                  {tableCards.map((card) => (
                    <div key={card.id} className="flex justify-center">
                      <CardDisplay
                        card={card}
                        size="xlarge"
                        imageFit="contain"
                        lockAspect={false}
                        showAlignments={false}
                        showStats={false}
                        onClick={() => setPreviewCard(card)}
                        className="hover:scale-[1.02]"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
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
        {/* Modal Preview */}
        {previewCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setPreviewCard(null)} />
            <div className="modal-zoom relative z-10 w-full max-w-4xl rounded-3xl border border-white/10 bg-gradient-to-br from-gray-950 via-gray-900 to-black p-8 text-white shadow-[0_25px_80px_rgba(0,0,0,0.65)]">
              <button
                className="absolute right-6 top-6 text-gray-400 hover:text-white transition-colors cursor-pointer"
                onClick={() => setPreviewCard(null)}
                aria-label="Close preview"
              >
                ✕
              </button>
              <div className="grid gap-8 md:grid-cols-[360px,1fr] items-center">
                <div className="flex justify-center">
                  <CardDisplay card={previewCard} size="xlarge" imageFit="contain" className="scale-105" />
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-[#FF324A]/80 mb-3">Physical Card</p>
                    <p className="text-sm text-gray-300 leading-relaxed">{previewCard.description}</p>
                  </div>
                  {isGroupLikeCard(previewCard) && previewCard.alignments.length > 0 ? (
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-2">Alignments</p>
                      <div className="flex flex-wrap gap-2">
                        {previewCard.alignments.map((alignment) => (
                          <span
                            key={`${previewCard.id}-${alignment}`}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wide"
                          >
                            {alignment}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {isGroupLikeCard(previewCard) && (
                    <div className="flex gap-4 text-sm font-mono text-white">
                      <span className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2">
                        P: <span className="font-semibold">{previewCard.power}</span>
                      </span>
                      {typeof previewCard.resistance === "number" && (
                        <span className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2">
                          R: <span className="font-semibold">{previewCard.resistance}</span>
                        </span>
                      )}
                      {typeof previewCard.income === "number" && (
                        <span className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2">
                          I: <span className="font-semibold">{previewCard.income}</span>
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex flex-col gap-3 pt-4 md:flex-row">
                    <Button
                      className="w-full md:flex-1 rounded-2xl bg-gradient-to-r from-[#FF324A] via-[#FF5F1F] to-[#FFBA56] text-black font-semibold tracking-[0.2em] uppercase hover:shadow-lg hover:shadow-[#FF324A]/30 transition-all duration-300 cursor-pointer"
                      onClick={() => {
                        addCardToDeck(previewCard)
                        setPreviewCard(null)
                      }}
                    >
                      Add to Deck
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full md:flex-1 rounded-2xl border-white/30 bg-black/30 text-white font-semibold tracking-[0.2em] uppercase transition-all duration-300 hover:border-[#FFBA56] hover:bg-[radial-gradient(circle_at_top,_rgba(255,186,86,0.2),_transparent_65%)] hover:text-[#FFBA56] hover:shadow-[0_12px_35px_rgba(255,186,86,0.35)] cursor-pointer"
                      onClick={() => setPreviewCard(null)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        @keyframes previewZoom {
          0% {
            transform: scale(0.9) translateY(10px);
            opacity: 0;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        .modal-zoom {
          animation: previewZoom 0.35s ease forwards;
        }
      `}</style>
    </>
  )
}
