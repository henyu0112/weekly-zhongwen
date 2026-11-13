import { beep } from '@/lib/sound';
import { drawBomb, drawFruit, drawHalf, drawPower, FRUITS, POWER_COLORS, type FruitKind } from './fruit';
import type { Round, RoundItem } from './rules';
import { FREEZE_SPEED, type PowerKind, type Session, type Snapshot } from './session';

const POWER_LABEL: Record<PowerKind, string> = {
  freeze: '冰冻！',
  shield: '护盾！',
  hint: '提示镜！',
  double: '双倍分！',
  life: '+1 生命',
  defuse: '拆弹！',
};

const FONT = `'PingFang SC','Microsoft YaHei','Noto Sans SC','Hiragino Sans GB',sans-serif`;
const TAU = Math.PI * 2;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const pickOne = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

/** Small seeded random so the wood grain looks the same after every resize. */
function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface EngineCallbacks {
  onState(s: Snapshot): void;
  /** A new round starts: show the rule banner. */
  onRound(info: { n: number; title: string; sub: string }): void;
  /** The banner is over and fruits start flying. */
  onRoundGo(): void;
  /** `tone: 'info'` is a neutral notice (e.g. a shield blocked a mistake). */
  onFeedback(f: { ok: boolean; text: string; tone?: 'info' }): void;
  onAnswer(correct: boolean): void;
  onGameOver(): void;
}

export interface EngineOptions {
  inputMode: 'swipe' | 'tap';
  showPinyin: boolean;
  sound: boolean;
}

interface Fruit {
  /** null for a real bomb or a powerup. */
  item: RoundItem | null;
  bomb: boolean;
  /** Set when this flying object is a powerup orb. */
  power?: PowerKind;
  kind: FruitKind;
  x0: number;
  y0: number;
  dx: number;
  vy0: number;
  g: number;
  T: number;
  t: number;
  r: number;
  rot: number;
  spin: number;
  x: number;
  y: number;
  done: boolean;
}

interface Half {
  kind: FruitKind;
  side: 0 | 1;
  x: number;
  y: number;
  vx: number;
  vy: number;
  g: number;
  rot: number;
  spin: number;
  r: number;
  life: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  g: number;
  grow: number;
  life: number;
  max: number;
  color: string;
  size: number;
  /** 'smoke' particles are drawn soft and translucent. */
  smoke?: boolean;
}

interface Floater {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

interface Blast {
  x: number;
  y: number;
  r: number;
  t: number;
}

type State = 'banner' | 'spawning' | 'clearing' | 'over';

const BLAST_TIME = 0.6;

function distToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : clamp(((px - ax) * dx + (py - ay) * dy) / len2, 0, 1);
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

export class SlashEngine {
  private ctx: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private r = 48;

  // static layers, pre-rendered
  private board: HTMLCanvasElement | null = null;
  private stain: HTMLCanvasElement | null = null;
  private stainCtx: CanvasRenderingContext2D | null = null;

  private fruits: Fruit[] = [];
  private halves: Half[] = [];
  private particles: Particle[] = [];
  private floaters: Floater[] = [];
  private blasts: Blast[] = [];
  private trail: { x: number; y: number; age: number }[] = [];

  private state: State = 'banner';
  /** Launch queue: a fruit, null (a real bomb), or a powerup kind. */
  private queue: (RoundItem | null | PowerKind)[] = [];
  private bannerT = 0;
  private spawnTimer = 0;
  private overT = 0;
  private overSent = false;
  private shake = 0;
  private shakeMax = 0.3;
  private flash = 0;
  private flashColor = '255,40,40';
  private clock = 0;
  private kindBag: FruitKind[] = [];

  private pointerDown = false;
  private lastPt: { x: number; y: number } | null = null;

  paused = false;
  private raf = 0;
  private lastTime = 0;
  private ro: ResizeObserver;
  private destroyed = false;

  constructor(
    private canvas: HTMLCanvasElement,
    private session: Session,
    private opts: EngineOptions,
    private cb: EngineCallbacks,
  ) {
    this.ctx = canvas.getContext('2d')!;
    this.ro = new ResizeObserver(() => this.resize());
  }

