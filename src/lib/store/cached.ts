// 서버 전용: 저장소 읽기를 Next 데이터 캐시에 담아 둔다.
// 서비스·회원·필터 목록은 자주 바뀌지 않으므로, 화면을 열 때마다 DB 에 묻지 않고 캐시에서 바로 꺼낸다.
// 쓰기(등록·수정·삭제·가입·프로필 저장 등)가 성공하면 캐시를 통째로 비워 다음 화면부터 새 값을 읽는다.
import { revalidateTag, unstable_cache } from 'next/cache';
import type { DataStore } from './types';

export const STORE_TAG = 'store';

/** DB 를 직접 고친 경우(대시보드 등)에도 이 시간이 지나면 새로 읽는다 (초) */
const MAX_AGE = 60;

const READS = ['listServices', 'getService', 'listFilters', 'filterUsage', 'getProfile', 'getProfileByEmail', 'listProfiles'] as const;
/** 화면에 보이는 데이터를 바꾸지 않는 쓰기 (이미지 파일만 올린다) */
const NO_INVALIDATE = new Set<string>(['saveImage']);

/** 캐시를 비운다: 쓰기 뒤, 또는 테스트 데이터를 되돌린 뒤 */
export function invalidateStore() {
  revalidateTag(STORE_TAG);
}

export function withCache(store: DataStore, namespace: string): DataStore {
  const out = { ...store } as Record<string, unknown>;
  const src = store as unknown as Record<string, (...a: unknown[]) => Promise<unknown>>;
  for (const key of Object.keys(store)) {
    const fn = src[key];
    if (typeof fn !== 'function') continue;
    if ((READS as readonly string[]).includes(key)) {
      out[key] = (...args: unknown[]) =>
        unstable_cache(() => fn.apply(store, args), [namespace, key, JSON.stringify(args)], { tags: [STORE_TAG], revalidate: MAX_AGE })();
    } else {
      out[key] = async (...args: unknown[]) => {
        const result = await fn.apply(store, args);
        if (!NO_INVALIDATE.has(key)) invalidateStore();
        return result;
      };
    }
  }
  return out as unknown as DataStore;
}
