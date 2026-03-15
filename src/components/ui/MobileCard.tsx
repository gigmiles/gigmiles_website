import React from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface MobileCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  pressable?: boolean;
}

export function MobileCard({ 
  children, 
  onClick, 
  className = '',
  pressable = true 
}: MobileCardProps) {
  const handleClick = async () => {
    if (pressable && onClick) {
      await Haptics.impact({ style: ImpactStyle.Light });
      onClick();
    }
  };
  
  const baseClasses = `
    bg-card rounded-2xl p-6
    shadow-sm border border-border
    transition-all duration-150
  `;
  
  const interactiveClasses = pressable ? `
    active:shadow-lg active:scale-[0.99]
    cursor-pointer
  ` : '';
  
  return (
    <div
      className={`${baseClasses} ${interactiveClasses} ${className}`}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}
