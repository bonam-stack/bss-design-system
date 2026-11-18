// 패턴 가이드 (patterns/<key>/pattern.json): 개요, 번호 붙은 Anatomy, 유형 표, 간격 Spec. 모두 Figma 가이드에서 옮겼다.
// 예시 입력은 Figma에서 읽은 크기 · 색을 쓰고, Spec의 간격 표시는 그려진 예시를 재서 붙인다.
// 그래서 Figma와 다른 간격은 다른 숫자로 보인다.
import { useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { PNode, Pattern } from '../data';
import { Lines, TocInline } from '../ui';

const Svg = ({ svg, className }: { svg?: string; className?: string }) => <span className={className} dangerouslySetInnerHTML={{ __html: svg || '' }} />;

function Node({ n, marks, icons }: { n: PNode; marks: boolean; icons: Record<string, string> }): ReactNode {
  const mark = marks && n.mark ? (
    <span className="pt-mark" style={{ left: `${n.markX}px` }} aria-hidden="true">
      <span>{n.mark}</span>
    </span>
  ) : null;
  const size: CSSProperties = { ...(n.w ? { width: `${n.w}px` } : {}), ...(n.h ? { height: `${n.h}px` } : {}) };
  const id = n.id ? { 'data-pt': n.id } : {};
  if (n.row)
    return (
      <div className="pt-row" {...id} style={{ gap: `${n.gap}px` }}>
        {mark}
        {n.row.map((c, i) => (
          <Node key={i} n={c} marks={marks} icons={icons} />
        ))}
      </div>
    );
  if (n.label)
    return (
      <span className="pt-label" {...id}>
        {mark}
        {n.label}
      </span>
    );
  if (n.select)
    return (
      <span className="pt-box pt-select" {...id} style={size}>
        {mark}
        <span className="pt-value">{n.select}</span>
        <Svg svg={icons.chevron} className="pt-ico" />
      </span>
    );
  if (n.date)
    return (
      <span className="pt-box pt-date" {...id} style={size}>
        {mark}
        <span className="pt-value pt-num">{n.date}</span>
        <Svg svg={icons.calendar} className="pt-cal" />
      </span>
    );
  if (n.field)
    return (
      <span className="pt-box pt-field" {...id} style={size}>
        {mark}
        <span className="pt-value">{n.field}</span>
      </span>
    );
  if (n.button)
    return (
      <span className="pt-button" {...id}>
        {mark}
        {n.button}
      </span>
    );
  if (n.divider)
    return (
      <span className="pt-divider" {...id} style={{ height: `${n.divider}px` }}>
        {mark}
      </span>
    );
  return null;
}

const Figure = ({ p, k, marks }: { p: Pattern; k: string; marks: boolean }) => (
  <div className="pt-figure">
    <Node n={p.figures[k].layout} marks={marks} icons={p.iconSvg} />
  </div>
);

interface Gap {
  style: CSSProperties;
  width: number;
  center?: CSSProperties;
}

/** 간격 표시: 간격 위에 반투명 칸, 아래에 너비 (Figma Spec처럼). 잰 위치로 놓으므로 글꼴이 들어온 뒤와 창 크기가 바뀔 때 다시 그린다 */
function SpecCanvas({ p, i }: { p: Pattern; i: number }) {
  const ex = p.spec.examples[i];
  const ref = useRef<HTMLElement>(null);
  const [gaps, setGaps] = useState<Gap[]>([]);
  useLayoutEffect(() => {
    let alive = true;
    const draw = () => {
      const canvas = ref.current;
      if (!canvas || !alive) return;
      const box = canvas.getBoundingClientRect();
      const at = (id: string) => canvas.querySelector(`[data-pt="${id}"]`)!.getBoundingClientRect();
      const out: Gap[] = [];
      const off: string[] = [];
      for (const g of ex.gaps) {
        const a = at(g.from);
        const b = at(g.to);
        const top = Math.min(a.top, b.top);
        const bottom = Math.max(a.bottom, b.bottom);
        const width = Math.round(b.left - a.right);
        if (width !== g.value) off.push(`${g.from}→${g.to}: ${width}px (Figma ${g.value}px)`);
        const c = g.center ? at(g.center) : null;
        out.push({
          style: { left: `${a.right - box.left}px`, top: `${top - box.top}px`, width: `${b.left - a.right}px`, height: `${bottom - top}px` },
          width,
          center: c ? { left: `${c.left + c.width / 2 - box.left}px`, top: `${c.top - box.top}px` } : undefined,
        });
      }
      if (off.length) console.warn('pattern spacing differs from Figma', off);
      setGaps(out);
    };
    draw();
    document.fonts.ready.then(draw);
    window.addEventListener('resize', draw);
    return () => {
      alive = false;
      window.removeEventListener('resize', draw);
    };
  }, [p, ex]);
  return (
    <section className="pt-canvas pt-spec" ref={ref}>
      <Figure p={p} k={ex.figure} marks={false} />
      {gaps.map((g, j) => (
        <span key={j}>
          <span className="pt-gap" style={g.style}>
            <span className="pt-gap-num">{g.width}</span>
          </span>
          {g.center ? (
            <span className="pt-center" style={g.center}>
              <span>Center</span>
            </span>
          ) : null}
        </span>
      ))}
    </section>
  );
}

export function PatternPage({ p }: { p: Pattern }) {
  const a = p.anatomy;
  const t = p.types;
  const s = p.spec;
  return (
    <>
      <p className="eyebrow">Components · 사용 예시</p>
      <h1>{p.name}</h1>
      <TocInline />
      <h2>Overview</h2>
      <p className="lead pt-text">
        <Lines text={p.overview} />
      </p>

      <h2>{a.title}</h2>
      <p className="note">{a.lead}</p>
      <div className="pt-canvases">
        {a.examples.map((e) => (
          <section key={e.figure} className="pt-canvas pt-marked">
            <h3>{e.title}</h3>
            <Figure p={p} k={e.figure} marks />
          </section>
        ))}
      </div>
      <ol className="pt-parts">
        {a.parts.map((x) => (
          <li key={x.n}>
            <span className="pt-num-badge">{x.n}</span>
            <strong>{x.name}</strong>
            <span>{x.desc}</span>
          </li>
        ))}
      </ol>

      <h2>{t.title}</h2>
      <p className="note">{t.lead}</p>
      <div className="table-wrap">
        <table className="data pt-types">
          <thead>
            <tr>
              <th>Type</th>
              <th>Example</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {t.rows.map((r) => (
              <tr key={r.name}>
                <td className="pt-type">{r.name}</td>
                <td>
                  <div className="pt-example">
                    <Figure p={p} k={r.figure} marks={false} />
                  </div>
                </td>
                <td className="pt-text">
                  <Lines text={r.desc} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>{s.title}</h2>
      <p className="note">{s.lead}</p>
      <div className="pt-canvases">
        {s.examples.map((_, i) => (
          <SpecCanvas key={i} p={p} i={i} />
        ))}
      </div>
    </>
  );
}
