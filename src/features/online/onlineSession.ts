import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

import { readCapPositions } from "@/features/online/capBodyRegistry";
import {
  isRoomEvent,
  ROOM_BROADCAST_EVENT,
  type DisconnectPayload,
  type LaunchPayload,
  type RoomEvent,
  type SettlePayload,
} from "@/features/online/roomEvents";
import type { Database, Json } from "@/types/supabase";
import { useGameStore, type Vec3 } from "@/stores/gameStore";

type BrowserClient = SupabaseClient<Database>;

interface OnlineSession {
  roomId: string;
  userId: string;
  /**
   * Dense match index 0..n-1 (same as Cap `playerIndex` / gameStore players[]).
   * Not DB `room_members.slot_index` (which may have gaps after leave).
   * Also used as `slot_index` / `active_slot` in Broadcast + RPCs.
   */
  slotIndex: number;
  /** Next launch/settle seq expected (matches rooms.turn_seq). */
  expectedTurnSeq: number;
  channel: RealtimeChannel;
  supabase: BrowserClient;
  /** Guard: only one finish_room RPC per local finish detection. */
  finishReported: boolean;
}

let session: OnlineSession | null = null;

export function getOnlineSession(): OnlineSession | null {
  return session;
}

export function isOnlineMatchActive(): boolean {
  return (
    session !== null && useGameStore.getState().matchMode === "online"
  );
}

/** Solo el dueño del slot activo puede apuntar/lanzar en este cliente. */
export function canLocalPlayerAim(playerIndex: number): boolean {
  if (!session) return true;
  if (useGameStore.getState().matchMode !== "online") return true;
  return (
    session.slotIndex === playerIndex &&
    useGameStore.getState().activePlayerIndex === playerIndex
  );
}

export function bindOnlineSession(params: {
  roomId: string;
  userId: string;
  /** Dense roster index (findIndex), not DB slot_index. */
  slotIndex: number;
  turnSeq: number;
  channel: RealtimeChannel;
  supabase: BrowserClient;
}): void {
  session = {
    roomId: params.roomId,
    userId: params.userId,
    slotIndex: params.slotIndex,
    expectedTurnSeq: params.turnSeq,
    channel: params.channel,
    supabase: params.supabase,
    finishReported: false,
  };

  params.channel.on(
    "broadcast",
    { event: ROOM_BROADCAST_EVENT },
    ({ payload }) => {
      if (!isRoomEvent(payload)) return;
      handleRoomEvent(payload);
    },
  );
}

export function clearOnlineSession(): void {
  session = null;
}

/** Sync expectedTurnSeq / active slot from durable rooms row (skip / reconnect). */
export function syncTurnFromRoom(
  turnSeq: number,
  activeSlot: number | null,
): void {
  const s = session;
  if (!s) return;
  s.expectedTurnSeq = turnSeq;
  if (activeSlot === null) return;
  const state = useGameStore.getState();
  if (state.status !== "playing" && state.status !== "finished") return;
  if (state.activePlayerIndex === activeSlot && state.phase === "idle") return;
  if (state.status === "finished") return;
  // Align idle turn without teleport when DB advanced (skip / late reconnect)
  if (state.phase !== "moving") {
    useGameStore.setState({ activePlayerIndex: activeSlot, phase: "idle" });
  }
}

function handleRoomEvent(event: RoomEvent): void {
  const s = session;
  if (!s) return;

  if (event.type === "launch") {
    applyRemoteLaunch(event.payload);
    return;
  }
  if (event.type === "disconnect_signal") {
    applyRemoteDisconnectSkip(event.payload);
    return;
  }
  applyRemoteSettle(event.payload);
}

function applyRemoteLaunch(payload: LaunchPayload): void {
  const s = session;
  if (!s) return;
  if (payload.user_id === s.userId) return;
  if (payload.turn_seq !== s.expectedTurnSeq) return;

  const state = useGameStore.getState();
  if (state.status !== "playing" || state.phase === "moving") return;
  if (payload.slot_index !== state.activePlayerIndex) return;

  const from: Vec3 = payload.from ?? state.players[payload.slot_index]?.lastPosition ?? [
    0, 0, 0,
  ];
  state.queueRemoteImpulse(payload.direction, payload.power, from);
}

function applyRemoteSettle(payload: SettlePayload): void {
  const s = session;
  if (!s) return;
  if (payload.user_id === s.userId) return;
  if (payload.turn_seq !== s.expectedTurnSeq) return;

  const state = useGameStore.getState();
  if (state.status !== "playing") return;

  state.applySettleSnapshot(
    payload.positions,
    payload.next_active_slot,
    payload.strokes,
  );
  s.expectedTurnSeq = payload.turn_seq + 1;
}

function applyRemoteDisconnectSkip(payload: DisconnectPayload): void {
  const s = session;
  if (!s) return;
  if (payload.user_id === s.userId) return;
  if (payload.turn_seq !== s.expectedTurnSeq) return;

  const state = useGameStore.getState();
  if (state.status !== "playing") return;

  const n = state.players.length;
  const positions =
    n > 0 ? readCapPositions(n) : state.players.map((p) => p.lastPosition);
  state.applySettleSnapshot(positions, payload.next_active_slot);
  s.expectedTurnSeq = payload.turn_seq + 1;
}

/**
 * Server-side launch gate. Call before local impulse + Broadcast.
 * Returns false if rejected (not active / seq mismatch / already launched).
 */
export async function submitRoomLaunch(
  direction: Vec3,
  power: number,
  from: Vec3,
): Promise<boolean> {
  const s = session;
  if (!s || useGameStore.getState().matchMode !== "online") return true;

  const { error } = await s.supabase.rpc("submit_room_launch", {
    p_room_id: s.roomId,
    p_turn_seq: s.expectedTurnSeq,
    p_direction: direction as unknown as Json,
    p_power: power,
    p_from: from as unknown as Json,
  });

  return !error;
}

