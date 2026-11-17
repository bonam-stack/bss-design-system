// 컴포넌트 페이지 (SEED 문서형): 미리보기 → Anatomy → Properties → Guidelines → Usage → 개발 정보.
// 미리보기 · 예시는 모두 src/ds의 생성된 React 컴포넌트로 그린다 (component.json이 원본이라 가이드와 코드가 어긋나지 않는다).
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { SiteComponent, Guide, GuideRow } from '../data';
import { patterns } from '../data';
import * as P from '../portal/store';
import type { ComponentData, Layer, PropValues } from '../../ds/types';
import { analyze, defaultSelection, defaultValues, findVariant, fixSelection, optionsFor, propsFor, usedProps, variantOf } from '../../ds/core/variants';
import { buildTree, isRenderable } from '../../ds/core/tree';
import { toHtmlCss } from '../../ds/core/html';
import { CopyBtn, Lines, TocInline, copy, figmaUrl } from '../ui';
import { CompChecks, CompEditor, CompRules, CompUsage, GuideEditor, applyGuide, compRules } from './compPortal';

type Sel = Record<string, string>;

/** 변형 속성 · 값 → 생성된 React 컴포넌트의 속성 (안쪽 인스턴스 속성은 overrides) */
function viewProps(c: ComponentData, sel: Sel, values: PropValues) {
  const props: Record<string, unknown> = { ...sel };
  const overrides: PropValues = {};
  const top = new Map(c.props.map((p) => [p.figmaName, p]));
  for (const [fig, v] of Object.entries(values)) {
    const p = top.get(fig);
    if (p) props[p.name] = v;
    else overrides[fig] = v;
  }
  if (Object.keys(overrides).length) props.overrides = overrides;
  return props;
}

