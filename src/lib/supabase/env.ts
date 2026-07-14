/** Placeholders permiten `pnpm build` sin `.env.local`; sustituir en local/producción. */
const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE5MTAwMDAwMDB9.placeholder";

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? PLACEHOLDER_URL;
}

export function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? PLACEHOLDER_ANON_KEY;
}
