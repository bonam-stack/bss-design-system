// UX 가이드: NEXT BSS UX Pattern Guide (caumuse 릴리스) 문서 82개. 목록 · 검색 (#ux) 과 문서 페이지 (#ux-<id>).
// 문서 페이지에는 이 문서를 근거로 쓰는 포털 규칙 · 레이아웃 · 컴포넌트를 함께 보여 준다.
import { useEffect, useMemo, useState } from 'react';
import * as P from '../portal/store';
import { components } from '../data';
import { Head, RuleList } from '../ui';
import { UX_FOR_COMPONENT, groupOf, loadAllUx, loadUx, renderUx, shortSection, ux, uxDoc, uxRoute } from '../uxguide';
import type { UxDoc } from '../uxguide';

const sections = () => [...new Set(ux.docs.map((d) => d.section))];

export function UxIndexPage() {
  const [q, setQ] = useState('');
  const [texts, setTexts] = useState<Map<string, string> | null>(null);
  const query = q.trim().toLowerCase();
  // 본문 검색은 처음 검색할 때 문서를 모두 불러온다
  useEffect(() => {
    if (!query || texts) return;
    loadAllUx().then((L) => setTexts(new Map(L.map((x) => [x.doc.id, x.text.toLowerCase()]))));
  }, [query, texts]);
  const hit = (d: UxDoc) => !query || `${d.title} ${d.path.join(' ')}`.toLowerCase().includes(query) || !!texts?.get(d.id)?.includes(query);
  const found = ux.docs.filter(hit);
  return (
    <>
      <Head
        eyebrow="UX 가이드"
        title="NEXT BSS UX Pattern Guide"
        lead={`NEXT BSS 화면을 같은 기준으로 설계하기 위한 UX 패턴 가이드입니다. 원칙에서 UI 요소까지, 넓은 기준부터 작은 단위 순으로 ${ux.docs.length}개 문서가 있습니다.`}
        extra={
          <p className="ux-src">
            출처{' '}
            <a href={ux.source} target="_blank" rel="noopener">
              {ux.source.replace(/^https?:\/\//, '')}
            </a>{' '}
            · {ux.generated} 추출 · 화면 예시 목업은 빼고 글 · 표 · 규칙만 옮겼습니다
          </p>
        }
      />
      <div className="toolbar">
        <input type="search" className="search" placeholder="제목 · 본문 검색 (예: 페이지네이션, 마스킹)" aria-label="UX 가이드 검색" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {query ? <p className="note">{texts ? `${found.length}개 문서` : '본문을 불러오는 중…'}</p> : null}
      {sections().map((s) => {
        const L = found.filter((d) => d.section === s);
        if (!L.length) return null;
        return (
          <div key={s}>
            <h2>
              {s} <span className="count">{L.length}</span>
            </h2>
            <div className="cards">
              {L.map((d) => (
                <a key={d.id} className="card" href={`#${uxRoute(d.id)}`}>
                  {groupOf(d) ? <span className="card-eb">{groupOf(d)}</span> : null}
                  <b>{d.title}</b>
                  <span className="mono">{d.id}</span>
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

export function UxDocPage({ id }: { id: string }) {
  const d = uxDoc(id)!;
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    setText(null);
    loadUx(id).then((t) => alive && setText(t), (e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [id]);
  const html = useMemo(() => (text ? renderUx(text) : ''), [text]);
  const rules = P.rules().filter((r) => r.doc === id);
  const items = P.items().filter((i) => i.guide === id);
  const comps = components.filter((c) => (UX_FOR_COMPONENT[c.data.key] || []).includes(id) || c.guide?.policy?.source?.id === id || (c.guide?.policy?.related || []).some((r) => r.file === `${id}.html`));
  const codeOf = (key: string) => P.itemByKey(key)?.code || `c-${key}`;
  const linked = rules.length || items.length || comps.length;
  return (
    <>
      <Head
        eyebrow={`UX 가이드 · ${shortSection(d.section)}${groupOf(d) ? ` › ${groupOf(d)}` : ''}`}
        title={d.title}
        extra={
          <p className="ux-src">
            원본{' '}
            <a href={`${ux.source}${d.file}`} target="_blank" rel="noopener">
              {d.file}
            </a>{' '}
            · {ux.generated} 추출
          </p>
        }
      />
      {error ? <p className="error">문서를 불러오지 못했어요: {error}</p> : text === null ? <p className="note">불러오는 중…</p> : <div className="ux-doc" dangerouslySetInnerHTML={{ __html: html }} />}
      {linked ? (
        <section className="ux-links">
          <h2>BSS 디자인 시스템에서</h2>
          {comps.length ? (
            <>
              <h3>이 문서를 따르는 컴포넌트</h3>
              <p className="chips">
                {comps.map((c) => (
                  <a key={c.data.key} className="chip" href={`#${codeOf(c.data.key)}`}>
                    {c.data.name}
                  </a>
                ))}
              </p>
            </>
          ) : null}
          {items.length ? (
            <>
              <h3>이 문서가 근거인 레이아웃 · 부품</h3>
              <p className="chips">
                {items.map((i) => (
                  <a key={i.code} className="chip" href={`#${i.code}`}>
                    {i.name}
                  </a>
                ))}
              </p>
            </>
          ) : null}
          {rules.length ? (
            <>
              <h3>이 문서에서 온 UX표준가이드 규칙</h3>
              <RuleList list={rules} />
            </>
          ) : null}
        </section>
      ) : null}
    </>
  );
}
