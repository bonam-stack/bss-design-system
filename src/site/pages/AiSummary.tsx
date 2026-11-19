// 컴포넌트 핵심 요약: AI(SB Studio 생성 에이전트 · 코드 도우미)가 이 페이지에서 가장 먼저 읽을 부분.
// 사람이 보는 요약과 같은 내용을 마크다운(복사) · JSON(<script type="application/json">)으로도 둔다.
import * as P from '../portal/store';
import type { Policy } from '../data';
import { guideSource, docsFor } from '../guide';
import { Editable, copy, useText, human } from '../ui';
import { usePortal } from '../portal/ctx';

interface PropLite {
  name: string;
  type: string;
  default?: unknown;
  options?: string[];
}
const txt = (t: string | { text: string }) => (typeof t === 'string' ? t : t.text);
/** 첫 문장만 (요약용) */
const first = (s: string) => (String(s).match(/^.+?[.다](?=\s|$)/) || [String(s)])[0];
const plain = (s: string) => String(s || '').replace(/\*\*|`/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

/** 편집할 수 있는 목록: 원래 항목 + 포털에서 더한 항목(sum.<이름>.<번호>). 편집 중이면 빈 칸 하나를 더 보여 준다 */
function useList(editable: boolean, name: string, base: string[]) {
  const get = useText();
  const { textEdit } = usePortal();
  if (!editable) return { items: base, slots: base.map((_, i) => i) };
  const items: string[] = [];
  const slots: number[] = [];
  let i = 0;
  for (; i < base.length || get(`sum.${name}.${i}`, '') ; i++) {
    const v = get(`sum.${name}.${i}`, base[i] ?? '');
    if (v.trim()) items.push(v);
    slots.push(i);
  }
  if (textEdit) slots.push(i);
  return { items, slots };
}

export function AiSummary({ k, name, codeName, meaning, props, policy, editable = false, extra }: { k: string; name: string; codeName: string; meaning: string; props: PropLite[]; policy?: Policy; editable?: boolean; extra?: { label: string; text: string }[] }) {
  const item = P.itemByKey(k) || P.item(k);
  const { textEdit } = usePortal();
  const get = useText();
  const useL = useList(editable, 'use', (policy?.when?.use || []).map(plain));
  const doL = useList(editable, 'do', (policy?.do || []).map(txt).map(plain));
  const dontL = useList(editable, 'dont', (policy?.dont || []).map(txt).map(plain));
  meaning = editable ? get('sum.meaning', meaning) : meaning;
  // 요약은 짧게: AI가 "여기에 써도 되나 · 꼭 지킬 것"만 빨리 판단하도록. 자세한 기준은 아래 Guidelines
  const short = !(editable && textEdit);
  const use = short ? useL.items.slice(0, 2) : useL.items;
  const avoid = (policy?.when?.avoid || []).slice(0, 2);
  const rules = (policy?.rules || []).slice(0, 3);
  // 기준과 겹치는 권장 · 금지(앞 6글자가 같은 것)는 요약에서 뺀다
  const head = (t: string) => plain(t).replace(/\s/g, '').slice(0, 6);
  const inRules = new Set(rules.map((r) => head(r.desc)));
  const fresh = (L: string[]) => L.filter((t) => !inRules.has(head(t)));
  const dos = short ? fresh(doL.items).slice(0, 2) : doL.items;
  const donts = short ? fresh(dontL.items).slice(0, 2) : dontL.items;
  /** 편집 모드에서는 입력칸, 아니면 글 */
  const list = (L: ReturnType<typeof useList>, nm: string, label: string) =>
    editable && textEdit ? (
      <ul>
        {L.slots.map((i) => (
          <li key={i}>
            <Editable path={`sum.${nm}.${i}`} label={`${label} ${i + 1}`} value={get(`sum.${nm}.${i}`, (nm === 'use' ? (policy?.when?.use || []).map(plain) : nm === 'do' ? (policy?.do || []).map(txt).map(plain) : (policy?.dont || []).map(txt).map(plain))[i] ?? '')} placeholder={`${label} 추가`} />
          </li>
        ))}
      </ul>
    ) : (
      <ul>{(nm === 'use' ? use : nm === 'do' ? dos : donts).map((u, i) => <li key={i}>{human(u)}</li>)}</ul>
    );
  const shown = props.filter((p) => p.type !== 'instance');
  const guides = docsFor(item?.code || '').filter((d) => d.place === 'components').map((d) => d.title);
  const version = `포털 v${P.version()} · UX 패턴 가이드 ${guideSource.release}`;
  const usage = `import { ${codeName} } from './ds';`;
  const data = {
    component: name,
    code: codeName,
    catalog: item?.code,
    group: item?.group,
    meaning,
    use,
    avoid: avoid.map((a) => ({ case: plain(a.text), instead: plain(a.alt) })),
    rules: rules.map((r) => ({ name: r.name, rule: first(plain(r.desc)) })),
    do: dos.map(plain),
    ...Object.fromEntries((extra || []).map((x) => [x.label, x.text])),
    dont: donts.map(plain),
    props: shown.map((p) => ({ name: p.name, type: p.type, default: p.default, options: p.options })),
    guides,
    basis: version,
  };
  const md = [
    `# ${name} (${codeName})`,
    meaning,
    use.length ? `\n## 이럴 때 씁니다\n${use.map((u) => `- ${plain(u)}`).join('\n')}` : '',
    avoid.length ? `\n## 이럴 때는 다른 것을 씁니다\n${avoid.map((a) => `- ${plain(a.text)} → ${plain(a.alt)}`).join('\n')}` : '',
    rules.length ? `\n## 꼭 지킬 기준\n${rules.map((r) => `- ${r.name}: ${first(plain(r.desc))}`).join('\n')}` : '',
    dos.length ? `\n## 이렇게 합니다\n${dos.map((d) => `- ${plain(d)}`).join('\n')}` : '',
    (extra || []).map((x) => `\n## ${x.label}\n${x.text}`).join(''),
    donts.length ? `\n## 하지 않습니다\n${donts.map((d) => `- ${plain(d)}`).join('\n')}` : '',
    shown.length ? `\n## 속성\n${shown.map((p) => `- ${p.name} (${p.type})${p.options ? `: ${p.options.join(' | ')}` : ''}${p.default !== undefined && p.default !== null && p.default !== '' ? ` · 기본 ${String(p.default)}` : ''}`).join('\n')}` : '',
    `\n## 코드\n${usage}`,
    `\n기준: ${version}`,
  ]
    .filter(Boolean)
    .join('\n');
  return (
    <section className="ai-sum" id="summary" aria-labelledby="summary-h" data-ai-summary={k}>
      <div className="ai-sum-head">
        <h2 id="summary-h">핵심 요약</h2>
        <span className="ai-sum-tag">AI가 먼저 읽는 부분</span>
        <button type="button" className="btn2 sm" onClick={(e) => copy(md, e.currentTarget)}>
          요약 복사 (AI용)
        </button>
      </div>
      <dl className="ai-sum-grid">
        <dt>무엇</dt>
        <dd>
          <b>{name}</b> <code>{codeName}</code> ·{' '}
          {editable ? <Editable path="sum.meaning" label="무엇 (한 줄 정의)" value={meaning} /> : meaning}
        </dd>
        {(extra || []).map((x) => (
          <span key={x.label} style={{ display: 'contents' }}>
            <dt>{x.label}</dt>
            <dd>{x.text}</dd>
          </span>
        ))}
        {use.length || (editable && textEdit) ? (
          <>
            <dt>쓸 때</dt>
            <dd>{list(useL, 'use', '쓸 때')}</dd>
          </>
        ) : null}
        {avoid.length ? (
          <>
            <dt>대신 쓸 것</dt>
            <dd>
              <ul>
                {avoid.map((a, i) => (
                  <li key={i}>
                    {plain(a.text)} → <b>{plain(a.alt)}</b>
                  </li>
                ))}
              </ul>
            </dd>
          </>
        ) : null}
        {rules.length ? (
          <>
            <dt>꼭 지킬 기준</dt>
            <dd>
              <ul>
                {rules.map((r, i) => (
                  <li key={i}>
                    <b>{r.name}</b> {first(plain(r.desc))}
                  </li>
                ))}
              </ul>
            </dd>
          </>
        ) : null}
        {dos.length || (editable && textEdit) ? (
          <>
            <dt>이렇게 함</dt>
            <dd>{list(doL, 'do', '이렇게 함')}</dd>
          </>
        ) : null}
        {donts.length || (editable && textEdit) ? (
          <>
            <dt>하지 않음</dt>
            <dd>{list(dontL, 'dont', '하지 않음')}</dd>
          </>
        ) : null}
        {shown.length ? (
          <>
            <dt>속성</dt>
            <dd className="ai-sum-props">
              {/* 고르는 속성(변형)만 선택지와 함께, 켜고 끄는 속성은 이름만 한 줄로 */}
              {shown.filter((p) => p.options).map((p) => (
                <span key={p.name}>
                  <code>{p.name}</code>
                  <span className="muted"> {p.options!.join(' | ')}</span>
                </span>
              ))}
              {shown.some((p) => !p.options) ? (
                <span>
                  <span className="muted">그 밖에 </span>
                  {shown.filter((p) => !p.options).map((p) => p.name).join(' · ')}
                </span>
              ) : null}
            </dd>
          </>
        ) : null}
        <dt>기준</dt>
        <dd className="muted">
          {version}
          {guides.length ? ` · 사용 가이드: ${guides.join(' · ')}` : ''}
        </dd>
      </dl>
      <script type="application/json" id={`ai-summary-${k}`} dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
    </section>
  );
}