const jsxValue = (v: unknown) => (typeof v === 'boolean' ? `{${v}}` : typeof v === 'string' && !/["\n]/.test(v) ? `"${v}"` : `{${JSON.stringify(v)}}`);

/** 이 미리보기를 그대로 쓰는 JSX (기본값과 다른 속성만) */
function reactCode(name: string, c: ComponentData, sel: Sel, values: PropValues) {
  const def = { ...defaultSelection(c) };
  const defV = defaultValues(c);
  const attrs: string[] = [];
  for (const p of c.props) {
    if (p.type === 'variant' && sel[p.name] !== def[p.name]) attrs.push(`${p.name}=${jsxValue(sel[p.name])}`);
    if ((p.type === 'boolean' || p.type === 'text') && p.figmaName in values && values[p.figmaName] !== defV[p.figmaName]) attrs.push(`${p.name}=${jsxValue(values[p.figmaName])}`);
  }
  const top = new Set(c.props.map((p) => p.figmaName));
  const ov = Object.entries(values).filter(([k]) => !top.has(k));
  if (ov.length) attrs.push(`overrides={${JSON.stringify(Object.fromEntries(ov))}}`);
  const open = attrs.length > 2 ? `<${name}\n${attrs.map((a) => `  ${a}`).join('\n')}\n/>` : `<${name}${attrs.length ? ` ${attrs.join(' ')}` : ''} />`;
  return `import { ${name} } from './ds'; // 이 저장소의 src/ds\n\n${open}`;
}

export function ComponentPage({ sc }: { sc: SiteComponent }) {
  const base = sc.data;
  const c = (P.comp(base.key) as ComponentData & { figmaSyncedAt?: string }) || base;
  const View = sc.View;
  const g = useMemo(() => applyGuide(base.key, sc.guide), [base.key, sc.guide, P.revision()]); // eslint-disable-line react-hooks/exhaustive-deps
  const ok = isRenderable(base);
  const a = analyze(base);
  const [sel, setSel] = useState<Sel>(() => fixSelection(base, defaultSelection(base)));
  const [values, setValues] = useState<PropValues>(() => defaultValues(base));
  const [tab, setTab] = useState<'preview' | 'code'>('preview');
  const sbRef = useRef<HTMLElement>(null);
  const update = (next: Sel) => setSel(fixSelection(base, next));
  const showVariant = (props: Sel) => {
    update({ ...sel, ...props });
    setTab('code');
    sbRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };
  const ru = compRules(base.key);
  const itemMeaning = P.itemByKey(base.key)?.meaning;
  const name = View.displayName || base.name;

  return (
    <>
      <p className="eyebrow">Components</p>
      <h1>{base.name}</h1>
      <p className="lead">{itemMeaning || c.description || ''}</p>
      <CompChecks c={c} hasGuide={!!sc.guide} />
      <TocInline />
      <PatternLinks k={base.key} />
      <CompEditor c={c} />
      {ok ? (
        <>
          <section className="sb" id="sb" ref={sbRef}>
            <div className="sb-tabs" role="tablist">
              {(['preview', 'code'] as const).map((t) => (
                <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>
                  {t === 'preview' ? '미리보기' : '코드'}
                </button>
              ))}
            </div>
            {tab === 'preview' ? (
              <div className="sb-body">
                <div className="sb-canvas">
                  <div className="sb-stage">
                    <View {...viewProps(base, sel, values)} onChange={(v: string) => a.selectProp && update({ ...sel, [a.selectProp.name]: v })} />
                  </div>
                </div>
                <Controls c={base} sel={sel} values={values} onSel={update} onValues={setValues} />
              </div>
            ) : (
              <CodePanel name={name} c={base} icons={View.icons} sel={sel} values={values} />
            )}
          </section>
          {a.stateProp || a.selectProp ? <p className="note">마우스를 올리거나 눌러 보세요. 키보드 Tab으로 포커스할 수도 있어요.</p> : null}
        </>
      ) : (
        <p className="error">이 컴포넌트는 예전 형식 JSON이라 미리보기를 그릴 수 없어요. Figma 링크로 다시 읽으면 나타나요.</p>
      )}
      <div id="guideBody">
        {g?.anatomy ? (
          <>
            <h2>Anatomy</h2>
            <AnatomySection sc={sc} an={g.anatomy} />
          </>
        ) : null}
        <h2>Properties</h2>
        {g?.states ? <StatesSection sc={sc} st={g.states} onCode={showVariant} /> : null}
        {g?.variants ? <VariantsSection sc={sc} vr={g.variants} onCode={showVariant} /> : null}
        {ok && !g?.states ? <Cases sc={sc} sel={sel} /> : null}
        {g?.spec ? <SpecSection sc={sc} sp={g.spec} /> : null}
        <h3>
          속성 목록 <span className="count">{base.props.length}</span>
        </h3>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>이름</th>
                <th>타입</th>
                <th>기본값</th>
                <th>옵션</th>
              </tr>
            </thead>
            <tbody>
              {base.props.map((p) => (
                <tr key={p.name}>
                  <td className="mono">{p.name}</td>
                  <td>{p.type}</td>
                  <td className="mono">{JSON.stringify(p.default)}</td>
                  <td>{p.options ? p.options.map((o, i) => <span key={o}>{i ? ' ' : ''}<code>{o}</code></span>) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {g || ru.length ? (
          <>
            <h2>Guidelines</h2>
            {g?.overview ? <GuideIntro g={g} c={c} /> : null}
            <GuideEditor k={base.key} />
            {g?.policy ? <PolicySection pl={g.policy} /> : null}
            {(g?.notes || []).length ? (
              <ul className="gd-notes">
                {g!.notes!.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            ) : null}
            <CompRules k={base.key} />
          </>
        ) : null}
      </div>
      <CompUsage k={base.key} />
      <DevDetails c={base} />
    </>
  );
}

function PatternLinks({ k }: { k: string }) {
  const used = patterns.filter((p) => (p.components || []).includes(k));
  if (!used.length) return null;
  return (
    <p className="pattern-links">
      사용 패턴{' '}
      {used.map((p) => (
        <a key={p.key} className="chip" href={`#pattern-${p.key}`}>
          {p.name}
        </a>
      ))}
    </p>
  );
}

// ---------- 미리보기 조절 ----------

function Controls({ c, sel, values, onSel, onValues }: { c: ComponentData; sel: Sel; values: PropValues; onSel: (s: Sel) => void; onValues: (v: PropValues) => void }) {
  const a = analyze(c);
  // 이 변형이 쓰는 속성만 (예: default에서는 placeholder, 입력 뒤에는 text)
  const used = usedProps(c, findVariant(c, sel).layer!, values);
  const set = (fig: string, v: string | boolean) => onValues({ ...values, [fig]: v });
  const flag = (name: string, fig: string, on: boolean) => (
    <label key={fig} className="ctl">
      <span className="ctl-name">{name}</span>
      <input type="checkbox" checked={on} onChange={(e) => set(fig, e.target.checked)} />
    </label>
  );
  const text = (name: string, fig: string, val: string) => (
    <label key={fig} className="ctl">
      <span className="ctl-name">
        {name} <span className="ctl-hint">Enter로 줄바꿈</span>
      </span>
      <textarea className="search" rows={2} value={val} onChange={(e) => set(fig, e.target.value)} />
    </label>
  );
  const rows: ReactNode[] = a.vprops.map((p) => (
    <div key={p.name} className="ctl">
      <span className="ctl-name">{p.name}</span>
      <div className="seg">
        {optionsFor(c, p, sel).map((o) => (
          <button key={o} aria-pressed={sel[p.name] === o} onClick={() => onSel({ ...sel, [p.name]: o })}>
            {o}
          </button>
        ))}
      </div>
    </div>
  ));
  for (const p of [...a.flags, ...(a.focusFlag ? [a.focusFlag] : [])]) if (used.top.has(p.figmaName)) rows.push(flag(p.name, p.figmaName, !!values[p.figmaName]));
  for (const p of a.texts) if (used.top.has(p.figmaName)) rows.push(text(p.name, p.figmaName, String(values[p.figmaName] ?? '')));
  // 안쪽 인스턴스 속성은 여기서 바꾸기 전까지 그 변형의 Figma 값으로 시작한다
  for (const g of used.groups) {
    rows.push(
      <div key={`g-${g.name}`} className="ctl-group">
        {g.name}
      </div>,
    );
    for (const i of g.items) {
      const val = i.figmaName in values ? values[i.figmaName] : i.value;
      rows.push(i.type === 'boolean' ? flag(i.name, i.figmaName, !!val) : text(i.name, i.figmaName, String(val)));
    }
  }
  return <div className="sb-controls">{rows}</div>;
}

function CodePanel({ name, c, icons, sel, values }: { name: string; c: ComponentData; icons: Record<string, { svg: string; colored: boolean }>; sel: Sel; values: PropValues }) {
  const v = findVariant(c, sel);
  const { html, css } = useMemo(() => toHtmlCss(buildTree(c, v.layer!, { values, icons, prefix: `ds-${c.key}` })), [c, v, values, icons]);
  const react = reactCode(name, c, sel, values);
  const block = (label: string, text: string) => (
    <>
      <div className="code-head">
        <span>{label}</span>
        <button className="btn" onClick={(e) => copy(text, e.currentTarget.parentElement!.nextElementSibling)}>
          복사
        </button>
      </div>
      <pre>{text}</pre>
    </>
  );
  return (
    <div className="sb-body sb-code">
      {block('React', react)}
      {block('HTML', html)}
      {block('CSS', css)}
    </div>
  );
}

/** 가이드가 없는 페이지: 속성 선택지마다 한 장씩 (Figma 프레임처럼) */
function Cases({ sc, sel }: { sc: SiteComponent; sel: Sel }) {
  const c = sc.data;
  const a = analyze(c);
  const View = sc.View;
  const values = useMemo(() => defaultValues(c), [c]);
  // 카드는 가장 넓은 변형보다 넓게 해서 잘리지 않게
  const widest = Math.max(...c.variants.map((v) => v.size?.[0] || 0));
  return (
    <>
      <h3>케이스</h3>
      <p className="note">속성 조합별 모양입니다.</p>
      <div style={{ '--case-w': `${Math.max(150, Math.ceil(widest) + 40)}px` } as CSSProperties}>
        {a.vprops.map((p) => {
          const opts = optionsFor(c, p, sel);
          if (opts.length < 2) return null;
          return (
            <div key={p.name}>
              <h3>{p.name}</h3>
              <div className="cases">
                {opts.map((o) => (
                  <div key={o} className="case">
                    <span className="case-stage">
                      <View interactive={false} {...viewProps(c, findVariant(c, { ...sel, [p.name]: o }, p.name).props, values)} />
                    </span>
                    <span className="case-name">{o}</span>
                  </div>
                ))}
                {p === a.stateProp && a.focusFlag ? (
                  <div className="case">
                    <span className="case-stage">
                      <View interactive={false} {...viewProps(c, findVariant(c, { ...sel, [p.name]: a.restOption! }).props, { ...values, [a.focusFlag.figmaName]: true })} />
                    </span>
                    <span className="case-name">{a.focusFlag.name}</span>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ---------- 사용 가이드 (guide.json) ----------

function GuideIntro({ g, c }: { g: Guide; c: ComponentData }) {
  const text = g.overview || c.description || g.policy?.lead || '';
  return (
    <>
      <p className="lead pt-text">
        <Lines text={text} />
      </p>
      {g.source ? (
        <p className="gd-source">
          가이드 출처{' '}
          <a href={g.source.url || figmaUrl(g.source.fileKey, g.source.nodeId)} target="_blank" rel="noopener">
            {g.source.fileName} · {g.source.name}
          </a>
        </p>
      ) : null}
    </>
  );
}

const RuleId = ({ id }: { id?: string }) => (id ? <><span className="rule-id">{id}</span> </> : null);
const itemText = (t: string | { id?: string; text: string }) => (typeof t === 'string' ? t : <><RuleId id={t.id} />{t.text}</>);

/** 서비스 UI 가이드의 사용 정책 (언제 쓰나, 기준, Do · Don't). 기준 · Do · Don't에는 포털 규칙 번호가 붙을 수 있다 */
function PolicySection({ pl }: { pl: NonNullable<Guide['policy']> }) {
  const src = pl.source;
  return (
    <>
      <h3>{pl.title}</h3>
      {pl.lead ? <p className="note">{pl.lead}</p> : null}
      <div className="gd-when">
        <section className="gd-when-col gd-use">
          <h4>이럴 때 사용합니다</h4>
          <ul>{(pl.when?.use || []).map((t, i) => <li key={i}>{t}</li>)}</ul>
        </section>
        <section className="gd-when-col gd-avoid">
          <h4>다른 컴포넌트를 사용합니다</h4>
          <ul>
            {(pl.when?.avoid || []).map((x, i) => (
              <li key={i}>
                {x.text} <span className="gd-alt">→ {x.alt}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <h4>기준</h4>
      <div className="table-wrap">
        <table className="data gd-table gd-rules">
          <thead>
            <tr>
              <th>항목</th>
              <th>기준</th>
              <th>출처</th>
            </tr>
          </thead>
          <tbody>
            {pl.rules.map((r, i) => (
              <tr key={i}>
                <td className="pt-type">
                  <RuleId id={r.id} />
                  {r.name}
                </td>
                <td className="pt-text">
                  {r.desc}
                  {r.gap ? <span className="gd-gap-note">{r.gap}</span> : null}
                </td>
                <td className="gd-from">{r.from}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(pl.do || []).length || (pl.dont || []).length ? (
        <div className="gd-dodont">
          {(pl.do || []).length ? (
            <section className="gd-do">
              <h4>Do · 이렇게 합니다</h4>
              <ul>{pl.do!.map((t, i) => <li key={i}>{itemText(t)}</li>)}</ul>
            </section>
          ) : null}
          {(pl.dont || []).length ? (
            <section className="gd-dont">
              <h4>Don't · 이건 피합니다</h4>
              <ul>{pl.dont!.map((t, i) => <li key={i}>{itemText(t)}</li>)}</ul>
            </section>
          ) : null}
        </div>
      ) : null}
      {(pl.related || []).length ? (
        <p className="gd-related">
          함께 보기{' '}
          {pl.related!.map((r) => (
            <span key={r.name} className="chip" title={r.file}>
              {r.name} · {r.desc}
            </span>
          ))}
        </p>
      ) : null}
      {src ? (
        <p className="gd-source">
          정책 출처 {src.title} 문서 ({src.id}
          {src.status ? ` · ${src.status}` : ''})
        </p>
      ) : null}
    </>
  );
}

/** 가이드 예시 하나: 생성된 컴포넌트를 그림으로만 그린다 */
function Example({ sc, props, zoom, slotRef }: { sc: SiteComponent; props: Sel; zoom?: boolean; slotRef?: (el: HTMLSpanElement | null) => void }) {
  const values = useMemo(() => defaultValues(sc.data), [sc.data]);
  const View = sc.View;
  if (!variantOf(sc.data, props)) return <span className="error">변형 없음</span>;
  return (
    <span className={`gd-slot${zoom ? ' gd-zoom' : ''}`} ref={slotRef}>
      <View interactive={false} {...viewProps(sc.data, props, values)} />
    </span>
  );
}

const CodeBtn = ({ props, onCode }: { props: Sel; onCode: (p: Sel) => void }) => (
  <button className="gd-code" title="위 미리보기에 이 변형을 띄우고 코드 보기" onClick={() => onCode(props)}>
    코드
  </button>
);

// 가이드 표에 없는 컴포넌트 선택지(예: pressed)도 빠지지 않게 "가이드 설명 없음" 줄로 더한다
function missingRows(c: ComponentData, rows: GuideRow[]): GuideRow[] {
  const extra: GuideRow[] = [];
  const shown = (name: string, o: string) => rows.some((r) => r.props[name] === o);
  for (const p of c.props) {
    if (p.type !== 'variant' || !rows.some((r) => p.name in r.props)) continue;
    for (const o of p.options!) if (!shown(p.name, o)) extra.push({ name: o[0].toUpperCase() + o.slice(1), props: { [p.name]: o }, desc: '', missing: true });
  }
  return extra;
}

function StatesSection({ sc, st, onCode }: { sc: SiteComponent; st: NonNullable<Guide['states']>; onCode: (p: Sel) => void }) {
  const c = sc.data;
  const rows = [...st.rows, ...missingRows(c, st.rows)];
  return (
    <>
      <h3>{st.title}</h3>
      <p className="note">{st.lead}</p>
      <div className="table-wrap">
        <table className="data gd-table">
          <thead>
            <tr>
              <th>State</th>
              <th>Example</th>
              <th>Use case</th>
              <th>
                <span className="sr-only">코드</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const props = propsFor(c, r.props, st.defaults);
              return (
                <tr key={i}>
                  <td className="pt-type">
                    <RuleId id={r.id} />
                    {r.name}
                  </td>
                  <td className="gd-ex">
                    <Example sc={sc} props={props} />
                  </td>
                  <td className="pt-text">{r.missing ? <span className="gd-missing">가이드 설명 없음 · 컴포넌트에만 있는 상태입니다.</span> : r.desc}</td>
                  <td className="gd-act">
                    <CodeBtn props={props} onCode={onCode} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function VariantsSection({ sc, vr, onCode }: { sc: SiteComponent; vr: NonNullable<Guide['variants']>; onCode: (p: Sel) => void }) {
  const c = sc.data;
  return (
    <>
      <h3>{vr.title}</h3>
      <p className="note">{vr.lead}</p>
      {vr.groups.map((grp, gi) => (
        <div key={gi}>
          <h4>{grp.title}</h4>
          <p className="note">{grp.lead}</p>
          <div className="table-wrap">
            <table className="data gd-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Example</th>
                  <th>Description</th>
                  <th>
                    <span className="sr-only">코드</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {grp.rows.map((r, i) => {
                  const props = propsFor(c, r.props);
                  return (
                    <tr key={i}>
                      <td className="pt-type">
                        {r.name}
                        <span className="gd-prop">{Object.entries(r.props).filter(([k]) => k === 'size').map(([k, v]) => `${k}=${v}`).join('')}</span>
                      </td>
                      <td className="gd-ex">
                        <Example sc={sc} props={props} />
                      </td>
                      <td className="pt-text">{r.desc}</td>
                      <td className="gd-act">
                        <CodeBtn props={props} onCode={onCode} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </>
  );
}

// ---------- 측정 표시 (Anatomy 번호 · Spec 치수) ----------

/** 글꼴이 들어온 뒤와 창 크기가 바뀔 때 다시 잰다 */
function useMeasure(measure: () => void, deps: unknown[]) {
  const fn = useRef(measure);
  fn.current = measure;
  useLayoutEffect(() => {
    let alive = true;
    fn.current();
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => alive && fn.current());
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => alive && fn.current(), 120);
    };
    window.addEventListener('resize', onResize);
    return () => {
      alive = false;
      clearTimeout(t);
      window.removeEventListener('resize', onResize);
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

const rel = (el: Element, host: Element) => {
  const a = el.getBoundingClientRect();
  const b = host.getBoundingClientRect();
  return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height };
};
const part = (slot: Element, key: string, layer: string) => slot.querySelector(`.ds-${key}__${layer}`) as HTMLElement | null;

interface Mark {
  cls: string;
  style: CSSProperties;
  text?: ReactNode;
  side?: string;
}

function AnatomySection({ sc, an }: { sc: SiteComponent; an: NonNullable<Guide['anatomy']> }) {
  const c = sc.data;
  const host = useRef<HTMLDivElement>(null);
  const slot = useRef<HTMLSpanElement | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  useMeasure(() => {
    if (!host.current || !slot.current) return;
    const out: Mark[] = [];
    // 번호: 표시 요소는 위쪽, 라벨은 오른쪽
    for (const p of an.parts) {
      const el = part(slot.current, c.key, p.layer);
      if (!el) continue;
      const r = rel(el, host.current);
      out.push({
        cls: 'gd-mark gd-badge',
        side: p.n === 1 ? 'top' : 'right',
        style: p.n === 1 ? { left: `${r.x + r.w / 2}px`, top: `${r.y - 12}px` } : { left: `${r.x + r.w + 14}px`, top: `${r.y + r.h / 2}px` },
        text: <span className="pt-num-badge">{p.n}</span>,
      });
    }
    setMarks(out);
  }, [c.key, an]);
  return (
    <>
      <h3>{an.title}</h3>
      <p className="note">{an.lead}</p>
      <div className="gd-canvas gd-anatomy" ref={host}>
        <Example sc={sc} props={propsFor(c, an.example)} zoom slotRef={(el) => (slot.current = el)} />
        {marks.map((m, i) => (
          <span key={i} className={m.cls} style={m.style} data-side={m.side}>
            {m.text}
          </span>
        ))}
      </div>
      <ol className="pt-parts">
        {an.parts.map((x) => (
          <li key={x.n}>
            <span className="pt-num-badge">{x.n}</span>
            <strong>{x.name}</strong>
            <span>{x.desc}</span>
          </li>
        ))}
      </ol>
    </>
  );
}

function findLayer(layer: Layer, name: string): Layer | null {
  if (layer.name === name) return layer;
  for (const ch of layer.children || []) {
    const f = findLayer(ch, name);
    if (f) return f;
  }
  return null;
}

function SpecSection({ sc, sp }: { sc: SiteComponent; sp: NonNullable<Guide['spec']> }) {
  const c = sc.data;
  const figs = useRef<(HTMLElement | null)[]>([]);
  const slots = useRef<(HTMLSpanElement | null)[]>([]);
  const [marks, setMarks] = useState<Mark[][]>([]);
  useMeasure(() => {
    setMarks(
      sp.items.map((_, i) => {
        const fig = figs.current[i];
        const s = slots.current[i];
        if (!fig || !s) return [];
        const box = part(s, c.key, 'checkbox');
        const label = part(s, c.key, 'label');
        if (!box || !label) return [];
        const b = rel(box, fig);
        const l = rel(label, fig);
        const real = (n: number) => Math.round(n * 10) / 10;
        // getBoundingClientRect에는 확대가 들어 있으므로 컴포넌트의 CSS px로 되돌린다
        const scale = box.offsetHeight ? b.h / box.offsetHeight : 1;
        return [
          { cls: 'gd-mark gd-height', style: { left: `${b.x - 14}px`, top: `${b.y}px`, height: `${b.h}px` }, text: <span>{real(b.h / scale)}</span> },
          { cls: 'gd-mark gd-gap', style: { left: `${b.x + b.w}px`, top: `${b.y}px`, width: `${l.x - b.x - b.w}px`, height: `${b.h}px` }, text: <span>{real((l.x - b.x - b.w) / scale)}</span> },
          { cls: 'gd-mark gd-radius', style: { left: `${b.x - 6}px`, top: `${b.y - 22}px` }, text: <span>R{parseFloat(getComputedStyle(box).borderTopLeftRadius)}</span> },
        ];
      }),
    );
  }, [c.key, sp]);

  // 규격 표: 컴포넌트 JSON 값을 가이드 숫자와 견준다
  const tokenFor = (node: Layer | null, field: string) => {
    const name = node && node.variables && (node.variables[field] || node.variables[`${field}[0]`]);
    return name ? c.tokens.find((t) => t.figma === name) || { figma: name } : null;
  };
  const Tok = ({ t }: { t: { figma: string } | null }) => (t ? <> <code className="gd-token">{t.figma}</code></> : null);
  const Flag = ({ have, want }: { have?: number; want?: number }) =>
    want != null && have !== want ? (
      <>
        {' '}
        <span className="chip chip--warn" title="가이드 값">
          가이드 {want}
        </span>
      </>
    ) : null;
  return (
    <>
      <h3>{sp.title}</h3>
      <p className="note">{sp.lead}</p>
      <div className="gd-canvas gd-spec">
        {sp.items.map((it, i) => (
          <figure key={i} className="gd-spec-item" ref={(el) => (figs.current[i] = el)}>
            <figcaption>{it.name}</figcaption>
            <Example sc={sc} props={propsFor(c, it.props)} zoom slotRef={(el) => (slots.current[i] = el)} />
            {(marks[i] || []).map((m, j) => (
              <span key={j} className={m.cls} style={m.style}>
                {m.text}
              </span>
            ))}
          </figure>
        ))}
      </div>
      <div className="table-wrap gd-spec-table">
        <table className="data">
          <thead>
            <tr>
              <th>Type</th>
              <th>체크박스 크기</th>
              <th>체크박스–라벨 간격</th>
              <th>둥글기</th>
              <th>라벨 글자</th>
            </tr>
          </thead>
          <tbody>
            {sp.items.map((it, i) => {
              const v = variantOf(c, propsFor(c, it.props));
              const box = v?.layer && findLayer(v.layer, 'checkbox');
              const label = v?.layer && findLayer(v.layer, 'label');
              if (!v?.layer || !box) return null;
              const size = box.size[1];
              const gap = v.layer.layout?.gap;
              const radius = typeof box.radius === 'number' ? box.radius : undefined;
              const font = label && label.text ? `${label.text.fontSize ?? ''}${label.text.fontWeight ? ` / ${label.text.fontWeight}` : ''}` : '';
              return (
                <tr key={i}>
                  <td className="pt-type">{it.name}</td>
                  <td className="num">
                    {size}px
                    <Flag have={size} want={it.box} />
                    <Tok t={tokenFor(box, 'height')} />
                  </td>
                  <td className="num">
                    {gap}px
                    <Flag have={gap} want={it.gap} />
                    <Tok t={tokenFor(v.layer, 'itemSpacing')} />
                  </td>
                  <td className="num">
                    {radius}px
                    <Flag have={radius} want={it.radius} />
                    <Tok t={tokenFor(box, 'cornerRadius')} />
                  </td>
                  <td className="num">
                    {font}
                    <Tok t={tokenFor(label || null, 'fontSize')} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ---------- 개발 정보 ----------

/** 노드 ID · 키 · 토큰은 맨 아래 접힌 상자 하나에 */
function DevDetails({ c }: { c: ComponentData }) {
  const styles = [...(c.textStyles || []), ...(c.otherStyles || [])];
  return (
    <details className="dev">
      <summary>개발 정보 · Figma 노드 ID · 컴포넌트 키 · 변형 · 토큰</summary>
      <div className="btn-row">
        <a className="btn" href={c.figma.url} target="_blank" rel="noopener">
          Figma에서 보기 ↗
        </a>
      </div>
      <h2>Figma 정보</h2>
      <dl className="dl">
        <dt>세트 노드 ID</dt>
        <dd>
          <CopyBtn value={c.figma.nodeId} />
        </dd>
        <dt>세트 컴포넌트 키</dt>
        <dd>{c.figma.componentKey ? <CopyBtn value={c.figma.componentKey} /> : '-'}</dd>
        <dt>Figma 페이지</dt>
        <dd>
          {c.figma.page?.name || '-'} <span className="count mono">{c.figma.page?.nodeId || ''}</span>
        </dd>
        <dt>JSON 파일</dt>
        <dd>
          <CopyBtn value={`components/${c.key}/component.json`} />
        </dd>
        <dt>React 컴포넌트</dt>
        <dd>
          <CopyBtn value={`src/ds/components/${c.key.split('-').map((s) => s[0].toUpperCase() + s.slice(1)).join('')}.tsx`} />
        </dd>
        <dt>읽은 날짜</dt>
        <dd>{c.figma.extractedAt || '-'}</dd>
      </dl>
      <VariantTable c={c} />
      <TokenTables c={c} />
      {styles.length ? (
        <>
          <h2>
            스타일 <span className="count">{styles.length}</span>
          </h2>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>종류</th>
                  <th>스타일 키</th>
                </tr>
              </thead>
              <tbody>
                {styles.map((s) => (
                  <tr key={s.key}>
                    <td className="mono">{s.name}</td>
                    <td className="mono">{s.type}</td>
                    <td>
                      <CopyBtn value={s.key} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </details>
  );
}

function VariantTable({ c }: { c: ComponentData }) {
  const vprops = c.props.filter((p) => p.type === 'variant');
  const [filter, setFilter] = useState<Sel>({});
  useEffect(() => setFilter({}), [c.key]);
  if (!c.variants.length) return null;
  const total = vprops.reduce((n, p) => n * p.options!.length, 1);
  const hit = (v: { props: Sel }) => Object.entries(filter).every(([k, val]) => v.props[k] === val);
  const n = c.variants.filter(hit).length;
  return (
    <>
      <h2>
        변형 <span className="count">{c.variants.length}</span>
      </h2>
      <p className="note">
        {c.variants.length === total ? `속성 값의 모든 조합(${total}가지)이 Figma에 있습니다.` : `속성 값을 곱하면 ${total}가지지만 Figma에는 실제로 쓰는 ${c.variants.length}가지만 있습니다.`} 노드 ID를 누르면 Figma에서 열리고, 컴포넌트 키를 누르면 복사됩니다.
      </p>
      <div className="filters">
        {vprops.map((p) => {
          const used = p.options!.filter((o) => c.variants.some((v) => v.props[p.name] === o));
          const set = (o: string) => setFilter((f) => {
            const next = { ...f };
            if (o) next[p.name] = o;
            else delete next[p.name];
            return next;
          });
          return (
            <div key={p.name} className="filter-row">
              <span className="label">{p.name}</span>
              <button className="chip" aria-pressed={!filter[p.name]} onClick={() => set('')}>
                전체
              </button>
              {used.map((o) => (
                <button key={o} className="chip" aria-pressed={filter[p.name] === o} onClick={() => set(o)}>
                  {o}
                </button>
              ))}
            </div>
          );
        })}
      </div>
      <p className="note">{Object.keys(filter).length ? `조건에 맞는 변형 ${n}개` : ''}</p>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              {vprops.map((p) => (
                <th key={p.name}>{p.name}</th>
              ))}
              <th>크기</th>
              <th>노드 ID</th>
              <th>컴포넌트 키</th>
            </tr>
          </thead>
          <tbody>
            {c.variants.map((v) => (
              <tr key={v.key} hidden={!hit(v)}>
                {vprops.map((p) => (
                  <td key={p.name} className="mono">
                    {v.props[p.name]}
                  </td>
                ))}
                <td className="num">{v.size ? `${Math.round(v.size[0])}×${Math.round(v.size[1])}` : ''}</td>
                <td className="nowrap">
                  <a className="mono" href={figmaUrl(c.figma.fileKey, v.nodeId)} target="_blank" rel="noopener">
                    {v.nodeId}
                  </a>
                </td>
                <td>
                  <CopyBtn value={v.key} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function TokenTables({ c }: { c: ComponentData }) {
  if (!c.tokens.length) return null;
  const collections = [...new Set(c.tokens.map((t) => t.collection))];
  return (
    <>
      <h2>
        연결된 토큰 <span className="count">{c.tokens.length}</span>
      </h2>
      <p className="note">
        컴포넌트 안에 바인딩된 Figma 변수입니다. CSS 변수 이름을 누르면 <code>var(--…)</code> 형태로 복사됩니다. 값은 토큰 CSS를 만든 뒤에 연결합니다.
      </p>
      {collections.map((col) => {
        const list = c.tokens.filter((t) => t.collection === col);
        return (
          <div key={col || 'none'}>
            <h3>
              {col || '컬렉션 없음'} <span className="count">{list.length}</span>
            </h3>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Figma 변수</th>
                    <th>CSS 변수</th>
                    <th>타입</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((t) => (
                    <tr key={t.figma}>
                      <td className="mono">{t.figma}</td>
                      <td>
                        <CopyBtn value={`var(${t.css})`} label={t.css} />
                      </td>
                      <td className="mono">{t.type}</td>
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
