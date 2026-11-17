// BSS 디자인 포털 페이지: 시작하기 · Foundations(토큰) · 목록 · 카탈로그 항목 · UX 거버넌스 · 관리.
// 고친 내용은 초안 → 포털 승인 담당 게시.
import type { FormEvent, ReactNode } from 'react';
import * as P from '../portal/store';
import type { Draft, HistoryEntry, Item, Kind } from '../portal/store';
import { usePortal } from '../portal/ctx';
import { patterns, icons } from '../data';
import { docsFor, docsIn, guideRoute, guideSource } from '../guide';
import { BumpTag, Check, CodeLink, UxRef, ConfirmButton, DraftBox, Drafts, EditBtn, GuideChips, Head, RulesBlock, St, StOf, Table, fmt, human, joinNodes } from '../ui';

const FIGMA_FILE = '9AioWOXVOVm5C7kdSxSEEP';
const KIND_LABEL: Record<Kind, string> = { block: 'Blocks', comp: 'Components', layout: 'Layout rules' };
const formValues = (f: HTMLFormElement) => Object.fromEntries(new FormData(f)) as Record<string, string>;
const list = (s?: string) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);

/** 라우트 → 포털 페이지 (없으면 null) */
export function portalPage(route: string, isEditor: boolean): ReactNode | null {
  switch (route) {
    case 'overview': return <Overview />;
    case 'stack': return <Stack />;
    case 'updates': return <Updates />;
    case 'tokens': return <Tokens />;
    case 'components': return <ItemList kind="comp" />;
    case 'blocks': return <ItemList kind="block" />;
    case 'patterns': return <PatternList />;
    case 'rules': return <Rules />;
    case 'slots': return <Slots />;
    case 'lint': return <Lint />;
    case 'pub': return isEditor ? <Pub /> : null;
    case 'promo': return isEditor ? <Promo /> : null;
    case 'chg': return isEditor ? <Chg /> : null;
  }
  const it = P.item(route);
  if (it && !it.key) return <ItemPage it={it} />;
  return null;
}

// ---------- 시작하기 ----------

function Overview() {
  const I = P.items();
  const n = (k: Kind) => I.filter((i) => i.kind === k).length;
  const cards = [
    ['components', 'Components', `컴포넌트 ${n('comp')}개`, '블록 안에 들어가는 최소 부품'],
    ['blocks', 'Blocks', `블록 ${n('block')}`, '빈칸 하나를 채우는 업무 단위 묶음'],
    ['patterns', 'Patterns', `레이아웃 규칙 ${n('layout')} · 패턴 ${patterns.length}`, '화면을 어떤 순서로 쌓을지'],
    ['rules', 'UX 거버넌스', `규칙 ${P.rules().length}개`, 'UX표준가이드 규칙과 연결표'],
    ['icons', 'Foundations', `아이콘 ${icons.icons.length}개`, '아이콘 · 디자인 토큰'],
    ['stack', '조립 구조', 'Stack 5단계', '앱 구조 → 레이아웃 → 빈칸 → 블록 → 컴포넌트'],
  ];
  return (
    <>
      <Head
        eyebrow="BSS Design System"
        title="BSS 디자인 포털"
        lead="BSS 백오피스 화면을 만드는 기준입니다. SB Studio는 이 포털에 게시된 버전만 읽어 화면을 조립합니다."
        extra={
          <div className="checks">
            <Check on label={`게시 ${P.version()}`} />
            <Check on label="카탈로그 0.5" />
            <Check on label="UX표준가이드 1.2" />
            <Check on label="디자인 토큰 v0.5" />
          </div>
        }
      />
      <div className="cards">
        {cards.map((c) => (
          <a key={c[0]} className="card" href={`#${c[0]}`}>
            <span className="card-eb">{c[1]}</span>
            <b>{c[2]}</b>
            <span>{c[3]}</span>
          </a>
        ))}
      </div>
      <h2 id="latest">최근 업데이트</h2>
      {P.history().slice(0, 3).map((h, i) => (
        <RelCard key={i} h={h} />
      ))}
      <p>
        <a className="lnk" href="#updates">
          업데이트 전체 보기
        </a>
      </p>
    </>
  );
}

