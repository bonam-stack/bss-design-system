// 디자인 토큰 → CSS 변수. tokens/variables.json(Figma 변수에서 읽은 값)을 :root에 깐다.
// 컴포넌트는 tok('토큰-이름', Figma 값)으로 이 변수를 읽고, 변수가 없을 때만 적어 둔 값을 쓴다.
import variables from '../../tokens/variables.json';

const V = variables as { tokens: Record<string, { value?: string }> };

export const tokenCss = () =>
  `:root{${Object.entries(V.tokens)
    .filter(([, t]) => t.value)
    .map(([k, t]) => `${k}:${t.value}`)
    .join(';')}}`;

/** 문서에 한 번 깐다 (이미 있으면 바꾼다) */
export function installTokens(doc: Document = document) {
  let el = doc.getElementById('ds-tokens') as HTMLStyleElement | null;
  if (!el) {
    el = doc.createElement('style');
    el.id = 'ds-tokens';
    doc.head.prepend(el);
  }
  el.textContent = tokenCss();
}
