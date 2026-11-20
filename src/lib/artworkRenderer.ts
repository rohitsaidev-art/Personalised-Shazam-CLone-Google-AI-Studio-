import { ArtworkSpec, FilterCategoryKey } from '../types/music';

/**
 * Composable Multi-Layer Editorial Sleeve Renderer
 * Combines 4 orthogonal deterministic layers per track:
 *   7 lighting substrates × 12 editorial focal motifs × 4 detail modes × 4 finishes
 *   = 1,344 structural combinations, further parameterized by per-track angles, offsets & palette.
 *
 * Bounded Decoded Memory Policy (actual uncompressed RGBA = w * h * 4 bytes):
 *   - List thumbnails (192x192): max 36 LRU entries -> 5.06 MB ceiling
 *   - Active player render (512x512): max 3 LRU entries -> 3.00 MB ceiling
 *   - Category avatars (64x64): max 48 LRU entries -> 0.75 MB ceiling
 */

export type SubstrateTopology =
  | 'off-axis-bokeh'
  | 'diagonal-duotone'
  | 'tritone-cloud'
  | 'darkroom-radial'
  | 'twilight-horizon'
  | 'warm-paper-wash'
  | 'obsidian-spotlight';

export type EditorialMotif =
  | 'swiss-arcs'
  | 'architectural-monolith'
  | 'risograph-halftone'
  | 'anamorphic-cinema'
  | 'debossed-vinyl-sleeve'
  | 'brutalist-bands'
  | 'organic-pigment-waves'
  | 'editorial-monogram'
  | 'prism-refraction'
  | 'folded-light-planes'
  | 'studio-tape-reels'
  | 'gallery-mat-frame';

export type MicroDetailMode =
  | 'full-bleed'
  | 'corner-ticks'
  | 'catalog-strip'
  | 'edge-initials';

export type SurfaceFinish =
  | 'analog-grain-soft'
  | 'analog-grain-warm'
  | 'fine-stipple'
  | 'clean-matte';

export interface ArtworkRecipe {
  seed: number;
  substrate: SubstrateTopology;
  motif: EditorialMotif;
  detail: MicroDetailMode;
  finish: SurfaceFinish;
  angleDeg: number;
  focalX: number; // 0.25..0.75
  focalY: number; // 0.22..0.72
  catalogNum: string;
  initials: string;
}

const SUBSTRATES: SubstrateTopology[] = [
  'off-axis-bokeh',
  'diagonal-duotone',
  'tritone-cloud',
  'darkroom-radial',
  'twilight-horizon',
  'warm-paper-wash',
  'obsidian-spotlight',
];

const MOTIFS: EditorialMotif[] = [
  'swiss-arcs',
  'architectural-monolith',
  'risograph-halftone',
  'anamorphic-cinema',
  'debossed-vinyl-sleeve',
  'brutalist-bands',
  'organic-pigment-waves',
  'editorial-monogram',
  'prism-refraction',
  'folded-light-planes',
  'studio-tape-reels',
  'gallery-mat-frame',
];

const DETAILS: MicroDetailMode[] = [
  'full-bleed',
  'corner-ticks',
  'catalog-strip',
  'edge-initials',
];

const FINISHES: SurfaceFinish[] = [
  'analog-grain-soft',
  'analog-grain-warm',
  'fine-stipple',
  'clean-matte',
];

