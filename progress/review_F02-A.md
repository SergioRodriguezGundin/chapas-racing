# Review — F02-A (supabase_client_setup)

**Veredicto:** APPROVED

## Criterios de aceptación

- CA1 — `pnpm add @supabase/supabase-js @supabase/ssr`: [x] `package.json` incluye `@supabase/supabase-js@^2.110.2` y `@supabase/ssr@^0.12.0`; lockfile actualizado.
- CA2 — `.env.local.example` con vars documentadas: [x] `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` con comentarios y enlace al Dashboard.
- CA3 — Tres factories en `src/lib/supabase/`: [x]
  - `client.ts`: `createBrowserClient<Database>` con helpers `env.ts`.
  - `server.ts`: `createServerClient` + `await cookies()` + `getAll`/`setAll` (try/catch documentado para RSC).
  - `middleware.ts`: `updateSession` con `getAll`/`setAll` (segundo arg `headers` según `@supabase/ssr@0.12`) + `getUser()`.
- CA4 — `middleware.ts` raíz: refresh sesión en auth/login; matcher sin `/`: [x] `matcher: ["/login", "/auth/:path*"]`; sin `PROTECTED_PREFIXES` ni redirects (correcto para F02-A).
- CA5 — `src/types/supabase.ts` placeholder: [x] tipo `Database` vacío listo para `supabase gen types`.
- CA6 — Cero imports Supabase en `src/app/page.tsx` ni `src/core/`: [x] grep sin coincidencias; únicos usos en `src/lib/supabase/` y `src/types/`.
- CA7 — `pnpm tsc --noEmit` y `pnpm build` limpios: [x] ejecutados en review (exit 0); Next.js 15.5.20, rutas `/` y `/_not-found` generadas.

## Checklist adicional

| Ítem | Resultado |
|------|-----------|
| Scope creep (login UI, profiles, route protection) | OK — no existen `src/app/login/`, `src/app/auth/`, `src/app/profile/`, `(protected)/`, ni migraciones `supabase/`. |
| Convenciones (`docs/conventions.md`) | OK — alias `@/`, exports nombrados, comillas dobles, JSDoc una línea, cero `any`, imports agrupados. |
| Arquitectura (`docs/architecture.md`) | OK — auth en `src/lib/supabase/` + `middleware.ts`; sin lógica auth en `core/` ni `app/page.tsx`. |
| `.gitignore` | OK — `!.env.local.example` permite commitear plantilla sin exponer `.env.local`. |

## Verificación ejecutada (reviewer)

```bash
pnpm tsc --noEmit   # exit 0
pnpm build          # exit 0
```

## Observaciones (no bloqueantes)

1. `src/lib/supabase/env.ts` con placeholders JWT-shaped permite build sin credenciales — decisión documentada en `impl_F02-A.md`; sustituir en `.env.local` antes de F02-B.
2. `feature_list.json` pasó de `blocked` a `in_progress` — correcto; marcar `done` tras merge/cierre de sesión, no en esta review.
3. `catch {}` en `server.ts` `setAll` sigue patrón oficial Supabase SSR (RSC no puede escribir cookies); comentario explica el porqué.

## Cambios requeridos

Ninguno.
