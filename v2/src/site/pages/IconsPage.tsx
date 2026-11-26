// 아이콘: Figma ❖ Icon Resource의 마스터 컴포넌트. 검색 · 크기별 보기 · SVG 복사.
import { useEffect, useRef, useState } from 'react';
import { icons } from '../data';
import type { IconEntry } from '../data';
import { CopyBtn, Head, copy, figmaUrl } from '../ui';
import { repoSources } from '../live';
import * as P from '../portal/store';

/** 코드 이름 (svg/line/calendar.svg → line/calendar): 컴포넌트는 <Icon name="line/calendar">로 쓴다 */
const codeName = (i: IconEntry) => (i.file || '').replace(/^svg\//, '').replace(/\.svg$/, '');
/** 이 아이콘을 코드에서 쓰는 컴포넌트 (src/ds/components/*.tsx 원본에서 찾는다) */
const usersOf = (i: IconEntry) => {
  const n = codeName(i);
  if (!n) return [];
  return Object.entries(repoSources)
    .filter(([, src]) => src.includes(`'${n}'`) || src.includes(`"${n}"`))
    .map(([f]) => f.replace(/^.*\/(\w+)\.tsx$/, '$1'));
};
const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const SIZES = [16, 20, 24, 32, 48];
const sized = (svg: string, px: number) => svg.replace(/width="\d+" height="\d+"/, `width="${px}" height="${px}"`);

export function IconsPage() {
  const [q, setQ] = useState('');
  const [current, setCurrent] = useState<IconEntry | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (current && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [current]);
  const query = q.trim().toLowerCase();
  const match = (i: IconEntry) => !query || `${i.name} ${i.group} ${i.style} ${i.figmaName}`.toLowerCase().includes(query);
  const sections = icons.sections
    .map((sec) => {
      const inSec = icons.icons.filter((i) => i.style === sec.style && match(i));
      if (!inSec.length) return null;
      return (
        <div key={sec.style}>
          <h2>
            {sec.title} <span className="count">{inSec.length}</span>
          </h2>
          <p className="note">{sec.description}</p>
          {sec.groups.map((g) => {
            const items = inSec.filter((i) => i.group === g);
            if (!items.length) return null;
            return (
              <div key={g}>
                <h3>
                  {g} <span className="count">{items.length}</span>
                </h3>
                <div className="icon-grid">
                  {items.map((i) => (
                    <button
                      key={i.key}
                      className={`tile${i.onDark ? ' on-dark' : ''}`}
                      title={i.figmaName}
                      onClick={(e) => {
                        opener.current = e.currentTarget;
                        setCurrent(i);
                      }}
                    >
                      <span className="glyph" aria-hidden="true" dangerouslySetInnerHTML={{ __html: i.svg || '' }} />
                      <span className="tile-name">{i.name}</span>
                      {usersOf(i).length ? <span className="tile-use" title={`쓰는 컴포넌트: ${usersOf(i).join(' · ')}`}>{usersOf(i).length}</span> : null}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    })
    .filter(Boolean);
  return (
    <>
      <Head
        eyebrow="Foundations"
        title="아이콘"
        extra={
          <>
            <p className="lead">
              DS 라이브러리 ❖ Icon의 마스터 컴포넌트 {icons.icons.length}개입니다. 컴포넌트 코드는 <code>&lt;Icon name="line/…"&gt;</code>로 이 파일을 그대로 쓰고, 타일의 숫자는 그 아이콘을 쓰는 컴포넌트 수입니다. Line·Filled는 <code>currentColor</code>라 글자색을 따라가고, Colored는 원본 색을 유지합니다. 기준 크기는 {icons.size}×{icons.size}입니다.
            </p>
            <div className="meta">
              <a className="chip" href={figmaUrl(icons.figma.fileKey, icons.figma.nodeId)} target="_blank" rel="noopener">
                Figma DS 라이브러리 ❖ Icon ↗
              </a>
            </div>
          </>
        }
      />
      <div className="toolbar">
        <input type="search" className="search" placeholder="이름·그룹 검색 (예: arrow, Status)" aria-label="아이콘 검색" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div id="iconList">{sections.length ? sections : <p className="note">찾는 아이콘이 없습니다. 다른 이름이나 그룹으로 검색해 보세요.</p>}</div>
      <dialog
        id="iconDialog"
        aria-labelledby="iconName"
        ref={dialog}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        onClose={() => {
          setCurrent(null);
          opener.current?.focus();
        }}
      >
        {current ? (
          <>
            <div className="d-head">
              <div>
                <h2 id="iconName">{current.name}</h2>
                <div className="count">
                  {current.style} · {current.group}
                </div>
              </div>
              <button className="icon-btn" aria-label="닫기" onClick={() => dialog.current?.close()}>
                ✕
              </button>
            </div>
            <div className="d-body">
              <div className={`sizes${current.onDark ? ' on-dark' : ''}`}>
                {SIZES.map((s) => (
                  <figure key={s}>
                    <span dangerouslySetInnerHTML={{ __html: sized(current.svg || '', s) }} />
                    <figcaption>{s}px</figcaption>
                  </figure>
                ))}
              </div>
              <dl className="dl">
                <dt>코드</dt>
                <dd>
                  <CopyBtn value={`<Icon name="${codeName(current)}" />`} />
                </dd>
                <dt>쓰는 컴포넌트</dt>
                <dd>
                  {usersOf(current).length
                    ? usersOf(current).map((n, k) => {
                        const it = P.itemByKey(kebab(n));
                        return (
                          <span key={n}>
                            {k ? ' · ' : ''}
                            {it ? <a href={`#${it.code}`}>{n}</a> : n}
                          </span>
                        );
                      })
                    : '아직 쓰는 컴포넌트 없음'}
                </dd>
                <dt>파일</dt>
                <dd>{current.file ? <CopyBtn value={`icons/${current.file}`} /> : '디자인 포털에서 배포 (SVG는 포털이 보관)'}</dd>
                <dt>Figma 레이어</dt>
                <dd className="mono">{current.figmaName}</dd>
                <dt>노드 ID</dt>
                <dd>
                  <a className="mono" href={figmaUrl(icons.figma.fileKey, current.nodeId)} target="_blank" rel="noopener">
                    {current.nodeId} ↗
                  </a>
                </dd>
                <dt>컴포넌트 키</dt>
                <dd>
                  <CopyBtn value={current.key} />
                </dd>
                <dt>색</dt>
                <dd>{current.style === 'colored' ? '원본 색 고정' : 'currentColor (글자색을 따름)'}</dd>
                {current.description ? (
                  <>
                    <dt>설명</dt>
                    <dd>{current.description}</dd>
                  </>
                ) : null}
              </dl>
            </div>
            <div className="d-foot">
              <button className="btn" onClick={() => copy(current.svg || '')}>
                SVG 복사
              </button>
              <button className="btn" onClick={() => copy(current.name)}>
                이름 복사
              </button>
            </div>
          </>
        ) : null}
      </dialog>
    </>
  );
}
