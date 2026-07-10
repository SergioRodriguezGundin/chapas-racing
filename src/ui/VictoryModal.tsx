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
        className="border-border bg-popover text-center sm:max-w-sm"
      >
        <DialogHeader className="items-center text-center">
          <DialogTitle className="font-heading text-2xl text-primary">
            ¡Meta!
          </DialogTitle>
          <DialogDescription>
            Has cruzado la línea de meta.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button type="button" onClick={restart}>
            Jugar de nuevo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
