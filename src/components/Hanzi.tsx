'use client';

import { useSettings } from '@/lib/settings';

/** Chinese text with optional pinyin above (controlled by the Settings toggle). */
export function Hanzi({
  text,
  pinyin,
  forcePinyin,
  className = '',
}: {
  text: string;
  pinyin: string;
  forcePinyin?: boolean;
  className?: string;
}) {
  const { pinyin: show } = useSettings();
  if (!show && !forcePinyin) return <span className={className}>{text}</span>;
  return (
    <ruby className={className} style={{ rubyAlign: 'center' }}>
      {text}
      <rt>{pinyin}</rt>
    </ruby>
  );
}
