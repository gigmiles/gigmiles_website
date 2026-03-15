'use client';

import React from 'react';
import { BottomSheet as Sheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: number[];
}

export function BottomSheet({ 
  isOpen, 
  onClose, 
  title,
  children,
  snapPoints = [0.9]
}: BottomSheetProps) {
  return (
    <Sheet
      open={isOpen}
      onDismiss={onClose}
      snapPoints={({ maxHeight }) => snapPoints.map(p => maxHeight * p)}
      blocking={false}
      scrollLocking={true}
    >
      <div className="px-6 pb-8 pt-2">
        {title && (
          <div className="mb-6 pb-4 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          </div>
        )}
        {children}
      </div>
    </Sheet>
  );
}
