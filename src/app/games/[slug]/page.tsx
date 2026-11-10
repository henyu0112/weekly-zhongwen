import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GAMES, getGame } from '@/games/catalog';
import { GameView } from '@/components/GameView';

export const dynamicParams = false;

export function generateStaticParams() {
  return GAMES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const game = getGame((await params).slug);
  return { title: game ? `${game.title.en} ${game.title.zh}` : 'Game' };
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getGame(slug)) notFound();
  return <GameView slug={slug} />;
}
