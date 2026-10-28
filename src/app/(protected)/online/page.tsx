"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useGameStore } from "@/stores/gameStore";

/**
 * Bridge F03.5-C: /online (protegida) → hub con appStage online.
 * Misma UI create/join que ModeSelect → chooseOnline; no monta lobby aquí.
 */
export default function OnlinePage() {
  const router = useRouter();
  const chooseOnline = useGameStore((s) => s.chooseOnline);

  useEffect(() => {
    chooseOnline();
    router.replace("/");
  }, [chooseOnline, router]);

  return (
    <div className="grid h-dvh place-items-center text-sm text-muted-foreground">
      Redirigiendo al hub…
    </div>
  );
}
