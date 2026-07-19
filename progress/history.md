# Bitácora (append-only)

## Iteración 2

### Feature 2 — track_geometry (done)
- Modo harness (leader → implementer → reviewer).
- Implementado `src/features/track/useTrackGeometry.ts`: `computeTrackGeometry` (pura) + `useTrackGeometry` (useMemo). Constante `TRACK.groundY` añadida en `config/physics.ts`.
- Convención geometría: `rotationY = atan2(-dz, dx)` para segmentos; `finishTransform` perpendicular al último tramo (`+π/2`), centrado en `waypoints[finish.waypointIndex]`.
- circuit-01: 8 waypoints -> 7 segments, 8 pads.
- Test vitest pendiente (vitest no instalado; no se añaden deps sin discusión). Verificación por inspección documentada.
- Verificación: `pnpm tsc --noEmit` limpio; `pnpm build` limpio.
- Artefactos: `progress/impl_track_geometry.md`, `progress/review_track_geometry.md` (APPROVED).

### Feature 3 — store_status_restart (done)
- Modo harness (leader → implementer → reviewer).
- `src/stores/gameStore.ts`: `GameStatus` ('playing'|'won'), `status` inicial 'playing', `resetRequestId` (0), `win()`, `restart()` (estado inicial completo + incremento resetRequestId vía set funcional), guard de `startAiming` si status !== 'playing', `lastPosition` inicial desde `getCurrentTrack().capStart`. Retirado import muerto de `CAP_START_POSITION` (la constante sigue en config; su borrado es feature 4).
- Semántica de phase intacta.
- Verificación: `pnpm tsc --noEmit` limpio; `pnpm build` limpio.
- Artefactos: `progress/impl_store_status_restart.md`, `progress/review_store_status_restart.md` (APPROVED).

### Feature 4 — track_renderer (done)
- Modo harness (leader → implementer → reviewer).
- Nuevo `src/features/track/TrackRenderer.tsx`: UN `RigidBody fixed colliders={false}` con `CuboidCollider`+`boxGeometry` por segmento (ejes: length→X, trackWidth→Z, coherente con `rotationY=atan2(-dz,dx)`) y `CylinderCollider`+`cylinderGeometry` por pad. Usa `useTrackGeometry(getCurrentTrack())`.
- `GameCanvas.tsx`: `<Ground />` → `<TrackRenderer />` dentro de `<Physics>`.
- `Ground.tsx` eliminado (git: D). `Cap.tsx` toma position de `getCurrentTrack().capStart`. `CAP_START_POSITION` eliminada de config (0 referencias vivas; grosor de suelo en `config/physics.ts`).
- Verificación: `pnpm tsc --noEmit` y `pnpm build` limpios. Verificación visual en pantalla queda pendiente-de-humano (leader no la ejecuta).
- Artefactos: `progress/impl_track_renderer.md`, `progress/review_track_renderer.md` (APPROVED).

### Feature 5 — finish_line (done)
- Modo harness (leader → explorer → implementer → reviewer).
- Explorer: fijada API de sensores @react-three/rapier 2.2.0 (`sensor` en CuboidCollider, `onIntersectionEnter(payload)`, usar `payload.other.*` no deprecados; sensor y chapa bajo el mismo `<Physics>`; gotcha de re-disparo tras teleport). -> `progress/research_rapier_sensors.md`.
- Nuevo `src/features/track/FinishLine.tsx`: `RigidBody fixed colliders={false}` + `CuboidCollider sensor` en `finishTransform` (half-extents `[finish.width/2, alto/2, prof/2]`), visual semitransparente. `onIntersectionEnter` -> guard `status==='playing'` (getState) + `win()`; guard extra por `userData.type==='cap'` (añadido `userData` a Cap.tsx). Montado en GameCanvas dentro de `<Physics>`. Constantes en `config/physics.ts`.
- Verificación: `pnpm tsc --noEmit` y `pnpm build` limpios. Verificación visual/física (cruzar meta -> won; no re-dispara) pendiente-de-humano.
- Artefactos: `progress/impl_finish_line.md`, `progress/review_finish_line.md` (APPROVED).

### Feature 6 — cap_reset_teleport (done)
- Modo harness (leader → implementer → reviewer).
- `config/physics.ts`: `OUT_OF_TRACK_Y = -3`.
- `Cap.tsx`: helper `teleport(body, [x,y,z])` compartido (setTranslation y+0.2, linvel/angvel 0, rotación identidad). Camino fuera-de-pista en useFrame FUERA del guard de phase -> teleport a `lastPosition` + `settle()`. Camino restart: comparación de `resetRequestId` con ref `lastResetId` (inicializado con valor del store, sin teleport espurio, sin refs cruzadas DOM<->Canvas) -> teleport a `getCurrentTrack().capStart`. Detección de parada por velocidad intacta para 'moving'.
- Verificación: `pnpm tsc --noEmit` y `pnpm build` limpios. Verificación física real pendiente-de-humano.
- Artefactos: `progress/impl_cap_reset_teleport.md`, `progress/review_cap_reset_teleport.md` (APPROVED).

