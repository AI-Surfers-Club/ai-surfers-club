'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Filter } from '@/lib/store/types';
import type { SaveResult, ServiceErrors, ServiceFormInput } from '@/lib/services/mutations';
import { RichEditor } from './rich-editor';
import { ImageUploader } from './image-uploader';
import './form.css';

type Props = {
  title: string;
  filters: Filter[];
  initial?: Partial<ServiceFormInput>;
  /** 저장 Server Action. 성공하면 서버가 다른 화면으로 보낸다 */
  save: (input: ServiceFormInput) => Promise<SaveResult | void>;
  cancelHref: string;
};

const LIMITS = { name: 60, tagline: 100 };

/** 서비스 등록·수정 공통 폼 */
export function ServiceForm({ title, filters, initial = {}, save, cancelHref }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial.name ?? '');
  const [tagline, setTagline] = useState(initial.tagline ?? '');
  const [url, setUrl] = useState(initial.url ?? '');
  const [description, setDescription] = useState(initial.description ?? '');
  const [images, setImages] = useState<string[]>(initial.images ?? []);
  const [filterIds, setFilterIds] = useState<string[]>(initial.filterIds ?? []);
  const [errors, setErrors] = useState<ServiceErrors>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 1800);
  };

  const toggleFilter = (id: string) =>
    setFilterIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    start(async () => {
      try {
        const r = await save({ name, tagline, url, description, images, filterIds });
        if (r && !r.ok) {
          setErrors(r.errors);
          if (r.message) setBanner(r.message);
          const first = Object.keys(r.errors)[0];
          if (first) document.getElementById(`f-${first === 'description' ? 'desc' : first === 'images' ? 'img' : first}`)?.scrollIntoView({ block: 'center' });
          else window.scrollTo({ top: 0 });
        }
      } catch (err) {
        // redirect 는 예외로 전달되므로 그대로 다시 던진다
        if (err && typeof err === 'object' && 'digest' in err && String((err as { digest: unknown }).digest).startsWith('NEXT_REDIRECT')) throw err;
        setBanner('저장하지 못했습니다. 입력한 내용은 그대로 있으니 다시 시도해주세요.');
        window.scrollTo({ top: 0 });
      }
    });
  };

  const field = (key: 'name' | 'tagline' | 'url', label: string, value: string, set: (v: string) => void, opts: { max?: number; placeholder: string; type?: string }) => (
    <div className={`field${errors[key] ? ' invalid' : ''}`} id={`f-${key}`}>
      <label className="field-label" htmlFor={`in-${key}`}>
        <span>{label} *</span>
        {opts.max && <span className="count">{value.length}/{opts.max}</span>}
      </label>
      <input
        id={`in-${key}`}
        type={opts.type ?? 'text'}
        value={value}
        maxLength={opts.max}
        placeholder={opts.placeholder}
        aria-invalid={!!errors[key]}
        onChange={(e) => set(e.target.value)}
      />
      {errors[key] && <p className="err">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="form-wrap">
      <h1 className="serif serif-ko">{title}</h1>
      <p className="form-sub">AI로 만든 서비스를 동료들에게 소개해주세요. <b>*</b> 표시는 필수입니다.</p>
      {banner && <div className="banner-err" role="alert">{banner}</div>}
      <form onSubmit={submit} noValidate>
        {field('name', '서비스 이름', name, setName, { max: LIMITS.name, placeholder: '예: 회의록 요약봇' })}
        {field('tagline', '한 줄 소개', tagline, setTagline, { max: LIMITS.tagline, placeholder: '어떤 일을 해주는 서비스인지 한 문장으로' })}
        {field('url', '외부 링크', url, setUrl, { placeholder: 'https://', type: 'url' })}
        <RichEditor initial={initial.description ?? ''} onChange={setDescription} error={errors.description} onToast={showToast} />
        <ImageUploader images={images} onChange={setImages} error={errors.images} />
        <div className="field">
          <div className="field-label"><span>카테고리</span></div>
          {filters.length ? (
            <div className="chips" role="group" aria-label="카테고리">
              {filters.map((f) => (
                <button key={f.id} type="button" className={`chip${filterIds.includes(f.id) ? ' on' : ''}`} aria-pressed={filterIds.includes(f.id)} onClick={() => toggleFilter(f.id)}>
                  {f.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="note">아직 카테고리가 없습니다. 선택하지 않아도 저장할 수 있어요.</p>
          )}
        </div>
        <div className="form-actions">
          <button type="button" className="pill big" onClick={() => (window.history.length > 1 ? router.back() : router.push(cancelHref))}>취소</button>
          <button type="submit" className="pill fill big" disabled={pending}>{pending ? '저장 중…' : '저장'}</button>
        </div>
      </form>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
