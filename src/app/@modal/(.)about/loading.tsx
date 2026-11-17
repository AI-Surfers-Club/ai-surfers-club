import { AboutSkeleton } from '@/components/about/about-skeleton';

// 헤더에서 About Us 를 누르면 팝업은 바로 뜨고, 멤버는 불러오는 대로 채워진다
export default function AboutModalLoading() {
  return <AboutSkeleton />;
}
