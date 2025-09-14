'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ApocalypticSky() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flameCanvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    let width: number;
    let height: number;
    
    // Cloud particles at the top
    const clouds: {
      x: number;
      y: number;
      radius: number;
      opacity: number;
      speed: number;
    }[] = [];
    
    // Ember particles floating around
    const embers: {
      x: number;
      y: number;
      size: number;
      speed: number;
      color: string;
      alpha: number;
    }[] = [];
    
    // Set up canvas and create particles
    const init = () => {
      // Set canvas dimensions
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      // Create clouds at the top
      clouds.length = 0;
      for (let i = 0; i < 15; i++) {
        clouds.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.3), // Top 30% of screen
          radius: Math.random() * 80 + 40,
          opacity: Math.random() * 0.4 + 0.2,
          speed: Math.random() * 0.2 + 0.05
        });
      }
      
      // Create ember particles
      embers.length = 0;
      for (let i = 0; i < 120; i++) {
        embers.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 3 + 0.5,
          speed: Math.random() * 0.5 + 0.2,
          color: getEmberColor(),
          alpha: Math.random() * 0.5 + 0.2
        });
      }
    };
    
    // Generate a random ember color
    const getEmberColor = () => {
      const r = 255;
      const g = Math.floor(Math.random() * 120 + 60);
      const b = Math.floor(Math.random() * 50);
      return `rgb(${r},${g},${b})`;
    };

    // Three.js flame setup
    let flameRenderer: THREE.WebGLRenderer;
    let flameScene: THREE.Scene;
    let flameCamera: THREE.PerspectiveCamera;
    let flameMaterial: THREE.ShaderMaterial;
    let flameMesh: THREE.Mesh;

    const initFlame = () => {
      const flameCanvas = flameCanvasRef.current;
      if (!flameCanvas) return;

      // Vertex shader
      const vertexShader = `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
        }
      `;

      // Fragment shader for flame effect (from your reference script)
      const fragmentShader = `
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        varying vec2 vUv;

        float random (in vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        float noise (in vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        #define OCTAVES 6
        float fbm (in vec2 st) {
          float value = 0.0;
          float amplitude = .5;
          float frequency = 0.;
          for (int i = 0; i < OCTAVES; i++) {
            value += amplitude * noise(st);
            st *= 2.;
            amplitude *= .5;
          }
          return value;
        }

        void main() {
          float velocity = 60.001;
          float scale = 0.01;
          float brightness = 0.8;
          float shift = 1.0;

          vec2 customFragCoord = vec2(gl_FragCoord.x, gl_FragCoord.y - uTime * velocity) * scale;
          float noise1 = fbm(customFragCoord);
          float noise2 = brightness * (fbm(customFragCoord + noise1 - (uTime / 6.0)) * shift);

          vec3 verticalGradient = vec3(4.0 * gl_FragCoord.y / uResolution.y) - 0.5;
          
          vec3 color = mix(uColor1 / 255.0, uColor2 / 255.0, noise2);
          vec3 fire = color - verticalGradient - noise2 + noise1;
          
          // Calculate alpha based on flame intensity
          float flameIntensity = max(0.0, fire.r + fire.g + fire.b - verticalGradient.r);
          float alpha = clamp(flameIntensity * 2.0, 0.0, 1.0);
          
          gl_FragColor = vec4(fire, alpha);
        }
      `;

      // Setup Three.js renderer for bottom flame area
      flameRenderer = new THREE.WebGLRenderer({ 
        canvas: flameCanvas,
        alpha: true,
        antialias: true
      });
      flameRenderer.setPixelRatio(window.devicePixelRatio);
      flameRenderer.setSize(width, height * 0.33); // Bottom third of screen
      flameRenderer.setClearColor(0x000000, 0); // Transparent background

      // Setup camera
      flameCamera = new THREE.PerspectiveCamera(75, width / (height * 0.33), 0.1, 1000);
      flameCamera.position.set(0, 0, 1);

      // Setup scene
      flameScene = new THREE.Scene();

      // Create geometry - much larger plane to ensure full coverage
      const geometry = new THREE.PlaneGeometry(4, 4, 1, 1);

      // Create material with flame shader
      flameMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uResolution: { value: new THREE.Vector2(width, height * 0.33) },
          uTime: { value: 0 },
          uColor1: { value: new THREE.Vector3(255, 203, 107) }, // Orange
          uColor2: { value: new THREE.Vector3(255, 82, 83) }    // Red
        },
        vertexShader,
        fragmentShader,
        transparent: true
      });

      // Create mesh
      flameMesh = new THREE.Mesh(geometry, flameMaterial);
      flameScene.add(flameMesh);

      // Scale mesh to cover full width and beyond
      const flameHeight = height * 0.33;
      flameMesh.scale.x = (width / flameHeight) * 1.5; // Extra width to ensure coverage
      flameMesh.scale.y = 1.5; // Extra height to ensure coverage
    };

    const updateFlame = () => {
      if (!flameMaterial || !flameRenderer || !flameScene || !flameCamera) return;
      
      flameMaterial.uniforms.uTime.value += 0.02; // Slower animation (was 0.05)
      flameRenderer.render(flameScene, flameCamera);
    };

    const resizeFlame = () => {
      if (!flameRenderer || !flameCamera || !flameMaterial || !flameMesh) return;

      const flameHeight = height * 0.33;
      flameRenderer.setSize(width, flameHeight);
      
      flameCamera.aspect = width / flameHeight;
      flameCamera.fov = 75;
      flameCamera.updateProjectionMatrix();
      
      // Scale to cover full width and beyond
      flameMesh.scale.x = (width / flameHeight) * 1.5;
      flameMesh.scale.y = 1.5;
      
      flameMaterial.uniforms.uResolution.value.x = width;
      flameMaterial.uniforms.uResolution.value.y = flameHeight;
    };
    
    // Draw the apocalyptic sky
    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw background gradient - more black, less red
      const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
      skyGradient.addColorStop(0, '#000000'); // Pure black at the top
      skyGradient.addColorStop(0.5, '#050000'); // Very subtle dark red
      skyGradient.addColorStop(0.8, '#120000'); // Still very dark with hint of red
      skyGradient.addColorStop(0.95, '#300000'); // Dark red near the bottom
      skyGradient.addColorStop(1, '#500000'); // Less intense red at the very bottom
      
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, width, height);
      
      // Draw clouds at the top
      clouds.forEach(cloud => {
        cloud.x += cloud.speed;
        if (cloud.x > width + cloud.radius) {
          cloud.x = -cloud.radius;
        }
        
        ctx.save();
        ctx.globalAlpha = cloud.opacity;
        const gradient = ctx.createRadialGradient(
          cloud.x, cloud.y, 0,
          cloud.x, cloud.y, cloud.radius
        );
        
        gradient.addColorStop(0, 'rgba(20, 2, 2, 0.7)');
        gradient.addColorStop(0.5, 'rgba(30, 5, 5, 0.5)');
        gradient.addColorStop(1, 'rgba(10, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      
      // Draw ember particles
      embers.forEach(ember => {
        ember.y -= ember.speed;
        ember.x += Math.sin(ember.y * 0.01) * 0.3;
        
        if (ember.y < -10) {
          ember.y = height + 10;
          ember.x = Math.random() * width;
        }
        
        ctx.save();
        ctx.globalAlpha = ember.alpha;
        ctx.fillStyle = ember.color;
        ctx.shadowColor = ember.color;
        ctx.shadowBlur = 5;
        
        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      
      // Update flame animation
      updateFlame();
    };
    
    // Animation loop
    const animate = () => {
      draw();
      animationId = requestAnimationFrame(animate);
    };
    
    // Handle window resize
    const handleResize = () => {
      init();
      resizeFlame();
    };
    
    // Initialize and start animation
    init();
    initFlame();
    animate();
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (flameRenderer) {
        flameRenderer.dispose();
      }
    };
  }, []);
  
  return (
    <div className="absolute inset-0 w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      />
      <canvas
        ref={flameCanvasRef}
        className="absolute bottom-0 left-0 w-full h-1/3 pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}
