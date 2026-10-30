'use server';

import { currentUser } from '@/lib/auth/session';
import { getStore } from '@/lib/store';
import { imageProblem } from './rules';

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

/** 이미지 한 장 올리기: 형식·크기를 서버에서 다시 확인하고 저장한 주소를 돌려준다 */
export async function uploadImage(form: FormData): Promise<UploadResult> {
  const user = await currentUser();
  if (user.state !== 'member') return { ok: false, error: '로그인한 회원만 올릴 수 있어요' };
  const file = form.get('file');
  if (!(file instanceof Blob)) return { ok: false, error: '이미지를 찾을 수 없어요' };
  const problem = imageProblem(file.type, file.size);
  if (problem) return { ok: false, error: problem };
  try {
    const url = await getStore().saveImage(user.profile.id, file);
    return { ok: true, url };
  } catch {
    return { ok: false, error: '이미지를 올리지 못했습니다. 다시 시도해주세요.' };
  }
}
