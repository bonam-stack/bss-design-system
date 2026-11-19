// 핵심 요약: 게시된 정책 · 규칙 · 속성에서 자동으로 만든다(편집하지 않음). 기준이 바뀌어 게시되면 요약도 따라 바뀐다.
// AI가 이 페이지에서 가장 먼저 읽고 빠르게 판단하는 부분이다.
import * as P from '../portal/store';
import type { Policy } from '../data';
import { guideSource, docsFor } from '../guide';
import { human } from '../ui';
import { makeSummary } from '../summary';

const txt = (t: string | { text: string }) => (typeof t === 'string' ? t : t.text);

export function AiSummary({ k, name, codeName, meaning, props, policy }: { k: string; name: string; codeName: string; meaning: string; props: { name: string; type: string; default?: unknown; options?: string[] }[]; policy?: Policy }) {
  const item = P.itemByKey(k) || P.item(k);
  const s = makeSummary({
    kind: item?.kind === 'block' ? 'block' : 'comp',
    name,
    codeName,
    catalog: item?.code,
    group: item?.group,
    meaning,
    use: policy?.when?.use,
    avoid: policy?.when?.avoid,
    rules: policy?.rules,
    do: (policy?.do || []).map(txt),
    dont: (policy?.dont || []).map(txt),
    props,
    basis: `포털 v${P.version()} · UX 패턴 가이드 ${guideSource.release}`,
  });
  const guides = docsFor(item?.code || '').filter((d) => d.place === 'components' || d.place === 'blocks').map((d) => d.title);
  return (
    <section className="ai-sum" id="summary" aria-labelledby="summary-h" data-ai-summary={item?.code || k}>
      <div className="ai-sum-head">
        <h2 id="summary-h">핵심 요약</h2>
        <span className="ai-sum-tag">AI가 먼저 읽는 부분 · 자동 생성</span>
      </div>
      <dl className="ai-sum-grid">
        <dt>무엇</dt>
        <dd>
          <b>{s.name}</b> <code>{s.code}</code> · {s.what}
        </dd>
        {s.use.length ? (
          <>
            <dt>쓸 때</dt>
            <dd>
              <ul>{s.use.map((u, i) => <li key={i}>{human(u)}</li>)}</ul>
            </dd>
          </>
        ) : null}
        {s.rules.length ? (
          <>
            <dt>꼭 지킬 기준</dt>
            <dd>
              <ul>
                {s.rules.map((r, i) => (
                  <li key={i}>
                    <b>{r.name}</b> {human(r.rule)}
                  </li>
                ))}
              </ul>
            </dd>
          </>
        ) : null}
        <dt>기준</dt>
        <dd className="muted">
          {s.basis}
          {guides.length ? ` · 사용 가이드: ${guides.join(' · ')}` : ''}
        </dd>
      </dl>
    </section>
  );
}
