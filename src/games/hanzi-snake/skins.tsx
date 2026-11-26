'use client';

import { useEffect, useRef } from 'react';
import type { Cell, Dir } from './game';

/** Board themes (shop slot `snake.board`). */
export interface BoardTheme {
  a: string;
  b: string;
  grid: string;
  wall: string;
  tile: string;
  tileInk: string;
  tileEdge: string;
  /** Small decorations drawn once over the checker pattern. */
  deco?: 'grass' | 'stars' | 'paper' | 'dunes' | 'chalk';
}

export const BOARDS: Record<string, BoardTheme> = {
  'field.grass': { a: '#86d97a', b: '#7acd6e', grid: 'rgba(0,0,0,0.04)', wall: '#3f8f3a', tile: '#fffbeb', tileInk: '#1f2937', tileEdge: '#d6c9a3', deco: 'grass' },
  'field.paper': { a: '#f4ead2', b: '#efe2c4', grid: 'rgba(120,80,30,0.08)', wall: '#b91c1c', tile: '#ffffff', tileInk: '#111827', tileEdge: '#d4c4a0', deco: 'paper' },
  'field.sand': { a: '#fbe3a1', b: '#f7d98b', grid: 'rgba(146,98,20,0.08)', wall: '#c08a2e', tile: '#fffdf5', tileInk: '#422006', tileEdge: '#e2c37a', deco: 'dunes' },
  'field.chalk': { a: '#1f4a35', b: '#22503a', grid: 'rgba(255,255,255,0.05)', wall: '#8b5a2b', tile: 'rgba(255,255,255,0.12)', tileInk: '#f8fafc', tileEdge: 'rgba(255,255,255,0.55)', deco: 'chalk' },
  'field.night': { a: '#111a33', b: '#141f3b', grid: 'rgba(148,163,255,0.06)', wall: '#6366f1', tile: '#1e293b', tileInk: '#e0e7ff', tileEdge: '#818cf8', deco: 'stars' },
};

/** Snake skins (shop slot `snake.skin`). */
export interface SnakeSkin {
  /** Body colours, alternated along the snake (rainbow uses hue instead). */
  body: string[];
  head: string;
  ink: string;
  eye: string;
  pattern?: 'scales' | 'nodes' | 'ink' | 'rainbow';
}

export const SKINS: Record<string, SnakeSkin> = {
  'skin.classic': { body: ['#22c55e', '#16a34a'], head: '#15803d', ink: '#ffffff', eye: '#052e16' },
  'skin.dragon': { body: ['#dc2626', '#b91c1c'], head: '#991b1b', ink: '#fef3c7', eye: '#fde047', pattern: 'scales' },
  'skin.bamboo': { body: ['#a3d65c', '#8cc63f'], head: '#5f9a1f', ink: '#1a2e05', eye: '#1a2e05', pattern: 'nodes' },
  'skin.ink': { body: ['#1f2937', '#374151'], head: '#030712', ink: '#f9fafb', eye: '#f87171', pattern: 'ink' },
  'skin.rainbow': { body: ['#f43f5e'], head: '#7c3aed', ink: '#ffffff', eye: '#1e1b4b', pattern: 'rainbow' },
};

