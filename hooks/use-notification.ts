"use client";

import { create } from "zustand";

interface NotificationState {
  isOpen: boolean;
  title?: string;
  description: string;
  variant: "success" | "error" | "info";
  autoClose: boolean;
  autoCloseDelay: number;
}

interface NotificationStore extends NotificationState {
  showNotification: (notification: Partial<NotificationState> & { description: string }) => void;
  hideNotification: () => void;
}

export const useNotification = create<NotificationStore>((set) => ({
  isOpen: false,
  description: "",
  variant: "info",
  autoClose: true,
  autoCloseDelay: 4000,
  showNotification: (notification) =>
    set({
      isOpen: true,
      title: notification.title,
      description: notification.description,
      variant: notification.variant || "info",
      autoClose: notification.autoClose ?? true,
      autoCloseDelay: notification.autoCloseDelay || 4000,
    }),
  hideNotification: () => set({ isOpen: false }),
}));