'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { richText, safeHref, sanitizeRich } from '@/lib/richtext/sanitize';

/** 작성 가이드 질문 [소제목, 설명] */
export const WRITE_GUIDE: [string, string][] = [
  ['왜 만들었나요?', '어떤 불편함에서 시작했는지'],
  ['무엇을 해주나요?', '주요 기능 2~3가지'],
  ['어떻게 쓰나요?', '처음 써보는 사람을 위한 순서'],
  ['주의할 점이 있나요?', '한계, 개인정보·보안 관련 안내'],
];

const LIMIT = 3000;

type Props = { initial: string; onChange: (html: string) => void; error?: string; onToast: (msg: string) => void };

type Cmd = 'h3' | 'bold' | 'italic' | 'insertUnorderedList' | 'insertOrderedList' | 'quote' | 'link';

/** 상세 설명 에디터: 기본 서식 7가지 + 작성 가이드 */
export function RichEditor({ initial, onChange, error, onToast }: Props) {
  const ed = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [count, setCount] = useState(() => richText(initial).length);
  const [empty, setEmpty] = useState(() => !richText(initial));
  const [active, setActive] = useState<Partial<Record<Cmd, boolean>>>({});
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  useEffect(() => {
    if (ed.current) ed.current.innerHTML = sanitizeRich(initial);
    document.execCommand('defaultParagraphSeparator', false, 'p');
    // 처음 한 번만 채운다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const blockOf = (tag: string): Element | null => {
    let n: Node | null = window.getSelection()?.anchorNode ?? null;
    while (n && n !== ed.current) {
      if (n.nodeName === tag) return n as Element;
      n = n.parentNode;
    }
    return null;
  };

  const refresh = useCallback(() => {
    const st = (c: string) => {
      try {
        return document.queryCommandState(c);
      } catch {
        return false;
      }
    };
    setActive({
      bold: st('bold'), italic: st('italic'),
      insertUnorderedList: st('insertUnorderedList'), insertOrderedList: st('insertOrderedList'),
      h3: !!blockOf('H3'), quote: !!blockOf('BLOCKQUOTE'), link: !!blockOf('A'),
    });
  }, []);

  const sync = useCallback(() => {
    const el = ed.current;
    if (!el) return;
    const html = sanitizeRich(el.innerHTML);
    const n = richText(el.innerHTML).length;
    setCount(n);
    setEmpty(!n && !el.querySelector('h3,li,blockquote'));
    onChange(html);
    refresh();
  }, [onChange, refresh]);

  const run = (c: Cmd) => {
    const el = ed.current;
    if (!el) return;
    el.focus();
    if (c === 'h3') document.execCommand('formatBlock', false, blockOf('H3') ? 'p' : 'h3');
    else if (c === 'quote') document.execCommand('formatBlock', false, blockOf('BLOCKQUOTE') ? 'p' : 'blockquote');
    else if (c === 'link') {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount || sel.isCollapsed) {
        onToast('링크로 만들 글자를 먼저 선택해주세요');
        return;
      }
      savedRange.current = sel.getRangeAt(0).cloneRange();
      setLinkUrl('');
      setLinkOpen(true);
      return;
    } else document.execCommand(c);
    sync();
  };

  const applyLink = () => {
    const href = safeHref(linkUrl.trim());
    if (!href) {
      onToast('http:// 또는 https://로 시작하는 주소를 넣어주세요');
      return;
    }
    const sel = window.getSelection();
    sel?.removeAllRanges();
    if (savedRange.current) sel?.addRange(savedRange.current);
    document.execCommand('createLink', false, href);
    setLinkOpen(false);
    sync();
  };

  /** 없는 가이드 질문만 끝에 덧붙이고, 비어 있는 첫 답 칸에 커서를 둔다 */
  const insertGuide = () => {
    const el = ed.current;
    if (!el) return;
    const have = new Set([...el.querySelectorAll('h3')].map((h) => h.textContent?.trim()));
    const missing = WRITE_GUIDE.filter(([q]) => !have.has(q));
    if (missing.length) {
      const html = missing.map(([q]) => `<h3>${q}</h3><p><br></p>`).join('');
      if (richText(el.innerHTML)) el.insertAdjacentHTML('beforeend', html);
      else el.innerHTML = html;
    } else {
      onToast('이미 작성 가이드가 들어가 있어요');
    }
    const qs = new Set(WRITE_GUIDE.map((g) => g[0]));
    const emptyAnswer = [...el.querySelectorAll('h3')]
      .filter((h) => qs.has(h.textContent?.trim() ?? ''))
      .map((h) => h.nextElementSibling)
      .find((n) => n && n.tagName !== 'H3' && !n.textContent?.trim());
    const target = emptyAnswer ?? el.lastElementChild ?? el;
    const r = document.createRange();
    r.selectNodeContents(target);
    r.collapse(!!emptyAnswer);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(r);
    el.focus();
    sync();
  };

  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    const safe = html
      ? sanitizeRich(html)
      : text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!).replace(/\n/g, '<br>');
    document.execCommand('insertHTML', false, safe);
    sync();
  };

  const btn = (c: Cmd, label: React.ReactNode, title: string) => (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={!!active[c]}
      className={active[c] ? 'on' : ''}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => run(c)}
    >
      {label}
    </button>
  );

  const over = count > LIMIT;
  return (
    <div className={`field${error || over ? ' invalid' : ''}`} id="f-desc">
      <label className="field-label" htmlFor="rte">상세 설명<span className="count" data-testid="desc-count">{count}/{LIMIT}</span></label>
      <div className="rte">
        <div className="rte-bar" role="toolbar" aria-label="서식">
          {btn('h3', '제목', '소제목')}
          <span className="sep" />
          {btn('bold', <b>B</b>, '굵게')}
          {btn('italic', <i className="ital">I</i>, '기울임')}
          <span className="sep" />
          {btn('insertUnorderedList', <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="7" r="1.6" /><circle cx="5" cy="12" r="1.6" /><circle cx="5" cy="17" r="1.6" /><rect x="9" y="6" width="11" height="2" rx="1" /><rect x="9" y="11" width="11" height="2" rx="1" /><rect x="9" y="16" width="11" height="2" rx="1" /></svg>, '글머리 목록')}
          {btn('insertOrderedList', <svg viewBox="0 0 24 24" fill="currentColor"><text x="2.5" y="9" fontSize="6.5" fontWeight="700">1</text><text x="2.5" y="19" fontSize="6.5" fontWeight="700">2</text><rect x="9" y="6" width="11" height="2" rx="1" /><rect x="9" y="16" width="11" height="2" rx="1" /></svg>, '번호 목록')}
          {btn('quote', <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" /></svg>, '인용')}
          {btn('link', <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round"><path d="M10 14a4 4 0 005.66 0l3-3a4 4 0 00-5.66-5.66l-1 1" /><path d="M14 10a4 4 0 00-5.66 0l-3 3a4 4 0 005.66 5.66l1-1" /></svg>, '링크')}
          <button type="button" className="guide-btn" title="질문 4개를 소제목으로 넣어요" onMouseDown={(e) => e.preventDefault()} onClick={insertGuide}>＋ 작성 가이드 넣기</button>
        </div>
        {linkOpen && (
          <div className="link-pop">
            <input
              type="url"
              value={linkUrl}
              placeholder="https:// 로 시작하는 주소"
              aria-label="링크 주소"
              autoFocus
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyLink())}
            />
            <button type="button" className="pill fill" onClick={applyLink}>넣기</button>
            <button type="button" className="pill" onClick={() => { setLinkOpen(false); ed.current?.focus(); }}>취소</button>
          </div>
        )}
        <div className={`rte-wrap${empty ? ' is-empty' : ''}`}>
          <div className="rte-hint" aria-hidden="true">
            <b>이런 질문에 답하듯 써보세요</b>
            <ul>{WRITE_GUIDE.map(([q, d]) => <li key={q}>{q} {d}</li>)}</ul>
          </div>
          <div
            ref={ed}
            id="rte"
            className="rte-body rich"
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label="상세 설명"
            onInput={sync}
            onKeyUp={refresh}
            onMouseUp={refresh}
            onPaste={onPaste}
          />
        </div>
      </div>
      {(error || over) && <p className="err">{error ?? '상세 설명은 3000자까지 쓸 수 있어요'}</p>}
    </div>
  );
}
