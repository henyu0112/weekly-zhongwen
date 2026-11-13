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

/** A wordless bomb with a lit fuse, centred at (0,0). `time` (seconds) animates the spark. */
export function drawBomb(ctx: CanvasRenderingContext2D, r: number, rot: number, time: number): void {
  ctx.save();
  ctx.rotate(Math.sin(rot * 0.8) * 0.22);

  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(r * 0.08, r * 0.14, r * 1.02, r * 1.02, 0, 0, TAU);
  ctx.fill();

  // body
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
  g.addColorStop(0, '#6b6b78');
  g.addColorStop(0.45, '#25252e');
  g.addColorStop(1, '#050508');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = r * 0.04;
  ctx.stroke();

  // warning skull
  ctx.fillStyle = '#e5e7eb';
  ctx.beginPath();
  ctx.arc(0, -r * 0.1, r * 0.34, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(-r * 0.19, r * 0.1, r * 0.38, r * 0.27, r * 0.06);
  ctx.fill();
  ctx.fillStyle = '#0b0b10';
  ctx.beginPath();
  ctx.ellipse(-r * 0.14, -r * 0.1, r * 0.09, r * 0.11, 0, 0, TAU);
  ctx.ellipse(r * 0.14, -r * 0.1, r * 0.09, r * 0.11, 0, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, r * 0.03);
  ctx.lineTo(-r * 0.05, r * 0.12);
  ctx.lineTo(r * 0.05, r * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(-r * 0.09, r * 0.2, r * 0.025, r * 0.15);
  ctx.fillRect(-r * 0.0125, r * 0.2, r * 0.025, r * 0.15);
  ctx.fillRect(r * 0.065, r * 0.2, r * 0.025, r * 0.15);

  // highlight
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.5, -r * 0.5, r * 0.18, r * 0.1, -0.7, 0, TAU);
  ctx.fill();

  // cap
  ctx.fillStyle = '#6b7280';
  ctx.beginPath();
  ctx.roundRect(-r * 0.24, -r * 1.16, r * 0.48, r * 0.3, r * 0.06);
  ctx.fill();
  ctx.fillStyle = '#9ca3af';
  ctx.fillRect(-r * 0.24, -r * 1.16, r * 0.48, r * 0.07);

  // fuse
  ctx.strokeStyle = '#d6b98a';
  ctx.lineWidth = r * 0.09;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -r * 1.14);
  ctx.quadraticCurveTo(r * 0.05, -r * 1.42, r * 0.38, -r * 1.5);
  ctx.stroke();

  // flickering spark
  const flick = 0.8 + 0.35 * Math.sin(time * 38) + 0.15 * Math.sin(time * 61);
  const sx = r * 0.38;
  const sy = -r * 1.5;
  const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 0.34 * flick);
  sg.addColorStop(0, '#ffffff');
  sg.addColorStop(0.35, '#ffe066');
  sg.addColorStop(0.7, 'rgba(255,120,20,0.7)');
  sg.addColorStop(1, 'rgba(255,80,0,0)');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(sx, sy, r * 0.34 * flick, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#ffd23f';
  ctx.lineWidth = r * 0.035;
  for (let i = 0; i < 6; i++) {
    const a = i * (TAU / 6) + time * 5;
    ctx.beginPath();
    ctx.moveTo(sx + Math.cos(a) * r * 0.16, sy + Math.sin(a) * r * 0.16);
    ctx.lineTo(sx + Math.cos(a) * r * 0.3 * flick, sy + Math.sin(a) * r * 0.3 * flick);
    ctx.stroke();
  }

  ctx.restore();
}

export const POWER_COLORS: Record<string, { base: string; light: string; dark: string }> = {
  freeze: { base: '#38bdf8', light: '#bae6fd', dark: '#0369a1' },
  shield: { base: '#3b82f6', light: '#bfdbfe', dark: '#1e3a8a' },
  hint: { base: '#22c55e', light: '#bbf7d0', dark: '#14532d' },
  double: { base: '#f59e0b', light: '#fde68a', dark: '#92400e' },
  life: { base: '#ec4899', light: '#fbcfe8', dark: '#831843' },
  defuse: { base: '#10b981', light: '#a7f3d0', dark: '#064e3b' },
};