### Feature 7 — victory_modal (done)
- Modo harness (leader → implementer → reviewer).
- Nuevo `src/ui/VictoryModal.tsx`: overlay DOM cliente que suscribe `status` (return null salvo `status==='won'`), mensaje de victoria + botón "Jugar de nuevo" que llama a `store.restart()` (delega; no duplica teleport/estado). Clases `.victory-*` en `globals.css` con `pointer-events:auto`. Montado junto al `<Hud />` en `page.tsx`.
- Con modal abierto no se puede lanzar (guard de startAiming por status, feature 3). Reset via restart repone estado (feature 3) y teleporta (feature 6).
- Verificación: `pnpm tsc --noEmit` y `pnpm build` limpios. Interacción visual pendiente-de-humano.
- Artefactos: `progress/impl_victory_modal.md`, `progress/review_victory_modal.md` (APPROVED).

## Infra — shadcn/ui preset (feature/spec-3)

### Design system — preset b311U8NYiG (done)
- Modo ligero (implementación directa, sin harness).
- Problema inicial: `pnpm dlx shadcn apply --preset b311U8NYiG` fallaba sin `components.json` (comando `apply` solo válido tras `init`).
- Prerequisito manual: Tailwind CSS v4 (`tailwindcss`, `@tailwindcss/postcss`, `postcss`) + `postcss.config.mjs` antes de que el CLI aceptara el init.
- `pnpm dlx shadcn@latest init --preset b311U8NYiG --template next`: preset **base-vega**, baseColor **mist**, theme **yellow**, fuentes **Noto Sans / Outfit** (via `next/font` en `layout.tsx`).
- Nuevos archivos: `components.json`, `src/lib/utils.ts`, `src/components/ui/{button,dialog,progress}.tsx`.
- `src/app/globals.css`: variables del preset shadcn + estilos del juego (HUD, canvas, overlay dialog) conservados al final del archivo para no perder layout del juego.
- Migración UI: `VictoryModal` → `Dialog` + `Button`; `Hud` → `Progress` (gradiente rojo→verde de potencia preservado).
- Excepción a regla de deps cerradas (`docs/architecture.md`): aprobada explícitamente por el usuario para shadcn/Tailwind/@base-ui/lucide.
- Verificación: `pnpm tsc --noEmit` limpio; `pnpm build` limpio; smoke test dev OK tras limpiar `.next`.
- Commit: `ee858fb` — *Initialize shadcn preset and migrate game UI overlays.* (push `origin/feature/spec-3`).

### Design system — shadcn CSS cleanup (done)
- Modo harness (leader → implementer → reviewer).
- Eliminado bloque CSS custom del juego en `globals.css` (`.game-root`, `.loading`, `.hud`, `.hud-phase`, override dialog overlay). Solo queda preset shadcn/tailwind.
- Layout fullscreen migrado a Tailwind: `layout.tsx` (`h-full overflow-hidden`), `page.tsx` (`fixed inset-0`, loading con `text-muted-foreground`).
- `Hud.tsx`: `Badge` variant secondary + `Progress` con gradiente `var(--destructive)`→`var(--primary)` (sin hex).
- `VictoryModal.tsx`: tokens preset (`bg-popover`, `text-primary`, `border-border`, Button default).
- Nuevo `src/components/ui/badge.tsx` (shadcn add, sin deps npm nuevas).
- Verificación: `pnpm tsc --noEmit` y `pnpm build` limpios. Visual pendiente-de-humano.
- Artefactos: `progress/impl_shadcn_css_cleanup.md`, `progress/review_shadcn_css_cleanup.md` (APPROVED).

## F02 — Auth / Perfil Supabase (done)

- Modo harness (leader → implementers en paralelo B∥C → E → D → reviewers).
- **F02-A** Cliente Supabase: `@supabase/supabase-js`, `@supabase/ssr`, factories browser/server/middleware, middleware mínimo sin `/`.
- **F02-B** Login UI: `/login`, `LoginForm`, email/password + Google OAuth, callback PKCE.
- **F02-C** Migración `profiles` + RLS + bucket `avatars` + trigger signup; tipos regenerados.
- **F02-E** Protección rutas: `/online`, `/editor`, `/profile` protegidas; hot-seat `/` público.
- **F02-D** Editor perfil: display_name, cap_color, avatar upload, logout, link en HUD.
- Verificación: `pnpm tsc --noEmit` y `pnpm build` limpios en cada sub-tarea.
- Artefactos: `progress/impl_F02-*.md`, `progress/review_F02-*.md` (todos APPROVED).
- Manual pendiente: Google OAuth en Dashboard, signup + RLS cross-user en local.

## F02.5 — Flujo de entrada auth-first (done)

