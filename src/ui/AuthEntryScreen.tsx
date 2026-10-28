"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { useGameStore } from "@/stores/gameStore";
import { LoginForm } from "@/ui/LoginForm";

/** Entrada auth-first fullscreen: sesión activa / login / Saltar → mode. */
export function AuthEntryScreen() {
  const enterMode = useGameStore((s) => s.enterMode);
  const [sessionResolved, setSessionResolved] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled) return;
      if (user) {
        enterMode();
        return;
      }
      setSessionResolved(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        enterMode();
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [enterMode]);

  if (!sessionResolved) {
    return (
      <div
        className="absolute inset-0 z-10 flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm"
        aria-busy="true"
        aria-live="polite"
      >
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm">
      <LoginForm
        nextPath="/"
        onAuthSuccess={enterMode}
        showSkip
        onSkip={enterMode}
        showBackToGame={false}
      />
    </div>
  );
}
