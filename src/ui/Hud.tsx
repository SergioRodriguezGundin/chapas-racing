"use client";

import type { CSSProperties } from "react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useGameStore } from "@/stores/gameStore";

const PHASE_LABEL: Record<string, string> = {
  idle: "Pulsa la chapa y arrastra hacia atrás",
  aiming: "Suelta para lanzar · vuelve al origen para cancelar",
  moving: "Chapa en movimiento…",
};

/** Overlay DOM fuera del Canvas. Barra de potencia + instrucción de fase. */
export function Hud() {
  const phase = useGameStore((s) => s.phase);
  const power = useGameStore((s) => s.aim.power);
  const powerPercent = Math.round(power * 100);

  return (
    <div className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 select-none flex-col items-center gap-2.5">
      <Badge variant="secondary" className="px-3.5 py-1.5 text-sm">
        {PHASE_LABEL[phase]}
      </Badge>
      {phase === "aiming" && (
        <div
          style={
            {
              "--power-fill": `color-mix(in srgb, var(--destructive) ${powerPercent}%, var(--primary))`,
            } as CSSProperties
          }
        >
          <Progress
            value={powerPercent}
            className="w-[220px] gap-0 [&_[data-slot=progress-indicator]]:rounded-full [&_[data-slot=progress-indicator]]:bg-[var(--power-fill)] [&_[data-slot=progress-indicator]]:transition-[width] [&_[data-slot=progress-indicator]]:duration-[40ms] [&_[data-slot=progress-track]]:h-2.5 [&_[data-slot=progress-track]]:rounded-full [&_[data-slot=progress-track]]:bg-muted"
          />
        </div>
      )}
    </div>
  );
}
