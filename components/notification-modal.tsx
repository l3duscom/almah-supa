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
        return "bg-white border-green-300 shadow-green-100";
      case "error":
        return "bg-white border-red-300 shadow-red-100";
      default:
        return "bg-white border-blue-300 shadow-blue-100";
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
              initial={{ opacity: 0, scale: 0.3, y: 50, rotateX: -15 }}
              animate={{ 
                opacity: 1, 
                scale: [0.3, 1.05, 1], 
                y: 0,
                rotateX: 0,
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.8, 
                y: -30,
                rotateX: 15,
                transition: { duration: 0.2 }
              }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.6
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card className={`${getColors()} shadow-2xl overflow-hidden relative border-2`}>
                {/* Shimmer effect */}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                />
                
                {/* Glow effect */}
                <motion.div
                  animate={{ 
                    boxShadow: [
                      `0 0 20px ${variant === 'success' ? 'rgba(34, 197, 94, 0.3)' : variant === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                      `0 0 40px ${variant === 'success' ? 'rgba(34, 197, 94, 0.5)' : variant === 'error' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.5)'}`,
                      `0 0 20px ${variant === 'success' ? 'rgba(34, 197, 94, 0.3)' : variant === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
                    ]
                  }}
                  transition={{ duration: 2, repeat: 1 }}
                  className="absolute inset-0 rounded-lg"
                />
                
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ 
                        scale: [0, 1.3, 1],
                        rotate: [0, 360, 0],
                      }}
                      transition={{ 
                        duration: 0.8,
                        ease: "easeOut",
                        delay: 0.2
                      }}
                    >
                      {getIcon()}
                    </motion.div>
                    
                    <div className="flex-1 min-w-0">
                      {title && (
                        <motion.h3 
                          initial={{ opacity: 0, x: -20, scale: 0.8 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          transition={{ 
                            delay: 0.4,
                            type: "spring",
                            damping: 20,
                            stiffness: 300
                          }}
                          className="font-semibold text-lg mb-2 text-gray-800"
                        >
                          {title}
                        </motion.h3>
                      )}
                      
                      <motion.p 
                        initial={{ opacity: 0, x: -20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ 
                          delay: 0.6,
                          type: "spring",
                          damping: 20,
                          stiffness: 300
                        }}
                        className="text-sm leading-relaxed break-words text-gray-600"
                      >
                        {description}
                      </motion.p>
                    </div>
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8, type: "spring", damping: 15 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="flex-shrink-0 h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </Button>
                    </motion.div>
                  </div>
                  
                  {autoClose && (
                    <div className="mt-4">
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: "100%" }}
                          animate={{ width: "0%" }}
                          transition={{ duration: autoCloseDelay / 1000, ease: "linear" }}
                          className={`h-full rounded-full ${
                            variant === "success" 
                              ? "bg-gradient-to-r from-green-500 to-emerald-400" 
                              : variant === "error" 
                              ? "bg-gradient-to-r from-red-500 to-pink-400" 
                              : "bg-gradient-to-r from-blue-500 to-cyan-400"
                          }`}
                        />
                      </div>
                    </div>
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