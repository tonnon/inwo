
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getCardById } from "@/lib/cards"


export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    // Fire particles animation
    const canvas = document.getElementById('fire-particles-canvas') as HTMLCanvasElement | null;
    let ctx: CanvasRenderingContext2D | null = null;
    let animationId: number;
    let particles: any[] = [];
    let width = 0;
    let height = 0;
    function resize() {
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (parent) {
        width = parent.clientWidth;
        height = parent.clientHeight;
      } else {
        width = window.innerWidth;
        height = window.innerHeight;
      }
      canvas.width = width;
      canvas.height = height;
    }
    function createParticle() {
      const x = Math.random() * width;
      const y = height + 10;
      const size = 2 + Math.random() * 3;
      const speed = 0.3 + Math.random() * 0.7; // velocidade menor
      const alpha = 0.5 + Math.random() * 0.5;
      const color = `rgba(${255},${Math.floor(100+Math.random()*100)},0,${alpha})`;
      return { x, y, size, speed, color, alpha };
    }
    function drawParticles() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (let p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.shadowColor = '#FFBA56';
        ctx.shadowBlur = 8;
        ctx.fill();
      }
    }
    function updateParticles() {
      for (let p of particles) {
        p.y -= p.speed + Math.random() * 0.3; // sobe mais devagar
        p.x += (Math.random() - 0.5) * 0.2; // menos movimento lateral
        p.alpha -= 0.0015 + Math.random() * 0.001; // fade mais suave
        p.size *= 0.997;
      }
      particles = particles.filter(p => p.y > -10 && p.alpha > 0.05 && p.size > 0.5);
      while (particles.length < 80) {
        particles.push(createParticle());
      }
    }
    function animate() {
      updateParticles();
      drawParticles();
      animationId = requestAnimationFrame(animate);
    }
    if (canvas) {
      ctx = canvas.getContext('2d');
      resize();
      window.addEventListener('resize', resize);
      for (let i = 0; i < 80; i++) particles.push(createParticle());
      animate();
    }
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener('resize', resize);
      if (animationId) cancelAnimationFrame(animationId);
    }
  }, [])

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
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navbar */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-black/95 backdrop-blur-md shadow-lg shadow-[#FF324A]/10" : "bg-black/90 backdrop-blur-sm"
        }`}
      >
        <div className="flex justify-between items-center px-4 md:px-8 py-4">
          <div className="text-2xl font-bold text-[#FF324A] font-mono tracking-wider">INWO</div>
          <Link href="/deck-management">
            <Button className="bg-gradient-to-r from-[#FF324A] to-[#FFBA56] text-black font-semibold px-6 py-2 rounded-full hover:shadow-lg hover:shadow-[#FF324A]/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              PLAY
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}

  <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 md:pt-28">
    {/* Background fire particles animation */}
    <div className="absolute inset-0 z-0 pointer-events-none chaos-bg" aria-hidden="true">
      <canvas id="fire-particles-canvas" className="w-full h-full block" style={{position: 'absolute', inset: 0}} />
    </div>
    {/* Hero Content Centralizado */}
  <div className="relative z-10 flex flex-col items-center justify-center w-full text-center min-h-[calc(100vh-6rem)]">
          <div className="flex flex-col items-center justify-center w-full">
            {/* 3D Coin Logo */}
            <div className="mb-8 perspective-1000 flex justify-center w-full">
              <div
                className={`coin-container w-64 h-64 md:w-80 md:h-80 animate-coin-flip transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
                style={{ opacity: mounted ? 1 : 0 }}
              >
                {/* Back layers for depth with logo */}
                <div className="coin-layer coin-back-4">
                  <img
                    src="/logo.png"
                    alt="INWO Logo Back"
                    className="w-full h-full object-contain opacity-20 transform scale-x-[-1]"
                  />
                </div>
                <div className="coin-layer coin-back-3">
                  <img
                    src="/logo.png"
                    alt="INWO Logo Back"
                    className="w-full h-full object-contain opacity-30 transform scale-x-[-1]"
                  />
                </div>
                <div className="coin-layer coin-back-2">
                  <img
                    src="/logo.png"
                    alt="INWO Logo Back"
                    className="w-full h-full object-contain opacity-40 transform scale-x-[-1]"
                  />
                </div>
                <div className="coin-layer coin-back-1">
                  <img
                    src="/logo.png"
                    alt="INWO Logo Back"
                    className="w-full h-full object-contain opacity-60 transform scale-x-[-1]"
                  />
                </div>
                {/* Main coin face */}
                <div className="coin-layer coin-front">
                  <img src="/logo.png" alt="INWO Logo" className="w-full h-full object-contain" />
                  {/* Shine effect */}
                  <div className="coin-shine"></div>
                </div>
                {/* Edge highlight */}
                <div className="coin-edge"></div>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-mono mb-4 bg-gradient-to-r from-[#FF324A] to-[#FFBA56] bg-clip-text text-transparent glitch-effect relative select-none">
              <span className="glitch-text" data-text="ILLUMINATI">ILLUMINATI</span>
            </h1>
          </div>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-400 max-w-2xl mx-auto px-4 mb-8">
            New World Order - The Ultimate Conspiracy Card Game
          </p>
          {/* Animated arrow removed */}
        </div>
      </section>

      {/* About Section */}
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

      {/* Factions Section */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-[#FF324A] font-mono">
          Factions in the Game
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {factions.map((faction, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-900 to-black border border-[#FF324A]/20 rounded-xl p-6 text-center transition-all duration-300 hover:border-[#FF324A] hover:shadow-lg hover:shadow-[#FF324A]/20 hover:-translate-y-2 group relative overflow-hidden cursor-pointer"
            >
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF324A]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />

              <div className="relative w-full max-w-full mx-auto mb-4 flex items-center justify-center overflow-hidden rounded-md aspect-[8/5]">
                <img // Changed from Image to img
                  src={faction.imageUrl || "/placeholder.svg"}
                  alt={`${faction.name} card`}
                  width={200} // Native img width attribute
                  height={125} // Native img height attribute
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#FF324A] font-mono">{faction.name}</h3>
              <p className="text-gray-400 leading-relaxed line-clamp-3">{faction.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 md:px-8 bg-black overflow-hidden">
        <div className="absolute inset-0 footer-background-image"></div>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div> {/* Dark overlay and blur */}
        <div className="relative z-10 text-center text-gray-400">
          <p className="text-lg font-mono mb-4 text-[#FF324A]">INWO - Illuminati: New World Order</p>
          <p>&copy; {new Date().getFullYear()} All Rights Reserved. The Conspiracy Continues.</p>
          <div className="flex justify-center space-x-6 mt-6">
            <Link href="#" className="hover:text-[#FF324A] transition-colors cursor-pointer">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-[#FF324A] transition-colors cursor-pointer">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-[#FF324A] transition-colors cursor-pointer">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .hero-grid-overlay {
          position: absolute;
          inset: 0;
          background-image: 
            repeating-linear-gradient(0deg, rgba(255, 186, 86, 0.05) 0px, transparent 1px, transparent 20px),
            repeating-linear-gradient(90deg, rgba(255, 186, 86, 0.05) 0px, transparent 1px, transparent 20px);
          background-size: 20px 20px;
          opacity: 0.2;
          animation: grid-pulse 10s infinite alternate ease-in-out;
          pointer-events: none;
          z-index: 0; /* Ensure it's behind content but above base background */
        }

        @keyframes grid-pulse {
          0% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.01); }
          100% { opacity: 0.1; transform: scale(1); }
        }

        .perspective-1000 {
          perspective: 1200px;
          perspective-origin: center center;
        }

        .coin-container {
          position: relative;
          transform-style: preserve-3d;
        }

        .coin-layer {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, #4a4a4a 0%, #2a2a2a 50%, #1a1a1a 100%);
          border: 2px solid #666;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden; /* Ensure shine stays within bounds */
        }

        .coin-back-4 {
          transform: translateZ(-8px);
          background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
          border-color: #333;
        }

        .coin-back-3 {
          transform: translateZ(-6px);
          background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
          border-color: #444;
        }

        .coin-back-2 {
          transform: translateZ(-4px);
          background: linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%);
          border-color: #555;
        }

        .coin-back-1 {
          transform: translateZ(-2px);
          background: linear-gradient(135deg, #4a4a4a 0%, #3a3a3a 100%);
          border-color: #666;
        }

        .coin-front {
          transform: translateZ(0px);
          background: linear-gradient(135deg, #6a6a6a 0%, #4a4a4a 50%, #3a3a3a 100%);
          border: 2px solid #777;
          box-shadow: 
            inset 0 2px 4px rgba(255, 255, 255, 0.1),
            inset 0 -2px 4px rgba(0, 0, 0, 0.3),
            0 4px 8px rgba(0, 0, 0, 0.3);
          position: relative; /* For shine positioning */
        }

        .coin-front img {
          position: relative;
          z-index: 1; /* Ensure image is above shine */
        }

        .coin-shine {
          position: absolute;
          top: 0;
          left: -100%; /* Start off-screen to the left */
          width: 50%; /* Width of the shine */
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transform: skewX(-20deg); /* Angle the shine */
          animation: shine 3s infinite linear;
          animation-delay: 0s; /* Start immediately */
          z-index: 0; /* Behind the image */
        }

        @keyframes shine {
          0% {
            left: -100%;
          }
          100% {
            left: 150%; /* Move across and off-screen to the right */
          }
        }

        .coin-edge {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 102%;
          height: 102%;
          border-radius: 50%;
          transform: translate(-50%, -50%) translateZ(-1px);
          background: linear-gradient(90deg, #333 0%, #666 50%, #333 100%);
          opacity: 0.6;
        }

        .animate-coin-flip {
          animation: coinFlip 15s infinite linear; /* Speed up the animation */
        }

        @keyframes coinFlip {
          0% { 
            transform: rotateY(0deg) rotateX(15deg);
          }
          25% { 
            transform: rotateY(90deg) rotateX(25deg);
          }
          50% { 
            transform: rotateY(180deg) rotateX(15deg);
          }
          75% { 
            transform: rotateY(270deg) rotateX(5deg);
          }
          100% { 
            transform: rotateY(360deg) rotateX(15deg);
          }
        }

        /* Glitch effect for the title */
        .glitch-text {
          position: relative;
          color: inherit;
        }
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          left: 0;
          width: 100%;
          color: #FF324A;
          z-index: 1;
          opacity: 0.7;
          pointer-events: none;
        }
        .glitch-text::before {
          animation: glitchTop 2.5s infinite linear alternate-reverse;
          top: 0;
          text-shadow: 1px 0 #FF324A, 2px 1px #FFBA56;
        }
        .glitch-text::after {
          animation: glitchBottom 2.5s infinite linear alternate-reverse;
          bottom: 0;
          text-shadow: -1px 0 #FFBA56, -2px -1px #FF324A;
        }
        @keyframes glitchTop {
          0% { transform: translate(0, 0); opacity: 0.7; }
          10% { transform: translate(-1px, -1px); opacity: 0.8; }
          20% { transform: translate(-2px, 1px); opacity: 0.6; }
          30% { transform: translate(1px, -0.5px); opacity: 0.8; }
          40% { transform: translate(-0.5px, 1px); opacity: 0.7; }
          50% { transform: translate(0, 0); opacity: 0.7; }
          100% { transform: translate(0.5px, -0.5px); opacity: 0.8; }
        }
        @keyframes glitchBottom {
          0% { transform: translate(0, 0); opacity: 0.7; }
          10% { transform: translate(1px, 1px); opacity: 0.8; }
          20% { transform: translate(2px, -1px); opacity: 0.6; }
          30% { transform: translate(-1px, 0.5px); opacity: 0.8; }
          40% { transform: translate(0.5px, -1px); opacity: 0.7; }
          50% { transform: translate(0, 0); opacity: 0.7; }
          100% { transform: translate(-0.5px, 0.5px); opacity: 0.8; }
        }

        /* Footer background image styling */
        .footer-background-image {
          background-image: url('/footer-background.jpeg');
          background-size: cover;
          background-position: center;
          filter: blur(3px) grayscale(50%);
          opacity: 0.3;
          transform: scale(1.05);
        }
        .chaos-bg {
          pointer-events: none;
          z-index: 0;
        }
        .chaos-bg::before, .chaos-bg::after {
          content: none;
        }
      `}</style>
    </div>
  )
}
