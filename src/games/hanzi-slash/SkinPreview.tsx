'use client';

import { useEffect, useRef } from 'react';
import { drawTrail, paintBoard, type TrailPoint } from './skins';

/** Small canvas preview of a Hanzi Slash board or blade skin, used in the shop. */
export function SkinPreview({ itemId, className = '' }: { itemId: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || 240;
    const h = canvas.clientHeight || 130;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const isBlade = itemId.startsWith('blade.');
    paintBoard(ctx, w, h, isBlade ? 'board.wood' : itemId);

    if (isBlade) {
      // A sample swipe: newest point at the right end.
      const n = 18;
      const pts: TrailPoint[] = Array.from({ length: n }, (_, i) => {
        const t = i / (n - 1);
        return {
          x: w * (0.1 + 0.8 * t),
          y: h * (0.72 - 0.45 * Math.sin(t * Math.PI * 0.9)),
          age: (1 - t) * 0.17,
        };
      });
      drawTrail(ctx, pts, itemId, 0.4);
    }
  }, [itemId]);

  return <canvas ref={ref} aria-hidden className={`block h-full w-full ${className}`} />;
}
