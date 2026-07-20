"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { MATCH } from "@/config/physics";
import { ONLINE, ONLINE_TRACKS, type OnlineTrackId } from "@/config/online";
import {
  applyFinishedRoom,
  bindOnlineSession,
  clearOnlineSession,
  getOnlineSession,
  reportOnlineFinish,
  skipAbsentTurn,
  syncTurnFromRoom,
} from "@/features/online/onlineSession";
import { createClient } from "@/lib/supabase/client";
import { nearestPlayerColor } from "@/lib/nearestPlayerColor";
import { useGameStore } from "@/stores/gameStore";
import type { Database, Tables } from "@/types/supabase";
import { Hud } from "@/ui/Hud";
import { VictoryModal } from "@/ui/VictoryModal";

const GameCanvas = dynamic(
  () => import("@/core/GameCanvas").then((m) => m.GameCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full place-items-center text-lg tracking-wide text-muted-foreground">
        Cargando pista…
      </div>
    ),
  },
);

type RoomRow = Tables<"rooms">;

interface LobbyMember {
  userId: string;
  slotIndex: number;
  connected: boolean;
  strokes: number;
  displayName: string;
  capColor: string;
}

interface PresencePayload {
  user_id: string;
  slot_index: number;
  display_name: string;
  cap_color: string;
}

type EntryTab = "create" | "join";

type LobbyView =
  | { kind: "entry" }
  | { kind: "lobby"; room: RoomRow; myUserId: string }
  | { kind: "match"; room: RoomRow; myUserId: string };

const inputClassName =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-ring/50 transition-shadow focus-visible:border-ring focus-visible:ring-3";

/** Traduce errores de RPCs de sala a mensajes legibles. */
function translateRoomError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("room not found")) {
    return "Código de sala inválido.";
  }
  if (normalized.includes("room full")) {
    return "La sala está llena.";
  }
  if (normalized.includes("room not joinable")) {
    return "La sala ya no está en lobby (partida iniciada o finalizada).";
  }
  if (normalized.includes("room not startable")) {
    return "La sala no se puede iniciar (ya no está en lobby).";
  }
  if (normalized.includes("only host can start")) {
    return "Solo el host puede iniciar la partida.";
  }
  if (normalized.includes("need at least 2 players")) {
    return "Hacen falta al menos 2 jugadores para iniciar.";
  }
  if (normalized.includes("not authenticated")) {
    return "Debes iniciar sesión para continuar.";
  }
  if (normalized.includes("profile required")) {
    return "Necesitas un perfil. Visita Mi perfil y vuelve a intentarlo.";
  }
  if (normalized.includes("code required")) {
    return "Introduce un código de sala.";
  }
  if (normalized.includes("room_id required")) {
    return "Sala no válida.";
  }
  if (normalized.includes("track_id required")) {
    return "Selecciona una pista.";
  }
  if (normalized.includes("max_players")) {
    return "La capacidad debe ser entre 2 y 4 jugadores.";
  }
  if (normalized.includes("could not generate unique room code")) {
    return "No se pudo generar un código único. Inténtalo de nuevo.";
  }
  if (normalized.includes("not active player")) {
    return "Solo el jugador activo puede lanzar.";
  }
  if (normalized.includes("active player still present")) {
    return "El jugador activo sigue conectado.";
  }
  if (normalized.includes("turn_seq mismatch")) {
    return "Turno desfasado; espera al siguiente.";
  }
  if (normalized.includes("launch already submitted")) {
    return "Ya se ha registrado un lanzamiento en este turno.";
  }

  return message || "Ha ocurrido un error. Inténtalo de nuevo.";
}

function trackLabel(trackId: string): string {
  const found = ONLINE_TRACKS.find((t) => t.id === trackId);
  return found?.label ?? trackId;
}

function isPresencePayload(value: unknown): value is PresencePayload {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.user_id === "string" &&
    typeof v.slot_index === "number" &&
    typeof v.display_name === "string" &&
    typeof v.cap_color === "string"
  );
}

type BrowserClient = SupabaseClient<Database>;

