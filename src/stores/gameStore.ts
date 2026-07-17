import { create } from "zustand";

import { computeStartPositions } from "@/features/track/startPositions";
import { getCurrentTrack } from "@/features/track/track.types";

/**
 * Máquina de estados del turno.
 * idle -> aiming -> moving -> idle
 */
export type GamePhase = "idle" | "aiming" | "moving";

/** Ciclo de vida de la partida multijugador (F01). Independiente de AppStage. */
export type MatchStatus = "setup" | "playing" | "finished";

/**
 * Capa de flujo de app por encima de MatchStatus (F02.5).
 * auth → setup → match; newMatch vuelve a setup; logoutToAuth → auth.
 */
export type AppStage = "auth" | "setup" | "match";

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
  /** Flujo auth-first (F02.5). Inicial: auth (login UI llega en F02.5-B). */
  appStage: AppStage;
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
  /** Reinicia con los mismos jugadores (strokes y posiciones a salida). Permanece en match. */
  restart: () => void;
  /** Vuelve a setup para reconfigurar jugadores (no a auth). */
  newMatch: () => void;
  /** Inicia partida con la configuración elegida; entra en appStage match. */
  startMatch: (configs: Array<{ name: string; color: string }>) => void;
  /** Skip/login path → setup (F02.5-B). */
  enterSetup: () => void;
  /** Logout path → auth; limpia partida sin dejar MatchStatus en playing/finished huérfanos. */
  logoutToAuth: () => void;
}

/** Partida limpia (status setup, sin jugadores). Usado al entrar/salir de auth y newMatch. */
const MATCH_CLEAN: Pick<
  GameState,
  "phase" | "status" | "players" | "activePlayerIndex" | "winnerIndex" | "aim"
> = {
  phase: "idle",
  status: "setup",
  players: [],
  activePlayerIndex: 0,
  winnerIndex: null,
  aim: AIM_ZERO,
};

export const useGameStore = create<GameState>((set) => ({
  appStage: "auth",
  ...MATCH_CLEAN,
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
      appStage: "match",
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
      appStage: "setup",
      ...MATCH_CLEAN,
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
      appStage: "match",
      phase: "idle",
      status: "playing",
      players,
      activePlayerIndex: 0,
      winnerIndex: null,
      aim: AIM_ZERO,
      resetRequestId: 0,
    });
  },
  enterSetup: () =>
    set({
      appStage: "setup",
      ...MATCH_CLEAN,
    }),
  logoutToAuth: () =>
    set({
      appStage: "auth",
      ...MATCH_CLEAN,
    }),
}));
