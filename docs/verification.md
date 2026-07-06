# Verificación — Cómo demostrar que el trabajo funciona

> Regla de oro: **agente no dice "funciona", lo demuestra**.
> Toda feature termina con evidencia ejecutable o pasos manuales reproducibles. Nunca afirmaciones.

## Niveles

### Nivel 1 — Compilación y build (obligatorio, siempre)

```bash
pnpm tsc --noEmit   # cero errores
pnpm build          # cero errores
```

Rojo -> nada es `done`. Sin excepciones.

### Nivel 2 — Tests unitarios de lógica pura (obligatorio si vitest existe)

Toda fn pura nueva/modificada con test:

- Transformaciones de datos: `useTrackGeometry` (waypoints -> transforms), `validateTrack`, helpers.
- Stores: transiciones de fase (`idle -> aiming -> moving`), guards (`startAiming` bloqueado si `won`).

Cada test:
1. Camino feliz con resultado concreto (valores, no "no lanza").
2. Al menos un camino de error si fn puede fallar (`validateTrack` con 1 waypoint -> throw con mensaje).

```bash
pnpm vitest run
```

NO testear: componentes R3F, canvas, física rapier. Coste alto, valor bajo -> nivel 3.

### Nivel 3 — Verificación manual en navegador (obligatorio para features de escena/física/UI)

`pnpm dev` -> flujo end-to-end. Pasos EXACTOS escritos en `progress/impl_<tarea>.md`, formato reproducible:

```markdown
## Verificación manual
1. Lanzar chapa recto por tramo 1 -> desliza, para sobre pista, phase vuelve a idle.
2. Lanzar potencia máx hacia borde -> chapa sale -> tras ~10 frames reaparece en punto de lanzamiento, quieta.
3. Console: "Fuera de pista. Última pieza: seg-2".
4. Cruzar meta -> modal victoria. Click chapa con modal abierto -> sin efecto.
```

Cada paso: acción + resultado observable concreto. Humano (o reviewer) repite sin contexto extra.

### Nivel 4 — Regresión de flujo base (obligatorio si cambio toca launch/física/stores)

Flujo iter 1 sigue vivo:
1. Click chapa -> aiming, cámara bloqueada, flecha visible.
2. Drag atrás -> potencia sube, flecha crece verde -> rojo.
3. Drag a origen + soltar -> cancela, sin impulso.
4. Soltar con potencia -> chapa desliza, frena, `settle` -> idle.

## Anti-patrones

- ❌ "He añadido el sensor, debería funcionar" -> falta evidencia (test o pasos manuales con resultado observado).
- ❌ Test que solo verifica "no lanza excepción" -> comprueba resultado concreto.
- ❌ Mock de rapier/Three para testear componentes -> no. Lógica pura se extrae y testea; componente se verifica manual.
- ❌ Pasos manuales vagos ("probar que va bien") -> acción + resultado observable.
- ❌ `done` con `tsc` o `build` en rojo.
- ❌ Verificar solo la feature nueva, ignorar regresión de flujo base.

## Cierre de sesión

```bash
pnpm tsc --noEmit && pnpm build
```

Verde + informe `progress/impl_<tarea>.md` con niveles cubiertos -> listo para reviewer.
Rojo -> `progress/current.md` estado `blocked`. Nada se marca `done`.