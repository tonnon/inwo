"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { initializeGame, collectIncome, buyCard, drawCards, type GameState } from "@/lib/game-utils"
import CardDisplay from "@/components/card-display"
import type { BaseCard } from "@/lib/cards"

const GamePage = () => {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [message, setMessage] = useState<string>("")

  // Initialize game state on component mount
  useEffect(() => {
    setGameState(initializeGame())
  }, [])

  // Simulate turn changes (for game status display)
  useEffect(() => {
    if (!gameState) return

    const interval = setInterval(() => {
      // This interval is just for the "Your Turn" indicator, not actual game phases
      // Actual phase changes will be triggered by user actions
    }, 3000)
    return () => clearInterval(interval)
  }, [gameState])

  const handleNextPhase = useCallback(() => {
    if (!gameState) return

    let newPhase: GameState["currentPhase"]
    let logMessage = ""
    const updatedGameState = { ...gameState }

    switch (gameState.currentPhase) {
      case "Collect Income":
        const newMoney = collectIncome(gameState.playerMoney, gameState.playerField)
        updatedGameState.playerMoney = newMoney
        logMessage = `Collected income. Money: ${newMoney}`
        newPhase = "Main Actions"
        break
      case "Main Actions":
        // In a real game, this would involve player choosing actions.
        // For now, we'll just advance.
        logMessage = "Main actions phase completed."
        newPhase = "Reposition Groups"
        break
      case "Reposition Groups":
        // In a real game, this would involve player rearranging groups.
        logMessage = "Groups repositioned."
        newPhase = "End Turn"
        break
      case "End Turn":
        // Simulate opponent turn (very basic for now)
        const { newDeck: deckAfterOpponentDraw, newHand: opponentNewHand } = drawCards(
          updatedGameState.mainDeck,
          updatedGameState.opponentHand,
          1,
        ) // Opponent draws 1 card
        updatedGameState.mainDeck = deckAfterOpponentDraw
        updatedGameState.opponentHand = opponentNewHand
        updatedGameState.opponentMoney += 2 // Opponent gets some money
        logMessage = `Opponent's turn completed. Opponent drew a card and gained 2 money.`

        updatedGameState.turnNumber += 1
        newPhase = "Collect Income" // Start next player turn
        break
      default:
        newPhase = "Collect Income"
        break
    }

    updatedGameState.currentPhase = newPhase
    updatedGameState.gameLog = [...updatedGameState.gameLog, logMessage]
    setGameState(updatedGameState)
    setMessage(logMessage)
  }, [gameState])

  const handleBuyCard = useCallback(() => {
    if (!gameState) return
    const cardCost = 2 // Example cost
    const result = buyCard(gameState.playerMoney, gameState.mainDeck, gameState.playerHand, cardCost)

    if (result.success) {
      setGameState((prev) => ({
        ...(prev as GameState),
        playerMoney: result.newMoney,
        mainDeck: result.newDeck,
        playerHand: result.newHand,
        gameLog: [...(prev as GameState).gameLog, result.message],
      }))
      setMessage(result.message)
    } else {
      setMessage(result.message)
    }
  }, [gameState])

  const handlePlayCard = useCallback(
    (card: BaseCard) => {
      if (!gameState) return
      // For now, just move card from hand to field (simplified)
      const newHand = gameState.playerHand.filter((c) => c.id !== card.id)
      const newField = [...gameState.playerField, card]

      setGameState((prev) => ({
        ...(prev as GameState),
        playerHand: newHand,
        playerField: newField,
        gameLog: [...(prev as GameState).gameLog, `Player played ${card.name}`],
      }))
      setMessage(`Played ${card.name}`)
    },
    [gameState],
  )

  if (!gameState) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading game...</div>
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* Game Table Background */}
      <div className="absolute inset-0 z-0 game-table-background" />

      {/* Header */}
      <header className="relative z-20 bg-gradient-to-r from-gray-900 to-black border-b border-green-400/20 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-400 font-mono">INWO - Game Interface</h1>
          <Link href="/">
            <Button className="bg-gradient-to-r from-green-400 to-yellow-400 text-black font-semibold px-6 py-2 rounded-full hover:shadow-lg hover:shadow-green-400/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Game Interface */}
      <div className="relative z-20 grid grid-cols-1 lg:grid-cols-3 grid-rows-3 lg:grid-rows-3 gap-4 p-4 min-h-[calc(100vh-80px)] flex-grow">
        {/* Opponent Hand */}
        <div className="lg:col-span-3 border border-green-400/20 rounded-xl p-4 flex flex-col">
          <h2 className="text-lg font-bold text-green-400 font-mono text-center mb-4">
            Opponent Hand ({gameState.opponentHand.length})
          </h2>
          <div className="flex justify-center gap-2 flex-wrap">
            {gameState.opponentHand.map((_, i) => (
              <CardDisplay
                key={i}
                card={{
                  id: `opponent-card-${i}`,
                  name: "Opponent Card",
                  type: "Group",
                  imageUrl: "/placeholder.svg",
                  description: "",
                }}
                size="small"
                isFaceDown={true}
              />
            ))}
          </div>
        </div>

        {/* Player Field */}
        <div className="border border-green-400/20 rounded-xl p-4 flex flex-col">
          <h2 className="text-lg font-bold text-green-400 font-mono text-center mb-4">
            Your Field ({gameState.playerField.length})
          </h2>
          <div className="flex flex-col items-center gap-2 overflow-y-auto max-h-full">
            {gameState.playerField.map((card) => (
              <CardDisplay key={card.id} card={card} size="medium" />
            ))}
          </div>
        </div>

        {/* Game Board */}
        <div className="border border-green-400/20 rounded-xl p-4 flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-gradient-to-r from-green-400/20 to-transparent rounded-full flex items-center justify-center text-4xl mb-4 animate-pulse">
            👁️
          </div>
          <div className="bg-black/70 p-4 rounded-lg border border-green-400/30 text-center">
            <div className="text-yellow-400 font-mono text-lg mb-2">Game Status</div>
            <div className="text-green-400 font-semibold mb-2">
              Turn {gameState.turnNumber}: {gameState.currentPhase}
            </div>
            <div className="text-gray-500 text-sm italic mb-2">Player Money: ${gameState.playerMoney}</div>
            <div className="text-gray-500 text-sm italic mb-2">Opponent Money: ${gameState.opponentMoney}</div>
            <div className="text-gray-500 text-sm italic">Deck: {gameState.mainDeck.length} cards</div>
            {message && <p className="text-sm text-yellow-300 mt-2">{message}</p>}
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {gameState.currentPhase === "Collect Income" && (
              <Button onClick={handleNextPhase} className="bg-green-600 hover:bg-green-700 text-white cursor-pointer">
                Collect Income
              </Button>
            )}
            {gameState.currentPhase === "Main Actions" && (
              <>
                <Button onClick={handleBuyCard} className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                  Buy Card ($2)
                </Button>
                <Button
                  onClick={handleNextPhase}
                  className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                >
                  End Main Actions
                </Button>
              </>
            )}
            {gameState.currentPhase === "Reposition Groups" && (
              <Button onClick={handleNextPhase} className="bg-orange-600 hover:bg-orange-700 text-white cursor-pointer">
                Finish Repositioning
              </Button>
            )}
            {gameState.currentPhase === "End Turn" && (
              <Button onClick={handleNextPhase} className="bg-red-600 hover:bg-red-700 text-white cursor-pointer">
                End Turn
              </Button>
            )}
          </div>
        </div>

        {/* Opponent Field */}
        <div className="border border-green-400/20 rounded-xl p-4 flex flex-col">
          <h2 className="text-lg font-bold text-green-400 font-mono text-center mb-4">
            Opponent Field ({gameState.opponentField.length})
          </h2>
          <div className="flex flex-col items-center gap-2 overflow-y-auto max-h-full">
            {gameState.opponentField.map((card) => (
              <CardDisplay key={card.id} card={card} size="medium" />
            ))}
          </div>
        </div>

        {/* Player Hand */}
        <div className="lg:col-span-3 border border-green-400/20 rounded-xl p-4 flex flex-col">
          <h2 className="text-lg font-bold text-green-400 font-mono text-center mb-4">
            Your Hand ({gameState.playerHand.length})
          </h2>
          <div className="flex justify-center gap-2 flex-wrap overflow-x-auto pb-2">
            {gameState.playerHand.map((card) => (
              <CardDisplay key={card.id} card={card} onClick={handlePlayCard} size="small" />
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .game-table-background {
          background-image: url('/game-table-background.jpeg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          filter: brightness(0.7) contrast(1.2);
        }
      `}</style>
    </div>
  )
}

export default GamePage
