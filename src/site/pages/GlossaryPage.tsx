// 용어사전 (#glossary): UX 패턴 가이드가 화면 요소를 부르는 표준 이름. SB Studio 검증 규칙의 용어 대조가 같은 사전을 쓴다.
import { useState } from 'react';
import { Head } from '../ui';
import { glossary, guideDoc, guideRoute, guideSource, inline } from '../guide';

export function GlossaryPage() {
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const hit = (t: (typeof glossary)[number]) => !query || `${t.term} ${t.extra} ${t.en} ${t.abbr} ${t.meaning}`.toLowerCase().includes(query);
  const sections = [...new Set(glossary.map((t) => t.section))];
  const found = glossary.filter(hit);
  return (
    <>
      <Head
        eyebrow="UX 거버넌스"
        title="용어사전"
        lead="화면 요소를 부르는 표준 이름입니다. 같은 것을 팀마다 다르게 부르면 설계서와 구현이 어긋나므로, 부르는 이름을 먼저 맞춥니다. SB Studio의 용어 대조(검증 규칙 R-05)가 이 사전을 씁니다."
        extra={<p className="gd-source">출처 UX 패턴 가이드 {guideSource.release} · 용어 {glossary.length}개</p>}
      />
      <div className="toolbar">
        <input type="search" className="search" placeholder="대표어 · 영문 · 약어 · 뜻 검색 (예: 콘텍스트 바, CTXT_BAR)" aria-label="용어 검색" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {query ? <p className="note">{found.length}개</p> : null}
      {sections.map((s) => {
        const L = found.filter((t) => t.section === s);
        if (!L.length) return null;
        const grouped = L.some((t) => t.group);
        return (
          <div key={s}>
            <h2>
              {s} <span className="count">{L.length}</span>
            </h2>
            <div className="table-wrap">
              <table className="data gx-table">
                <thead>
                  <tr>
                    {grouped ? <th>분류</th> : null}
                    <th>대표어</th>
                    <th>영문 · 약어</th>
                    <th>뜻</th>
                    <th>관련 문서</th>
                  </tr>
                </thead>
                <tbody>
                  {L.map((t, i) => (
                    <tr key={i}>
                      {grouped ? <td className="nowrap">{t.group}</td> : null}
                      <td>
                        <b>{t.term}</b>
                        {t.extra ? <span className="gx-sub">{t.extra}</span> : null}
                      </td>
                      <td>
                        {t.en}
                        {t.abbr ? <code className="gx-sub">{t.abbr}</code> : null}
                      </td>
                      <td dangerouslySetInnerHTML={{ __html: inline(t.meaning) }} />
                      <td>
                        {t.docs.map((id) => guideDoc(id)).filter(Boolean).map((d, j) => (
                          <span key={d!.id}>
                            {j ? ' · ' : ''}
                            <a href={`#${guideRoute(d!.id)}`}>{d!.title}</a>
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </>
  );
}
