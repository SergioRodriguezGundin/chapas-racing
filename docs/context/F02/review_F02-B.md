# Review — F02-B (auth_login_ui)

**Veredicto:** APPROVED

## Criterios de aceptación

- CA1 — Existe `src/app/login/page.tsx` y `src/ui/LoginForm.tsx`: [x]
- CA2 — Email/password: `signInWithPassword` y `signUp` con mensajes de error en español: [x] `LoginForm.tsx` líneas 69–91 (`signInWithPassword`), 84–103 (`signUp`), 20–46 (`translateAuthError`).
- CA3 — Google OAuth: `signInWithOAuth` con `redirectTo` `/auth/callback`; Dashboard configurado: [x] código en `LoginForm.tsx` líneas 115–124 (`redirectTo` → `/auth/callback?next=...`); pasos manuales Dashboard documentados en `impl_F02-B.md` § Configuración Supabase Dashboard (verificación operativa pendiente de humano).
- CA4 — Existe `src/app/auth/callback/route.ts` (`exchangeCodeForSession`) y `auth/auth-code-error/page.tsx`: [x] `callback/route.ts` línea 20; `auth-code-error/page.tsx` completo.
- CA5 — Tras OAuth exitoso redirige a `/` o query param `next`: [x] `callback/route.ts` líneas 16–34 con `sanitizeNextPath`; fallback `/` si `next` inválido.
- CA6 — Usuario no logueado puede jugar hot-seat completo en `/`: [x] `src/app/page.tsx` sin cambios ni imports Supabase; `middleware.ts` matcher `["/login", "/auth/:path*"]` no incluye `/`; sin `PROTECTED_PREFIXES` ni redirects por sesión.
- CA7 — `pnpm tsc --noEmit` y `pnpm build` limpios: [x] ejecutados en review (exit 0); rutas generadas: `/`, `/login`, `/auth/callback`, `/auth/auth-code-error`.

## Checklist adicional

| Ítem | Resultado |
|------|-----------|
| Scope creep F02-E (route protection) | OK — `middleware.ts` solo `updateSession` + `return supabaseResponse`; sin `isProtected`, sin redirect a `/login?next=`, sin `(protected)/layout.tsx`. |
| Scope creep F02-C/D | OK — sin cambios en profiles UI ni migraciones nuevas en este entregable. |
| Convenciones (`docs/conventions.md`) | OK — `"use client"` primera línea en `LoginForm.tsx`; alias `@/`; exports nombrados; comillas dobles; JSDoc una línea; cero `any`. |
| Arquitectura (`docs/architecture.md`) | OK — formulario en `src/ui/`; rutas auth en `src/app/auth/`; cliente Supabase desde `src/lib/supabase/`; sin lógica de juego en login. |
| Dependencias nuevas | OK — solo `@supabase/*` de F02-A; sin entradas nuevas en `package.json` por F02-B. |
| Estilo UI (SetupScreen) | OK — card `bg-popover`, inputs nativos Tailwind, `Button` shadcn, `font-heading` en títulos. |

## Verificación ejecutada (reviewer)

```bash
pnpm tsc --noEmit   # exit 0
pnpm build          # exit 0 (Next.js 15.5.20, 7 rutas)
```

## Verificación manual pendiente (humano, no bloqueante para código)

1. Hot-seat en `/` sin visitar `/login`.
2. Email login/signup con credenciales reales.
3. Google OAuth end-to-end (requiere Dashboard configurado según `impl_F02-B.md`).
4. Callback inválido → `/auth/auth-code-error`.

## Observaciones (no bloqueantes)

1. `sanitizeNextPath` duplicada en `login/page.tsx` y `auth/callback/route.ts` — aceptable en scope F02-B; extraer helper si F02-E lo reutiliza.
2. Criterio Dashboard OAuth no verificable desde repo; documentación en impl es suficiente para aprobar entrega de código.

## Cambios requeridos

Ninguno.
