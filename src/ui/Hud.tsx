"use client";

import type { CSSProperties } from "react";

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
    <div className="hud">
      <p className="hud-phase">{PHASE_LABEL[phase]}</p>
      {phase === "aiming" && (
        <div
          style={
            {
              "--power-fill": `color-mix(in srgb, #ff4d3d ${powerPercent}%, #2dd4a7)`,
            } as CSSProperties
          }
        >
          <Progress
            value={powerPercent}
            className="w-[220px] gap-0 [&_[data-slot=progress-indicator]]:rounded-full [&_[data-slot=progress-indicator]]:bg-[var(--power-fill)] [&_[data-slot=progress-indicator]]:transition-[width] [&_[data-slot=progress-indicator]]:duration-[40ms] [&_[data-slot=progress-track]]:h-2.5 [&_[data-slot=progress-track]]:rounded-full [&_[data-slot=progress-track]]:bg-white/15"
          />
        </div>
      )}
    </div>
  );
}