  start(): void {
    this.resize();
    this.ro.observe(this.canvas.parentElement ?? this.canvas);
    this.canvas.style.touchAction = 'none';
    this.canvas.addEventListener('pointerdown', this.onDown);
    this.canvas.addEventListener('pointermove', this.onMove);
    this.canvas.addEventListener('pointerup', this.onUp);
    this.canvas.addEventListener('pointercancel', this.onUp);
    this.canvas.addEventListener('contextmenu', this.prevent);
    this.beginRound();
    this.lastTime = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  destroy(): void {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.canvas.removeEventListener('pointerdown', this.onDown);
    this.canvas.removeEventListener('pointermove', this.onMove);
    this.canvas.removeEventListener('pointerup', this.onUp);
    this.canvas.removeEventListener('pointercancel', this.onUp);
    this.canvas.removeEventListener('contextmenu', this.prevent);
  }

  private prevent = (e: Event) => e.preventDefault();

  // ---------- layout ----------
  private resize() {
    const parent = this.canvas.parentElement ?? this.canvas;
    const rect = parent.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.w = Math.max(200, rect.width);
    this.h = Math.max(200, rect.height);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.canvas.style.width = `${this.w}px`;
    this.canvas.style.height = `${this.h}px`;
    this.r = clamp(Math.min(this.w, this.h * 0.85) * 0.13, 40, 66);
    this.buildLayers();
  }

  private newLayer(): [HTMLCanvasElement, CanvasRenderingContext2D] {
    const c = document.createElement('canvas');
    c.width = this.canvas.width;
    c.height = this.canvas.height;
    const x = c.getContext('2d')!;
    x.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    return [c, x];
  }

  private buildLayers() {
    const [board, bctx] = this.newLayer();
    this.paintBoard(bctx, this.w, this.h);
    this.board = board;

    const old = this.stain;
    const [stain, sctx] = this.newLayer();
    if (old) sctx.drawImage(old, 0, 0, this.w, this.h); // keep existing stains across a resize
    this.stain = stain;
    this.stainCtx = sctx;
  }

  /** A wooden cutting board: planks, grain, knots, seams, knife scars. */
  private paintBoard(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const rnd = seeded(7);
    const plankW = clamp(w / 4, 110, 210);
    const count = Math.ceil(w / plankW);
    const tones = ['#d9a768', '#cf9c5d', '#ddb073', '#c9955b', '#d4a266'];

    for (let i = 0; i < count; i++) {
      const x = i * plankW;
      ctx.fillStyle = tones[i % tones.length];
      ctx.fillRect(x, 0, plankW + 1, h);

      const shade = ctx.createLinearGradient(x, 0, x + plankW, 0);
      shade.addColorStop(0, 'rgba(255,232,185,0.2)');
      shade.addColorStop(0.5, 'rgba(0,0,0,0)');
      shade.addColorStop(1, 'rgba(70,35,8,0.18)');
      ctx.fillStyle = shade;
      ctx.fillRect(x, 0, plankW + 1, h);

      // grain lines
      ctx.lineCap = 'round';
      for (let k = 0; k < 24; k++) {
        const gx = x + rnd() * plankW;
        const phase = rnd() * 6;
        ctx.strokeStyle = `rgba(95,52,16,${0.06 + rnd() * 0.1})`;
        ctx.lineWidth = 0.7 + rnd() * 1.5;
        ctx.beginPath();
        for (let y = -6; y <= h + 6; y += 18) {
          const px = gx + Math.sin(y * 0.011 + phase) * 4 + Math.sin(y * 0.037 + phase * 2) * 1.2;
          if (y === -6) ctx.moveTo(px, y);
          else ctx.lineTo(px, y);
        }
        ctx.stroke();
      }

      // a knot in some planks
      if (rnd() < 0.6) {
        const kx = x + plankW * (0.25 + rnd() * 0.5);
        const ky = h * (0.15 + rnd() * 0.7);
        for (let ring = 4; ring >= 1; ring--) {
          ctx.strokeStyle = `rgba(80,42,12,${0.12 + (4 - ring) * 0.05})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.ellipse(kx, ky, ring * 5, ring * 9, 0, 0, TAU);
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(70,35,10,0.32)';
        ctx.beginPath();
        ctx.ellipse(kx, ky, 4, 8, 0, 0, TAU);
        ctx.fill();
      }

      // seam between planks
      if (i > 0) {
        ctx.fillStyle = 'rgba(55,27,6,0.55)';
        ctx.fillRect(x - 1, 0, 2, h);
        ctx.fillStyle = 'rgba(255,238,200,0.3)';
        ctx.fillRect(x + 1, 0, 1.2, h);
      }
    }

    // knife scars
    for (let i = 0; i < 16; i++) {
      const sx = rnd() * w;
      const sy = rnd() * h;
      const a = rnd() * Math.PI;
      const len = 24 + rnd() * 70;
      ctx.strokeStyle = rnd() < 0.5 ? 'rgba(255,242,215,0.2)' : 'rgba(70,35,8,0.2)';
      ctx.lineWidth = 0.8 + rnd();
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(a) * len, sy + Math.sin(a) * len);
      ctx.stroke();
    }

    // vignette for depth
    const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
    v.addColorStop(0, 'rgba(60,28,6,0)');
    v.addColorStop(1, 'rgba(60,28,6,0.4)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
  }

  // ---------- stains left on the board ----------
  /** Juice splat in the fruit's colour. */
  private stainJuice(x: number, y: number, color: string, r: number) {
    const c = this.stainCtx;
    if (!c) return;
    c.save();
    c.fillStyle = color;
    c.strokeStyle = color;
    c.lineCap = 'round';

    c.globalAlpha = 0.62;
    const blobs = 7 + Math.floor(Math.random() * 4);
    for (let i = 0; i < blobs; i++) {
      const a = rand(0, TAU);
      const d = rand(0, r * 0.55);
      c.beginPath();
      c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r * rand(0.28, 0.6), 0, TAU);
      c.fill();
    }
    // streaks
    c.globalAlpha = 0.42;
    for (let i = 0; i < 9; i++) {
      const a = rand(0, TAU);
      const len = r * rand(1.1, 2.4);
      c.lineWidth = rand(2, 5);
      c.beginPath();
      c.moveTo(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5);
      c.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
      c.stroke();
    }
    // droplets
    c.globalAlpha = 0.5;
    for (let i = 0; i < 14; i++) {
      const a = rand(0, TAU);
      const d = r * rand(1.2, 2.8);
      c.beginPath();
      c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, rand(1.5, 5.5), 0, TAU);
      c.fill();
    }
    c.restore();
  }

  /** Burnt soot mark: scorch ring, dark core, ragged spikes and specks. */
  private stainSoot(x: number, y: number, r: number) {
    const c = this.stainCtx;
    if (!c) return;
    c.save();

    const scorch = c.createRadialGradient(x, y, r * 0.6, x, y, r * 2.9);
    scorch.addColorStop(0, 'rgba(70,32,8,0.45)');
    scorch.addColorStop(1, 'rgba(70,32,8,0)');
    c.fillStyle = scorch;
    c.beginPath();
    c.arc(x, y, r * 2.9, 0, TAU);
    c.fill();

    // ragged black spikes
    c.fillStyle = 'rgba(12,8,6,0.62)';
    const spikes = 14;
    for (let i = 0; i < spikes; i++) {
      const a = (i / spikes) * TAU + rand(-0.15, 0.15);
      const len = r * rand(1.5, 2.6);
      const wdt = rand(0.1, 0.22);
      c.beginPath();
      c.moveTo(x + Math.cos(a - wdt) * r * 0.5, y + Math.sin(a - wdt) * r * 0.5);
      c.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
      c.lineTo(x + Math.cos(a + wdt) * r * 0.5, y + Math.sin(a + wdt) * r * 0.5);
      c.closePath();
      c.fill();
    }

    const core = c.createRadialGradient(x, y, 0, x, y, r * 1.5);
    core.addColorStop(0, 'rgba(8,6,5,0.92)');
    core.addColorStop(0.6, 'rgba(20,14,10,0.7)');
    core.addColorStop(1, 'rgba(25,16,10,0)');
    c.fillStyle = core;
    c.beginPath();
    c.arc(x, y, r * 1.5, 0, TAU);
    c.fill();

    c.fillStyle = 'rgba(10,8,6,0.7)';
    for (let i = 0; i < 18; i++) {
      const a = rand(0, TAU);
      const d = r * rand(1.4, 3.1);
      c.beginPath();
      c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, rand(1, 3.6), 0, TAU);
      c.fill();
    }
    c.restore();
  }

  /** Old stains fade a little every round so the board never turns solid black. */
  private fadeStains() {
    const c = this.stainCtx;
    if (!c) return;
    c.save();
    c.globalCompositeOperation = 'destination-out';
    c.globalAlpha = 0.22;
    c.fillStyle = '#000';
    c.fillRect(0, 0, this.w, this.h);
    c.restore();
  }

  // ---------- rounds ----------
  private beginRound() {
    const round: Round = this.session.nextRound();
    this.fadeStains();

    const queue: (RoundItem | null | PowerKind)[] = [...round.items];
    const [bMin, bMax] = this.session.params.bombs;
    const bombs = bMin + Math.floor(Math.random() * (bMax - bMin + 1));
    for (let i = 0; i < bombs; i++) {
      // never first: let the player see a normal fruit before the first bomb
      const at = 1 + Math.floor(Math.random() * queue.length);
      queue.splice(at, 0, null);
    }
    const power = this.session.pickPower(bombs > 0);
    if (power) queue.splice(1 + Math.floor(Math.random() * queue.length), 0, power);
    this.queue = queue;
    this.state = 'banner';
    this.bannerT = this.session.params.bannerSec;
    this.cb.onRound({ n: this.session.round, title: round.title, sub: round.sub });
  }

  private nextKind(): FruitKind {
    if (this.kindBag.length === 0) {
      this.kindBag = [...FRUITS].sort(() => Math.random() - 0.5);
    }
    return this.kindBag.pop()!;
  }

  private spawn(entry: RoundItem | null | PowerKind) {
    const power = typeof entry === 'string' ? entry : undefined;
    const item = typeof entry === 'object' ? entry : null;
    const { w, h } = this;
    const r = power ? this.r * 0.82 : this.r;
    const tapSlow = this.opts.inputMode === 'tap' ? 1.25 : 1;
    const T = this.session.params.airtime * tapSlow * rand(0.93, 1.07);

    // spread out horizontally: try a few x positions, keep the one farthest from current fruit
    let bestX = rand(r * 1.4, w - r * 1.4);
    let bestScore = -1;
    for (let i = 0; i < 6; i++) {
      const x = rand(r * 1.4, w - r * 1.4);
      const nearest = this.fruits.reduce((m, f) => Math.min(m, Math.abs(f.x - x) + Math.abs(f.y - h * 0.5) * 0.3), 9999);
      if (nearest > bestScore) {
        bestScore = nearest;
        bestX = x;
      }
    }
    const x1 = clamp(bestX + rand(-w * 0.18, w * 0.18), r * 1.2, w - r * 1.2);
    const y0 = h + r;
    const topY = h * rand(0.2, 0.42);
    const A = y0 - topY;
    const g = (8 * A) / (T * T);

    this.fruits.push({
      item,
      bomb: entry === null,
      power,
      kind: this.nextKind(),
      x0: bestX,
      y0,
      dx: x1 - bestX,
      vy0: (4 * A) / T,
      g,
      T,
      t: 0,
      r,
      rot: rand(0, TAU),
      spin: rand(-1.4, 1.4),
      x: bestX,
      y: y0,
      done: false,
    });
  }

  // ---------- input ----------
  private point(e: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  private onDown = (e: PointerEvent) => {
    if (this.paused) return;
    e.preventDefault();
    try {
      this.canvas.setPointerCapture?.(e.pointerId);
    } catch {
      /* pointer already gone; capture is only a nicety */
    }
    this.pointerDown = true;
    const p = this.point(e);
    this.lastPt = p;
    if (this.opts.inputMode === 'swipe') this.trail = [{ ...p, age: 0 }];
    this.tryCut(p, p);
  };

  private onMove = (e: PointerEvent) => {
    if (!this.pointerDown || this.paused || this.opts.inputMode !== 'swipe') return;
    const p = this.point(e);
    if (this.lastPt) this.tryCut(this.lastPt, p);
    this.lastPt = p;
    this.trail.push({ ...p, age: 0 });
  };

  private onUp = () => {
    this.pointerDown = false;
    this.lastPt = null;
  };

  private tryCut(a: { x: number; y: number }, b: { x: number; y: number }) {
    if (this.state === 'over') return;
    const radiusMul = this.opts.inputMode === 'tap' ? 1.25 : 1.05;
    for (const f of this.fruits) {
      if (f.done) continue;
      if (distToSegment(f.x, f.y, a.x, a.y, b.x, b.y) <= f.r * radiusMul) this.cutFruit(f);
    }
  }

  // ---------- effects ----------
  private juiceBurst(f: Fruit) {
    const vx = f.dx / f.T;
    const vy = -f.vy0 + f.g * f.t;
    for (const side of [0, 1] as const) {
      this.halves.push({
        kind: f.kind,
        side,
        x: f.x,
        y: f.y,
        vx: vx + (side === 0 ? -1 : 1) * rand(60, 130),
        vy: vy - rand(40, 120),
        g: 1500,
        rot: f.rot,
        spin: (side === 0 ? -1 : 1) * rand(1.5, 4),
        r: f.r,
        life: 1.1,
      });
    }
    // flying juice drops
    for (let i = 0; i < 22; i++) {
      const ang = rand(0, TAU);
      const sp = rand(110, 360);
      this.particles.push({
        x: f.x,
        y: f.y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - 70,
        g: 800,
        grow: 0,
        life: 0.75,
        max: 0.75,
        color: Math.random() < 0.6 ? f.kind.base : f.kind.flesh,
        size: rand(2.5, 7),
      });
    }
    this.stainJuice(f.x, f.y, f.kind.base, f.r * 1.05);
  }

  private explode(x: number, y: number, r: number) {
    this.blasts.push({ x, y, r, t: 0 });

    const sparkColors = ['#fff3b0', '#ffd23f', '#ff8c1a', '#ff4d1a'];
    for (let i = 0; i < 30; i++) {
      const a = rand(0, TAU);
      const sp = rand(180, 560);
      const life = rand(0.45, 0.95);
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 40,
        g: 520,
        grow: 0,
        life,
        max: life,
        color: pickOne(sparkColors),
        size: rand(2, 5),
      });
    }
    for (let i = 0; i < 9; i++) {
      const life = rand(1.0, 1.7);
      this.particles.push({
        x: x + rand(-r * 0.5, r * 0.5),
        y: y + rand(-r * 0.4, r * 0.4),
        vx: rand(-40, 40),
        vy: rand(-110, -30),
        g: -20,
        grow: r * rand(0.5, 0.9),
        life,
        max: life,
        color: '45,45,52',
        size: r * rand(0.3, 0.55),
        smoke: true,
      });
    }
    // dark debris
    for (let i = 0; i < 9; i++) {
      const a = rand(0, TAU);
      const sp = rand(120, 420);
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 90,
        g: 1000,
        grow: 0,
        life: 0.85,
        max: 0.85,
        color: '#2a2a31',
        size: rand(3, 6.5),
      });
    }

    this.stainSoot(x, y, r);
    this.shake = 0.5;
    this.shakeMax = 0.5;
    this.flash = 0.28;
    this.flashColor = '255,175,70';
    beep('boom', this.opts.sound);
  }

  // ---------- events ----------
  private cutFruit(f: Fruit) {
    f.done = true;

    // Powerup orb
    if (f.power) {
      this.collectPower(f);
      return;
    }

    // Real bomb (no word on it)
    if (f.bomb || !f.item) {
      const res = this.session.bombHit();
      if (res.shielded) {
        this.shieldBlock(f);
        this.cb.onFeedback({ ok: false, text: '护盾挡住了炸弹！', tone: 'info' });
        return;
      }
      this.explode(f.x, f.y, f.r);
      this.floaters.push({ x: f.x, y: f.y - f.r, text: res.delta ? `${res.delta}` : '炸弹！', color: '#ff7b7b', life: 1.0 });
      this.cb.onFeedback({ ok: false, text: '炸弹！不能切！' });
      if (res.over) this.gameOver();
      return;
    }

    const res = this.session.cut(f.item);
    this.cb.onAnswer(res.ok);

    if (res.ok) {
      this.juiceBurst(f);
      this.floaters.push({ x: f.x, y: f.y - f.r, text: `+${res.delta}`, color: '#7CFC9A', life: 0.9 });
      beep('good', this.opts.sound);
    } else if (res.shielded) {
      // The shield absorbed the disguised bomb.
      this.shieldBlock(f);
      if (res.reason) this.cb.onFeedback({ ok: false, text: `护盾挡住了伪装的炸弹！${res.reason}`, tone: 'info' });
    } else {
      // A wrong fruit was a bomb in disguise.
      this.explode(f.x, f.y, f.r);
      this.floaters.push({ x: f.x, y: f.y - f.r, text: `${res.delta}`, color: '#ff7b7b', life: 1.0 });
      if (res.reason) this.cb.onFeedback({ ok: false, text: `它是伪装的炸弹！${res.reason}` });
    }
    if (res.over) this.gameOver();
  }

  /** Burst of coloured sparks in a ring. */
  private ringBurst(x: number, y: number, r: number, color: string, count = 26) {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * TAU + rand(-0.1, 0.1);
      const sp = rand(140, 300);
      this.particles.push({
        x: x + Math.cos(a) * r * 0.6,
        y: y + Math.sin(a) * r * 0.6,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        g: 120,
        grow: 0,
        life: 0.7,
        max: 0.7,
        color,
        size: rand(2.5, 5),
      });
    }
  }

  /** The shield pops: a blue burst instead of an explosion. */
  private shieldBlock(f: Fruit) {
    this.ringBurst(f.x, f.y, f.r, POWER_COLORS.shield.light, 30);
    this.ringBurst(f.x, f.y, f.r * 1.4, POWER_COLORS.shield.base, 18);
    this.floaters.push({ x: f.x, y: f.y - f.r, text: '护盾！', color: '#93c5fd', life: 1.1 });
    this.flash = 0.2;
    this.flashColor = '90,160,255';
    beep('good', this.opts.sound);
  }

  private collectPower(f: Fruit) {
    const kind = f.power!;
    const colors = POWER_COLORS[kind];
    this.session.collect(kind);
    this.ringBurst(f.x, f.y, f.r, colors.light, 28);
    this.floaters.push({ x: f.x, y: f.y - f.r, text: POWER_LABEL[kind], color: colors.light, life: 1.2 });
    beep('end', this.opts.sound);

    if (kind === 'defuse') {
      // Every bomb currently flying turns into a harmless puff.
      for (const b of this.fruits) {
        if (b.done || !b.bomb) continue;
        b.done = true;
        this.ringBurst(b.x, b.y, b.r, '#a7f3d0', 20);
        for (let i = 0; i < 6; i++) {
          const life = rand(0.7, 1.2);
          this.particles.push({
            x: b.x + rand(-b.r * 0.4, b.r * 0.4),
            y: b.y + rand(-b.r * 0.4, b.r * 0.4),
            vx: rand(-30, 30),
            vy: rand(-70, -20),
            g: -10,
            grow: b.r * 0.5,
            life,
            max: life,
            color: '120,230,180',
            size: b.r * 0.3,
            smoke: true,
          });
        }
        this.floaters.push({ x: b.x, y: b.y - b.r, text: '安全', color: '#a7f3d0', life: 0.9 });
      }
    }
  }

  private missFruit(f: Fruit) {
    if (!f.item) return;
    const res = this.session.miss(f.item);
    if (res.lifeLost) {
      this.flash = 0.3;
      this.flashColor = '255,40,40';
      this.shake = 0.25;
      this.shakeMax = 0.3;
      beep('bad', this.opts.sound);
      this.cb.onFeedback({ ok: false, text: `漏切了！${res.reason}` });
    }
    this.floaters.push({ x: f.x, y: this.h - f.r * 1.2, text: '漏了', color: '#ffd166', life: 0.9 });
    if (res.over) this.gameOver();
  }

  private gameOver() {
    this.state = 'over';
    this.overT = 0.9;
  }

  // ---------- loop ----------
  private frame = (now: number) => {
    if (this.destroyed) return;
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    if (!this.paused) this.update(dt);
    this.draw();
    this.raf = requestAnimationFrame(this.frame);
  };

  private update(dt: number) {
    this.clock += dt;
    this.session.tick(dt);
    this.shake = Math.max(0, this.shake - dt);
    this.flash = Math.max(0, this.flash - dt);

    // Freeze slows the fruit and the launch rhythm; effects and timers keep real time.
    const sdt = this.session.freezing ? dt * FREEZE_SPEED : dt;

    if (this.state === 'banner') {
      this.bannerT -= dt;
      if (this.bannerT <= 0) {
        this.state = 'spawning';
        this.spawnTimer = 0.15;
        this.cb.onRoundGo();
      }
    } else if (this.state === 'spawning') {
      this.spawnTimer -= sdt;
      if (this.spawnTimer <= 0 && this.queue.length) {
        const burst = Math.random() < this.session.params.pairChance && this.queue.length > 1 ? 2 : 1;
        for (let i = 0; i < burst; i++) this.spawn(this.queue.shift() ?? null);
        this.spawnTimer = this.session.params.interval * rand(0.85, 1.25) * (burst === 2 ? 1.5 : 1);
      }
      if (!this.queue.length) this.state = 'clearing';
    }

    for (const f of this.fruits) {
      f.t += sdt;
      f.x = f.x0 + (f.dx * f.t) / f.T;
      f.y = f.y0 - f.vy0 * f.t + 0.5 * f.g * f.t * f.t;
      f.rot += f.spin * sdt;
      if (f.t >= f.T && !f.done) {
        f.done = true;
        if (!f.bomb && !f.power && f.item?.correct && this.state !== 'over') this.missFruit(f);
      }
    }
    this.fruits = this.fruits.filter((f) => !f.done);

    for (const hf of this.halves) {
      hf.life -= dt;
      hf.vy += hf.g * dt;
      hf.x += hf.vx * dt;
      hf.y += hf.vy * dt;
      hf.rot += hf.spin * dt;
    }
    this.halves = this.halves.filter((hf) => hf.life > 0 && hf.y < this.h + hf.r * 2);

    for (const p of this.particles) {
      p.life -= dt;
      p.vy += p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.size += p.grow * dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);

    for (const b of this.blasts) b.t += dt;
    this.blasts = this.blasts.filter((b) => b.t < BLAST_TIME);

    for (const fl of this.floaters) {
      fl.life -= dt;
      fl.y -= 40 * dt;
    }
    this.floaters = this.floaters.filter((fl) => fl.life > 0);

    for (const t of this.trail) t.age += dt;
    this.trail = this.trail.filter((t) => t.age < 0.22);

    if (this.state === 'clearing' && this.fruits.length === 0) {
      const bonus = this.session.endRound();
      if (bonus > 0) {
        this.floaters.push({ x: this.w / 2, y: this.h * 0.45, text: `完美回合！+${bonus}`, color: '#ffd54a', life: 1.4 });
        beep('end', this.opts.sound);
      }
      if (this.state === 'clearing') this.beginRound();
    }

    if (this.state === 'over') {
      this.overT -= dt;
      if (this.overT <= 0 && !this.overSent) {
        this.overSent = true;
        this.cb.onGameOver();
      }
    }
  }

  // ---------- drawing ----------
  private draw() {
    const { ctx, w, h } = this;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // wooden board + permanent juice / soot marks
    if (this.board) ctx.drawImage(this.board, 0, 0, w, h);
    else {
      ctx.fillStyle = '#d2a064';
      ctx.fillRect(0, 0, w, h);
    }
    if (this.stain) ctx.drawImage(this.stain, 0, 0, w, h);

    ctx.save();
    if (this.shake > 0) {
      const k = this.shake / this.shakeMax;
      ctx.translate(rand(-7, 7) * k, rand(-5, 5) * k);
    }

    for (const hf of this.halves) {
      ctx.save();
      ctx.globalAlpha = clamp(hf.life / 0.5, 0, 1);
      ctx.translate(hf.x, hf.y);
      drawHalf(ctx, hf.kind, hf.r, hf.rot, hf.side);
      ctx.restore();
    }

    const hinting = this.session.hinting;
    for (const f of this.fruits) {
      ctx.save();
      ctx.translate(f.x, f.y);
      if (f.power) drawPower(ctx, f.power, f.r, this.clock);
      else if (f.bomb) drawBomb(ctx, f.r, f.rot, this.clock);
      else drawFruit(ctx, f.kind, f.r, f.rot);
      ctx.restore();
      if (!f.bomb && !f.power) {
        // Hint lens: correct fruits glow green.
        if (hinting && f.item?.correct) {
          ctx.save();
          const pulse = 0.65 + 0.35 * Math.sin(this.clock * 8);
          ctx.strokeStyle = `rgba(90,255,150,${pulse})`;
          ctx.shadowColor = 'rgba(60,255,130,0.95)';
          ctx.shadowBlur = 18;
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r * 1.14, 0, TAU);
          ctx.stroke();
          ctx.restore();
        }
        this.drawWord(f);
      }
    }

    // particles (juice, sparks, debris, smoke)
    for (const p of this.particles) {
      const a = clamp(p.life / p.max, 0, 1);
      if (p.smoke) {
        ctx.fillStyle = `rgba(${p.color},${0.55 * a})`;
      } else {
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // explosions
    for (const b of this.blasts) this.drawBlast(b);

    // slash trail: dark underlay so it reads on light wood, then a bright blade line
    if (this.trail.length > 1) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (let i = 1; i < this.trail.length; i++) {
        const a = this.trail[i - 1];
        const b = this.trail[i];
        const life = 1 - b.age / 0.22;
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(60,30,8,${0.4 * life})`;
        ctx.lineWidth = 6 + 9 * life;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255,255,255,${0.95 * life})`;
        ctx.shadowColor = 'rgba(255,255,255,0.9)';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2 + 6 * life;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const fl of this.floaters) {
      ctx.globalAlpha = clamp(fl.life / 0.5, 0, 1);
      ctx.font = `900 ${Math.round(this.r * 0.5)}px ${FONT}`;
      ctx.lineWidth = 5;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(30,12,0,0.75)';
      ctx.strokeText(fl.text, fl.x, fl.y);
      ctx.fillStyle = fl.color;
      ctx.fillText(fl.text, fl.x, fl.y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // Freeze: icy tint and frosted edges
    if (this.session.freezing) {
      ctx.fillStyle = `rgba(170,225,255,${0.1 + 0.03 * Math.sin(this.clock * 4)})`;
      ctx.fillRect(0, 0, w, h);
      const frost = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
      frost.addColorStop(0, 'rgba(220,245,255,0)');
      frost.addColorStop(1, 'rgba(220,245,255,0.38)');
      ctx.fillStyle = frost;
      ctx.fillRect(0, 0, w, h);
    }

    if (this.flash > 0) {
      ctx.fillStyle = `rgba(${this.flashColor},${(this.flash / 0.3) * 0.38})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  private drawBlast(b: Blast) {
    const ctx = this.ctx;
    const p = clamp(b.t / BLAST_TIME, 0, 1);
    const a = 1 - p;
    const ease = 1 - Math.pow(1 - p, 3);

    // white-hot flash at the start
    if (p < 0.2) {
      ctx.fillStyle = `rgba(255,255,235,${(1 - p / 0.2) * 0.9})`;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * (0.8 + p * 6), 0, TAU);
      ctx.fill();
    }

    // fireball
    const fr = b.r * (0.5 + 2.0 * ease);
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, fr);
    g.addColorStop(0, `rgba(255,250,210,${a})`);
    g.addColorStop(0.35, `rgba(255,190,60,${a * 0.95})`);
    g.addColorStop(0.7, `rgba(235,80,15,${a * 0.75})`);
    g.addColorStop(1, 'rgba(120,20,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, fr, 0, TAU);
    ctx.fill();

    // shockwave ring
    ctx.strokeStyle = `rgba(255,236,190,${a * 0.9})`;
    ctx.lineWidth = 1 + 7 * a;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r * (0.7 + 3.4 * ease), 0, TAU);
    ctx.stroke();
  }

  /** Words stay upright and large, with an outline so they read on any fruit colour. */
  private drawWord(f: Fruit) {
    if (!f.item) return;
    const ctx = this.ctx;
    const { hanzi, pinyin } = f.item.word;
    const showPinyin = this.opts.showPinyin;
    const maxW = f.r * 1.7;
    const fs = Math.min(f.r * 0.82, maxW / Math.max(1, hanzi.length * 1.02));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';

    const yHanzi = f.y + (showPinyin ? fs * 0.18 : 0);
    ctx.font = `900 ${fs}px ${FONT}`;
    ctx.lineWidth = Math.max(4, fs * 0.2);
    ctx.strokeStyle = 'rgba(20,10,30,0.85)';
    ctx.strokeText(hanzi, f.x, yHanzi);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(hanzi, f.x, yHanzi);

    if (showPinyin) {
      const pfs = Math.min(f.r * 0.36, (f.r * 1.8) / Math.max(4, pinyin.length * 0.62));
      ctx.font = `800 ${pfs}px ${FONT}`;
      const yP = yHanzi - fs * 0.62;
      ctx.lineWidth = Math.max(3, pfs * 0.28);
      ctx.strokeText(pinyin, f.x, yP);
      ctx.fillStyle = '#fff6c2';
      ctx.fillText(pinyin, f.x, yP);
    }
  }
}
