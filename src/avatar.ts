// src/avatar.ts
type Color = string;
type Expression = "smile" | "surprised" | "closed";
type AccessoryKind = "none" | "hat" | "glasses" | "hair" | "bow";

export interface AvatarOptions {
  size?: number;
  seed?: string | number;
  enableBackground?: boolean; // 背景随机（纯色/渐变）
  enableAccessories?: boolean; // 是否生成配件
  enableExpressions?: boolean; // 是否生成表情
  palette?: Color[]; // 可选的配色盘（用于脸/背景/配件）
  returnSvgString?: boolean; // 如果 true 返回 SVG 字符串，否则返回 Data URI（Base64）
}

/* ---------- deterministic RNG (mulberry32) ---------- */
/* returns function(): number in [0,1) */
function makeRng(seed?: string | number) {
  let h = 2166136261 >>> 0;
  const s = String(seed ?? Math.random());
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  }
  // mulberry32-like
  let state = h >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- helpers ---------- */
const defaultPalette = [
  "#FFD6E0",
  "#FFE6A3",
  "#A3E4FF",
  "#B8FFB0",
  "#F0C0FF",
  "#FFD9B3",
  "#DDE7FF",
];

function pick<T>(arr: T[], rnd: () => number) {
  return arr[Math.floor(rnd() * arr.length)];
}

/* ---------- accessory SVG builders ---------- */
/*
 Each builder returns an SVG fragment string (not a complete SVG),
 coordinates are relative to size passed in.
*/

function hatVariants(size: number, color: Color) {
  const w = size * 0.9;
  const x = (size - w) / 2;
  const baseY = size * 0.22;
  return [
    // cap (simple)
    `<g transform="translate(0,0)">
      <rect x="${x}" y="${baseY - size * 0.06}" width="${w}" height="${
      size * 0.12
    }" rx="${size * 0.03}" fill="${color}" />
      <ellipse cx="${size / 2}" cy="${baseY + size * 0.02}" rx="${
      w * 0.55
    }" ry="${size * 0.06}" fill="${color}" opacity="0.95"/>
    </g>`,
    // beanie
    `<g transform="translate(0,0)">
      <path d="M${x} ${baseY} Q ${size / 2} ${baseY - size * 0.2} ${
      x + w
    } ${baseY} Z" fill="${color}" />
      <rect x="${x + w * 0.12}" y="${baseY}" width="${w * 0.76}" height="${
      size * 0.06
    }" rx="${size * 0.03}" fill="${color}" />
    </g>`,
    // straw-ish wide brim
    `<g transform="translate(0,0)">
      <ellipse cx="${size / 2}" cy="${baseY - size * 0.05}" rx="${
      w * 0.6
    }" ry="${size * 0.06}" fill="${color}" />
      <rect x="${size * 0.18}" y="${baseY - size * 0.07}" width="${
      w * 0.64
    }" height="${size * 0.08}" rx="${size * 0.02}" fill="${color}" />
    </g>`,
  ];
}

function hairVariants(size: number, color: Color) {
  const topY = size * 0.18;
  return [
    // fringe short
    `<path d="M${size * 0.12},${topY} Q${size * 0.25},${topY - size * 0.05} ${
      size * 0.4
    },${topY} Q${size * 0.5},${topY - size * 0.06} ${size * 0.6},${topY} Q${
      size * 0.75
    },${topY - size * 0.05} ${size * 0.88},${topY} Z" fill="${color}" />`,
    // long side hair
    `<path d="M${size * 0.08},${size * 0.28} Q${size * 0.18},${size * 0.45} ${
      size * 0.12
    },${size * 0.7} Q${size * 0.18},${size * 0.68} ${size * 0.2},${
      size * 0.6
    } Q${size * 0.26},${size * 0.48} ${size * 0.3},${size * 0.7} L${
      size * 0.38
    },${size * 0.72} Q${size * 0.28},${size * 0.5} ${size * 0.14},${
      size * 0.34
    }" fill="${color}" />`,
    // top bun-ish
    `<g>
      <ellipse cx="${size * 0.74}" cy="${size * 0.18}" rx="${
      size * 0.08
    }" ry="${size * 0.06}" fill="${color}" />
      <path d="M${size * 0.12},${size * 0.28} Q${size / 2},${size * 0.05} ${
      size * 0.88
    },${size * 0.28} L${size * 0.88},${size * 0.36} Q${size / 2},${
      size * 0.15
    } ${size * 0.12},${size * 0.36} Z" fill="${color}" />
    </g>`,
  ];
}

