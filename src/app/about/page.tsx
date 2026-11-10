import type { Metadata } from 'next';
import { AboutView } from '@/components/AboutView';

export const metadata: Metadata = { title: 'About 关于' };

export default function AboutPage() {
  return <AboutView />;
}