async function fetchLobbyMembers(
  supabase: BrowserClient,
  roomId: string,
): Promise<{ members: LobbyMember[]; error: string | null }> {
  const { data, error: fetchError } = await supabase
    .from("room_members")
    .select(
      "user_id, slot_index, connected, last_seen_at, strokes, profiles(display_name, cap_color)",
    )
    .eq("room_id", roomId)
    .order("slot_index", { ascending: true });

  if (fetchError) {
    return { members: [], error: translateRoomError(fetchError.message) };
  }

  const members: LobbyMember[] = (data ?? []).map((row) => {
    const profile = row.profiles as
      | { display_name: string; cap_color: string }
      | null
      | undefined;
    return {
      userId: row.user_id,
      slotIndex: row.slot_index,
      connected: row.connected,
      strokes: row.strokes,
      displayName: profile?.display_name?.trim() || "Jugador",
      capColor: profile?.cap_color || "#3b82f6",
    };
  });

  return { members, error: null };
}

async function markMemberPresence(
  supabase: BrowserClient,
  roomId: string,
  userId: string,
  connected: boolean,
): Promise<void> {
  await supabase
    .from("room_members")
    .update({
      connected,
      last_seen_at: new Date().toISOString(),
    })
    .eq("room_id", roomId)
    .eq("user_id", userId);
}

function roomFromMembershipEmbed(
  rooms: RoomRow | RoomRow[] | null | undefined,
): RoomRow | null {
  if (!rooms) return null;
  return Array.isArray(rooms) ? (rooms[0] ?? null) : rooms;
}

/**
 * Reconnect pick: prefer lobby|playing (most recent joined_at).
 * Finished memberships are ignored and left so they cannot break maybeSingle-style reconnect.
 */
async function findActiveMembershipForReconnect(
  supabase: BrowserClient,
  userId: string,
): Promise<{ room: RoomRow; slotIndex: number } | null> {
  // 0..N rows possible (orphaned finished + new lobby) — never maybeSingle here.
  const { data: rows } = await supabase
    .from("room_members")
    .select("room_id, slot_index, joined_at, rooms(*)")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });

  if (!rows?.length) return null;

  let active: { room: RoomRow; slotIndex: number } | null = null;

  for (const row of rows) {
    const room = roomFromMembershipEmbed(
      row.rooms as RoomRow | RoomRow[] | null | undefined,
    );
    if (!room) continue;

    if (room.status === "lobby" || room.status === "playing") {
      if (!active) {
        active = { room, slotIndex: row.slot_index };
      }
      continue;
    }

    if (room.status === "finished") {
      void supabase.rpc("leave_room", { p_room_id: row.room_id });
    }
  }

  return active;
}

