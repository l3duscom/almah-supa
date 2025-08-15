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
      <div className="absolute inset-0 bg-gradient-to-b from-violet-200 via-purple-50 to-white" />
      
      {/* Floating clouds */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: -300,
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight * 0.7 : 400) + 20,
            scale: Math.random() * 0.8 + 0.6,
            rotate: Math.random() * 20 - 10,
          }}
          animate={{ 
            x: typeof window !== 'undefined' ? window.innerWidth + 300 : 1400,
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight * 0.7 : 400) + 20,
            rotate: Math.random() * 40 - 20,
          }}
          transition={{ 
            duration: Math.random() * 15 + 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 8,
          }}
          className="absolute opacity-50 md:opacity-40"
        >
          <CloudSvg size={Math.random() * 100 + 80} />
        </motion.div>
      ))}

      {/* Gentle birds flying */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={`bird-${i}`}
          initial={{ 
            x: -80,
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight * 0.6 : 300) + 50,
            scale: Math.random() * 0.5 + 0.8,
          }}
          animate={{ 
            x: typeof window !== 'undefined' ? window.innerWidth + 80 : 1300,
            y: [
              Math.random() * (typeof window !== 'undefined' ? window.innerHeight * 0.6 : 300) + 50,
              Math.random() * (typeof window !== 'undefined' ? window.innerHeight * 0.6 : 300) + 80,
              Math.random() * (typeof window !== 'undefined' ? window.innerHeight * 0.6 : 300) + 30,
            ],
          }}
          transition={{ 
            duration: Math.random() * 10 + 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 3,
          }}
          className="absolute opacity-40 md:opacity-30"
        >
          <BirdSvg size={Math.random() * 15 + 25} />
        </motion.div>
      ))}

      {/* Enhanced light rays */}
      <motion.div 
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/6 w-2 md:w-1 h-40 md:h-32 bg-gradient-to-b from-yellow-300/30 to-transparent transform rotate-12" 
      />
      <motion.div 
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-0 left-1/3 w-2 md:w-1 h-48 md:h-40 bg-gradient-to-b from-yellow-200/25 to-transparent transform -rotate-6" 
      />
      <motion.div 
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-0 right-1/4 w-2 md:w-1 h-44 md:h-36 bg-gradient-to-b from-yellow-300/35 to-transparent transform rotate-8" 
      />
      <motion.div 
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-0 right-1/6 w-2 md:w-1 h-52 md:h-44 bg-gradient-to-b from-yellow-200/20 to-transparent transform -rotate-4" 
      />
      
      {/* Enhanced floating elements */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={`float-${i}`}
          initial={{ 
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
            y: typeof window !== 'undefined' ? window.innerHeight + 100 : 900,
            opacity: 0,
            scale: 0.5,
          }}
          animate={{ 
            y: -100,
            opacity: [0, 0.7, 0.7, 0],
            scale: [0.5, 1.2, 1, 0.8],
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
          }}
          transition={{ 
            duration: Math.random() * 6 + 8,
            repeat: Infinity,
            ease: "easeOut",
            delay: Math.random() * 5,
          }}
          className="absolute w-3 h-3 md:w-2 md:h-2 bg-white/60 rounded-full shadow-lg"
        />
      ))}

      {/* Additional magical sparkles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          initial={{ 
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            opacity: 0,
            scale: 0,
          }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
            rotate: [0, 180, 360],
          }}
          transition={{ 
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 8,
          }}
          className="absolute w-1 h-1 bg-yellow-200/80 rounded-full"
        />
      ))}
    </div>
  );
}

// Cloud SVG component
function CloudSvg({ size = 50 }: { size?: number }) {
  return (
    <motion.svg 
      width={size} 
      height={size * 0.6} 
      viewBox="0 0 100 60" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      animate={{ 
        scale: [1, 1.05, 1],
      }}
      transition={{ 
        duration: Math.random() * 4 + 6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <path
        d="M20 40c-6.627 0-12-5.373-12-12s5.373-12 12-12c1.685 0 3.287.347 4.74.976C27.842 12.562 32.665 10 38 10c8.837 0 16 7.163 16 16 0 .342-.011.681-.032 1.017C56.571 27.669 59 30.223 59 33.5c0 4.142-3.358 7.5-7.5 7.5H20z"
        fill="white"
        opacity="0.9"
        style={{
          filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))',
        }}
      />
      <path
        d="M25 35c-4 0-7-3-7-7s3-7 7-7c1 0 2 .2 3 .6C30 18 33 16 36 16c5 0 9 4 9 9 0 .2 0 .4 0 .6C46.5 25.5 48 27 48 29c0 2-2 4-4 4H25z"
        fill="rgba(255,255,255,0.6)"
      />
    </motion.svg>
  );
}

// Bird SVG component
function BirdSvg({ size = 20 }: { size?: number }) {
  return (
    <motion.svg 
      width={size} 
      height={size * 0.6} 
      viewBox="0 0 20 12" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      animate={{ 
        rotateZ: [0, 3, -3, 0],
      }}
      transition={{ 
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <path
        d="M2 8c3-2 5-3 8-2s5 2 8 0"
        stroke="rgb(100 116 139)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M2 4c3-1 5-1.5 8-1s5 1 8 0"
        stroke="rgb(100 116 139)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </motion.svg>
  );
}