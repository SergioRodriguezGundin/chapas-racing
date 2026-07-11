import { create } from "zustand";

import { computeStartPositions } from "@/features/track/startPositions";
import { getCurrentTrack } from "@/features/track/track.types";

/**
 * Máquina de estados del turno.
 * idle -> aiming -> moving -> idle
 */
export type GamePhase = "idle" | "aiming" | "moving";

/** Ciclo de vida de la partida multijugador. */
export type MatchStatus = "setup" | "playing" | "finished";

export type Vec3 = [number, number, number];

export interface Player {
  id: string;
  name: string;
  color: string;
  strokes: number;
  lastPosition: Vec3;
  startPosition: Vec3;
}

interface AimState {
  /** Dirección de disparo, unitaria, plano XZ */
  direction: Vec3;
  /** Potencia normalizada 0..1 */
  power: number;
}

const AIM_ZERO: AimState = { direction: [0, 0, -1], power: 0 };

interface GameState {
  phase: GamePhase;
  status: MatchStatus;
  players: Player[];
  activePlayerIndex: number;
  winnerIndex: number | null;
  aim: AimState;
  /** Contador que desacopla el teleport de reset del DOM: Cap observa su cambio. */
  resetRequestId: number;

  startAiming: () => void;
  updateAim: (direction: Vec3, power: number) => void;
  cancelAim: () => void;
  /** Registra snapshot del jugador activo y pasa a moving. El impulso lo aplica la capa física. */
  launch: (from: Vec3) => void;
  /** Chapa activa parada -> idle y rota turno. */
  settle: () => void;
  /** Primera chapa en cruzar la meta -> partida terminada. */
  playerFinished: (playerIndex: number) => void;
  /** Reinicia con los mismos jugadores (strokes y posiciones a salida). */
  restart: () => void;
  /** Vuelve a setup para reconfigurar jugadores (F01-B/C). */
  newMatch: () => void;
  /** Inicia partida con la configuración elegida (F01-B). */
  startMatch: (configs: Array<{ name: string; color: string }>) => void;
}

export const useGameStore = create<GameState>((set) => ({
  phase: "idle",
  status: "setup",
  players: [],
  activePlayerIndex: 0,
  winnerIndex: null,
  aim: AIM_ZERO,
  resetRequestId: 0,

  startAiming: () =>
    set((s) => (s.status !== "playing" ? {} : { phase: "aiming", aim: AIM_ZERO })),
  updateAim: (direction, power) => set({ aim: { direction, power } }),
  cancelAim: () => set({ phase: "idle", aim: AIM_ZERO }),
  launch: (from) =>
    set((s) => {
      if (s.status !== "playing") return {};
      const idx = s.activePlayerIndex;
      return {
        phase: "moving",
        aim: AIM_ZERO,
        players: s.players.map((p, i) =>
          i === idx
            ? { ...p, lastPosition: from, strokes: p.strokes + 1 }
            : p,
        ),
      };
    }),
  settle: () =>
    set((s) => {
      if (s.status !== "playing") return {};
      const n = s.players.length;
      if (n === 0) return { phase: "idle" };
      return {
        phase: "idle",
        activePlayerIndex: (s.activePlayerIndex + 1) % n,
      };
    }),
  playerFinished: (playerIndex) =>
    set((s) => {
      if (s.status !== "playing") return {};
      return {
        status: "finished",
        winnerIndex: playerIndex,
        phase: "idle",
      };
    }),
  restart: () =>
    set((s) => ({
      phase: "idle",
      status: "playing",
      winnerIndex: null,
      aim: AIM_ZERO,
      activePlayerIndex: 0,
      players: s.players.map((p) => ({
        ...p,
        strokes: 0,
        lastPosition: p.startPosition,
      })),
      resetRequestId: s.resetRequestId + 1,
    })),
  newMatch: () =>
    set({
      phase: "idle",
      status: "setup",
      players: [],
      activePlayerIndex: 0,
      winnerIndex: null,
      aim: AIM_ZERO,
    }),
  startMatch: (configs) => {
    const track = getCurrentTrack();
    const positions = computeStartPositions(track, configs.length);
    const players: Player[] = configs.map((cfg, i) => ({
      id: `player-${i}`,
      name: cfg.name,
      color: cfg.color,
      strokes: 0,
      lastPosition: positions[i],
      startPosition: positions[i],
    }));
    set({
      phase: "idle",
      status: "playing",
      players,
      activePlayerIndex: 0,
      winnerIndex: null,
      aim: AIM_ZERO,
      resetRequestId: 0,
    });
  },
}));
