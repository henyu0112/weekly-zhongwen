export interface FruitKind {
  name: string;
  base: string;
  light: string;
  dark: string;
  /** Inside colour shown when sliced. */
  flesh: string;
  leaf?: string;
  stripes?: boolean;
}

export const FRUITS: FruitKind[] = [
  { name: 'apple', base: '#e53935', light: '#ff8a80', dark: '#8e1b1b', flesh: '#fff3d6', leaf: '#43a047' },
  { name: 'orange', base: '#fb8c00', light: '#ffcc80', dark: '#a85200', flesh: '#ffd54f', leaf: '#43a047' },
  { name: 'watermelon', base: '#2e7d32', light: '#7bc67e', dark: '#17491b', flesh: '#ef5350', stripes: true },
  { name: 'plum', base: '#7b1fa2', light: '#c27fd6', dark: '#430f5e', flesh: '#f3c6ff', leaf: '#388e3c' },
  { name: 'lemon', base: '#e6b800', light: '#fff59d', dark: '#9a7a00', flesh: '#fffde7' },
  { name: 'peach', base: '#e8648f', light: '#ffc2d4', dark: '#a3295a', flesh: '#ffe0b2', leaf: '#43a047' },
  { name: 'lime', base: '#6a9f2f', light: '#c5e1a5', dark: '#33581a', flesh: '#f1f8e9' },
  { name: 'blueberry', base: '#3949ab', light: '#9fa8da', dark: '#19236b', flesh: '#c5cae9' },
];

const TAU = Math.PI * 2;

/** Draws a whole fruit centred at (0,0). Caller handles translate. */
export function drawFruit(ctx: CanvasRenderingContext2D, k: FruitKind, r: number, rot: number): void {
  ctx.save();
  ctx.rotate(rot);

  // soft shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(r * 0.08, r * 0.12, r * 1.02, r * 1.02, 0, 0, TAU);
  ctx.fill();

  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
  g.addColorStop(0, k.light);
  g.addColorStop(0.55, k.base);
  g.addColorStop(1, k.dark);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();

  if (k.stripes) {
    ctx.strokeStyle = 'rgba(10,50,15,0.45)';
    ctx.lineWidth = r * 0.1;
    for (const s of [0.3, 0.62, 0.9]) {
      ctx.beginPath();
      ctx.ellipse(0, 0, r * s, r * 0.98, 0, 0, TAU);
      ctx.stroke();
    }
  }

  if (k.leaf) {
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = r * 0.07;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.92);
    ctx.lineTo(r * 0.06, -r * 1.2);
    ctx.stroke();
    ctx.fillStyle = k.leaf;
    ctx.beginPath();
    ctx.ellipse(r * 0.28, -r * 1.08, r * 0.26, r * 0.11, -0.5, 0, TAU);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.42, -r * 0.5, r * 0.2, r * 0.12, -0.7, 0, TAU);
  ctx.fill();

  ctx.restore();
}

/** Draws one half (0 = left, 1 = right) centred at (0,0). */
export function drawHalf(ctx: CanvasRenderingContext2D, k: FruitKind, r: number, rot: number, side: 0 | 1): void {
  ctx.save();
  ctx.rotate(rot);
  const a0 = side === 0 ? Math.PI / 2 : -Math.PI / 2;
  const a1 = side === 0 ? Math.PI * 1.5 : Math.PI / 2;

  ctx.fillStyle = k.base;
  ctx.beginPath();
  ctx.arc(0, 0, r, a0, a1);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = k.flesh;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.86, a0, a1);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.45, a0, a1);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
