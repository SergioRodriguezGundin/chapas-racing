import circuit01 from "@/features/track/tracks/circuit-01.json";

/** Definición data-driven de un circuito: eje central, ancho, inicio y meta. */
export interface TrackDefinition {
  name: string;
  /** Ancho total del trazado */
  trackWidth: number;
  /** Posición inicial de la chapa [x, y, z]; debe caer sobre el primer tramo */
  capStart: [number, number, number];
  /** Polilínea [x, z] del eje central del trazado. Circuito abierto (no loop) */
  waypoints: [number, number][];
  /** Meta perpendicular al último tramo, centrada en waypoints[waypointIndex] */
  finish: {
    waypointIndex: number;
    width: number;
  };
}

/**
 * Validación runtime ligera. Lanza Error accionable si el circuito es inválido.
 * Falla en carga, no en runtime de física.
 */
export function validateTrack(def: TrackDefinition): TrackDefinition {
  if (def.waypoints.length < 2) {
    throw new Error(
      `${def.name}: waypoints requiere >= 2, recibido ${def.waypoints.length}`
    );
  }
  if (def.trackWidth <= 0) {
    throw new Error(
      `${def.name}: trackWidth debe ser > 0, recibido ${def.trackWidth}`
    );
  }
  if (
    def.finish.waypointIndex < 0 ||
    def.finish.waypointIndex >= def.waypoints.length
  ) {
    throw new Error(
      `${def.name}: finish.waypointIndex fuera de rango [0, ${
        def.waypoints.length - 1
      }], recibido ${def.finish.waypointIndex}`
    );
  }
  return def;
}

/** Shape del JSON importado: TS infiere arrays genéricos, no tuplas. */
interface RawTrackDefinition {
  name: string;
  trackWidth: number;
  capStart: number[];
  waypoints: number[][];
  finish: {
    waypointIndex: number;
    width: number;
  };
}

/** Normaliza arrays del JSON a las tuplas de TrackDefinition sin casts inseguros. */
function normalizeTrack(raw: RawTrackDefinition): TrackDefinition {
  return {
    name: raw.name,
    trackWidth: raw.trackWidth,
    capStart: [raw.capStart[0], raw.capStart[1], raw.capStart[2]],
    waypoints: raw.waypoints.map(([x, z]): [number, number] => [x, z]),
    finish: {
      waypointIndex: raw.finish.waypointIndex,
      width: raw.finish.width,
    },
  };
}

// Memoiza para validar una sola vez por carga de módulo.
let currentTrack: TrackDefinition | null = null;

/** Circuito activo, tipado y validado. Único punto de acceso para store y componentes. */
export function getCurrentTrack(): TrackDefinition {
  if (currentTrack === null) {
    currentTrack = validateTrack(normalizeTrack(circuit01));
  }
  return currentTrack;
}