/** Lobby create/join + partida online (F03-D). `embedded`: overlay en hub `/`. */
export function OnlineLobby({ embedded = false }: { embedded?: boolean }) {
  const supabaseRef = useRef(createClient());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lobbyMetaRef = useRef<{ roomId: string; userId: string } | null>(null);
  const matchStartedRef = useRef(false);
  const membersRef = useRef<LobbyMember[]>([]);
  const presenceIdsRef = useRef<Set<string>>(new Set());
  const reconnectAttemptedRef = useRef(false);
  const skipInFlightRef = useRef(false);
  const absentSinceRef = useRef<number | null>(null);

  const [view, setView] = useState<LobbyView>({ kind: "entry" });
  const [tab, setTab] = useState<EntryTab>("create");
  const [trackId, setTrackId] = useState<OnlineTrackId>(ONLINE.defaultTrackId);
  const [maxPlayers, setMaxPlayers] = useState<number>(ONLINE.defaultMaxPlayers);
  const [joinCode, setJoinCode] = useState("");
  const [members, setMembers] = useState<LobbyMember[]>([]);
  const [presenceIds, setPresenceIds] = useState<Set<string>>(() => new Set());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const matchStatus = useGameStore((s) => s.status);
  const winnerIndex = useGameStore((s) => s.winnerIndex);
  const matchMode = useGameStore((s) => s.matchMode);
  const enterMode = useGameStore((s) => s.enterMode);

  const shellClassName = embedded
    ? "absolute inset-0 z-10 flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm"
    : "flex min-h-full items-center justify-center bg-background p-4";

  membersRef.current = members;
  presenceIdsRef.current = presenceIds;

  const teardownChannel = async () => {
    const channel = channelRef.current;
    channelRef.current = null;
    if (!channel) return;
    await supabaseRef.current.removeChannel(channel);
  };

  const beginOnlineMatch = async (room: RoomRow, myUserId: string) => {
    if (matchStartedRef.current) return;
    const channel = channelRef.current;
    if (!channel) return;

    // Roster canónico desde DB (orden slot_index) — no confiar en membersRef stale.
    const fetched = await fetchLobbyMembers(supabaseRef.current, room.id);
    if (fetched.error || fetched.members.length < ONLINE.minPlayersToStart) {
      setError(fetched.error ?? "Hacen falta al menos 2 jugadores para iniciar.");
      return;
    }
    const roster = fetched.members;
    setMembers(roster);
    membersRef.current = roster;

    // Índice denso 0..n-1 (= Cap playerIndex), no slot_index DB (puede tener gaps tras leave).
    const playerIndex = roster.findIndex((m) => m.userId === myUserId);
    if (playerIndex < 0) {
      setError("No estás en el roster de la sala.");
      return;
    }

    matchStartedRef.current = true;

    useGameStore.getState().startMatch(
      roster.map((m) => ({
        id: m.userId,
        name: m.displayName,
        color: nearestPlayerColor(m.capColor),
      })),
      {
        mode: "online",
        activePlayerIndex: room.active_slot ?? 0,
        strokes: roster.map((m) => m.strokes),
      },
    );

    bindOnlineSession({
      roomId: room.id,
      userId: myUserId,
      slotIndex: playerIndex,
      turnSeq: room.turn_seq ?? 0,
      channel,
      supabase: supabaseRef.current,
    });

    if (room.status === "finished" && room.winner_id) {
      applyFinishedRoom(
        room.winner_id,
        roster.map((m) => ({ userId: m.userId, strokes: m.strokes })),
      );
    }

    setView({ kind: "match", room, myUserId });
    setError(null);
  };

  const applyRoomFinished = async (room: RoomRow) => {
    if (!room.winner_id) return;
    const fetched = await fetchLobbyMembers(supabaseRef.current, room.id);
    if (fetched.error) return;
    applyFinishedRoom(
      room.winner_id,
      fetched.members.map((m) => ({ userId: m.userId, strokes: m.strokes })),
    );
  };

  const enterLobby = async (
    room: RoomRow,
    myUserId: string,
    presence: PresencePayload,
  ) => {
    const supabase = supabaseRef.current;
    await teardownChannel();
    matchStartedRef.current = false;
    clearOnlineSession();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      await supabase.realtime.setAuth(session.access_token);
    }

    const channel = supabase.channel(`room:${room.id}`, {
      config: {
        private: true,
        presence: { key: myUserId },
      },
    });

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "room_members",
        filter: `room_id=eq.${room.id}`,
      },
      () => {
        void fetchLobbyMembers(supabase, room.id).then((result) => {
          if (result.error) {
            setError(result.error);
            return;
          }
          setMembers(result.members);
          membersRef.current = result.members;
        });
        void supabase
          .from("rooms")
          .select("*")
          .eq("id", room.id)
          .maybeSingle()
          .then(({ data }) => {
            if (!data) return;
            setView((prev) =>
              prev.kind === "lobby" || prev.kind === "match"
                ? { ...prev, room: data }
                : prev,
            );
          });
      },
    );

    channel.on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "rooms",
        filter: `id=eq.${room.id}`,
      },
      (payload) => {
        const next = payload.new as RoomRow;
        setView((prev) =>
          prev.kind === "lobby" || prev.kind === "match"
            ? { ...prev, room: next }
            : prev,
        );
        if (next.status === "playing") {
          void beginOnlineMatch(next, myUserId);
          const session = getOnlineSession();
          if (session) {
            syncTurnFromRoom(next.turn_seq, next.active_slot);
          }
        }
        if (next.status === "finished") {
          void applyRoomFinished(next);
        }
      },
    );

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const ids = new Set<string>();
      for (const entries of Object.values(state)) {
        for (const entry of entries) {
          if (isPresencePayload(entry)) {
            ids.add(entry.user_id);
          }
        }
      }
      setPresenceIds(ids);
    });

    channel.subscribe(async (status) => {
      if (status !== "SUBSCRIBED") return;
      await channel.track(presence);
      await markMemberPresence(supabase, room.id, myUserId, true);
    });

    channelRef.current = channel;
    lobbyMetaRef.current = { roomId: room.id, userId: myUserId };
    setView({ kind: "lobby", room, myUserId });

    const initial = await fetchLobbyMembers(supabase, room.id);
    if (initial.error) {
      setError(initial.error);
      return;
    }
    setMembers(initial.members);
    membersRef.current = initial.members;

    if (room.status === "playing" || room.status === "finished") {
      void beginOnlineMatch(room, myUserId);
    }
  };

  // Reconexión: membership en sala lobby|playing (ignora finished huérfano).
  // leave_room solo botón / victory / cleanup finished — no en unmount de activa.
  useEffect(() => {
    if (reconnectAttemptedRef.current) return;
    reconnectAttemptedRef.current = true;

    void (async () => {
      const supabase = supabaseRef.current;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const membership = await findActiveMembershipForReconnect(
        supabase,
        user.id,
      );
      if (!membership) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, cap_color")
        .eq("id", user.id)
        .maybeSingle();

      await enterLobby(membership.room, user.id, {
        user_id: user.id,
        slot_index: membership.slotIndex,
        display_name: profile?.display_name?.trim() || "Jugador",
        cap_color: profile?.cap_color || "#3b82f6",
      });
    })();
  }, []);

  // Unmount: Presence off; leave_room solo si ya volvimos a mode/auth (newMatch / salir).
  // Unmount con sesión online activa conserva membership para reconnect.
  useEffect(() => {
    return () => {
      const meta = lobbyMetaRef.current;
      lobbyMetaRef.current = null;
      const current = channelRef.current;
      channelRef.current = null;
      clearOnlineSession();
      matchStartedRef.current = false;

      const stage = useGameStore.getState().appStage;
      if (meta && (stage === "mode" || stage === "auth")) {
        void supabaseRef.current.rpc("leave_room", {
          p_room_id: meta.roomId,
        });
      } else if (meta) {
        void markMemberPresence(
          supabaseRef.current,
          meta.roomId,
          meta.userId,
          false,
        );
      }
      if (current) {
        void supabaseRef.current.removeChannel(current);
      }
    };
  }, []);

  // Heartbeat last_seen_at while in lobby/match (skip RPC stale check).
  useEffect(() => {
    if (view.kind !== "lobby" && view.kind !== "match") return;
    const roomId = view.room.id;
    const userId = view.myUserId;
    const tick = () => {
      void markMemberPresence(supabaseRef.current, roomId, userId, true);
    };
    tick();
    const id = window.setInterval(tick, ONLINE.presenceHeartbeatMs);
    return () => window.clearInterval(id);
  }, [view]);

  // Disconnect skip: si el activo no está en Presence, tras timeout → skip_room_turn.
  useEffect(() => {
    if (view.kind !== "match") return;
    if (matchStatus !== "playing" || matchMode !== "online") return;

    const id = window.setInterval(() => {
      const state = useGameStore.getState();
      if (state.status !== "playing" || state.matchMode !== "online") return;

      const roster = membersRef.current;
      const active = roster[state.activePlayerIndex];
      if (!active) return;

      const live = presenceIdsRef.current.has(active.userId);
      const memberConnected = active.connected;
      const absent = !live || !memberConnected;

      if (!absent) {
        absentSinceRef.current = null;
        return;
      }

      const now = Date.now();
      if (absentSinceRef.current === null) {
        absentSinceRef.current = now;
        return;
      }

      if (now - absentSinceRef.current < ONLINE.disconnectTurnTimeoutMs) return;
      if (skipInFlightRef.current) return;

      // No auto-skip our own turn while we still have the page (Presence glitch)
      const session = getOnlineSession();
      if (session && active.userId === session.userId && live) return;

      skipInFlightRef.current = true;
      void skipAbsentTurn(active.userId).finally(() => {
        skipInFlightRef.current = false;
        absentSinceRef.current = null;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [view.kind, matchStatus, matchMode]);

  // Local finish → persist ranking (idempotent RPC).
  useEffect(() => {
    if (view.kind !== "match") return;
    if (matchMode !== "online") return;
    if (matchStatus !== "finished" || winnerIndex === null) return;
    void reportOnlineFinish(winnerIndex);
  }, [view.kind, matchMode, matchStatus, winnerIndex]);

  // newMatch → mode: el hub desmonta OnlineLobby; unmount hace leave_room (stage mode/auth).

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const supabase = supabaseRef.current;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Debes iniciar sesión para continuar.");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, cap_color")
        .eq("id", user.id)
        .maybeSingle();

      const { data: room, error: rpcError } = await supabase.rpc("create_room", {
        p_track_id: trackId,
        p_max_players: maxPlayers,
      });

      if (rpcError || !room) {
        setError(translateRoomError(rpcError?.message ?? "No se pudo crear la sala."));
        return;
      }

      await enterLobby(room, user.id, {
        user_id: user.id,
        slot_index: 0,
        display_name: profile?.display_name?.trim() || "Jugador",
        cap_color: profile?.cap_color || "#3b82f6",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const supabase = supabaseRef.current;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Debes iniciar sesión para continuar.");
        return;
      }

      const code = joinCode.trim().toUpperCase();
      if (!code) {
        setError("Introduce un código de sala.");
        return;
      }

      const { data: membership, error: rpcError } = await supabase.rpc(
        "join_room",
        { p_code: code },
      );

      if (rpcError || !membership) {
        setError(
          translateRoomError(rpcError?.message ?? "No se pudo unir a la sala."),
        );
        return;
      }

      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", membership.room_id)
        .single();

      if (roomError || !room) {
        setError(translateRoomError(roomError?.message ?? "Sala no encontrada."));
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, cap_color")
        .eq("id", user.id)
        .maybeSingle();

      await enterLobby(room, user.id, {
        user_id: user.id,
        slot_index: membership.slot_index,
        display_name: profile?.display_name?.trim() || "Jugador",
        cap_color: profile?.cap_color || "#3b82f6",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleStart = async () => {
    if (view.kind !== "lobby") return;
    setBusy(true);
    setError(null);
    try {
      const { data: room, error: rpcError } = await supabaseRef.current.rpc(
        "start_room",
        { p_room_id: view.room.id },
      );
      if (rpcError || !room) {
        setError(
          translateRoomError(rpcError?.message ?? "No se pudo iniciar la partida."),
        );
        return;
      }
      await beginOnlineMatch(room, view.myUserId);
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    if (view.kind !== "lobby") return;
    setBusy(true);
    setError(null);
    const roomId = view.room.id;
    try {
      lobbyMetaRef.current = null;
      clearOnlineSession();
      matchStartedRef.current = false;
      const { error: leaveError } = await supabaseRef.current.rpc(
        "leave_room",
        { p_room_id: roomId },
      );
      if (leaveError) {
        lobbyMetaRef.current = { roomId, userId: view.myUserId };
        setError(translateRoomError(leaveError.message));
        return;
      }
      await teardownChannel();
      setMembers([]);
      setPresenceIds(new Set());
      enterMode();
    } finally {
      setBusy(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("No se pudo copiar el código.");
    }
  };

  if (view.kind === "match") {
    const matchChrome = (
      <>
        <Hud />
        <VictoryModal />
        <div className="pointer-events-none absolute right-4 top-4 select-none">
          <p className="rounded-md border border-border bg-popover/90 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur-sm">
            Sala {view.room.code}
          </p>
        </div>
      </>
    );

    // Hub ya monta GameCanvas; embedded reutiliza el del padre.
    if (embedded) {
      return matchChrome;
    }

    return (
      <main className="fixed inset-0">
        <GameCanvas />
        {matchChrome}
      </main>
    );
  }

  if (view.kind === "lobby") {
    const { room, myUserId } = view;
    const isHost = myUserId === room.host_id;
    const canStart =
      isHost && members.length >= ONLINE.minPlayersToStart && !busy;

    return (
      <div className={shellClassName}>
        <div className="w-full max-w-md rounded-lg border border-border bg-popover p-6 shadow-lg">
          <header className="mb-6 text-center">
            <h1 className="font-heading text-2xl text-primary">Lobby</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Comparte el código para que se unan tus rivales.
            </p>
          </header>

          <div className="mb-4 rounded-md border border-border bg-background/50 p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Código</p>
                <p className="font-heading text-2xl tracking-widest text-foreground">
                  {room.code}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleCopyCode(room.code)}
              >
                {copied ? "Copiado" : "Copiar"}
              </Button>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Pista</dt>
                <dd className="font-medium">{trackLabel(room.track_id)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Capacidad</dt>
                <dd className="font-medium">
                  {members.length}/{room.max_players}
                </dd>
              </div>
            </dl>
          </div>

          <h2 className="mb-2 text-sm font-medium">Jugadores</h2>
          <ul className="mb-6 flex flex-col gap-2">
            {members.map((member) => {
              const live = presenceIds.has(member.userId);
              const host = member.userId === room.host_id;
              return (
                <li
                  key={member.userId}
                  className="flex items-center gap-3 rounded-md border border-border bg-background/50 px-3 py-2"
                >
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: member.capColor }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {member.displayName}
                      {member.userId === myUserId ? " (tú)" : ""}
                      {host ? (
                        <span className="ml-1 text-xs font-normal text-primary">
                          · Host
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Slot {member.slotIndex + 1}
                      {" · "}
                      {live ? "Conectado" : "Ausente"}
                    </p>
                  </div>
                  <span
                    className={
                      live
                        ? "size-2 shrink-0 rounded-full bg-emerald-500"
                        : "size-2 shrink-0 rounded-full bg-muted-foreground/40"
                    }
                    title={live ? "Conectado" : "Ausente"}
                    aria-label={live ? "Conectado" : "Ausente"}
                  />
                </li>
              );
            })}
          </ul>

          {error ? (
            <p className="mb-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="button"
            className="w-full"
            size="lg"
            disabled={!canStart}
            title={
              !isHost
                ? "Solo el host puede iniciar"
                : members.length < ONLINE.minPlayersToStart
                  ? `Mínimo ${ONLINE.minPlayersToStart} jugadores`
                  : "Iniciar partida"
            }
            onClick={() => void handleStart()}
          >
            {busy ? "Iniciando…" : "Iniciar partida"}
          </Button>
          {!isHost ? (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Esperando a que el host inicie la partida.
            </p>
          ) : members.length < ONLINE.minPlayersToStart ? (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Se necesitan al menos {ONLINE.minPlayersToStart} jugadores.
            </p>
          ) : null}

          <Button
            type="button"
            variant="ghost"
            className="mt-3 w-full"
            disabled={busy}
            onClick={() => void handleLeave()}
          >
            Salir del lobby
          </Button>

          <p className="mt-4 text-center">
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-sm text-muted-foreground"
              disabled={busy}
              onClick={enterMode}
            >
              Volver al menú
            </Button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={shellClassName}>
      <div className="w-full max-w-md rounded-lg border border-border bg-popover p-6 shadow-lg">
        <header className="mb-6 text-center">
          <h1 className="font-heading text-2xl text-primary">Partidas online</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea una sala o únete con un código.
          </p>
        </header>

        <div
          className="mb-6 grid grid-cols-2 gap-1 rounded-md border border-border p-1"
          role="tablist"
          aria-label="Modo de entrada"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "create"}
            className={
              tab === "create"
                ? "rounded-sm bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                : "rounded-sm px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            }
            onClick={() => {
              setTab("create");
              setError(null);
            }}
          >
            Crear sala
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "join"}
            className={
              tab === "join"
                ? "rounded-sm bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                : "rounded-sm px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            }
            onClick={() => {
              setTab("join");
              setError(null);
            }}
          >
            Unirse
          </button>
        </div>

        {tab === "create" ? (
          <form className="flex flex-col gap-4" onSubmit={(e) => void handleCreate(e)}>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Pista</span>
              <select
                className={inputClassName}
                value={trackId}
                onChange={(e) => setTrackId(e.target.value as OnlineTrackId)}
              >
                {ONLINE_TRACKS.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">Jugadores (máx.)</span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={maxPlayers <= MATCH.minPlayers}
                  aria-label="Reducir capacidad"
                  onClick={() => setMaxPlayers((n) => Math.max(MATCH.minPlayers, n - 1))}
                >
                  −
                </Button>
                <span className="min-w-6 text-center text-sm font-medium tabular-nums">
                  {maxPlayers}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={maxPlayers >= MATCH.maxPlayers}
                  aria-label="Aumentar capacidad"
                  onClick={() => setMaxPlayers((n) => Math.min(MATCH.maxPlayers, n + 1))}
                >
                  +
                </Button>
              </div>
            </div>

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {busy ? "Creando…" : "Crear sala"}
            </Button>
          </form>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={(e) => void handleJoin(e)}>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Código de sala</span>
              <input
                type="text"
                value={joinCode}
                maxLength={ONLINE.roomCodeLength}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                placeholder="ABC123"
                className={`${inputClassName} uppercase tracking-widest`}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              />
            </label>

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {busy ? "Uniéndose…" : "Unirse"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center">
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-sm text-muted-foreground"
            onClick={enterMode}
          >
            Volver al menú
          </Button>
        </p>
      </div>
    </div>
  );
}
