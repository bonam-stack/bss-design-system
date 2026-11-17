// 새 컴포넌트의 첫 React 코드. Figma 속성(변형 · 불리언 · 글)으로 기본 틀을 만든다.
// 모양은 대충이고, 담당이 AI 채팅이나 직접 고쳐서 Figma에 맞춘다. AI 키가 있으면 Figma 레이어를 보고 Claude가 처음부터 만든다.
import type { PortalComp } from './portal/store';

const ident = (s: string) => {
  const w = s.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
  const id = w.map((x, i) => (i ? x[0].toUpperCase() + x.slice(1) : x[0].toLowerCase() + x.slice(1))).join('');
  return /^[a-zA-Z_]/.test(id) ? id : `p${id}`;
};
const q = (v: unknown) => JSON.stringify(v);

export function starterCode(name: string, c: Pick<PortalComp, 'name' | 'description' | 'props' | 'variants' | 'figma'>): string {
  const props = c.props.filter((p) => p.type !== 'instance').map((p) => ({ ...p, id: ident(p.name) }));
  const variant = props.filter((p) => p.type === 'variant');
  const bools = props.filter((p) => p.type === 'boolean');
  const texts = props.filter((p) => p.type === 'text');
  const stateP = variant.find((p) => /^state$/i.test(p.name));
  const lines = props.map((p) => {
    const t = p.type === 'variant' ? (p.options || [String(p.default)]).map(q).join(' | ') : p.type === 'boolean' ? 'boolean' : 'string';
    return `  ${p.id}?: ${t};`;
  });
  const defaults = props.map((p) => `${p.id} = ${q(p.type === 'boolean' ? p.default === true || p.default === 'true' : p.default ?? '')}`);
  const label = texts[0];
  const dis = stateP?.options?.find((o) => /disabled/i.test(o));
  const sel = stateP?.options?.find((o) => /selected|checked|active|on/i.test(o));
  // 누르는 부품(칩 · 탭 · 버튼 · 토글)이면 <button>, 아니면 상자 하나
  const clickable = /chip|tab|button|toggle|tag|segment/i.test(c.name) || !!stateP?.options?.some((o) => /hover|pressed|selected/i.test(o));
  const meta = Object.fromEntries(texts.map((t) => [t.id, String(t.default ?? '')]));
  return `// ${name}: ${c.description || c.name}
// Figma: ${c.figma?.url || c.name} · 변형 ${c.variants.length}개
// 포털에서 Figma 속성으로 만든 기본 틀입니다. 모양은 AI 채팅이나 직접 고쳐서 Figma에 맞추세요.
import type { CSSProperties, ReactNode } from 'react';
import { font, tok } from '../shared';

export interface ${name}Props {
${lines.join('\n')}
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}

export function ${name}({ ${[...defaults, 'children', 'onClick', 'className', 'style'].join(', ')} }: ${name}Props) {
${dis ? `  const disabled = ${stateP!.id} === ${q(dis)};\n` : '  const disabled = false;\n'}${sel ? `  const selected = ${stateP!.id} === ${q(sel)};\n` : '  const selected = false;\n'}  return (
${clickable ? `    <button
      type="button"
      className={className}
      disabled={disabled}
      aria-pressed={${sel ? 'selected' : 'undefined'}}
      onClick={onClick}
` : `    <div
      className={className}
      aria-disabled={disabled || undefined}
`}${variant.length ? `      data-variant={[${variant.map((p) => p.id).join(', ')}].join(' · ')}\n` : ''}      style={{
        display: 'inline-flex',
${clickable ? `        alignItems: 'center',
        gap: 4,
` : ''}${clickable ? `        height: 32,
        padding: '0 12px',
        borderRadius: tok('radius-full', 999),` : `        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 8,
        minWidth: 280,
        padding: 20,
        borderRadius: tok('radius-lg', 12),`}
        border: \`1px solid \${selected ? tok('color-border-brand', '#3617CE') : tok('color-border-neutral', '#C4CAD4')}\`,
        background: selected ? tok('color-bg-brand-weak', '#EEEBFC') : tok('color-bg-neutral-default', '#FFFFFF'),
        color: disabled ? tok('color-fg-neutral-disabled', '#A9B0BB') : selected ? tok('color-fg-brand', '#3617CE') : tok('color-fg-neutral', '#1A1D23'),
${clickable ? `        cursor: disabled ? 'not-allowed' : 'pointer',` : `        opacity: disabled ? 0.5 : 1,`}
        ...font('label', 14, 500),
        ...style,
      }}
    >
      ${label ? `{children ?? ${label.id}}` : `{children ?? ${q(c.name)}}`}
${bools.map((b) => `      {${b.id} ? <span aria-hidden="true">${/remove|close|clear/i.test(b.name) ? '×' : '•'}</span> : null}`).join('\n')}
    </${clickable ? 'button' : 'div'}>
  );
}

${name}.meta = { texts: ${q(meta)} };
`;
}
