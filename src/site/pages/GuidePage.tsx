// UX 패턴 가이드 문서 한 편을 포털 형식으로 (#g-<id>): Overview(언제 쓰나) → 구성요소 · 동작 · 규격 → Do / Don't → 포털에서 이어지는 것.
// 놓이는 섹션(Foundations · Patterns · Blocks · Components · 시작하기 · UX 거버넌스)은 문서마다 정해져 있다.
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Head } from '../ui';
import { guideDoc, guideRoute, guideSource, inline, loadGuideDoc } from '../guide';
import type { Block, GuideDoc, Place } from '../guide';

export const PLACE_LABEL: Record<Place, string> = { start: '시작하기', foundations: 'Foundations', patterns: 'Patterns', blocks: 'Blocks · 모듈', components: 'Components · 컴포넌트 가이드', governance: 'UX 거버넌스' };

const Html = ({ as: Tag = 'span', text, className }: { as?: 'span' | 'p' | 'li' | 'td' | 'th'; text: string; className?: string }) => <Tag className={className} dangerouslySetInnerHTML={{ __html: inline(text) }} />;

function When({ use, avoid, useTitle, avoidTitle }: { use?: string[]; avoid?: { text: string; alt?: string }[]; useTitle?: string; avoidTitle?: string }) {
  if (!(use || []).length && !(avoid || []).length) return null;
  return (
    <div className="gd-when">
      {(use || []).length ? (
        <section className="gd-when-col gd-use">
          <h4>{useTitle || '이럴 때 사용합니다'}</h4>
          <ul>{use!.map((t, i) => <Html as="li" key={i} text={t} />)}</ul>
        </section>
      ) : null}
      {(avoid || []).length ? (
        <section className="gd-when-col gd-avoid">
          <h4>{avoidTitle || '다른 것을 사용합니다'}</h4>
          <ul>
            {avoid!.map((x, i) => (
              <li key={i}>
                <Html text={x.text} />
                {x.alt ? (
                  <>
                    {' '}
                    <span className="gd-alt">
                      → <Html text={x.alt} />
                    </span>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function BlockView({ b }: { b: Block }): ReactNode {
  switch (b.type) {
    case 'text':
      return <Html as="p" className="pt-text" text={b.text} />;
    case 'note':
      return (
        <div className="gx-note">
          <b>{b.title.replace(/\?$/, '')}</b>
          <Html as="p" text={b.text} />
        </div>
      );
    case 'list':
      return <ul className="gx-list">{b.items.map((t, i) => <Html as="li" key={i} text={t} />)}</ul>;
    case 'parts':
      return (
        <ol className="pt-parts">
          {b.items.map((x, i) => (
            <li key={i}>
              <span className="pt-num-badge">{x.n}</span>
              {x.name ? <strong dangerouslySetInnerHTML={{ __html: inline(x.name) }} /> : null}
              <Html text={x.desc} className={x.name ? undefined : 'gx-wide'} />
            </li>
          ))}
        </ol>
      );
    case 'table':
      return (
        <div className="table-wrap">
          <table className="data gx-table">
            <thead>
              <tr>{b.head.map((h, i) => <Html as="th" key={i} text={h} />)}</tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i}>{r.map((c, j) => <Html as="td" key={j} text={c} />)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'cards':
      return (
        <div className="gx-cards">
          {b.items.map((c, i) => (
            <section key={i} className="gx-card">
              {c.tag ? <span className="gx-tag">{c.tag}</span> : null}
              <h4 dangerouslySetInnerHTML={{ __html: inline(c.title) }} />
              {c.body.map((t, j) => (
                <Html as="p" key={j} text={t} />
              ))}
              {c.chip ? <span className="gx-chip">{c.chip}</span> : null}
            </section>
          ))}
        </div>
      );
    case 'h':
      return <h3>{b.text}</h3>;
    case 'h4':
      return <h4>{b.text}</h4>;
    case 'when':
      return <When use={b.use} avoid={b.avoid} useTitle={b.use ? b.title : undefined} avoidTitle={b.avoid ? b.title : undefined} />;
  }
}

export function GuidePage({ id }: { id: string }) {
  const meta = guideDoc(id)!;
  const [d, setD] = useState<GuideDoc | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    loadGuideDoc(id).then((x) => alive && setD(x), (e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [id]);
  const related = meta.links.map(guideDoc).filter(Boolean) as NonNullable<ReturnType<typeof guideDoc>>[];
  return (
    <>
      <Head
        eyebrow={`${PLACE_LABEL[meta.place]}${meta.group ? ` · ${meta.group}` : ''}`}
        title={meta.title}
        extra={
          <>
            {d?.lead ? <Html as="p" className="lead" text={d.lead} /> : null}
            <p className="gd-source">
              출처 UX 패턴 가이드 {guideSource.release} ·{' '}
              <a href={`${guideSource.url}pages/${id}.html`} target="_blank" rel="noopener">
                {meta.section} › {meta.title}
              </a>
            </p>
          </>
        }
      />
      {error ? <p className="error">문서를 불러오지 못했어요: {error}</p> : null}
      {d ? (
        <>
          {d.overview.length || d.when.use.length || d.when.avoid.length ? (
            <>
              <h2>Overview</h2>
              {d.overview.map((b, i) => <BlockView key={i} b={b} />)}
              <When {...d.when} />
            </>
          ) : null}
          {d.sections.map((s, i) => (
            <div key={i}>
              <h2>{s.title}</h2>
              {s.blocks.map((b, j) => <BlockView key={j} b={b} />)}
            </div>
          ))}
          {d.do.length || d.dont.length ? (
            <>
              <h2>Do / Don't</h2>
              <div className="gd-dodont">
                {d.do.length ? (
                  <section className="gd-do">
                    <h3>Do · 이렇게 합니다</h3>
                    <ul>
                      {d.do.map((t, i) => (
                        <li key={i}>
                          <Html text={t} />
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
                {d.dont.length ? (
                  <section className="gd-dont">
                    <h3>Don't · 이건 피합니다</h3>
                    <ul>
                      {d.dont.map((t, i) => (
                        <li key={i}>
                          <Html text={t} />
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </div>
              <p className="note">
                Do · Don't는 <a href="#rules">UX 거버넌스 규칙</a>에도 권장 · 금지로 올라가 있습니다.
              </p>
            </>
          ) : null}
          {related.length ? (
            <>
              <h2>함께 보기</h2>
              <p className="chips gx-chips">
                {related.map((r) => (
                  <a key={r.id} className="chip" href={`#${guideRoute(r.id)}`}>
                    {r.title}
                  </a>
                ))}
              </p>
            </>
          ) : null}
        </>
      ) : !error ? (
        <p className="note">불러오는 중…</p>
      ) : null}
    </>
  );
}
