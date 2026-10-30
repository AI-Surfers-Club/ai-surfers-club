// 서비스 등록 검사와 저장. 검사 함수는 수정 작업에서도 쓴다.
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { richText, sanitizeRich } from '@/lib/richtext/sanitize';
import { acceptableImageUrl, MAX_IMAGES } from '@/lib/images/rules';
import { requireMember } from '@/lib/auth/session';
import { getStore } from '@/lib/store';
import type { ServiceInput } from '@/lib/store/types';

/** 상세 설명 작성 가이드 질문 (에디터와 같은 목록) */
export const WRITE_GUIDE_QUESTIONS = ['왜 만들었나요?', '무엇을 해주나요?', '어떻게 쓰나요?', '주의할 점이 있나요?'];

export const LIMITS = { name: 60, tagline: 100, description: 3000 } as const;

export type ServiceFormInput = {
  name: string;
  tagline: string;
  url: string;
  description: string;
  images: string[];
  filterIds: string[];
};

export type ServiceErrors = Partial<Record<keyof ServiceFormInput, string>>;
export type SaveResult = { ok: false; errors: ServiceErrors; message?: string };

/** 답을 채우지 않은 가이드 소제목(그리고 그 아래 빈 문단)을 뺀다 */
export function dropEmptyGuide(html: string): string {
  const guide = new Set(WRITE_GUIDE_QUESTIONS);
  const parts = html.split(/(?=<h3>)/);
  return parts
    .filter((part) => {
      const m = /^<h3>([\s\S]*?)<\/h3>([\s\S]*)$/.exec(part);
      if (!m) return true;
      const title = richText(m[1]);
      return !(guide.has(title) && !richText(m[2]));
    })
    .join('');
}

/** 저장 전에 서버에서 다시 하는 검사와 정리 */
export function checkServiceInput(raw: ServiceFormInput): { errors: ServiceErrors; clean: ServiceInput } {
  const errors: ServiceErrors = {};
  const name = (raw.name ?? '').trim();
  const tagline = (raw.tagline ?? '').trim();
  const url = (raw.url ?? '').trim();
  const description = sanitizeRich(dropEmptyGuide(sanitizeRich(raw.description ?? '')));
  const images = Array.isArray(raw.images) ? raw.images : [];
  const filterIds = Array.isArray(raw.filterIds) ? [...new Set(raw.filterIds.map(String))] : [];

  if (!name) errors.name = '서비스 이름을 입력해주세요';
  else if (name.length > LIMITS.name) errors.name = `서비스 이름은 ${LIMITS.name}자까지 쓸 수 있어요`;
  if (!tagline) errors.tagline = '한 줄 소개를 입력해주세요';
  else if (tagline.length > LIMITS.tagline) errors.tagline = `한 줄 소개는 ${LIMITS.tagline}자까지 쓸 수 있어요`;
  if (!/^https?:\/\/[^\s.]+\.[^\s]+$/i.test(url)) errors.url = 'http:// 또는 https://로 시작하는 주소를 입력해주세요';
  if (richText(description).length > LIMITS.description) errors.description = '상세 설명은 3000자까지 쓸 수 있어요';
  if (images.length > MAX_IMAGES) errors.images = `최대 ${MAX_IMAGES}장까지 올릴 수 있어요`;
  else if (images.some((i) => typeof i !== 'string' || !acceptableImageUrl(i))) errors.images = 'JPG·PNG·WebP, 5MB 이하만 올릴 수 있어요';

  return {
    errors,
    clean: { name, tagline, url, description: richText(description) ? description : '', images, filterIds },
  };
}

/** 있는 필터만 남긴다 */
async function knownFilters(ids: string[]): Promise<string[]> {
  const all = new Set((await getStore().listFilters()).map((f) => f.id));
  return ids.filter((id) => all.has(id));
}

/** 등록 (Server Action) */
export async function createServiceAction(raw: ServiceFormInput): Promise<SaveResult> {
  'use server';
  const user = await requireMember('/services/new');
  const { errors, clean } = checkServiceInput(raw);
  if (Object.keys(errors).length) return { ok: false, errors };
  let id: string;
  try {
    const svc = await getStore().createService({ ...clean, filterIds: await knownFilters(clean.filterIds), authorId: user.profile.id });
    id = svc.id;
  } catch {
    return { ok: false, errors: {}, message: '저장하지 못했습니다. 입력한 내용은 그대로 있으니 다시 시도해주세요.' };
  }
  revalidatePath('/', 'layout');
  redirect(`/services/${id}?saved=created`);
}
