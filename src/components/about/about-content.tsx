import { HangingTeam, type Candidate, type Member } from './hanging-team';
import { defaultCharacter } from '@/lib/avatars/characters';
import { currentUser } from '@/lib/auth/session';
import { getStore } from '@/lib/store';
import type { AboutGroup, Profile } from '@/lib/store/types';

// 줄 길이를 들쭉날쭉하게 섞어 매달린 높이가 리듬감 있게 보이도록
const ROPES = [60, 130, 30, 100, 50, 150, 80, 20, 120, 70];

const byName = (a: Profile, b: Profile) => a.displayName.localeCompare(b.displayName, 'ko');

/** About Us 본문: 전체 페이지(/about)와 팝업(@modal/(.)about)이 같이 쓴다 */
export async function AboutContent() {
  const store = getStore();
  const [all, profiles, user] = await Promise.all([
    store.listServices({ sort: 'new' }).catch(() => []),
    store.listProfiles().catch(() => [] as Profile[]),
    currentUser().catch(() => ({ state: 'guest' as const })),
  ]);
  const admin = user.state === 'member' && user.admin;

  const services = new Map<string, { id: string; name: string }[]>();
  for (const s of all) services.set(s.authorId, [...(services.get(s.authorId) ?? []), { id: s.id, name: s.name }]);

  // 관리자가 About Us 에 올린 회원만 그룹별로 보여준다 (이름순)
  const group = (g: AboutGroup, offset = 0): Member[] =>
    profiles.filter((p) => p.aboutGroup === g).sort(byName).map((p, i) => ({
      id: p.id,
      displayName: p.displayName,
      teamName: p.teamName,
      services: services.get(p.id) ?? [],
      character: p.character ?? defaultCharacter(p.id),
      rope: ROPES[(i + offset) % ROPES.length],
    }));
  const surfers = group('surfer');
  const crew = group('crew', 3);

  // '멤버 추가' 후보: 아직 About Us 에 없는 회원. 관리자에게만 넘긴다 (이메일은 넘기지 않는다)
  const candidates: Candidate[] = admin
    ? profiles.filter((p) => !p.aboutGroup).sort(byName).map((p) => ({ id: p.id, displayName: p.displayName, teamName: p.teamName }))
    : [];

  return (
    <>
      <HangingTeam group="surfer" members={surfers} label={`Surfers · ${surfers.length}`} admin={admin} candidates={candidates} />
      <HangingTeam group="crew" members={crew} label={`Crew · ${crew.length}`} tag="CREW" perRow={6} admin={admin} candidates={candidates} />
    </>
  );
}
