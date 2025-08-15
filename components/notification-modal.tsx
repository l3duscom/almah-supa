"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, AlertCircle } from "lucide-react";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description: string;
  variant?: "success" | "error" | "info";
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export default function NotificationModal({
  isOpen,
  onClose,
  title,
  description,
  variant = "info",
  autoClose = true,
  autoCloseDelay = 4000,
}: NotificationModalProps) {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  const getIcon = () => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case "error":
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      default:
        return <CheckCircle className="h-6 w-6 text-blue-600" />;
    }
  };

  const getColors = () => {
    switch (variant) {
      case "success":
        return "from-green-50 to-emerald-50 border-green-200";
      case "error":
        return "from-red-50 to-pink-50 border-red-200";
      default:
        return "from-blue-50 to-cyan-50 border-blue-200";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
              }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card className={`bg-gradient-to-br ${getColors()} shadow-2xl overflow-hidden relative`}>
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
                
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ 
                        duration: 1,
                        repeat: 2
                      }}
                    >
                      {getIcon()}
                    </motion.div>
                    
                    <div className="flex-1 min-w-0">
                      {title && (
                        <motion.h3 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="font-semibold text-lg mb-2"
                        >
                          {title}
                        </motion.h3>
                      )}
                      
                      <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-sm leading-relaxed break-words"
                      >
                        {description}
                      </motion.p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className="flex-shrink-0 h-8 w-8 p-0 hover:bg-white/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {autoClose && (
                    <motion.div
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: autoCloseDelay / 1000, ease: "linear" }}
                      className={`mt-4 h-1 rounded-full ${
                        variant === "success" 
                          ? "bg-green-500" 
                          : variant === "error" 
                          ? "bg-red-500" 
                          : "bg-blue-500"
                      }`}
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}