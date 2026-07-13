"use client";

import dynamic from "next/dynamic";

import { useGameStore } from "@/stores/gameStore";
import { AuthNav } from "@/ui/AuthNav";
import { Hud } from "@/ui/Hud";
import { SetupScreen } from "@/ui/SetupScreen";
import { VictoryModal } from "@/ui/VictoryModal";

// Canvas + Rapier (WASM) = client-only. SSR desactivado.
const GameCanvas = dynamic(
  () => import("@/core/GameCanvas").then((m) => m.GameCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full place-items-center text-lg tracking-wide text-muted-foreground">
        Cargando pista…
      </div>
    ),
  },
);

export default function Home() {
  const status = useGameStore((s) => s.status);

  return (
    <main className="fixed inset-0">
      <AuthNav />
      <GameCanvas />
      {status !== "setup" && <Hud />}
      <SetupScreen />
      <VictoryModal />
    </main>
  );
}
