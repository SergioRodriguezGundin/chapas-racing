"use client";

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

  return (
    <div className="hud">
      <p className="hud-phase">{PHASE_LABEL[phase]}</p>
      {phase === "aiming" && (
        <div className="hud-power">
          <div
            className="hud-power-fill"
            style={{
              width: `${Math.round(power * 100)}%`,
              background: `color-mix(in srgb, #ff4d3d ${power * 100}%, #2dd4a7)`,
            }}
          />
        </div>
      )}
    </div>
  );
}
