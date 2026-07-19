# Review — F03-E

**Veredicto:** APPROVED

## Criterios de aceptación
- CA1 (Desconexión: skip tras timeout; partida no bloqueada): [x] — `OnlineLobby.tsx` timeout cliente + RPC `skip_room_turn` race-safe por `turn_seq` (sin regresión post-fix).
- CA2 (Reconexión lobby/match sin corromper turnos): [x] — Cerrado por fix: `findActiveMembershipForReconnect` (`OnlineLobby.tsx` L205–238) hace fetch array + embed `rooms(*)`, orden `joined_at` desc, pick primera `lobby|playing`; **nunca** `maybeSingle` sobre 0..N memberships. Finished huérfanos: `leave_room` fire-and-forget (L233–235). Mount usa el helper (L480–483); profile sigue `maybeSingle` (1 fila/user).
- CA3 (Fin: ranking sincronizado): [x] — `finish_room` + `applyOnlineFinish` + VictoryModal (sin regresión).
- CA4 (Launch no-activo rechazado server-side): [x] — `submit_room_launch` security definer (sin regresión).
- CA5 (Timeout/constantes en config/): [x] — `src/config/online.ts` `disconnectTurnTimeoutMs` / `presenceHeartbeatMs`.
- CA6 (`pnpm tsc --noEmit` + `pnpm build`): [x] — ambos exit 0 (re-review).
- CA7 (Cero deps nuevas): [x] — sin cambios `package.json` / lockfile.

## Cambios requeridos
_(ninguno)_

## Scope / extras verificados
- `feature_list.json` F03-E = `in_progress` (no `done`). [x]
- Unmount ≠ `leave_room` de sala activa; leave solo botón / Victory / cleanup finished. [x]
- Hot-seat `/` intacto (sin regresión de scope). [x]
- Manual multi-cliente + caso finished→create/join→F5 listados en impl — evidencia humana pendiente QA; no bloquea APPROVED.

## Notas (no bloquean)
- Skip server puede avanzar con `connected=false` sin esperar 15s SQL; timeout lo impone el cliente.
- `stale_secs` duplicado en SQL vs config — comentario de sync presente.
