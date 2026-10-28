"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "signIn" | "signUp";

interface LoginFormProps {
  nextPath: string;
  /** Si se pasa, tras login/registro con sesión se llama en lugar de router.push (flujo home auth-first). */
  onAuthSuccess?: () => void;
  /** Muestra botón «Saltar» (modo invitado). */
  showSkip?: boolean;
  onSkip?: () => void;
  /** Enlace «Volver al juego». Default true (página /login). */
  showBackToGame?: boolean;
}

const inputClassName =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-ring/50 transition-shadow focus-visible:border-ring focus-visible:ring-3";

const GOOGLE_OAUTH_SETUP_ERROR_MESSAGE =
  "Google OAuth no está configurado en Supabase. Un administrador debe añadir Client ID y Client Secret en Dashboard → Authentication → Providers → Google.";

/** Indica error de configuración OAuth de Google en el proyecto Supabase. */
function isGoogleOAuthSetupError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("missing oauth secret") ||
    normalized.includes("unsupported provider")
  );
}

/** Traduce errores comunes de Supabase Auth al español. */
function translateAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (isGoogleOAuthSetupError(message)) {
    return GOOGLE_OAUTH_SETUP_ERROR_MESSAGE;
  }
  if (normalized.includes("invalid login credentials")) {
    return "Email o contraseña incorrectos.";
  }
  if (normalized.includes("user already registered")) {
    return "Este email ya está registrado.";
  }
  if (normalized.includes("password should be at least")) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Confirma tu email antes de iniciar sesión.";
  }
  if (normalized.includes("invalid email")) {
    return "Email no válido.";
  }
  if (normalized.includes("signup is disabled")) {
    return "El registro está deshabilitado.";
  }
  if (normalized.includes("rate limit")) {
    return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  }

  return message || "Ha ocurrido un error. Inténtalo de nuevo.";
}

/** Formulario de login: email/contraseña y Google OAuth. */
export function LoginForm({
  nextPath,
  onAuthSuccess,
  showSkip = false,
  onSkip,
  showBackToGame = true,
}: LoginFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [googleOAuthSetupError, setGoogleOAuthSetupError] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const completeAuth = () => {
    if (onAuthSuccess) {
      onAuthSuccess();
      return;
    }
    router.push(nextPath);
    router.refresh();
  };

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setGoogleOAuthSetupError(false);
    setLoading(true);

    const supabase = createClient();

    try {
      if (mode === "signIn") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(translateAuthError(signInError.message));
          return;
        }

        completeAuth();
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(translateAuthError(signUpError.message));
        return;
      }

      if (data.session) {
        completeAuth();
        return;
      }

      setInfo(
        "Cuenta creada. Revisa tu email para confirmar el registro antes de iniciar sesión.",
      );
      setMode("signIn");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setInfo(null);
    setGoogleOAuthSetupError(false);
    setOauthLoading(true);

    const supabase = createClient();
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", nextPath);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
        queryParams: { prompt: "select_account" },
      },
    });

    if (oauthError) {
      setGoogleOAuthSetupError(isGoogleOAuthSetupError(oauthError.message));
      setError(translateAuthError(oauthError.message));
      setOauthLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-lg border border-border bg-popover p-6 shadow-lg">
      <header className="mb-6 text-center">
        <h1 className="font-heading text-2xl text-primary">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Accede para partidas online y tu perfil. El hot-seat en la home no
          requiere cuenta.
        </p>
      </header>

      <form className="flex flex-col gap-4" onSubmit={handleEmailSubmit}>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-email" className="text-xs font-medium text-muted-foreground">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            className={inputClassName}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="login-password"
            className="text-xs font-medium text-muted-foreground"
          >
            Contraseña
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete={mode === "signIn" ? "current-password" : "new-password"}
            required
            minLength={6}
            value={password}
            className={inputClassName}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <p>{error}</p>
            {googleOAuthSetupError && (
              <p className="mt-2 text-muted-foreground">
                <Link
                  href="/docs/setup-google-oauth"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Ver guía de configuración de Google OAuth
                </Link>
              </p>
            )}
          </div>
        )}

        {info && (
          <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
            {info}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={loading || oauthLoading}>
          {loading
            ? "Espera…"
            : mode === "signIn"
              ? "Entrar"
              : "Crear cuenta"}
        </Button>
      </form>

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">o</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        size="lg"
        disabled={loading || oauthLoading}
        onClick={handleGoogleSignIn}
      >
        {oauthLoading ? "Redirigiendo…" : "Continuar con Google"}
      </Button>

      <details className="mt-3 text-sm text-muted-foreground">
        <summary className="cursor-pointer text-center underline-offset-4 hover:text-foreground hover:underline">
          ¿Problemas con Google?
        </summary>
        <p className="mt-2 text-center">
          Si el inicio con Google falla, revisa la configuración en Supabase Dashboard
          (Client ID y Client Secret).{" "}
          <Link
            href="/docs/setup-google-oauth"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Guía paso a paso
          </Link>
        </p>
      </details>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        {mode === "signIn" ? (
          <>
            ¿No tienes cuenta?{" "}
            <button
              type="button"
              className="font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => {
                setMode("signUp");
                setError(null);
                setInfo(null);
                setGoogleOAuthSetupError(false);
              }}
            >
              Crear cuenta
            </button>
          </>
        ) : (
          <>
            ¿Ya tienes cuenta?{" "}
            <button
              type="button"
              className="font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => {
                setMode("signIn");
                setError(null);
                setInfo(null);
                setGoogleOAuthSetupError(false);
              }}
            >
              Iniciar sesión
            </button>
          </>
        )}
      </p>

      {showSkip && onSkip && (
        <div className="mt-6">
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            size="lg"
            disabled={loading || oauthLoading}
            onClick={onSkip}
          >
            Saltar
          </Button>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Continuar como invitado (hot-seat local).
          </p>
        </div>
      )}

      {showBackToGame && (
        <p className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Volver al juego
          </Link>
        </p>
      )}
    </div>
  );
}