function glassesVariants(size: number) {
  const eyeOffsetX = size * 0.2;
  const eyeY = size * 0.3;
  const r = size * 0.08;
  return [
    // round
    `<g stroke="#000" stroke-width="${Math.max(
      1,
      size * 0.03
    )}" fill="transparent">
      <circle cx="${size / 2 - eyeOffsetX}" cy="${eyeY}" r="${r}" />
      <circle cx="${size / 2 + eyeOffsetX}" cy="${eyeY}" r="${r}" />
      <line x1="${size / 2 - eyeOffsetX + r}" y1="${eyeY}" x2="${
      size / 2 + eyeOffsetX - r
    }" y2="${eyeY}" />
    </g>`,
    // rectangle
    `<g stroke="#000" stroke-width="${Math.max(
      1,
      size * 0.028
    )}" fill="transparent">
      <rect x="${size / 2 - eyeOffsetX - r}" y="${eyeY - r}" width="${
      r * 2
    }" height="${r * 1.4}" rx="${r * 0.3}" />
      <rect x="${size / 2 + eyeOffsetX - r}" y="${eyeY - r}" width="${
      r * 2
    }" height="${r * 1.4}" rx="${r * 0.3}" />
      <line x1="${size / 2 - eyeOffsetX + r}" y1="${eyeY}" x2="${
      size / 2 + eyeOffsetX - r
    }" y2="${eyeY}" />
    </g>`,
    // monobrow-glass (cute)
    `<g stroke="#000" stroke-width="${Math.max(
      1,
      size * 0.02
    )}" fill="transparent">
      <rect x="${size * 0.18}" y="${eyeY - r}" width="${size * 0.64}" height="${
      r * 1.4
    }" rx="${r * 0.4}" />
    </g>`,
  ];
}

/* ---------- main SVG generator ---------- */