export const boardTheme = (id?: string) => BOARDS[id ?? ''] ?? BOARDS['field.grass'];
export const snakeSkin = (id?: string) => SKINS[id ?? ''] ?? SKINS['skin.classic'];

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Checkerboard, decorations and a wall line (solid walls only). */
export function drawBoard(
  ctx: CanvasRenderingContext2D,
  cols: number,
  rows: number,
  cell: number,
  theme: BoardTheme,
  solidWalls: boolean,
) {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.fillStyle = (x + y) % 2 ? theme.b : theme.a;
      ctx.fillRect(x * cell, y * cell, cell, cell);
    }
  }
  ctx.strokeStyle = theme.grid;
  ctx.lineWidth = 1;
  for (let i = 1; i < cols; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cell, 0);
    ctx.lineTo(i * cell, rows * cell);
    ctx.stroke();
  }
  for (let i = 1; i < rows; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * cell);
    ctx.lineTo(cols * cell, i * cell);
    ctx.stroke();
  }

  // Fixed pseudo-random decorations, so they don't flicker between frames.
  let seed = 7;
  const r = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const w = cols * cell;
  const h = rows * cell;
  ctx.save();
  if (theme.deco === 'grass') {
    ctx.strokeStyle = 'rgba(30,90,30,0.25)';
    ctx.lineWidth = Math.max(1, cell * 0.05);
    for (let i = 0; i < cols * 2; i++) {
      const x = r() * w;
      const y = r() * h;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - cell * 0.08, y - cell * 0.22);
      ctx.moveTo(x, y);
      ctx.lineTo(x + cell * 0.1, y - cell * 0.18);
      ctx.stroke();
    }
  } else if (theme.deco === 'stars') {
    for (let i = 0; i < cols * 3; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.25 + r() * 0.5})`;
      ctx.beginPath();
      ctx.arc(r() * w, r() * h, Math.max(0.6, r() * cell * 0.05), 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (theme.deco === 'paper') {
    ctx.fillStyle = 'rgba(120,80,30,0.06)';
    for (let i = 0; i < cols * 3; i++) ctx.fillRect(r() * w, r() * h, cell * 0.5 * r(), 1);
  } else if (theme.deco === 'dunes') {
    ctx.strokeStyle = 'rgba(180,120,30,0.18)';
    ctx.lineWidth = Math.max(1, cell * 0.04);
    for (let i = 0; i < rows; i += 2) {
      const y = (i + 0.7) * cell;
      ctx.beginPath();
      for (let x = 0; x <= w; x += cell / 2) ctx.lineTo(x, y + Math.sin(x / cell + i) * cell * 0.12);
      ctx.stroke();
    }
  } else if (theme.deco === 'chalk') {
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for (let i = 0; i < cols * 2; i++) ctx.fillRect(r() * w, r() * h, cell * (0.3 + r()), cell * 0.04);
  }
  ctx.restore();

  if (solidWalls) {
    ctx.strokeStyle = theme.wall;
    ctx.lineWidth = Math.max(3, cell * 0.12);
    ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth);
  }
}

/** A character waiting on the board. `glow` (0–1) highlights it as the hint. */
export function drawTile(ctx: CanvasRenderingContext2D, c: Cell, ch: string, cell: number, theme: BoardTheme, glow = 0) {
  const pad = cell * 0.08;
  const x = c.x * cell + pad;
  const y = c.y * cell + pad;
  const s = cell - pad * 2;
  ctx.save();
  if (glow > 0) {
    ctx.shadowColor = `rgba(250,204,21,${0.6 + glow * 0.4})`;
    ctx.shadowBlur = cell * (0.3 + glow * 0.4);
  } else {
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = cell * 0.12;
    ctx.shadowOffsetY = cell * 0.04;
  }
  roundRect(ctx, x, y, s, s, cell * 0.2);
  ctx.fillStyle = theme.tile;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = Math.max(1.5, cell * (glow > 0 ? 0.09 : 0.05));
  ctx.strokeStyle = glow > 0 ? '#facc15' : theme.tileEdge;
  ctx.stroke();
  ctx.fillStyle = theme.tileInk;
  ctx.font = `900 ${Math.round(cell * 0.58)}px "PingFang SC","Microsoft YaHei","Noto Sans SC",sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(ch, c.x * cell + cell / 2, c.y * cell + cell / 2 + cell * 0.03);
  ctx.restore();
}

/** Colour of body piece `i` (rainbow cycles hue along the body). */
const pieceColor = (skin: SnakeSkin, i: number) =>
  skin.pattern === 'rainbow' ? `hsl(${(i * 32) % 360} 85% 55%)` : skin.body[i % skin.body.length];

/**
 * The snake as one smooth body. `pts` are cell positions that may be
 * fractional (between two cells while moving), head first.
 */
