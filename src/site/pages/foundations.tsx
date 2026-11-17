// Foundations › 디자인 에셋: 개요 · 색상 · 타이포그래피 · 간격·모서리 · 디자인 토큰 · 준비 중 문서(그림자 · 모션 · 문구).
// 베이스 토큰은 색이고, 역할 · 컴포넌트 토큰은 그 색을 가리킨다. 색 값은 색상 문서에만 둔다.
// 토큰 추가 · 수정은 DS 담당자 (디자인 토큰 문서의 편집 칸) → 초안 → 배포 요청 → 관리자 배포.
import { useState } from 'react';
import type { FormEvent } from 'react';
import * as P from '../portal/store';
import type { Token } from '../portal/store';
import { usePortal } from '../portal/ctx';
import { components, icons } from '../data';
import { DraftBox, Head, Table } from '../ui';

const COLOR_ROLE: Record<string, string> = { bg: '배경 (bg)', fg: '글자 · 아이콘 (fg)', border: '테두리 (border)' };
const TK = () => Object.entries(P.tokens()).map(([css, t]) => ({ css, ...t }));
const Sw = ({ v }: { v: string }) => <i className="sw" style={{ background: v }} />;

export function FoundationsOverview() {
  const T = TK();
  const cards: [string, string, string, string][] = [
    ['color', '색상', '베이스 → 색 역할', '역할(배경 · 글자 · 테두리)로 고르는 색'],
    ['typography', '타이포그래피', 'Pretendard', '크기 · 줄 높이 · 굵기 단계'],
    ['dimension', '간격 · 모서리', '간격 · 크기 · 둥글기 · 두께', '컴포넌트 토큰이 가리키는 단계'],
    ['icons', '아이콘', 'Line · Filled · Colored', `Figma ❖ Icon Resource ${icons.icons.length ? '' : ''}`.trim()],
    ['tokens', '디자인 토큰', '베이스 → 역할 → 컴포넌트', '토큰 구조 · 편집 · 소스'],
    ['elevation', '그림자', '준비 중', '화면 층마다 쓰는 그림자 단계'],
    ['motion', '모션', '준비 중', '열기 · 닫기 · 전환의 시간과 곡선'],
    ['writing', '문구', '준비 중', '말투 · 버튼 · 오류 문구 · 표기'],
  ];
  return (
    <>
      <Head eyebrow="Foundations" title="Foundations" lead="컴포넌트와 블록이 공통으로 쓰는 색 · 글자 · 간격 · 아이콘의 기준과, 앱 구조 · 화면 유형 · 사용 환경 문서입니다. 값은 Figma 변수에서 읽은 디자인 토큰으로만 씁니다." />
      <h2 id="principle">원칙</h2>
      <ol className="flow">
        <li>
          <strong>값이 아니라 역할로 고릅니다</strong>
          <span>#3617CE 대신 color/bg/brand/strongest처럼 쓰임새가 이름에 드러난 역할 토큰을 씁니다.</span>
        </li>
        <li>
          <strong>세 단계로 이어집니다</strong>
          <span>베이스(팔레트) → 역할 → 컴포넌트. 값은 베이스에만 있고, 아래 단계는 위 단계를 가리킵니다.</span>
        </li>
        <li>
          <strong>Figma가 원본입니다</strong>
          <span>DS 담당자가 토큰을 고치면 초안 → 배포 요청 → 관리자 배포로 반영됩니다. 지금 토큰 {T.length}개.</span>
        </li>
      </ol>
      <h2 id="assets">디자인 에셋</h2>
      <div className="cards">
        {cards.map((c) => (
          <a key={c[0]} className="card" href={`#${c[0]}`}>
            <span className="card-eb">{c[1]}</span>
            <b>{c[2]}</b>
            <span>{c[3]}</span>
          </a>
        ))}
      </div>
    </>
  );
}

