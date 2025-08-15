"use client";

import { create } from 'zustand';

interface AudioTrack {
  id: string;
  title: string;
  artist?: string;
  url: string;
  duration?: number;
}

interface AudioPlayerStore {
  playlist: AudioTrack[];
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  isVisible: boolean;
  
  // Actions
  setPlaylist: (tracks: AudioTrack[]) => void;
  setCurrentTrack: (track: AudioTrack) => void;
  togglePlay: () => void;
  showPlayer: () => void;
  hidePlayer: () => void;
  playTrack: (track: AudioTrack) => void;
  addToPlaylist: (track: AudioTrack) => void;
}

export const useAudioPlayer = create<AudioPlayerStore>((set, get) => ({
  playlist: [],
  currentTrack: null,
  isPlaying: false,
  isVisible: false,

  setPlaylist: (tracks) => set({ playlist: tracks }),
  
  setCurrentTrack: (track) => set({ currentTrack: track }),
  
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  
  showPlayer: () => set({ isVisible: true }),
  
  hidePlayer: () => set({ isVisible: false }),
  
  playTrack: (track) => {
    const { playlist } = get();
    
    // Se a track não está na playlist, adiciona
    if (!playlist.find(t => t.id === track.id)) {
      set((state) => ({ 
        playlist: [...state.playlist, track],
        currentTrack: track,
        isPlaying: true,
        isVisible: true
      }));
    } else {
      set({ 
        currentTrack: track, 
        isPlaying: true,
        isVisible: true 
      });
    }
  },
  
  addToPlaylist: (track) => {
    const { playlist } = get();
    
    if (!playlist.find(t => t.id === track.id)) {
      set((state) => ({ 
        playlist: [...state.playlist, track]
      }));
    }
  }
}));