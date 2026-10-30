export type ProfileInput = { teamName: string; displayName: string };
export type ProfileErrors = Partial<Record<keyof ProfileInput, string>>;

export function checkProfile(input: ProfileInput): ProfileErrors {
  const e: ProfileErrors = {};
  if (!input.teamName.trim()) e.teamName = '팀 이름을 입력해주세요';
  if (!input.displayName.trim()) e.displayName = '이름을 입력해주세요';
  return e;
}
