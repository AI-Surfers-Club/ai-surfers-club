import type { Metadata } from 'next';
import { AboutContent } from '@/components/about/about-content';

export const metadata: Metadata = { title: 'About Us · AI Surfers Club' };
export const dynamic = 'force-dynamic';

// /about 로 바로 들어오거나 새로고침하면 전체 페이지로 보인다. 헤더에서 누르면 @modal/(.)about 이 팝업으로 가로챈다
export default function AboutPage() {
  return (
    <main className="main">
      <h1 className="visually-hidden">About Us</h1>
      <AboutContent />
    </main>
  );
}
