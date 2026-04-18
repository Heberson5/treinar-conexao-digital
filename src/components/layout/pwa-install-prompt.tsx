import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { isStandaloneApp } from "@/lib/pwa";
import { useIsMobile } from "@/hooks/use-mobile";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed-at";
const DISMISS_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 dias

export function PWAInstallPrompt() {
  const isMobile = useIsMobile();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandaloneApp()) return;

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_TTL_MS) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler as EventListener);
    return () => window.removeEventListener("beforeinstallprompt", handler as EventListener);
  }, []);

  if (!visible || !isMobile) return null;

  const onInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
  };

  const onDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  return (
    <div className="md:hidden fixed bottom-20 inset-x-3 z-50 rounded-2xl border bg-card text-card-foreground shadow-2xl p-3 flex items-center gap-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Download className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">Instalar como app</p>
        <p className="text-xs text-muted-foreground truncate">
          Acesso rápido na tela inicial e notificações.
        </p>
      </div>
      <Button size="sm" onClick={onInstall} className="h-8">
        Instalar
      </Button>
      <Button size="icon" variant="ghost" onClick={onDismiss} className="h-8 w-8 shrink-0" aria-label="Dispensar">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
