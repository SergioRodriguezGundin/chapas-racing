import type { Vec3 } from "@/stores/gameStore";

/** Envelope Broadcast v1 — progress/research_f03_realtime_sync.md §3 */
export type RoomEvent =
  | { v: 1; type: "launch"; payload: LaunchPayload }
  | { v: 1; type: "settle"; payload: SettlePayload }
  | { v: 1; type: "disconnect_signal"; payload: DisconnectPayload };

export interface LaunchPayload {
  user_id: string;
  /** Dense match playerIndex 0..n-1 (not DB room_members.slot_index). */
  slot_index: number;
  direction: Vec3;
  power: number;
  from?: Vec3;
  turn_seq: number;
}

export interface SettlePayload {
  user_id: string;
  turn_seq: number;
  positions: Vec3[];
  /** Dense next active playerIndex 0..n-1 (= rooms.active_slot). */
  next_active_slot: number;
  strokes?: number[];
}

export interface DisconnectPayload {
  user_id: string;
  skipped_user_id: string;
  turn_seq: number;
  next_active_slot: number;
  reason: "timeout";
}

export const ROOM_BROADCAST_EVENT = "room_event" as const;

export function isRoomEvent(value: unknown): value is RoomEvent {
  if (!value || typeof value !== "object") return false;
  const e = value as Record<string, unknown>;
  if (e.v !== 1) return false;
  if (
    e.type !== "launch" &&
    e.type !== "settle" &&
    e.type !== "disconnect_signal"
  ) {
    return false;
  }
  if (!e.payload || typeof e.payload !== "object") return false;
  return true;
}
