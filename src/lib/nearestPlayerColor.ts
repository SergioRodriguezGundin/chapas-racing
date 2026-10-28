import { PLAYER_COLORS } from "@/config/physics";

/** Parsea `#RRGGBB` (con o sin `#`) a RGB 0–255. */
function parseHexRgb(hex: string): [number, number, number] | null {
  const normalized = hex.trim().replace(/^#/, "");
  if (!/^[0-9A-Fa-f]{6}$/.test(normalized)) {
    return null;
  }
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
  ];
}

/**
 * Mapea un hex de perfil a la paleta de chapas.
 * Match exacto case-insensitive; si no, el color con menor distancia RGB².
 * Hex inválido → primer color de la paleta.
 */
export function nearestPlayerColor(
  hex: string,
  palette: readonly string[] = PLAYER_COLORS,
): string {
  if (palette.length === 0) {
    return "#000000";
  }

  const needle = hex.trim().toLowerCase();
  const exact = palette.find((color) => color.toLowerCase() === needle);
  if (exact) {
    return exact;
  }

  const rgb = parseHexRgb(hex);
  if (!rgb) {
    return palette[0];
  }

  let best = palette[0];
  let bestDist = Number.POSITIVE_INFINITY;

  for (const color of palette) {
    const candidate = parseHexRgb(color);
    if (!candidate) continue;
    const dist =
      (rgb[0] - candidate[0]) ** 2 +
      (rgb[1] - candidate[1]) ** 2 +
      (rgb[2] - candidate[2]) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = color;
    }
  }

  return best;
}
