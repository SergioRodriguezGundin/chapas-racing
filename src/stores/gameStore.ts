import { create } from "zustand";
import { CAP_START_POSITION } from "@/config/physics";

/**
 * Máquina de estados del turno.
 * idle -> aiming -> moving -> idle
 * Base del sistema de turnos multijugador (iter futura).
 */
export type GamePhase = "idle" | "aiming" | "moving";

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
  aim: AimState;
  /**
   * Snapshot de posición pre-lanzamiento.
   * Iter 2: si la chapa sale del circuito -> restaurar aquí.
   */
  lastPosition: Vec3;

  startAiming: () => void;
  updateAim: (direction: Vec3, power: number) => void;
  cancelAim: () => void;
  /** Registra snapshot y pasa a moving. El impulso lo aplica la capa física. */
  launch: (from: Vec3) => void;
  /** Chapa parada -> vuelve a idle. Iter futura: aquí rota el turno. */
  settle: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  phase: "idle",
  aim: AIM_ZERO,
  lastPosition: CAP_START_POSITION,

  startAiming: () => set({ phase: "aiming", aim: AIM_ZERO }),
  updateAim: (direction, power) => set({ aim: { direction, power } }),
  cancelAim: () => set({ phase: "idle", aim: AIM_ZERO }),
  launch: (from) => set({ phase: "moving", lastPosition: from, aim: AIM_ZERO }),
  settle: () => set({ phase: "idle" }),
}));
