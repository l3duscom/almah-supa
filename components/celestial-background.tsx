"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function CelestialBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-blue-50 to-white" />
      
      {/* Floating clouds */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: -200,
            y: Math.random() * 400 + 50,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{ 
            x: typeof window !== 'undefined' ? window.innerWidth + 200 : 1200,
          }}
          transition={{ 
            duration: Math.random() * 20 + 30,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 10,
          }}
          className="absolute opacity-30"
        >
          <CloudSvg size={Math.random() * 60 + 40} />
        </motion.div>
      ))}

      {/* Gentle birds flying */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={`bird-${i}`}
          initial={{ 
            x: -50,
            y: Math.random() * 200 + 100,
          }}
          animate={{ 
            x: typeof window !== 'undefined' ? window.innerWidth + 50 : 1200,
            y: Math.random() * 200 + 100,
          }}
          transition={{ 
            duration: Math.random() * 15 + 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
          className="absolute opacity-20"
        >
          <BirdSvg />
        </motion.div>
      ))}

      {/* Soft light rays */}
      <div className="absolute top-0 left-1/4 w-1 h-32 bg-gradient-to-b from-yellow-200/20 to-transparent transform rotate-12 opacity-40" />
      <div className="absolute top-0 left-1/3 w-1 h-40 bg-gradient-to-b from-yellow-200/15 to-transparent transform -rotate-6 opacity-40" />
      <div className="absolute top-0 right-1/4 w-1 h-36 bg-gradient-to-b from-yellow-200/20 to-transparent transform rotate-8 opacity-40" />
      
      {/* Subtle floating elements */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={`float-${i}`}
          initial={{ 
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
            y: typeof window !== 'undefined' ? window.innerHeight : 800,
            opacity: 0,
          }}
          animate={{ 
            y: -50,
            opacity: [0, 0.3, 0],
          }}
          transition={{ 
            duration: Math.random() * 8 + 12,
            repeat: Infinity,
            ease: "easeOut",
            delay: Math.random() * 10,
          }}
          className="absolute w-2 h-2 bg-white/40 rounded-full"
        />
      ))}
    </div>
  );
}

// Cloud SVG component
function CloudSvg({ size = 50 }: { size?: number }) {
  return (
    <svg 
      width={size} 
      height={size * 0.6} 
      viewBox="0 0 100 60" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 40c-6.627 0-12-5.373-12-12s5.373-12 12-12c1.685 0 3.287.347 4.74.976C27.842 12.562 32.665 10 38 10c8.837 0 16 7.163 16 16 0 .342-.011.681-.032 1.017C56.571 27.669 59 30.223 59 33.5c0 4.142-3.358 7.5-7.5 7.5H20z"
        fill="white"
        opacity="0.8"
      />
    </svg>
  );
}

// Bird SVG component
function BirdSvg() {
  return (
    <motion.svg 
      width="20" 
      height="12" 
      viewBox="0 0 20 12" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      animate={{ 
        rotateZ: [0, 2, -2, 0],
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <path
        d="M2 8c3-2 5-3 8-2s5 2 8 0"
        stroke="rgb(148 163 184)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M2 4c3-1 5-1.5 8-1s5 1 8 0"
        stroke="rgb(148 163 184)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </motion.svg>
  );
}