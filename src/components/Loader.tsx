'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Loader({ onComplete }: { onComplete?: () => void }) {
  const [speedFactor, setSpeedFactor] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2500;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setSpeedFactor(progress);

      if (progress >= 1) {
        clearInterval(interval);
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 500);
        }, 500);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black z-100 flex items-center justify-center">
      <motion.div
        className="flex flex-col items-center gap-4 w-48"
        animate={isExiting ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="text-white text-[9px] uppercase tracking-widest ">Indexing</div>
        <div className="h-0.5 w-full relative bg-white/20 rounded-sm overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-accent rounded-sm z-10"
            style={{ width: `${speedFactor * 100}%` }}
          />
        </div>
      </motion.div>
    </div>
  );
}
