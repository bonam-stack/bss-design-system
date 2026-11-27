// DS 명세로 만든 컴포넌트 페이지: Figma 레이어 데이터(component.json의 variants[].layer)가 없는 컴포넌트.
// 미리보기 · 속성은 DS 구조 명세(변형 · 불리언 · 글 속성), 토큰은 DS 컴포넌트 명세(component-specs.json), 가이드는 BSS Design Guideline v2.0.
import { useMemo, useState } from 'react';
import type { SiteComponent } from '../data';
import * as P from '../portal/store';
import { usePortal } from '../portal/ctx';
import { fileOf, liveComponent, repoSource } from '../live';
import { Head, Table, TextEditToggle, TextScope } from '../ui';
import specs from '../../../tokens/ds/component-specs.json';
import { AiSummary } from './AiSummary';
import { Preview } from './PortalCompPage';
import { CodeBlock, GuideIntro, PolicySection } from './ComponentPage';
import { CompChecks, CompRules, CompUsage, applyGuide } from './compPortal';

type Spec = { colors?: Record<string, Record<string, Record<string, Record<string, string>>>>; sizeTokens?: Record<string, Record<string, Record<string, string>>>; common?: Record<string, Record<string, string>>; textStyles?: Record<string, { size?: string | null; target: string; style: string }> };
const SPECS = (specs as unknown as { components: Record<string, Spec> }).components;

/** 행의 속성(Figma 이름 → 값)을 그 컴포넌트 속성으로 그려 본다 */
function Sample({ sc, props }: { sc: SiteComponent; props: Record<string, string | boolean> }) {
  const C = sc.Component;
  if (!C) return null;
  const texts = C.meta?.texts || {};
  return (
    <span {...{ inert: '' }} style={{ display: 'inline-flex', pointerEvents: 'none' }}>
      <C {...texts} {...props} />
    </span>
  );
}

/** DS 컴포넌트 명세의 변수 대응표를 한 줄씩 */
function tokenRows(names: string[]) {
  const rows: { spec: string; where: string; target: string; prop: string; v: string }[] = [];
  for (const n of names) {
    const s = SPECS[n];
    if (!s) continue;
    for (const [variant, states] of Object.entries(s.colors || {}))
      for (const [state, targets] of Object.entries(states))
        for (const [target, props] of Object.entries(targets)) for (const [prop, v] of Object.entries(props)) rows.push({ spec: n, where: [variant === '(없음)' ? '' : variant, state].filter(Boolean).join(' · '), target, prop, v });
    for (const [size, targets] of Object.entries(s.sizeTokens || {}))
      for (const [target, props] of Object.entries(targets)) for (const [prop, v] of Object.entries(props)) if (!prop.startsWith('font-') && !/font/.test(prop)) rows.push({ spec: n, where: size, target, prop, v });
    for (const [target, props] of Object.entries(s.common || {})) for (const [prop, v] of Object.entries(props)) if (!/font/.test(prop)) rows.push({ spec: n, where: '공통', target, prop, v });
  }
  return rows;
}

