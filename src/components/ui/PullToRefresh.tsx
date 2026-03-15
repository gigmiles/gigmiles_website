'use client';

import React, { useState, useRef, TouchEvent } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const threshold = 80;
  
  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    if (window.scrollY === 0 && startY.current > 0) {
      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startY.current);
      setPullDistance(Math.min(distance, threshold * 1.5));
      
      if (distance > threshold) {
        Haptics.impact({ style: ImpactStyle.Light });
      }
    }
  };
  
  const handleTouchEnd = async () => {
    if (pullDistance > threshold && !refreshing) {
      setRefreshing(true);
      await Haptics.impact({ style: ImpactStyle.Medium });
      await onRefresh();
      setRefreshing(false);
    }
    setPullDistance(0);
    startY.current = 0;
  };
  
  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex justify-center transition-all z-10"
        style={{
          transform: `translateY(${pullDistance - 40}px)`,
          opacity: pullDistance / threshold,
        }}
      >
        <div className="bg-background rounded-full p-2 shadow-md border border-border">
          {refreshing ? (
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <div 
              className="w-6 h-6 transition-transform text-foreground flex items-center justify-center font-bold"
              style={{ 
                transform: `rotate(${(pullDistance / threshold) * 180}deg)` 
              }}
            >
              ↓
            </div>
          )}
        </div>
      </div>
      
      {children}
    </div>
  );
}
