'use server';

import { revalidatePath } from 'next/cache';
import { currentUser } from '@/lib/auth/session';
import { getStore } from '@/lib/store';
import type { Filter } from '@/lib/store/types';

export type FilterRow = Filter & { usage: number };
export type FilterResult = { ok: true; filters: FilterRow[] } | { ok: false; error: string };

/** 모든 필터 동작은 서버에서 관리자인지 다시 확인한다 */
async function requireAdmin(): Promise<string | null> {
  const user = await currentUser();
  return user.state === 'member' && user.admin ? null : '관리자만 필터를 관리할 수 있어요';
}

async function rows(): Promise<FilterRow[]> {
  const store = getStore();
  const filters = await store.listFilters();
  return Promise.all(filters.map(async (f) => ({ ...f, usage: await store.filterUsage(f.id) })));
}

async function done(): Promise<FilterResult> {
  revalidatePath('/', 'layout');
  return { ok: true, filters: await rows() };
}

const clean = (name: string) => name.trim().replace(/\s+/g, ' ');

export async function listFilterRows(): Promise<FilterResult> {
  const denied = await requireAdmin();
  if (denied) return { ok: false, error: denied };
  return { ok: true, filters: await rows() };
}

export async function addFilterAction(name: string): Promise<FilterResult> {
  const denied = await requireAdmin();
  if (denied) return { ok: false, error: denied };
  const n = clean(name);
  if (!n) return { ok: false, error: '필터 이름을 입력해주세요' };
  if ((await getStore().listFilters()).some((f) => f.name === n)) return { ok: false, error: '이미 있는 필터 이름입니다' };
  try {
    await getStore().addFilter(n);
  } catch {
    return { ok: false, error: '저장하지 못했습니다. 다시 시도해주세요.' };
  }
  return done();
}

export async function renameFilterAction(id: string, name: string): Promise<FilterResult> {
  const denied = await requireAdmin();
  if (denied) return { ok: false, error: denied };
  const n = clean(name);
  if (!n) return { ok: false, error: '필터 이름을 입력해주세요' };
  if ((await getStore().listFilters()).some((f) => f.name === n && f.id !== id)) return { ok: false, error: '이미 있는 필터 이름입니다' };
  try {
    await getStore().renameFilter(id, n);
  } catch {
    return { ok: false, error: '저장하지 못했습니다. 다시 시도해주세요.' };
  }
  return done();
}

export async function deleteFilterAction(id: string): Promise<FilterResult> {
  const denied = await requireAdmin();
  if (denied) return { ok: false, error: denied };
  try {
    await getStore().deleteFilter(id);
  } catch {
    return { ok: false, error: '저장하지 못했습니다. 다시 시도해주세요.' };
  }
  return done();
}
