# Estado actual

## Fix Google OAuth — UX + docs ✅

**Error:** `missing OAuth secret` — causa: Supabase Dashboard sin Client Secret de Google.  
**Harness:** research → implement → review APPROVED.

### Fix real (manual — usuario)

1. [Google Cloud](https://console.cloud.google.com/) → OAuth client Web → redirect URI:
   `https://tiwagdlcxnzfjnncqsrf.supabase.co/auth/v1/callback`
2. [Supabase → Google provider](https://supabase.com/dashboard/project/tiwagdlcxnzfjnncqsrf/auth/providers?provider=Google) → Client ID + **Client Secret** → Save
3. Auth → URL Configuration → `http://localhost:3000/auth/callback` en Redirect URLs

Guía completa: `docs/setup-google-oauth.md` o `/docs/setup-google-oauth`

### Artefactos

- `progress/research_google_oauth_secret_error.md`
- `progress/impl_google_oauth_secret_fix.md`
- `progress/review_google_oauth_secret_fix.md` (APPROVED)

## Siguiente

Tras configurar Dashboard, probar Google login y continuar con F03 u otra tarea.
