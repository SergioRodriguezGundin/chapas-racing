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
 * Capa de flujo de app por encima de MatchStatus (F02.5 / F03.5).
 * auth → mode → setup|online → match; newMatch / salir online → mode; logoutToAuth → auth.
 */
export type AppStage = "auth" | "mode" | "setup" | "online" | "match";

/** Hot-seat local vs partida online (F03-D). */
export type MatchMode = "local" | "online";

export type Vec3 = [number, number, number];

export interface Player {
  id: string;
  name: string;
  color: string;
  strokes: number;
  lastPosition: Vec3;
  startPosition: Vec3;
}

export interface PlayerConfig {
  name: string;
  color: string;
  /** Id estable (p.ej. user_id online); default `player-{i}`. */
  id?: string;
}

interface AimState {
  /** Dirección de disparo, unitaria, plano XZ */
  direction: Vec3;
  /** Potencia normalizada 0..1 */
  power: number;
}

export interface RemoteImpulse {
  direction: Vec3;
  power: number;
  from: Vec3;
}

const AIM_ZERO: AimState = { direction: [0, 0, -1], power: 0 };

interface GameState {
  /** Flujo auth-first (F02.5). Inicial: auth (login UI llega en F02.5-B). */
  appStage: AppStage;
  phase: GamePhase;
  status: MatchStatus;
  matchMode: MatchMode;
  players: Player[];
  activePlayerIndex: number;
  winnerIndex: number | null;
  aim: AimState;
  /** Contador que desacopla el teleport de reset del DOM: Cap observa su cambio. */
  resetRequestId: number;
  /** Online: Cap aplica impulso remoto al ver el id cambiar. */
  remoteImpulseRequestId: number;
  pendingRemoteImpulse: RemoteImpulse | null;
  /** Online: Cap teletransporta a pendingSnapshot[playerIndex]. */
  snapshotRequestId: number;
  pendingSnapshot: Vec3[] | null;

  startAiming: () => void;
  updateAim: (direction: Vec3, power: number) => void;
  cancelAim: () => void;
  /** Registra snapshot del jugador activo y pasa a moving. El impulso lo aplica la capa física. */
  launch: (from: Vec3) => void;
  /** Chapa activa parada -> idle y rota turno. */
  settle: () => void;
  /** Online remoto: launch + cola de impulso para Cap (sin re-emitir). */
  queueRemoteImpulse: (direction: Vec3, power: number, from: Vec3) => void;
  /** Online: teleport + alinear turno/strokes (sin +1 automático). */
  applySettleSnapshot: (
    positions: Vec3[],
    nextActiveSlot: number,
    strokes?: number[],
  ) => void;
  /** Primera chapa en cruzar la meta -> partida terminada. */
  playerFinished: (playerIndex: number) => void;
  /** Online: aplica ranking durable (postgres_changes / reconnect). */
  applyOnlineFinish: (winnerIndex: number, strokes: number[]) => void;
  /** Reinicia con los mismos jugadores (strokes y posiciones a salida). Permanece en match. */
  restart: () => void;
  /** Tras victoria: vuelve a mode para elegir local/online (no salta a setup). */
  newMatch: () => void;
  /** Inicia partida con la configuración elegida; entra en appStage match. */
  startMatch: (
    configs: PlayerConfig[],
    options?: {
      mode?: MatchMode;
      /** Dense active slot (reconnect mid-match). */
      activePlayerIndex?: number;
      /** Strokes por índice denso (reconnect). */
      strokes?: number[];
    },
  ) => void;
  /** Post-auth / skip → pantalla de elección Local | Online (F03.5-A). */
  enterMode: () => void;
  /** Mode → setup local (nº jugadores / nombres / colores; atrás → enterMode). */
  chooseLocal: () => void;
  /** Mode → lobby online (crear/unirse); requiere sesión (gate en UI). */
  chooseOnline: () => void;
  /** Entrada a setup local (uso interno / chooseLocal). */
  enterSetup: () => void;
  /** Logout path → auth; limpia partida sin dejar MatchStatus en playing/finished huérfanos. */
  logoutToAuth: () => void;
}