export function SpecComponentPage({ sc }: { sc: SiteComponent }) {
  const base = sc.data as SiteComponent['data'] & { ds?: { specs?: string[] } };
  const key = base.key;
  const { textEdit } = usePortal();
  const g = useMemo(() => applyGuide(key, sc.guide, textEdit), [key, sc.guide, textEdit, P.revision()]); // eslint-disable-line react-hooks/exhaustive-deps
  const item = P.itemByKey(key);
  const published = P.publishedCode(key);
  const source = published ?? repoSource(sc.name);
  // 게시본 · 쓰는 컴포넌트(Button 등)의 게시본까지 반영한 컴포넌트
  const C = liveComponent(sc.name) || sc.Component;
  const [tab, setTab] = useState<'preview' | 'code'>('preview');
  const [q, setQ] = useState('');
  const specNames = base.ds?.specs || [];
  const toks = tokenRows(specNames).filter((r) => !q || `${r.where} ${r.target} ${r.prop} ${r.v}`.includes(q));
  const textStyles = specNames.flatMap((n) => Object.values(SPECS[n]?.textStyles || {}).map((t) => ({ ...t, spec: n })));
  const props = base.props.map((p) => ({ name: p.name, type: p.type, default: p.default, options: p.options }));
  return (
    <TextScope.Provider value={{ key, name: base.name }}>
      <Head
        eyebrow="Components"
        title={item?.name || base.name}
        lead={item?.meaning || base.description}
        extra={
          <>
            <TextEditToggle />
            <CompChecks c={base} hasGuide={!!sc.guide} />
          </>
        }
      />
      <AiSummary k={key} name={item?.name || base.name} codeName={sc.name} meaning={item?.meaning || base.description || ''} props={props} policy={g?.policy} />
      {C ? (
        <section className="sb" id="sb">
          <div className="sb-tabs" role="tablist">
            {(['preview', 'code'] as const).map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>
                {t === 'preview' ? '미리보기' : '코드'}
              </button>
            ))}
          </div>
          {tab === 'preview' ? (
            <Preview key={String(C)} C={C} c={{ props }} />
          ) : (
            <div className="sb-body sb-code">
              <CodeBlock label="사용 예" text={`import { ${sc.name} } from './ds';\n\n<${sc.name} />`} />
              <CodeBlock label={`${fileOf(sc.name)}${published ? ' (포털에 게시된 코드)' : ''}`} text={source} />
            </div>
          )}
        </section>
      ) : (
        <div className="sb-ph">
          <span>React 코드가 아직 없습니다</span>
        </div>
      )}
      {g?.anatomy ? (
        <>
          <h2 id="anatomy" className="sec-n">Anatomy</h2>
          <p className="note">{g.anatomy.lead}</p>
          <ol className="pt-parts">
            {g.anatomy.parts.map((x) => (
              <li key={x.n}>
                <span className="pt-num-badge">{x.n}</span>
                <strong>{x.name}</strong>
                <span>{x.desc}</span>
              </li>
            ))}
          </ol>
        </>
      ) : null}
      <h2 id="props" className="sec-n">Properties</h2>
      {g?.states ? (
        <>
          <h3>{g.states.title}</h3>
          {g.states.lead ? <p className="note">{g.states.lead}</p> : null}
          <Table
            cols={['상태', '예시', '설명']}
            rows={g.states.rows.map((r, i) => (
              <tr key={i}>
                <td className="nowrap">{r.name}</td>
                <td>{C ? <Sample sc={{ ...sc, Component: C }} props={r.props} /> : null}</td>
                <td>{r.desc}</td>
              </tr>
            ))}
          />
        </>
      ) : null}
      {(g?.variants?.groups || []).map((gr, j) => (
        <div key={j}>
          <h3>{gr.title}</h3>
          {gr.lead ? <p className="note">{gr.lead}</p> : null}
          <Table
            cols={['변형', '예시', '설명']}
            rows={gr.rows.map((r, i) => (
              <tr key={i}>
                <td className="nowrap">{r.name}</td>
                <td>{C ? <Sample sc={{ ...sc, Component: C }} props={r.props} /> : null}</td>
                <td>{r.desc}</td>
              </tr>
            ))}
          />
        </div>
      ))}
      <h3>
        속성 목록 <span className="count">{base.props.length}</span>
      </h3>
      <Table
        cols={['이름', '타입', '기본값', '옵션']}
        rows={base.props.map((p) => (
          <tr key={p.name}>
            <td className="mono">{p.name}</td>
            <td>{p.type}</td>
            <td className="mono">{JSON.stringify(p.default)}</td>
            <td>{p.options ? p.options.join(' · ') : '-'}</td>
          </tr>
        ))}
      />
      {g ? (
        <>
          <h2 id="guidelines" className="sec-n">Guidelines</h2>
          {g.overview ? <GuideIntro g={g} c={base} /> : null}
          {g.policy ? <PolicySection pl={g.policy} /> : null}
          {(g.notes || []).length ? (
            <ul className="gd-notes">
              {g.notes!.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}
      <CompRules k={key} />
      {/* 04 개발 정보 → 05 Usage (BSS DS 포털 사이트맵 6-1) */}
      {specNames.length ? (
        <>
          <h2 id="dev" className="sec-n">개발 정보</h2>
          <h3 id="tokens">연결된 토큰</h3>
          <p className="note">
            DS 컴포넌트 명세({specNames.join(' · ')})에서 변형 · 크기 · 상태마다 어떤 CSS 속성이 어떤 토큰을 쓰는지입니다. 글자는 글자 스타일 토큰을 씁니다:{' '}
            {[...new Set(textStyles.map((t) => `${t.size ? `${t.size} ` : ''}${t.target} ${t.style}`))].join(' · ')}
          </p>
          <div className="toolbar">
            <input type="search" className="search" placeholder="변형 · 상태 · 대상 · 속성 · 토큰 검색" aria-label="토큰 검색" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Table
            cols={['변형 · 크기 · 상태', '대상', 'CSS 속성', '토큰']}
            rows={toks.slice(0, 300).map((r, i) => (
              <tr key={i}>
                <td className="nowrap">{r.where}</td>
                <td className="mono">{r.target}</td>
                <td className="mono">{r.prop}</td>
                <td className="mono">{r.v.replace(/^var\(|\)$/g, '')}</td>
              </tr>
            ))}
          />
        </>
      ) : null}
      <CompUsage k={key} />
    </TextScope.Provider>
  );
}
