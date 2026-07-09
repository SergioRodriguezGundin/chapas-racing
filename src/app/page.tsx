"use client";

import dynamic from "next/dynamic";
import { Hud } from "@/ui/Hud";
import { VictoryModal } from "@/ui/VictoryModal";

// Canvas + Rapier (WASM) = client-only. SSR desactivado.
const GameCanvas = dynamic(
  () => import("@/core/GameCanvas").then((m) => m.GameCanvas),
  { ssr: false, loading: () => <div className="loading">Cargando pista…</div> },
);

export default function Home() {
  return (
    <main className="game-root">
      <GameCanvas />
      <Hud />
      <VictoryModal />
    </main>
  );
}
