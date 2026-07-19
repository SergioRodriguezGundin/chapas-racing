/** Constantes de partidas online (lobby, códigos, tracks, resiliencia F03-E). */
export const ONLINE = {
  /** Capacidad por defecto al crear sala. */
  defaultMaxPlayers: 4,
  /** Mínimo de miembros en lobby para que el host pueda iniciar (F03-D). */
  minPlayersToStart: 2,
  /** Longitud del código corto (alineado a generate_room_code en F03-B). */
  roomCodeLength: 6,
  /** Track por defecto si el selector no cambia. */
  defaultTrackId: "circuit-01",
  /**
   * Tras ausencia del activo (Presence leave / last_seen stale), saltar turno.
   * Debe coincidir con `stale_secs` en RPC `skip_room_turn` (15s).
   */
  disconnectTurnTimeoutMs: 15_000,
  /** Heartbeat `room_members.last_seen_at` mientras hay canal suscrito. */
  presenceHeartbeatMs: 5_000,
} as const;

/** Pistas seleccionables en lobby. Preparado para multi-track. */
export const ONLINE_TRACKS = [
  { id: "circuit-01", label: "Circuito 01" },
] as const;

export type OnlineTrackId = (typeof ONLINE_TRACKS)[number]["id"];
