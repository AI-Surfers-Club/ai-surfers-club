// 저장소 인터페이스. 모든 기능은 이 인터페이스만 거친다.
// 구현: mock(메모리 + 샘플 데이터) / supabase(실제 배포).

export type Profile = {
  id: string;
  email: string;
  teamName: string;
  displayName: string;
  /** 고른 서퍼스 크루 캐릭터 번호 (About Us 카드). 고르지 않았으면 null — 계정마다 다른 기본 캐릭터가 나온다 */
  character?: number | null;
  /** About Us 에 나오는 그룹. 관리자가 정한다. null 이면 About Us 에 나오지 않는다 */
  aboutGroup?: AboutGroup | null;
};

export type AboutGroup = 'surfer' | 'crew';

export type Service = {
  id: string;
  authorId: string;
  name: string;
  tagline: string;
  /** 허용 태그만 남긴 HTML (p, h3, strong, em, ul, ol, li, blockquote, br, a) */
  description: string;
  url: string;
  /** 이미지 URL 목록. 순서대로이며 0번이 대표 이미지. 최대 10장 */
  images: string[];
  filterIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type Filter = { id: string; name: string };

export type ServiceSort = 'new' | 'name';

export type ListServicesOptions = {
  sort?: ServiceSort;
  /** 서비스 이름·한 줄 소개·상세 설명 글자(서식 제외)에서 찾는다 */
  q?: string;
  filterId?: string;
  authorId?: string;
};

export type ServiceInput = {
  name: string;
  tagline: string;
  description: string;
  url: string;
  images: string[];
  filterIds: string[];
};

export type NewServiceInput = ServiceInput & { authorId: string };

export interface DataStore {
  listServices(options?: ListServicesOptions): Promise<Service[]>;
  getService(id: string): Promise<Service | null>;
  createService(input: NewServiceInput): Promise<Service>;
  updateService(id: string, input: ServiceInput): Promise<Service>;
  deleteService(id: string): Promise<void>;

  listFilters(): Promise<Filter[]>;
  /** 이 필터를 쓰는 서비스 수 */
  filterUsage(id: string): Promise<number>;
  addFilter(name: string): Promise<Filter>;
  renameFilter(id: string, name: string): Promise<Filter>;
  /** 필터를 지우고, 이 필터를 쓰던 서비스에서도 뗀다 */
  deleteFilter(id: string): Promise<void>;

  getProfile(id: string): Promise<Profile | null>;
  getProfileByEmail(email: string): Promise<Profile | null>;
  listProfiles(): Promise<Profile[]>;
  upsertProfile(profile: Profile): Promise<Profile>;

  /** 이미지를 저장하고 화면에서 쓸 URL을 돌려준다 */
  saveImage(ownerId: string, image: string | Blob): Promise<string>;
}

/** 로그인한 구글 계정 (가입 여부와 별개) */
export type Account = { id: string; email: string };

export interface AuthAdapter {
  currentAccount(): Promise<Account | null>;
  /** 로그인 화면 주소. 로그인이 끝나면 next로 돌아온다 */
  signInUrl(next: string): string;
  signOut(): Promise<void>;
}