export function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// Deterministic Mulberry32 PRNG
function createRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function parseHex(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.padEnd(6, '0').slice(0, 6);
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function mixHex(hexA: string, hexB: string, t: number): string {
  const [r1, g1, b1] = parseHex(hexA);
  const [r2, g2, b2] = parseHex(hexB);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

export function getArtworkRecipe(
  seedKey: string,
  artwork: ArtworkSpec,
  titleHint?: string
): ArtworkRecipe {
  const seed = hashSeed(
    `${seedKey}|${artwork.primary}|${artwork.secondary}|${artwork.accent}|${artwork.pattern}`
  );
  const rng = createRng(seed);

  const substrate = SUBSTRATES[Math.floor(rng() * SUBSTRATES.length)];
  const motif = MOTIFS[Math.floor(rng() * MOTIFS.length)];
  const detail = DETAILS[Math.floor(rng() * DETAILS.length)];
  const finish = FINISHES[Math.floor(rng() * FINISHES.length)];
  const angleDeg = Math.round((rng() * 140 - 70) * 10) / 10;
  const focalX = 0.26 + rng() * 0.48;
  const focalY = 0.24 + rng() * 0.46;
  const catalogNum = String(10 + Math.floor(rng() * 890)).padStart(3, '0');

  const rawSource = (artwork.monogram || titleHint || seedKey)
    .replace(/[^A-Za-z0-9\s]/g, ' ')
    .trim();
  const words = rawSource.split(/\s+/).filter(Boolean);
  const initials =
    words.length >= 2
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : rawSource.slice(0, 2).toUpperCase() || 'ED';

  return {
    seed,
    substrate,
    motif,
    detail,
    finish,
    angleDeg,
    focalX,
    focalY,
    catalogNum,
    initials,
  };
}

// Bounded LRU bitmap cache
class LRUCache<V> {
  private map = new Map<string, V>();
  constructor(private readonly maxEntries: number) {}

  get(key: string): V | undefined {
    const val = this.map.get(key);
    if (val === undefined) return undefined;
    this.map.delete(key);
    this.map.set(key, val);
    return val;
  }

  set(key: string, value: V): void {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.maxEntries) {
      const oldestKey = this.map.keys().next().value;
      if (oldestKey !== undefined) {
        this.map.delete(oldestKey);
      }
    }
    this.map.set(key, value);
  }

  get size(): number {
    return this.map.size;
  }
}

export const THUMB_RENDER_PX = 192;
export const HERO_RENDER_PX = 512;
export const AVATAR_RENDER_PX = 64;

export const THUMB_LRU_LIMIT = 36;
export const HERO_LRU_LIMIT = 3;
export const AVATAR_LRU_LIMIT = 48;

const thumbCache = new LRUCache<string>(THUMB_LRU_LIMIT);
const heroCache = new LRUCache<string>(HERO_LRU_LIMIT);
const avatarCache = new LRUCache<string>(AVATAR_LRU_LIMIT);

let sharedNoiseCanvas: HTMLCanvasElement | null = null;
let renderCount = 0;
let totalRenderMs = 0;

function getSharedNoiseTile(): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  if (sharedNoiseCanvas) return sharedNoiseCanvas;
  const tile = document.createElement('canvas');
  tile.width = 64;
  tile.height = 64;
  const ctx = tile.getContext('2d');
  if (!ctx) return null;

  const img = ctx.createImageData(64, 64);
  const rng = createRng(9021077);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(rng() * 255);
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 28;
  }
  ctx.putImageData(img, 0, 0);
  sharedNoiseCanvas = tile;
  return tile;
}

