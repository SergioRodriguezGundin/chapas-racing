import { useMemo } from "react";

import { TRACK } from "@/config/physics";
import type { TrackDefinition } from "@/features/track/track.types";

/** Transformación de un tramo de suelo entre dos waypoints consecutivos. */
export interface TrackSegment {
  position: [number, number, number];
  rotationY: number;
  length: number;
}

/** Transformación de la línea de meta. */
export interface FinishTransform {
  position: [number, number, number];
  rotationY: number;
}

/** Geometría derivada de la polilínea del circuito: colliders de suelo y meta. */
export interface TrackGeometry {
  segments: TrackSegment[];
  pads: [number, number, number][];
  finishTransform: FinishTransform;
}

/**
 * Ángulo Y que alinea el eje local +X de una caja con la dirección (dx, dz) en XZ.
 * La rotación Y de Three mapea +X -> (cos, 0, -sin); igualar con (dx, dz) exige
 * atan2(-dz, dx) para que el largo del tramo siga la dirección A->B.
 */
function directionAngle(dx: number, dz: number): number {
  return Math.atan2(-dz, dx);
}

/**
 * Convierte la polilínea de waypoints en transformaciones de colliders.
 * Función pura: sin stores, sin efectos, verificable por inspección.
 */
export function computeTrackGeometry(track: TrackDefinition): TrackGeometry {
  const { waypoints, finish } = track;
  const y = TRACK.groundY;

  const segments: TrackSegment[] = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const [ax, az] = waypoints[i];
    const [bx, bz] = waypoints[i + 1];
    const dx = bx - ax;
    const dz = bz - az;

    segments.push({
      position: [(ax + bx) / 2, y, (az + bz) / 2],
      rotationY: directionAngle(dx, dz),
      length: Math.hypot(dx, dz),
    });
  }

  const pads: [number, number, number][] = waypoints.map(([x, z]) => [x, y, z]);

  // Tramo que llega a la meta: (i-1 -> i), o (0 -> 1) si la meta cae en el primer waypoint.
  const i = finish.waypointIndex;
  const from = waypoints[i > 0 ? i - 1 : 0];
  const to = waypoints[i > 0 ? i : 1];
  const segmentAngle = directionAngle(to[0] - from[0], to[1] - from[1]);
  const [fx, fz] = waypoints[i];

  // Meta perpendicular al tramo: +90º sobre el ángulo de dirección del tramo.
  const finishTransform: FinishTransform = {
    position: [fx, y, fz],
    rotationY: segmentAngle + Math.PI / 2,
  };

  return { segments, pads, finishTransform };
}

/** Memoiza la geometría del circuito; recalcula solo si cambia `track`. */
export function useTrackGeometry(track: TrackDefinition): TrackGeometry {
  return useMemo(() => computeTrackGeometry(track), [track]);
}
