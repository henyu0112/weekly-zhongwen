import type { Metadata } from 'next';
import { DictionaryView } from '@/components/DictionaryView';

export const metadata: Metadata = { title: '词典 Dictionary' };

export default function DictionaryPage() {
  return <DictionaryView />;
}