/** A glowing powerup orb with a white symbol (no words), centred at (0,0). */
export function drawPower(ctx: CanvasRenderingContext2D, kind: string, r: number, time: number): void {
  const c = POWER_COLORS[kind] ?? POWER_COLORS.shield;
  ctx.save();

  // pulsing halo
  const pulse = 1 + 0.12 * Math.sin(time * 6);
  const halo = ctx.createRadialGradient(0, 0, r * 0.6, 0, 0, r * 1.6 * pulse);
  halo.addColorStop(0, `${c.base}cc`);
  halo.addColorStop(1, `${c.base}00`);
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.6 * pulse, 0, TAU);
  ctx.fill();

  // orb
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
  g.addColorStop(0, c.light);
  g.addColorStop(0.5, c.base);
  g.addColorStop(1, c.dark);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = r * 0.09;
  ctx.setLineDash([r * 0.28, r * 0.16]);
  ctx.lineDashOffset = -time * r * 0.6;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.93, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([]);

  // symbol
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = r * 0.12;

  switch (kind) {
    case 'freeze': {
      ctx.lineWidth = r * 0.1;
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI) / 3);
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.58);
        ctx.lineTo(0, r * 0.58);
        ctx.moveTo(-r * 0.16, -r * 0.42);
        ctx.lineTo(0, -r * 0.58);
        ctx.lineTo(r * 0.16, -r * 0.42);
        ctx.moveTo(-r * 0.16, r * 0.42);
        ctx.lineTo(0, r * 0.58);
        ctx.lineTo(r * 0.16, r * 0.42);
        ctx.stroke();
        ctx.restore();
      }
      break;
    }
    case 'shield': {
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.56);
      ctx.lineTo(r * 0.44, -r * 0.36);
      ctx.lineTo(r * 0.44, r * 0.04);
      ctx.quadraticCurveTo(r * 0.44, r * 0.4, 0, r * 0.62);
      ctx.quadraticCurveTo(-r * 0.44, r * 0.4, -r * 0.44, r * 0.04);
      ctx.lineTo(-r * 0.44, -r * 0.36);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = c.dark;
      ctx.lineWidth = r * 0.1;
      ctx.beginPath();
      ctx.moveTo(-r * 0.2, 0);
      ctx.lineTo(-r * 0.04, r * 0.17);
      ctx.lineTo(r * 0.22, -r * 0.16);
      ctx.stroke();
      break;
    }
    case 'hint': {
      ctx.lineWidth = r * 0.12;
      ctx.beginPath();
      ctx.arc(-r * 0.1, -r * 0.1, r * 0.3, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(r * 0.14, r * 0.14);
      ctx.lineTo(r * 0.5, r * 0.5);
      ctx.stroke();
      ctx.lineWidth = r * 0.06;
      ctx.beginPath();
      ctx.arc(-r * 0.1, -r * 0.1, r * 0.15, Math.PI * 1.1, Math.PI * 1.6);
      ctx.stroke();
      break;
    }
    case 'double': {
      ctx.font = `900 ${r * 0.95}px 'Segoe UI','Arial Black',sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('×2', 0, r * 0.05);
      break;
    }
    case 'life': {
      ctx.beginPath();
      ctx.moveTo(0, r * 0.52);
      ctx.bezierCurveTo(-r * 0.75, 0, -r * 0.5, -r * 0.55, 0, -r * 0.2);
      ctx.bezierCurveTo(r * 0.5, -r * 0.55, r * 0.75, 0, 0, r * 0.52);
      ctx.fill();
      break;
    }
    case 'defuse': {
      ctx.beginPath();
      ctx.arc(-r * 0.04, r * 0.1, r * 0.34, 0, TAU);
      ctx.fill();
      ctx.lineWidth = r * 0.08;
      ctx.beginPath();
      ctx.moveTo(r * 0.14, -r * 0.18);
      ctx.quadraticCurveTo(r * 0.28, -r * 0.4, r * 0.46, -r * 0.4);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = c.dark;
      ctx.lineWidth = r * 0.12;
      ctx.beginPath();
      ctx.moveTo(-r * 0.5, -r * 0.45);
      ctx.lineTo(r * 0.5, r * 0.55);
      ctx.stroke();
      break;
    }
  }
  ctx.restore();
}
