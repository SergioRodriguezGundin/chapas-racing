# Investigación: error Google OAuth "missing OAuth secret"

> Fecha: 2026-07-13  
> Error reportado: `{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: missing OAuth secret"}`

## Causa raíz

Error **server-side** de Supabase Auth (GoTrue), no del código Next.js.

Secuencia de validación en `OAuthProviderConfiguration.ValidateOAuth()`:
1. Provider enabled
2. Client ID presente
3. **Secret presente** ← falla aquí
4. Redirect URI presente

El provider Google está **habilitado o invocado** en el proyecto Supabase `tiwagdlcxnzfjnncqsrf`, pero **falta el Client Secret** en Authentication → Providers → Google.

El código en `LoginForm.tsx` (`signInWithOAuth({ provider: "google" })`) es correcto; Supabase rechaza la petición antes del redirect a Google.

## Fix principal (obligatorio — Dashboard)

No se puede resolver solo con código. Requiere configuración en:

1. **Google Cloud Console** → OAuth client (Web application)
   - Authorized redirect URI: `https://tiwagdlcxnzfjnncqsrf.supabase.co/auth/v1/callback`
2. **Supabase Dashboard** → Authentication → Providers → Google
   - Enable = ON
   - Client ID + **Client Secret** (ambos obligatorios)
   - Save
3. **Supabase Dashboard** → Authentication → URL Configuration
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

## Fix secundario (código — UX)

Scope implementer:
- Traducir error `missing OAuth secret` / `Unsupported provider` en español con mensaje accionable
- Añadir `docs/setup-google-oauth.md` con pasos exactos (incl. project ref)
- Enlace desde login o mensaje de error a la doc

## Fuera de scope

- Management API PATCH auth config (requiere token + credenciales Google del usuario)
- Deshabilitar Google por defecto (empeoraría UX tras configurar)

## Referencias

- [Login with Google — Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google)
- `progress/impl_F02-B.md` § Configuración Supabase Dashboard
