# Implementación F02-B — auth_login_ui

> Fecha: 2026-07-12  
> Estado: listo para review

## Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `src/ui/LoginForm.tsx` | Formulario cliente: email/password (signIn/signUp), Google OAuth, errores ES |
| `src/app/login/page.tsx` | Página login; lee `?next=` y sanitiza path interno |
| `src/app/auth/callback/route.ts` | `GET` PKCE: `exchangeCodeForSession` → redirect `next` o `/` |
| `src/app/auth/auth-code-error/page.tsx` | Página de error OAuth con enlaces a login y home |

## Archivos no modificados (por diseño)

| Archivo | Motivo |
|---------|--------|
| `middleware.ts` | Protección de rutas → F02-E; matcher sigue sin `/` |
| `src/app/page.tsx` | Hot-seat sin imports Supabase (criterio F02-A) |

## Decisiones

1. **Estilo UI:** Misma convención que `SetupScreen` — card `bg-popover`, inputs nativos con clases Tailwind, `Button` shadcn, `font-heading` en títulos.
2. **Errores:** Función `translateAuthError` en `LoginForm` mapea mensajes Supabase comunes al español; fallback al mensaje original.
3. **Sign up con confirmación email:** Si `signUp` no devuelve `session`, muestra aviso para confirmar email y cambia a modo login.
4. **OAuth `next`:** Se propaga en `redirectTo` como `/auth/callback?next=...`; callback sanitiza (solo paths que empiezan por `/`, no `//`).
5. **Post-login email:** `router.push(nextPath)` + `router.refresh()` para hidratar cookies en RSC.
6. **Callback producción:** Patrón oficial Supabase con `x-forwarded-host` en no-dev.

## Configuración Supabase Dashboard (manual)

Requerida para Google OAuth en local y producción:

### 1. Google Cloud Console

- Tipo **Web application**
- **Authorized redirect URI:** `https://<project-ref>.supabase.co/auth/v1/callback`  
  (no la URL de Next.js)

### 2. Supabase → Auth → Providers → Google

- Activar provider
- Pegar **Client ID** y **Client Secret** de Google

### 3. Supabase → Auth → URL Configuration

| Campo | Valor dev | Valor prod |
|-------|-----------|------------|
| Site URL | `http://localhost:3000` | `https://<dominio>` |
| Redirect URLs | `http://localhost:3000/auth/callback` | `https://<dominio>/auth/callback` |

### 4. Variables locales

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

## Criterios de aceptación

- [x] Existe `src/app/login/page.tsx` y `src/ui/LoginForm.tsx`
- [x] Email/password: `signInWithPassword` y `signUp` con mensajes de error en español
- [x] Google OAuth: `signInWithOAuth` con `redirectTo` `/auth/callback`; Dashboard documentado arriba
- [x] Existe `src/app/auth/callback/route.ts` (`exchangeCodeForSession`) y `auth/auth-code-error/page.tsx`
- [x] Tras OAuth exitoso redirige a `/` o query param `next`
- [x] Usuario no logueado puede jugar hot-seat completo en `/` (sin cambios en home ni matcher)
- [x] `pnpm tsc --noEmit` limpio
- [x] `pnpm build` limpio (7 rutas: `/`, `/login`, `/auth/callback`, `/auth/auth-code-error`)

## Verificación manual pendiente (humano)

1. **Hot-seat sin login:** Abrir `/`, jugar partida completa sin visitar `/login`.
2. **Email login:** En `/login`, registrar cuenta o entrar con credenciales reales → redirect a `/`.
3. **Email con `next`:** Visitar `/login?next=/` (o ruta futura) → tras login, misma ruta.
4. **Google OAuth:** "Continuar con Google" → consent → vuelta a `/` (o `next` si se pasó en URL de login).
5. **Error OAuth:** Simular callback sin `code` válido → `/auth/auth-code-error`.
6. **Sesión:** Recargar tras login; cookies PKCE persisten (comportamiento `@supabase/ssr`).

## Comandos ejecutados

```bash
pnpm tsc --noEmit   # exit 0
rm -rf .next && pnpm build   # exit 0
```
