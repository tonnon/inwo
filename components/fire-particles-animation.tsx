"use client"

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speed: number
  color: string
  alpha: number
  directionFactor: number
  lifeSpan: number
}

export default function FireParticlesAnimation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const widthRef = useRef<number>(0)
  const heightRef = useRef<number>(0)
  const animationIdRef = useRef<number | undefined>(undefined)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    let ctx: CanvasRenderingContext2D | null = null
    const particles: Particle[] = []
    particlesRef.current = particles
    
    // Setup canvas context
    ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return
    
    // Resize function
    const resize = () => {
      if (!canvas) return
      const parent = canvas.parentElement
      if (parent) {
        widthRef.current = parent.clientWidth
        heightRef.current = parent.clientHeight
      } else {
        widthRef.current = window.innerWidth
        heightRef.current = window.innerHeight
      }
      canvas.width = widthRef.current
      canvas.height = heightRef.current
    }
    
    resize()
    window.addEventListener('resize', resize)
    
    // Create a particle
    const createParticle = (): Particle => {
      // Default random position (will be overwritten during initialization)
      const x = Math.random() * widthRef.current
      const y = Math.random() * heightRef.current
      
      // Size variation
      const sizeType = Math.random()
      let size
      if (sizeType < 0.7) {
        // 70% are small to medium
        size = 0.8 + Math.random() * 2.5
      } else if (sizeType < 0.95) {
        // 25% are medium
        size = 2.5 + Math.random() * 2
      } else {
        // 5% are large/highlighted
        size = 3.5 + Math.random() * 2
      }
      
      // Speed variation
      const speedVariation = Math.random()
      const speed = 0.2 + speedVariation * 1.2
      
      // Alpha (transparency) variation
      const alpha = 0.25 + Math.random() * 0.65
      
      // Color variation
      const colorType = Math.random()
      let redValue, greenValue, blueValue
      
      if (colorType < 0.7) {
        // 70% standard orange-red
        redValue = 255
        greenValue = Math.floor(70 + Math.random() * 150)
        blueValue = Math.floor(Math.random() * 70)
      } else if (colorType < 0.9) {
        // 20% more yellowish
        redValue = 255
        greenValue = Math.floor(150 + Math.random() * 105)
        blueValue = Math.floor(Math.random() * 50)
      } else {
        // 10% more intense red
        redValue = 255
        greenValue = Math.floor(40 + Math.random() * 70)
        blueValue = Math.floor(Math.random() * 40)
      }
      
      const color = `rgba(${redValue},${greenValue},${blueValue},${alpha})`
      
      // Direction factor for movement variability
      const directionFactor = 0.75 + Math.random() * 0.5
      
      // Infinite lifespan
      const lifeSpan = Infinity
      
      return { x, y, size, speed, color, alpha, directionFactor, lifeSpan }
    }
    
    // Draw particles on canvas
    const drawParticles = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, widthRef.current, heightRef.current)
      
      // Draw each particle with glow effect
      for (let p of particles) {
        // Only draw if it has some visibility
        if (p.alpha <= 0.01) continue
        
        // Adjust glow based on transparency
        const shadowIntensity = Math.min(p.alpha * 1.5, 1)
        
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI)
        
        // Update color with current alpha
        if (p.color.startsWith('rgba')) {
          const colorParts = p.color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/)
          if (colorParts) {
            const r = colorParts[1]
            const g = colorParts[2]
            const b = colorParts[3]
            p.color = `rgba(${r}, ${g}, ${b}, ${p.alpha})`
          }
        }
        
        ctx.fillStyle = p.color
        
        // Glow effect
        ctx.shadowColor = '#FFBA56'
        ctx.shadowBlur = (6 + p.size * 2) * shadowIntensity
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
        
        ctx.fill()
        
        // Inner circle for larger particles
        if (p.size > 2.8) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 0.6, 0, 2 * Math.PI)
          ctx.fillStyle = `rgba(255, 220, 160, ${p.alpha * 0.8})`
          ctx.fill()
        }
      }
    }
    
    // Update particle positions and properties
    const updateParticles = () => {
      for (let p of particles) {
        // Add direction factor if missing
        if (!p.directionFactor) p.directionFactor = 0.8 + Math.random() * 0.4
        if (!p.lifeSpan) p.lifeSpan = Infinity
        
        // Movement with variability
        p.y += p.speed * p.directionFactor * (0.7 + Math.random() * 0.6)
        p.x -= p.speed * (0.5 + Math.random() * 1.0)
        
        // Random variations for natural movement
        if (Math.random() < 0.06) {
          p.x += (Math.random() - 0.5) * 3.0
          p.y += (Math.random() - 0.5) * 2.0
          
          if (Math.random() < 0.25) {
            p.directionFactor += (Math.random() - 0.5) * 0.15
            p.directionFactor = Math.max(0.5, Math.min(1.5, p.directionFactor))
          }
        }
        
        // Slow fade
        p.alpha -= 0.0004 + Math.random() * 0.0004
        
        // Subtle size reduction
        p.size *= 0.9998
        
        // Occasional pulse effect
        if (Math.random() < 0.01) {
          if (Math.random() < 0.5) {
            // Increase size
            p.size *= 1.05
            p.size = Math.min(p.size, 6)
          } else {
            // Increase alpha
            p.alpha += 0.05
            p.alpha = Math.min(p.alpha, 0.9)
          }
        }
      }
      
      // Reposition particles that went out of bounds
      const particlesCount = particles.length
      const targetCount = 350
      
      for (let i = 0; i < particlesCount; i++) {
        let p = particles[i]
        
        // Check if particle needs repositioning
        if (p.x <= -30 || p.y >= heightRef.current + 30 || p.alpha <= 0.05 || p.size <= 0.5) {
          const oldSize = p.size
          const oldSpeed = p.speed
          const oldDirectionFactor = p.directionFactor
          
          // Decide where to reposition
          const randomEntry = Math.random()
          
          if (randomEntry < 0.4) {
            // 40% re-enter from off-screen edges
            const entryPoint = Math.random()
            if (entryPoint < 0.4) {
              // 40% enter from the top
              p.x = Math.random() * widthRef.current
              p.y = -oldSize * 2
            } else if (entryPoint < 0.7) {
              // 30% enter from the right
              p.x = widthRef.current + oldSize * 2
              p.y = Math.random() * heightRef.current
            } else if (entryPoint < 0.85) {
              // 15% enter from the left
              p.x = -oldSize * 2
              p.y = Math.random() * (heightRef.current * 0.7)
            } else {
              // 15% enter from the bottom
              p.x = Math.random() * widthRef.current
              p.y = heightRef.current + oldSize * 2
            }
            p.alpha = 0.3 + Math.random() * 0.4
          } else {
            // 60% are repositioned within the screen
            const screenZone = Math.random()
            if (screenZone < 0.25) {
              // Upper left quadrant
              p.x = Math.random() * (widthRef.current * 0.5)
              p.y = Math.random() * (heightRef.current * 0.5)
            } else if (screenZone < 0.5) {
              // Upper right quadrant
              p.x = (widthRef.current * 0.5) + Math.random() * (widthRef.current * 0.5)
              p.y = Math.random() * (heightRef.current * 0.5)
            } else if (screenZone < 0.75) {
              // Lower left quadrant
              p.x = Math.random() * (widthRef.current * 0.5)
              p.y = (heightRef.current * 0.5) + Math.random() * (heightRef.current * 0.5)
            } else {
              // Lower right quadrant
              p.x = (widthRef.current * 0.5) + Math.random() * (widthRef.current * 0.5)
              p.y = (heightRef.current * 0.5) + Math.random() * (heightRef.current * 0.5)
            }
            p.alpha = 0.01 + Math.random() * 0.05
          }
          
          // Update color
          const greenValue = Math.floor(70 + Math.random() * 150)
          const blueValue = Math.floor(Math.random() * 70)
          p.color = `rgba(255,${greenValue},${blueValue},${p.alpha})`
          
          // Update other properties with small variations
          p.size = oldSize * (0.9 + Math.random() * 0.2)
          p.speed = oldSpeed * (0.9 + Math.random() * 0.2)
          p.directionFactor = oldDirectionFactor * (0.95 + Math.random() * 0.1)
        }
      }
      
      // Add particles if needed
      if (particles.length < targetCount) {
        const diff = targetCount - particles.length
        for (let i = 0; i < diff; i++) {
          const particle = createParticle()
          particle.alpha = 0.01 // Start almost invisible
          particles.push(particle)
        }
      }
    }
    
    // Animation loop
    const animate = () => {
      updateParticles()
      drawParticles()
      animationIdRef.current = requestAnimationFrame(animate)
    }
    
    // Initialize particles
    const initializeParticles = () => {
      const totalParticles = 350
      
      // Divide particles into quadrants
      const quadrantes = [
        { count: Math.floor(totalParticles * 0.25), x1: 0, x2: widthRef.current * 0.5, y1: 0, y2: heightRef.current * 0.5 }, 
        { count: Math.floor(totalParticles * 0.25), x1: widthRef.current * 0.5, x2: widthRef.current, y1: 0, y2: heightRef.current * 0.5 }, 
        { count: Math.floor(totalParticles * 0.25), x1: 0, x2: widthRef.current * 0.5, y1: heightRef.current * 0.5, y2: heightRef.current }, 
        { count: Math.floor(totalParticles * 0.25), x1: widthRef.current * 0.5, x2: widthRef.current, y1: heightRef.current * 0.5, y2: heightRef.current }, 
      ]
      
      // Initialize particles in each quadrant
      for (const q of quadrantes) {
        for (let i = 0; i < q.count; i++) {
          const particle = createParticle()
          
          // Position within the quadrant
          particle.x = q.x1 + Math.random() * (q.x2 - q.x1)
          particle.y = q.y1 + Math.random() * (q.y2 - q.y1)
          
          // Initial visibility
          particle.alpha = 0.2 + Math.random() * 0.7
          
          // Size variation
          particle.size = 1 + Math.random() * 3
          
          // Color variation
          const greenValue = Math.floor(70 + Math.random() * 150)
          const blueValue = Math.floor(Math.random() * 70)
          particle.color = `rgba(255, ${greenValue}, ${blueValue}, ${particle.alpha})`
          
          // Speed variation
          particle.speed = 0.3 + Math.random() * 1.1
          
          // Direction factor
          particle.directionFactor = 0.8 + Math.random() * 0.4
          
          particles.push(particle)
        }
      }
      
      // Fill any remaining particles
      while (particles.length < totalParticles) {
        const particle = createParticle()
        
        // Random position
        particle.x = Math.random() * widthRef.current
        particle.y = Math.random() * heightRef.current
        
        // Initial transparency
        particle.alpha = 0.2 + Math.random() * 0.7
        
        particles.push(particle)
      }
    }
    
    // Start the animation
    initializeParticles()
    animate()
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', resize)
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)
    }
  }, [])
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full block" 
      style={{position: 'absolute', inset: 0}} 
    />
  )
}