export function drawSnake(
  ctx: CanvasRenderingContext2D,
  pts: Cell[],
  labels: (string | undefined)[],
  dir: Dir,
  cell: number,
  skin: SnakeSkin,
) {
  const n = pts.length;
  if (!n) return;
  const cx = (p: Cell) => (p.x + 0.5) * cell;
  const cy = (p: Cell) => (p.y + 0.5) * cell;
  // Pieces more than ~1.5 cells apart are on opposite sides of a wrapping wall: don't join them.
  const joined = (a: Cell, b: Cell) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) < 1.5;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. A soft shadow, then the continuous tube joining every piece.
  ctx.lineWidth = cell * 0.8;
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  for (let i = n - 1; i > 0; i--) {
    if (!joined(pts[i], pts[i - 1])) continue;
    ctx.beginPath();
    ctx.moveTo(cx(pts[i]), cy(pts[i]) + cell * 0.06);
    ctx.lineTo(cx(pts[i - 1]), cy(pts[i - 1]) + cell * 0.06);
    ctx.stroke();
  }
  ctx.lineWidth = cell * 0.76;
  for (let i = n - 1; i > 0; i--) {
    if (!joined(pts[i], pts[i - 1])) continue;
    ctx.strokeStyle = pieceColor(skin, i);
    ctx.beginPath();
    ctx.moveTo(cx(pts[i]), cy(pts[i]));
    ctx.lineTo(cx(pts[i - 1]), cy(pts[i - 1]));
    ctx.stroke();
  }

  // 2. Round body pieces (tail first), each with its pattern and character.
  for (let i = n - 1; i >= 1; i--) {
    const x = cx(pts[i]);
    const y = cy(pts[i]);
    // The tail tapers a little.
    const r = cell * (i === n - 1 && n > 2 ? 0.33 : 0.4);
    ctx.fillStyle = pieceColor(skin, i);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    if (skin.pattern === 'scales') {
      ctx.strokeStyle = 'rgba(253,224,71,0.55)';
      ctx.lineWidth = Math.max(1, cell * 0.04);
      ctx.beginPath();
      ctx.arc(x, y - r * 0.55, r * 0.75, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    } else if (skin.pattern === 'nodes') {
      ctx.strokeStyle = 'rgba(63,98,18,0.45)';
      ctx.lineWidth = Math.max(1, cell * 0.06);
      ctx.beginPath();
      ctx.arc(x, y, r * 0.92, 0, Math.PI * 2);
      ctx.stroke();
    } else if (skin.pattern === 'ink') {
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      ctx.beginPath();
      ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    const label = labels[i];
    if (label) {
      ctx.fillStyle = skin.ink;
      ctx.font = `900 ${Math.round(cell * 0.52)}px "PingFang SC","Microsoft YaHei","Noto Sans SC",sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x, y + cell * 0.03);
    }
  }

  // 3. The head on top, with eyes looking where it is going.
  const hx = cx(pts[0]);
  const hy = cy(pts[0]);
  ctx.fillStyle = skin.head;
  ctx.beginPath();
  ctx.arc(hx, hy, cell * 0.47, 0, Math.PI * 2);
  ctx.fill();
  const fx = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
  const fy = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;
  const ex0 = hx + fx * cell * 0.14;
  const ey0 = hy + fy * cell * 0.14;
  const side = cell * 0.18;
  for (const k of [-1, 1]) {
    const ex = ex0 + (fy !== 0 ? k * side : 0);
    const ey = ey0 + (fx !== 0 ? k * side : 0);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ex, ey, cell * 0.11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = skin.eye;
    ctx.beginPath();
    ctx.arc(ex + fx * cell * 0.03, ey + fy * cell * 0.03, cell * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Shop preview: a short board with a snake spelling 学习. */
export function SnakePreview({ itemId }: { itemId: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || 240;
    const h = canvas.clientHeight || 112;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const cols = 8;
    const cell = w / cols;
    const rows = Math.ceil(h / cell);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const isBoard = itemId.startsWith('field.');
    const theme = isBoard ? boardTheme(itemId) : BOARDS['field.grass'];
    const skin = isBoard ? SKINS['skin.classic'] : snakeSkin(itemId);
    drawBoard(ctx, cols, rows, cell, theme, false);
    const y = Math.floor(rows / 2) - (rows % 2 ? 0 : 1);
    drawSnake(
      ctx,
      [{ x: 5, y }, { x: 4, y }, { x: 3, y }, { x: 2, y }, { x: 1, y }],
      [undefined, '习', '学', undefined, undefined],
      'right',
      cell,
      skin,
    );
    drawTile(ctx, { x: 7, y: Math.max(0, y - 1) }, '文', cell, theme);
  }, [itemId]);
  return <canvas ref={ref} aria-hidden className="block h-full w-full" />;
}
