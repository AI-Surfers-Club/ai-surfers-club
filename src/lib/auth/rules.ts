// 가입 규칙과 관리자 판정. 서버 전용 — 클라이언트 컴포넌트에서 import하지 않는다.
import { MOCK_ADMIN_EMAIL } from '@/lib/store/mock/seed';

export type SignupInput = { passcode: string; teamName: string; displayName: string };
export type SignupErrors = Partial<Record<keyof SignupInput, string>>;

const isMock = () => process.env.APP_MODE === 'mock';

/** 임직원 비밀번호. 환경변수에만 있고, mock 모드에서만 기본값을 쓴다. */
function expectedPasscode(): string | null {
  const fromEnv = process.env.SIGNUP_PASSCODE?.trim();
  if (fromEnv) return fromEnv;
  return isMock() ? 'mock-passcode' : null;
}

/** 가입 입력 검사. 비밀번호 비교는 여기(서버)에서만 한다. */
export function checkSignup(input: SignupInput, passcode = expectedPasscode()): SignupErrors {
  const errors: SignupErrors = {};
  if (!input.passcode) errors.passcode = '비밀번호를 입력해주세요';
  else if (!passcode || input.passcode !== passcode) errors.passcode = '비밀번호가 올바르지 않습니다';
  if (!input.teamName.trim()) errors.teamName = '팀 이름을 입력해주세요';
  if (!input.displayName.trim()) errors.displayName = '이름을 입력해주세요';
  return errors;
}

/** 관리자 구글 이메일 목록 (ADMIN_EMAILS, 쉼표 구분) */
export function adminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? (isMock() ? MOCK_ADMIN_EMAIL : '');
  return raw.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
}

export function isAdmin(email: string | null | undefined): boolean {
  return !!email && adminEmails().includes(email.toLowerCase());
}

/** 로그인 후 돌아갈 주소: 같은 사이트 안의 경로만 허용 */
export function safeNext(next: string | null | undefined, fallback = '/'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback;
  return next;
}