function RelCard({ h }: { h: HistoryEntry }) {
  return (
    <article className="rel">
      <div className="row">
        <b className="mono">{h.version}</b>
        <St c={h.mode === '롤백' ? 'ng' : h.mode === '구축' ? 'wait' : 'ok'} t={h.mode} />
        <BumpTag b={h.bump} />
        <span className="muted">
          {fmt(h.at)}
          {h.from ? ` · ${h.from}에서` : ''}
        </span>
      </div>
      {h.reason ? <p>{h.reason}</p> : null}
      {(h.notes || []).length ? (
        <ul>
          {h.notes.map((n, i) => (
            <li key={i}>
              {n.title}
              {n.lines ? (
                <>
                  {' · '}
                  <span className="muted">{n.lines.join(' · ')}</span>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function Stack() {
  const I = P.items();
  const n = (k: Kind) => I.filter((i) => i.kind === k).length;
  const rows: [string, string, string, number, string][] = [
    ['앱 구조', 'app', '화면이 바뀌어도 남는 바탕 틀 · GNB · LNB · 콘텍스트 바 · 본문 영역', P.slots().filter((x) => x.owner === 'app').length, 'g-layout-common'],
    ['레이아웃 규칙', 'l-', '본문 영역을 어떤 빈칸 순서로 나눌지 정하는 규칙', n('layout'), 'patterns'],
    ['빈칸(슬롯)', '경로', '부품이 들어갈 자리 · 고정 · 쌓기 · 자유', P.slots().length, 'slots'],
    ['블록', 'b-', '빈칸 하나를 채우는 업무 단위 묶음', n('block'), 'blocks'],
    ['컴포넌트', 'c-', '블록 안에 들어가는 최소 부품', n('comp'), 'components'],
  ];
  return (
    <>
      <Head eyebrow="시작하기" title="조립 구조" lead="화면은 큰 단위에서 작은 단위로 쌓아 조립합니다. SB Studio는 4단계에서 이 순서대로 놓고 5단계에서 디자인 에셋을 입힙니다." />
      <h2 id="stack">Stack</h2>
      <ol className="stk">
        {rows.map((x, i) => (
          <li key={x[0]}>
            <span className="sn">{i + 1}</span>
            <a href={`#${x[4]}`}>
              <b>{x[0]}</b>
            </a>
            <span>{x[2]}</span>
            <em>{x[3]}개</em>
          </li>
        ))}
      </ol>
      <h2 id="types">화면 유형 판정 순서</h2>
      <p>
        <a href="#rules">화면 유형 판정 규칙</a> 순서로 판정합니다.
      </p>
      <ul>
        <li>
          <b>특수형</b> · 표준 틀로 만들 수 없는 예외 화면 · Stack 조립 제외 · 포털 승인 담당 승인
        </li>
        <li>
          <b>노드형</b> · 단계가 한 방향으로 이어지는 절차형 업무 · <a href="#l-node">노드형 레이아웃</a>
        </li>
        <li>
          <b>일반형</b> · 조회조건 → 상세정보 → 컨텐트 · <a href="#l-general">일반형 레이아웃</a>
        </li>
        <li>
          <b>팝업</b> · 바탕 화면 위 레이어 · <a href="#l-popup">팝업 레이아웃</a>
        </li>
      </ul>
      <h2 id="owners">기준 원본 · 관리</h2>
      <Table
        cols={['대상', '원본', '편집', '게시']}
        rows={[
          ['블록 · 컴포넌트 (모양)', 'Figma 디자인 시스템', P.ROLES.ds, P.ROLES.approver],
          ['레이아웃 규칙 · 규칙 · 사용 가이드', 'UX표준가이드 · 이 포털', P.ROLES.ux, P.ROLES.approver],
          ['임시 부품 tb- · tc-', 'SB Studio 생성', '승격 심사', P.ROLES.approver],
        ].map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => (
              <td key={j}>{c}</td>
            ))}
          </tr>
        ))}
      />
    </>
  );
}

function Updates() {
  return (
    <>
      <Head eyebrow="시작하기" title="업데이트" lead="게시된 버전과 변경 노트입니다. MAJOR는 기존 것을 고치거나 지울 때(이미 만든 SB 재검수), MINOR는 추가 · 승격, PATCH는 설명 수정입니다." />
      <p className="note">
        UX 패턴 가이드는 {guideSource.release} 릴리스를 반영했습니다 ({guideSource.generated} 추출). 파운데이션 · 패턴 · 모듈 · 컴포넌트 가이드는 각 섹션에, 권장 · 금지는 <a href="#rules">규칙</a>에, 용어는 <a href="#glossary">용어사전</a>에 있습니다.
      </p>
      {P.history().map((h, i) => (
        <div key={i}>
          <h2 id={`v-${i}`} className="sr">
            {h.version}
          </h2>
          <RelCard h={h} />
        </div>
      ))}
    </>
  );
}

function Tokens() {
  const tk = [
    ['--color-bg-brand-strongest-default', '브랜드 · 주 버튼'],
    ['--color-bg-brand-faint-default', '브랜드 옅은 배경'],
    ['--color-fg-neutral-strongest', '본문 글자'],
    ['--color-fg-neutral-muted-default', '보조 글자'],
    ['--color-bg-neutral-muted', '회색 배경'],
    ['--color-border-neutral-muted', '테두리'],
    ['--color-bg-success-strongest', '성공'],
    ['--color-fg-danger-strong', '위험 글자'],
  ];
  return (
    <>
      <Head eyebrow="Foundations" title="디자인 토큰" lead="색 · 글꼴 · 모서리는 모두 디자인 토큰 v0.5를 씁니다. Figma 변수에서 읽은 값입니다." />
      <h2 id="semantic">Semantic 색</h2>
      <div className="tk">
        {tk.map(([k, l]) => (
          <div key={k}>
            <i style={{ background: `var(${k})` }} />
            <b>{l}</b>
            <code>{k}</code>
          </div>
        ))}
      </div>
    </>
  );
}

// ---------- 목록 ----------

function Grid({ list: L }: { list: Item[] }) {
  return (
    <div className="cards">
      {L.map((i) => (
        <a key={i.code} className="card" href={`#${i.code}`}>
          {i.status !== 'pub' ? <span className="card-eb">{P.STATUS[i.status]}</span> : null}
          <b>
            {i.name}
            {i.nameKo && i.nameKo !== i.name ? (
              <>
                {' '}
                <small>{i.nameKo}</small>
              </>
            ) : null}
          </b>
          <span>{human(i.meaning)}</span>
          <span className="checks sm">
            <Check on={i.design} label="Figma" />
            <Check on={i.ux} label="UX" />
          </span>
        </a>
      ))}
    </div>
  );
}

function ItemList({ kind }: { kind: 'comp' | 'block' }) {
  const { role, can, act, setTextEdit } = usePortal();
  const I = P.items().filter((i) => i.kind === kind);
  const isComp = kind === 'comp';
  const pend = P.drafts((d) => d.status === 'draft' && d.type === 'figma' && !!d.isNew);
  const onAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = formValues(e.currentTarget);
    act(() => P.draftFigma(role, { url: v.url.trim() }), (d) => `${d.after.name} 읽기 · 초안 ${d.id} 저장 · 이어서 React 코드를 만드세요`, (d) => `#new-${d.key}`).then((d) => d && setTextEdit(true));
  };
  const sample = (e: React.MouseEvent<HTMLButtonElement>) => {
    const f = e.currentTarget.form!;
    (f.elements.namedItem('url') as HTMLInputElement).value = `https://www.figma.com/design/${FIGMA_FILE}/Lib?node-id=9000-1`;
  };
  return (
    <>
      <Head
        eyebrow={isComp ? 'Components' : 'Blocks'}
        title={isComp ? '컴포넌트' : '블록'}
        lead={isComp ? '블록 안에 들어가는 최소 부품입니다. ✓ 표시는 Figma 디자인 에셋과 사용 가이드가 있는 것입니다.' : '블록은 빈칸 하나를 채우는 업무 단위 묶음입니다. 아래쪽 모듈은 UX 패턴 가이드의 모듈 정의입니다.'}
      />
      {isComp && can('figma') ? (
        <section className="ed-panel" aria-label="컴포넌트 추가">
          <div className="ed-h">
            <b>컴포넌트 추가</b>
            <span>① Figma 컴포넌트 노드 주소를 넣고 읽으면 새 컴포넌트 페이지(게시 전)가 열립니다 → ② 그 페이지에서 Figma를 보고 React 코드를 만듭니다(AI 또는 기본 틀) → ③ 포털 승인 담당이 Figma 초안과 코드 초안을 게시합니다.</span>
          </div>
          <form className="ef" onSubmit={onAdd}>
            <label className="w">
              Figma 노드 주소
              <input name="url" required placeholder="https://www.figma.com/design/…?node-id=…" />
            </label>
            <div className="row">
              <button className="btn2 primary sm">읽기 · 초안 저장</button>
              <button type="button" className="lnk" onClick={sample}>
                예시: Chip 노드 (흉내)
              </button>
            </div>
          </form>
          {pend.map((d) => (
            <div key={d.id}>
              <DraftBox d={d} />
              <p className="note">
                <a href={`#new-${d.key}`}>{d.after.name} 페이지에서 React 코드 만들기 →</a>
                {P.openDraft('code', d.key) ? ' · 코드 초안 있음' : ' · 아직 코드 없음'}
              </p>
            </div>
          ))}
        </section>
      ) : null}
      <h2 id="all" className="sr">
        전체
      </h2>
      <Grid list={I} />
    </>
  );
}

function PatternList() {
  const L = P.items().filter((i) => i.kind === 'layout');
  return (
    <>
      <Head eyebrow="Patterns" title="패턴" lead="화면을 어떤 순서로 쌓고, 부품을 어떻게 쓰는지 정한 UX 패턴과 레이아웃 규칙입니다." />
      <h2 id="ux">Figma 패턴</h2>
      <div className="cards">
        {patterns.map((p) => (
          <a key={p.key} className="card" href={`#pattern-${p.key}`}>
            <b>{p.name} 패턴</b>
            <span>{(p.overview || '').split('\n')[0]}</span>
          </a>
        ))}
      </div>
      {[...new Set(docsIn('patterns').map((d) => d.group))].map((g) => (
        <div key={g}>
          <h2>{g || 'UX 패턴'}</h2>
          <div className="cards">
            {docsIn('patterns')
              .filter((d) => d.group === g)
              .map((d) => (
                <a key={d.id} className="card" href={`#${guideRoute(d.id)}`}>
                  <b>{d.title}</b>
                  <span>{d.lead}</span>
                </a>
              ))}
          </div>
        </div>
      ))}
      <h2 id="layouts">레이아웃 규칙</h2>
      <Grid list={L} />
    </>
  );
}

// ---------- 카탈로그 항목 ----------

/** 카탈로그 항목 페이지 (상세 페이지가 따로 없는 블록 · 레이아웃 · 컴포넌트) */
function ItemPage({ it }: { it: Item }) {
  const { ui, can } = usePortal();
  const parts = P.parts().filter((p) => p.block === it.code);
  const usedIn = [...new Set(P.parts().filter((p) => p.comp === it.code).map((p) => p.block))];
  const ru = P.rulesFor(it.code);
  const slotsOf = P.slots().filter((s) => s.owner === it.code);
  const editing = ui.edit === `item:${it.code}`;
  const d = P.openDraft('item', it.code);
  const kv: [string, ReactNode][] = (
    [
      ['상태', <StOf s={it.status} />],
      it.kind === 'comp' ? ['변형', it.variants] : null,
      it.kind === 'block' ? ['놓이는 빈칸', human(it.slot)] : null,
      it.kind === 'layout' ? ['적용 빈칸', <CodeLink code={it.slot || ''} />] : null,
      it.kind === 'layout' ? ['근거 문서', <UxRef r={it.guide} />] : null,
      ['기준 원본', it.design ? '모양 Figma 디자인 시스템 · 뜻 카탈로그' : it.kind === 'layout' ? 'UX표준가이드' : 'UX 패턴 가이드 · 디자인 에셋 없음'],
      it.promotedFrom ? ['승격', `${it.promotedFrom}에서`] : null,
    ] as ([string, ReactNode] | null)[]
  ).filter((x): x is [string, ReactNode] => !!x);
  return (
    <>
      <Head
        eyebrow={KIND_LABEL[it.kind]}
        title={it.name}
        lead={it.meaning}
        extra={
          <div className="checks">
            <Check on={it.design} label="Figma" />
            <Check on={it.ux} label="UX 가이드" />
            <Check on={it.status === 'pub'} label={P.STATUS[it.status]} />
          </div>
        }
      />
      <Drafts type="item" target={it.code} />
      <div className="sb-ph">
        <span>{it.design ? '디자인 에셋은 Figma 디자인 시스템에 있습니다 · 미리보기는 노드의 레이어 데이터를 받으면 그려집니다' : '디자인 에셋 없음 · UX 패턴 가이드 기준'}</span>
      </div>
      {slotsOf.length || parts.length ? (
        <>
          <h2>Anatomy</h2>
          {slotsOf.length ? (
            <>
              <h3>빈칸</h3>
              <Table
                cols={['이름', '방식', '들어갈 수 있는 것']}
                rows={slotsOf.map((s) => (
                  <tr key={s.path}>
                    <td>{s.name}</td>
                    <td>{s.mode}</td>
                    <td>{human(s.accepts)}</td>
                  </tr>
                ))}
              />
            </>
          ) : null}
          {parts.length ? (
            <>
              <h3>구성</h3>
              <Table
                cols={['자리', '컴포넌트', '필수']}
                rows={parts.map((p, i) => (
                  <tr key={i}>
                    <td>{p.slot}</td>
                    <td>
                      <CodeLink code={p.comp} />
                    </td>
                    <td>{p.required ? '필수' : '선택'}</td>
                  </tr>
                ))}
              />
            </>
          ) : null}
        </>
      ) : null}
      <h2>
        Properties {can(it.kind) ? <EditBtn k={`item:${it.code}`} /> : null}
      </h2>
      {editing ? (
        <ItemForm r={it} d={d} />
      ) : (
        <dl className="kv">
          {kv.map(([k, v]) => [<dt key={`t-${k}`}>{k}</dt>, <dd key={`d-${k}`}>{v}</dd>])}
        </dl>
      )}
      {ru.length || docsFor(it.code).length ? (
        <>
          <h2>Guidelines</h2>
          <GuideChips code={it.code} />
          <RulesBlock list={ru} />
        </>
      ) : null}
      {usedIn.length ? (
        <>
          <h2>Usage</h2>
          <h3>쓰이는 블록</h3>
          <p className="chips">{joinNodes(usedIn.map((b) => <CodeLink key={b} code={b} />), ' · ')}</p>
        </>
      ) : null}
    </>
  );
}

export function ItemForm({ r, d }: { r: Item; d: Draft | null }) {
  const { role, act, closeEdit } = usePortal();
  const v: Item = d ? { ...r, ...d.after } : r;
  const extra = r.kind === 'comp' ? (['variants', '변형'] as const) : (['slot', r.kind === 'layout' ? '적용 빈칸' : '놓이는 빈칸'] as const);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = formValues(e.currentTarget);
    const fields: Partial<Item> = { name: f.name, meaning: f.meaning, status: f.status as P.Status };
    if ('variants' in f) fields.variants = f.variants;
    if ('slot' in f) fields.slot = f.slot;
    act(() => P.draftItem(role, r.code, fields), (x) => `초안 ${x.id} 저장 · 포털 승인 담당 게시 대기`).then((x) => x && closeEdit());
  };
  return (
    <form className="ef ed-panel" onSubmit={onSubmit}>
      <label>
        이름
        <input name="name" defaultValue={v.name} required />
      </label>
      <label>
        뜻 (페이지 설명)
        <textarea name="meaning" rows={2} defaultValue={v.meaning} />
      </label>
      {extra ? (
        <label>
          {extra[1]}
          <input name={extra[0]} defaultValue={v[extra[0]] || ''} />
        </label>
      ) : null}
      <label>
        상태
        <select name="status" defaultValue={v.status}>
          {(Object.entries(P.STATUS) as [P.Status, string][]).map(([k, t]) => (
            <option key={k} value={k}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <div className="row">
        <button className="btn2 primary sm">초안 저장</button>
        <span className="muted">포털 승인 담당이 게시하면 반영됩니다</span>
      </div>
    </form>
  );
}

// ---------- UX 거버넌스 ----------

const KINDS = ['판정', '배치', '구성', '동작', '표기'];

function Rules() {
  const { role, ui, setUi, can, isEditor, act, closeEdit } = usePortal();
  const q = ui.q.toLowerCase();
  const L = P.rules().filter((r) => (!ui.kd || r.kind === ui.kd) && (!q || `${r.id}${r.doc}${r.section}${r.text}${r.targets.join(' ')}`.toLowerCase().includes(q)));
  const editor = can('rule');
  const prefixes = [...new Set(P.rules().map((r) => r.id.replace(/-\d+$/, '')))];
  const pending = isEditor ? P.drafts((d) => d.status === 'draft' && d.type === 'rule') : [];
  const onEdit = (id: string) => (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = formValues(e.currentTarget);
    act(() => P.draftRule(role, id, { kind: v.kind, section: v.section, text: v.text, targets: list(v.targets) }), (d) => `초안 ${d.id} 저장`).then((x) => x && closeEdit());
  };
  const onAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const v = formValues(f);
    act(() => P.draftRule(role, null, { prefix: v.prefix, doc: v.doc, section: v.section, kind: v.kind, text: v.text, targets: list(v.targets) }), () => '규칙 추가 초안 저장').then((x) => x && f.reset());
  };
  return (
    <>
      <Head eyebrow="UX 거버넌스" title="규칙" lead="UX표준가이드 규칙 한 줄이 빈칸 → 블록 → 컴포넌트로 이어지는 연결표입니다. UX 패턴 가이드의 Do · Don't는 권장 · 금지 규칙으로 함께 올라 있습니다. SB Studio의 생성 · 미리보기 · Figma 검사 · 독립 검수가 같은 규칙을 씁니다." />
      {editor ? (
        <section className="ed-panel">
          <div className="ed-h">
            <b>규칙 추가</b>
            <span>번호는 앞자리 다음 번호로 자동으로 붙고, 게시 뒤에는 바뀌지 않습니다.</span>
          </div>
          <form className="ef" onSubmit={onAdd}>
            <div className="ef-r">
              <label>
                번호 앞자리
                <select name="prefix">
                  {prefixes.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
              <label>
                문서
                <input name="doc" placeholder="예: layout-work" required />
              </label>
              <label>
                절
                <input name="section" placeholder="예: 조회조건" required />
              </label>
              <label>
                종류
                <select name="kind">
                  {KINDS.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              내용
              <input name="text" required placeholder="한 줄 규칙" />
            </label>
            <label>
              대상 코드 (쉼표로)
              <input name="targets" placeholder="예: b-search-general, c-button" />
            </label>
            <div className="row">
              <button className="btn2 primary sm">초안 저장</button>
            </div>
          </form>
          {pending.map((d) => (
            <DraftBox key={d.id} d={d} />
          ))}
        </section>
      ) : (
        pending.map((d) => <DraftBox key={d.id} d={d} />)
      )}
      <h2 id="list" className="sr">
        규칙 목록
      </h2>
      <div className="filter">
        <input type="search" id="rq" value={ui.q} placeholder="규칙 · 빈칸 · 블록 · 컴포넌트 검색" aria-label="규칙 검색" onChange={(e) => setUi((u) => ({ ...u, q: e.target.value }))} />
        {['', ...KINDS, '권장', '금지'].map((x) => (
          <button key={x} type="button" className={`chip${ui.kd === x ? ' on' : ''}`} onClick={() => setUi((u) => ({ ...u, kd: x }))}>
            {x || '전체'}
          </button>
        ))}
        <span className="muted">{L.length}건 · UX표준가이드 1.2 · UX 패턴 가이드 {guideSource.release} (권장 · 금지)</span>
      </div>
      <Table
        cols={['종류', '문서', '내용', '대상', ...(editor ? [''] : [])]}
        rows={L.flatMap((r) => [
          <tr key={r.id}>
            <td>
              <span className="rk">{r.kind}</span>
              {P.openDraft('rule', r.id) && isEditor ? (
                <>
                  {' '}
                  <span className="st ai">초안</span>
                </>
              ) : null}
            </td>
            <td>
              <UxRef r={r.doc} />
              <br />
              <span className="muted">{r.section}</span>
            </td>
            <td>{human(r.text)}</td>
            <td className="codes">{joinNodes(r.targets.map((t) => <CodeLink key={t} code={t} />), ' · ')}</td>
            {editor ? (
              <td>
                <button className="edit-btn" aria-label={`${r.id} 편집`} onClick={() => setUi((u) => ({ ...u, editRule: u.editRule === r.id ? null : r.id }))}>
                  ✎
                </button>
              </td>
            ) : null}
          </tr>,
          editor && ui.editRule === r.id ? (
            <tr key={`${r.id}-edit`} className="erow">
              <td colSpan={5}>
                <form className="ef" onSubmit={onEdit(r.id)}>
                  <div className="ef-r">
                    <label>
                      종류
                      <select name="kind" defaultValue={r.kind}>
                        {KINDS.map((k) => (
                          <option key={k}>{k}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      절
                      <input name="section" defaultValue={r.section} />
                    </label>
                    <label className="w">
                      내용
                      <input name="text" defaultValue={r.text} required />
                    </label>
                  </div>
                  <label>
                    대상 코드 (쉼표로)
                    <input name="targets" defaultValue={r.targets.join(', ')} />
                  </label>
                  <div className="row">
                    <button className="btn2 primary sm">초안 저장</button>
                    <button type="button" className="btn2 sm" onClick={() => setUi((u) => ({ ...u, editRule: null }))}>
                      취소
                    </button>
                    <button type="button" className="btn2 sm danger" onClick={() => act(() => P.draftRule(role, r.id, {}, true), () => '규칙 삭제 초안 저장').then(() => setUi((u) => ({ ...u, editRule: null })))}>
                      삭제 초안
                    </button>
                  </div>
                </form>
              </td>
            </tr>
          ) : null,
        ])}
      />
    </>
  );
}

function Slots() {
  return (
    <>
      <Head eyebrow="UX 거버넌스" title="빈칸" lead="빈칸은 단위가 아니라 자리입니다. 앱 구조(app) · 레이아웃 규칙 · 블록 · 컨테이너형 컴포넌트에 딸린 자리를 경로로 적습니다." />
      <h2 id="list" className="sr">
        빈칸 목록
      </h2>
      <Table
        cols={['이름', '소속', '방식', '들어갈 수 있는 것']}
        rows={P.slots().map((s) => (
          <tr key={s.path}>
            <td>{s.name}</td>
            <td>
              <CodeLink code={s.owner} />
            </td>
            <td>{s.mode}</td>
            <td>{human(s.accepts)}</td>
          </tr>
        ))}
      />
    </>
  );
}

function Lint() {
  const L = [
    ['R-01', '앱 구조 빈칸(GNB · LNB · 콘텍스트 바)에는 블록만', '오류'],
    ['R-02', '고정 빈칸은 허용 목록에서 하나', '오류'],
    ['R-03', '쌓기 빈칸 순서(일반형)', '오류'],
    ['R-04', '임시 코드(tb- · tc-)는 포털 승인 담당 승인 요청 동반', '경고'],
    ['R-05', '용어 대조(로제타)', '경고'],
    ['R-06', '출처 ID 반영률 100%', '오류'],
    ['R-07', '특수형 화면은 승인 기록 동반', '경고'],
  ];
  return (
    <>
      <Head eyebrow="UX 거버넌스" title="검증 규칙" lead="규칙 한 벌을 생성기 · 미리보기 · Figma 검사 · 카탈로그 게시가 같이 씁니다. 독립 검수 기준 점검도 같은 규칙입니다." />
      <h2 id="list" className="sr">
        검증 규칙
      </h2>
      <Table
        cols={['내용', '심각도']}
        rows={L.map((r) => (
          <tr key={r[0]}>
            <td>{r[1]}</td>
            <td>
              <St c={r[2] === '오류' ? 'ng' : 'hold'} t={r[2]} />
            </td>
          </tr>
        ))}
      />
    </>
  );
}

// ---------- 관리 (담당 역할에서만) ----------

const TYPE_NAME: Record<P.DraftType, string> = { item: '카탈로그', rule: '규칙', guide: '사용 가이드', figma: 'Figma', code: '코드', text: '설명' };

function nextVersion(L: Draft[]) {
  const B: P.Bump[] = ['PATCH', 'MINOR', 'MAJOR'];
  return P.bumpVersion(P.version(), B[Math.max(...L.map((d) => B.indexOf(d.bump)))]);
}

function Pub() {
  const { role, act } = usePortal();
  const pend = P.drafts((d) => d.status === 'draft');
  const done = P.drafts((d) => d.status !== 'draft');
  const last = P.history()[0];
  const approver = role === 'approver';
  const where = (d: Draft) => (d.type === 'rule' ? '#rules' : d.type === 'guide' || d.type === 'figma' || d.type === 'code' || d.type === 'text' ? `#${P.itemByKey(d.key || d.target)?.code || d.code || d.target}` : `#${d.target}`);
  const discard = (d: Draft) => act(() => P.discard(role, d.id), (x) => (x.status === 'rejected' ? `${x.id} 반려` : `${x.id} 초안을 버렸습니다`));
  const onPublish = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const ids = [...f.querySelectorAll<HTMLInputElement>('input[name=ids]:checked')].map((x) => x.value);
    act(() => P.publish(role, ids, formValues(f).reason), (h) => `게시 ${h.version} · SB Studio가 이 버전을 읽습니다`);
  };
  const onRollback = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    act(() => P.rollback(role, formValues(e.currentTarget).reason), (h) => `${h.version}(으)로 되돌렸습니다`);
  };
  const result: Record<string, (d: Draft) => string> = { published: (d) => `게시 ${d.version}`, rejected: () => '반려', discarded: () => '버림', rolled_back: () => '롤백' };
  return (
    <>
      <Head eyebrow="관리" title="초안 · 게시" lead="담당이 고친 내용은 초안으로 쌓이고, 포털 승인 담당이 게시하면 버전이 오르고 SB Studio가 읽는 게시본이 바뀝니다." />
      <h2 id="pending">게시 대기 {pend.length}건</h2>
      <form onSubmit={onPublish}>
        <Table
          cols={['', '초안', '종류', '내용', '담당', '자리', '']}
          rows={pend.map((d) => (
            <tr key={d.id}>
              <td>{approver ? <input type="checkbox" name="ids" value={d.id} defaultChecked aria-label={`${d.id} 고르기`} /> : null}</td>
              <td>
                <b className="nw">{d.id}</b>
              </td>
              <td className="nw">{TYPE_NAME[d.type]}</td>
              <td>
                <a href={where(d)}>{d.title}</a>
                <ul className="mini">
                  {d.lines.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </td>
              <td className="nw">{P.ROLES[d.by]}</td>
              <td>
                <BumpTag b={d.bump} />
              </td>
              <td className="nw">
                {approver ? (
                  <button type="button" className="btn2 sm" onClick={() => discard(d)}>
                    반려
                  </button>
                ) : role === d.by ? (
                  <button type="button" className="btn2 sm" onClick={() => discard(d)}>
                    버리기
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        />
        {approver && pend.length ? (
          <div className="row pad">
            <input name="reason" id="pubReason" className="grow" placeholder="게시 메모 (선택)" />
            <button className="btn2 primary">고른 초안 게시 → {nextVersion(pend)}</button>
          </div>
        ) : pend.length ? (
          <p className="muted">게시는 포털 승인 담당이 합니다.</p>
        ) : null}
      </form>
      {approver && last.prevPub ? (
        <>
          <h2 id="rollback">롤백</h2>
          <form className="row" onSubmit={onRollback}>
            <span>
              지금 게시 <b className="mono">{P.version()}</b>
            </span>
            <input name="reason" id="rbReason" className="grow" placeholder="롤백 사유" />
            <ConfirmButton type="submit" className="btn2 sm danger">
              {last.from}(으)로 되돌리기
            </ConfirmButton>
          </form>
        </>
      ) : null}
      {done.length ? (
        <>
          <h2 id="done">처리된 초안</h2>
          <Table
            cols={['초안', '내용', '담당', '결과']}
            rows={done.map((d) => (
              <tr key={d.id}>
                <td className="nw">{d.id}</td>
                <td>{d.title}</td>
                <td className="nw">{P.ROLES[d.by]}</td>
                <td>
                  <St c={d.status === 'published' ? 'ok' : 'ng'} t={result[d.status]?.(d) || d.status} />
                </td>
              </tr>
            ))}
          />
        </>
      ) : null}
      {approver ? (
        <>
          <h2 id="reset">시연 데이터</h2>
          <p className="row">
            <ConfirmButton className="btn2 sm danger" onConfirm={() => act(() => P.reset(), '처음 상태로 되돌렸습니다', '#overview')}>
              처음 상태로 되돌리기
            </ConfirmButton>
            <span className="muted">이 브라우저에 저장된 초안 · 게시 · 승격 진행을 지웁니다</span>
          </p>
        </>
      ) : null}
    </>
  );
}

function Promo() {
  const { role, act } = usePortal();
  const L = P.promotions();
  const promote = (k: number, ok: boolean) => {
    const inp = document.getElementById(`promoUrl-${k}`) as HTMLInputElement | null;
    if (ok && inp && !inp.value.trim()) {
      act(() => {
        throw new Error('Figma 노드 주소를 넣어 주세요');
      });
      return;
    }
    act(() => P.promote(role, k, ok, { url: inp?.value.trim() }), (p) => (p.status === '승인' ? `최종 승인 · ${p.code} · 게시 ${P.version()}` : p.status === '반려' ? '반려했습니다' : `${p.stage} 단계로 넘겼습니다`));
  };
  const actions = (p: P.Promotion, k: number) => {
    if (p.status !== '대기') return null;
    const s = P.PROMO_STAGES.find((x) => x.stage === p.stage);
    if (!s) return null;
    if (role !== s.who) return <span className="muted">{P.ROLES[s.who]} 차례</span>;
    return (
      <>
        {s.who === 'ds' ? <input className="in-sm" id={`promoUrl-${k}`} placeholder="Figma 노드 주소" aria-label="Figma 노드 주소" /> : null}
        <button className="btn2 primary sm" onClick={() => promote(k, true)}>
          {s.act}
        </button>
        <button className="btn2 sm" onClick={() => promote(k, false)}>
          반려
        </button>
      </>
    );
  };
  const onAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const v = formValues(f);
    act(() => P.addPromotion(role, { code: v.code, name: v.name, from: v.from, judge: v.judge }), (p) => `${p.id} 등록 · 구조 확인 단계`).then((x) => x && f.reset());
  };
  return (
    <>
      <Head
        eyebrow="관리"
        title="승격 요청"
        lead="SB Studio에서 만든 임시 블록 · 컴포넌트(tb- · tc-)를 정식 부품으로 올립니다. 사용 승인 SB가 3건이 되면 자동 등록됩니다."
        extra={
          <div className="checks">
            {P.PROMO_STAGES.map((s, i) => (
              <span key={s.stage} className="ck on">
                {i + 1}. {s.stage} · {P.ROLES[s.who]}
              </span>
            ))}
          </div>
        }
      />
      {role === 'ux' ? (
        <section className="ed-panel">
          <div className="ed-h">
            <b>승격 요청 등록</b>
          </div>
          <form className="ef" onSubmit={onAdd}>
            <div className="ef-r">
              <label>
                임시 코드
                <input name="code" required pattern="t[bc]-[a-z0-9-]+" placeholder="tb-…" />
              </label>
              <label>
                이름
                <input name="name" required />
              </label>
              <label className="w">
                출처
                <input name="from" placeholder="SB · 화면 ID · 사용 승인 SB 건수" />
              </label>
            </div>
            <label>
              변형 판단
              <input name="judge" placeholder="예: c-date-field 변형 후보" />
            </label>
            <div className="row">
              <button className="btn2 primary sm">등록</button>
            </div>
          </form>
        </section>
      ) : null}
      <h2 id="list">요청 목록</h2>
      <Table
        cols={['요청', '이름', '출처', '변형 판단', '심사', '상태', '처리']}
        rows={L.map((p, k) => {
          const code = p.code.split(' → ').pop()!;
          return (
            <tr key={p.id}>
              <td className="nw">{p.id}</td>
              <td>{P.item(code) ? <CodeLink code={code} /> : p.name}</td>
              <td>{p.from}</td>
              <td>{human(p.judge)}</td>
              <td className="nw">{p.stage}</td>
              <td>
                <St c={p.status === '승인' ? 'ok' : p.status === '반려' ? 'ng' : 'hold'} t={p.status} />
              </td>
              <td className="acts">{actions(p, k)}</td>
            </tr>
          );
        })}
      />
      <p className="muted">최종 승인되면 코드 앞자리만 바뀌어(tb- → b-, tc- → c-) 바로 게시됩니다.</p>
    </>
  );
}

function Chg() {
  const { role, act } = usePortal();
  const L = P.detections();
  const opts = ['새 버전 후보', '무시(토큰만)', '포털 승인 담당 승인 요청'];
  return (
    <>
      <Head eyebrow="관리" title="변경 감지" lead="Figma 디자인 시스템 · UX 패턴 가이드 게시와 SB Studio가 만든 SB의 Figma 수정을 감지합니다. 새 버전 후보는 담당이 해당 페이지에서 Figma를 다시 읽어 초안으로 만듭니다." />
      <h2 id="list" className="sr">
        감지 목록
      </h2>
      <Table
        cols={['감지', '파일', '대상', '변경', '영향', '처리']}
        rows={L.map((r, k) => (
          <tr key={k}>
            <td className="nw">{r.at}</td>
            <td>{r.file}</td>
            <td>{r.target}</td>
            <td>{r.change}</td>
            <td>{r.impact}</td>
            <td>
              <select aria-label="처리" value={r.action} onChange={(e) => act(() => P.handleDetection(role, k, e.target.value), '처리 방식을 바꿨습니다')}>
                {opts.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </td>
          </tr>
        ))}
      />
    </>
  );
}
