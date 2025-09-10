export default function AboutSection() {
  return (
    <section className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-[#FF324A] font-mono relative">
        <img
          src="/wax-seal.png"
          alt="Wax Seal"
          className="absolute -left-10 md:-left-16 top-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 opacity-70 rotate-12"
        />
        About the Game
        <img
          src="/wax-seal.png"
          alt="Wax Seal"
          className="absolute -right-10 md:-right-16 top-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 opacity-70 -rotate-12"
        />
      </h2>
      <p className="text-lg md:text-xl text-gray-300 text-center max-w-4xl mx-auto leading-relaxed">
        Illuminati: New World Order is a strategic card game of conspiracy and world domination. Players take on the
        role of secret societies, each with their own agenda, competing to control the world through manipulation,
        intrigue, and dark humor. With its satirical take on conspiracy theories and power structures, INWO offers a
        unique blend of strategy and entertainment that has captivated players for decades.
      </p>
    </section>
  )
}
