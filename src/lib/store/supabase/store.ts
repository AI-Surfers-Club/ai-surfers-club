import type {
  DataStore, Filter, ListServicesOptions, NewServiceInput, Profile, Service, ServiceInput,
} from '../types';
import { adminClient, BUCKET } from './clients';

type ServiceRow = {
  id: string; author_id: string; name: string; tagline: string; description: string; url: string;
  created_at: string; updated_at: string;
  service_images: { path: string; position: number }[] | null;
  service_filters: { filter_id: string }[] | null;
};
type ProfileRow = { id: string; email: string; team_name: string; display_name: string };

const SERVICE_COLUMNS = 'id, author_id, name, tagline, description, url, created_at, updated_at, service_images(path, position), service_filters(filter_id)';

const db = () => adminClient();

function publicUrl(path: string): string {
  return db().storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** 저장된 공개 URL → 버킷 안 경로 (우리 버킷이 아니면 null) */
function pathFromUrl(url: string): string | null {
  const base = publicUrl('');
  return url.startsWith(base) ? decodeURIComponent(url.slice(base.length)) : null;
}

function toService(r: ServiceRow): Service {
  return {
    id: r.id,
    authorId: r.author_id,
    name: r.name,
    tagline: r.tagline,
    description: r.description ?? '',
    url: r.url,
    images: (r.service_images ?? []).slice().sort((a, b) => a.position - b.position).map((i) => publicUrl(i.path)),
    filterIds: (r.service_filters ?? []).map((f) => f.filter_id),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

const toProfile = (r: ProfileRow): Profile => ({ id: r.id, email: r.email, teamName: r.team_name, displayName: r.display_name });

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

const plain = (html: string) => html.replace(/<[^>]*>/g, ' ');

async function uploadDataUrl(ownerId: string, dataUrl: string): Promise<string> {
  const m = /^data:([^;,]+)(;base64)?,(.*)$/s.exec(dataUrl);
  if (!m) throw new Error('이미지 형식을 읽을 수 없습니다');
  const type = m[1];
  const body = m[2] ? Buffer.from(m[3], 'base64') : Buffer.from(decodeURIComponent(m[3]));
  return uploadBytes(ownerId, body, type);
}

async function uploadBytes(ownerId: string, body: Buffer | Blob, type: string): Promise<string> {
  const ext = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/svg+xml': 'svg' } as Record<string, string>)[type] ?? 'bin';
  const path = `${ownerId}/${crypto.randomUUID()}.${ext}`;
  check(await db().storage.from(BUCKET).upload(path, body, { contentType: type, upsert: false }));
  return path;
}

/** 화면에서 받은 이미지 목록(공개 URL 또는 data URL)을 버킷 경로 목록으로 */
async function toPaths(ownerId: string, images: string[]): Promise<string[]> {
  const out: string[] = [];
  for (const img of images.slice(0, 10)) {
    const existing = pathFromUrl(img);
    out.push(existing ?? (img.startsWith('data:') ? await uploadDataUrl(ownerId, img) : img));
  }
  return out;
}

async function writeImagesAndFilters(serviceId: string, paths: string[], filterIds: string[]) {
  check(await db().from('service_images').delete().eq('service_id', serviceId));
  if (paths.length) {
    check(await db().from('service_images').insert(paths.map((path, position) => ({ service_id: serviceId, path, position }))));
  }
  check(await db().from('service_filters').delete().eq('service_id', serviceId));
  if (filterIds.length) {
    check(await db().from('service_filters').insert(filterIds.map((filter_id) => ({ service_id: serviceId, filter_id }))));
  }
}

export function createStore(): DataStore {
  return {
    async listServices(options: ListServicesOptions = {}) {
      let q = db().from('services').select(SERVICE_COLUMNS);
      if (options.authorId) q = q.eq('author_id', options.authorId);
      const rows = check(await q.order('created_at', { ascending: false })) as unknown as ServiceRow[];
      let list = rows.map(toService);
      if (options.filterId) list = list.filter((s) => s.filterIds.includes(options.filterId!));
      const term = options.q?.trim().toLowerCase();
      if (term) list = list.filter((s) => `${s.name} ${s.tagline} ${plain(s.description)}`.toLowerCase().includes(term));
      if (options.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
      return list;
    },

    async getService(id) {
      const row = check(await db().from('services').select(SERVICE_COLUMNS).eq('id', id).maybeSingle()) as unknown as ServiceRow | null;
      return row ? toService(row) : null;
    },

    async createService(input: NewServiceInput) {
      const row = check(await db().from('services').insert({
        author_id: input.authorId, name: input.name, tagline: input.tagline, description: input.description, url: input.url,
      }).select('id').single()) as { id: string };
      await writeImagesAndFilters(row.id, await toPaths(input.authorId, input.images), input.filterIds);
      return (await this.getService(row.id))!;
    },

    async updateService(id: string, input: ServiceInput) {
      const before = await this.getService(id);
      if (!before) throw new Error('서비스를 찾을 수 없습니다');
      check(await db().from('services').update({
        name: input.name, tagline: input.tagline, description: input.description, url: input.url,
      }).eq('id', id));
      const paths = await toPaths(before.authorId, input.images);
      await writeImagesAndFilters(id, paths, input.filterIds);
      // 빠진 이미지 파일은 지운다
      const removed = before.images.map(pathFromUrl).filter((p): p is string => !!p && !paths.includes(p));
      if (removed.length) await db().storage.from(BUCKET).remove(removed);
      return (await this.getService(id))!;
    },

    async deleteService(id) {
      const before = await this.getService(id);
      check(await db().from('services').delete().eq('id', id));
      const paths = (before?.images ?? []).map(pathFromUrl).filter((p): p is string => !!p);
      if (paths.length) await db().storage.from(BUCKET).remove(paths);
    },

    async listFilters() {
      const rows = check(await db().from('filters').select('id, name').order('created_at')) as Filter[];
      return rows;
    },

    async filterUsage(id) {
      const res = await db().from('service_filters').select('service_id', { count: 'exact', head: true }).eq('filter_id', id);
      if (res.error) throw new Error(res.error.message);
      return res.count ?? 0;
    },

    async addFilter(name) {
      return check(await db().from('filters').insert({ name }).select('id, name').single()) as Filter;
    },

    async renameFilter(id, name) {
      return check(await db().from('filters').update({ name }).eq('id', id).select('id, name').single()) as Filter;
    },

    async deleteFilter(id) {
      // service_filters 는 ON DELETE CASCADE 로 함께 사라진다
      check(await db().from('filters').delete().eq('id', id));
    },

    async getProfile(id) {
      const row = check(await db().from('profiles').select('id, email, team_name, display_name').eq('id', id).maybeSingle()) as ProfileRow | null;
      return row ? toProfile(row) : null;
    },

    async getProfileByEmail(email) {
      const row = check(await db().from('profiles').select('id, email, team_name, display_name').eq('email', email).maybeSingle()) as ProfileRow | null;
      return row ? toProfile(row) : null;
    },

    async listProfiles() {
      const rows = check(await db().from('profiles').select('id, email, team_name, display_name')) as ProfileRow[];
      return rows.map(toProfile);
    },

    async upsertProfile(p) {
      const row = check(await db().from('profiles').upsert({
        id: p.id, email: p.email, team_name: p.teamName, display_name: p.displayName,
      }).select('id, email, team_name, display_name').single()) as ProfileRow;
      return toProfile(row);
    },

    async saveImage(ownerId, image) {
      const path = typeof image === 'string'
        ? await uploadDataUrl(ownerId, image)
        : await uploadBytes(ownerId, image, image.type || 'application/octet-stream');
      return publicUrl(path);
    },
  };
}
