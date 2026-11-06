import { AboutContent } from '@/components/about/about-content';
import { AboutModal } from '@/components/about/about-modal';

export const dynamic = 'force-dynamic';

// 화면 안에서 About Us 로 가면(헤더 버튼 등) 페이지를 옮기지 않고 지금 화면 위에 팝업으로 띄운다
export default function AboutModalPage() {
  return (
    <AboutModal>
      <AboutContent />
    </AboutModal>
  );
}
