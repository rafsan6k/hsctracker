"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("install-dismissed") === "true") {
      setHidden(true);
    }
  }, []);

  useEffect(() => {
    // Broadcast open state to coordinate with InstallButton
    window.dispatchEvent(new CustomEvent("pwa-sheet-open", { detail: open }));
  }, [open]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // show like system permission (not instant)
      setTimeout(() => {
        if (!localStorage.getItem("install-dismissed")) {
          setOpen(true);
        }
      }, 5000);
    };

    window.addEventListener("beforeinstallprompt", handler as EventListener);

    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handler as EventListener
      );
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;

    setOpen(false);
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setOpen(false);
    setHidden(true);
    localStorage.setItem("install-dismissed", "true");
  };

  if (hidden || !deferredPrompt) return null;

  return (
    <>
      {/* BACKDROP */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={dismiss}
        />
      )}

      {/* BOTTOM SHEET */}
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-50
          flex justify-center
          transition-transform duration-300 ease-out
          ${open ? "translate-y-0" : "translate-y-full"}
        `}
      >
        <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl p-6 animate-[slideUp_0.25s_ease-out]">

          {/* HANDLE BAR (native feel) */}
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

          {/* ICON STYLE HEADER */}
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-black text-white flex items-center justify-center">
              ⬇
            </div>

            <h2 className="text-lg font-semibold">
              Install App
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Install for faster access, smoother experience and offline use.
            </p>
          </div>

          {/* BUTTONS */}
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={install}
              className="bg-black text-white py-3 rounded-xl font-medium active:scale-[0.98] transition"
            >
              Install now
            </button>

            <button
              onClick={dismiss}
              className="bg-gray-100 text-gray-700 py-3 rounded-xl font-medium active:scale-[0.98] transition"
            >
              Not now
            </button>
          </div>
        </div>
      </div>

      {/* ANIMATION */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
