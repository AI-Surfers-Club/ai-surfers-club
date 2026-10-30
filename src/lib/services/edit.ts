// 서비스 수정·삭제. 화면에서 버튼을 숨기는 것과 별개로, 서버에서 다시 권한을 확인한다.
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { currentUser, isAdmin, type CurrentUser } from '@/lib/auth/session';
import { getStore } from '@/lib/store';
import type { Service } from '@/lib/store/types';
import { checkServiceInput, type SaveResult, type ServiceFormInput } from './mutations';

/** 작성자 본인 또는 관리자(ADMIN_EMAILS)만 */
export function canManage(user: CurrentUser, service: Pick<Service, 'authorId'>): boolean {
  if (user.state !== 'member') return false;
  return user.profile.id === service.authorId || isAdmin(user.account.email);
}

export type DeleteResult = { ok: true } | { ok: false; message: string };

/** 수정 (Server Action) — serviceId 를 bind 해서 폼에 넘긴다 */
export async function updateServiceAction(serviceId: string, raw: ServiceFormInput): Promise<SaveResult> {
  'use server';
  const [user, service] = await Promise.all([currentUser(), getStore().getService(serviceId)]);
  if (!service) return { ok: false, errors: {}, message: '삭제되었거나 없는 서비스입니다' };
  if (!canManage(user, service)) return { ok: false, errors: {}, message: '수정할 수 있는 권한이 없어요' };

  const { errors, clean } = checkServiceInput(raw);
  if (Object.keys(errors).length) return { ok: false, errors };
  const known = new Set((await getStore().listFilters()).map((f) => f.id));
  try {
    await getStore().updateService(serviceId, { ...clean, filterIds: clean.filterIds.filter((f) => known.has(f)) });
  } catch {
    return { ok: false, errors: {}, message: '저장하지 못했습니다. 입력한 내용은 그대로 있으니 다시 시도해주세요.' };
  }
  revalidatePath('/', 'layout');
  redirect(`/services/${serviceId}?saved=updated`);
}

/** 삭제 (Server Action) */
export async function deleteServiceAction(serviceId: string): Promise<DeleteResult> {
  'use server';
  const [user, service] = await Promise.all([currentUser(), getStore().getService(serviceId)]);
  if (!service) return { ok: false, message: '이미 삭제된 서비스예요' };
  if (!canManage(user, service)) return { ok: false, message: '삭제할 수 있는 권한이 없어요' };
  try {
    await getStore().deleteService(serviceId);
  } catch {
    return { ok: false, message: '삭제하지 못했습니다. 다시 시도해주세요.' };
  }
  // 여기서 화면을 다시 그리면 지금 보던 상세가 '없는 서비스'로 바뀌어 안내가 사라진다.
  // 화면 쪽이 안내를 띄운 뒤 홈으로 가면서 새로 불러온다.
  return { ok: true };
}