export function ColorPage() {
  const T = TK();
  const sem = T.filter((t) => t.collection === 'Semantic' && t.type === 'COLOR');
  const prim = T.filter((t) => t.collection === 'Primitive');
  const role = (t: Token) => t.figma.split('/')[1];
  const roles = [...new Set(sem.map(role))];
  const hues = [...new Set(prim.map((t) => t.figma.split('/')[1]))];
  const all = P.tokens();
  const usedBy = (css: string) => sem.filter((t) => t.ref === css).length;
  return (
    <>
      <Head eyebrow="Foundations" title="색상" lead={`색은 베이스(Palette) ${prim.length}개에서 시작합니다. 역할(Color role) ${sem.length}개가 베이스 색 하나씩을 가리키고, 컴포넌트는 역할을 변형 · 상태별로 다시 가리킵니다. 색 값은 이 문서에만 있습니다.`} />
      <h2 id="palette">Palette · 베이스</h2>
      <p className="note">화면에서 바로 쓰지 않고 아래 Color role이 가리키는 원본으로만 씁니다. 숫자는 이 색을 가리키는 역할 수입니다.</p>
      {hues.map((h) => (
        <div key={h}>
          <h3>{h}</h3>
          <div className="pal">
            {prim
              .filter((t) => t.figma.split('/')[1] === h)
              .map((t) => (
                <div key={t.css} title={t.figma}>
                  <i style={{ background: t.value }} />
                  <b>{t.figma.split('/').slice(2).join('/') || h}</b>
                  <span className="mono">
                    {t.value}
                    {usedBy(t.css) ? ` · 역할 ${usedBy(t.css)}` : ''}
                  </span>
                </div>
              ))}
          </div>
        </div>
      ))}
      <h2 id="role">Color role · 역할</h2>
      <p className="note">배경 · 글자 · 테두리마다 강도(faint → strongest)와 의미(brand · neutral · danger …)를 조합한 이름입니다.</p>
      {roles.map((r) => (
        <div key={r}>
          <h3>{COLOR_ROLE[r] || r}</h3>
          <Table
            cols={['', '역할', '베이스', '값']}
            rows={sem
              .filter((t) => role(t) === r)
              .map((t) => (
                <tr key={t.css}>
                  <td className="sw-c">
                    <Sw v={t.value} />
                  </td>
                  <td>
                    <code>{t.figma.replace(/^color\//, '')}</code>
                  </td>
                  <td className="mono">{t.ref ? all[t.ref]?.figma.replace(/^color\//, '') || t.ref : '-'}</td>
                  <td className="mono muted">{t.value}</td>
                </tr>
              ))}
          />
        </div>
      ))}
    </>
  );
}

/** 컴포넌트 토큰의 글자 스타일(font/<역할>/<크기>/<굵기>/<속성>)을 스타일 단위로 */
function typeStyles() {
  const map = new Map<string, { name: string; role: string; used: Set<string>; size?: string; lineHeight?: string; weight?: string; letterSpacing?: string }>();
  for (const c of components)
    for (const t of c.data.tokens || []) {
      const s = String(t.figma || '').split('/');
      if (s[0] !== 'font' || s.length !== 5) continue;
      const name = s.slice(1, 4).join('/');
      if (!map.has(name)) map.set(name, { name, role: s[1], used: new Set() });
      const e = map.get(name)!;
      (e as Record<string, unknown>)[s[4]] = String(t.value);
      e.used.add(c.data.name);
    }
  return [...map.values()].sort((a, b) => a.role.localeCompare(b.role) || Number(b.name.split('/')[1]) - Number(a.name.split('/')[1]));
}

export function TypographyPage() {
  const L = typeStyles();
  return (
    <>
      <Head eyebrow="Foundations" title="타이포그래피" lead="글꼴은 Pretendard 하나를 씁니다. 스타일 이름은 역할/크기/굵기(예: label/14/400)이고, 줄 높이와 자간이 함께 정해져 있습니다." />
      <h2 id="scale">Type scale</h2>
      <div className="ts">
        {L.map((s) => (
          <div key={s.name} className="ts-r">
            <span className="ts-n">
              <code>{s.name}</code>
              <small>
                {s.size} / {s.lineHeight} · {s.weight}
              </small>
            </span>
            <span className="ts-x" style={{ fontSize: Number(s.size), lineHeight: `${Number(s.lineHeight)}px`, fontWeight: Number(s.weight), letterSpacing: Number(s.letterSpacing) || 0 }}>
              BSS 백오피스 화면 Aa 123
            </span>
          </div>
        ))}
      </div>
      <h2 id="styles">스타일 목록</h2>
      <Table
        cols={['스타일', '크기', '줄 높이', '굵기', '자간', '쓰는 컴포넌트']}
        rows={L.map((s) => (
          <tr key={s.name}>
            <td>
              <code>{s.name}</code>
            </td>
            <td className="mono">{s.size}</td>
            <td className="mono">{s.lineHeight}</td>
            <td className="mono">{s.weight}</td>
            <td className="mono">{s.letterSpacing}</td>
            <td>{[...s.used].join(' · ')}</td>
          </tr>
        ))}
      />
    </>
  );
}

/** 컴포넌트 토큰이 가리키는 간격 · 크기 · 둥글기 · 두께 값 */
function dimTokens() {
  const map = new Map<string, { alias: string; kind: string; value: string; used: Set<string> }>();
  for (const c of components)
    for (const t of c.data.tokens || []) {
      const a = String(t.alias || '');
      const kind = a.split('/')[0];
      if (!['space', 'size', 'radius', 'borderWidth'].includes(kind)) continue;
      if (!map.has(a)) map.set(a, { alias: a, kind, value: String(t.value), used: new Set() });
      map.get(a)!.used.add(c.data.name);
    }
  const num = (x: { value: string }) => (Number.isFinite(Number(x.value)) ? Number(x.value) : 0);
  return [...map.values()].sort((a, b) => a.kind.localeCompare(b.kind) || num(a) - num(b));
}

export function DimensionPage() {
  const L = dimTokens();
  const K: Record<string, [string, string]> = { space: ['간격', '요소 사이 · 안쪽 여백'], size: ['크기', '컨트롤 높이 · 아이콘 크기'], radius: ['모서리', '둥글기 (full = 알약 모양)'], borderWidth: ['두께', '테두리 · 포커스 링 두께'] };
  return (
    <>
      <Head eyebrow="Foundations" title="간격 · 모서리" lead="간격 · 크기 · 둥글기 · 두께는 정해진 단계만 씁니다. 아래 값은 컴포넌트 토큰이 실제로 가리키는 단계입니다. 베이스 변수(space · radius)는 아직 토큰 파일에 없습니다." />
      {Object.entries(K).map(([k, [title, lead]]) => {
        const R = L.filter((x) => x.kind === k);
        if (!R.length) return null;
        return (
          <div key={k}>
            <h2 id={k}>{title}</h2>
            <p className="note">{lead}</p>
            <Table
              cols={['토큰', '값', '미리보기', '쓰는 컴포넌트']}
              rows={R.map((x) => {
                const v = Number(x.value) || 0;
                const vis = k === 'radius' ? <i className="dm dm-r" style={{ borderRadius: Math.min(v, 24) }} /> : k === 'borderWidth' ? <i className="dm dm-b" style={{ borderWidth: v }} /> : <i className="dm dm-s" style={{ width: Math.min(v, 96) }} />;
                return (
                  <tr key={x.alias}>
                    <td>
                      <code>{x.alias}</code>
                    </td>
                    <td className="mono">{x.value}</td>
                    <td>{vis}</td>
                    <td>{[...x.used].join(' · ')}</td>
                  </tr>
                );
              })}
            />
          </div>
        );
      })}
    </>
  );
}

/** 토큰 소스: :root CSS 변수. 역할 · 컴포넌트 토큰은 가리키는 토큰을 var()로 이어 쓴다 */
export function tokenSource() {
  const T = P.tokens();
  const block = (col: string) =>
    Object.entries(T)
      .filter(([, t]) => t.collection === col)
      .map(([k, t]) => `  ${k}: ${t.ref && T[t.ref] ? `var(${t.ref})` : t.type === 'FLOAT' && /^-?\d+(\.\d+)?$/.test(String(t.value)) && !/weight/i.test(t.figma) ? `${t.value}px` : t.value};`)
      .join('\n');
  return `/* BSS 디자인 토큰 · 운영 ${P.version()} · Primitive → Semantic → Component */\n:root {\n  /* Primitive */\n${block('Primitive')}\n\n  /* Semantic */\n${block('Semantic')}\n\n  /* Component */\n${block('Component')}\n}\n`;
}

/** 디자인 토큰: 세 단계 · 이어지는 예 · 이름 규칙 · DS 담당자 편집 칸 · 토큰 소스 · 전체 목록 */
export function TokensPage() {
  const { can } = usePortal();
  const T = P.tokens();
  const all = TK();
  const LAYER: Record<string, string> = { Primitive: '베이스', Semantic: '역할', Component: '컴포넌트' };
  const byFigma = new Map(all.map((t) => [t.figma, t]));
  const chain = (path: string) => {
    const out: { name: string; layer: string; value: string }[] = [];
    let cur = byFigma.get(path);
    while (cur) {
      out.push({ name: cur.figma, layer: cur.collection, value: cur.value });
      cur = cur.ref ? all.find((x) => x.css === cur!.ref) : undefined;
    }
    return out.reverse();
  };
  const examples = [
    ['Button · primary · hover 배경', 'button/primary/color/bg/hover'],
    ['Checkbox · checked · default 배경', 'checkbox/checked/color/bg/default'],
    ['미선택 hover 배경 (공유)', 'selectionControl/color/bg/hover'],
    ['TextField · error 테두리', 'field/color/border/error'],
  ].map(([l, p]) => [l, chain(p)] as const).filter(([, c]) => c.length > 1);
  const src = tokenSource();
  return (
    <>
      <Head eyebrow="Foundations" title="디자인 토큰" lead={`토큰 ${all.length}개는 베이스 색에서 시작해 역할 → 컴포넌트 변형 순서로 이어집니다. 값은 베이스에만 있고, 그 아래 단계는 위 단계의 이름을 가리킵니다.`} />
      {can('token') ? <TokenEditor /> : null}
      <h2 id="layers">세 단계</h2>
      <Table
        cols={['단계', '뜻', '값이 있는 곳']}
        rows={[
          ['베이스 · Primitive', '팔레트 원본 색 (예: gray/50)', <a href="#color">색상 › Palette</a>],
          ['역할 · Semantic', '배경 · 글자 · 테두리 역할과 글자 스타일. 베이스를 가리킴', <a href="#color">색상 › Color role</a>],
          ['컴포넌트 · Component', '부품의 변형 × 상태별 값. 역할을 가리킴', '각 컴포넌트 문서'],
        ].map((r) => (
          <tr key={String(r[0])}>
            <td>
              <b>{r[0]}</b>
            </td>
            <td>{r[1]}</td>
            <td>{r[2]}</td>
          </tr>
        ))}
      />
      <h2 id="chain">이어지는 예</h2>
      <p className="note">컴포넌트 토큰을 베이스까지 따라간 실제 사슬입니다. 베이스 색을 바꾸면 같은 사슬 위의 모든 컴포넌트가 함께 바뀝니다.</p>
      <div className="chains">
        {examples.map(([label, ch]) => (
          <div key={label} className="chain">
            <p className="chain-t">{label}</p>
            <ol>
              {ch.map((x) => (
                <li key={x.name}>
                  <span className="chain-l">{LAYER[x.layer] || x.layer}</span>
                  {/^#/.test(x.value) ? <Sw v={x.value} /> : null}
                  <code>{x.name}</code>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
      <h2 id="naming">이름 규칙</h2>
      <Table
        cols={['단계', '형식', '예']}
        rows={[
          ['베이스', 'color/색상/단계', 'color/tBlue/600'],
          ['역할', 'color/역할/의미/강도/상태', 'color/bg/brand/strongest/hover'],
          ['컴포넌트', '부품/변형/color/역할/상태', 'button/primary/color/bg/hover'],
        ].map((r) => (
          <tr key={r[0]}>
            <td>
              <b>{r[0]}</b>
            </td>
            <td>
              <code>{r[1]}</code>
            </td>
            <td>
              <code>{r[2]}</code>
            </td>
          </tr>
        ))}
      />
      <h2 id="source">토큰 소스 (CSS)</h2>
      <p className="note">게시된 토큰 전체를 CSS 변수로 묶은 소스입니다. 토큰이 추가 · 수정되어 배포되면 함께 바뀝니다.</p>
      <pre className="tk-src">{src}</pre>
      <h2 id="ref">전체 목록</h2>
      {(['Primitive', 'Semantic', 'Component'] as const).map((col) => {
        const L = all.filter((t) => t.collection === col);
        return (
          <details key={col} className="ref">
            <summary>
              {col} {L.length}개 펼치기
            </summary>
            <Table
              cols={['Figma 변수', 'CSS 변수', '값', '가리키는 토큰']}
              rows={L.map((t) => (
                <tr key={t.css}>
                  <td>
                    <code>{t.figma}</code>
                    {P.openDraft('token', t.css) ? <span className="st ai">초안</span> : null}
                  </td>
                  <td className="mono">{t.css}</td>
                  <td className="mono nw">
                    {t.type === 'COLOR' ? <Sw v={t.value} /> : null}
                    {t.value}
                  </td>
                  <td className="mono muted">{t.ref ? T[t.ref]?.figma || t.ref : '-'}</td>
                </tr>
              ))}
            />
          </details>
        );
      })}
    </>
  );
}

function TokenEditor() {
  const { role, act } = usePortal();
  const T = P.tokens();
  const [f, setF] = useState({ collection: 'Primitive', figma: '', value: '', ref: '' });
  const cur = f.figma ? T[P.cssName(f.figma)] : undefined;
  const pick = (figma: string) => {
    const t = T[P.cssName(figma)];
    setF(t ? { collection: t.collection, figma, value: t.ref ? '' : t.value, ref: t.ref || '' } : { ...f, figma });
  };
  const pend = P.drafts((d) => d.status === 'draft' && d.type === 'token');
  const onSave = (e: FormEvent) => {
    e.preventDefault();
    act(() => P.draftToken(role, f), (d) => `초안 ${d.id} 저장 · 내 변경에서 미리보기 확인 후 배포 요청`);
  };
  return (
    <section className="ed-panel" aria-label="토큰 편집">
      <div className="ed-h">
        <b>토큰 편집</b>
        <span>DS 담당자 · 이미 있는 이름이면 수정, 새 이름이면 추가 · 베이스는 값, 역할 · 컴포넌트는 가리키는 토큰</span>
      </div>
      <datalist id="tkNames">
        {Object.values(T).map((t) => (
          <option key={t.figma} value={t.figma} />
        ))}
      </datalist>
      <datalist id="tkRefs">
        {Object.entries(T)
          .filter(([, t]) => t.collection !== 'Component')
          .map(([k, t]) => (
            <option key={k} value={k}>
              {t.figma}
            </option>
          ))}
      </datalist>
      <form className="ef" onSubmit={onSave}>
        <div className="ef-r">
          <label>
            단계
            <select value={f.collection} onChange={(e) => setF({ ...f, collection: e.target.value })}>
              <option value="Primitive">베이스 · Primitive</option>
              <option value="Semantic">역할 · Semantic</option>
              <option value="Component">컴포넌트 · Component</option>
            </select>
          </label>
          <label className="w">
            이름 (Figma 변수)
            <input list="tkNames" value={f.figma} required placeholder="예: color/mint/500" onChange={(e) => pick(e.target.value.trim())} />
          </label>
        </div>
        <div className="ef-r">
          <label>
            값 (베이스)
            <span className="tk-val">
              <input type="color" aria-label="색 고르기" value={/^#[0-9a-f]{6}/i.test(f.value) ? f.value.slice(0, 7).toLowerCase() : '#3617ce'} onChange={(e) => setF({ ...f, value: e.target.value.toUpperCase() })} />
              <input value={f.value} placeholder="#3617CE 또는 숫자" onChange={(e) => setF({ ...f, value: e.target.value })} />
            </span>
          </label>
          <label className="w">
            가리키는 토큰 (역할 · 컴포넌트)
            <input list="tkRefs" value={f.ref} placeholder="예: --color-mint-500" onChange={(e) => setF({ ...f, ref: e.target.value })} />
          </label>
        </div>
        <p className="muted">{f.figma ? (cur ? `지금: ${cur.collection} · ${cur.ref ? `→ ${T[cur.ref]?.figma || cur.ref} ` : ''}${cur.value}` : '새 토큰으로 추가됩니다') : ''}</p>
        <div className="row">
          <button className="btn2 primary sm">초안 저장</button>
          <button type="button" className="btn2 sm danger" onClick={() => act(() => P.draftToken(role, { figma: f.figma }, true), (d) => `${d.id} 삭제 초안 저장`)}>
            삭제 초안
          </button>
          <span className="muted">배포되면 색상 · 토큰 소스에 바로 반영됩니다</span>
        </div>
      </form>
      {pend.map((d) => (
        <DraftBox key={d.id} d={d} />
      ))}
    </section>
  );
}

/** 아직 내용이 없는 디자인 에셋 문서: 자리만 두고 채울 항목을 보여 준다 */
export function PendingPage({ title, lead, todo }: { title: string; lead: string; todo: string[] }) {
  return (
    <>
      <Head eyebrow="Foundations" title={title} lead={lead} extra={<div className="checks"><span className="st">준비 중</span></div>} />
      <h2 id="todo">채울 내용</h2>
      <ul>
        {todo.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <p className="note">기준이 정해지면 DS 담당자 · UX 담당자가 이 문서를 채웁니다.</p>
    </>
  );
}
