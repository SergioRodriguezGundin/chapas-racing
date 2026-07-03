"use client";

import { useCallback, useEffect, useRef } from "react";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useGameStore } from "@/stores/gameStore";
import { LAUNCH } from "@/config/physics";

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
 * Listeners en window (no en mesh): el drag sale del mesh inmediatamente.
 * Pointer Events -> ratón y táctil cubiertos.
 */
export function useLaunch(
  bodyRef: React.RefObject<RapierRigidBody | null>,
) {
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const dragOrigin = useRef(new THREE.Vector3());
  const phase = useGameStore((s) => s.phase);

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
      if (useGameStore.getState().phase !== "idle") return;
      const body = bodyRef.current;
      if (!body) return;
      e.stopPropagation();

      // Origen del drag = posición actual de la chapa proyectada al suelo.
      // Más estable que el punto exacto de click.
      const t = body.translation();
      dragOrigin.current.set(t.x, 0, t.z);
      useGameStore.getState().startAiming();
    },
    [bodyRef],
  );

  // Mientras aiming: listeners globales de move/up
  useEffect(() => {
    if (phase !== "aiming") return;

    const handleMove = (e: PointerEvent) => {
      const hit = pointToGround(e.clientX, e.clientY);
      if (!hit) return;

      // Arrastras hacia atrás -> la chapa sale hacia delante
      const drag = new THREE.Vector3().subVectors(dragOrigin.current, hit);
      drag.y = 0;

      const dist = Math.min(drag.length(), LAUNCH.maxDragDistance);
      const power = dist / LAUNCH.maxDragDistance;
      if (drag.lengthSq() > 1e-8) drag.normalize();

      useGameStore.getState().updateAim([drag.x, 0, drag.z], power);
    };

    const handleUp = () => {
      const { aim, cancelAim, launch } = useGameStore.getState();
      const body = bodyRef.current;

      // Drag corto o vuelta al origen -> cancela tiro
      if (!body || aim.power < LAUNCH.minLaunchPower) {
        cancelAim();
        return;
      }

      const t = body.translation();
      launch([t.x, t.y, t.z]); // snapshot pre-lanzamiento (regla fuera-pista iter 2)

      body.wakeUp();
      // Impulso 100% horizontal: la chapa desliza, no vuela
      body.applyImpulse(
        {
          x: aim.direction[0] * aim.power * LAUNCH.maxImpulse,
          y: 0,
          z: aim.direction[2] * aim.power * LAUNCH.maxImpulse,
        },
        true,
      );
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [phase, pointToGround, bodyRef]);

  return { onPointerDown };
}
