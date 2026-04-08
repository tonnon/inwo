import { useEffect } from "react"
import { Button } from "./ui/button"

const steps = [
  {
    title: "Welcome to INWO!",
    content: "Your mission is to lead your Faction and crush the opposition. Let's quickly review the battlefield before we begin.",
    pos: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    pointer: "none"
  },
  {
    title: "Your Hand",
    content: "Your hand of cards lies here. A simple click opens card details and allows you to play the card if you have enough energy.",
    pos: "bottom-[180px] left-1/2 -translate-x-1/2",
    pointer: "bottom"
  },
  {
    title: "Player Zone",
    content: "The cards you play land here! You will also find your Hero HP and available Energy. In future turns, a single click prepares a card to attack.",
    pos: "bottom-[35%] left-1/2 -translate-x-1/2",
    pointer: "bottom"
  },
  {
    title: "Enemy Targets",
    content: "The top half belongs to your enemy. After activating an 'Attack' on your card, simply click an enemy card on the board to brutally strike it!",
    pos: "top-[32%] left-1/2 -translate-x-1/2",
    pointer: "top"
  },
  {
    title: "Controls & Turns",
    content: "Click 'DRAW' to start your turn and 'END TURN' when you have no more moves. A new turn always restores your energy!",
    pos: "top-1/2 right-[280px] -translate-y-1/2",
    pointer: "right"
  },
  {
    title: "You are Ready!",
    content: "Use standard Left Clicks for all interactions and modals. May the gods of strategy be with you!",
    pos: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    pointer: "none"
  }
]

export default function TutorialOverlay({ 
  step, 
  setStep, 
  onComplete 
}: { 
  step: number; 
  setStep: (s: number) => void; 
  onComplete: () => void;
}) {
  const curr = steps[step]

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      onComplete()
    }
  }

  // Allow enter to advance and Escape to close
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Enter') next()
      if (e.key === 'Escape') onComplete()
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [step, next, onComplete])

  return (
    <>
      {/* Block background slightly to focus attention */}
      <div 
        className="fixed inset-0 z-[50000] bg-black/70 backdrop-blur-[2px] pointer-events-auto transition-opacity duration-300" 
      />
      
      {/* Tooltip Modal */}
      <div className={`fixed z-[50002] ${curr.pos} bg-gradient-to-br from-gray-950/95 to-black/95 border border-[#FFBA56]/40 p-6 rounded-2xl w-full max-w-sm shadow-[0_20px_80px_rgba(255,186,86,0.25)] backdrop-blur-xl pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]`}>
        {curr.pointer === "bottom" && <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rotate-45 bg-black border-r border-b border-[#FFBA56]/40" />}
        {curr.pointer === "top" && <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rotate-45 bg-gray-950 border-l border-t border-[#FFBA56]/40" />}
        {curr.pointer === "right" && <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rotate-45 bg-black border-t border-r border-[#FFBA56]/40" />}

        <div className="flex justify-between items-start mb-3 relative z-10">
          <h3 className="font-black text-xl text-[#FFBA56] uppercase tracking-tighter drop-shadow-md">{curr.title}</h3>
          <span className="text-xs text-white/30 font-mono self-center mt-1 bg-white/5 px-2 py-0.5 rounded-full">{step + 1} / {steps.length}</span>
        </div>
        
        <p className="text-sm text-gray-300 leading-relaxed mb-6 font-medium relative z-10">{curr.content}</p>
        
        <div className="flex justify-between items-center gap-4 relative z-10">
          <button onClick={onComplete} className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest cursor-pointer transition-colors px-2 py-2">
            Skip Intro
          </button>
          
          <Button 
            onClick={next}
            className="flex-1 rounded-xl bg-gradient-to-r from-[#FFBA56] to-[#d97706] text-black font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-[#FFBA56]/40 border border-[#FFBA56]/20 px-6 cursor-pointer"
          >
            {step < steps.length - 1 ? "Next" : "Play!"}
          </Button>
        </div>
      </div>
    </>
  )
}
