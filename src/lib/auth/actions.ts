'use server';

import { redirect } from 'next/navigation';
import { getStore } from '@/lib/store';
import { currentUser } from './session';
import { checkSignup, safeNext, type SignupErrors } from './rules';

export type SignupState = {
  errors: SignupErrors;
  values: { teamName: string; displayName: string };
};

/** 가입 완료: 비밀번호는 서버에서만 확인하고, 맞으면 가입 정보를 만든다 */
export async function completeSignup(_prev: SignupState, form: FormData): Promise<SignupState> {
  const input = {
    passcode: String(form.get('passcode') ?? ''),
    teamName: String(form.get('teamName') ?? ''),
    displayName: String(form.get('displayName') ?? ''),
  };
  const next = safeNext(String(form.get('next') ?? '/'));
  const values = { teamName: input.teamName, displayName: input.displayName };

  const user = await currentUser();
  if (user.state === 'guest') redirect('/');
  if (user.state === 'member') redirect(next);

  const errors = checkSignup(input);
  if (Object.keys(errors).length) return { errors, values };

  await getStore().upsertProfile({
    id: user.account.id,
    email: user.account.email,
    teamName: input.teamName.trim(),
    displayName: input.displayName.trim(),
  });
  redirect(next);
}
