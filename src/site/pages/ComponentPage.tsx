// 컴포넌트 페이지 (SEED 문서형): 미리보기 → Anatomy → Properties → Guidelines → Usage → 개발 정보.
// 미리보기 · 예시는 모두 src/ds/components의 React 컴포넌트로 그린다. 포털에 게시된 코드가 있으면 그 코드로 그린다.
// 디자인 시스템 담당은 같은 페이지에서 코드를 고치고(미리보기 · 예시가 바로 바뀜) Figma 원본과 견준 뒤 초안으로 저장한다.
import { Component as ReactComponent, createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { SiteComponent, Guide, GuideRow } from '../data';
import { patterns } from '../data';
import * as P from '../portal/store';
import { usePortal } from '../portal/ctx';
import type { ComponentData, Layer, PropValues } from '../../ds/figma/types';
import { analyze, defaultSelection, defaultValues, findVariant, fixSelection, optionsFor, propsFor, usedProps, variantOf } from '../../ds/figma/variants';
import { isRenderable } from '../../ds/figma/tree';
import { FigmaView } from '../../ds/figma/FigmaView';
import { compile, fileOf, repoSource } from '../live';
import { editWithChat, getApiKey, setApiKey } from '../codechat';
import type { ChatTurn } from '../codechat';
import type { LiveComponent, Meta } from '../live';
import { CopyBtn, DraftBox, EditBtn, Editable, TextEditToggle, TextScope, TocInline, UxRef, copy, figmaUrl } from '../ui';
import { CompChecks, CompEditor, CompRules, CompUsage, GuideEditor, applyGuide, compRules } from './compPortal';

type Sel = Record<string, string>;

// ---------- 지금 그릴 React 컴포넌트 ----------

interface Live {
  C: LiveComponent | null;
  meta: Meta;
  /** 변형 · 불리언 값 · 글 → 컴포넌트 속성 */
  props: (sel: Sel, values?: PropValues, texts?: Record<string, string>) => Record<string, unknown>;
}
const LiveCtx = createContext<Live>(null as unknown as Live);

function makeLive(c: ComponentData, C: LiveComponent | null): Live {
  const meta: Meta = C?.meta || { texts: {} };
  const top = new Map(c.props.map((p) => [p.figmaName, p]));
  const defV = defaultValues(c);
  return {
    C,
    meta,
    props: (sel, values = defV, texts = meta.texts) => {
      const out: Record<string, unknown> = { ...sel };
      for (const [fig, v] of Object.entries(values)) {
        const p = top.get(fig);
        if (p && p.type === 'boolean') out[p.name] = v;
      }
      for (const [k, v] of Object.entries(texts)) if (k !== 'value' || v) out[k === 'value' ? 'defaultValue' : k] = v;
      // 상태를 고정한 예시에는 그 상태다운 값(entered → 'Text')을 넣는다
      const sample = sel.state && meta.samples?.[sel.state];
      if (sample && !texts.value) Object.assign(out, sample);
      return out;
    },
  };
}

/** 고친 코드에서 렌더 오류가 나도 페이지가 멈추지 않게 */
export class Boundary extends ReactComponent<{ resetKey: string; children: ReactNode }, { error: string | null; key: string }> {
  state = { error: null as string | null, key: this.props.resetKey };
  static getDerivedStateFromError(e: Error) {
    return { error: e.message };
  }
  static getDerivedStateFromProps(p: { resetKey: string }, s: { key: string }) {
    return p.resetKey !== s.key ? { error: null, key: p.resetKey } : null;
  }
  render() {
    return this.state.error ? <span className="error">그리는 중 오류: {this.state.error}</span> : this.props.children;
  }
}

/** 컴포넌트 하나 그리기 (문서 예시는 interactive=false: 포인터 · 키보드를 받지 않는다) */
function Render({ sel, values, texts, interactive = true, extra, k }: { sel: Sel; values?: PropValues; texts?: Record<string, string>; interactive?: boolean; extra?: Record<string, unknown>; k?: string }) {
  const live = useContext(LiveCtx);
  if (!live.C) return <span className="error">React 컴포넌트가 없습니다</span>;
  const C = live.C;
  const props = live.props(sel, values, texts);
  const el = (
    <Boundary resetKey={String(C)}>
      <C key={k ?? JSON.stringify(props.defaultValue ?? '')} {...props} {...extra} />
    </Boundary>
  );
  return interactive ? el : <span {...{ inert: '' }} style={{ display: 'contents', pointerEvents: 'none' }}>{el}</span>;
}

const jsxValue = (v: unknown) => (typeof v === 'boolean' ? `{${v}}` : typeof v === 'string' && !/["\n]/.test(v) ? `"${v}"` : `{${JSON.stringify(v)}}`);

/** 이 미리보기를 그대로 쓰는 JSX (기본값과 다른 속성만) */
function reactCode(name: string, c: ComponentData, meta: Meta, sel: Sel, values: PropValues, texts: Record<string, string>) {
  const def = defaultSelection(c);
  const defV = defaultValues(c);
  const attrs: string[] = [];
  for (const p of c.props) {
    if (p.type === 'variant' && sel[p.name] !== def[p.name]) attrs.push(`${p.name}=${jsxValue(sel[p.name])}`);
    if (p.type === 'boolean' && values[p.figmaName] !== defV[p.figmaName]) attrs.push(`${p.name}=${jsxValue(values[p.figmaName])}`);
  }
  for (const [k, v] of Object.entries(texts)) if (v !== (meta.texts[k] ?? '')) attrs.push(`${k === 'value' ? 'defaultValue' : k}=${jsxValue(v)}`);
  const open = attrs.length > 2 ? `<${name}\n${attrs.map((a) => `  ${a}`).join('\n')}\n/>` : `<${name}${attrs.length ? ` ${attrs.join(' ')}` : ''} />`;
  return `import { ${name} } from './ds'; // 이 저장소의 src/ds\n\n${open}`;
}

export function ComponentPage({ sc }: { sc: SiteComponent }) {
  const base = sc.data;
  const key = base.key;
  const c = (P.comp(key) as ComponentData & { figmaSyncedAt?: string }) || base;
  // 편집을 켜기 전에는 보기 역할과 같은 화면 (게시본만). 켜면 초안 글 · 담당 칸 · 코드 채팅이 나온다
  const { ui, can, role, act, closeEdit, textEdit } = usePortal();
  const g = useMemo(() => applyGuide(key, sc.guide, textEdit), [key, sc.guide, textEdit, P.revision()]); // eslint-disable-line react-hooks/exhaustive-deps
  const ok = isRenderable(base);
  const a = analyze(base);

  // 게시된 코드 → 저장소 코드 순. 디자인 시스템 담당이 편집 중이면 편집 중인 코드
  const repo = repoSource(sc.name);
  const published = P.publishedCode(key);
  const current = published ?? repo;
  const pubCompiled = published ? compile(sc.name, published) : null;
  const editing = ui.edit === `code:${key}`;
  const [draftSrc, setDraftSrc] = useState<string | null>(null);
  const openDraft = P.openDraft('code', key);
  const editorSrc = draftSrc ?? openDraft?.after.source ?? current;
  const editCompiled = editing ? compile(sc.name, editorSrc) : null;
  const C = (editing && editCompiled?.Component) || pubCompiled?.Component || sc.Component;
  const live = useMemo(() => makeLive(base, C), [base, C]);

  const [sel, setSel] = useState<Sel>(() => fixSelection(base, defaultSelection(base)));
  const [values, setValues] = useState<PropValues>(() => defaultValues(base));
  const [texts, setTexts] = useState<Record<string, string>>(() => ({ ...live.meta.texts }));
  const [tab, setTab] = useState<'preview' | 'code'>('preview');
  const [compare, setCompare] = useState(false);
  const sbRef = useRef<HTMLElement>(null);
  const update = (next: Sel) => setSel(fixSelection(base, next));
  const showVariant = (props: Sel) => {
    update({ ...sel, ...props });
    setTab('code');
    sbRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };
  const ru = compRules(key);
  const itemMeaning = P.itemByKey(key)?.meaning;
  const itemCode = P.itemByKey(key)?.code;
  const onSel = (v: string) => a.selectProp && update({ ...sel, [a.selectProp.name]: v });

  const saveDraft = () =>
    act(() => P.draftCode(role, key, fileOf(sc.name), editorSrc, repo), (d) => `초안 ${d.id} 저장 · 포털 승인 담당이 게시하면 모두에게 반영`).then((d) => {
      if (d) {
        setDraftSrc(null);
        closeEdit();
      }
    });

  return (
    <TextScope.Provider value={{ key, name: base.name }}>
    <LiveCtx.Provider value={live}>
      <p className="eyebrow">Components</p>
      <div className="h1-row">
        <Editable as="h1" path="title" label="컴포넌트 제목" value={(textEdit && itemCode ? P.openDraft('item', itemCode)?.after.name : undefined) || P.itemByKey(key)?.name || base.name} onSave={itemCode ? (v) => P.draftItem(role, itemCode, { name: v.trim() }) : undefined} />
        <TextEditToggle />
      </div>
      <Editable as="p" className="lead" path="lead" label="페이지 설명" value={(textEdit && itemCode ? P.openDraft('item', itemCode)?.after.meaning : undefined) || itemMeaning || c.description || ''} onSave={itemCode ? (v) => P.draftItem(role, itemCode, { meaning: v }) : undefined} />
      <CompChecks c={c} hasGuide={!!sc.guide} />
      <TocInline />
      <PatternLinks k={key} />
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
              <label className="sb-compare">
                <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} /> Figma 원본과 나란히
              </label>
            </div>
            {tab === 'preview' ? (
              <div className="sb-body">
                <div className={`sb-canvas${compare ? ' sb-canvas--compare' : ''}`}>
                  <figure className="sb-fig">
                    {compare ? <figcaption>React{editing ? ' · 편집 중' : published ? ' · 게시된 코드' : ''}</figcaption> : null}
                    <div className="sb-stage">
                      <Render sel={sel} values={values} texts={texts} extra={{ onSelectionChange: onSel }} />
                    </div>
                  </figure>
                  {compare ? (
                    <figure className="sb-fig">
                      <figcaption>Figma 원본</figcaption>
                      <div className="sb-stage" {...{ inert: '' }}>
                        <FigmaView data={base} icons={sc.icons} selection={sel} values={values} />
                      </div>
                    </figure>
                  ) : null}
                </div>
                <Controls c={base} sel={sel} values={values} texts={texts} onSel={update} onValues={setValues} onTexts={setTexts} />
              </div>
            ) : (
              <div className="sb-body sb-code">
                <CodeBlock label="사용 예" text={reactCode(sc.name, base, live.meta, sel, values, texts)} />
                <CodeBlock label={`${fileOf(sc.name)}${published ? ' (포털에 게시된 코드)' : ''}`} text={current} />
              </div>
            )}
          </section>
          {a.stateProp || a.selectProp ? <p className="note">마우스를 올리거나 누르고, 키보드 Tab으로 포커스해 보세요. 실제 입력 요소라 그대로 동작합니다.</p> : null}
          {textEdit && can('code') ? (
            <section className="ed-panel">
              <div className="ed-h">
                <b>컴포넌트 코드</b>
                <span>
                  {fileOf(sc.name)} · 고치면 위 미리보기와 아래 예시가 바로 바뀝니다. 초안으로 저장하면 포털 승인 담당이 게시합니다{published ? ' · 지금 게시된 코드가 저장소 코드와 다릅니다' : ''}
                </span>
              </div>
              <div className="row">
                <EditBtn k={`code:${key}`} label="AI로 코드 고치기" />
                <a className="lnk" href={`#compare-${key}`}>
                  모든 변형 Figma와 비교
                </a>
              </div>
              {editing ? (
                <CodeChat
                  name={sc.name}
                  value={editorSrc}
                  onChange={setDraftSrc}
                  error={editCompiled?.error}
                  onSave={saveDraft}
                  onReset={() => setDraftSrc(current)}
                  onRepo={published ? () => setDraftSrc(repo) : undefined}
                  onCompare={() => {
                    setCompare(true);
                    setTab('preview');
                    sbRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
                  }}
                />
              ) : null}
            </section>
          ) : (
            <DraftBox d={textEdit && !can('code') ? openDraft : null} />
          )}
        </>
      ) : (
        <p className="error">이 컴포넌트는 예전 형식 JSON이라 미리보기를 그릴 수 없어요. Figma 링크로 다시 읽으면 나타나요.</p>
      )}
      {textEdit && can('code') ? <DraftBox d={openDraft} /> : null}
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
                  <td className="mono">{p.type === 'slot' ? 'children' : p.name}</td>
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
            <GuideEditor k={key} />
            {g?.policy ? <PolicySection pl={g.policy} /> : null}
            {(g?.notes || []).length ? (
              <ul className="gd-notes">
                {g!.notes!.map((n, i) => (
                  <li key={i}>
                    <Editable path={`notes.${i}`} label={`메모 ${i + 1}`} value={n} />
                  </li>
                ))}
              </ul>
            ) : null}
            <CompRules k={key} />
          </>
        ) : null}
      </div>
      <CompUsage k={key} />
      <DevDetails c={base} name={sc.name} />
    </LiveCtx.Provider>
    </TextScope.Provider>
  );
}

