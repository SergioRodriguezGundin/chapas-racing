import { create } from "zustand";

import { getCurrentTrack } from "@/features/track/track.types";

/**
 * Máquina de estados del turno.
 * idle -> aiming -> moving -> idle
 * Base del sistema de turnos multijugador (iter futura).
 */
export type GamePhase = "idle" | "aiming" | "moving";

/** Estado global de partida: en juego o ganada. */
export type GameStatus = "playing" | "won";

export type Vec3 = [number, number, number];

interface AimState {
  /** Dirección de disparo, unitaria, plano XZ */
  direction: Vec3;
  /** Potencia normalizada 0..1 */
  power: number;
}

const AIM_ZERO: AimState = { direction: [0, 0, -1], power: 0 };

interface GameState {
  phase: GamePhase;
  status: GameStatus;
  aim: AimState;
  /**
   * Snapshot de posición pre-lanzamiento.
   * Iter 2: si la chapa sale del circuito -> restaurar aquí.
   */
  lastPosition: Vec3;
  /** Contador que desacopla el teleport de reset del DOM: Cap observa su cambio. */
  resetRequestId: number;

  startAiming: () => void;
  updateAim: (direction: Vec3, power: number) => void;
  cancelAim: () => void;
  /** Registra snapshot y pasa a moving. El impulso lo aplica la capa física. */
  launch: (from: Vec3) => void;
  /** Chapa parada -> vuelve a idle. Iter futura: aquí rota el turno. */
  settle: () => void;
  /** Chapa cruza la meta -> partida ganada. */
  win: () => void;
  /** Reinicia la partida al estado inicial completo y solicita teleport de la chapa. */
  restart: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  phase: "idle",
  status: "playing",
  aim: AIM_ZERO,
  lastPosition: getCurrentTrack().capStart,
  resetRequestId: 0,

  startAiming: () =>
    set((s) => (s.status !== "playing" ? {} : { phase: "aiming", aim: AIM_ZERO })),
  updateAim: (direction, power) => set({ aim: { direction, power } }),
  cancelAim: () => set({ phase: "idle", aim: AIM_ZERO }),
  launch: (from) => set({ phase: "moving", lastPosition: from, aim: AIM_ZERO }),
  settle: () => set({ phase: "idle" }),
  win: () => set({ status: "won" }),
  restart: () =>
    set((s) => ({
      phase: "idle",
      status: "playing",
      aim: AIM_ZERO,
      lastPosition: getCurrentTrack().capStart,
      resetRequestId: s.resetRequestId + 1,
    })),
}));
