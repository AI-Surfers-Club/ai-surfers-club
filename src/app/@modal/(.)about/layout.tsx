import type { ReactNode } from 'react';
import { AboutModal } from '@/components/about/about-modal';

// 팝업 틀은 레이아웃에 둔다: 내용을 불러오는 동안(loading)과 다 불러온 뒤(page)에 같은 팝업이 이어진다
export default function AboutModalLayout({ children }: { children: ReactNode }) {
  return <AboutModal>{children}</AboutModal>;
}
