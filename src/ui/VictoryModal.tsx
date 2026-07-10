"use client";

import { useGameStore } from "@/stores/gameStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** Overlay DOM fuera del Canvas. Visible al ganar; permite reiniciar la partida. */
export function VictoryModal() {
  const status = useGameStore((s) => s.status);
  const restart = useGameStore((s) => s.restart);
  const open = status === "won";

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="border-[rgb(45_212_167/40%)] bg-[#1b262c] text-center sm:max-w-sm"
      >
        <DialogHeader className="items-center text-center">
          <DialogTitle className="font-heading text-2xl text-[#2dd4a7]">
            ¡Meta!
          </DialogTitle>
          <DialogDescription className="text-[#e8eef1]/80">
            Has cruzado la línea de meta.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button type="button" className="rounded-full px-6" onClick={restart}>
            Jugar de nuevo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
