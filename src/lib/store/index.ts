// 서버 전용 모듈: 클라이언트 컴포넌트에서 import하지 않는다.
import type { AuthAdapter, DataStore } from './types';
import { memoryStore } from './mock/memory-store';
import { mockAuth } from './mock/mock-auth';
import { createSupabaseAuth, createSupabaseStore } from './supabase';

export type AppMode = 'mock' | 'supabase';

export function appMode(): AppMode {
  return process.env.APP_MODE === 'mock' ? 'mock' : 'supabase';
}

export const isMockMode = () => appMode() === 'mock';

/** 지금 모드의 데이터 저장소 */
export function getStore(): DataStore {
  return isMockMode() ? memoryStore : createSupabaseStore();
}

/** 지금 모드의 로그인 어댑터 */
export function getAuth(): AuthAdapter {
  return isMockMode() ? mockAuth : createSupabaseAuth();
}

export type * from './types';
