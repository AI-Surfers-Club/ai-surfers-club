// 상세 설명 HTML 정리. 서버·브라우저 어디서나 돌도록 DOM 없이 문자열로 처리한다.
// 남기는 것: p, h3, strong, em, ul, ol, li, blockquote, br, a(http/https만).

const KEEP: Record<string, string> = {
  p: 'p', div: 'p',
  h3: 'h3', h1: 'h3', h2: 'h3', h4: 'h3', h5: 'h3', h6: 'h3',
  strong: 'strong', b: 'strong',
  em: 'em', i: 'em',
  ul: 'ul', ol: 'ol', li: 'li',
  blockquote: 'blockquote',
  a: 'a',
  br: 'br',
};
/** 안의 내용까지 통째로 버리는 태그 */
const DROP_WITH_CONTENT = new Set(['script', 'style', 'iframe', 'object', 'embed', 'noscript', 'template', 'svg', 'math', 'head', 'title', 'textarea', 'select']);

const TAG_RE = /<!--[\s\S]*?-->|<\/?([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*)\s*\/?>/g;

const decodeEntities = (s: string) =>
  s
    .replace(/&#x([0-9a-f]+);?/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);?/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&');

const escapeText = (s: string) => s.replace(/&(?![a-zA-Z]+;|#\d+;|#x[0-9a-fA-F]+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** a 태그의 href: http(s) 주소만 통과 */
export function safeHref(raw: string | null | undefined): string | null {
  if (!raw) return null;
  // 제어문자·공백을 지운 뒤 판단 (java\nscript: 같은 우회 차단)
  const v = decodeEntities(raw).replace(/[\u0000- \u007f-\u009f]/g, '');
  return /^https?:\/\/[^\s]+$/i.test(v) ? v : null;
}

function hrefOf(attrs: string): string | null {
  const m = /(?:^|\s)href\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/i.exec(attrs);
  return m ? safeHref(m[2] ?? m[3] ?? m[4]) : null;
}

/** 허용 목록 밖의 태그·속성을 모두 버리고, 링크는 새 탭으로 열리게 정리한 HTML */
export function sanitizeRich(html: string | null | undefined): string {
  if (!html) return '';
  const out: string[] = [];
  const open: string[] = [];
  let dropDepth = 0;
  let dropTag = '';
  let last = 0;

  const text = (s: string) => {
    if (dropDepth === 0 && s) out.push(escapeText(s));
  };
  // 'a-skip' 은 href가 안전하지 않아 태그 없이 글자만 남긴 링크 자리
  const closeTag = (t: string) => {
    if (t !== 'a-skip') out.push(`</${t}>`);
  };

  for (const m of html.matchAll(TAG_RE)) {
    text(html.slice(last, m.index));
    last = m.index! + m[0].length;
    const whole = m[0];
    if (whole.startsWith('<!--')) continue;
    const name = m[1].toLowerCase();
    const closing = whole.startsWith('</');

    if (dropDepth > 0) {
      if (name === dropTag) dropDepth += closing ? -1 : 1;
      continue;
    }
    if (DROP_WITH_CONTENT.has(name)) {
      if (!closing && !whole.endsWith('/>')) {
        dropDepth = 1;
        dropTag = name;
      }
      continue;
    }
    const tag = KEEP[name];
    if (!tag) continue; // 모르는 태그는 버리고 안의 글자만 남긴다

    if (tag === 'br') {
      if (!closing) out.push('<br>');
      continue;
    }
    if (closing) {
      const i = tag === 'a' ? Math.max(open.lastIndexOf('a'), open.lastIndexOf('a-skip')) : open.lastIndexOf(tag);
      if (i === -1) continue;
      while (open.length > i) closeTag(open.pop()!);
      continue;
    }
    if (tag === 'a') {
      const href = hrefOf(m[2] ?? '');
      if (!href) {
        open.push('a-skip');
        continue;
      }
      out.push(`<a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">`);
      open.push('a');
      continue;
    }
    out.push(`<${tag}>`);
    open.push(tag);
  }
  text(html.slice(last));
  while (open.length) closeTag(open.pop()!);
  return out
    .join('')
    .replace(/<(p|h3|strong|em|blockquote)>\s*<\/\1>/g, '')
    .trim();
}

/** 서식을 뺀 글자만 (검색·글자 수 세기용) */
export function richText(html: string | null | undefined): string {
  if (!html) return '';
  return decodeEntities(
    html
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|h[1-6]|li|blockquote|div)>/gi, '\n')
      .replace(/<[^>]*>/g, ''),
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*/g, '\n')
    .trim();
}
