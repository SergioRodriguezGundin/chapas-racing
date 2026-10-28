"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useGameStore } from "@/stores/gameStore";

/** Pantalla post-auth: elegir partida local u online (F03.5-A/C). */
export function ModeSelectScreen() {
  const chooseLocal = useGameStore((s) => s.chooseLocal);
  const chooseOnline = useGameStore((s) => s.chooseOnline);
  const logoutToAuth = useGameStore((s) => s.logoutToAuth);

  const [hasSession, setHasSession] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (!cancelled) setHasSession(!!user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session?.user);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    setLoggingOut(false);
    if (error) return;
    logoutToAuth();
  };

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-border bg-popover p-6 shadow-lg">
        <header className="mb-6 text-center">
          <h1 className="font-heading text-2xl text-primary">¿Cómo quieres jugar?</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Elige partida local (mismo dispositivo) u online.
          </p>
        </header>

        <div className="flex flex-col gap-3">
          <Button type="button" className="w-full" size="lg" onClick={chooseLocal}>
            Jugar en local
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            size="lg"
            disabled={!hasSession}
            onClick={chooseOnline}
          >
            Jugar online
          </Button>
        </div>

        {!hasSession ? (
          <div className="mt-3 space-y-2 text-center">
            <p className="text-sm text-muted-foreground" role="status">
              Inicia sesión para jugar online
            </p>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-sm"
              onClick={logoutToAuth}
            >
              Ir a iniciar sesión
            </Button>
          </div>
        ) : null}

        {hasSession ? (
          <Button
            type="button"
            variant="ghost"
            className="mt-4 w-full"
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
