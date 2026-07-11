# Estado actual

## Completado

- Iteración 2 (features 1–8): `done`
- F01 hot-seat (A/B/C): APPROVED
- BUG-01/02/03: `done`

## Planificación F02 (sesión actual)

Investigación: `progress/research_supabase_auth.md`

F02 descompuesto en `feature_list.json`:

| ID | Nombre | Status | Depende de |
|----|--------|--------|------------|
| F02-A | supabase_client_setup | **blocked** | aprobación deps + proyecto Supabase |
| F02-B | auth_login_ui | pending | F02-A |
| F02-C | profiles_migration_rls | pending | F02-A |
| F02-E | route_protection | pending | F02-A, F02-B |
| F02-D | profile_editor_ui | pending | F02-B, F02-C, F02-E |

**Orden sugerido:** A → (B ∥ C) → E → D

## Siguiente acción

1. Aprobar deps `@supabase/supabase-js` + `@supabase/ssr`
2. Crear/configurar proyecto Supabase (URL, anon key, Google OAuth)
3. Desbloquear F02-A → arrancar harness (implementer + reviewer)

**Sin implementación iniciada** (instrucción usuario).
