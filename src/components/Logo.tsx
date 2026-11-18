import Link from 'next/link';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const CHARS = ['每', '周', '中', '文'];

/**
 * Site logo: the controller/book/calendar mark (public/brand, light + dark versions)
 * next to a live 每周中文 wordmark whose characters hop in on load and wave on hover.
 * `compact` is used when the header shrinks on scroll.
 */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="logo-link flex shrink-0 items-center gap-2" aria-label="每周中文 WeeklyZhongwen">
      <span
        aria-hidden
        className={`logo-mark relative block shrink-0 transition-all duration-300 ${
          compact ? 'h-9 w-[52px]' : 'h-9 w-[52px] sm:h-11 sm:w-[64px]'
        }`}
      >
        <img src={`${BASE}/brand/logo-mark.png`} alt="" className="size-full object-contain dark:hidden" />
        <img src={`${BASE}/brand/logo-mark-dark.png`} alt="" className="hidden size-full object-contain dark:block" />
      </span>
      <span aria-hidden className="leading-none">
        <span
          className={`flex font-black tracking-wide text-fg transition-all duration-300 ${
            compact ? 'text-lg' : 'text-lg sm:text-xl'
          }`}
        >
          {CHARS.map((c, i) => (
            <span key={c} className="logo-char" style={{ '--i': i } as React.CSSProperties}>
              {c}
            </span>
          ))}
        </span>
        <span
          className={`hidden overflow-hidden whitespace-nowrap text-[9.5px] font-extrabold uppercase tracking-[0.16em] text-fg/80 transition-all duration-300 sm:block ${
            compact ? 'mt-0 max-h-0 opacity-0' : 'mt-1 max-h-4 opacity-100'
          }`}
        >
          Weekly Zhongwen
        </span>
      </span>
    </Link>
  );
}
