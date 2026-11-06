'use server';

import { revalidatePath } from 'next/cache';
import { currentUser } from '@/lib/auth/session';
import { getStore } from '@/lib/store';
import type { AboutGroup } from '@/lib/store/types';

export type AboutResult = { ok: true } | { ok: false; error: string };

/**
 * About Us 그룹 바꾸기: 'surfer' / 'crew' 로 올리거나, null 로 내린다.
 * 관리자인지 서버에서 다시 확인하고, 가입한 회원(프로필이 있는 사람)만 바꿀 수 있다.
 */
export async function setAboutGroup(profileId: string, group: AboutGroup | null): Promise<AboutResult> {
  const user = await currentUser();
  if (user.state !== 'member' || !user.admin) return { ok: false, error: '관리자만 About Us 멤버를 바꿀 수 있어요' };
  if (group !== null && group !== 'surfer' && group !== 'crew') return { ok: false, error: '그룹을 다시 골라주세요' };

  const store = getStore();
  try {
    const profile = await store.getProfile(String(profileId));
    if (!profile) return { ok: false, error: '가입한 회원을 찾을 수 없어요' };
    await store.upsertProfile({ ...profile, aboutGroup: group });
  } catch {
    return { ok: false, error: '저장하지 못했습니다. 다시 시도해주세요.' };
  }
  revalidatePath('/about');
  return { ok: true };
}
