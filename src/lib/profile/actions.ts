'use server';

import { revalidatePath } from 'next/cache';
import { currentUser } from '@/lib/auth/session';
import { getStore } from '@/lib/store';
import { checkProfile, type ProfileErrors } from './rules';

export type ProfileResult = { ok: boolean; errors: ProfileErrors; message?: string };

/**
 * 내 정보 수정: 로그인한 본인 행만 바꾼다.
 * 폼에 다른 사람 id가 들어 있어도 쓰지 않는다 — 대상은 언제나 세션의 계정이다.
 */
export async function updateMyProfile(form: FormData): Promise<ProfileResult> {
  const input = { teamName: String(form.get('teamName') ?? ''), displayName: String(form.get('displayName') ?? '') };
  const errors = checkProfile(input);
  if (Object.keys(errors).length) return { ok: false, errors };

  const user = await currentUser();
  if (user.state !== 'member') return { ok: false, errors: {}, message: '로그인한 회원만 바꿀 수 있어요' };

  try {
    await getStore().upsertProfile({
      ...user.profile,
      teamName: input.teamName.trim(),
      displayName: input.displayName.trim(),
    });
  } catch {
    return { ok: false, errors: {}, message: '저장하지 못했습니다. 다시 시도해주세요.' };
  }
  revalidatePath('/', 'layout');
  return { ok: true, errors: {} };
}
