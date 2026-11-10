import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="每周中文 WeeklyZhongwen">
      <span
        aria-hidden
        className="grid size-10 place-items-center rounded-xl bg-brand text-2xl font-black text-brand-fg shadow-sm"
      >
        中
      </span>
      <span className="leading-tight">
        <span className="block text-lg font-extrabold">每周中文</span>
        <span className="hidden text-[11px] font-semibold tracking-wide text-muted sm:block">
          WeeklyZhongwen
        </span>
      </span>
    </Link>
  );
}
