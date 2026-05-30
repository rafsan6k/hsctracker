"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

export default function InstallWidget() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [open, setOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Listen to sheet open event from InstallBottomSheet
  useEffect(() => {
    const handleSheetOpen = (e: Event) => {
      setSheetOpen((e as CustomEvent).detail);
    };
    window.addEventListener("pwa-sheet-open", handleSheetOpen as EventListener);
    return () => {
      window.removeEventListener("pwa-sheet-open", handleSheetOpen as EventListener);
    };
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler as EventListener);

    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handler as EventListener
      );
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;

    setOpen(false);
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setOpen(false);
  };

  if (sheetOpen || !deferredPrompt) return null;

  return (
    <>
      {/* Floating Circle (WhatsApp-style launcher) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-black text-white shadow-xl flex items-center justify-center animate-bounce"
        >
          ⬇
        </button>
      )}

      {/* Slide-up Card */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[280px]">
          <div className="bg-black text-white rounded-2xl shadow-2xl border border-white/10 p-4 animate-[slideUp_0.25s_ease-out]">
            
            {/* Header */}
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-sm">Install App</h3>

              <button onClick={dismiss}>
                <X size={18} className="opacity-70 hover:opacity-100" />
              </button>
            </div>

            {/* Text */}
            <p className="text-xs text-white/70 mt-2">
              Get faster access and a smoother app-like experience.
            </p>

            {/* Buttons */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={installApp}
                className="flex-1 bg-white text-black text-sm py-2 rounded-xl font-medium"
              >
                Install
              </button>

              <button
                onClick={dismiss}
                className="flex-1 bg-white/10 text-white text-sm py-2 rounded-xl"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(40px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}