'use client';

import { useLinkStatus } from 'next/link';

/**
 * <Link> 안에 넣으면, 누른 뒤 다음 화면이 뜨기 전까지 작은 원이 돈다.
 * 금방 넘어가는 이동에서는 깜빡이지 않도록 CSS 에서 조금 늦게 나타난다.
 */
export function LinkPending() {
  const { pending } = useLinkStatus();
  return pending ? <span className="link-pending" aria-hidden="true" /> : null;
}
