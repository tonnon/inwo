import { getFactions } from "@/lib/factions"
import FactionCard from "./faction-card"

export default function FactionsSection() {
  // Get factions from the lib/factions.ts file
  const factions = getFactions()

  return (
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-[#FF324A] font-mono">
        Factions in the Game
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {factions.map((faction, index) => (
          <FactionCard 
            key={index}
            imageUrl={faction.imageUrl}
            name={faction.name}
            description={faction.description}
          />
        ))}
      </div>
    </section>
  )
}
