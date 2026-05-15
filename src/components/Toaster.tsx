"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { BadgeCheckIcon, BadgeInfoIcon, BadgeXIcon, LoaderIcon, TriangleAlertIcon, XIcon } from 'lucide-react';

const statusConfig = {
  success: { color: 'text-green-400', icon: <BadgeCheckIcon className="w-5 h-5"/> },
  error: { color: 'text-red-400', icon: <BadgeXIcon className="w-5 h-5"/> },
  info: { color: 'text-blue-400', icon: <BadgeInfoIcon className="w-5 h-5"/> },
  warning: { color: 'text-yellow-400', icon: <TriangleAlertIcon className="w-5 h-5"/> },
};

export const Toaster = () => {
  const [toasts, setToasts] = useState<any[]>([]);

  useEffect(() => {
    return toast.subscribe(setToasts);
  }, []);

  const reversedToasts = [...toasts].reverse();

  return (
    <div className="fixed bottom-5 right-5 z-9999 flex flex-col-reverse items-end gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout" initial={false}>
        {reversedToasts.map((t, idx) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 50, scale: 0.8, filter: "blur(10px)" }}
            animate={{ 
              opacity: 1 - idx * 0.2,
              y: 0,
              scale: 1 - idx * 0.05,
              filter: `blur(${idx * 2}px)`,
              zIndex: reversedToasts.length - idx,
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.9, 
              y: -20,
              filter: "blur(10px)",
              transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } 
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
              mass: 1
            }}
            className={cn(
              "pointer-events-auto relative flex items-center gap-3 overflow-hidden bg-black border border-white/10 px-4 py-3 rounded-xl shadow-2xl min-w-[280px]"
            )}
          >
            <div className="shrink-0">
               <Image 
                  width={80} 
                  height={80} 
                  src="/toast-logo.png"  
                  alt="" 
                  className="absolute z-0 -left-0.5 -top-3.5 grayscale opacity-10 object-cover pointer-events-none" 
                />
            </div>

            <div className="flex items-center justify-center w-5 z-10">
              {t.type === 'loading' ? (
                <LoaderIcon className='w-5 h-5 animate-spin text-white/50' />
              ) : (
                <span className={`text-lg ${statusConfig[t.type as keyof typeof statusConfig]?.color}`}>
                  {statusConfig[t.type as keyof typeof statusConfig]?.icon}
                </span>
              )}
            </div>

            <p className="text-white text-sm tracking-tight z-10">
              {t.message}
            </p>

            <button 
              onClick={() => toast.remove(t.id)}
              className="ml-auto text-white opacity-50 hover:opacity-100 transition-colors p-1 cursor-pointer z-10"
            >
              <XIcon className='w-3 h-3'/>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};