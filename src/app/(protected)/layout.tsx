import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function sanitizeNextPath(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) {
    return "/";
  }
  return path;
}

/** Guard server para rutas protegidas (segunda capa tras middleware). */
export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const headersList = await headers();
    const pathname = sanitizeNextPath(
      headersList.get("x-pathname") ?? "/",
    );
    redirect(`/login?next=${encodeURIComponent(pathname)}`);
  }

  return <>{children}</>;
}
