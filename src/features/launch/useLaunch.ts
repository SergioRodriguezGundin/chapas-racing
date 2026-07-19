"use client";

import { useCallback, useEffect, useRef } from "react";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";

import { LAUNCH } from "@/config/physics";
import {
  broadcastLocalLaunch,
  canLocalPlayerAim,
  submitRoomLaunch,
} from "@/features/online/onlineSession";
import { useGameStore } from "@/stores/gameStore";

/** Plano y=0 sobre el que se proyecta el puntero */
const GROUND_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

/**
 * Mecánica tirachinas:
 * 1. pointerdown sobre la chapa -> phase=aiming, origen = posición chapa en suelo
 * 2. pointermove (window) -> vector arrastre = origen - puntero, proyectado a XZ
 *    -> dirección = vector arrastre normalizado (opuesto al drag)
 *    -> potencia = |arrastre| / maxDragDistance, clamp 0..1
 * 3. pointerup -> potencia >= minLaunchPower ? applyImpulse : cancelar
 *
 * Online: RPC submit_room_launch antes de impulso + Broadcast (autoridad server).
 */
export function useLaunch(
  bodyRef: React.RefObject<RapierRigidBody | null>,
  playerIndex: number,
) {
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const dragOrigin = useRef(new THREE.Vector3());
  const submittingRef = useRef(false);
  const phase = useGameStore((s) => s.phase);
  const activePlayerIndex = useGameStore((s) => s.activePlayerIndex);

  /** Proyecta coords de pantalla al plano del suelo. null si el rayo no corta. */
  const pointToGround = useCallback(
    (clientX: number, clientY: number): THREE.Vector3 | null => {
      const rect = gl.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.current.setFromCamera(ndc, camera);
      const hit = new THREE.Vector3();
      return raycaster.current.ray.intersectPlane(GROUND_PLANE, hit)
        ? hit
        : null;
    },
    [camera, gl],
  );

  /** Handler para el mesh de la chapa (evento R3F) */
  const onPointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      const state = useGameStore.getState();
      if (state.status !== "playing") return;
      if (state.phase !== "idle") return;
      if (state.activePlayerIndex !== playerIndex) return;
      if (!canLocalPlayerAim(playerIndex)) return;
      const body = bodyRef.current;
      if (!body) return;
      e.stopPropagation();

      const t = body.translation();
      dragOrigin.current.set(t.x, 0, t.z);
      state.startAiming();
    },
    [bodyRef, playerIndex],
  );

  useEffect(() => {
    if (phase !== "aiming" || playerIndex !== activePlayerIndex) return;
    if (!canLocalPlayerAim(playerIndex)) return;

    const handleMove = (e: PointerEvent) => {
      if (submittingRef.current) return;
      const hit = pointToGround(e.clientX, e.clientY);
      if (!hit) return;

      const drag = new THREE.Vector3().subVectors(dragOrigin.current, hit);
      drag.y = 0;

      const dist = Math.min(drag.length(), LAUNCH.maxDragDistance);
      const power = dist / LAUNCH.maxDragDistance;
      if (drag.lengthSq() > 1e-8) drag.normalize();

      useGameStore.getState().updateAim([drag.x, 0, drag.z], power);
    };

    const handleUp = () => {
      if (submittingRef.current) return;

      const { aim, cancelAim, launch } = useGameStore.getState();
      const body = bodyRef.current;

      if (!body || aim.power < LAUNCH.minLaunchPower) {
        cancelAim();
        return;
      }

      const t = body.translation();
      const from: [number, number, number] = [t.x, t.y, t.z];
      const direction = aim.direction;
      const power = aim.power;

      submittingRef.current = true;
      void (async () => {
        try {
          const accepted = await submitRoomLaunch(direction, power, from);
          if (!accepted) {
            useGameStore.getState().cancelAim();
            return;
          }

          const state = useGameStore.getState();
          if (
            state.phase !== "aiming" ||
            state.activePlayerIndex !== playerIndex ||
            state.status !== "playing"
          ) {
            state.cancelAim();
            return;
          }

          const liveBody = bodyRef.current;
          if (!liveBody) {
            state.cancelAim();
            return;
          }

          launch(from);
          liveBody.wakeUp();
          liveBody.applyImpulse(
            {
              x: direction[0] * power * LAUNCH.maxImpulse,
              y: 0,
              z: direction[2] * power * LAUNCH.maxImpulse,
            },
            true,
          );
          broadcastLocalLaunch(direction, power, from);
        } finally {
          submittingRef.current = false;
        }
      })();
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [phase, activePlayerIndex, playerIndex, pointToGround, bodyRef]);

  return { onPointerDown };
}
