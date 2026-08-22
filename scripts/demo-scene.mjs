/**
 * Процедурная «интерьерная» сцена для демо-контента.
 *
 * Это не фотография и не претендует на неё: обобщённый кадр — стена, окно,
 * световое пятно на полу и силуэты мебели. Задача — показать, как сайт
 * выглядит с наполнением, пока в него не загрузили настоящие рендеры.
 */

export const PALETTES = {
  warmClay: { wall: [58, 50, 44], floor: [42, 35, 30], light: [255, 226, 178], accent: [96, 78, 62] },
  softSand: { wall: [72, 65, 57], floor: [52, 45, 39], light: [255, 236, 205], accent: [110, 96, 80] },
  coolStone: { wall: [52, 54, 58], floor: [38, 40, 44], light: [226, 236, 255], accent: [78, 82, 90] },
  deepGreen: { wall: [42, 52, 46], floor: [32, 39, 35], light: [244, 240, 214], accent: [70, 88, 76] },
  nightBrass: { wall: [38, 34, 32], floor: [28, 25, 24], light: [255, 198, 128], accent: [92, 70, 48] },
  paleLinen: { wall: [86, 80, 72], floor: [62, 56, 50], light: [255, 248, 232], accent: [122, 112, 98] },
};

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function mix(a, b, amount) {
  return [
    a[0] + (b[0] - a[0]) * amount,
    a[1] + (b[1] - a[1]) * amount,
    a[2] + (b[2] - a[2]) * amount,
  ];
}

/** Детерминированный шум — одинаковый при каждом запуске скрипта. */
function noise(x, y) {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

/**
 * Возвращает функцию отрисовки пикселя для заданной композиции.
 * Координаты внутри нормализуются, поэтому одна и та же сцена корректно
 * рисуется в любом размере — от превью до полного кадра.
 */
export function createScene({ palette, windowX = 0.58, horizon = 0.68, variant = 0 }) {
  const colors = PALETTES[palette] ?? PALETTES.warmClay;

  const windowLeft = windowX - 0.17;
  const windowRight = windowX + 0.17;
  const windowTop = 0.12;
  const windowBottom = 0.55;

  return (px, py, width, height) => {
    const x = px / width;
    const y = py / height;

    // Стена и пол
    const floorAmount = smoothstep(horizon - 0.004, horizon + 0.004, y);
    let color = mix(colors.wall, colors.floor, floorAmount);

    // Вертикальный градиент стены: сверху темнее, у пола светлее
    if (floorAmount < 0.5) {
      color = mix(color, colors.accent, smoothstep(0.0, horizon, y) * 0.35);
    }

    // Окно и свет за ним
    const inWindowX = smoothstep(windowLeft - 0.006, windowLeft + 0.006, x) *
      (1 - smoothstep(windowRight - 0.006, windowRight + 0.006, x));
    const inWindowY = smoothstep(windowTop - 0.006, windowTop + 0.006, y) *
      (1 - smoothstep(windowBottom - 0.006, windowBottom + 0.006, y));
    const windowMask = inWindowX * inWindowY;

    if (windowMask > 0) {
      const glow = mix(colors.light, [255, 255, 255], 1 - smoothstep(windowTop, windowBottom, y) * 0.6);
      color = mix(color, glow, windowMask);

      // переплёт рамы
      const mullion = Math.abs(x - windowX) < 0.004 || Math.abs(y - (windowTop + windowBottom) / 2) < 0.003;
      if (mullion) color = mix(color, colors.accent, 0.75 * windowMask);
    }

    // Мягкое свечение вокруг окна
    const distanceToWindow = Math.hypot(
      (x - windowX) / 0.42,
      (y - (windowTop + windowBottom) / 2) / 0.5,
    );
    color = mix(color, colors.light, Math.max(0, 1 - distanceToWindow) * 0.22);

    // Световое пятно на полу — параллелограмм со смещением
    if (y > horizon) {
      const depth = (y - horizon) / (1 - horizon);
      const centre = windowX - 0.12 - depth * 0.18;
      const halfWidth = 0.16 + depth * 0.12;
      const patch = 1 - smoothstep(halfWidth * 0.55, halfWidth, Math.abs(x - centre));
      color = mix(color, colors.light, patch * 0.3 * (1 - depth * 0.7));
    }

    // Силуэты мебели: горизонтальный объём у пола
    const sofaTop = horizon - 0.13 + (variant % 2) * 0.03;
    const sofaLeft = variant % 2 === 0 ? 0.04 : 0.52;
    const sofaRight = sofaLeft + 0.4;
    const sofaMask =
      smoothstep(sofaLeft, sofaLeft + 0.02, x) *
      (1 - smoothstep(sofaRight - 0.02, sofaRight, x)) *
      smoothstep(sofaTop, sofaTop + 0.015, y) *
      (1 - smoothstep(horizon + 0.12, horizon + 0.145, y));
    if (sofaMask > 0) {
      const shade = mix(colors.floor, [0, 0, 0], 0.25);
      const lit = mix(shade, colors.light, 0.18 * (1 - smoothstep(sofaTop, horizon, y)));
      color = mix(color, lit, sofaMask);
    }

    // Вертикальный акцент: штора или колонна с противоположной стороны
    const columnX = variant % 2 === 0 ? 0.9 : 0.08;
    const columnMask =
      (1 - smoothstep(0.0, 0.055, Math.abs(x - columnX))) * (1 - smoothstep(0.8, 1.0, y));
    color = mix(color, mix(colors.accent, [0, 0, 0], 0.35), columnMask * 0.7);

    // Виньетка
    const vignette = 1 - smoothstep(0.45, 1.05, Math.hypot(x - 0.5, y - 0.5) * 1.35);
    color = mix(mix(color, [0, 0, 0], 0.55), color, vignette);

    // Лёгкое зерно. Сильнее делать нельзя: случайный шум почти не сжимается,
    // и демо-картинки раздуваются до нескольких мегабайт каждая.
    const grain = (noise(px * 0.7, py * 0.7) - 0.5) * 2;
    return [color[0] + grain, color[1] + grain, color[2] + grain];
  };
}
