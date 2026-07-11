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

/** Overlay DOM fuera del Canvas. Turnos, tiros, fase y potencia. */
export function Hud() {
  const phase = useGameStore((s) => s.phase);
  const power = useGameStore((s) => s.aim.power);
  const players = useGameStore((s) => s.players);
  const activePlayerIndex = useGameStore((s) => s.activePlayerIndex);

  const powerPercent = Math.round(power * 100);
  const activePlayer = players[activePlayerIndex];
  const turnOrder =
    players.length > 0
      ? Array.from({ length: players.length }, (_, i) => {
          const index = (activePlayerIndex + i) % players.length;
          return { player: players[index], index, isActive: i === 0 };
        })
      : [];

  return (
    <>
      <div className="pointer-events-none absolute left-4 top-4 select-none">
        <div className="rounded-lg border border-border bg-popover/90 px-3 py-2.5 shadow-sm backdrop-blur-sm">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Orden de turnos
          </p>
          <ul className="flex flex-col gap-1">
            {turnOrder.map(({ player, index, isActive }) => (
              <li
                key={player.id}
                className={`flex items-center gap-2 rounded-md px-2 py-1 text-sm ${
                  isActive ? "bg-muted font-medium" : "text-muted-foreground"
                }`}
              >
                <span
                  className="size-3 shrink-0 rounded-full border border-border"
                  style={{ backgroundColor: player.color }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate">{player.name}</span>
                <span className="text-xs tabular-nums">
                  {player.strokes} {player.strokes === 1 ? "tiro" : "tiros"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 select-none flex-col items-center gap-2.5">
        {activePlayer && (
          <Badge variant="secondary" className="gap-2 px-3.5 py-1.5 text-sm">
            <span
              className="size-2.5 shrink-0 rounded-full border border-border"
              style={{ backgroundColor: activePlayer.color }}
              aria-hidden
            />
            Turno de {activePlayer.name}
          </Badge>
        )}
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
    </>
  );
}
