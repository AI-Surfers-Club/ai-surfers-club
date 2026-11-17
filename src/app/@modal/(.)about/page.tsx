import { AboutContent } from '@/components/about/about-content';

export const dynamic = 'force-dynamic';

// 화면 안에서 About Us 로 가면(헤더 버튼 등) 페이지를 옮기지 않고 지금 화면 위에 팝업으로 띄운다 (팝업 틀은 layout.tsx)
export default function AboutModalPage() {
  return <AboutContent />;
}
