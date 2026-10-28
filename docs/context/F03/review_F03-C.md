# Review — F03-C

**Veredicto:** APPROVED

> Re-review post-fix `leave_room` (previo: CHANGES_REQUESTED).

## Criterios de aceptación
- CA1 (crear sala: código corto visible/compartible, pista, capacidad 2–4): [x] — `create_room` + UI código/copiar; pista `ONLINE_TRACKS`; max vía `MATCH` 2–4.
- CA2 (unirse por código; inválido/llena → error claro): [x] — RPC `join_room` + `translateRoomError`; tras leave durable el slot deja de contar (DELETE membership → `join_room` member_count).
- CA3 (lobby jugadores en tiempo real, altas/bajas sin reload): [x] — altas: INSERT + `postgres_changes` (`OnlineLobby.tsx` L190–218). Bajas: RPC `leave_room` DELETE `room_members` (`20260718232000_leave_room.sql` L36–38); `handleLeave` llama RPC (L381–384); unmount también (L258–262). Host transfer + sala vacía DELETE documentados (migración L49–65). Refetch `rooms` en changes mantiene badge Host (L206–217).
- CA4 (`/online` usable; stub reemplazado): [x] — `page.tsx` monta `OnlineLobby`.
- CA5 (hot-seat `/` intacto): [x] — sin cambios en `stores/` / `features/` / home.
- CA6 (`pnpm tsc --noEmit` + `pnpm build`): [x] — ambos exit 0 (re-review post-fix).
- CA7 (cero deps nuevas): [x] — sin cambios `package.json` / lockfile.

## Scope / extras verificados
- Sin start match real: botón Iniciar `disabled` (L504–515). [x]
- `feature_list.json` F03-C sigue `in_progress` (no `done`). [x]
- Fix acotado a leave durable + cableado UI; sin scope creep F03-D/E. [x]
- Tipos: `leave_room` en `src/types/supabase.ts` Functions. [x]
- Informe lista pasos manuales críticos (A+B → B sale → roster + slot liberado). [x]

## Cambios requeridos
_(ninguno)_

## Notas (no bloquean)
- Unmount llama `leave_room` (libera slot; reconnect durable = F03-E) — coherente con fix pedido.
- Migración debe estar aplicada en el proyecto remoto antes de QA humano (impl documenta MCP apply).
