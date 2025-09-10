"use client"

import '@/styles/shared.css'

type GlitchTitleProps = {
  text: string
}

export default function GlitchTitle({ text }: GlitchTitleProps) {
  return (
    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-mono mb-4 bg-gradient-to-r from-[#FF324A] to-[#FFBA56] bg-clip-text text-transparent glitch-effect relative select-none">
      <span className="glitch-text" data-text={text}>{text}</span>
    </h1>
  )
}
