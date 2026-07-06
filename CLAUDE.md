# Instrucciones para Claude

> Carga automática al inicio de sesión.
> Repo: `chapas-racing` — Next 15, React 19, @react-three/fiber 9, @react-three/rapier 2, zustand 5, pnpm.

## Documentos de referencia

| Doc | Cuándo leer |
|---|---|
| `docs/architecture.md` | Antes de escribir/revisar código. Capas, principios, anti-patrones |
| `docs/conventions.md` | Antes de escribir código. Estilo, nombres, patrones repo |
| `docs/verification.md` | Antes de cerrar tarea. Niveles de evidencia |
| `feature_list.md` | Roadmap F01–F12 + dependencias |
| `specs/*.md` | Spec detallada de iteración/feature en curso |

## Dos modos de trabajo

### Modo ligero (default)

Tareas acotadas: fix, tuning `config/physics.ts`, componente aislado, ajuste de spec, docs.

- Implementas TÚ directamente.
- Obligatorio igualmente: `docs/conventions.md` + verificación (`pnpm tsc --noEmit && pnpm build`).
- TDD si lógica pura: test antes de impl.

### Modo harness (orquestación)

Actúas como `leader` (`.claude/agents/leader.md`): descompones y coordinas, NUNCA implementas.

Señales de activación (cualquiera):
- Feature completa de `feature_list.md` (F01–F12).
- Spec multi-dominio: toca 3+ de {stores, física, UI, schema JSON, backend}.
- Refactor cruzado entre features.
- Tarea con investigación previa necesaria (API rapier/fiber dudosa).

Reglas duras en este modo:
- ❌ No editas `src/` (ni Edit, ni Write, ni Bash).
- ❌ No marcas features `done` (implementer tras review aprobada).
- ✅ Subagentes vía herramienta `Task`:
  - `implementer` → código de UNA tarea.
  - `reviewer` → valida antes de cerrar.
  - `explorer` (general-purpose) → 1-2 en paralelo, preguntas acotadas, si investigación necesaria.

### Protocolo de arranque (modo harness)

1. Lee spec/feature de la tarea + `progress/current.md` si existe.
2. Baseline: `pnpm tsc --noEmit`. Rojo antes de empezar -> para, reporta.
3. Aplica tabla de escalado de `.claude/agents/leader.md`.

### Regla anti-teléfono-descompuesto

Subagentes escriben resultados en archivos, devuelven solo referencia:
- `progress/research_<tema>.md` (explorer)
- `progress/impl_<tarea>.md` (implementer)
- `progress/review_<tarea>.md` (reviewer)

Resultado en chat sin referencia -> rechazado, relanza.

## Cuándo NO aplica ningún modo especial

- Preguntas conceptuales / exploración repo (lectura pura) -> respondes directo.
- Cambios fuera de `src/` (docs, specs, `progress/`, config repo) -> editas tú, cualquier modo.

## Invariantes (ambos modos)

- Cero deps nuevas sin discusión (`blocked`).
- Constantes -> `config/physics.ts`.
- `pnpm`, nunca npm/yarn.
- Nada `done` con `tsc`/`build` en rojo.