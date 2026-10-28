# Review — google_oauth_secret_fix

**Veredicto:** APPROVED

## Criterios de aceptación
- CA1: [x] `translateAuthError` mapea `missing oauth secret` / `unsupported provider` a mensaje ES accionable (`src/ui/LoginForm.tsx` L19–37)
- CA2: [x] Mensaje menciona Supabase Dashboard → Authentication → Providers → Google → Client ID + Secret (`GOOGLE_OAUTH_SETUP_ERROR_MESSAGE`, L19–20)
- CA3: [x] Enlace a `/docs/setup-google-oauth` desde error OAuth (`googleOAuthSetupError`, L199–207) y sección `<details>` de ayuda (L244–257)
- CA4: [x] `docs/setup-google-oauth.md` incluye project ref `tiwagdlcxnzfjnncqsrf`, redirect URI Google, URLs locales y troubleshooting (L5–112)
- CA5: [x] `.env.local.example` documenta que Google OAuth no usa env vars (L10–19)
- CA6: [x] Sin cambios al flujo `signInWithOAuth` ni nuevas dependencias
- CA7: [x] Login email/password intacto (`handleEmailSubmit`, L75–124)
- CA8: [x] `pnpm tsc --noEmit && pnpm build` verde (reviewer, 2026-07-13)

## Verificación estructura y convenciones
- Archivos en capas correctas: `src/ui/LoginForm.tsx`, `src/app/docs/setup-google-oauth/page.tsx`, `docs/setup-google-oauth.md`
- Cero `any`; JSDoc en export principal de página y helpers
- Patrón `Button render={...}` coherente con `src/app/auth/auth-code-error/page.tsx`
- Scope acotado a UX + docs; no scope creep en los 4 archivos de la tarea

## Verificación manual pendiente (humano)
1. Con Google sin Secret en Supabase: «Continuar con Google» → mensaje ES + enlace a guía
2. Expandir «¿Problemas con Google?» en `/login` → enlace funcional
3. `/docs/setup-google-oauth` legible; botón abre Dashboard Supabase
4. Tras configurar Client ID + Secret: redirect a Google (no 400)
5. Regresión email/password con credenciales válidas

## Cambios requeridos
Ninguno.