function drawSubstrate(
  ctx: CanvasRenderingContext2D,
  size: number,
  artwork: ArtworkSpec,
  recipe: ArtworkRecipe,
  rng: () => number
) {
  const { primary, secondary, accent } = artwork;
  const deep = mixHex(primary, '#07080C', 0.45);
  const mid = mixHex(primary, secondary, 0.55);

  if (recipe.substrate === 'diagonal-duotone') {
    const g = ctx.createLinearGradient(0, 0, size, size);
    g.addColorStop(0, deep);
    g.addColorStop(0.55, primary);
    g.addColorStop(1, secondary);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  } else if (recipe.substrate === 'twilight-horizon') {
    const g = ctx.createLinearGradient(0, 0, 0, size);
    g.addColorStop(0, deep);
    g.addColorStop(0.52, secondary);
    g.addColorStop(0.76, mixHex(secondary, accent, 0.35));
    g.addColorStop(1, mixHex(primary, '#050608', 0.65));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  } else if (recipe.substrate === 'warm-paper-wash') {
    const g = ctx.createLinearGradient(0, size * 0.1, size, size * 0.9);
    g.addColorStop(0, mixHex(primary, '#161412', 0.3));
    g.addColorStop(0.5, mid);
    g.addColorStop(1, mixHex(secondary, '#121014', 0.35));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  } else if (recipe.substrate === 'obsidian-spotlight') {
    ctx.fillStyle = mixHex(primary, '#05060A', 0.72);
    ctx.fillRect(0, 0, size, size);
    const rg = ctx.createRadialGradient(
      size * recipe.focalX,
      size * recipe.focalY,
      size * 0.04,
      size * recipe.focalX,
      size * recipe.focalY,
      size * 0.78
    );
    rg.addColorStop(0, rgba(secondary, 0.85));
    rg.addColorStop(0.5, rgba(primary, 0.45));
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, size, size);
  } else if (recipe.substrate === 'tritone-cloud') {
    ctx.fillStyle = deep;
    ctx.fillRect(0, 0, size, size);
    const blobs: Array<[number, number, number, string, number]> = [
      [0.2 + rng() * 0.25, 0.25 + rng() * 0.2, 0.65, secondary, 0.72],
      [0.65 + rng() * 0.2, 0.35 + rng() * 0.3, 0.6, accent, 0.38],
      [0.4 + rng() * 0.3, 0.75 + rng() * 0.15, 0.65, primary, 0.78],
    ];
    for (const [bx, by, br, col, op] of blobs) {
      const rg = ctx.createRadialGradient(
        size * bx,
        size * by,
        0,
        size * bx,
        size * by,
        size * br
      );
      rg.addColorStop(0, rgba(col, op));
      rg.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, size, size);
    }
  } else if (recipe.substrate === 'darkroom-radial') {
    const rg = ctx.createRadialGradient(
      size * 0.5,
      size * 0.42,
      size * 0.05,
      size * 0.5,
      size * 0.5,
      size * 0.82
    );
    rg.addColorStop(0, mixHex(secondary, accent, 0.22));
    rg.addColorStop(0.48, primary);
    rg.addColorStop(1, '#07080B');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, size, size);
  } else {
    // off-axis-bokeh
    const g = ctx.createLinearGradient(0, 0, size * 0.85, size);
    g.addColorStop(0, deep);
    g.addColorStop(1, mid);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 4; i++) {
      const bx = rng() * size;
      const by = rng() * size;
      const br = size * (0.22 + rng() * 0.34);
      const col = i % 2 === 0 ? accent : secondary;
      const rg = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      rg.addColorStop(0, rgba(col, 0.42));
      rg.addColorStop(0.6, rgba(col, 0.12));
      rg.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, size, size);
    }
  }
}

