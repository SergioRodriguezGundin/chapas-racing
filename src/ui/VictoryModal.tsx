"use client";

import { useGameStore } from "@/stores/gameStore";

/** Overlay DOM fuera del Canvas. Visible al ganar; permite reiniciar la partida. */
export function VictoryModal() {
  const status = useGameStore((s) => s.status);
  const restart = useGameStore((s) => s.restart);

  if (status !== "won") return null;

  return (
    <div className="victory-overlay">
      <div className="victory-card">
        <h1 className="victory-title">¡Meta!</h1>
        <p className="victory-subtitle">Has cruzado la línea de meta.</p>
        <button type="button" className="victory-btn" onClick={restart}>
          Jugar de nuevo
        </button>
      </div>
    </div>
  );
}
