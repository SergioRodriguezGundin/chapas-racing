import { LoginForm } from "@/ui/LoginForm";

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

function sanitizeNextPath(next: string | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }
  return next;
}

/** Pantalla de login (email/contraseña + Google OAuth). */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = sanitizeNextPath(params.next);

  return (
    <main className="flex min-h-full items-center justify-center bg-background p-4">
      <LoginForm nextPath={nextPath} />
    </main>
  );
}
