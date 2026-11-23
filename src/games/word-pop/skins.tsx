import type { CSSProperties } from 'react';

export interface PopScene {
  background: string;
  /** Text on the background. */
  ink: string;
  /** Panels (HUD, question card). */
  panel: string;
  panelInk: string;
  muted: string;
  accent: string;
  drift: string;
}

export interface PopBubble {
  background: string;
  ink: string;
  burst: string[];
}

export const POP_SCENES: Record<string, PopScene> = {
  'scene.sky': { background: 'linear-gradient(180deg,#e0f2fe,#e0e7ff)', ink: '#0f172a', panel: '#ffffff', panelInk: '#0f172a', muted: '#64748b', accent: '#4f46e5', drift: '#7dd3fc' },
  'scene.sunset': { background: 'linear-gradient(180deg,#fdba74,#f472b6 60%,#7c3aed)', ink: '#ffffff', panel: '#fff7ed', panelInk: '#431407', muted: '#9a3412', accent: '#ea580c', drift: '#fef3c7' },
  'scene.ocean': { background: 'linear-gradient(180deg,#0e7490,#164e63 55%,#082f49)', ink: '#ecfeff', panel: '#ecfeff', panelInk: '#083344', muted: '#0e7490', accent: '#0891b2', drift: '#67e8f9' },
  'scene.forest': { background: 'linear-gradient(180deg,#bbf7d0,#4ade80 45%,#166534)', ink: '#052e16', panel: '#f0fdf4', panelInk: '#052e16', muted: '#166534', accent: '#16a34a', drift: '#f0fdf4' },
  'scene.night': { background: 'radial-gradient(circle at 25% 15%,#4338ca,#1e1b4b 55%,#020617)', ink: '#eef2ff', panel: '#1e1b4b', panelInk: '#eef2ff', muted: '#a5b4fc', accent: '#818cf8', drift: '#c7d2fe' },
};

export const POP_BUBBLES: Record<string, PopBubble> = {
  'bubble.classic': { background: 'radial-gradient(circle at 30% 20%,#ffffff,#f1f5f9)', ink: '#0f172a', burst: ['#38bdf8', '#818cf8', '#7dd3fc'] },
  'bubble.candy': { background: 'radial-gradient(circle at 30% 20%,#fff1f2,#fbcfe8 65%,#f9a8d4)', ink: '#500724', burst: ['#f472b6', '#fb7185', '#fde047'] },
  'bubble.mint': { background: 'radial-gradient(circle at 30% 20%,#f0fdfa,#a7f3d0 70%,#5eead4)', ink: '#042f2e', burst: ['#2dd4bf', '#4ade80', '#a7f3d0'] },
  'bubble.gold': { background: 'radial-gradient(circle at 30% 20%,#fefce8,#fde047 65%,#f59e0b)', ink: '#422006', burst: ['#facc15', '#f59e0b', '#fff7ae'] },
  'bubble.galaxy': { background: 'radial-gradient(circle at 30% 20%,#7c3aed,#312e81 60%,#0f172a)', ink: '#f5f3ff', burst: ['#c084fc', '#818cf8', '#f0abfc'] },
};

export const popScene = (id?: string) => POP_SCENES[id ?? ''] ?? POP_SCENES['scene.sky'];
export const popBubble = (id?: string) => POP_BUBBLES[id ?? ''] ?? POP_BUBBLES['bubble.classic'];

const DRIFT = [
  { left: '6%', size: 26, t: '13s', d: '0s' },
  { left: '20%', size: 14, t: '10s', d: '-4s' },
  { left: '38%', size: 34, t: '16s', d: '-9s' },
  { left: '58%', size: 18, t: '11s', d: '-2s' },
  { left: '74%', size: 30, t: '15s', d: '-7s' },
  { left: '90%', size: 16, t: '12s', d: '-5s' },
];

/** Soft bubbles rising behind the game. */
export function DriftBubbles({ color }: { color: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {DRIFT.map((b) => (
        <span
          key={b.left}
          className="pop-drift absolute -bottom-10 rounded-full border-2 opacity-0"
          style={{ left: b.left, width: b.size, height: b.size, borderColor: color, '--t': b.t, '--d': b.d } as CSSProperties}
        />
      ))}
    </div>
  );
}

/** Shop preview of a Word Pop background or bubble. */
export function PopSkinPreview({ itemId }: { itemId: string }) {
  const isBubble = itemId.startsWith('bubble.');
  const scene = isBubble ? POP_SCENES['scene.sky'] : popScene(itemId);
  const bubble = isBubble ? popBubble(itemId) : POP_BUBBLES['bubble.classic'];
  return (
    <div className="flex h-full items-center justify-center gap-3" style={{ background: scene.background }}>
      {['汉', '字'].map((c) => (
        <span
          key={c}
          lang="zh-CN"
          className="grid size-16 place-items-center rounded-full text-3xl font-black shadow-lg"
          style={{ background: bubble.background, color: bubble.ink }}
        >
          {c}
        </span>
      ))}
    </div>
  );
}
