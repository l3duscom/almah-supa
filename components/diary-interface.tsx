"use client";

import { useState, useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { addDiaryEntry, DiaryActionState } from "@/app/app/diario/actions";
import { format } from "date-fns";
import { Heart, Sparkles, Plus, Calendar, Edit3, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import MoodSelector from "./mood-selector";
import DiaryEntry from "./diary-entry";
import WellnessAnimation from "./wellness-animation";
import MoodBoostButton from "./mood-boost-button";

interface DiaryEntry {
  id: string;
  content: string;
  mood: number;
  created_at: string;
  updated_at: string;
}

interface DiaryInterfaceProps {
  entries: DiaryEntry[];
  currentDate: string;
}

const supportiveMessages = [
  "Você está fazendo um ótimo trabalho cuidando de si mesmo! 💚",
  "Seus sentimentos são válidos e importantes. 🌸",
  "Cada palavra que você escreve é um passo em direção ao bem-estar. ✨",
  "Obrigado por confiar em nós com seus pensamentos. 🤗",
  "Você é mais forte do que imagina! 💪",
  "Lembre-se: amanhã é um novo dia cheio de possibilidades. 🌅",
  "Você merece todo o amor e cuidado do mundo. 💝",
  "Está tudo bem sentir o que você está sentindo. 🫂",
];

export default function DiaryInterface({
  entries,
  currentDate,
}: DiaryInterfaceProps) {
  const [isWriting, setIsWriting] = useState(false);
  const [newEntry, setNewEntry] = useState("");
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showWellnessAnimation, setShowWellnessAnimation] = useState(false);

  const [state, formAction, pending] = useActionState<DiaryActionState, FormData>(
    addDiaryEntry,
    { success: false }
  );

  const handleStartWriting = () => {
    setIsWriting(true);
  };

  // Monitor state changes to show success animation
  useEffect(() => {
    if (state.success && !pending) {
      setNewEntry("");
      setSelectedMood(null);
      setIsWriting(false);
      
      // Show wellness animation first
      setShowWellnessAnimation(true);
      
      // Then show success message
      setTimeout(() => {
        const randomMessage = supportiveMessages[Math.floor(Math.random() * supportiveMessages.length)];
        setSuccessMessage(randomMessage);
        setShowSuccess(true);
        
        setTimeout(() => {
          setShowSuccess(false);
        }, 4000);
      }, 1500);
    }
  }, [state.success, pending]);

  const handleSubmit = (formData: FormData) => {
    formAction(formData);
  };

  // Simplifica: só compara com hoje usando date-fns
  const today = format(new Date(), "yyyy-MM-dd");
  const isToday = currentDate === today;
  
  // Debug simples
  console.log("🔍 Debug DiaryInterface:", {
    currentDate,
    today,
    isToday,
    areEqual: currentDate === today
  });

  return (
    <div className="space-y-6">
      {/* Wellness Animation */}
      <WellnessAnimation 
        show={showWellnessAnimation} 
        onComplete={() => setShowWellnessAnimation(false)}
      />
      {/* Enhanced Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.5 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: [0.5, 1.1, 1],
            }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{ 
              duration: 0.8,
              scale: { times: [0, 0.5, 1], duration: 0.8 }
            }}
            className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50"
          >
            <motion.div
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(34, 197, 94, 0.3)",
                  "0 0 40px rgba(34, 197, 94, 0.6)",
                  "0 0 20px rgba(34, 197, 94, 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: 2 }}
            >
              <Card className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-green-200 shadow-2xl overflow-hidden relative">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
                <CardContent className="p-6 flex items-center gap-4">
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ 
                      rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                      scale: { duration: 1, repeat: 2 }
                    }}
                  >
                    <Sparkles className="h-8 w-8 text-green-600" />
                  </motion.div>
                  <div className="flex-1">
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-green-800 font-semibold text-lg block"
                    >
                      {successMessage}
                    </motion.span>
                  </div>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.3, 1],
                    }}
                    transition={{ duration: 0.8, repeat: 3 }}
                  >
                    <Heart className="h-6 w-6 text-pink-500" />
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Date Navigation */}
      <div className="flex justify-center items-center gap-4">
        <Card className="w-fit">
          <CardContent className="p-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {isToday ? "Hoje" : format(new Date(currentDate), "dd/MM/yyyy")}
            </span>
            {isToday && (
              <Badge variant="secondary" className="ml-2">
                Atual
              </Badge>
            )}
          </CardContent>
        </Card>
        
        <MoodBoostButton />
      </div>

      {/* Write New Entry */}
      {isToday && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Como você está se sentindo hoje?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isWriting ? (
                <Button
                  onClick={handleStartWriting}
                  variant="outline"
                  size="lg"
                  className="w-full h-20 text-lg border-dashed hover:bg-primary/5"
                >
                  <Plus className="h-6 w-6 mr-2" />
                  Começar a escrever...
                </Button>
              ) : (
                <form action={handleSubmit} className="space-y-4">
                  <input type="hidden" name="date" value={currentDate} />
                  
                  <MoodSelector
                    selectedMood={selectedMood}
                    onMoodSelect={setSelectedMood}
                  />
                  
                  <input type="hidden" name="mood" value={selectedMood || ""} />
                  
                  <div>
                    <Textarea
                      name="content"
                      placeholder="Escreva seus pensamentos, sentimentos ou qualquer coisa que queira compartilhar... Este é seu espaço seguro. 💚"
                      value={newEntry}
                      onChange={(e) => setNewEntry(e.target.value)}
                      className="min-h-32 resize-none"
                      disabled={pending}
                    />
                  </div>

                  {state.success === false && state.message && (
                    <Alert variant="destructive">
                      <AlertDescription>{state.message}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={pending || !newEntry.trim() || !selectedMood}
                      className="flex-1"
                    >
                      {pending ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                        </motion.div>
                      ) : (
                        <Heart className="h-4 w-4 mr-2" />
                      )}
                      {pending ? "Salvando..." : "Salvar no Diário"}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsWriting(false);
                        setNewEntry("");
                        setSelectedMood(null);
                      }}
                      disabled={pending}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Existing Entries */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {entries.length > 0 ? "Suas anotações do dia:" : "Nenhuma anotação ainda..."}
        </h3>
        
        <AnimatePresence>
          {entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <DiaryEntry entry={entry} canEdit={isToday} />
            </motion.div>
          ))}
        </AnimatePresence>

        {entries.length === 0 && !isToday && (
          <Card className="text-center p-8">
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Você não escreveu nada neste dia.
              </p>
              <p className="text-sm text-muted-foreground">
                Que tal começar hoje? 😊
              </p>
              <Button asChild className="mt-4">
                <Link href={`/app/diario?date=${today}`} className="flex items-center gap-2">
                  Ir para hoje
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}