export function CodeBlock({ label, text }: { label: string; text: string }) {
  return (
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
}

/** AI 채팅으로 코드 고치기: 말로 요청하면 Claude가 파일을 고쳐 미리보기에 바로 반영한다. 코드를 직접 보고 고칠 수도 있다 */
export function CodeChat(p: { name: string; value: string; onChange: (v: string) => void; error?: string; onSave: () => void; onReset: () => void; onRepo?: () => void; onCompare?: () => void; hint?: string }) {
  const [turns, setTurns] = useState<(ChatTurn & { mode?: string; failed?: boolean })[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [key, setKey] = useState(getApiKey());
  const [keyInput, setKeyInput] = useState('');
  const [showCode, setShowCode] = useState(false);
  const log = useRef<HTMLDivElement>(null);
  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [turns, busy]);
  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    const history = turns.filter((t) => !t.failed).map(({ role, text: t }) => ({ role, text: t }));
    setTurns((L) => [...L, { role: 'user', text }]);
    setBusy(true);
    try {
      const r = await editWithChat(p.name, p.value, text, history);
      if (r.source) p.onChange(r.source);
      setTurns((L) => [...L, { role: 'assistant', text: r.reply + (r.source ? '\n· 미리보기와 아래 예시에 반영했습니다. 마음에 들면 "초안 저장"을 누르세요.' : ''), mode: r.mode }]);
    } catch (e) {
      setTurns((L) => [...L, { role: 'assistant', text: (e as Error).message, failed: true }]);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="cc">
      <div className="cc-key">
        {key ? (
          <>
            <span className="cc-on">● AI 연결됨 (Claude Opus 5.5)</span>
            <button className="lnk" onClick={() => (setApiKey(''), setKey(''))}>
              키 지우기
            </button>
          </>
        ) : (
          <form
            className="row"
            onSubmit={(e) => {
              e.preventDefault();
              setApiKey(keyInput.trim());
              setKey(keyInput.trim());
              setKeyInput('');
            }}
          >
            <span className="muted">AI로 고치려면 Anthropic API 키를 넣으세요 (이 브라우저에만 저장). 없으면 글자 바꾸기 흉내 모드입니다.</span>
            <input type="password" className="in-sm" placeholder="sk-ant-…" aria-label="Anthropic API 키" value={keyInput} onChange={(e) => setKeyInput(e.target.value)} />
            <button className="btn2 sm" disabled={!keyInput.trim()}>
              연결
            </button>
          </form>
        )}
      </div>
      <div className="cc-log" ref={log} aria-live="polite">
        {!turns.length ? (
          <p className="cc-hint">
            {p.hint ? <>{p.hint}<br /></> : null}
            예: "체크됐을 때 색을 #E5007E로 바꿔 줘", "라벨과 체크박스 사이를 8px로", "disabled일 때 라벨에 취소선". 고친 코드는 바로 미리보기에 그려지고, 초안 저장 전까지는 이 브라우저에만 있습니다.
          </p>
        ) : null}
        {turns.map((t, i) => (
          <div key={i} className={`cc-msg ${t.role}${t.failed ? ' failed' : ''}`}>
            {t.mode === 'mock' ? <span className="cc-tag">흉내 모드</span> : null}
            {t.text}
          </div>
        ))}
        {busy ? <div className="cc-msg assistant busy">코드를 고치는 중…</div> : null}
      </div>
      <form
        className="cc-input"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <textarea
          rows={2}
          placeholder="무엇을 고칠지 말해 주세요 (Enter 보내기 · Shift+Enter 줄바꿈)"
          aria-label="코드 고칠 요청"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button className="btn2 primary sm" disabled={busy || !input.trim()}>
          보내기
        </button>
      </form>
      <div className="row">
        <button className="btn2 sm" onClick={() => setShowCode((x) => !x)}>
          {showCode ? '코드 닫기' : '코드 보기 · 직접 고치기'}
        </button>
      </div>
      {showCode ? <CodeEditor {...p} /> : (
        <>
          <p className={`ce-status${p.error ? ' bad' : ''}`} role="status">
            {p.error ? `오류 · ${p.error} (미리보기는 마지막으로 돌던 코드)` : '✓ 컴파일됨 · 미리보기와 예시에 반영 중'}
          </p>
          <div className="row">
            <button className="btn2 primary sm" disabled={!!p.error} onClick={p.onSave}>
              초안 저장
            </button>
            {p.onCompare ? (
              <button className="btn2 sm" onClick={p.onCompare}>
                Figma 원본과 비교
              </button>
            ) : null}
            <button className="btn2 sm" onClick={p.onReset}>
              고친 것 되돌리기
            </button>
            {p.onRepo ? (
              <button className="btn2 sm" onClick={p.onRepo}>
                저장소 코드 불러오기
              </button>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}

/** 코드 편집기: 고정폭 글자, Tab은 공백 2칸, 줄 번호 */
function CodeEditor({ value, onChange, error, onSave, onReset, onRepo, onCompare }: { value: string; onChange: (v: string) => void; error?: string; onSave: () => void; onReset: () => void; onRepo?: () => void; onCompare?: () => void }) {
  const ta = useRef<HTMLTextAreaElement>(null);
  const gutter = useRef<HTMLPreElement>(null);
  const lines = value.split('\n').length;
  return (
    <div className="ce">
      <div className="ce-box">
        <pre className="ce-gutter" ref={gutter} aria-hidden="true">
          {Array.from({ length: lines }, (_, i) => i + 1).join('\n')}
        </pre>
        <textarea
          ref={ta}
          className="ce-text"
          spellCheck={false}
          aria-label="컴포넌트 코드"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={(e) => {
            if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop;
          }}
          onKeyDown={(e) => {
            if (e.key === 'Tab' && !e.shiftKey) {
              e.preventDefault();
              const t = e.currentTarget;
              const { selectionStart: s0, selectionEnd: s1 } = t;
              const next = `${value.slice(0, s0)}  ${value.slice(s1)}`;
              onChange(next);
              requestAnimationFrame(() => t.setSelectionRange(s0 + 2, s0 + 2));
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
              e.preventDefault();
              onSave();
            }
          }}
        />
      </div>
      <p className={`ce-status${error ? ' bad' : ''}`} role="status">
        {error ? `오류 · ${error} (미리보기는 마지막으로 돌던 코드)` : '✓ 컴파일됨 · 미리보기와 예시에 반영 중'}
      </p>
      <div className="row">
        <button className="btn2 primary sm" disabled={!!error} onClick={onSave}>
          초안 저장 (Ctrl/Cmd+S)
        </button>
        {onCompare ? (
          <button className="btn2 sm" onClick={onCompare}>
            Figma 원본과 비교
          </button>
        ) : null}
        <button className="btn2 sm" onClick={onReset}>
          고친 것 되돌리기
        </button>
        {onRepo ? (
          <button className="btn2 sm" onClick={onRepo}>
            저장소 코드 불러오기
          </button>
        ) : null}
      </div>
    </div>
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

function Controls({ c, sel, values, texts, onSel, onValues, onTexts }: { c: ComponentData; sel: Sel; values: PropValues; texts: Record<string, string>; onSel: (s: Sel) => void; onValues: (v: PropValues) => void; onTexts: (t: Record<string, string>) => void }) {
  const a = analyze(c);
  // 이 변형이 쓰는 불리언 속성만 (Figma 레이어 기준)
  const used = usedProps(c, findVariant(c, sel).layer!, values);
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
  for (const p of [...a.flags, ...(a.focusFlag ? [a.focusFlag] : [])]) {
    if (!used.top.has(p.figmaName)) continue;
    rows.push(
      <label key={p.figmaName} className="ctl">
        <span className="ctl-name">{p.name}</span>
        <input type="checkbox" checked={!!values[p.figmaName]} onChange={(e) => onValues({ ...values, [p.figmaName]: e.target.checked })} />
      </label>,
    );
  }
  for (const [k, v] of Object.entries(texts)) {
    rows.push(
      <label key={`t-${k}`} className="ctl">
        <span className="ctl-name">{k === 'value' ? 'value (처음 값)' : k}</span>
        <textarea className="search" rows={1} value={v} onChange={(e) => onTexts({ ...texts, [k]: e.target.value })} />
      </label>,
    );
  }
  return <div className="sb-controls">{rows}</div>;
}

/** 가이드가 없는 페이지: 속성 선택지마다 한 장씩 (Figma 프레임처럼) */
function Cases({ sc, sel }: { sc: SiteComponent; sel: Sel }) {
  const c = sc.data;
  const a = analyze(c);
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
                      <Render interactive={false} sel={findVariant(c, { ...sel, [p.name]: o }, p.name).props} values={values} />
                    </span>
                    <span className="case-name">{o}</span>
                  </div>
                ))}
                {p === a.stateProp && a.focusFlag ? (
                  <div className="case">
                    <span className="case-stage">
                      <Render interactive={false} sel={findVariant(c, { ...sel, [p.name]: a.restOption! }).props} values={{ ...values, [a.focusFlag.figmaName]: true }} />
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
        <Editable path="overview" label="개요" value={text} />
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

const itemText = (t: string | { id?: string; text: string }) => (typeof t === 'string' ? t : t.text);

/** 서비스 UI 가이드의 사용 정책 (언제 쓰나, 기준, Do · Don't). 기준 · Do · Don't에는 포털 규칙 번호가 붙을 수 있다 */
function PolicySection({ pl }: { pl: NonNullable<Guide['policy']> }) {
  const src = pl.source;
  const scope = useContext(TextScope);
  const { role } = usePortal();
  const key = scope?.key || '';
  // UX 가이드 담당이 고친 글: 열린 초안(없으면 게시본)의 규칙을 고쳐 사용 가이드 초안으로. 번호는 그대로
  const saveGuide = (fn: (g: P.GuideDoc) => P.GuideDoc) => {
    const cur = (P.openDraft('guide', key)?.after as P.GuideDoc | undefined) || P.guide(key);
    if (!cur) throw new Error('사용 가이드가 없는 컴포넌트입니다');
    const next = fn(JSON.parse(JSON.stringify(cur)));
    return P.draftGuide(role, key, { lead: next.lead, rules: next.rules });
  };
  const setRule = (id: string, text: (old: string) => string) => (v: string) =>
    saveGuide((g) => ({ ...g, rules: g.rules.map((r) => (r.id === id ? { ...r, text: text(r.text).replace('\u0000', v) } : r)) }));
  const split = (t: string) => {
    const i = t.indexOf(': ');
    return i > 0 ? [t.slice(0, i), t.slice(i + 2)] : ['기준', t];
  };
  const G = { perm: 'guide' as const };
  return (
    <>
      <h3>{pl.title}</h3>
      {pl.lead ? <Editable {...G} as="p" className="note" path="policy.lead" label="정책 요약" value={pl.lead} onSave={(v) => saveGuide((g) => ({ ...g, lead: v }))} /> : null}
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
                  {r.id ? <Editable {...G} path={`policy.${r.id}.name`} label={`${r.id} 항목`} value={r.name} onSave={setRule(r.id, (t) => `\u0000: ${split(t)[1]}`)} /> : r.name}
                </td>
                <td className="pt-text">
                  {r.id ? <Editable {...G} path={`policy.${r.id}.desc`} label={`${r.id} 기준`} value={r.desc} onSave={setRule(r.id, (t) => `${split(t)[0]}: \u0000`)} /> : r.desc}
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
              <ul>{pl.do!.map((t, i) => <li key={i}>{typeof t !== 'string' && t.id ? <><Editable {...G} path={`policy.${t.id}`} label={`${t.id} Do`} value={t.text} onSave={setRule(t.id, () => '\u0000')} /></> : itemText(t)}</li>)}</ul>
            </section>
          ) : null}
          {(pl.dont || []).length ? (
            <section className="gd-dont">
              <h4>Don't · 이건 피합니다</h4>
              <ul>{pl.dont!.map((t, i) => <li key={i}>{typeof t !== 'string' && t.id ? <><Editable {...G} path={`policy.${t.id}`} label={`${t.id} Don't`} value={t.text} onSave={setRule(t.id, () => '\u0000')} /></> : itemText(t)}</li>)}</ul>
            </section>
          ) : null}
        </div>
      ) : null}
      {(pl.related || []).length ? (
        <p className="gd-related">
          함께 보기{' '}
          {pl.related!.map((r) => (
            <span key={r.name} className="chip">
              <UxRef r={r.file} label={r.name} /> · {r.desc}
            </span>
          ))}
        </p>
      ) : null}
      {src ? (
        <p className="gd-source">
          정책 출처 UX 패턴 가이드{src.release ? ` ${src.release}` : ''} ·{' '}
          {(pl.sources || [src]).map((x, i) => (
            <span key={x.id}>
              {i ? ' · ' : ''}
              <UxRef r={x.id} label={x.title} />
            </span>
          ))}
        </p>
      ) : null}
    </>
  );
}

/** 가이드 예시 하나: React 컴포넌트를 그림으로만 그린다 (포인터 · 키보드 없음) */
function Example({ sc, props, zoom, slotRef }: { sc: SiteComponent; props: Sel; zoom?: boolean; slotRef?: (el: HTMLSpanElement | null) => void }) {
  if (!variantOf(sc.data, props)) return <span className="error">변형 없음</span>;
  return (
    <span className={`gd-slot${zoom ? ' gd-zoom' : ''}`} ref={slotRef}>
      <Render interactive={false} sel={props} />
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
      <Editable as="p" className="note" path="states.lead" label="States 설명" value={st.lead} />
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
                    {r.name}
                  </td>
                  <td className="gd-ex">
                    <Example sc={sc} props={props} />
                  </td>
                  <td className="pt-text">
                    {r.missing ? (
                      <Editable className="gd-missing" path={`states.extra.${r.name}`} label={`States › ${r.name}`} value="" placeholder="가이드 설명 없음 · 컴포넌트에만 있는 상태입니다." />
                    ) : (
                      <Editable path={`states.rows.${i}.desc`} label={`States › ${r.name}`} value={r.desc} />
                    )}
                  </td>
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
      <Editable as="p" className="note" path="variants.lead" label="Variants 설명" value={vr.lead} />
      {vr.groups.map((grp, gi) => (
        <div key={gi}>
          <h4>{grp.title}</h4>
          <Editable as="p" className="note" path={`variants.groups.${gi}.lead`} label={`Variants › ${grp.title} 설명`} value={grp.lead} />
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
                      <td className="pt-text">
                        <Editable path={`variants.groups.${gi}.rows.${i}.desc`} label={`Variants › ${grp.title} › ${r.name}`} value={r.desc} />
                      </td>
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
      <Editable as="p" className="note" path="anatomy.lead" label="Anatomy 설명" value={an.lead} />
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
            <Editable path={`anatomy.parts.${x.n}.desc`} label={`Anatomy › ${x.name}`} value={x.desc} />
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
      <Editable as="p" className="note" path="spec.lead" label="Spec 설명" value={sp.lead} />
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
function DevDetails({ c, name }: { c: ComponentData; name: string }) {
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
          <CopyBtn value={fileOf(name)} />
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
