"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

interface WellnessAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

// Animação simples e performática de celebração
const SimpleSuccess = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50 flex items-center justify-center">
      {/* Círculo central expandindo */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 1.5, 0],
          opacity: [0, 0.3, 0],
        }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute w-96 h-96 bg-gradient-to-r from-emerald-400 to-violet-400 rounded-full"
      />

      {/* Partículas de sucesso simples */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 100;
        return (
          <motion.div
            key={i}
            initial={{ 
              scale: 0,
              opacity: 0,
              x: 0,
              y: 0,
            }}
            animate={{ 
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
            }}
            transition={{ 
              delay: 0.3 + i * 0.1, 
              duration: 1.2,
              ease: "easeOut"
            }}
            className="absolute text-3xl"
          >
            ✨
          </motion.div>
        );
      })}

      {/* Coração central */}
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ 
          scale: [0, 1.2, 1],
          rotate: [0, 360],
        }}
        transition={{ 
          delay: 0.5,
          duration: 1,
          ease: "easeOut"
        }}
        className="absolute text-6xl filter drop-shadow-lg"
      >
        💚
      </motion.div>

      {/* Texto de confirmação */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ 
          opacity: [0, 1, 1, 0],
          y: [50, 0, 0, -20],
        }}
        transition={{ 
          delay: 1,
          duration: 1.5,
          ease: "easeOut"
        }}
        className="absolute top-2/3 text-center"
      >
        <p className="text-lg font-medium text-emerald-700 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          Entrada salva! ✨
        </p>
      </motion.div>
    </div>
  );
};

export default function WellnessAnimation({ show, onComplete }: WellnessAnimationProps) {
  useEffect(() => {
    if (show && onComplete) {
      // Chama onComplete após a duração da animação
      const timer = setTimeout(onComplete, 2000); // Reduzido de 4s para 2s
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <>
      <SimpleSuccess />
      
      {/* Overlay suave e leve */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 bg-gradient-to-b from-emerald-50 to-violet-50 pointer-events-none z-40"
      />
    </>
  );
}