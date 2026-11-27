// Figma에서 읽어 포털에서 만든 컴포넌트 페이지 (저장소에 아직 React 파일이 없는 것).
// DS 담당자은 ✎ 편집에서 Figma 노드를 보고 React 코드를 만든다: AI(Figma 레이어 → Claude) 또는 속성으로 만든 기본 틀 → 채팅으로 다듬기 → 초안.
// 관리자가 배포하면 모두에게 이 코드로 미리보기가 그려지고, 저장소 파일로 내려받아 커밋한다.
import { useLayoutEffect, useRef, useState } from 'react';
import { CtlGroup, CtlIcon, CtlSelect, CtlText, CtlToggle } from '../controls';
import type { CSSProperties, ReactNode } from 'react';
import * as P from '../portal/store';
import type { PortalComp } from '../portal/store';
import { usePortal } from '../portal/ctx';
import { compile, fileOf, pascal, repoSource } from '../live';
import type { LiveComponent } from '../live';
import { starterCode } from '../compgen';
import { generateComponent, getApiKey } from '../codechat';
import { fetchFigmaLayers, getFigmaToken, saveFigmaToken } from '../figma';
import { AiSummary } from './AiSummary';
import { DraftBox, Editable, Table, TextEditToggle, TextScope, TocInline } from '../ui';
import { CompChecks, CompEditor, CompRules, CompUsage, compRules } from './compPortal';
import { Boundary, CodeBlock, CodeChat } from './ComponentPage';

type C = PortalComp & { draftId?: string; code?: string };

const EXAMPLE = 'Checkbox';

