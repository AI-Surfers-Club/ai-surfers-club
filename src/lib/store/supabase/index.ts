import type { AuthAdapter, DataStore } from '../types';
import { createStore } from './store';
import { createAuth } from './auth';

// supabase 모드 구현. 클라이언트는 메서드를 부를 때 만들어지므로 환경변수 없이도 불러올 수 있다.
export function createSupabaseStore(): DataStore {
  return createStore();
}

export function createSupabaseAuth(): AuthAdapter {
  return createAuth();
}