export function generateCuteAvatar(opts: AvatarOptions = {}): string {
  const {
    size = 64,
    seed,
    enableBackground = true,
    enableAccessories = true,
    enableExpressions = true,
    palette = defaultPalette,
    returnSvgString = true,
  } = opts;

  const rnd = makeRng(seed ?? Date.now());
  const gradientId = `g${Math.floor(rnd() * 1e9)}`;

  // pick palette colors
  const bgColor1 = pick(palette, rnd);
  const bgColor2 = pick(palette, rnd);
  const faceColor = pick(palette, rnd);
  const accent = pick(palette, rnd);
  const eyeColor = "#222";
  const blushColor = "#FFB6C1";

  // geometry
  const cx = size / 2;
  const cy = size / 2;
  const faceR = size * 0.36;
  const eyeOffsetX = size * 0.2;
  const eyeOffsetY = size * 0.3;
  const eyeR = size * 0.07;
  const blushR = size * 0.055;

  // expression & accessory
  const expression: Expression = enableExpressions
    ? (pick(["smile", "surprised", "closed"], rnd) as Expression)
    : "smile";
  const accessory: AccessoryKind = enableAccessories
    ? (pick(["none", "hat", "glasses", "hair", "bow"], rnd) as AccessoryKind)
    : "none";

  // background fragment
  let bgFragment = `<rect width="${size}" height="${size}" fill="${bgColor1}" />`;
  if (enableBackground) {
    if (rnd() < 0.5) {
      // solid
      bgFragment = `<rect width="${size}" height="${size}" fill="${bgColor1}" />`;
    } else {
      // gradient
      bgFragment = `
        <defs>
          <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${bgColor1}" stop-opacity="1"/>
            <stop offset="100%" stop-color="${bgColor2}" stop-opacity="1"/>
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" fill="url(#${gradientId})" />
      `;
    }
  }

  // accessory SVG
  let accessorySvg = "";
  if (accessory !== "none") {
    if (accessory === "hat") {
      const hats = hatVariants(size, accent);
      accessorySvg = pick(hats, rnd);
    } else if (accessory === "hair") {
      const hairs = hairVariants(size, "#422"); // dark hair color, could randomize
      accessorySvg = pick(hairs, rnd);
    } else if (accessory === "glasses") {
      accessorySvg = pick(glassesVariants(size), rnd);
    } else if (accessory === "bow") {
      // small bow on top-left
      accessorySvg = `<g transform="translate(${size * 0.18}, ${size * 0.18})">
        <ellipse cx="${size * 0.02}" cy="${size * 0.02}" rx="${
        size * 0.04
      }" ry="${size * 0.025}" fill="${accent}"/>
        <ellipse cx="${size * 0.06}" cy="${size * 0.02}" rx="${
        size * 0.04
      }" ry="${size * 0.025}" fill="${accent}"/>
        <circle cx="${size * 0.04}" cy="${size * 0.02}" r="${
        size * 0.012
      }" fill="#fff" opacity="0.6"/>
      </g>`;
    }
  }

  // eyes SVG per expression
  let eyesSvg = "";
  if (expression === "closed") {
    const strokeW = Math.max(1, size * 0.03);
    eyesSvg = `
      <path d="M${cx - eyeOffsetX - eyeR},${eyeOffsetY} Q ${cx - eyeOffsetX}, ${
      eyeOffsetY + eyeR
    } ${
      cx - eyeOffsetX + eyeR
    },${eyeOffsetY}" stroke="${eyeColor}" stroke-width="${strokeW}" stroke-linecap="round" fill="none"/>
      <path d="M${cx + eyeOffsetX - eyeR},${eyeOffsetY} Q ${cx + eyeOffsetX}, ${
      eyeOffsetY + eyeR
    } ${
      cx + eyeOffsetX + eyeR
    },${eyeOffsetY}" stroke="${eyeColor}" stroke-width="${strokeW}" stroke-linecap="round" fill="none"/>
    `;
  } else {
    eyesSvg = `
      <circle cx="${
        cx - eyeOffsetX
      }" cy="${eyeOffsetY}" r="${eyeR}" fill="${eyeColor}" />
      <circle cx="${
        cx + eyeOffsetX
      }" cy="${eyeOffsetY}" r="${eyeR}" fill="${eyeColor}" />
      ${
        expression === "surprised"
          ? `<circle cx="${cx - eyeOffsetX + eyeR * 0.4}" cy="${
              eyeOffsetY - eyeR * 0.4
            }" r="${Math.max(1, size * 0.01)}" fill="#fff" opacity="0.9"/>`
          : ""
      }
    `;
  }

  // mouth
  let mouthSvg = "";
  if (expression === "surprised") {
    mouthSvg = `<circle cx="${cx}" cy="${cy + size * 0.14}" r="${
      size * 0.05
    }" fill="#222"/>`;
  } else {
    const strokeW = Math.max(1, size * 0.03);
    mouthSvg = `<path d="M${cx - size * 0.15},${cy + size * 0.14} Q ${cx}, ${
      cy + size * 0.18
    } ${cx + size * 0.15},${
      cy + size * 0.14
    }" stroke="#222" stroke-width="${strokeW}" stroke-linecap="round" fill="none"/>`;
  }

  // blush
  const blushSvg = `
    <ellipse cx="${cx - size * 0.18}" cy="${
    cy + size * 0.06
  }" rx="${blushR}" ry="${blushR * 0.6}" fill="${blushColor}" opacity="0.45"/>
    <ellipse cx="${cx + size * 0.18}" cy="${
    cy + size * 0.06
  }" rx="${blushR}" ry="${blushR * 0.6}" fill="${blushColor}" opacity="0.45"/>
  `;

  // face circle (slightly inset so accessories may overlap nicely)
  const faceSvg = `<circle cx="${cx}" cy="${cy}" r="${faceR}" fill="${faceColor}" />`;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="avatar">
  ${bgFragment}
  ${faceSvg}
  ${accessorySvg}
  ${eyesSvg}
  ${blushSvg}
  ${mouthSvg}
  <!-- soft border -->
  <rect x="0" y="0" width="${size}" height="${size}" rx="${
    size * 0.12
  }" fill="none" stroke="rgba(0,0,0,0.03)"/>
</svg>`.trim();

  if (returnSvgString) return svg;
  const base64 = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}
