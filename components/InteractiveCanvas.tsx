'use client'

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  targetAlpha: number;
  fadeSpeed: number;
  amplitude: number;
  frequency: number;
  phase: number;
  depth: number;
}

interface InteractiveCanvasProps {
  particlesCount?: number;
}

const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({ particlesCount = 80 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);
    let isVisible = false;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const mouse = { x: -1000, y: -1000, active: false };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.active = false;
    };

    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove);
      parent.addEventListener('mouseleave', handleMouseLeave);
    }

    // Initialize dust particles
    const particles: Particle[] = [];
    
    const createParticle = (yPos?: number, initAlpha = false): Particle => {
      const depth = Math.random() * 0.9 + 0.1; // 0.1 to 1.0 (scales size, speed, and opacity)
      return {
        x: Math.random() * width,
        y: yPos !== undefined ? yPos : Math.random() * height,
        vx: (Math.random() - 0.5) * 0.1 * depth,
        vy: -(Math.random() * 0.2 + 0.05) * depth, // slow upward drift
        radius: (Math.random() * 1.5 + 0.5) * depth, // 0.5px to 2px based on depth
        alpha: initAlpha ? 0.1 : 0,
        targetAlpha: 0.1,
        fadeSpeed: 0.003 + Math.random() * 0.004,
        amplitude: Math.random() * 0.2 + 0.05,
        frequency: 0.0008 + Math.random() * 0.001,
        phase: Math.random() * Math.PI * 2,
        depth,
      };
    };

    // Fill initial particles
    for (let i = 0; i < particlesCount; i++) {
      particles.push(createParticle(undefined, true));
    }

    let time = 0;
    let lastTime = performance.now();
    const draw = () => {
      if (!isVisible) return;
      ctx.clearRect(0, 0, width, height);
      
      const now = performance.now();
      let dt = (now - lastTime) / 16.666; // Normalize to 60fps
      lastTime = now;

      // Cap delta time to prevent huge jumps when tab is inactive
      if (dt > 4) dt = 4;

      time += 0.015 * dt;

      particles.forEach((p, index) => {
        // 1. Air current / wind drift
        const targetVx = Math.sin(time * p.frequency + p.phase) * p.amplitude * 0.1;
        const targetVy = -0.15 * p.depth; // Base upward speed scaled by depth

        // Smoothly interpolate towards target baseline velocities
        p.vx += (targetVx - p.vx) * 0.02 * dt;
        p.vy += (targetVy - p.vy) * 0.02 * dt;

        // 2. Mouse Interaction (Wind Force pushing motes away)
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const force = (120 - dist) / 120;
            // Push force vector
            const pushX = (dx / (dist || 1)) * force * 1.5 * p.depth;
            const pushY = (dy / (dist || 1)) * force * 1.5 * p.depth;
            
            p.vx += pushX * 0.05 * dt;
            p.vy += pushY * 0.05 * dt;
          }
        }

        // Apply velocities
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // 3. Fading and boundary handling
        if (p.alpha < p.targetAlpha) {
          p.alpha = Math.min(p.targetAlpha, p.alpha + p.fadeSpeed * dt);
        }

        // Calculate opacity factor to fade particles out when near the canvas edges
        let edgeAlpha = 1;
        const margin = 40;
        if (p.x < margin) edgeAlpha = p.x / margin;
        else if (p.x > width - margin) edgeAlpha = (width - p.x) / margin;
        
        if (p.y < margin) edgeAlpha = Math.min(edgeAlpha, p.y / margin);
        else if (p.y > height - margin) edgeAlpha = Math.min(edgeAlpha, (height - p.y) / margin);

        // Render particle
        const finalAlpha = Math.max(0, p.alpha * edgeAlpha);
        ctx.fillStyle = `rgba(255, 255, 255, ${finalAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // 4. Respawn when drifting out of bounds
        if (p.y < -10 || p.x < -10 || p.x > width + 10) {
          particles[index] = createParticle(height + 5);
        }
      });

      animationId = requestAnimationFrame(draw);
    };

    // Intersection Observer to stop animation loop when off-screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          lastTime = performance.now(); // Reset lastTime to avoid huge dt jumps when returning
          cancelAnimationFrame(animationId);
          draw();
        } else {
          cancelAnimationFrame(animationId);
        }
      },
      { threshold: 0.01 } // Trigger immediately when even 1% is visible
    );

    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      if (parent) {
        parent.removeEventListener('mousemove', handleMouseMove);
        parent.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [particlesCount]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
};

export default InteractiveCanvas;
