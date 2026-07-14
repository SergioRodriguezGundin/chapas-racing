import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/ui/ProfileForm";

const DEFAULT_CAP_COLOR = "#3b82f6";

/** Página de perfil editable (protegida por layout + middleware). */
export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, cap_color, avatar_url, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  const initialProfile = {
    display_name:
      profile?.display_name ??
      (typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : typeof user.user_metadata?.name === "string"
          ? user.user_metadata.name
          : user.email?.split("@")[0] ?? "Jugador"),
    cap_color: profile?.cap_color ?? DEFAULT_CAP_COLOR,
    avatar_url:
      profile?.avatar_url ??
      (typeof user.user_metadata?.avatar_url === "string"
        ? user.user_metadata.avatar_url
        : null),
    updated_at: profile?.updated_at ?? new Date().toISOString(),
  };

  return (
    <main className="flex min-h-full items-center justify-center bg-background p-4">
      <ProfileForm userId={user.id} initialProfile={initialProfile} />
    </main>
  );
}
