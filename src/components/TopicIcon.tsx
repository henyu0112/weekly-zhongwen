import { ArrowLeftRight, BookOpen, MessageSquareText, PenLine, ScrollText, Tag, Type, type LucideIcon } from 'lucide-react';
import type { TopicId } from '@/games/catalog';

const ICONS: Record<TopicId, LucideIcon> = {
  vocabulary: BookOpen,
  wordtypes: Tag,
  antonyms: ArrowLeftRight,
  characters: PenLine,
  pinyin: Type,
  idioms: ScrollText,
  sentences: MessageSquareText,
};

export function TopicIcon({ id, className = 'size-3.5' }: { id: TopicId; className?: string }) {
  const Icon = ICONS[id];
  return <Icon aria-hidden className={`inline-block shrink-0 ${className}`} strokeWidth={2.2} />;
}
