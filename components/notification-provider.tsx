"use client";

import NotificationModal from "./notification-modal";
import { useNotification } from "@/hooks/use-notification";

export default function NotificationProvider() {
  const {
    isOpen,
    title,
    description,
    variant,
    autoClose,
    autoCloseDelay,
    hideNotification,
  } = useNotification();

  return (
    <NotificationModal
      isOpen={isOpen}
      onClose={hideNotification}
      title={title}
      description={description}
      variant={variant}
      autoClose={autoClose}
      autoCloseDelay={autoCloseDelay}
    />
  );
}