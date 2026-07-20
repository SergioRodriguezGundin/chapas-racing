"use client";

import { useMemo } from "react";

import { useGameStore, type Player } from "@/stores/gameStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** Orden de ranking: 1º ganador, resto por strokes ascendente, desempate por índice. */
function computeRankingOrder(players: Player[], winnerIndex: number): number[] {
  const others = players
    .map((_, i) => i)
    .filter((i) => i !== winnerIndex)
    .sort((a, b) => {
      const strokeDiff = players[a].strokes - players[b].strokes;
      return strokeDiff !== 0 ? strokeDiff : a - b;
    });
  return [winnerIndex, ...others];
}

/** Overlay DOM fuera del Canvas. Ranking final y acciones de reinicio. */
export function VictoryModal() {
  const status = useGameStore((s) => s.status);
  const players = useGameStore((s) => s.players);
  const winnerIndex = useGameStore((s) => s.winnerIndex);
  const matchMode = useGameStore((s) => s.matchMode);
  const restart = useGameStore((s) => s.restart);
  const newMatch = useGameStore((s) => s.newMatch);
  const open = status === "finished";
  const isOnline = matchMode === "online";

  const ranking = useMemo(() => {
    if (winnerIndex === null || players.length === 0) return [];
    return computeRankingOrder(players, winnerIndex).map((playerIndex, i) => ({
      rank: i + 1,
      playerIndex,
      player: players[playerIndex],
      isWinner: playerIndex === winnerIndex,
    }));
  }, [players, winnerIndex]);

  const winnerName =
    winnerIndex !== null ? players[winnerIndex]?.name : undefined;

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="border-border bg-popover text-center sm:max-w-md"
      >
        <DialogHeader className="items-center text-center">
          <DialogTitle className="font-heading text-2xl text-primary">
            ¡Meta!
          </DialogTitle>
          <DialogDescription>
            {winnerName
              ? `${winnerName} ha cruzado la línea de meta.`
              : "Alguien ha cruzado la línea de meta."}
          </DialogDescription>
        </DialogHeader>

        {ranking.length > 0 && (
          <ol className="mx-auto w-full max-w-sm space-y-2 text-left">
            {ranking.map(({ rank, player, isWinner }) => (
              <li
                key={player.id}
                className={`flex items-center gap-3 rounded-md border px-3 py-2 ${
                  isWinner
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-background/50"
                }`}
              >
                <span className="w-6 shrink-0 text-center text-sm font-medium tabular-nums text-muted-foreground">
                  {rank}º
                </span>
                <span
                  className="size-4 shrink-0 rounded-full border border-border"
                  style={{ backgroundColor: player.color }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate font-medium">
                  {player.name}
                  {isWinner && (
                    <span className="ml-1.5 text-xs font-normal text-primary">
                      Ganador
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                  {player.strokes} {player.strokes === 1 ? "tiro" : "tiros"}
                </span>
              </li>
            ))}
          </ol>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-col sm:justify-center">
          {isOnline ? (
            <Button type="button" className="w-full" onClick={newMatch}>
              Volver al menú
            </Button>
          ) : (
            <>
              <Button type="button" className="w-full" onClick={restart}>
                Jugar de nuevo
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={newMatch}
              >
                Nueva partida
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
