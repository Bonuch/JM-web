"use client";

/**
 * Контурная сцена интерьера, которая дорисовывается по мере загрузки.
 *
 * Каждый элемент появляется на своём отрезке прогресса и «прочерчивается»
 * штрихом — как будто чертёж рисуют на глазах. Порядок повторяет то, как
 * собирают кадр в работе: сначала объём комнаты, затем свет, мебель и в
 * самом конце декор.
 */
type Piece = {
  /** Доля прогресса, на которой элемент начинает появляться */
  from: number;
  /** Доля, к которой он дорисован */
  to: number;
  d: string;
  /** Толщина линии: несущие линии плотнее декора */
  width?: number;
  /** Латунный акцент — для света и тёплых деталей */
  accent?: boolean;
  /** Заливка вместо контура: так рисуются световые пятна */
  fill?: string;
};

const PIECES: Piece[] = [
  // Объём комнаты
  { from: 0.0, to: 0.14, d: "M96 372 H704", width: 1.6 },
  { from: 0.03, to: 0.2, d: "M96 372 V96 H704 V372", width: 1.6 },
  { from: 0.1, to: 0.24, d: "M96 96 L150 130 M704 96 L650 130 M150 130 H650", width: 0.8 },

  // Окно
  { from: 0.18, to: 0.34, d: "M470 136 H676 V318 H470 Z", width: 1.4 },
  { from: 0.26, to: 0.4, d: "M573 136 V318 M470 227 H676", width: 1 },

  // Свет из окна: сначала заливка, поверх — контур луча
  {
    from: 0.28,
    to: 0.52,
    d: "M470 318 L676 318 L604 372 L352 372 Z",
    fill: "rgba(194,163,107,0.12)",
    width: 0,
  },
  { from: 0.32, to: 0.5, d: "M470 318 L352 372 M676 318 L604 372", width: 0.8, accent: true },

  // Ковёр
  { from: 0.36, to: 0.5, d: "M168 372 L246 332 H438 L372 372 Z", width: 1 },

  // Диван
  { from: 0.4, to: 0.56, d: "M170 344 V286 H386 V344", width: 1.4 },
  { from: 0.45, to: 0.6, d: "M170 344 H386 M186 344 V368 M370 344 V368", width: 1.2 },
  { from: 0.48, to: 0.62, d: "M204 286 V258 H352 V286", width: 1 },
  // подушки
  { from: 0.54, to: 0.66, d: "M222 286 L246 262 L268 286 Z M292 286 L316 264 L338 286 Z", width: 0.9 },

  // Журнальный столик и книги
  { from: 0.56, to: 0.7, d: "M408 330 H494 V340 H408 Z M416 340 V366 M486 340 V366", width: 1.1 },
  { from: 0.62, to: 0.74, d: "M428 330 V322 H466 V330", width: 0.8 },

  // Торшер
  { from: 0.6, to: 0.74, d: "M132 372 V236 M110 236 H154 L146 208 H118 Z", width: 1.1, accent: true },
  {
    from: 0.66,
    to: 0.8,
    d: "M132 208 m-34 0 a34 34 0 1 0 68 0 a34 34 0 1 0 -68 0",
    fill: "rgba(194,163,107,0.1)",
    width: 0,
  },

  // Картина
  { from: 0.64, to: 0.78, d: "M180 150 H300 V240 H180 Z", width: 1 },
  { from: 0.7, to: 0.82, d: "M192 222 L226 178 L252 210 L268 194 L288 222 Z", width: 0.9 },

  // Подвесной светильник
  { from: 0.74, to: 0.86, d: "M420 96 V148 M398 148 H442 L434 174 H406 Z", width: 1.1, accent: true },

  // Растение
  { from: 0.78, to: 0.9, d: "M648 372 V344 H692 V372 Z", width: 1.1 },
  {
    from: 0.82,
    to: 0.94,
    d: "M670 344 V286 M670 306 C650 300 642 282 646 266 C662 270 670 288 670 306 M670 316 C690 310 700 292 696 276 C680 280 670 298 670 316",
    width: 0.9,
  },

  // Штора
  { from: 0.86, to: 0.97, d: "M424 128 V330 M438 128 V330 M452 128 V330", width: 0.9 },

  // Последний штрих: плинтус
  { from: 0.9, to: 1.0, d: "M96 364 H704", width: 0.6 },
];

function segmentProgress(progress: number, from: number, to: number): number {
  if (progress <= from) return 0;
  if (progress >= to) return 1;
  return (progress - from) / (to - from);
}

export function PreloaderScene({ progress }: { progress: number }) {
  const glow = segmentProgress(progress, 0.28, 0.95);

  return (
    <svg
      viewBox="88 86 624 300"
      fill="none"
      aria-hidden="true"
      className="h-auto w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="preloader-glow" cx="66%" cy="52%" r="46%">
          <stop offset="0%" stopColor="rgba(194,163,107,0.28)" />
          <stop offset="100%" stopColor="rgba(194,163,107,0)" />
        </radialGradient>
      </defs>

      {/* Тёплое свечение за окном набирает силу вместе с прогрессом */}
      <rect
        x="88"
        y="86"
        width="624"
        height="300"
        fill="url(#preloader-glow)"
        opacity={glow}
        style={{ transition: "opacity 420ms ease-out" }}
      />

      {PIECES.map((piece, index) => {
        const drawn = segmentProgress(progress, piece.from, piece.to);

        if (piece.fill) {
          return (
            <path
              key={index}
              d={piece.d}
              fill={piece.fill}
              opacity={drawn}
              style={{ transition: "opacity 420ms ease-out" }}
            />
          );
        }

        return (
          <path
            key={index}
            d={piece.d}
            stroke={piece.accent ? "var(--color-brass)" : "var(--color-sand)"}
            strokeWidth={piece.width ?? 1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - drawn}
            opacity={piece.accent ? 0.5 + drawn * 0.5 : 0.3 + drawn * 0.55}
            style={{ transition: "stroke-dashoffset 420ms ease-out, opacity 420ms ease-out" }}
          />
        );
      })}
    </svg>
  );
}
