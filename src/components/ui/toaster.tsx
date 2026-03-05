// src/components/ui/toaster.tsx

"use client";

import { useEffect, useRef } from "react";
import {
  useToastState,
  dismissToast,
  Toast,
  ToastType,
} from "@/hooks/use-toast";

// Config warna & icon per type
const TOAST_CONFIG: Record<
  ToastType,
  { bg: string; border: string; icon: React.ReactNode; titleColor: string }
> = {
  success: {
    bg: "bg-white",
    border: "border-emerald-200",
    titleColor: "text-zinc-900",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#10b981"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
    ),
  },
  error: {
    bg: "bg-white",
    border: "border-red-200",
    titleColor: "text-zinc-900",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ef4444"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
  warning: {
    bg: "bg-white",
    border: "border-amber-200",
    titleColor: "text-zinc-900",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  info: {
    bg: "bg-white",
    border: "border-blue-200",
    titleColor: "text-zinc-900",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const duration = toast.duration ?? 3500;
  const config = TOAST_CONFIG[toast.type];

  // Auto dismiss setelah duration
  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [duration, onDismiss]);

  return (
    <div
      className={`
        flex items-start gap-3 w-full max-w-sm px-4 py-3.5 rounded-2xl
        border shadow-lg ${config.bg} ${config.border}
        animate-slide-in-right
      `}
      style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className="mt-0.5 shrink-0">{config.icon}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${config.titleColor}`}>
          {toast.title}
        </p>
        {toast.description && (
          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
            {toast.description}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={onDismiss}
        className="shrink-0 text-zinc-300 hover:text-zinc-500 transition-colors mt-0.5"
        aria-label="Dismiss notification"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

export default function Toaster() {
  const { toasts, removeToast } = useToastState();

  if (toasts.length === 0) return null;

  return (
    // Fixed bottom-right, z-index tinggi biar ga ketutup modal
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