/** 파일 내려받기 (저장소에 커밋할 것) */
function download(file: string, text: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  a.download = file;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** 저장소 components/<key>/component.json 모양 (포털이 아는 만큼) */
const componentJson = (c: C) => JSON.stringify({ key: c.key, name: c.name, description: c.description, figma: c.figma, props: c.props, variants: c.variants }, null, 2) + '\n';

export function Preview({ C: Comp, c }: { C: LiveComponent; c: Pick<PortalComp, "props"> }) {
  const vprops = c.props.filter((p) => p.type === 'variant');
  const bools = c.props.filter((p) => p.type === 'boolean');
  const [sel, setSel] = useState<Record<string, unknown>>(() => Object.fromEntries([...vprops, ...bools].map((p) => [ident(p.name), p.type === 'boolean' ? p.default === true || p.default === 'true' : p.default])));
  const icons = Comp.meta?.icons || {};
  const [texts, setTexts] = useState<Record<string, string>>(() => ({ ...(Comp.meta?.texts || {}), ...icons }));
  // Figma 속성 패널처럼: 변형 = 드롭다운, 켜기/끄기 = 토글, 글 = 입력칸, 아이콘 = 목록에서 고르기
  const rows: ReactNode[] = [
    ...vprops.map((p) => <CtlSelect key={p.name} name={p.name} value={String(sel[ident(p.name)] ?? '')} options={p.options || []} onChange={(o) => setSel({ ...sel, [ident(p.name)]: o })} />),
    ...bools.map((p) => <CtlToggle key={p.name} name={p.name} checked={!!sel[ident(p.name)]} onChange={(v) => setSel({ ...sel, [ident(p.name)]: v })} />),
    ...Object.entries(texts)
      .filter(([k]) => !icons[k])
      .map(([k, v]) => <CtlText key={`t-${k}`} name={k} value={v} onChange={(x) => setTexts({ ...texts, [k]: x })} />),
  ];
  const iconRows = Object.keys(icons).map((k) => <CtlIcon key={`i-${k}`} name={k} value={texts[k] ?? icons[k]} onChange={(x) => setTexts({ ...texts, [k]: x })} />);
  if (iconRows.length) rows.push(<CtlGroup key="g-icons">아이콘</CtlGroup>, ...iconRows);
  return (
    <div className="sb-body">
      <ZoomCanvas>
        <Boundary resetKey={String(Comp)}>
          <Comp {...live(Comp, sel, texts, setSel, setTexts)} />
        </Boundary>
      </ZoomCanvas>
      {rows.length ? <div className="sb-controls">{rows}</div> : null}
    </div>
  );
}

const ZOOMS = [0.25, 0.33, 0.5, 0.67, 0.75, 0.9, 1, 1.25, 1.5, 2];

/** 미리보기 칸: 확대 · 축소 (기본은 칸에 맞춤 = 원본이 칸보다 크면 줄이고, 작으면 100%).
 *  안의 링크는 미리보기에서 페이지를 옮기지 않는다 */
export function ZoomCanvas({ children }: { children: ReactNode }) {
  const canvas = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number | 'fit'>('fit');
  const [fit, setFit] = useState(1);
  useLayoutEffect(() => {
    const cv = canvas.current;
    const st = stage.current;
    if (!cv || !st) return;
    const measure = () => {
      // 지금 배율로 그려진 크기 ÷ 배율 = 원본 크기
      const z = Number(st.style.zoom) || 1;
      const r = st.getBoundingClientRect();
      const w = r.width / z;
      const h = r.height / z;
      const cs = getComputedStyle(cv);
      const aw = cv.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const ah = Math.max(560, window.innerHeight * 0.7);
      const f = Math.min(1, aw / Math.max(1, w), ah / Math.max(1, h));
      setFit(Math.max(0.2, Math.floor(f * 100) / 100));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(cv);
    ro.observe(st);
    return () => ro.disconnect();
  }, []);
  const z = zoom === 'fit' ? fit : zoom;
  const step = (d: number) => {
    const i = ZOOMS.findIndex((x) => x >= z - 0.001);
    const cur = i < 0 ? ZOOMS.length - 1 : ZOOMS[i] > z + 0.001 && d > 0 ? i - 1 : i;
    setZoom(ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, cur + d))]);
  };
  return (
    <div className={`sb-canvas sb-zoomable${z > fit + 0.001 ? ' sb-scroll' : ''}`} ref={canvas}>
      <div className="sb-zoom" role="group" aria-label="미리보기 배율">
        <button type="button" onClick={() => step(-1)} disabled={z <= ZOOMS[0] + 0.001} aria-label="축소">−</button>
        <span className="sb-zoom-v" aria-live="polite">{Math.round(z * 100)}%</span>
        <button type="button" onClick={() => step(1)} disabled={z >= ZOOMS[ZOOMS.length - 1] - 0.001} aria-label="확대">+</button>
        <button type="button" className={zoom === 'fit' ? 'on' : ''} onClick={() => setZoom('fit')}>맞춤</button>
        <button type="button" className={zoom === 1 ? 'on' : ''} onClick={() => setZoom(1)}>원본</button>
      </div>
      <figure className="sb-fig">
        <div
          className="sb-stage"
          ref={stage}
          style={{ zoom: z } as CSSProperties}
          onClickCapture={(e) => {
            const a = (e.target as HTMLElement).closest('a[href]');
            if (a) e.preventDefault();
          }}
        >
          {children}
        </div>
      </figure>
    </div>
  );
}

/** 미리보기에서 실제로 동작하게: state=default는 넘기지 않아 마우스 · 키보드 반응이 살아 있게 하고,
 *  컴포넌트가 받는 on<속성>Change · onChange로 바뀐 값을 옆 패널에 되돌려 받는다 (눌러서 켜고 끄기 · 고르기 · 입력) */
