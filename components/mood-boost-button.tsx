"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Sun, Cloud, Flower } from "lucide-react";

const boostMessages = [
  "Você é incrível! ✨",
  "Respire fundo... você consegue! 💚", 
  "Cada dia é uma nova oportunidade 🌅",
  "Você é mais forte do que pensa 💪",
  "Seja gentil consigo mesmo 🤗",
  "Seus sentimentos são válidos 💝",
  "Você merece todo o amor do mundo 🌸",
  "Um passo de cada vez... 🚶‍♀️",
];

const moodIcons = [Heart, Sparkles, Sun, Cloud, Flower];

export default function MoodBoostButton() {
  const [showBoost, setShowBoost] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentIcon, setCurrentIcon] = useState(Heart);

  const handleBoost = () => {
    const randomMessage = boostMessages[Math.floor(Math.random() * boostMessages.length)];
    const RandomIcon = moodIcons[Math.floor(Math.random() * moodIcons.length)];
    
    setCurrentMessage(randomMessage);
    setCurrentIcon(RandomIcon);
    setShowBoost(true);
    
    setTimeout(() => {
      setShowBoost(false);
    }, 3000);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={handleBoost}
        disabled={showBoost}
        className="hover:bg-pink-50 hover:border-pink-200 transition-colors"
      >
        <Heart className="h-4 w-4 mr-2 text-pink-500" />
        Preciso de apoio
      </Button>

      <AnimatePresence>
        {showBoost && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            className="absolute top-12 left-1/2 transform -translate-x-1/2 z-50"
          >
            <motion.div
              animate={{ 
                boxShadow: [
                  "0 0 10px rgba(236, 72, 153, 0.3)",
                  "0 0 20px rgba(236, 72, 153, 0.6)",
                  "0 0 10px rgba(236, 72, 153, 0.3)"
                ]
              }}
              transition={{ duration: 1.5, repeat: 2 }}
              className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-4 shadow-lg min-w-48"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 0.8, repeat: 2 }}
                >
                  <currentIcon className="h-6 w-6 text-pink-600" />
                </motion.div>
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-pink-800 font-medium text-sm"
                >
                  {currentMessage}
                </motion.span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}