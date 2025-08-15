"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface WellnessAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

// Componente de raios de sol
const SunRays = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {/* Sol central */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.6 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute top-20 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-24 h-24 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full shadow-lg">
          {/* Raios do sol */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
              className="absolute bg-gradient-to-b from-yellow-200 to-transparent"
              style={{
                width: "4px",
                height: "40px",
                left: "50%",
                top: "50%",
                transformOrigin: "center top",
                transform: `translate(-50%, -100%) rotate(${i * 45}deg)`,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Partículas de luz */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0, 
            scale: 0,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{ 
            opacity: [0, 1, 0], 
            scale: [0, 1.5, 0],
            y: [null, -50],
          }}
          transition={{ 
            delay: 1 + i * 0.2, 
            duration: 2,
            ease: "easeOut"
          }}
          className="absolute w-3 h-3 bg-yellow-300 rounded-full shadow-lg"
        />
      ))}
    </div>
  );
};

// Componente de gotas de chuva suaves
const GentleRain = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0, 
            y: -100,
            x: Math.random() * window.innerWidth,
          }}
          animate={{ 
            opacity: [0, 0.6, 0.6, 0], 
            y: window.innerHeight + 100,
          }}
          transition={{ 
            delay: i * 0.1, 
            duration: 3,
            ease: "linear",
            repeat: 2
          }}
          className="absolute w-1 h-8 bg-gradient-to-b from-blue-200 to-blue-400 rounded-full opacity-60"
        />
      ))}
      
      {/* Nuvem suave */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -50 }}
        animate={{ opacity: 0.4, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -50 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-10 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-32 h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full shadow-lg opacity-60" />
      </motion.div>
    </div>
  );
};

// Componente de flores e borboletas
const NatureBloom = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {/* Flores que brotam */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            scale: 0, 
            rotate: 0,
            x: 50 + i * (window.innerWidth / 8),
            y: window.innerHeight - 100,
          }}
          animate={{ 
            scale: [0, 1.2, 1], 
            rotate: [0, 10, -5, 0],
          }}
          transition={{ 
            delay: i * 0.3, 
            duration: 2,
            ease: "easeOut"
          }}
          className="absolute text-4xl"
        >
          {['🌸', '🌺', '🌼', '🌻', '🌷', '🌹'][i]}
        </motion.div>
      ))}

      {/* Borboletas voando */}
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: -50,
            y: Math.random() * (window.innerHeight / 2) + 100,
            rotate: 0,
          }}
          animate={{ 
            x: window.innerWidth + 50,
            y: Math.random() * (window.innerHeight / 2) + 100,
            rotate: [0, 10, -10, 0],
          }}
          transition={{ 
            delay: 1 + i * 0.5, 
            duration: 4,
            ease: "easeInOut"
          }}
          className="absolute text-2xl"
        >
          🦋
        </motion.div>
      ))}

      {/* Corações flutuantes */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0,
            scale: 0,
            x: Math.random() * window.innerWidth,
            y: window.innerHeight,
          }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            y: -100,
          }}
          transition={{ 
            delay: 0.5 + i * 0.2, 
            duration: 3,
            ease: "easeOut"
          }}
          className="absolute text-xl"
        >
          💚
        </motion.div>
      ))}
    </div>
  );
};

export default function WellnessAnimation({ show, onComplete }: WellnessAnimationProps) {
  const [animationType, setAnimationType] = useState<'sun' | 'rain' | 'nature'>('sun');

  useEffect(() => {
    // Escolhe aleatoriamente o tipo de animação
    const types: ('sun' | 'rain' | 'nature')[] = ['sun', 'rain', 'nature'];
    setAnimationType(types[Math.floor(Math.random() * types.length)]);
  }, [show]);

  useEffect(() => {
    if (show && onComplete) {
      // Chama onComplete após a duração da animação
      const timer = setTimeout(onComplete, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <>
      {animationType === 'sun' && <SunRays />}
      {animationType === 'rain' && <GentleRain />}
      {animationType === 'nature' && <NatureBloom />}
      
      {/* Overlay suave */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="fixed inset-0 bg-gradient-to-b from-emerald-50 to-blue-50 pointer-events-none z-40"
      />
    </>
  );
}