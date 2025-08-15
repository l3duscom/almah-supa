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
  currentCategoryId: string | null;
  
  // Actions
  setPlaylist: (tracks: AudioTrack[], categoryId?: string) => void;
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
  isVisible: true,
  currentCategoryId: null,

  setPlaylist: (tracks, categoryId) => set({ 
    playlist: tracks, 
    currentCategoryId: categoryId || null 
  }),
  
  setCurrentTrack: (track) => set({ currentTrack: track }),
  
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  
  showPlayer: () => set({ isVisible: true }),
  
  hidePlayer: () => set({ isVisible: false }),
  
  playTrack: (track) => {
    // Sempre troca para a nova track sem modificar a playlist atual
    set({ 
      currentTrack: track, 
      isPlaying: true,
      isVisible: true 
    });
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