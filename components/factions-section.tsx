import { getCardById } from "@/lib/cards"
import FactionCard from "./faction-card"

export default function FactionsSection() {
  // Define factions using data from lib/cards.ts where applicable
  const factions = [
    {
      imageUrl: getCardById("adepts-of-hermes")?.imageUrl || "/placeholder.svg", // Use actual card image
      name: "Adepts of Hermes",
      description:
        "Masters of ancient wisdom and occult knowledge, seeking to guide humanity through esoteric enlightenment.",
    },
    {
      imageUrl: getCardById("bavarian-illuminati")?.imageUrl || "/placeholder.svg",
      name: "Bavarian Illuminati",
      description: "The classic conspiracy masterminds, pulling strings from the shadows to reshape the world order.",
    },
    {
      imageUrl: getCardById("bermuda-triangle")?.imageUrl || "/placeholder.svg",
      name: "Bermuda Triangle",
      description: "Mysterious forces from the depths, wielding otherworldly powers and unexplained phenomena.",
    },
    {
      imageUrl: getCardById("discordian-society")?.imageUrl || "/placeholder.svg",
      name: "Discordian Society",
      description: "Agents of chaos and confusion, spreading discord to disrupt established power structures.",
    },
    {
      imageUrl: getCardById("gnomes-of-zurich")?.imageUrl || "/placeholder.svg",
      name: "Gnomes of Zürich",
      description: "Financial puppet masters controlling global economics through banking and monetary manipulation.",
    },
    {
      imageUrl: getCardById("the-network")?.imageUrl || "/placeholder.svg",
      name: "The Network",
      description: "Information brokers and media manipulators, controlling the flow of knowledge and public opinion.",
    },
    {
      imageUrl: getCardById("servants-of-cthulhu")?.imageUrl || "/placeholder.svg",
      name: "Servants of Cthulhu",
      description: "Cultists serving ancient cosmic horrors, seeking to bring about the end of human civilization.",
    },
    {
      imageUrl: getCardById("shangri-la")?.imageUrl || "/placeholder.svg",
      name: "Shangri-La",
      description: "Peaceful isolationists from hidden mountain sanctuaries, promoting harmony and spiritual balance.",
    },
    {
      imageUrl: getCardById("ufos")?.imageUrl || "/placeholder.svg",
      name: "UFOs",
      description: "Extraterrestrial visitors with advanced technology and mysterious agendas for Earth.",
    },
    {
      imageUrl: getCardById("society-of-assassins")?.imageUrl || "/placeholder.svg",
      name: "Society of Assassins",
      description: "Elite killers and shadow operatives, eliminating obstacles through precision and stealth.",
    },
    {
      imageUrl: getCardById("church-of-the-subgenius")?.imageUrl || "/placeholder.svg",
      name: "Church of the SubGenius",
      description: "Satirical pseudo-religious movement promoting slack and absurdist philosophy.",
    },
  ]

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
