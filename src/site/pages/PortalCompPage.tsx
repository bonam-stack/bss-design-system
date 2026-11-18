// Figma에서 읽어 포털에서 만든 컴포넌트 페이지 (저장소에 아직 React 파일이 없는 것).
// DS 담당자은 ✎ 편집에서 Figma 노드를 보고 React 코드를 만든다: AI(Figma 레이어 → Claude) 또는 속성으로 만든 기본 틀 → 채팅으로 다듬기 → 초안.
// 관리자가 배포하면 모두에게 이 코드로 미리보기가 그려지고, 저장소 파일로 내려받아 커밋한다.
import { useState } from 'react';
import type { ReactNode } from 'react';
import * as P from '../portal/store';
import type { PortalComp } from '../portal/store';
import { usePortal } from '../portal/ctx';
import { compile, fileOf, pascal, repoSource } from '../live';
import type { LiveComponent } from '../live';
import { starterCode } from '../compgen';
import { generateComponent, getApiKey } from '../codechat';
import { fetchFigmaLayers, getFigmaToken, saveFigmaToken } from '../figma';
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

function Preview({ C: Comp, c }: { C: LiveComponent; c: C }) {
  const vprops = c.props.filter((p) => p.type === 'variant');
  const bools = c.props.filter((p) => p.type === 'boolean');
  const [sel, setSel] = useState<Record<string, unknown>>(() => Object.fromEntries([...vprops, ...bools].map((p) => [ident(p.name), p.type === 'boolean' ? p.default === true || p.default === 'true' : p.default])));
  const [texts, setTexts] = useState<Record<string, string>>(() => ({ ...(Comp.meta?.texts || {}) }));
  const rows: ReactNode[] = [
    ...vprops.map((p) => (
      <div key={p.name} className="ctl">
        <span className="ctl-name">{p.name}</span>
        <div className="seg">
          {(p.options || []).map((o) => (
            <button key={o} aria-pressed={sel[ident(p.name)] === o} onClick={() => setSel({ ...sel, [ident(p.name)]: o })}>
              {o}
            </button>
          ))}
        </div>
      </div>
    )),
    ...bools.map((p) => (
      <label key={p.name} className="ctl">
        <span className="ctl-name">{p.name}</span>
        <input type="checkbox" checked={!!sel[ident(p.name)]} onChange={(e) => setSel({ ...sel, [ident(p.name)]: e.target.checked })} />
      </label>
    )),
    ...Object.entries(texts).map(([k, v]) => (
      <label key={`t-${k}`} className="ctl">
        <span className="ctl-name">{k}</span>
        <textarea className="search" rows={1} value={v} onChange={(e) => setTexts({ ...texts, [k]: e.target.value })} />
      </label>
    )),
  ];
  return (
    <div className="sb-body">
      <div className="sb-canvas">
        <figure className="sb-fig">
          <div className="sb-stage">
            <Boundary resetKey={String(Comp)}>
              <Comp {...sel} {...texts} />
            </Boundary>
          </div>
        </figure>
      </div>
      {rows.length ? <div className="sb-controls">{rows}</div> : null}
    </div>
  );
}

/** Figma 속성 이름 → 코드 속성 이름 (compgen과 같은 규칙) */
const ident = (s: string) => {
  const w = s.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
  const id = w.map((x, i) => (i ? x[0].toUpperCase() + x.slice(1) : x[0].toLowerCase() + x.slice(1))).join('');
  return /^[a-zA-Z_]/.test(id) ? id : `p${id}`;
};

function FigmaTokenRow() {
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
