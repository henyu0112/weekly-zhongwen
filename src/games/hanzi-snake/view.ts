import { beep } from '@/lib/sound';
import { speak } from '@/lib/speech';
import { COLS, ROWS, type Cell, type SnakeEvent, type SnakeGame } from './game';
import { boardTheme, drawBoard, drawSnake, drawTile, snakeSkin, type BoardTheme, type SnakeSkin } from './skins';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface ViewOptions {
  skin?: string;
  board?: string;
  sound: boolean;
}

export interface ViewCallbacks {
  /** Something the HUD shows changed (score, lives, word progress, phase, hint). */
  onChange(): void;
  onEvent(e: SnakeEvent): void;
}

/** Runs the game clock and draws the board on a square canvas. */
export class SnakeView {
  paused = false;
  private raf = 0;
  private last = 0;
  private cell = 20;
  private dpr = 1;
  private particles: Particle[] = [];
  private shake = 0;
  private flash = 0;
  private hudKey = '';
  private destroyed = false;
  private readonly ro: ResizeObserver;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly theme: BoardTheme;
  private readonly skin: SnakeSkin;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly game: SnakeGame,
    private readonly opts: ViewOptions,
    private readonly cb: ViewCallbacks,
  ) {
    this.ctx = canvas.getContext('2d')!;
    this.theme = boardTheme(opts.board);
    this.skin = snakeSkin(opts.skin);
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas.parentElement ?? canvas);
    this.resize();
  }

  start(): void {
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  destroy(): void {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
  }

  private resize(): void {
    const box = this.canvas.parentElement ?? this.canvas;
    const size = Math.max(120, Math.floor(box.clientWidth));
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;
    this.canvas.width = Math.round(size * this.dpr);
    this.canvas.height = Math.round(size * this.dpr);
    this.cell = size / COLS;
    this.draw(0);
  }

  private frame = (now: number) => {
    if (this.destroyed) return;
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    if (!this.paused) {
      this.game.update(dt);
      for (const e of this.game.events.splice(0)) this.handle(e);
      this.tickEffects(dt);
    }
    const g = this.game;
    const key = `${g.score}|${g.lives}|${g.progress}|${g.wordsDone}|${g.phase}|${g.hint}|${g.snake.length}|${Math.ceil(g.pauseLeft)}|${g.recovering}`;
    if (key !== this.hudKey) {
      this.hudKey = key;
      this.cb.onChange();
    }
    this.draw(now / 1000);
    this.raf = requestAnimationFrame(this.frame);
  };

  private burst(x: number, y: number, colors: string[], n: number): void {
    const cx = (x + 0.5) * this.cell;
    const cy = (y + 0.5) * this.cell;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.4;
      const v = this.cell * (2.5 + Math.random() * 3);
      this.particles.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.5, color: colors[i % colors.length] });
    }
  }

  private handle(e: SnakeEvent): void {
    const sound = this.opts.sound;
    if (e.type === 'eat') {
      beep('good', sound);
      this.burst(e.x, e.y, ['#facc15', '#4ade80', '#ffffff'], 10);
    } else if (e.type === 'wrong') {
      beep('bad', sound);
      this.shake = 0.25;
      this.burst(e.x, e.y, ['#ef4444', '#f97316'], 8);
    } else if (e.type === 'crash') {
      beep('boom', sound);
      this.shake = 0.4;
      this.flash = 0.5;
    } else if (e.type === 'word') {
      if (sound) speak(e.word.hanzi);
    } else if (e.type === 'over') {
      beep('end', sound);
    }
    this.cb.onEvent(e);
  }

  private tickEffects(dt: number): void {
    this.shake = Math.max(0, this.shake - dt);
    this.flash = Math.max(0, this.flash - dt);
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.9;
      p.vy *= 0.9;
      p.life -= dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  /**
   * Snake positions between the last move and the next one, so the body glides
   * instead of jumping a whole cell at a time.
   */
  private smoothPoints(): Cell[] {
    const g = this.game;
    const prev = g.prevSnake;
    const t = g.stepProgress;
    if (!prev || t >= 1) return g.snake;
    return g.snake.map((to, i) => {
      // When the snake grows, the body stays still and only the head moves forward.
      let from = g.grew ? (i === 0 ? prev[0] : to) : (prev[i] ?? to);
      // Going through a wrapping wall: jump instead of sliding across the board.
      if (Math.abs(from.x - to.x) + Math.abs(from.y - to.y) > 1.5) from = to;
      return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
    });
  }

  private draw(time: number): void {
    const { ctx, cell, game } = this;
    const size = cell * COLS;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    if (this.shake > 0) {
      const m = cell * 0.18 * (this.shake / 0.4);
      ctx.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m);
    }
    drawBoard(ctx, COLS, ROWS, cell, this.theme, !game.params.wrap);

    const pulse = game.hint ? 0.5 + 0.5 * Math.sin(time * 6) : 0;
    for (const it of game.items) {
      drawTile(ctx, it, it.ch, cell, this.theme, game.hint && it.index === game.progress ? pulse : 0);
    }
    drawSnake(ctx, this.smoothPoints(), game.labels, game.dir, cell, this.skin);

    // Mark where the crash happened while the game is frozen on it.
    if (game.phase === 'crashed' && game.crash) {
      const x = (game.crash.x + 0.5) * cell;
      const y = (game.crash.y + 0.5) * cell;
      const k = 0.5 + 0.5 * Math.sin(time * 10);
      ctx.strokeStyle = `rgba(239,68,68,${0.6 + k * 0.4})`;
      ctx.lineWidth = cell * 0.12;
      ctx.beginPath();
      ctx.arc(x, y, cell * (0.55 + k * 0.12), 0, Math.PI * 2);
      ctx.stroke();
    }

    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / 0.5);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, cell * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    if (this.flash > 0) {
      ctx.fillStyle = `rgba(239,68,68,${this.flash * 0.6})`;
      ctx.fillRect(0, 0, size, size);
    }
  }
}