function live(Comp: LiveComponent, sel: Record<string, unknown>, texts: Record<string, string>, setSel: (f: (s: Record<string, unknown>) => Record<string, unknown>) => void, setTexts: (f: (t: Record<string, string>) => Record<string, string>) => void) {
  const src = String(Comp);
  const has = (n: string) => src.includes(n);
  const props: Record<string, unknown> = { ...sel, ...texts };
  if (props.state === 'default') delete props.state;
  const read = (v: unknown) => (v && typeof v === 'object' && 'target' in (v as object) ? ((v as { target: HTMLInputElement }).target.type === 'checkbox' ? (v as { target: HTMLInputElement }).target.checked : (v as { target: HTMLInputElement }).target.value) : v);
  for (const k of Object.keys(sel)) {
    if (k === 'state') continue;
    const h = `on${k[0].toUpperCase()}${k.slice(1)}Change`;
    if (has(h)) props[h] = (v: unknown) => setSel((s) => ({ ...s, [k]: read(v) }));
  }
  for (const k of Object.keys(texts)) {
    const h = `on${k[0].toUpperCase()}${k.slice(1)}Change`;
    if (has(h)) props[h] = (v: unknown) => setTexts((t) => ({ ...t, [k]: String(read(v) ?? '') }));
    else if (k === 'value' && has('onChange')) props.onChange = (v: unknown) => setTexts((t) => ({ ...t, value: String(read(v) ?? '') }));
  }
  return props;
}

/** Figma 속성 이름 → 코드 속성 이름 (compgen과 같은 규칙) */
const ident = (s: string) => {
  const w = s.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
  const id = w.map((x, i) => (i ? x[0].toUpperCase() + x.slice(1) : x[0].toLowerCase() + x.slice(1))).join('');
  return /^[a-zA-Z_]/.test(id) ? id : `p${id}`;
};

export function FigmaTokenRow() {
  const [t, setT] = useState(getFigmaToken());
  const [v, setV] = useState('');
  return t ? (
    <p className="cc-key">
      <span className="cc-on">● Figma 연결됨 (레이어까지 읽음)</span>{' '}
      <button className="lnk" onClick={() => (saveFigmaToken(''), setT(''))}>
        토큰 지우기
      </button>
    </p>
  ) : (
    <form
      className="row cc-key"
      onSubmit={(e) => {
        e.preventDefault();
        saveFigmaToken(v.trim());
        setT(v.trim());
        setV('');
      }}
    >
      <span className="muted">Figma 개인 토큰(figd_…)을 넣으면 실제 Figma 파일에서 속성과 레이어(크기 · 색 · 글자)까지 읽습니다. 이 브라우저에만 저장됩니다. 없으면 흉내 모드(운영 기준 · 예시 노드)입니다.</span>
      <input type="password" className="in-sm" placeholder="figd_…" aria-label="Figma 개인 토큰" value={v} onChange={(e) => setV(e.target.value)} />
      <button className="btn2 sm" disabled={!v.trim()}>
        연결
      </button>
    </form>
  );
}

