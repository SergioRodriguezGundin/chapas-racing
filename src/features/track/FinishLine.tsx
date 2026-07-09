"use client";

import { CuboidCollider, RigidBody, type IntersectionEnterPayload } from "@react-three/rapier";

import { TRACK } from "@/config/physics";
import { getCurrentTrack } from "@/features/track/track.types";
import { useTrackGeometry } from "@/features/track/useTrackGeometry";
import { useGameStore } from "@/stores/gameStore";

const FINISH_COLOR = "#ffd166";

/** Línea de meta: sensor perpendicular al último tramo que dispara win() al cruzarla la chapa. */
export function FinishLine() {
  const track = getCurrentTrack();
  const { finish } = track;
  const { finishTransform } = useTrackGeometry(track);

  const { finishHeight, finishDepth, finishOpacity } = TRACK;

  // Guard de status (patrón repo: getState(), sin selector suscrito). El guard por
  // userData es red de seguridad si en el futuro entra otro dynamic body en escena.
  const handleIntersectionEnter = (payload: IntersectionEnterPayload) => {
    if (useGameStore.getState().status !== "playing") return;
    if (payload.other.rigidBodyObject?.userData?.type !== "cap") return;
    useGameStore.getState().win();
  };

  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={finishTransform.position}
      rotation={[0, finishTransform.rotationY, 0]}
    >
      {/* args = half-extents; ancho finish.width en eje X (mismo criterio que el largo
          de los segmentos) para que rotationY = anguloTramo + π/2 lo cruce sobre la pista. */}
      <CuboidCollider
        args={[finish.width / 2, finishHeight / 2, finishDepth / 2]}
        sensor
        onIntersectionEnter={handleIntersectionEnter}
      />
      <mesh>
        <boxGeometry args={[finish.width, finishHeight, finishDepth]} />
        <meshStandardMaterial color={FINISH_COLOR} transparent opacity={finishOpacity} />
      </mesh>
    </RigidBody>
  );
}
