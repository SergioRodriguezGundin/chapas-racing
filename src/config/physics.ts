/**
 * Constantes de física y gameplay.
 * Único punto de tuning: tocar aquí, no en componentes.
 */
export const PHYSICS = {
  /** Radio de la chapa (m) */
  capRadius: 0.5,
  /** Altura de la chapa (m) */
  capHeight: 0.15,
  /** Masa (kg) — Rapier la deriva del collider por densidad; usamos density */
  capDensity: 2,
  /** Amortiguación lineal -> la chapa desliza y frena sola */
  linearDamping: 1.2,
  /** Amortiguación angular -> evita giro perpetuo */
  angularDamping: 2,
  /** Fricción chapa/suelo (0..n). Iter futura: dependerá del terreno */
  friction: 0.5,
  /** Rebote. Bajo: chapa desliza, no bota */
  restitution: 0.1,
} as const;

export const LAUNCH = {
  /** Distancia máx de arrastre en unidades mundo -> potencia 1.0 */
  maxDragDistance: 4,
  /** Impulso aplicado a potencia 1.0 */
  maxImpulse: 12,
  /** Potencia mínima (0..1) para disparar. Debajo -> cancela tiro */
  minLaunchPower: 0.08,
} as const;

export const STOP_DETECTION = {
  /** Velocidad lineal (m/s) bajo la cual se considera parada */
  velocityThreshold: 0.08,
  /** Frames consecutivos bajo umbral para confirmar parada */
  framesRequired: 30,
} as const;

export const CAP_START_POSITION: [number, number, number] = [0, 0.3, 0];