/** 편집 모드: React 코드 만들기 → 다듬기 → 초안 */
function CodeMaker({ c, name, src, setSrc, saved }: { c: C; name: string; src: string | null; setSrc: (s: string | null) => void; saved: string | null }) {
  const { role, act, toast } = usePortal();
  const [busy, setBusy] = useState('');
  const [ask, setAsk] = useState('');
  const value = src ?? saved ?? '';
  const err = value ? compile(name, value).error : undefined;
  const makeStarter = () => {
    setSrc(starterCode(name, c));
    toast('Figma 속성으로 기본 틀을 만들었습니다 · 채팅으로 모양을 맞춰 주세요');
  };
  const makeAI = async () => {
    setBusy('Figma 읽는 중…');
    try {
      const layers = c.figma?.url ? await fetchFigmaLayers(c.figma.url).catch((e) => (toast(`레이어는 못 읽고 속성만 보냅니다 · ${(e as Error).message}`), null)) : null;
      setBusy('Claude가 코드를 만드는 중… (1~2분)');
      const r = await generateComponent(name, c, layers, { name: EXAMPLE, source: repoSource(EXAMPLE) }, ask.trim() || undefined);
      if (!r) return;
      if (r.source) {
        setSrc(r.source);
        toast(r.reply.slice(0, 120));
      } else toast(r.reply);
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy('');
    }
  };
  const save = () =>
    act(() => P.draftCode(role, c.key, fileOf(name), value, ''), (d) => `초안 ${d.id} 저장 · 내 변경에서 미리보기 확인 후 배포 요청`).then((d) => d && setSrc(null));
  const hasAI = !!getApiKey();
  return (
    <section className="ed-panel" aria-label="React 코드 만들기">
      <div className="ed-h">
        <b>React 코드 만들기</b>
        <span>
          {fileOf(name)} · Figma 노드를 보고 첫 코드를 만든 뒤 채팅으로 다듬습니다. 초안으로 저장한 뒤 내 변경에서 배포 요청합니다
        </span>
      </div>
      <ol className="nc-steps">
        <li>
          <b>Figma 노드</b>{' '}
          {c.figma?.url ? (
            <a href={c.figma.url} target="_blank" rel="noopener">
              {c.name} · {c.figma.nodeId}
            </a>
          ) : (
            '없음'
          )}{' '}
          <span className="muted">· 속성 {c.props.length}개 · 변형 {c.variants.length}개</span>
          <FigmaTokenRow />
        </li>
        <li>
          <b>첫 코드 만들기</b>
          <div className="row">
            <button className="btn2 primary sm" disabled={!hasAI || !!busy} onClick={makeAI} title={hasAI ? '' : '아래 채팅 칸에 Anthropic API 키를 넣으면 쓸 수 있습니다'}>
              Figma 보고 AI로 만들기
            </button>
            <button className="btn2 sm" disabled={!!busy} onClick={makeStarter}>
              속성으로 기본 틀 만들기
            </button>
            {busy ? <span className="muted" role="status">{busy}</span> : null}
          </div>
          {hasAI ? (
            <input className="in-sm nc-ask" placeholder="덧붙일 말 (선택) 예: 닫기 버튼은 오른쪽 위, 너비 400" aria-label="AI에게 덧붙일 말" value={ask} onChange={(e) => setAsk(e.target.value)} />
          ) : (
            <p className="muted">AI로 만들려면 아래 채팅 칸에 Anthropic API 키를 넣으세요. 키가 없으면 속성으로 기본 틀만 만들 수 있습니다.</p>
          )}
        </li>
        <li>
          <b>다듬기 · 초안 저장</b>
          {value ? (
            <CodeChat
              name={name}
              value={value}
              onChange={setSrc}
              error={err}
              onSave={save}
              onReset={() => setSrc(null)}
              hint="위 미리보기를 보며 Figma와 다른 곳을 말해 주세요. 예: &quot;모서리를 16px로&quot;, &quot;제목 글자를 18px 굵게&quot;."
            />
          ) : (
            <p className="muted">첫 코드를 만들면 여기서 채팅으로 고치고 초안으로 저장합니다.</p>
          )}
        </li>
      </ol>
    </section>
  );
}

