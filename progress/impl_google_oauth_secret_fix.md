# Implementación: google_oauth_secret_fix

> Fecha: 2026-07-13  
> Tarea: UX + docs para error `Unsupported provider: missing OAuth secret`

## Archivos tocados

| Archivo | Cambio |
|---------|--------|
| `src/ui/LoginForm.tsx` | `isGoogleOAuthSetupError`, mensaje ES para OAuth no configurado, enlace a guía en error, `<details>` «¿Problemas con Google?» |
| `docs/setup-google-oauth.md` | Guía paso a paso (Google Cloud, Supabase Dashboard, URLs locales, troubleshooting) |
| `src/app/docs/setup-google-oauth/page.tsx` | Página estática con resumen y enlace al Dashboard |
| `.env.local.example` | Bloque de comentarios: Google OAuth en Dashboard, no en env |

## Decisiones

- **No se tocó** `signInWithOAuth` ni el flujo PKCE — el código ya era correcto.
- Detección de error por subcadenas `missing oauth secret` y `unsupported provider` (mensaje exacto de GoTrue).
- Estado `googleOAuthSetupError` separado para mostrar enlace solo en errores de configuración OAuth, sin afectar errores email/password.
- Página `/docs/setup-google-oauth` duplica contenido esencial del markdown para usuarios en la app; el markdown sigue siendo la referencia en repo.
- `<details>` nativo para ayuda colapsable — sin dependencias nuevas.

## Criterios de aceptación

- [x] `translateAuthError` mapea `missing oauth secret` / `unsupported provider` a mensaje ES accionable
- [x] Mensaje menciona Supabase Dashboard → Auth → Providers → Google → Client ID + Secret
- [x] Enlace a `/docs/setup-google-oauth` desde error OAuth y sección de ayuda en login
- [x] `docs/setup-google-oauth.md` con project ref `tiwagdlcxnzfjnncqsrf`, redirect URI Google, URLs locales, troubleshooting
- [x] `.env.local.example` documenta que Google OAuth no usa env vars
- [x] Sin cambios al flujo OAuth ni nuevas dependencias
- [x] Email/password login intacto
- [x] `pnpm tsc --noEmit && pnpm build` verde

## Verificación automática

```
pnpm tsc --noEmit  # OK
pnpm build         # OK — /docs/setup-google-oauth estática
```

## Verificación manual pendiente (humano)

1. **Error sin configurar:** Con Google provider sin Secret en Supabase, pulsar «Continuar con Google» → mensaje en español + enlace «Ver guía de configuración de Google OAuth».
2. **Ayuda proactiva:** En `/login`, expandir «¿Problemas con Google?» → enlace a guía.
3. **Guía:** Abrir `/docs/setup-google-oauth` → pasos legibles, botón al Dashboard Supabase.
4. **Fix real:** Tras añadir Client ID + Secret en Dashboard, Google OAuth redirige a Google (no error 400).
5. **Regresión:** Login email/password sigue funcionando con credenciales válidas.
