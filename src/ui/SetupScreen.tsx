"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { MATCH, PLAYER_COLORS } from "@/config/physics";
import { nearestPlayerColor } from "@/lib/nearestPlayerColor";
import { createClient } from "@/lib/supabase/client";
import { useGameStore } from "@/stores/gameStore";

interface PlayerDraft {
  name: string;
  color: string;
}

function createDefaultDrafts(count: number): PlayerDraft[] {
  return Array.from({ length: count }, (_, i) => ({
    name: `Jugador ${i + 1}`,
    color: PLAYER_COLORS[i % PLAYER_COLORS.length],
  }));
}

/** Pantalla de configuración previa a la partida (2–4 jugadores, nombre + color). */
export function SetupScreen() {
  const startMatch = useGameStore((s) => s.startMatch);
  const enterMode = useGameStore((s) => s.enterMode);
  const logoutToAuth = useGameStore((s) => s.logoutToAuth);

  const [drafts, setDrafts] = useState<PlayerDraft[]>(() =>
    createDefaultDrafts(MATCH.minPlayers),
  );
  const [hasSession, setHasSession] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  // Prefill una sola vez al montar setup (antes de editar); no re-aplicar tras edits.
  const [prefillReady, setPrefillReady] = useState(false);
  const prefillAppliedRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (!user) {
        setHasSession(false);
        setPrefillReady(true);
        return;
      }

      setHasSession(true);

      if (!prefillAppliedRef.current) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, cap_color")
          .eq("id", user.id)
          .maybeSingle();

        if (cancelled) return;

        const displayName =
          profile?.display_name?.trim() ||
          (typeof user.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : typeof user.user_metadata?.name === "string"
              ? user.user_metadata.name
              : user.email?.split("@")[0] ?? "Jugador");

        const capColor = profile?.cap_color
          ? nearestPlayerColor(profile.cap_color)
          : PLAYER_COLORS[0];

        prefillAppliedRef.current = true;
        setDrafts((prev) => {
          if (prev.length === 0) return prev;
          return [{ name: displayName, color: capColor }, ...prev.slice(1)];
        });
      }

      if (!cancelled) {
        setPrefillReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const playerCount = drafts.length;

  const setPlayerCount = (count: number) => {
    setDrafts((prev) => {
      if (count > prev.length) {
        const added = Array.from({ length: count - prev.length }, (_, i) => {
          const index = prev.length + i;
          return {
            name: `Jugador ${index + 1}`,
            color: PLAYER_COLORS[index % PLAYER_COLORS.length],
          };
        });
        return [...prev, ...added];
      }
      return prev.slice(0, count);
    });
  };

  const updateDraft = (index: number, patch: Partial<PlayerDraft>) => {
    setDrafts((prev) =>
      prev.map((draft, i) => (i === index ? { ...draft, ...patch } : draft)),
    );
  };

  const handleStart = () => {
    startMatch(
      drafts.map((draft, i) => ({
        name: draft.name.trim() || `Jugador ${i + 1}`,
        color: draft.color,
      })),
    );
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    setLoggingOut(false);
    if (error) return;
    logoutToAuth();
  };

  if (!prefillReady) {
    return (
      <div
        className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
        aria-busy="true"
        aria-live="polite"
      >
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-border bg-popover p-6 shadow-lg">
        <header className="mb-6 text-center">
          <h1 className="font-heading text-2xl text-primary">Nueva partida</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Elige jugadores, nombres y colores de chapa.
          </p>
        </header>

        <div className="mb-6 flex items-center justify-between gap-3">
          <span className="text-sm font-medium">Jugadores</span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={playerCount <= MATCH.minPlayers}
              aria-label="Quitar jugador"
              onClick={() => setPlayerCount(playerCount - 1)}
            >
              −
            </Button>
            <span className="min-w-6 text-center text-sm font-medium tabular-nums">
              {playerCount}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={playerCount >= MATCH.maxPlayers}
              aria-label="Añadir jugador"
              onClick={() => setPlayerCount(playerCount + 1)}
            >
              +
            </Button>
          </div>
        </div>

        <ul className="flex flex-col gap-4">
          {drafts.map((draft, index) => (
            <li
              key={index}
              className="flex flex-col gap-2 rounded-md border border-border bg-background/50 p-3"
            >
              <label className="text-xs font-medium text-muted-foreground">
                Jugador {index + 1}
              </label>
              <input
                type="text"
                value={draft.name}
                maxLength={24}
                placeholder={`Jugador ${index + 1}`}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-ring/50 transition-shadow focus-visible:border-ring focus-visible:ring-3"
                onChange={(e) => updateDraft(index, { name: e.target.value })}
              />
              <div className="flex gap-2" role="group" aria-label={`Color jugador ${index + 1}`}>
                {PLAYER_COLORS.map((color) => {
                  const selected = draft.color === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Color ${color}`}
                      aria-pressed={selected}
                      className="size-8 rounded-full border-2 transition-transform outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95"
                      style={{
                        backgroundColor: color,
                        borderColor: selected ? "var(--foreground)" : "transparent",
                      }}
                      onClick={() => updateDraft(index, { color })}
                    />
                  );
                })}
              </div>
            </li>
          ))}
        </ul>

        <Button type="button" className="mt-6 w-full" size="lg" onClick={handleStart}>
          Empezar
        </Button>

        <Button
          type="button"
          variant="outline"
          className="mt-3 w-full"
          onClick={enterMode}
        >
          Volver
        </Button>

        {hasSession ? (
          <Button
            type="button"
            variant="ghost"
            className="mt-3 w-full"
            disabled={loggingOut}
            onClick={() => void handleLogout()}
          >
            {loggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