export function PortalOnlyPage({ c, draft }: { c: C; draft?: boolean }) {
  const { textEdit, can, role } = usePortal();
  const name = pascal(c.key);
  const r = P.itemByKey(c.key);
  const ru = compRules(c.key);
  const published = P.publishedCode(c.key);
  const codeDraft = P.openDraft('code', c.key);
  const [src, setSrc] = useState<string | null>(null);
  const editing = textEdit && can('code');
  const saved = codeDraft?.after.source ?? published;
  const shown = editing ? src ?? saved : published;
  const compiled = shown ? compile(name, shown) : null;
  const Comp = compiled?.Component || (published ? compile(name, published).Component : undefined);
  const [tab, setTab] = useState<'preview' | 'code'>('preview');
  return (
    <TextScope.Provider value={{ key: c.key, name: c.name }}>
      <p className="eyebrow">{draft ? 'Components · 게시 전 초안' : 'Components'}</p>
      <div className="h1-row">
        {r && !draft ? (
          <Editable as="h1" path="title" label="컴포넌트 제목" value={(textEdit ? P.openDraft('item', r.code)?.after.name : undefined) || r.name || c.name} onSave={(v) => P.draftItem(role, r.code, { name: v.trim() })} />
        ) : (
          <h1>{c.name}</h1>
        )}
        <TextEditToggle />
      </div>
      {r && !draft ? (
        <Editable as="p" className="lead" path="lead" label="페이지 설명" value={(textEdit ? P.openDraft('item', r.code)?.after.meaning : undefined) || r.meaning || c.description || ''} onSave={(v) => P.draftItem(role, r.code, { meaning: v })} />
      ) : (
        <p className="lead">{c.description}</p>
      )}
      <CompChecks c={c} hasGuide={false} />
      <TocInline />
      <AiSummary k={c.key} name={r?.name || c.name} codeName={name} meaning={r?.meaning || c.description || ''} props={c.props} />
      {draft ? (
        <>
          <p className="note">
            Figma에서 읽은 새 컴포넌트입니다. 게시 전이라 담당만 볼 수 있습니다. ✎ 편집에서 React 코드를 만들어 초안으로 저장하면, 내 변경에서 Figma 초안과 코드 초안을 함께 배포 요청합니다.
          </p>
          <DraftBox d={P.draftById(c.draftId!)} />
        </>
      ) : null}
      {!draft ? <CompEditor c={c} /> : null}
      {Comp ? (
        <section className="sb" id="sb">
          <div className="sb-tabs" role="tablist">
            {(['preview', 'code'] as const).map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>
                {t === 'preview' ? '미리보기' : '코드'}
              </button>
            ))}
            {editing && src !== null ? <span className="muted sb-compare">편집 중인 코드</span> : !published ? <span className="muted sb-compare">초안 코드 (게시 전)</span> : null}
          </div>
          {tab === 'preview' ? (
            <Preview key={String(Comp)} C={Comp} c={c} />
          ) : (
            <div className="sb-body sb-code">
              <CodeBlock label={`${fileOf(name)}${published ? ' (포털에 게시된 코드)' : ''}`} text={shown || published || ''} />
            </div>
          )}
        </section>
      ) : (
        <div className="sb-ph">
          <span>{editing ? '아래 "React 코드 만들기"에서 첫 코드를 만들면 여기에 그려집니다' : '아직 React 코드가 없습니다 · DS 담당자이 ✎ 편집에서 Figma 노드로 코드를 만들면 여기에 그려집니다'}</span>
        </div>
      )}
      {compiled?.error && editing ? <p className="error">코드 오류 · {compiled.error}</p> : null}
      {editing ? (
        <>
          <DraftBox d={codeDraft} />
          <CodeMaker c={c} name={name} src={src} setSrc={setSrc} saved={saved} />
        </>
      ) : null}
      {published && !draft ? (
        <p className="note">
          저장소에는 아직 파일이 없습니다. 개발 담당이{' '}
          <button className="lnk" onClick={() => download(`${name}.tsx`, published)}>
            {name}.tsx
          </button>
          와{' '}
          <button className="lnk" onClick={() => download('component.json', componentJson(c))}>
            component.json
          </button>
          을 받아 <code>src/ds/components/</code> · <code>components/{c.key}/</code>에 커밋하면 저장소 컴포넌트가 됩니다.
        </p>
      ) : null}
      <h2 id="props">Properties</h2>
      <h3>Figma 속성</h3>
      <Table
        cols={['속성', '타입', '기본값', '선택지']}
        rows={c.props.map((p) => (
          <tr key={p.name}>
            <td>{p.name}</td>
            <td>{p.type}</td>
            <td>{String(p.default ?? '')}</td>
            <td>{(p.options || []).join(', ')}</td>
          </tr>
        ))}
      />
      <p className="muted">
        변형 {c.variants.length}개 ·{' '}
        <a href={c.figma?.url} target="_blank" rel="noopener">
          Figma 노드 {c.figma?.nodeId}
        </a>
      </p>
      {ru.length ? (
        <>
          <h2>Guidelines</h2>
          <CompRules k={c.key} />
        </>
      ) : null}
      {!draft ? <CompUsage k={c.key} /> : null}
    </TextScope.Provider>
  );
}
