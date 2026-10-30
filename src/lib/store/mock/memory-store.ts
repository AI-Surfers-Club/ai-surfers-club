import type {
  DataStore, Filter, ListServicesOptions, NewServiceInput, Profile, Service, ServiceInput,
} from '../types';
import { seedFilters, seedProfiles, seedServices } from './seed';

type State = { services: Service[]; filters: Filter[]; profiles: Profile[]; seq: number };

// 개발 서버가 모듈을 다시 읽어도 데이터가 유지되도록 globalThis에 둔다.
const KEY = '__aiSurfersMockState';
const g = globalThis as unknown as Record<string, State | undefined>;

function fresh(): State {
  return { services: seedServices(), filters: seedFilters(), profiles: seedProfiles(), seq: 1 };
}

function state(): State {
  if (!g[KEY]) g[KEY] = fresh();
  return g[KEY]!;
}

/** 샘플 데이터로 되돌린다 (테스트용) */
export function resetMockState(): void {
  g[KEY] = fresh();
}

const plain = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');
const copy = <T,>(v: T): T => structuredClone(v);

function nextId(prefix: string): string {
  const s = state();
  s.seq += 1;
  return `${prefix}${Date.now().toString(36)}${s.seq}`;
}

export const memoryStore: DataStore = {
  async listServices(options: ListServicesOptions = {}) {
    let list = state().services.slice();
    if (options.authorId) list = list.filter((s) => s.authorId === options.authorId);
    if (options.filterId) list = list.filter((s) => s.filterIds.includes(options.filterId!));
    const q = options.q?.trim().toLowerCase();
    if (q) list = list.filter((s) => `${s.name} ${s.tagline} ${plain(s.description)}`.toLowerCase().includes(q));
    if (options.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    else list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return copy(list);
  },

  async getService(id) {
    const s = state().services.find((x) => x.id === id);
    return s ? copy(s) : null;
  },

  async createService(input: NewServiceInput) {
    const now = new Date().toISOString();
    const svc: Service = { id: nextId('s'), ...copy(input), createdAt: now, updatedAt: now };
    state().services.push(svc);
    return copy(svc);
  },

  async updateService(id: string, input: ServiceInput) {
    const s = state().services.find((x) => x.id === id);
    if (!s) throw new Error('서비스를 찾을 수 없습니다');
    Object.assign(s, copy(input), { updatedAt: new Date().toISOString() });
    return copy(s);
  },

  async deleteService(id) {
    const s = state();
    s.services = s.services.filter((x) => x.id !== id);
  },

  async listFilters() {
    return copy(state().filters);
  },

  async filterUsage(id) {
    return state().services.filter((s) => s.filterIds.includes(id)).length;
  },

  async addFilter(name) {
    const f = { id: nextId('f'), name };
    state().filters.push(f);
    return copy(f);
  },

  async renameFilter(id, name) {
    const f = state().filters.find((x) => x.id === id);
    if (!f) throw new Error('필터를 찾을 수 없습니다');
    f.name = name;
    return copy(f);
  },

  async deleteFilter(id) {
    const s = state();
    s.filters = s.filters.filter((f) => f.id !== id);
    for (const svc of s.services) svc.filterIds = svc.filterIds.filter((f) => f !== id);
  },

  async getProfile(id) {
    const p = state().profiles.find((x) => x.id === id);
    return p ? copy(p) : null;
  },

  async getProfileByEmail(email) {
    const p = state().profiles.find((x) => x.email === email);
    return p ? copy(p) : null;
  },

  async listProfiles() {
    return copy(state().profiles);
  },

  async upsertProfile(profile) {
    const s = state();
    const i = s.profiles.findIndex((p) => p.id === profile.id);
    if (i >= 0) s.profiles[i] = copy(profile);
    else s.profiles.push(copy(profile));
    return copy(profile);
  },

  async saveImage(_ownerId, image) {
    // mock: data URL을 그대로 쓴다. Blob이면 data URL로 바꾼다.
    if (typeof image === 'string') return image;
    const buf = Buffer.from(await image.arrayBuffer());
    return `data:${image.type || 'application/octet-stream'};base64,${buf.toString('base64')}`;
  },
};
