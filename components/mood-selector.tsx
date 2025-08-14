"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MoodSelectorProps {
  selectedMood: number | null;
  onMoodSelect: (mood: number) => void;
}

const moods = [
  { value: 1, emoji: "😢", label: "Muito triste", color: "from-red-400 to-red-600" },
  { value: 2, emoji: "😔", label: "Triste", color: "from-orange-400 to-orange-600" },
  { value: 3, emoji: "😐", label: "Neutro", color: "from-yellow-400 to-yellow-600" },
  { value: 4, emoji: "😊", label: "Feliz", color: "from-green-400 to-green-600" },
  { value: 5, emoji: "😄", label: "Muito feliz", color: "from-emerald-400 to-emerald-600" },
];

export default function MoodSelector({ selectedMood, onMoodSelect }: MoodSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Como você está se sentindo?</label>
      <div className="flex justify-center gap-3">
        {moods.map((mood) => (
          <motion.button
            key={mood.value}
            type="button"
            onClick={() => onMoodSelect(mood.value)}
            className={cn(
              "relative p-3 rounded-full transition-all duration-200",
              "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50",
              selectedMood === mood.value
                ? `bg-gradient-to-br ${mood.color} shadow-lg scale-110`
                : "bg-muted hover:bg-muted/80"
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label={mood.label}
          >
            <span className="text-2xl block">{mood.emoji}</span>
            
            {selectedMood === mood.value && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -inset-1 rounded-full bg-gradient-to-br from-white/20 to-white/5 pointer-events-none"
              />
            )}
          </motion.button>
        ))}
      </div>
      
      {selectedMood && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-muted-foreground"
        >
          {moods.find(m => m.value === selectedMood)?.label}
        </motion.p>
      )}
    </div>
  );
}