/** Partida limpia (status setup, sin jugadores). Usado al entrar/salir de auth y newMatch. */
const MATCH_CLEAN: Pick<
  GameState,
  | "phase"
  | "status"
  | "matchMode"
  | "players"
  | "activePlayerIndex"
  | "winnerIndex"
  | "aim"
  | "pendingRemoteImpulse"
  | "pendingSnapshot"
> = {
  phase: "idle",
  status: "setup",
  matchMode: "local",
  players: [],
  activePlayerIndex: 0,
  winnerIndex: null,
  aim: AIM_ZERO,
  pendingRemoteImpulse: null,
  pendingSnapshot: null,
};

export const useGameStore = create<GameState>((set) => ({
  appStage: "auth",
  ...MATCH_CLEAN,
  resetRequestId: 0,
  remoteImpulseRequestId: 0,
  snapshotRequestId: 0,

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
  queueRemoteImpulse: (direction, power, from) =>
    set((s) => {
      if (s.status !== "playing") return {};
      const idx = s.activePlayerIndex;
      return {
        phase: "moving",
        aim: AIM_ZERO,
        remoteImpulseRequestId: s.remoteImpulseRequestId + 1,
        pendingRemoteImpulse: { direction, power, from },
        players: s.players.map((p, i) =>
          i === idx
            ? { ...p, lastPosition: from, strokes: p.strokes + 1 }
            : p,
        ),
      };
    }),
  applySettleSnapshot: (positions, nextActiveSlot, strokes) =>
    set((s) => {
      if (s.status !== "playing") return {};
      const n = s.players.length;
      if (n === 0) return { phase: "idle" };
      const slot = ((nextActiveSlot % n) + n) % n;
      return {
        phase: "idle",
        activePlayerIndex: slot,
        pendingRemoteImpulse: null,
        snapshotRequestId: s.snapshotRequestId + 1,
        pendingSnapshot: positions,
        players: s.players.map((p, i) => ({
          ...p,
          lastPosition: positions[i] ?? p.lastPosition,
          strokes: strokes?.[i] ?? p.strokes,
        })),
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
  applyOnlineFinish: (winnerIndex, strokes) =>
    set((s) => {
      if (s.matchMode !== "online") return {};
      if (s.status === "finished" && s.winnerIndex === winnerIndex) {
        return {
          players: s.players.map((p, i) => ({
            ...p,
            strokes: strokes[i] ?? p.strokes,
          })),
        };
      }
      return {
        status: "finished",
        winnerIndex,
        phase: "idle",
        players: s.players.map((p, i) => ({
          ...p,
          strokes: strokes[i] ?? p.strokes,
        })),
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
      pendingRemoteImpulse: null,
      pendingSnapshot: null,
      players: s.players.map((p) => ({
        ...p,
        strokes: 0,
        lastPosition: p.startPosition,
      })),
      resetRequestId: s.resetRequestId + 1,
    })),
  newMatch: () =>
    set({
      appStage: "mode",
      ...MATCH_CLEAN,
    }),
  startMatch: (configs, options) => {
    const track = getCurrentTrack();
    const positions = computeStartPositions(track, configs.length);
    const n = configs.length;
    const active =
      options?.activePlayerIndex !== undefined
        ? ((options.activePlayerIndex % n) + n) % n
        : 0;
    const players: Player[] = configs.map((cfg, i) => ({
      id: cfg.id ?? `player-${i}`,
      name: cfg.name,
      color: cfg.color,
      strokes: options?.strokes?.[i] ?? 0,
      lastPosition: positions[i],
      startPosition: positions[i],
    }));
    set({
      appStage: "match",
      phase: "idle",
      status: "playing",
      matchMode: options?.mode ?? "local",
      players,
      activePlayerIndex: active,
      winnerIndex: null,
      aim: AIM_ZERO,
      resetRequestId: 0,
      pendingRemoteImpulse: null,
      pendingSnapshot: null,
    });
  },
  enterMode: () =>
    set({
      appStage: "mode",
      ...MATCH_CLEAN,
    }),
  chooseLocal: () =>
    set({
      appStage: "setup",
      ...MATCH_CLEAN,
    }),
  chooseOnline: () =>
    set({
      appStage: "online",
      ...MATCH_CLEAN,
    }),
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
