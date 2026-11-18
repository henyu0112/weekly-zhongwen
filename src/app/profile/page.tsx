import type { Metadata } from 'next';
import { ProfileView } from '@/components/ProfileView';

export const metadata: Metadata = { title: 'Profile 我的' };

export default function ProfilePage() {
  return <ProfileView />;
}
