import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import './LoadingScreen.css';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bypassRef = useRef<HTMLButtonElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Track mouse coordinates for interactive globe tilt
  const handleMouseMove = (e: MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      // Get normalized mouse position (-1 to 1)
      mouseRef.current = {
        x: (e.clientX - rect.left - cx) / cx,
        y: (e.clientY - rect.top - cy) / cy,
      };
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Tick the progress loader automatically
  useEffect(() => {
    let currentProgress = 0;
    intervalRef.current = setInterval(() => {
      const increment = Math.floor(Math.random() * 5) + 2;
      currentProgress = Math.min(100, currentProgress + increment);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Speed up/Bypass sequence instantly
  const handleBypass = () => {
    if (progress >= 100) return;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (bypassRef.current) {
      bypassRef.current.disabled = true;
      bypassRef.current.innerText = 'BYPASSING';
    }

    const obj = { value: progress };
    gsap.to(obj, {
      value: 100,
      duration: 0.35,
      ease: 'power2.out',
      onUpdate: () => {
        setProgress(Math.floor(obj.value));
      }
    });
  };

  // Handle completion GSAP reveal transition
  useEffect(() => {
    if (progress === 100) {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.inOut',
        onComplete: onComplete
      });
    }
  }, [progress, onComplete]);

  // 3D Wireframe Mesh World Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const R = 60; // Radius of the globe
    const fov = 350; // Perspective focal length

    // Precompute 3D points on a grid
    const latBands = 8;
    const lonBands = 14;
    const points: { x: number; y: number; z: number }[][] = [];

    for (let i = 0; i <= latBands; i++) {
      const theta = (i / latBands) * Math.PI - Math.PI / 2;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      const bandPoints = [];

      for (let j = 0; j < lonBands; j++) {
        const phi = (j / lonBands) * Math.PI * 2;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const x = R * cosTheta * cosPhi;
        const y = R * sinTheta;
        const z = R * cosTheta * sinPhi;

        bandPoints.push({ x, y, z });
      }
      points.push(bandPoints);
    }

    let angleX = -0.3; // Initial tilt
    let angleY = 0; // Rotate speed accumulator

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Smoothly interpolate angles with mouse position
      const targetAngleX = -0.3 + mouseRef.current.y * 0.4;
      const targetAngleY = angleY + 0.006 + mouseRef.current.x * 0.02;
      
      angleX += (targetAngleX - angleX) * 0.1;
      angleY = targetAngleY; // Keep rotating

      // Keep Y-rotation between 0 and 2*PI
      if (angleY > Math.PI * 2) {
        angleY -= Math.PI * 2;
      }

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      // Projects all points to 2D screen coordinates
      const projectedPoints: { px: number; py: number; z: number }[][] = [];

      for (let i = 0; i <= latBands; i++) {
        const band = points[i];
        const projectedBand = [];

        for (let j = 0; j < lonBands; j++) {
          const pt = band[j];

          // Rotate around Y axis
          const x1 = pt.x * cosY - pt.z * sinY;
          const z1 = pt.x * sinY + pt.z * cosY;

          // Rotate around X axis
          const y2 = pt.y * cosX - z1 * sinX;
          const z2 = pt.y * sinX + z1 * cosX;

          // Perspective projection
          const scale = fov / (fov + z2);
          const px = x1 * scale + cx;
          const py = y2 * scale + cy;

          projectedBand.push({ px, py, z: z2 });
        }
        projectedPoints.push(projectedBand);
      }

      // Draw wireframe line segments with depth-shading
      ctx.lineWidth = 0.6;

      for (let i = 0; i <= latBands; i++) {
        for (let j = 0; j < lonBands; j++) {
          const p1 = projectedPoints[i][j];
          
          // Connect to next point on the same latitude circle
          const nextJ = (j + 1) % lonBands;
          const p2 = projectedPoints[i][nextJ];
          
          // Connect to point on the next latitude band
          const nextI = i + 1;
          const p3 = nextI <= latBands ? projectedPoints[nextI][j] : null;

          // Helper to draw segment with Z-depth styling
          const drawSegment = (ptA: typeof p1, ptB: typeof p1) => {
            const avgZ = (ptA.z + ptB.z) / 2;
            
            // Front-facing lines are brighter white, back-facing lines are faint
            let alpha = 0;
            if (avgZ < 0) {
              alpha = 0.15 + (Math.abs(avgZ) / R) * 0.45; // 0.15 to 0.60
            } else {
              alpha = 0.15 - (avgZ / R) * 0.12; // 0.03 to 0.15
            }

            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(ptA.px, ptA.py);
            ctx.lineTo(ptB.px, ptB.py);
            ctx.stroke();
          };

          drawSegment(p1, p2);
          if (p3) {
            drawSegment(p1, p3);
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Determine minimal status text based on progress
  const getStatusText = () => {
    if (progress < 30) return 'CONFIGURING CORES';
    if (progress < 65) return 'LOADING PORTFOLIO DATA';
    if (progress < 90) return 'DECRYPTING MEDIA';
    if (progress < 100) return 'FINALIZING INTERFACE';
    return 'BOOT COMPLETE';
  };

  return (
    <div 
      ref={containerRef}
      className="loading-screen-overlay"
    >
      <div className="loader-center-box">
        
        {/* Rotating 3D Mesh World Canvas */}
        <div className="canvas-wrapper">
          <canvas 
            ref={canvasRef} 
            width="180" 
            height="180"
            className="globe-canvas"
          />
        </div>

        {/* Minimal Progress Bar and Stats */}
        <div className="progress-container w-64">
          <div className="flex justify-between items-baseline font-mono text-[9px] text-zinc-500 uppercase tracking-widest mb-2">
            <span>{getStatusText()}</span>
            <span className="text-white font-medium">{progress}%</span>
          </div>

          {/* Horizontal Bar */}
          <div className="progress-track w-full h-[1.5px] bg-zinc-900 overflow-hidden relative">
            <div 
              className="progress-fill h-full bg-white transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Bypass Action Button */}
        <button
          ref={bypassRef}
          onClick={handleBypass}
          className="bypass-button font-mono text-[9px] uppercase tracking-[0.2em] mt-2"
          disabled={progress >= 100}
        >
          {progress < 100 ? '[ BYPASS SEQUENCE ]' : '[ ACCESS GRANTED ]'}
        </button>

      </div>
    </div>
  );
};

export default LoadingScreen;