function drawMotif(
  ctx: CanvasRenderingContext2D,
  size: number,
  artwork: ArtworkSpec,
  recipe: ArtworkRecipe,
  rng: () => number
) {
  const { primary, secondary, accent } = artwork;
  ctx.save();

  switch (recipe.motif) {
    case 'swiss-arcs': {
      const cx = size * (0.3 + rng() * 0.4);
      const cy = size * (0.3 + rng() * 0.4);
      const r1 = size * (0.28 + rng() * 0.16);
      ctx.fillStyle = rgba(accent, 0.22);
      ctx.beginPath();
      ctx.arc(cx, cy, r1, -Math.PI * 0.75, Math.PI * 0.35);
      ctx.lineTo(cx, cy);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = rgba(accent, 0.65);
      ctx.lineWidth = Math.max(1.2, size * 0.012);
      ctx.beginPath();
      ctx.arc(size - cx * 0.7, size - cy * 0.65, r1 * 0.85, 0, Math.PI * 1.4);
      ctx.stroke();

      ctx.fillStyle = rgba('#FFFFFF', 0.12);
      ctx.fillRect(size * 0.12, size * 0.72, size * 0.56, Math.max(1, size * 0.008));
      break;
    }

    case 'architectural-monolith': {
      const cols = 3 + Math.floor(rng() * 3);
      const startX = size * (0.14 + rng() * 0.12);
      const colW = (size * 0.62) / cols;
      for (let i = 0; i < cols; i++) {
        const h = size * (0.38 + rng() * 0.42);
        const y = size - h - size * 0.08;
        const g = ctx.createLinearGradient(0, y, 0, size);
        g.addColorStop(0, rgba(i % 2 === 0 ? accent : secondary, 0.58));
        g.addColorStop(1, rgba('#06070A', 0.82));
        ctx.fillStyle = g;
        ctx.fillRect(startX + i * (colW + size * 0.025), y, colW * 0.86, h);
      }
      ctx.strokeStyle = rgba('#FFFFFF', 0.18);
      ctx.lineWidth = Math.max(1, size * 0.006);
      ctx.beginPath();
      ctx.moveTo(size * 0.1, size * 0.92);
      ctx.lineTo(size * 0.9, size * 0.92);
      ctx.stroke();
      break;
    }

    case 'risograph-halftone': {
      const step = Math.max(7, Math.round(size * 0.058));
      const cx = size * recipe.focalX;
      const cy = size * recipe.focalY;
      const maxD = size * 0.62;
      for (let y = step * 0.6; y < size; y += step) {
        for (let x = step * 0.6; x < size; x += step) {
          const d = Math.hypot(x - cx, y - cy);
          const ratio = Math.max(0, 1 - d / maxD);
          if (ratio > 0.08) {
            const rad = ratio * step * 0.42;
            ctx.fillStyle = rgba(accent, 0.14 + ratio * 0.52);
            ctx.beginPath();
            ctx.arc(x, y, rad, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      // Overprint offset block
      ctx.fillStyle = rgba(secondary, 0.28);
      ctx.fillRect(size * 0.14, size * 0.64, size * 0.44, size * 0.18);
      break;
    }

    case 'anamorphic-cinema': {
      const barH = size * 0.13;
      const yFlare = size * (0.42 + rng() * 0.18);
      const flare = ctx.createLinearGradient(0, yFlare, size, yFlare);
      flare.addColorStop(0, 'rgba(255,255,255,0)');
      flare.addColorStop(0.35, rgba(accent, 0.55));
      flare.addColorStop(0.5, 'rgba(255,255,255,0.85)');
      flare.addColorStop(0.65, rgba(accent, 0.45));
      flare.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = flare;
      ctx.fillRect(0, yFlare - size * 0.012, size, size * 0.024);

      const orb = ctx.createRadialGradient(
        size * 0.5,
        yFlare,
        0,
        size * 0.5,
        yFlare,
        size * 0.34
      );
      orb.addColorStop(0, rgba(accent, 0.42));
      orb.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = orb;
      ctx.fillRect(0, 0, size, size);

      ctx.fillStyle = 'rgba(5, 6, 9, 0.88)';
      ctx.fillRect(0, 0, size, barH);
      ctx.fillRect(0, size - barH, size, barH);
      break;
    }

    case 'debossed-vinyl-sleeve': {
      const cx = size * (0.46 + (rng() - 0.5) * 0.18);
      const cy = size * 0.5;
      const outerR = size * 0.36;
      const shadowGrad = ctx.createLinearGradient(cx - outerR, cy - outerR, cx + outerR, cy + outerR);
      shadowGrad.addColorStop(0, rgba('#000000', 0.42));
      shadowGrad.addColorStop(0.5, rgba(primary, 0.25));
      shadowGrad.addColorStop(1, rgba('#FFFFFF', 0.16));
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 6; i++) {
        ctx.strokeStyle = rgba(accent, 0.12 + i * 0.05);
        ctx.lineWidth = Math.max(0.8, size * 0.005);
        ctx.beginPath();
        ctx.arc(cx, cy, outerR * (0.34 + i * 0.1), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = rgba(accent, 0.72);
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.055, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'brutalist-bands': {
      ctx.translate(size * 0.5, size * 0.5);
      ctx.rotate(((recipe.angleDeg * 0.35) * Math.PI) / 180);
      const count = 4 + Math.floor(rng() * 3);
      for (let i = 0; i < count; i++) {
        const y = -size * 0.42 + i * (size * 0.15);
        const h = size * (0.045 + rng() * 0.055);
        ctx.fillStyle =
          i % 2 === 0 ? rgba(accent, 0.22 + rng() * 0.28) : rgba('#08090C', 0.42);
        ctx.fillRect(-size * 0.75, y, size * 1.5, h);
      }
      break;
    }

    case 'organic-pigment-waves': {
      for (let layer = 0; layer < 4; layer++) {
        const baseY = size * (0.38 + layer * 0.15);
        const amp = size * (0.06 + rng() * 0.07);
        const phase = rng() * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, size);
        for (let x = 0; x <= size; x += Math.max(4, size / 24)) {
          const y = baseY + Math.sin((x / size) * Math.PI * 2.2 + phase) * amp;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(size, size);
        ctx.closePath();
        const col = layer === 0 ? accent : layer % 2 === 1 ? secondary : primary;
        ctx.fillStyle = rgba(col, 0.28 + layer * 0.14);
        ctx.fill();
      }
      break;
    }

    case 'editorial-monogram': {
      ctx.strokeStyle = rgba(accent, 0.36);
      ctx.lineWidth = Math.max(1, size * 0.008);
      ctx.strokeRect(size * 0.12, size * 0.12, size * 0.76, size * 0.76);

      ctx.fillStyle = rgba('#FFFFFF', 0.14);
      ctx.font = `700 ${Math.round(size * 0.48)}px -apple-system, BlinkMacSystemFont, "SF Pro Display", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(recipe.initials, size * 0.5, size * 0.54);

      ctx.fillStyle = rgba(accent, 0.85);
      ctx.fillRect(size * 0.18, size * 0.77, size * 0.24, Math.max(1.5, size * 0.012));
      break;
    }

    case 'prism-refraction': {
      ctx.beginPath();
      ctx.moveTo(size * 0.5, size * 0.16);
      ctx.lineTo(size * 0.84, size * 0.8);
      ctx.lineTo(size * 0.16, size * 0.8);
      ctx.closePath();
      const pg = ctx.createLinearGradient(size * 0.2, size * 0.2, size * 0.8, size * 0.8);
      pg.addColorStop(0, rgba('#FFFFFF', 0.24));
      pg.addColorStop(0.5, rgba(accent, 0.34));
      pg.addColorStop(1, rgba('#08090C', 0.55));
      ctx.fillStyle = pg;
      ctx.fill();
      ctx.strokeStyle = rgba('#FFFFFF', 0.32);
      ctx.lineWidth = Math.max(1, size * 0.008);
      ctx.stroke();

      // Refracted beam
      const beam = ctx.createLinearGradient(0, size * 0.56, size, size * 0.36);
      beam.addColorStop(0, rgba('#FFFFFF', 0.55));
      beam.addColorStop(0.5, rgba(accent, 0.72));
      beam.addColorStop(1, rgba(secondary, 0.25));
      ctx.strokeStyle = beam;
      ctx.lineWidth = Math.max(1.5, size * 0.016);
      ctx.beginPath();
      ctx.moveTo(0, size * 0.6);
      ctx.lineTo(size * 0.47, size * 0.49);
      ctx.lineTo(size, size * 0.35);
      ctx.stroke();
      break;
    }

    case 'folded-light-planes': {
      const splitX = size * (0.35 + rng() * 0.3);
      const splitY = size * (0.35 + rng() * 0.3);
      const planes: Array<[number[], string]> = [
        [[0, 0, splitX, 0, splitX, splitY, 0, splitY], rgba('#FFFFFF', 0.1)],
        [[splitX, 0, size, 0, size, splitY, splitX, splitY], rgba(accent, 0.24)],
        [[0, splitY, splitX, splitY, splitX, size, 0, size], rgba('#000000', 0.34)],
        [[splitX, splitY, size, splitY, size, size, splitX, size], rgba(secondary, 0.3)],
      ];
      for (const [pts, fill] of planes) {
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.moveTo(pts[0], pts[1]);
        ctx.lineTo(pts[2], pts[3]);
        ctx.lineTo(pts[4], pts[5]);
        ctx.lineTo(pts[6], pts[7]);
        ctx.closePath();
        ctx.fill();
      }
      ctx.strokeStyle = rgba('#FFFFFF', 0.16);
      ctx.lineWidth = Math.max(1, size * 0.006);
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, size);
      ctx.moveTo(0, splitY);
      ctx.lineTo(size, splitY);
      ctx.stroke();
      break;
    }

    case 'studio-tape-reels': {
      const r = size * 0.18;
      const y = size * 0.5;
      for (const cx of [size * 0.31, size * 0.69]) {
        ctx.fillStyle = rgba('#090A0E', 0.58);
        ctx.beginPath();
        ctx.arc(cx, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = rgba(accent, 0.55);
        ctx.lineWidth = Math.max(1, size * 0.009);
        ctx.stroke();

        ctx.fillStyle = rgba(accent, 0.72);
        ctx.beginPath();
        ctx.arc(cx, y, r * 0.28, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = rgba('#FFFFFF', 0.28);
      ctx.lineWidth = Math.max(1, size * 0.007);
      ctx.beginPath();
      ctx.moveTo(size * 0.31, y + r);
      ctx.lineTo(size * 0.69, y + r);
      ctx.stroke();
      break;
    }

    case 'gallery-mat-frame': {
      const pad = size * 0.15;
      ctx.fillStyle = rgba('#090A0D', 0.54);
      ctx.fillRect(0, 0, size, pad);
      ctx.fillRect(0, size - pad, size, pad);
      ctx.fillRect(0, pad, pad, size - pad * 2);
      ctx.fillRect(size - pad, pad, pad, size - pad * 2);

      const inner = ctx.createLinearGradient(pad, pad, size - pad, size - pad);
      inner.addColorStop(0, rgba(accent, 0.65));
      inner.addColorStop(0.55, rgba(secondary, 0.52));
      inner.addColorStop(1, rgba(primary, 0.85));
      ctx.fillStyle = inner;
      ctx.fillRect(pad, pad, size - pad * 2, size - pad * 2);

      ctx.strokeStyle = rgba('#FFFFFF', 0.24);
      ctx.lineWidth = Math.max(1, size * 0.007);
      ctx.strokeRect(pad, pad, size - pad * 2, size - pad * 2);
      break;
    }
  }

  ctx.restore();
}

function drawMicroDetail(
  ctx: CanvasRenderingContext2D,
  size: number,
  artwork: ArtworkSpec,
  recipe: ArtworkRecipe
) {
  if (recipe.detail === 'full-bleed') return;
  ctx.save();

  if (recipe.detail === 'corner-ticks') {
    const m = size * 0.08;
    const len = size * 0.07;
    ctx.strokeStyle = rgba('#FFFFFF', 0.35);
    ctx.lineWidth = Math.max(1, size * 0.007);
    ctx.beginPath();
    ctx.moveTo(m, m + len);
    ctx.lineTo(m, m);
    ctx.lineTo(m + len, m);
    ctx.moveTo(size - m - len, size - m);
    ctx.lineTo(size - m, size - m);
    ctx.lineTo(size - m, size - m - len);
    ctx.stroke();
  } else if (recipe.detail === 'catalog-strip' && size >= 160) {
    ctx.fillStyle = rgba('#FFFFFF', 0.55);
    ctx.font = `600 ${Math.max(8, Math.round(size * 0.044))}px -apple-system, BlinkMacSystemFont, monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`ED.${recipe.catalogNum}`, size * 0.09, size * 0.92);
  } else if (recipe.detail === 'edge-initials' && size >= 160) {
    ctx.fillStyle = rgba(artwork.accent, 0.78);
    ctx.font = `700 ${Math.max(9, Math.round(size * 0.056))}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(recipe.initials, size * 0.91, size * 0.085);
  }

  ctx.restore();
}

function drawSurfaceFinish(
  ctx: CanvasRenderingContext2D,
  size: number,
  recipe: ArtworkRecipe
) {
  // Subtle radial vignette for photographic depth
  const vig = ctx.createRadialGradient(
    size * 0.5,
    size * 0.45,
    size * 0.25,
    size * 0.5,
    size * 0.5,
    size * 0.78
  );
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.42)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, size, size);

  // Subtle top-left directional specular sheen
  const sheen = ctx.createLinearGradient(0, 0, size * 0.65, size * 0.65);
  sheen.addColorStop(0, 'rgba(255,255,255,0.10)');
  sheen.addColorStop(0.4, 'rgba(255,255,255,0.01)');
  sheen.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, size, size);

  // Shared precomputed monochrome analog grain (zero per-card SVG filter cost)
  if (recipe.finish !== 'clean-matte') {
    const noise = getSharedNoiseTile();
    if (noise) {
      const pattern = ctx.createPattern(noise, 'repeat');
      if (pattern) {
        ctx.save();
        ctx.globalAlpha =
          recipe.finish === 'analog-grain-warm'
            ? 0.48
            : recipe.finish === 'fine-stipple'
            ? 0.34
            : 0.42;
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, size, size);
        ctx.restore();
      }
    }
  }
}

export function renderEditorialCoverDataUrl(
  seedKey: string,
  artwork: ArtworkSpec,
  renderSize: number,
  titleHint?: string
): string | null {
  if (typeof document === 'undefined') return null;

  const isHero = renderSize > THUMB_RENDER_PX;
  const targetPx = isHero ? HERO_RENDER_PX : THUMB_RENDER_PX;
  const cache = isHero ? heroCache : thumbCache;
  const cacheKey = `${seedKey}:${artwork.primary}:${artwork.secondary}:${artwork.accent}:${artwork.pattern}:${targetPx}`;

  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const start = typeof performance !== 'undefined' ? performance.now() : 0;
  const canvas = document.createElement('canvas');
  canvas.width = targetPx;
  canvas.height = targetPx;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const recipe = getArtworkRecipe(seedKey, artwork, titleHint);
  const rng = createRng(recipe.seed ^ 0x9e3779b9);

  drawSubstrate(ctx, targetPx, artwork, recipe, rng);
  drawMotif(ctx, targetPx, artwork, recipe, rng);
  drawMicroDetail(ctx, targetPx, artwork, recipe);
  drawSurfaceFinish(ctx, targetPx, recipe);

  const dataUrl = canvas.toDataURL('image/webp', 0.86);
  cache.set(cacheKey, dataUrl);

  if (typeof performance !== 'undefined') {
    totalRenderMs += performance.now() - start;
    renderCount += 1;
  }

  return dataUrl;
}

const CATEGORY_PALETTES: Record<FilterCategoryKey, Array<[string, string, string]>> = {
  artists: [
    ['#1F2A3C', '#56789E', '#DFECFA'],
    ['#3D1D3A', '#9A3F8E', '#F7D0F0'],
    ['#1A3430', '#2E8F82', '#D2F2EC'],
    ['#471E12', '#C96B28', '#FCE6C2'],
    ['#33192B', '#B82652', '#FFD1DD'],
    ['#202138', '#6854B5', '#DCD6F7'],
  ],
  genres: [
    ['#162238', '#3066BE', '#B8D4FF'],
    ['#2B142C', '#9E2A5C', '#F8C8DC'],
    ['#142923', '#2A9D8F', '#C7F2E8'],
    ['#362010', '#D97706', '#FDE68A'],
    ['#241C3A', '#7C3AED', '#DDD6FE'],
    ['#2B1A1A', '#DC2626', '#FECACA'],
  ],
  cities: [
    ['#0F1D32', '#3B6EA5', '#F4C983'],
    ['#1C1B33', '#6D4C8A', '#F2B8A0'],
    ['#10262A', '#2B7A78', '#E0F2E9'],
    ['#2A1721', '#A44A64', '#F8D49D'],
  ],
  moods: [
    ['#122338', '#3A86FF', '#BDE0FE'],
    ['#381525', '#F72585', '#FFCCD5'],
    ['#152B26', '#06D6A0', '#D8F3DC'],
    ['#3A1F0D', '#FB8500', '#FFE5B4'],
    ['#1E1B3A', '#7209B7', '#E0C3FC'],
  ],
  decades: [
    ['#2B1C12', '#B56B35', '#F5DFC2'],
    ['#1C1436', '#7B2CBF', '#F72585'],
    ['#162426', '#2D6A6A', '#D9ED92'],
    ['#192030', '#4A6FA5', '#DBEAFE'],
    ['#261829', '#A44A86', '#FBCFE8'],
    ['#141824', '#3B82F6', '#E0F2FE'],
  ],
};

export function renderCategoryAvatarDataUrl(
  category: FilterCategoryKey,
  label: string
): string | null {
  if (typeof document === 'undefined') return null;

  const key = `${category}:${label}`;
  const cached = avatarCache.get(key);
  if (cached) return cached;

  const size = AVATAR_RENDER_PX;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const seed = hashSeed(key);
  const rng = createRng(seed);
  const palettes = CATEGORY_PALETTES[category];
  const [c1, c2, c3] = palettes[seed % palettes.length];

  // Rich chromatic base field
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, c1);
  bg.addColorStop(1, c2);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  if (category === 'moods') {
    // Expressive multi-point chromatic aura (no clipart sun/waves)
    const g1 = ctx.createRadialGradient(
      size * (0.28 + rng() * 0.4),
      size * (0.25 + rng() * 0.3),
      0,
      size * 0.5,
      size * 0.5,
      size * 0.65
    );
    g1.addColorStop(0, rgba(c3, 0.85));
    g1.addColorStop(0.55, rgba(c2, 0.35));
    g1.addColorStop(1, rgba(c1, 0));
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, size, size);
  } else if (category === 'cities') {
    // Dusk atmospheric horizon + unique seeded architectural skyline
    const sky = ctx.createLinearGradient(0, 0, 0, size);
    sky.addColorStop(0, c1);
    sky.addColorStop(0.58, c2);
    sky.addColorStop(0.74, rgba(c3, 0.65));
    sky.addColorStop(1, '#090B10');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = 'rgba(10, 12, 18, 0.82)';
    const bars = 5;
    const bw = size / bars;
    for (let i = 0; i < bars; i++) {
      const bh = size * (0.2 + rng() * 0.34);
      ctx.fillRect(i * bw + 1, size - bh, bw - 2, bh);
    }
  } else if (category === 'genres') {
    // Sonic color-field with subtle orbital resonance rings
    const g = ctx.createRadialGradient(
      size * 0.35,
      size * 0.32,
      2,
      size * 0.5,
      size * 0.5,
      size * 0.68
    );
    g.addColorStop(0, rgba(c3, 0.65));
    g.addColorStop(1, rgba(c1, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = rgba('#FFFFFF', 0.42);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(size * 0.5, size * 0.5, size * 0.3, 0, Math.PI * 1.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(size * 0.5, size * 0.5, size * 0.16, Math.PI * 0.3, Math.PI * 2);
    ctx.stroke();
  } else if (category === 'decades') {
    // Matte vinyl pressing disc + crisp era stamp
    ctx.fillStyle = 'rgba(10, 11, 15, 0.52)';
    ctx.beginPath();
    ctx.arc(size * 0.5, size * 0.5, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = rgba(c3, 0.55);
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label.replace("'", ''), size * 0.5, size * 0.52);
  } else {
    // Fallback artist tonal monogram if no track cover supplied
    const initials = label
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('');
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, size * 0.5, size * 0.52);
  }

  // Soft vignette
  const vig = ctx.createRadialGradient(
    size * 0.5,
    size * 0.5,
    size * 0.25,
    size * 0.5,
    size * 0.5,
    size * 0.65
  );
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.34)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, size, size);

  const dataUrl = canvas.toDataURL('image/webp', 0.85);
  avatarCache.set(key, dataUrl);
  return dataUrl;
}

export function getDecodedMemoryStats() {
  const thumbBytes = thumbCache.size * THUMB_RENDER_PX * THUMB_RENDER_PX * 4;
  const heroBytes = heroCache.size * HERO_RENDER_PX * HERO_RENDER_PX * 4;
  const avatarBytes = avatarCache.size * AVATAR_RENDER_PX * AVATAR_RENDER_PX * 4;
  return {
    thumbEntries: thumbCache.size,
    heroEntries: heroCache.size,
    avatarEntries: avatarCache.size,
    decodedBytes: thumbBytes + heroBytes + avatarBytes,
    avgRenderMs: renderCount > 0 ? totalRenderMs / renderCount : 0,
  };
}
