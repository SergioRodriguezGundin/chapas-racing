import Link from "next/link";

import { Button } from "@/components/ui/button";

/** Error tras fallo en el intercambio OAuth PKCE. */
export default function AuthCodeErrorPage() {
  return (
    <main className="flex min-h-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-popover p-6 text-center shadow-lg">
        <h1 className="font-heading text-2xl text-primary">Error de autenticación</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No se pudo completar el inicio de sesión con Google. El enlace puede haber
          caducado o la configuración de OAuth no es correcta.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button render={<Link href="/login" />} className="w-full" size="lg">
            Volver al login
          </Button>
          <Button
            render={<Link href="/" />}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Ir al juego
          </Button>
        </div>
      </div>
    </main>
  );
}
