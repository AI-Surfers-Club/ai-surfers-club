'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { completeSignup, type SignupState } from '@/lib/auth/actions';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="pill fill big auth-submit" disabled={pending}>
      {pending ? '확인 중…' : '가입 완료'}
    </button>
  );
}

const initial: SignupState = { errors: {}, values: { teamName: '', displayName: '' } };

export function SignupForm({ next }: { next: string }) {
  const [state, action] = useActionState(completeSignup, initial);
  const e = state.errors;
  // 비밀번호가 틀렸을 때만 이 칸을 비운다. 다른 칸 오류로는 지우지 않는다
  const [passcode, setPasscode] = useState('');
  useEffect(() => {
    if (state.errors.passcode) setPasscode('');
  }, [state]);
  return (
    <form action={action} noValidate>
      <input type="hidden" name="next" value={next} />
      <div className={`auth-field${e.passcode ? ' invalid' : ''}`}>
        <label htmlFor="passcode">임직원 비밀번호 *</label>
        <input id="passcode" name="passcode" type="password" placeholder="비밀번호" autoComplete="off" value={passcode} onChange={(ev) => setPasscode(ev.target.value)} aria-invalid={!!e.passcode} />
        {e.passcode && <p className="field-err" role="alert">{e.passcode}</p>}
      </div>
      <div className={`auth-field${e.teamName ? ' invalid' : ''}`}>
        <label htmlFor="teamName">팀 이름 *</label>
        <input id="teamName" name="teamName" placeholder="예: AX전략팀" defaultValue={state.values.teamName} aria-invalid={!!e.teamName} />
        {e.teamName && <p className="field-err">{e.teamName}</p>}
      </div>
      <div className={`auth-field${e.displayName ? ' invalid' : ''}`}>
        <label htmlFor="displayName">이름 *</label>
        <input id="displayName" name="displayName" placeholder="예: 김서연" defaultValue={state.values.displayName} aria-invalid={!!e.displayName} />
        {e.displayName && <p className="field-err">{e.displayName}</p>}
      </div>
      <Submit />
    </form>
  );
}
