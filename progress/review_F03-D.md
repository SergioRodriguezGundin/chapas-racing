# Review — F03-D

**Veredicto:** APPROVED

> Re-review 2026-07-19 tras fix post-review (índice denso + roster canónico). Review previa: CHANGES_REQUESTED.

## Criterios de aceptación
- CA1 (Host inicia; todos → playing misma pista y roster): [x] — `beginOnlineMatch` (`OnlineLobby.tsx` L210–218) **siempre** `fetchLobbyMembers` (orden `slot_index`) antes de `startMatch`; abort si error o `< minPlayersToStart` sin setear `matchStartedRef`. Host + guests (vía `postgres_changes`) comparten el mismo path.
- CA2 (Orden turnos + activo visibles/consistentes): [x] — Roster → `players[]` denso 0..n-1; `bindOnlineSession({ slotIndex: findIndex })` (`OnlineLobby.tsx` L220–241) alinea Cap `playerIndex`, Hud y `activePlayerIndex` aunque DB tenga gaps (0 y 2 tras leave).
- CA3 (Solo activo lanza local; input se replica): [x] — `canLocalPlayerAim` / launch payload usan `session.slotIndex` denso (`onlineSession.ts` L19–50, L143); tras gaps, C en slot DB 2 queda `playerIndex===1` y el gate coincide. Broadcast launch + eco por `user_id` intactos.
- CA4 (Tras settle, snapshot en todos): [x] — sin regresión; `commitLocalSettle` + `applySettleSnapshot` + teleport Cap.
- CA5 (Rotación post-settle alineada F01): [x] — `(active+1)%n` (`onlineSession.ts` L177) sobre índices densos; `rooms.active_slot` / `commit_room_settle` documentados como dense 0..member_count-1 (migración comentario L139); validación RPC `p_next_active_slot < member_count` coherente.
- CA6 (`pnpm tsc --noEmit` + `pnpm build`): [x] — ambos exit 0 (esta re-review).
- CA7 (Cero deps nuevas): [x] — sin cambios `package.json` / lockfile.

## Cambios previos — cierre
1. ~~Alinear slot DB vs playerIndex~~ → opción (a) índice denso vía `roster.findIndex` al start. [x]
2. ~~Roster canónico siempre refetch~~ → `fetchLobbyMembers` incondicional en `beginOnlineMatch`. [x]
3. Manual 3→leave→start→turnos: listado en `progress/impl_F03-D.md` §3; no bloquea (R3F/multi-cliente — evidencia humana pendiente, no exigida para APPROVED).

## Scope / extras verificados
- `feature_list.json` F03-D = `in_progress` (no `done`). [x]
- Start durable: RPC `start_room` + `postgres_changes` rooms → `beginOnlineMatch`. [x]
- Broadcast launch/settle + `turn_seq`. [x]
- Hot-seat `/` intacto (`matchMode` default `"local"`). [x]
- Constantes online en `config/online.ts`. [x]
- Fuera de scope F03-E: no exigido. [x]

## Notas (no bloquean)
- Acoplamiento Cap/useLaunch → `features/online`: documentado; preferible puente store a medio plazo.
- UI lobby sigue mostrando `member.slotIndex` DB (“Slot N”); match usa índice denso — correcto y documentado.
- Verificación multi-cliente humana (§3 impl) pendiente para QA; no abre CHANGES_REQUESTED.
