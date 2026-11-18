import type { Metadata } from 'next';
import { ShopView } from '@/components/ShopView';

export const metadata: Metadata = { title: 'Shop 商店' };

export default function ShopPage() {
  return <ShopView />;
}
