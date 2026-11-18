import { avatarGradient } from '@/lib/profile';

/** Ring styles for avatar frames sold / unlocked in the shop. */
const FRAME_CLASS: Record<string, string> = {
  'frame.none': 'ring-2 ring-white/60',
  'frame.bronze': 'ring-4 ring-amber-700 shadow-[0_0_0_7px_rgba(180,83,9,0.25)]',
  'frame.jade': 'ring-4 ring-emerald-400 shadow-[0_0_0_7px_rgba(16,185,129,0.3)]',
  'frame.silver': 'ring-4 ring-slate-300 shadow-[0_0_0_7px_rgba(148,163,184,0.4)]',
  'frame.gold': 'ring-4 ring-yellow-400 shadow-[0_0_20px_5px_rgba(250,204,21,0.55)]',
};

const SIZE_CLASS = {
  sm: 'size-8 text-base',
  md: 'size-16 text-3xl',
  lg: 'size-24 text-5xl',
};

export function Avatar({
  char,
  frame = 'frame.none',
  size = 'md',
}: {
  char: string;
  frame?: string;
  size?: keyof typeof SIZE_CLASS;
}) {
  return (
    <span
      aria-hidden
      className={`inline-grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-black text-white ${avatarGradient(
        char,
      )} ${SIZE_CLASS[size]} ${FRAME_CLASS[frame] ?? FRAME_CLASS['frame.none']}`}
    >
      {char}
    </span>
  );
}
