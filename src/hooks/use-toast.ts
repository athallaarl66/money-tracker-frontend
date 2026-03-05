// hooks/use-toast.ts
// Custom toast state management — simple, no external deps selain React

import { useState, useCallback, useEffect } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number; // ms, default 3500
}

// Singleton event emitter biar bisa dipanggil dari mana aja (termasuk luar component)
type ToastListener = (toast: Toast) => void;
type DismissListener = (id: string) => void;

const toastListeners = new Set<ToastListener>();
const dismissListeners = new Set<DismissListener>();

function generateId() {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// Fungsi ini bisa dipanggil dari mana aja — service, API layer, dll
export function toast(options: Omit<Toast, "id">) {
  const id = generateId();
  toastListeners.forEach((fn) => fn({ ...options, id }));
  return id;
}

// Shorthand helpers biar ga perlu nulis type tiap kali
toast.success = (title: string, description?: string) =>
  toast({ type: "success", title, description });

toast.error = (title: string, description?: string) =>
  toast({ type: "error", title, description });

toast.info = (title: string, description?: string) =>
  toast({ type: "info", title, description });

toast.warning = (title: string, description?: string) =>
  toast({ type: "warning", title, description });

export function dismissToast(id: string) {
  dismissListeners.forEach((fn) => fn(id));
}

// Hook yang dipake di Toaster component
export function useToastState() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((newToast: Toast) => {
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    toastListeners.add(addToast);
    dismissListeners.add(removeToast);

    return () => {
      toastListeners.delete(addToast);
      dismissListeners.delete(removeToast);
    };
  }, [addToast, removeToast]);

  return { toasts, removeToast };
}
