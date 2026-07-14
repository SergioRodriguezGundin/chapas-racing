import Link from "next/link";

import { Button } from "@/components/ui/button";

const SUPABASE_PROJECT_REF = "tiwagdlcxnzfjnncqsrf";
const GOOGLE_REDIRECT_URI = `https://${SUPABASE_PROJECT_REF}.supabase.co/auth/v1/callback`;

/** Guía estática para configurar Google OAuth en Supabase. */
export default function SetupGoogleOAuthPage() {
  return (
    <main className="min-h-full bg-background p-4 py-10">
      <article className="mx-auto w-full max-w-2xl rounded-lg border border-border bg-popover p-6 shadow-lg">
        <header className="mb-6">
          <h1 className="font-heading text-2xl text-primary">
            Configurar Google OAuth
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Si ves el error «missing OAuth secret», el provider Google está activo en
            Supabase pero faltan credenciales. La configuración se hace en el Dashboard
            de Supabase, no en variables de entorno del proyecto.
          </p>
        </header>

        <section className="flex flex-col gap-4 text-sm text-foreground">
          <div>
            <h2 className="font-medium text-primary">1. Google Cloud Console</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
              <li>Crea un OAuth client ID (tipo Web application).</li>
              <li>
                Añade esta URI de redirección autorizada:
                <code className="mt-1 block rounded bg-muted px-2 py-1 text-xs text-foreground">
                  {GOOGLE_REDIRECT_URI}
                </code>
              </li>
              <li>Copia el Client ID y el Client Secret.</li>
            </ol>
          </div>

          <div>
            <h2 className="font-medium text-primary">2. Supabase Dashboard</h2>
            <p className="mt-2 text-muted-foreground">
              Proyecto{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                {SUPABASE_PROJECT_REF}
              </code>
              :
            </p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
              <li>
                <strong className="text-foreground">Authentication → Providers → Google</strong>{" "}
                — activa el provider y pega Client ID + Client Secret. Guarda.
              </li>
              <li>
                <strong className="text-foreground">Authentication → URL Configuration</strong>{" "}
                — Site URL: <code className="text-xs">http://localhost:3000</code>
              </li>
              <li>
                Redirect URLs:{" "}
                <code className="text-xs">http://localhost:3000/auth/callback</code>
              </li>
            </ol>
          </div>

          <div>
            <h2 className="font-medium text-primary">3. Verificar</h2>
            <p className="mt-2 text-muted-foreground">
              Reinicia <code className="text-xs">pnpm dev</code>, abre{" "}
              <code className="text-xs">/login</code> y pulsa «Continuar con Google». Deberías
              llegar a la pantalla de selección de cuenta de Google.
            </p>
          </div>

          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
            <h2 className="font-medium text-destructive">
              Error: missing OAuth secret
            </h2>
            <p className="mt-1 text-muted-foreground">
              Significa que falta el Client Secret (o el Client ID) en Supabase →
              Authentication → Providers → Google. Ambos campos son obligatorios.
            </p>
          </div>
        </section>

        <p className="mt-6 text-xs text-muted-foreground">
          Documentación completa en{" "}
          <code className="rounded bg-muted px-1 py-0.5">docs/setup-google-oauth.md</code> del
          repositorio.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button render={<Link href="/login" />} className="flex-1" size="lg">
            Volver al login
          </Button>
          <Button
            render={
              <a
                href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/auth/providers?provider=Google`}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            variant="outline"
            className="flex-1"
            size="lg"
          >
            Abrir Supabase Dashboard
          </Button>
        </div>
      </article>
    </main>
  );
}