- Modo harness (leader → implementer → reviewer) por subtarea A → B → C.
- **F02.5-A** `appStage` auth|setup|match en `gameStore` + gating en `page.tsx`.
- **F02.5-B** `AuthEntryScreen` fullscreen + Saltar + auto-setup si sesión; `/login` intacto.
- **F02.5-C** Prefill Jugador 1 desde `profiles` + `nearestPlayerColor` + logout → auth.
- Criterios F02.5 marcados en `specs/feature_list.md`. Completado en `feature_list.json`.
- Verificación: `tsc` + `build` verdes en cada subtarea (reviewers).
- Artefactos: `progress/impl_F02.5-*.md`, `progress/review_F02.5-*.md` (todos APPROVED).
- Manual pendiente: flujo completo en browser (skip, login, prefill, logout, sesión persistida).

## F03 — Sesiones online multijugador (done)

### F03-A — Spike transporte Realtime + sync (done)
- Modo harness (leader → explorer → reviewer → implementer cierre docs).
- Entregable: `progress/research_f03_realtime_sync.md` — decisión **Supabase Realtime** (Broadcast + Presence + postgres_changes); sync **input + settle snapshot**; contrato tentativo create/join/start/launch/settle/disconnect/end.
- **No blocked** por deps; cero cambios en `src/` / `package.json`. PoC no realizado.
- Review: `progress/review_F03-A.md` (APPROVED). Cierre: `progress/impl_F03-A.md`.
- F03-B..E siguen pending; checkboxes F03 en `specs/feature_list.md` no marcados (feature completa abierta).

### F03-B — Schema salas/partida + RLS + códigos (done)
- Modo harness (leader → implementer → reviewer → fix CA3 → re-review → implementer cierre docs).
- Migraciones: `supabase/migrations/20260718230000_rooms.sql` (rooms / room_members, RPCs `create_room`/`join_room`, RLS, Realtime) + correctiva `20260718231000_room_members_update_presence_only.sql` (UPDATE presence-only en members).
- Tipos: `src/types/supabase.ts` regenerados. Sin UI lobby ni sync launch.
- Review: `progress/review_F03-B.md` (APPROVED). Cierre: `progress/impl_F03-B.md`.
- F03-C..E siguen pending; checkboxes F03 en `specs/feature_list.md` no marcados (feature completa abierta).

### F03-C — Lobby create/join + presencia realtime (done)
- Modo harness (leader → implementer → reviewer → fix leave durable → re-review → implementer cierre docs).
- UI `/online`: `OnlineLobby` (crear/unirse por código, roster + Presence); config `src/config/online.ts`; stub reemplazado.
- Post-review: RPC `leave_room` (`20260718232000_leave_room.sql`) — DELETE membership, host transfer / sala vacía; cableado botón + unmount.
- Sin start match (botón Iniciar disabled → F03-D). Hot-seat `/` intacto. Cero deps nuevas.
- Review: `progress/review_F03-C.md` (APPROVED). Cierre: `progress/impl_F03-C.md`.
- F03-D..E siguen pending; checkboxes F03 en `specs/feature_list.md` no marcados (feature completa abierta).

### F03-D — Inicio de partida + turnos + sync de lanzamientos (done)
- Modo harness (leader → implementer → reviewer → fix índice denso/roster → re-review → implementer cierre docs).
- Start durable: RPC `start_room` + `postgres_changes` → `beginOnlineMatch`; Broadcast launch/settle + `turn_seq`; gate aim por `session.slotIndex`.
- Post-review: roster canónico vía `fetchLobbyMembers` incondicional; `playerIndex` denso (`findIndex`) alinea Cap/Hud/rotación aunque DB tenga gaps tras leave.
- Hot-seat `/` intacto (`matchMode` default `"local"`). Cero deps nuevas. Constantes en `config/online.ts`.
- Review: `progress/review_F03-D.md` (APPROVED). Cierre: `progress/impl_F03-D.md`.

### F03-E — Desconexión/reconexión + fin + validación server (done)
- Modo harness (leader → implementer → reviewer → fix reconnect CA2 → re-review → implementer cierre docs).
- RPCs `submit_room_launch` / `skip_room_turn` / `finish_room`; timeout disconnect + heartbeat en `config/online.ts`; ranking sync vía `finish_room` + VictoryModal.
- Post-review: `findActiveMembershipForReconnect` (array + pick lobby|playing; leave finished huérfanos) — nunca `maybeSingle` sobre 0..N memberships.
- Hot-seat `/` intacto. Cero deps nuevas. Review: `progress/review_F03-E.md` (APPROVED). Cierre: `progress/impl_F03-E.md`.

### Feature F03 completa (done)
- Subtareas A–E cerradas. Checkboxes § F03 en `specs/feature_list.md` marcados `[x]`.
- `feature_list.json`: `completed.f03_online` = A..E; F03-E `status: done`.
- Manual QA multi-cliente (disconnect skip, reconnect F5, ranking, spoof launch) sigue pendiente humano — no bloqueó APPROVED.
- Siguiente elegible (orden sugerido): **F07 — Leaderboards**.
