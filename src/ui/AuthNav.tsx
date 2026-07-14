"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

/** Enlace a login o perfil según sesión (no bloquea hot-seat). */
export function AuthNav() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();

    void supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoggedIn === null) {
    return null;
  }

  return (
    <nav
      className="pointer-events-auto absolute right-4 top-4 z-20 select-none"
      aria-label="Cuenta"
    >
      {isLoggedIn ? (
        <Link
          href="/profile"
          className="rounded-md border border-border bg-popover/90 px-3 py-1.5 text-sm font-medium text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-muted"
        >
          Mi perfil
        </Link>
      ) : (
        <Link
          href="/login"
          className="rounded-md border border-border bg-popover/90 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-muted hover:text-foreground"
        >
          Iniciar sesión
        </Link>
      )}
    </nav>
  );
}
