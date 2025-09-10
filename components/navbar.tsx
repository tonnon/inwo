"use client"

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    
    window.addEventListener("scroll", handleScroll)
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
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
  )
}
