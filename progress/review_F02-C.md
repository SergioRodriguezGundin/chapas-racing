# Review — F02-C (profiles_migration_rls)

**Veredicto:** APPROVED

## Criterios de aceptación

- CA1 — `supabase/migrations/` con SQL: tabla `profiles`, constraints, RLS enabled, políticas select/insert/update: [x] `supabase/migrations/20260712100000_profiles.sql` líneas 4–30 (tabla + `display_name_length`/`cap_color_hex` + RLS + 3 políticas).
- CA2 — Trigger `on_auth_user_created` crea fila `profiles` con `display_name` desde metadata Google/email: [x] función `handle_new_user` en migración local líneas 32–56 (`coalesce(full_name, name, split_part(email), 'Jugador')`); remoto verificado vía MCP (`prosrc` incluye mismo `coalesce` + `insert into public.profiles`); trigger `on_auth_user_created` activo.
- CA3 — Bucket `avatars` con políticas: lectura pública, upload/update solo carpeta `{userId}/`: [x] migración líneas 72–92; remoto: bucket `public=true`; políticas `Avatar images are publicly accessible` (SELECT), `Users can upload own avatar` (INSERT `with_check` folder = `auth.uid()`), `Users can update own avatar` (UPDATE `using` folder = `auth.uid()`).
- CA4 — Migración aplicada en proyecto Supabase: [x] MCP `list_migrations` incluye `20260712172211` / `profiles_rls_avatars`.
- CA5 — `src/types/supabase.ts` regenerado con tipos de `profiles`: [x] líneas 1585–1608 (`Row`/`Insert`/`Update` con `display_name`, `cap_color`, `avatar_url`, `updated_at`).
- CA6 — Verificación: nuevo signup tiene fila `profiles`; anon no puede update ajeno: [x] estructural — trigger + RLS verificados en DB remota; política UPDATE exige `auth.uid() = id` (anon con `uid` null no puede modificar filas ajenas); signup runtime pendiente de humano (0 filas `profiles` / 10 `auth.users` esperado: sin backfill ni signups post-migración); pasos manuales documentados en `impl_F02-C.md` § Verificación manual (patrón F02-B).
- CA7 — `cap_color` default hex válido `#3b82f6`: [x] migración línea 7; remoto `information_schema.columns.column_default = '#3b82f6'::text`; constraint `cap_color_hex` activo.

## Checklist adicional

| Ítem | Resultado |
|------|-----------|
| Scope creep (login UI F02-B, editor perfil F02-D, route protection F02-E) | OK — solo `supabase/migrations/20260712100000_profiles.sql`, `src/types/supabase.ts`, `progress/` según `impl_F02-C.md`. |
| Convenciones / arquitectura | OK — SQL versionado en `supabase/migrations/`; tipos en `src/types/`; sin lógica de juego ni constantes física inline. |
| Dependencias nuevas | OK — ninguna añadida en F02-C. |
| Divergencia local vs MCP | Documentada — migración remota extiende `handle_new_user` con insert legacy `public.user` + `on conflict do nothing`; archivo local es esquema limpio para proyecto dedicado. No bloqueante. |
| `src/types/supabase.ts` incluye tablas de otras apps | Observación no bloqueante — `profiles` tipado correctamente; regenerar tras proyecto Supabase exclusivo. |

## Verificación ejecutada (reviewer)

```bash
pnpm tsc --noEmit   # exit 0
pnpm build          # exit 0 (Next.js 15.5.20, 7 rutas)
```

### SQL remoto (MCP `execute_sql`)

| Check | Resultado |
|-------|-----------|
| `profiles.relrowsecurity` | `true` |
| Políticas `profiles` | SELECT público; INSERT/UPDATE solo `auth.uid() = id` |
| `cap_color` default | `'#3b82f6'::text` |
| Constraints | `display_name_length`, `cap_color_hex`, FK `auth.users`, PK |
| Trigger `on_auth_user_created` | Presente |
| Trigger `profiles_updated_at` | Presente |
| Bucket `avatars` | `public = true` |
| Storage policies avatars | SELECT bucket; INSERT/UPDATE restringidos a `(storage.foldername(name))[1] = auth.uid()::text` |

## Verificación manual pendiente (humano, no bloqueante para código)

1. Nuevo signup (email u OAuth) → fila en `profiles` con `display_name` y `cap_color = #3b82f6`.
2. Cliente autenticado intenta `update` en `id` ajeno → 0 filas / error RLS.

## Cambios requeridos

Ninguno.
