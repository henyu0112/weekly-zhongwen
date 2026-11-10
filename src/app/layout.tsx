import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileTabBar } from '@/components/MobileTabBar';

export const metadata: Metadata = {
  title: { default: '每周中文 WeeklyZhongwen', template: '%s | 每周中文 WeeklyZhongwen' },
  description: 'Learn Chinese with a new mini-game every week. 每周一款小游戏，轻松学中文。',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#c8281f',
};

// Applies saved theme / text size before first paint to avoid a flash.
const preboot = `(function(){try{var s=JSON.parse(localStorage.getItem('wz.settings')||'{}');var d=document.documentElement;var t=s.theme||'system';if(t==='system')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';d.dataset.theme=t;d.dataset.size=s.textSize||'medium';}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preboot }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <Providers>
          <Header />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 md:pb-12 md:pt-10">
            {children}
          </main>
          <Footer />
          <MobileTabBar />
        </Providers>
      </body>
    </html>
  );
}
