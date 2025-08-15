"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface WellnessAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

// Animação de sol removida por não ficar boa visualmente

// Componente de chuva relaxante melhorada
const GentleRain = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {/* Mais gotas com diferentes tamanhos */}
      {Array.from({ length: 35 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0, 
            y: -100,
            x: Math.random() * window.innerWidth,
          }}
          animate={{ 
            opacity: [0, 0.8, 0.8, 0], 
            y: window.innerHeight + 100,
            rotate: [0, 5, -5, 0],
          }}
          transition={{ 
            delay: i * 0.08, 
            duration: 4,
            ease: "easeInOut",
            repeat: 3
          }}
          className={`absolute bg-gradient-to-b from-cyan-200 via-blue-300 to-blue-500 rounded-full shadow-md ${
            i % 3 === 0 ? 'w-2 h-12' : i % 2 === 0 ? 'w-1.5 h-10' : 'w-1 h-8'
          }`}
        />
      ))}
      
      {/* Nuvens melhoradas */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: -100 }}
        animate={{ 
          opacity: [0, 0.7, 0.7, 0],
          scale: [0.5, 1.2, 1.2, 0.8],
          y: 0
        }}
        transition={{ duration: 3, ease: "easeOut" }}
        className="absolute top-8 left-1/3 transform -translate-x-1/2"
      >
        <div className="w-40 h-20 bg-gradient-to-r from-slate-100 via-blue-100 to-slate-200 rounded-full shadow-xl opacity-70" />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.3, y: -80 }}
        animate={{ 
          opacity: [0, 0.6, 0.6, 0],
          scale: [0.3, 1, 1, 0.7],
          y: 20
        }}
        transition={{ duration: 3.5, delay: 0.5, ease: "easeOut" }}
        className="absolute top-12 right-1/4 transform translate-x-1/2"
      >
        <div className="w-28 h-14 bg-gradient-to-r from-blue-50 via-cyan-100 to-blue-150 rounded-full shadow-lg opacity-60" />
      </motion.div>
      
      {/* Efeito de ondas no chão */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={`ripple-${i}`}
          initial={{ 
            opacity: 0,
            scale: 0,
            x: Math.random() * window.innerWidth,
            y: window.innerHeight - 50,
          }}
          animate={{ 
            opacity: [0, 0.4, 0],
            scale: [0, 2, 3],
          }}
          transition={{ 
            delay: 1.5 + i * 0.3, 
            duration: 1.5,
            ease: "easeOut"
          }}
          className="absolute w-4 h-4 border-2 border-blue-300 rounded-full"
        />
      ))}
    </div>
  );
};

// Componente de natureza exuberante melhorado
const NatureBloom = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {/* Jardim de flores brotando do chão */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            scale: 0, 
            rotate: -20,
            x: (i * (window.innerWidth / 12)) + Math.random() * 50,
            y: window.innerHeight - 80,
          }}
          animate={{ 
            scale: [0, 1.5, 1.2], 
            rotate: [0, 15, -10, 5],
            y: window.innerHeight - 120,
          }}
          transition={{ 
            delay: i * 0.2, 
            duration: 2.5,
            ease: "easeOut"
          }}
          className="absolute text-5xl filter drop-shadow-lg"
        >
          {['🌸', '🌺', '🌼', '🌻', '🌷', '🌹', '🌿', '🍀', '🌱', '🌾'][i % 10]}
        </motion.div>
      ))}

      {/* Cascata de pétalas voando */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={`petal-${i}`}
          initial={{ 
            opacity: 0,
            scale: 0,
            x: Math.random() * window.innerWidth,
            y: -50,
            rotate: 0,
          }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 0.8, 0],
            y: window.innerHeight + 50,
            x: Math.random() * window.innerWidth,
            rotate: [0, 360, 720],
          }}
          transition={{ 
            delay: 1 + i * 0.1, 
            duration: 4,
            ease: "easeInOut"
          }}
          className="absolute text-2xl"
        >
          {['🌸', '🌺', '🌼'][i % 3]}
        </motion.div>
      ))}

      {/* Borboletas em formação mais complexa */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={`butterfly-${i}`}
          initial={{ 
            x: i % 2 === 0 ? -100 : window.innerWidth + 100,
            y: 100 + Math.random() * (window.innerHeight / 3),
            rotate: 0,
            scale: 0,
          }}
          animate={{ 
            x: i % 2 === 0 ? window.innerWidth + 100 : -100,
            y: [
              100 + Math.random() * (window.innerHeight / 3),
              50 + Math.random() * (window.innerHeight / 4),
              120 + Math.random() * (window.innerHeight / 3)
            ],
            rotate: [0, 15, -15, 10, -10, 0],
            scale: [0, 1, 1, 0],
          }}
          transition={{ 
            delay: 1.5 + i * 0.4, 
            duration: 5,
            ease: "easeInOut"
          }}
          className="absolute text-3xl filter drop-shadow-md"
        >
          🦋
        </motion.div>
      ))}

      {/* Explosão de corações do centro */}
      {Array.from({ length: 15 }).map((_, i) => {
        const angle = (i / 15) * Math.PI * 2;
        const distance = 200;
        return (
          <motion.div
            key={`heart-${i}`}
            initial={{ 
              opacity: 0,
              scale: 0,
              x: window.innerWidth / 2,
              y: window.innerHeight / 2,
            }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              scale: [0, 1.2, 0.8],
              x: window.innerWidth / 2 + Math.cos(angle) * distance,
              y: window.innerHeight / 2 + Math.sin(angle) * distance,
              rotate: [0, 360],
            }}
            transition={{ 
              delay: 2.5 + i * 0.05, 
              duration: 2,
              ease: "easeOut"
            }}
            className="absolute text-2xl filter drop-shadow-sm"
          >
            💚
          </motion.div>
        );
      })}
      
      {/* Estrelas cintilantes */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={`star-${i}`}
          initial={{ 
            opacity: 0,
            scale: 0,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{ 
            opacity: [0, 1, 0, 1, 0],
            scale: [0, 1, 1.5, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{ 
            delay: 3 + Math.random() * 1, 
            duration: 1.5,
            ease: "easeInOut"
          }}
          className="absolute text-xl"
        >
          ✨
        </motion.div>
      ))}
    </div>
  );
};

export default function WellnessAnimation({ show, onComplete }: WellnessAnimationProps) {
  const [animationType, setAnimationType] = useState<'rain' | 'nature'>('rain');

  useEffect(() => {
    // Escolhe aleatoriamente entre chuva suave e natureza exuberante
    const types: ('rain' | 'nature')[] = ['rain', 'nature'];
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