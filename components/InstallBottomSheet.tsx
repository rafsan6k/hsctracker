"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

export default function InstallBottomSheet() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("install-dismissed");
    if (dismissed) setHidden(true);
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("pwa-sheet-open", { detail: open }));
  }, [open]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // delay = feels like “native suggestion”, not spam
      setTimeout(() => {
        const dismissed = localStorage.getItem("install-dismissed");
        if (!dismissed) setOpen(true);
      }, 2500);
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

  const close = () => {
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
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={close}
        />
      )}

      {/* BOTTOM SHEET */}
      <div
        className={`
          fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-md
          transition-transform duration-300 ease-out
          ${open ? "translate-y-0" : "translate-y-full"}
        `}
      >
        <div className="bg-white rounded-t-2xl shadow-2xl p-5">
          
          {/* handle bar */}
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

          {/* title */}
          <h2 className="text-lg font-semibold text-center">
            Install App
          </h2>

          {/* subtitle */}
          <p className="text-sm text-gray-500 text-center mt-2">
            Faster access, better performance, offline support.
          </p>

          {/* buttons */}
          <div className="mt-5 flex flex-col gap-2">
            <button
              onClick={install}
              className="bg-black text-white py-3 rounded-xl font-medium active:scale-[0.98] transition"
            >
              Install
            </button>

            <button
              onClick={close}
              className="bg-gray-100 text-gray-700 py-3 rounded-xl font-medium active:scale-[0.98] transition"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}