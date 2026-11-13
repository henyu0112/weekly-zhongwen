/* eslint-disable @next/next/no-img-element */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/**
 * Picture for a vocabulary word (public/art/words/<id>.svg).
 * Artwork: Twemoji graphics, CC-BY 4.0 (credited on the About page).
 */
export function WordArt({ id, className = '' }: { id: string; className?: string }) {
  return (
    <img
      src={`${BASE}/art/words/${id}.svg`}
      alt=""
      draggable={false}
      className={`pointer-events-none select-none ${className}`}
    />
  );
}
