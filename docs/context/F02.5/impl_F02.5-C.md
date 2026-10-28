# Informe: F02.5-C — Prefill setup desde perfil + logout

**Estado:** implementación completa — pendiente review  
**Fecha:** 2026-07-17  
**Verificación:** `pnpm tsc --noEmit` ✅ · `pnpm build` ✅ · cero deps nuevas

---

## Archivos tocados

| Archivo | Cambio |
|---|---|
| `src/lib/nearestPlayerColor.ts` | **Nuevo.** Helper puro: hex → `PLAYER_COLORS` (exacto case-insensitive o distancia RGB²) |
| `src/ui/SetupScreen.tsx` | Prefill Jugador 1 desde `profiles` si hay sesión; botón «Cerrar sesión»; gate de carga hasta resolver prefill |
| `progress/current.md` | Plan de sesión F02.5-C |
| `feature_list.json` | Ya estaba `in_progress` (sin marcar `done`) |

---

## Decisiones

1. **Prefill una sola vez al montar setup:** efecto en mount lee `getUser()` + `profiles` (`display_name`, `cap_color`). Flag `prefillAppliedRef` evita doble aplicación. UI muestra «Cargando…» hasta resolver → no flash «Jugador 1» ni race con edits del usuario.
2. **Drafts 100% locales:** `updateDraft` / `startMatch` no llaman a Supabase write sobre `profiles`. Editar setup no toca DB.
3. **Color vía `nearestPlayerColor`:** paleta `PLAYER_COLORS` de `config/physics.ts`. Match exacto (case-insensitive); si no, menor distancia RGB euclídea al cuadrado. Hex inválido → `PLAYER_COLORS[0]`.
4. **Sin fila de perfil:** fallback de nombre como en `profile/page.tsx` (metadata / email local-part); color → `PLAYER_COLORS[0]`.
5. **Invitado (`user === null`):** sin prefill, sin botón logout; mismos campos default.
6. **Logout:** `supabase.auth.signOut()` y, si OK, `logoutToAuth()` → `appStage 'auth'`. Botón ghost «Cerrar sesión» solo si `hasSession`.
7. **Sin vitest en repo:** helper puro dejado testeable en `src/lib/`; no se añadió framework ni deps.

---

## Criterios de aceptación

| ID | Criterio | ¿Cubierto? |
|---|---|---|
| CA1 | Login/sesión → Jugador 1 con display name + color perfil | ✅ |
| CA2 | Color mapeado a `PLAYER_COLORS` (más cercano si no exacto) | ✅ `nearestPlayerColor` |
| CA3 | Prefill editable; cambios no escriben `profiles` | ✅ solo drafts locales |
| CA4 | Invitado: mismos campos, sin prefill ni persistencia | ✅ |
| CA5 | Logout setup → auth (`signOut` + `logoutToAuth`) | ✅ |
| CA6 | `tsc` + `build` limpios | ✅ 2026-07-17 |
| CA7 | Cero deps nuevas | ✅ |

---

## Verificación ejecutada

```
pnpm tsc --noEmit   # exit 0
pnpm build          # exit 0 (Next.js 15.5.20)
```

---

## Verificación manual pendiente (humano)

1. Login / sesión activa → Setup: Jugador 1 = `display_name` y color de paleta (o más cercano a `cap_color`).
2. Editar nombre/color en setup → Empezar; abrir `/profile` → valores de perfil intactos.
3. «Saltar» (invitado) → Setup sin prefill; sin «Cerrar sesión».
4. Con sesión: «Cerrar sesión» → pantalla auth (login + Saltar).
5. Color de perfil fuera de paleta (p.ej. `#3b82f6`) → se selecciona el `PLAYER_COLORS` más cercano.
6. Tras logout + login de nuevo → prefill otra vez al entrar a setup.

---

## Fuera de scope (no tocado)

- F02.5-A/B salvo consumo de `logoutToAuth` / sesión
- Escritura a `profiles` desde setup
- Tests vitest (no hay framework en package.json)
