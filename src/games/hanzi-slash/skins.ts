/**
 * Cosmetic skins for Hanzi Slash (sold in the shop, see src/data/shop.ts).
 * Pure drawing functions: used by the game engine and by shop previews.
 */

const TAU = Math.PI * 2;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const FONT = `'PingFang SC','Microsoft YaHei','Noto Sans SC','Hiragino Sans GB',sans-serif`;

/** Small seeded random so a board looks the same after every resize. */
function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rnd = () => number;

function vignette(ctx: CanvasRenderingContext2D, w: number, h: number, rgb: string, alpha: number) {
  const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  v.addColorStop(0, `rgba(${rgb},0)`);
  v.addColorStop(1, `rgba(${rgb},${alpha})`);
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
}

interface PlankStyle {
  tones: string[];
  grain: string; // "r,g,b"
  grainAlpha: [number, number];
  knot: string;
  seamDark: string;
  seamLight: string;
  scars: [string, string];
  vignette: [string, number];
}

function planks(ctx: CanvasRenderingContext2D, w: number, h: number, rnd: Rnd, s: PlankStyle) {
  const plankW = clamp(w / 4, 110, 210);
  const count = Math.ceil(w / plankW);
  for (let i = 0; i < count; i++) {
    const x = i * plankW;
    ctx.fillStyle = s.tones[i % s.tones.length];
    ctx.fillRect(x, 0, plankW + 1, h);

    const shade = ctx.createLinearGradient(x, 0, x + plankW, 0);
    shade.addColorStop(0, 'rgba(255,232,185,0.16)');
    shade.addColorStop(0.5, 'rgba(0,0,0,0)');
    shade.addColorStop(1, 'rgba(40,20,5,0.18)');
    ctx.fillStyle = shade;
    ctx.fillRect(x, 0, plankW + 1, h);

    ctx.lineCap = 'round';
    for (let k = 0; k < 24; k++) {
      const gx = x + rnd() * plankW;
      const phase = rnd() * 6;
      ctx.strokeStyle = `rgba(${s.grain},${s.grainAlpha[0] + rnd() * s.grainAlpha[1]})`;
      ctx.lineWidth = 0.7 + rnd() * 1.5;
      ctx.beginPath();
      for (let y = -6; y <= h + 6; y += 18) {
        const px = gx + Math.sin(y * 0.011 + phase) * 4 + Math.sin(y * 0.037 + phase * 2) * 1.2;
        if (y === -6) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
      }
      ctx.stroke();
    }

    if (rnd() < 0.6) {
      const kx = x + plankW * (0.25 + rnd() * 0.5);
      const ky = h * (0.15 + rnd() * 0.7);
      for (let ring = 4; ring >= 1; ring--) {
        ctx.strokeStyle = `rgba(${s.knot},${0.12 + (4 - ring) * 0.05})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(kx, ky, ring * 5, ring * 9, 0, 0, TAU);
        ctx.stroke();
      }
      ctx.fillStyle = `rgba(${s.knot},0.32)`;
      ctx.beginPath();
      ctx.ellipse(kx, ky, 4, 8, 0, 0, TAU);
      ctx.fill();
    }

    if (i > 0) {
      ctx.fillStyle = s.seamDark;
      ctx.fillRect(x - 1, 0, 2, h);
      ctx.fillStyle = s.seamLight;
      ctx.fillRect(x + 1, 0, 1.2, h);
    }
  }

  for (let i = 0; i < 16; i++) {
    const sx = rnd() * w;
    const sy = rnd() * h;
    const a = rnd() * Math.PI;
    const len = 24 + rnd() * 70;
    ctx.strokeStyle = rnd() < 0.5 ? s.scars[0] : s.scars[1];
    ctx.lineWidth = 0.8 + rnd();
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(a) * len, sy + Math.sin(a) * len);
    ctx.stroke();
  }
  vignette(ctx, w, h, s.vignette[0], s.vignette[1]);
}

function bamboo(ctx: CanvasRenderingContext2D, w: number, h: number, rnd: Rnd) {
  const stripW = clamp(w / 14, 26, 46);
  const tones = ['#e4cb8c', '#dcc07c', '#e9d299', '#d6b873', '#e0c684'];
  for (let i = 0, x = 0; x < w; i++, x += stripW) {
    ctx.fillStyle = tones[i % tones.length];
    ctx.fillRect(x, 0, stripW + 1, h);
    // fibres
    for (let k = 0; k < 6; k++) {
      ctx.fillStyle = `rgba(150,110,40,${0.05 + rnd() * 0.06})`;
      ctx.fillRect(x + rnd() * stripW, 0, 0.8, h);
    }
    // nodes
    let y = rnd() * 140;
    while (y < h) {
      ctx.fillStyle = 'rgba(140,95,30,0.35)';
      ctx.fillRect(x, y, stripW, 3);
      ctx.fillStyle = 'rgba(255,245,210,0.45)';
      ctx.fillRect(x, y + 3, stripW, 1.2);
      y += 120 + rnd() * 120;
    }
    ctx.fillStyle = 'rgba(120,80,25,0.4)';
    ctx.fillRect(x, 0, 1, h);
  }
  vignette(ctx, w, h, '110,80,20', 0.3);
}

function marble(ctx: CanvasRenderingContext2D, w: number, h: number, rnd: Rnd) {
  const base = ctx.createLinearGradient(0, 0, w, h);
  base.addColorStop(0, '#f6f4f1');
  base.addColorStop(1, '#e4e1db');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 10; i++) {
    const cx = rnd() * w;
    const cy = rnd() * h;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120 + rnd() * 160);
    g.addColorStop(0, 'rgba(150,150,160,0.08)');
    g.addColorStop(1, 'rgba(150,150,160,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    let x = rnd() * w;
    let y = rnd() < 0.5 ? -10 : rnd() * h;
    const dir = rnd() * Math.PI * 0.6 + Math.PI * 0.2;
    ctx.strokeStyle = `rgba(110,110,125,${0.18 + rnd() * 0.2})`;
    ctx.lineWidth = 0.8 + rnd() * 2.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let s = 0; s < 14; s++) {
      const a = dir + (rnd() - 0.5) * 1.1;
      const len = 20 + rnd() * 40;
      const nx = x + Math.cos(a) * len;
      const ny = y + Math.sin(a) * len;
      ctx.quadraticCurveTo(x + (rnd() - 0.5) * 30, y + (rnd() - 0.5) * 30, nx, ny);
      x = nx;
      y = ny;
    }
    ctx.stroke();
  }
  const shine = ctx.createLinearGradient(0, 0, w, h);
  shine.addColorStop(0, 'rgba(255,255,255,0.3)');
  shine.addColorStop(0.5, 'rgba(255,255,255,0)');
  ctx.fillStyle = shine;
  ctx.fillRect(0, 0, w, h);
  vignette(ctx, w, h, '80,80,90', 0.2);
}

function chalkboard(ctx: CanvasRenderingContext2D, w: number, h: number, rnd: Rnd) {
  const base = ctx.createLinearGradient(0, 0, 0, h);
  base.addColorStop(0, '#2f4d3f');
  base.addColorStop(1, '#22392e');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 16; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.02 + rnd() * 0.03})`;
    ctx.beginPath();
    ctx.ellipse(rnd() * w, rnd() * h, 60 + rnd() * 160, 20 + rnd() * 60, rnd() * Math.PI, 0, TAU);
    ctx.fill();
  }
  // faint chalk writing
  const chars = ['学', '中', '文', '字', '词', '语'];
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < 7; i++) {
    ctx.save();
    ctx.translate(rnd() * w, rnd() * h);
    ctx.rotate((rnd() - 0.5) * 0.5);
    ctx.font = `700 ${50 + rnd() * 50}px ${FONT}`;
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillText(chars[Math.floor(rnd() * chars.length)], 0, 0);
    ctx.restore();
  }
  // wooden frame
  const f = 10;
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(0, 0, w, f);
  ctx.fillRect(0, h - f, w, f);
  ctx.fillRect(0, 0, f, h);
  ctx.fillRect(w - f, 0, f, h);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(f, f, w - f * 2, h - f * 2);
}

/** Paints a full cutting board for the given skin id. */
export function paintBoard(ctx: CanvasRenderingContext2D, w: number, h: number, skin: string): void {
  const rnd = seeded(7);
  switch (skin) {
    case 'board.bamboo':
      return bamboo(ctx, w, h, rnd);
    case 'board.marble':
      return marble(ctx, w, h, rnd);
    case 'board.chalk':
      return chalkboard(ctx, w, h, rnd);
    case 'board.walnut':
      return planks(ctx, w, h, rnd, {
        tones: ['#6b4426', '#5e3a20', '#744b2c', '#58361a', '#664025'],
        grain: '25,12,4',
        grainAlpha: [0.12, 0.16],
        knot: '20,8,2',
        seamDark: 'rgba(15,6,1,0.7)',
        seamLight: 'rgba(200,150,100,0.18)',
        scars: ['rgba(230,190,150,0.14)', 'rgba(15,6,1,0.25)'],
        vignette: ['20,8,2', 0.5],
      });
    default:
      return planks(ctx, w, h, rnd, {
        tones: ['#d9a768', '#cf9c5d', '#ddb073', '#c9955b', '#d4a266'],
        grain: '95,52,16',
        grainAlpha: [0.06, 0.1],
        knot: '80,42,12',
        seamDark: 'rgba(55,27,6,0.55)',
        seamLight: 'rgba(255,238,200,0.3)',
        scars: ['rgba(255,242,215,0.2)', 'rgba(70,35,8,0.2)'],
        vignette: ['60,28,6', 0.4],
      });
  }
}

export interface TrailPoint {
  x: number;
  y: number;
  /** Seconds since this point was added; points fade out at TRAIL_LIFE. */
  age: number;
}

export const TRAIL_LIFE = 0.22;

function segment(ctx: CanvasRenderingContext2D, a: TrailPoint, b: TrailPoint) {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

/** Draws the swipe trail in the given blade skin. */
export function drawTrail(ctx: CanvasRenderingContext2D, trail: TrailPoint[], skin: string, clock: number): void {
  if (trail.length < 2) return;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let i = 1; i < trail.length; i++) {
    const a = trail[i - 1];
    const b = trail[i];
    const life = clamp(1 - b.age / TRAIL_LIFE, 0, 1);

    switch (skin) {
      case 'blade.fire':
        ctx.shadowColor = 'rgba(255,90,0,0.9)';
        ctx.shadowBlur = 16;
        ctx.strokeStyle = `rgba(255,70,0,${0.6 * life})`;
        ctx.lineWidth = 8 + 12 * life;
        segment(ctx, a, b);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(255,200,60,${0.95 * life})`;
        ctx.lineWidth = 3 + 6 * life;
        segment(ctx, a, b);
        ctx.strokeStyle = `rgba(255,255,220,${life})`;
        ctx.lineWidth = 1 + 2 * life;
        segment(ctx, a, b);
        break;

      case 'blade.ice':
        ctx.shadowColor = 'rgba(120,220,255,0.95)';
        ctx.shadowBlur = 14;
        ctx.strokeStyle = `rgba(40,140,220,${0.45 * life})`;
        ctx.lineWidth = 7 + 10 * life;
        segment(ctx, a, b);
        ctx.strokeStyle = `rgba(225,250,255,${0.95 * life})`;
        ctx.lineWidth = 2 + 5 * life;
        segment(ctx, a, b);
        break;

      case 'blade.rainbow': {
        const hue = (i * 28 + clock * 240) % 360;
        ctx.shadowColor = `hsla(${hue},100%,60%,0.9)`;
        ctx.shadowBlur = 12;
        ctx.strokeStyle = `hsla(${hue},95%,58%,${life})`;
        ctx.lineWidth = 5 + 10 * life;
        segment(ctx, a, b);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(255,255,255,${0.8 * life})`;
        ctx.lineWidth = 1.5 + 2 * life;
        segment(ctx, a, b);
        break;
      }

      case 'blade.ink': {
        // calligraphy brush: thick in the middle of the stroke, no glow
        const t = i / trail.length;
        const press = Math.sin(t * Math.PI);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(15,15,22,${0.92 * life})`;
        ctx.lineWidth = 3 + 15 * life * (0.45 + 0.55 * press);
        segment(ctx, a, b);
        break;
      }

      default:
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(60,30,8,${0.4 * life})`;
        ctx.lineWidth = 6 + 9 * life;
        segment(ctx, a, b);
        ctx.strokeStyle = `rgba(255,255,255,${0.95 * life})`;
        ctx.shadowColor = 'rgba(255,255,255,0.9)';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2 + 6 * life;
        segment(ctx, a, b);
    }
  }
  ctx.restore();
}
