// UX 패턴 가이드 문서 한 편을 포털 형식으로 (#g-<id>): Overview(언제 쓰나) → 구성요소 · 동작 · 규격 → Do / Don't → 포털에서 이어지는 것.
// 놓이는 섹션(Foundations · Patterns · Blocks · Components · 홈 · UX 거버넌스)은 문서마다 정해져 있다.
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Head } from '../ui';
import { guideDoc, guideRoute, guideSource, inline, loadGuideDoc } from '../guide';
import type { Block, GuideDoc, Place } from '../guide';

export const PLACE_LABEL: Record<Place, string> = { start: 'UX 거버넌스 · 원칙', foundations: 'UX 거버넌스 · 화면 구조', patterns: 'UX 거버넌스 · UX 가이드라인', blocks: 'UX 거버넌스 · 블록 정책', components: 'UI 거버넌스 · Components', governance: 'UX 거버넌스' };

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

/** 문서 본문 (Overview · 절 · Do/Don't). 문서 페이지와 컴포넌트 페이지 안에서 같이 쓴다 */
export function GuideBody({ d, level = 2 }: { d: GuideDoc; level?: 2 | 3 }) {
  // 다른 페이지 안에 넣을 때는 목차에 잡히지 않게 한 단계 아래 제목으로
  const H = level === 2 ? 'h2' : 'h4';
  const S = level === 2 ? 'h3' : 'h5';
  return (
    <>
          {d.overview.length || d.when.use.length || d.when.avoid.length ? (
            <>
              <H>Overview</H>
              {d.overview.map((b, i) => <BlockView key={i} b={b} />)}
              <When {...d.when} />
            </>
          ) : null}
          {d.sections.map((s, i) => (
            <div key={i}>
              <H>{s.title}</H>
              {s.blocks.map((b, j) => <BlockView key={j} b={b} />)}
            </div>
          ))}
          {d.do.length || d.dont.length ? (
            <>
              <H>Do / Don't</H>
              <div className="gd-dodont">
                {d.do.length ? (
                  <section className="gd-do">
                    <S>Do · 이렇게 합니다</S>
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
                    <S>Don't · 이건 피합니다</S>
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
    </>
  );
}

/** 컴포넌트 · 블록 페이지 안의 UX 패턴 가이드: 문서마다 접어 두고 펼치면 본문을 그 자리에서 보여 준다 */
export function GuideEmbed({ docs }: { docs: string[] }) {
  // 컴포넌트 가이드는 본문을 펼쳐 보이고, 이 컴포넌트를 쓰는 패턴 · 모듈 문서는 링크로
  const own = docs.filter((id) => guideDoc(id)?.place === 'components');
  const rel = docs.filter((id) => guideDoc(id) && guideDoc(id)!.place !== 'components');
  if (!own.length && !rel.length) return null;
  return (
    <>
      <h3>UX 패턴 가이드</h3>
      {own.map((id) => (
        <EmbedDoc key={id} id={id} />
      ))}
      {rel.length ? (
        <p className="note">
          이 컴포넌트를 쓰는 가이드{' '}
          {rel.map((id, i) => (
            <span key={id}>
              {i ? ' · ' : ''}
              <a href={`#${guideRoute(id)}`}>{guideDoc(id)!.title}</a>
            </span>
          ))}
        </p>
      ) : null}
    </>
  );
}

function EmbedDoc({ id }: { id: string }) {
  const meta = guideDoc(id);
  const [open, setOpen] = useState(false);
  const [d, setD] = useState<GuideDoc | null>(null);
  useEffect(() => {
    if (open && !d) loadGuideDoc(id).then(setD, () => {});
  }, [open, d, id]);
  if (!meta) return null;
  return (
    <details className="gx-embed" onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}>
      <summary>
        <b>{meta.title}</b>
        {meta.lead ? <span className="muted"> · {meta.lead}</span> : null}
      </summary>
      <div className="gx-embed-body">
        {d ? <GuideBody d={d} level={3} /> : <p className="note">불러오는 중…</p>}
        <p className="note">
          <a href={`#${guideRoute(id)}`}>이 가이드만 따로 보기 →</a>
        </p>
      </div>
    </details>
  );
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
          <GuideBody d={d} />
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
