import { beep } from '@/lib/sound';
import { drawFruit, drawHalf, FRUITS, type FruitKind } from './fruit';
import type { Round, RoundItem } from './rules';
import type { Session, Snapshot } from './session';

const FONT = `'PingFang SC','Microsoft YaHei','Noto Sans SC','Hiragino Sans GB',sans-serif`;
const TAU = Math.PI * 2;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export interface EngineCallbacks {
  onState(s: Snapshot): void;
  /** A new round starts: show the rule banner. */
  onRound(info: { n: number; title: string; sub: string }): void;
  /** The banner is over and fruits start flying. */
  onRoundGo(): void;
  onFeedback(f: { ok: boolean; text: string }): void;
  onAnswer(correct: boolean): void;
  onGameOver(): void;
}

export interface EngineOptions {
  inputMode: 'swipe' | 'tap';
  showPinyin: boolean;
  sound: boolean;
}

interface Fruit {
  item: RoundItem;
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
  life: number;
  max: number;
  color: string;
  size: number;
}

interface Floater {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

type State = 'banner' | 'spawning' | 'clearing' | 'over';

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

  private fruits: Fruit[] = [];
  private halves: Half[] = [];
  private particles: Particle[] = [];
  private floaters: Floater[] = [];
  private trail: { x: number; y: number; age: number }[] = [];

  private state: State = 'banner';
  private queue: RoundItem[] = [];
  private bannerT = 0;
  private spawnTimer = 0;
  private overT = 0;
  private overSent = false;
  private shake = 0;
  private flash = 0;
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
  }

  // ---------- rounds ----------
  private beginRound() {
    const round: Round = this.session.nextRound();
    this.queue = [...round.items];
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

  private spawn(item: RoundItem) {
    const { w, h, r } = this;
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

  // ---------- events ----------
  private cutFruit(f: Fruit) {
    f.done = true;
    const res = this.session.cut(f.item);
    this.cb.onAnswer(res.ok);

    // current velocity for realistic halves
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
    for (let i = 0; i < 14; i++) {
      const ang = rand(0, TAU);
      const sp = rand(80, 260);
      this.particles.push({
        x: f.x,
        y: f.y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - 60,
        life: 0.7,
        max: 0.7,
        color: Math.random() < 0.5 ? f.kind.flesh : f.kind.base,
        size: rand(3, 6.5),
      });
    }

    if (res.ok) {
      this.floaters.push({ x: f.x, y: f.y - f.r, text: `+${res.delta}`, color: '#7CFC9A', life: 0.9 });
      beep('good', this.opts.sound);
    } else {
      this.floaters.push({ x: f.x, y: f.y - f.r, text: `${res.delta}`, color: '#ff7b7b', life: 1.0 });
      this.flash = 0.35;
      this.shake = 0.3;
      beep('bad', this.opts.sound);
      if (res.reason) this.cb.onFeedback({ ok: false, text: res.reason });
    }
    if (res.over) this.gameOver();
  }

  private missFruit(f: Fruit) {
    const res = this.session.miss(f.item);
    if (res.lifeLost) {
      this.flash = 0.3;
      this.shake = 0.25;
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
    this.session.elapsed += dt;
    this.shake = Math.max(0, this.shake - dt);
    this.flash = Math.max(0, this.flash - dt);

    if (this.state === 'banner') {
      this.bannerT -= dt;
      if (this.bannerT <= 0) {
        this.state = 'spawning';
        this.spawnTimer = 0.15;
        this.cb.onRoundGo();
      }
    } else if (this.state === 'spawning') {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0 && this.queue.length) {
        const burst = Math.random() < this.session.params.pairChance && this.queue.length > 1 ? 2 : 1;
        for (let i = 0; i < burst; i++) this.spawn(this.queue.shift()!);
        this.spawnTimer = this.session.params.interval * rand(0.85, 1.25) * (burst === 2 ? 1.5 : 1);
      }
      if (!this.queue.length) this.state = 'clearing';
    }

    for (const f of this.fruits) {
      f.t += dt;
      f.x = f.x0 + (f.dx * f.t) / f.T;
      f.y = f.y0 - f.vy0 * f.t + 0.5 * f.g * f.t * f.t;
      f.rot += f.spin * dt;
      if (f.t >= f.T && !f.done) {
        f.done = true;
        if (f.item.correct && this.state !== 'over') this.missFruit(f);
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
      p.vy += 700 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);

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

    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#1b2440');
    bg.addColorStop(1, '#3a2342');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    if (this.shake > 0) ctx.translate(rand(-5, 5) * (this.shake / 0.3), rand(-4, 4) * (this.shake / 0.3));

    // halves
    for (const hf of this.halves) {
      ctx.save();
      ctx.globalAlpha = clamp(hf.life / 0.5, 0, 1);
      ctx.translate(hf.x, hf.y);
      drawHalf(ctx, hf.kind, hf.r, hf.rot, hf.side);
      ctx.restore();
    }

    // fruits + words
    for (const f of this.fruits) {
      ctx.save();
      ctx.translate(f.x, f.y);
      drawFruit(ctx, f.kind, f.r, f.rot);
      ctx.restore();
      this.drawWord(f);
    }

    // particles
    for (const p of this.particles) {
      ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // slash trail
    if (this.trail.length > 1) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (let i = 1; i < this.trail.length; i++) {
        const a = this.trail[i - 1];
        const b = this.trail[i];
        const life = 1 - b.age / 0.22;
        ctx.strokeStyle = `rgba(255,255,255,${0.9 * life})`;
        ctx.shadowColor = 'rgba(160,220,255,0.9)';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 2 + 7 * life;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }

    // floaters
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const fl of this.floaters) {
      ctx.globalAlpha = clamp(fl.life / 0.5, 0, 1);
      ctx.font = `900 ${Math.round(this.r * 0.5)}px ${FONT}`;
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.strokeText(fl.text, fl.x, fl.y);
      ctx.fillStyle = fl.color;
      ctx.fillText(fl.text, fl.x, fl.y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    if (this.flash > 0) {
      ctx.fillStyle = `rgba(255,40,40,${(this.flash / 0.35) * 0.35})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  /** Words stay upright and large, with an outline so they read on any fruit colour. */
  private drawWord(f: Fruit) {
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
