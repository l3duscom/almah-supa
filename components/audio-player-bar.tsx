"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioPlayer } from "@/hooks/use-audio-player";

export default function AudioPlayerBar() {
  const { 
    playlist, 
    currentTrack, 
    isPlaying, 
    isVisible, 
    setCurrentTrack, 
    togglePlay 
  } = useAudioPlayer();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (playlist.length > 0 && !currentTrack) {
      setCurrentTrack(playlist[0]);
    }
  }, [playlist, currentTrack, setCurrentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const handleNext = useCallback(() => {
    if (!currentTrack || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentTrack(playlist[nextIndex]);
  }, [currentTrack, playlist, setCurrentTrack]);

  const handlePrevious = useCallback(() => {
    if (!currentTrack || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    setCurrentTrack(playlist[prevIndex]);
  }, [currentTrack, playlist, setCurrentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => handleNext();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, handleNext]);

  const handlePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    togglePlay();
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-violet-200/30"
      >
        {/* Audio element */}
        <audio
          ref={audioRef}
          src={currentTrack?.url}
          preload="metadata"
        />
        
        {/* Player bar */}
        <div className="bg-violet-500/90 backdrop-blur-md border-t border-violet-400/30 shadow-lg shadow-violet-900/20">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              
              {/* Track info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-violet-600/50 rounded-lg flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: isPlaying && currentTrack ? 360 : 0 }}
                      transition={{ duration: 3, repeat: isPlaying && currentTrack ? Infinity : 0, ease: "linear" }}
                      className="w-8 h-8 bg-gradient-to-br from-violet-300 to-violet-600 rounded-full"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    {currentTrack ? (
                      <>
                        <h4 className="text-white font-medium text-sm truncate">
                          {currentTrack.title}
                        </h4>
                        {currentTrack.artist && (
                          <p className="text-violet-200 text-xs truncate">
                            {currentTrack.artist}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <h4 className="text-white font-medium text-sm">
                          Selecione uma música
                        </h4>
                        <p className="text-violet-200 text-xs">
                          Escolha um áudio para começar
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Main controls */}
              <div className="flex-2 flex flex-col items-center gap-2 max-w-md mx-4">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handlePrevious}
                    className="text-white hover:text-violet-200 hover:bg-violet-600/50 h-8 w-8 p-0"
                    disabled={!currentTrack || playlist.length <= 1}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={handlePlayPause}
                    className="bg-white text-violet-600 hover:bg-violet-50 h-10 w-10 p-0 rounded-full shadow-lg disabled:opacity-50"
                    disabled={!currentTrack}
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5" />
                    )}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleNext}
                    className="text-white hover:text-violet-200 hover:bg-violet-600/50 h-8 w-8 p-0"
                    disabled={!currentTrack || playlist.length <= 1}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-2 w-full">
                  <span className="text-violet-200 text-xs w-10 text-center">
                    {formatTime(currentTime)}
                  </span>
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={1}
                    onValueChange={handleSeek}
                    className="flex-1 [&_[role=slider]]:bg-white [&_[role=slider]]:border-violet-300 [&>div]:bg-violet-300/30 [&_[data-orientation=horizontal]]:bg-white/80"
                  />
                  <span className="text-violet-200 text-xs w-10 text-center">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* Volume controls */}
              <div className="flex-1 flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleMute}
                  className="text-white hover:text-violet-200 hover:bg-violet-600/50 h-8 w-8 p-0"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <div className="w-20 hidden sm:block">
                  <Slider
                    value={[volume]}
                    max={100}
                    step={1}
                    onValueChange={handleVolumeChange}
                    className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-violet-300 [&>div]:bg-violet-300/30 [&_[data-orientation=horizontal]]:bg-white/50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}