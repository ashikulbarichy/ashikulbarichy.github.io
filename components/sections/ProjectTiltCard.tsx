'use client'

import React, { useState, useRef } from 'react';

interface ProjectTiltCardProps {
  image: string;
  title: string;
  category: string;
  date: string;
}

/**
 * ProjectTiltCard
 *
 * A polaroid-style card with a 3-D mouse-tracked tilt effect used in the
 * Featured Projects section carousel.
 */
const ProjectTiltCard: React.FC<ProjectTiltCardProps> = ({
  image,
  title,
  category,
  date,
}) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    setTilt({ x: x * 15, y: y * -15 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="bg-white text-black p-4 sm:p-5 w-[465px] sm:w-[555px] md:w-[645px] max-w-[90%] md:max-w-[85%] shadow-[0_25px_50px_-12px_rgba(255,255,255,0.05)] border border-zinc-200/80 flex flex-col rounded-sm cursor-none select-none transition-transform duration-200 ease-out"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale3d(1.02, 1.02, 1.02)`,
      }}
    >
      {/* Image slot */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-zinc-100 border border-zinc-200/50 mb-4 rounded-sm">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover pointer-events-none"
        />
      </div>

      {/* Meta row */}
      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between items-center text-[10px] uppercase font-mono text-zinc-400">
          <span>{category}</span>
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectTiltCard;
