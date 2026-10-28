# Review — F03-B

**Veredicto:** APPROVED

## Criterios de aceptación
- CA1 (migración rooms: code único, track_id, max_players 2–4, host, status lobby/playing/finished): [x]
- CA2 (room_members → profiles; PK/unicidad slot; capacidad): [x]
- CA3 (RLS create/join auth; solo miembros leen; host inicia; sin filtrado = rechazo): [x] — Fix post-review Opción A: `REVOKE UPDATE` + `GRANT UPDATE (connected, last_seen_at)` en greenfield `20260718230000_rooms.sql` L290–298 y correctiva `20260718231000_room_members_update_presence_only.sql`. Remoto: migración `room_members_update_presence_only` aplicada; `information_schema.column_privileges` → `authenticated` solo UPDATE en `connected`/`last_seen_at` (no `room_id`/`slot_index`/`strokes`/`user_id`). Policy `Members can update own membership` sigue `auth.uid() = user_id`. INSERT directo sigue sin policy.
- CA4 (tipos TS regenerados rooms / room_members / enum / RPCs): [x]
- CA5 (código corto único + colisión/retry): [x]
- CA6 (`pnpm tsc --noEmit` + `pnpm build`): [x] — ambos exit 0 en re-review
- CA7 (cero deps nuevas): [x]

## Scope / extras verificados
- Sin UI lobby `/online`: stub intacto (`src/app/(protected)/online/page.tsx` sin diff). [x]
- Sin sync launch en `src/`. [x]
- `feature_list.json` F03-B sigue `in_progress` (no marcado `done`). [x]
- Remoto: `rooms_schema_rls` + `room_members_update_presence_only` presentes en `list_migrations`. [x]

## Cambios requeridos
_(ninguno)_

## Notas (no bloquean)
- Host puede UPDATE cualquier columna de `rooms` (p.ej. `code`/`max_players`); aceptable para F03-B; estrechar en F03-D/E si hace falta.
- `src/types/supabase.ts` sigue trayendo schema legacy del proyecto MCP (patrón F02-C); no es regresión.
