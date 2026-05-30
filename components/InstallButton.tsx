"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handler as EventListener
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handler as EventListener
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();

    const result = await deferredPrompt.userChoice;

    console.log(result.outcome);

    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!deferredPrompt || !visible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5">
      <div className="relative bg-black text-white rounded-2xl shadow-2xl px-4 py-3 w-[260px] border border-white/10">
        
        {/* Close Button */}
        <button
          onClick={() => setVisible(false)}
          className="absolute top-2 right-2 text-white/70 hover:text-white"
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className="pr-5">
          <h3 className="font-semibold text-sm">
            Install App
          </h3>

          <p className="text-xs text-white/70 mt-1">
            Install for faster access and app-like experience.
          </p>

          <button
            onClick={handleInstallClick}
            className="mt-3 w-full bg-white text-black rounded-xl py-2 text-sm font-medium hover:opacity-90 transition"
          >
            Install Now
          </button>
        </div>
      </div>
    </div>
  );
}