/** Tras RPC OK + impulso local: replica a la sala (hint visual; autoridad = DB). */
export function broadcastLocalLaunch(
  direction: Vec3,
  power: number,
  from: Vec3,
): void {
  const s = session;
  if (!s || useGameStore.getState().matchMode !== "online") return;

  const event: RoomEvent = {
    v: 1,
    type: "launch",
    payload: {
      user_id: s.userId,
      slot_index: s.slotIndex,
      direction,
      power,
      from,
      turn_seq: s.expectedTurnSeq,
    },
  };

  void s.channel.send({
    type: "broadcast",
    event: ROOM_BROADCAST_EVENT,
    payload: event,
  });
}

/**
 * Activo detectó parada: snapshot + Broadcast settle + alinear store + DB turn.
 * Remotos no llaman esto (solo esperan Broadcast).
 */
export function commitLocalSettle(): void {
  const s = session;
  if (!s || useGameStore.getState().matchMode !== "online") {
    useGameStore.getState().settle();
    return;
  }

  const state = useGameStore.getState();
  if (state.status !== "playing" || state.phase !== "moving") return;
  if (state.activePlayerIndex !== s.slotIndex) return;

  const n = state.players.length;
  if (n === 0) return;

  const positions = readCapPositions(n);
  const nextActiveSlot = (state.activePlayerIndex + 1) % n;
  const strokes = state.players.map((p) => p.strokes);
  const turnSeq = s.expectedTurnSeq;

  const event: RoomEvent = {
    v: 1,
    type: "settle",
    payload: {
      user_id: s.userId,
      turn_seq: turnSeq,
      positions,
      next_active_slot: nextActiveSlot,
      strokes,
    },
  };

  void s.channel.send({
    type: "broadcast",
    event: ROOM_BROADCAST_EVENT,
    payload: event,
  });

  state.applySettleSnapshot(positions, nextActiveSlot, strokes);
  s.expectedTurnSeq = turnSeq + 1;

  void s.supabase.rpc("commit_room_settle", {
    p_room_id: s.roomId,
    p_turn_seq: turnSeq,
    p_next_active_slot: nextActiveSlot,
    p_strokes: strokes as unknown as Json,
  });
}

/**
 * Skip turno del ausente (RPC race-safe). Caller: cualquier miembro tras timeout.
 * Broadcast disconnect_signal para alinear clientes; DB gana en reconexión.
 */
export async function skipAbsentTurn(skippedUserId: string): Promise<boolean> {
  const s = session;
  if (!s || useGameStore.getState().matchMode !== "online") return false;

  const state = useGameStore.getState();
  if (state.status !== "playing") return false;
  // No saltar si nosotros somos el activo y aún estamos tirando
  if (state.phase === "moving" && state.activePlayerIndex === s.slotIndex) {
    return false;
  }

  const turnSeq = s.expectedTurnSeq;
  const { data, error } = await s.supabase.rpc("skip_room_turn", {
    p_room_id: s.roomId,
    p_turn_seq: turnSeq,
  });

  if (error || !data) return false;

  // Another client may have won the race — align to returned row
  const nextSlot = data.active_slot ?? 0;
  const nextSeq = data.turn_seq;

  if (s.expectedTurnSeq === turnSeq) {
    const n = state.players.length;
    const positions =
      n > 0 ? readCapPositions(n) : state.players.map((p) => p.lastPosition);
    useGameStore.getState().applySettleSnapshot(positions, nextSlot);
    s.expectedTurnSeq = nextSeq;

    const event: RoomEvent = {
      v: 1,
      type: "disconnect_signal",
      payload: {
        user_id: s.userId,
        skipped_user_id: skippedUserId,
        turn_seq: turnSeq,
        next_active_slot: nextSlot,
        reason: "timeout",
      },
    };
    void s.channel.send({
      type: "broadcast",
      event: ROOM_BROADCAST_EVENT,
      payload: event,
    });
  } else {
    s.expectedTurnSeq = nextSeq;
    useGameStore.setState({ activePlayerIndex: nextSlot, phase: "idle" });
  }

  return true;
}

/** Persist finish + ranking; idempotent. Call once after local playerFinished. */
export async function reportOnlineFinish(winnerPlayerIndex: number): Promise<void> {
  const s = session;
  if (!s || useGameStore.getState().matchMode !== "online") return;
  if (s.finishReported) return;
  s.finishReported = true;

  const state = useGameStore.getState();
  const winner = state.players[winnerPlayerIndex];
  if (!winner) return;

  const ranking = state.players.map((p) => ({
    user_id: p.id,
    strokes: p.strokes,
  }));

  await s.supabase.rpc("finish_room", {
    p_room_id: s.roomId,
    p_winner_user_id: winner.id,
    p_ranking: ranking as unknown as Json,
  });
}

/** Apply durable finished room to local store (remote clients / reconnect). */
export function applyFinishedRoom(
  winnerUserId: string,
  ranking: { userId: string; strokes: number }[],
): void {
  const state = useGameStore.getState();
  if (state.matchMode !== "online") return;

  const strokesByUser = new Map(ranking.map((r) => [r.userId, r.strokes]));
  const winnerIndex = state.players.findIndex((p) => p.id === winnerUserId);
  if (winnerIndex < 0) return;

  useGameStore.getState().applyOnlineFinish(
    winnerIndex,
    state.players.map((p) => strokesByUser.get(p.id) ?? p.strokes),
  );

  if (session) {
    session.finishReported = true;
  }
}
