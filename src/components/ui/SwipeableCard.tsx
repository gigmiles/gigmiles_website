'use client';

import React, { useState, useRef, TouchEvent } from 'react';

interface SwipeableCardProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function SwipeableCard({ children, onEdit, onDelete }: SwipeableCardProps) {
  const [offset, setOffset] = useState(0);
  const startX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const handleTouchStart = (e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    
    // Only allow left swipe
    if (diff < 0) {
      setOffset(Math.max(diff, -160)); // Max swipe 160px
    }
  };
  
  const handleTouchEnd = () => {
    // Snap to position
    if (offset < -80) {
      setOffset(-160); // Show actions
    } else {
      setOffset(0); // Reset
    }
  };
  
  return (
    <div className="relative overflow-hidden rounded-2xl w-full">
      {/* Action buttons (revealed on swipe) */}
      <div className="absolute right-0 top-0 bottom-0 flex z-0 h-full">
        {onEdit && (
          <button
            onClick={onEdit}
            className="w-20 bg-blue-500 text-white flex items-center justify-center font-semibold active:bg-blue-600 transition-colors"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="w-20 bg-destructive text-destructive-foreground flex items-center justify-center font-semibold active:bg-destructive/90 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
      
      {/* Card content (swipeable) */}
      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="transition-transform duration-200 w-full z-10 relative"
        style={{ transform: `translateX(${offset}px)` }}
      >
        {children}
      </div>
    </div>
  );
}
