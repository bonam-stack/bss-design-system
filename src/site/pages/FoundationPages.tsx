// Foundations · 디자인 에셋: 컬러 · 타이포그래피 · 디자인 토큰. 모두 tokens/variables.json(Figma 변수에서 읽은 값)으로 그린다.
import { useState } from 'react';
import type { CSSProperties } from 'react';
import variables from '../../../tokens/variables.json';
import { CopyBtn, Head, Table } from '../ui';

interface Token {
  name: string;
  figma: string;
  collection: 'Primitive' | 'Semantic' | 'Component';
  type: 'COLOR' | 'FLOAT' | 'STRING';
  value?: string;
  ref?: string | null;
  description?: string;
  /** Semantic 파일 없이 Component 토큰에서 거꾸로 찾은 값 */
  derived?: boolean;
}
const V = variables as { source: { name: string; note?: string }; tokens: Record<string, Omit<Token, 'name'>> };
const TOKENS: Token[] = Object.entries(V.tokens).map(([name, t]) => ({ name, ...t }));
const byName = new Map(TOKENS.map((t) => [t.name, t]));
const SRC = `Figma 변수 · ${V.source.name}`;

/** 값이 없는 토큰(알파 색 등)은 Figma에서 값을 다시 읽어야 한다 */
const Swatch = ({ value, big }: { value?: string; big?: boolean }) => (
  <i className={`fd-sw${big ? ' big' : ''}${value ? '' : ' none'}`} style={value ? ({ '--sw': value } as CSSProperties) : undefined} title={value || '값 없음 · Figma에서 다시 읽어야 함'} />
);

const PRIM_ORDER = ['gray', 'tGray', 'tBlue', 'blue', 'green', 'yellow', 'orange', 'red', 'white', 'grayAlpha', 'blackAlpha', 'whiteAlpha', 'transparent'];
const FAMILY_LABEL: Record<string, string> = { gray: 'Gray', tGray: 'T Gray', tBlue: 'T Blue (브랜드)', blue: 'Blue', green: 'Green', yellow: 'Yellow', orange: 'Orange', red: 'Red', white: 'White', grayAlpha: 'Gray Alpha', blackAlpha: 'Black Alpha', whiteAlpha: 'White Alpha', transparent: 'Transparent' };
const PROP_LABEL: Record<string, string> = { bg: '배경 (bg)', fg: '글자 · 아이콘 (fg)', border: '테두리 (border)', shadow: '그림자 (shadow)' };
const ROLE_LABEL: Record<string, string> = { neutral: '기본', brand: '브랜드', danger: '위험', warning: '경고', attention: '주의', success: '성공', info: '정보', base: '바탕', backdrop: '딤', transparent: '투명', onStrongest: '진한 배경 위', focusRing: '포커스 링', small: 'small', medium: 'medium', large: 'large', xlarge: 'xlarge' };

export function ColorPage() {
  const prim = TOKENS.filter((t) => t.collection === 'Primitive' && t.type === 'COLOR');
  const fams = [...new Set(prim.map((t) => t.figma.split('/')[1]))].sort((a, b) => (PRIM_ORDER.indexOf(a) + 99) % 99 - (PRIM_ORDER.indexOf(b) + 99) % 99);
  const sem = TOKENS.filter((t) => t.collection === 'Semantic' && t.type === 'COLOR');
  const props = [...new Set(sem.map((t) => t.figma.split('/')[1]))];
  const missing = prim.filter((t) => !t.value).length + sem.filter((t) => !t.value).length;
  const derived = sem.filter((t) => t.derived).length;
  return (
    <>
      <Head
        eyebrow="Foundations · 디자인 에셋"
        title="컬러"
        lead="색은 두 층으로 씁니다. Primitive는 색 이름(gray-500)이고, 화면과 컴포넌트는 그 위의 Semantic 색(용도 이름: 배경 · 글자 · 테두리)만 씁니다. Primitive를 직접 쓰지 않습니다."
        extra={<p className="gd-source">출처 {SRC} · Primitive {prim.length} · Semantic {sem.length}{missing ? ` · 값이 비어 있는 ${missing}개는 Figma에서 다시 읽어야 합니다` : ''}{derived ? ` · Semantic ${derived}개는 Component 토큰에서 거꾸로 찾은 값입니다` : ''}</p>}
      />
      <h2 id="semantic">Semantic 색</h2>
      <p className="note">컴포넌트 코드에서는 <code>tok('color-bg-brand-strongest-default', '#3617CE')</code>처럼 Semantic 토큰 이름으로 씁니다. 이름을 누르면 복사됩니다.</p>
      {props.map((p) => {
        const L = sem.filter((t) => t.figma.split('/')[1] === p);
        const roles = [...new Set(L.map((t) => t.figma.split('/')[2]))];
        return (
          <div key={p}>
            <h3 id={`sem-${p}`}>{PROP_LABEL[p] || p}</h3>
            <Table
              cols={['', '용도', '토큰', '값', 'Primitive']}
              rows={roles.flatMap((r) =>
                L.filter((t) => t.figma.split('/')[2] === r).map((t) => (
                  <tr key={t.name}>
                    <td className="fd-swc">
                      <Swatch value={p === 'shadow' ? undefined : t.value} />
                      {p === 'shadow' ? <i className="fd-shadow" style={{ boxShadow: t.value ? `0 2px 8px ${t.value}` : undefined }} /> : null}
                    </td>
                    <td>
                      {ROLE_LABEL[r] || r}
                      <span className="fd-sub">{t.figma.split('/').slice(3).join(' / ') || ''}</span>
                      {t.derived ? <span className="fd-flag">Component에서 찾은 값</span> : null}
                    </td>
                    <td>
                      <CopyBtn value={t.name.slice(2)} />
                    </td>
                    <td className="mono">{t.value || '—'}</td>
                    <td className="mono">{t.ref ? t.ref.replace(/^--color-/, '') : '—'}</td>
                  </tr>
                )),
              )}
            />
          </div>
        );
      })}
      <h2 id="primitive">Primitive 팔레트</h2>
      <p className="note">Semantic 색이 가리키는 원색입니다. 화면 설계와 컴포넌트 코드에서 직접 쓰지 않습니다.</p>
      {fams.map((f) => {
        const L = prim.filter((t) => t.figma.split('/')[1] === f);
        return (
          <div key={f} className="fd-fam">
            <h3 id={`prim-${f}`}>{FAMILY_LABEL[f] || f}</h3>
            <div className="fd-ramp">
              {L.map((t) => (
                <div key={t.name} className="fd-step">
                  <Swatch value={t.value} big />
                  <b>{t.figma.split('/').slice(2).join('/') || f}</b>
                  <span className="mono">{t.value || '값 없음'}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

interface TypeStyle {
  key: string;
  kind: string;
  size: number;
  weight: number;
  lineHeight?: string;
  letterSpacing?: string;
  family?: string;
}
const KIND_INFO: Record<string, string> = { label: '라벨 · 버튼 · 입력값처럼 한 줄로 쓰는 글자', body: '여러 줄로 읽는 본문', caption: '도움말 · 보조 설명처럼 작은 글자' };

export function TypographyPage() {
  const map = new Map<string, TypeStyle>();
  for (const t of TOKENS) {
    const m = t.figma.match(/^font\/(\w+)\/(\d+)\/(\d+)\/(\w+)$/);
    if (!m) continue;
    const [, kind, size, weight, prop] = m;
    const k = `${kind}/${size}/${weight}`;
    const s = map.get(k) || { key: k, kind, size: +size, weight: +weight };
    if (prop === 'lineHeight') s.lineHeight = t.value;
    if (prop === 'letterSpacing') s.letterSpacing = t.value;
    if (prop === 'family') s.family = t.value;
    map.set(k, s);
  }
  const KORDER = ['label', 'body', 'caption'];
  const styles = [...map.values()].sort((a, b) => KORDER.indexOf(a.kind) - KORDER.indexOf(b.kind) || b.size - a.size || a.weight - b.weight);
  const kinds = [...new Set(styles.map((s) => s.kind))];
  const families = [...new Set(styles.map((s) => s.family).filter(Boolean))];
  const [sample, setSample] = useState('조회 조건을 입력해 주세요 · BSS Design 0123');
  return (
    <>
      <Head
        eyebrow="Foundations · 디자인 에셋"
        title="타이포그래피"
        lead={`글꼴은 ${families.join(' · ') || 'Pretendard'} 하나를 씁니다. 글자 스타일은 종류(label · body · caption) × 크기 × 굵기로 정해져 있고, 줄 높이와 자간이 함께 묶여 있습니다.`}
        extra={<p className="gd-source">출처 {SRC} · 글자 스타일 {styles.length}개</p>}
      />
      <div className="toolbar">
        <input className="search" value={sample} onChange={(e) => setSample(e.target.value)} aria-label="미리보기 문장" placeholder="미리보기 문장" />
      </div>
      {kinds.map((k) => (
        <div key={k}>
          <h2 id={`type-${k}`}>
            {k} <span className="count">{styles.filter((s) => s.kind === k).length}</span>
          </h2>
          <p className="note">{KIND_INFO[k] || ''}</p>
          <div className="fd-types">
            {styles
              .filter((s) => s.kind === k)
              .map((s) => (
                <div key={s.key} className="fd-type">
                  <p style={{ fontFamily: `'${s.family || 'Pretendard'}', var(--font)`, fontSize: s.size, fontWeight: s.weight, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing, margin: 0 }}>{sample || ' '}</p>
                  <div className="fd-type-meta">
                    <b>
                      {s.kind} {s.size} / {s.weight}
                    </b>
                    <span>
                      크기 {s.size}px · 줄 높이 {s.lineHeight || '—'} · 굵기 {s.weight} · 자간 {s.letterSpacing || '0'}
                    </span>
                    <CopyBtn value={`font('${s.kind}', ${s.size}, ${s.weight})`} />
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
      <h2 id="raw">글꼴 원값 (Primitive)</h2>
      <p className="note">글자 스타일이 가리키는 크기 · 굵기 · 줄 높이 · 자간 값입니다. 화면과 컴포넌트에서 직접 쓰지 않고 위 글자 스타일로 씁니다.</p>
      <div className="fd-chips">
        {TOKENS.filter((t) => t.collection === 'Primitive' && t.name.startsWith('--font-')).map((t) => (
          <span key={t.name} className="fd-chip" title={t.description}>
            <CopyBtn value={t.name.slice(2)} /> <b className="mono">{t.value}</b>
          </span>
        ))}
      </div>
      <h2 id="use">쓰는 법</h2>
      <p className="pt-text">
        컴포넌트 코드에서는 <code>font('label', 14, 500)</code>처럼 종류 · 크기 · 굵기로 부르면 크기 · 줄 높이 · 굵기 · 자간이 함께 들어갑니다(<code>src/ds/shared.tsx</code>). 여기에 없는 크기나 굵기는 쓰지 않습니다.
      </p>
    </>
  );
}

const COLL = ['Semantic', 'Component', 'Primitive'] as const;

export function TokensPage() {
  const [coll, setColl] = useState<string>('Semantic');
  const [q, setQ] = useState('');
  const [comp, setComp] = useState('');
  const query = q.trim().toLowerCase();
  const comps = [...new Set(TOKENS.filter((t) => t.collection === 'Component').map((t) => t.figma.split('/')[0]))].sort();
  const L = TOKENS.filter((t) => (coll === '' || t.collection === coll) && (coll !== 'Component' || !comp || t.figma.split('/')[0] === comp) && (!query || `${t.name} ${t.figma} ${t.value || ''} ${t.ref || ''} ${t.description || ''}`.toLowerCase().includes(query)));
  const LIMIT = 500;
  const count = (c: string) => TOKENS.filter((t) => t.collection === c).length;
  return (
    <>
      <Head
        eyebrow="Foundations · 디자인 토큰"
        title="디자인 토큰"
        lead="색 · 글꼴 · 크기 · 여백 · 모서리 값은 모두 Figma 변수에서 읽은 디자인 토큰입니다. Primitive(원값) → Semantic(용도) → Component(컴포넌트별) 세 층이고, 아래 층을 참조합니다."
        extra={
          <p className="gd-source">
            출처 {SRC} · 전체 {TOKENS.length}개 · 색은 <a href="#color">컬러</a>, 글자 스타일은 <a href="#typography">타이포그래피</a>에서 보기 좋게 볼 수 있습니다
          </p>
        }
      />
      <div className="toolbar">
        <div className="seg" role="group" aria-label="토큰 층">
          {COLL.map((c) => (
            <button key={c} aria-pressed={coll === c} onClick={() => setColl(c)}>
              {c} {count(c)}
            </button>
          ))}
          <button aria-pressed={coll === ''} onClick={() => setColl('')}>
            전체
          </button>
        </div>
        {coll === 'Component' ? (
          <select className="in-sm" aria-label="컴포넌트" value={comp} onChange={(e) => setComp(e.target.value)}>
            <option value="">컴포넌트 전체 ({comps.length})</option>
            {comps.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        ) : null}
        <input type="search" className="search" placeholder="토큰 · Figma 이름 · 값 · 설명 검색 (예: button, radius, #3617CE, 비활성)" aria-label="토큰 검색" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <p className="note">
        {L.length}개{L.length > LIMIT ? ` · 앞 ${LIMIT}개만 보입니다. 컴포넌트나 검색어로 좁혀 주세요` : ''}
      </p>
      <Table
        cols={['토큰', '값', '참조', '설명']}
        rows={L.slice(0, LIMIT).map((t) => {
          const ref = t.ref ? byName.get(t.ref) : null;
          return (
            <tr key={t.name}>
              <td>
                <CopyBtn value={t.name.slice(2)} />
                <span className="fd-sub mono">{t.figma}</span>
              </td>
              <td className="mono nowrap">
                {t.type === 'COLOR' ? <Swatch value={t.value} /> : null} {t.value ?? '—'}
              </td>
              <td className="mono fd-sub2">{t.ref ? `${t.ref.slice(2)}${ref?.ref ? ` → ${ref.ref.slice(2)}` : ''}` : '—'}</td>
              <td className="fd-desc">
                {t.description || ''}
                {t.derived ? <span className="fd-flag">Component에서 찾은 값</span> : null}
              </td>
            </tr>
          );
        })}
      />
    </>
  );
}

// ---------- 여백 · 크기 · 모서리 · 선 두께 · 그림자 ----------

/** 이 토큰을 가리키는 토큰 수 (바로 · 한 번 건너) */
const usedBy = (() => {
  const direct = new Map<string, string[]>();
  for (const t of TOKENS) if (t.ref) direct.set(t.ref, [...(direct.get(t.ref) || []), t.name]);
  return (name: string) => {
    const a = direct.get(name) || [];
    return a.length + a.reduce((n, x) => n + (direct.get(x) || []).length, 0);
  };
})();
/** Semantic 파일이 없어 참조를 모르는 토큰: 같은 종류 원값 중 값이 같은 것 */
const guessRef = (t: Token) => {
  if (t.ref || !t.derived) return null;
  const kind = t.name.split('-').slice(0, t.name.startsWith('--border-width') ? 4 : 3).join('-') + '-';
  return TOKENS.find((x) => x.collection === 'Primitive' && x.name.startsWith(kind.replace(/-(?:control|icon|dot|bullet|arrow|thin|thick)-$/, '-')) && x.value === t.value)?.name || null;
};
const px = (v?: string) => parseFloat(v || '0') || 0;
const byPrefix = (coll: Token['collection'], prefix: string) => TOKENS.filter((t) => t.collection === coll && t.name.startsWith(prefix)).sort((a, b) => px(a.value) - px(b.value));

type Kind = 'space' | 'size' | 'radius' | 'border' | 'shadow';
function Visual({ kind, v }: { kind: Kind; v?: string }) {
  const n = px(v);
  if (kind === 'space') return <i className="fd-bar" style={{ width: Math.min(n, 240) }} />;
  if (kind === 'size') return <i className="fd-box" style={{ width: Math.min(n, 120), height: Math.min(n, 120) }} />;
  if (kind === 'radius') return <i className="fd-box rad" style={{ borderRadius: Math.min(n, 28) }} />;
  if (kind === 'border') return <i className="fd-box line" style={{ borderWidth: v }} />;
  return null;
}

function ScaleTable({ kind, list, semantic }: { kind: Kind; list: Token[]; semantic?: boolean }) {
  return (
    <Table
      cols={semantic ? ['', '이름', '값', '원값', '쓰는 토큰'] : ['', '토큰', '값', '쓰는 토큰']}
      rows={list.map((t) => (
        <tr key={t.name}>
          <td className="fd-vis">
            <Visual kind={kind} v={t.value} />
          </td>
          <td>
            <CopyBtn value={t.name.slice(2)} />
            {t.description && !t.derived ? <span className="fd-sub">{t.description}</span> : null}
            {t.derived ? <span className="fd-flag">Component에서 찾은 값</span> : null}
          </td>
          <td className="mono nowrap">{t.value || '—'}</td>
          {semantic ? <td className="mono">{t.ref ? t.ref.slice(2) : guessRef(t) ? <>{guessRef(t)!.slice(2)} <span className="fd-sub2">(값으로 추정)</span></> : '—'}</td> : null}
          <td className="mono">{usedBy(t.name) || '—'}</td>
        </tr>
      ))}
    />
  );
}

const SCALES: Record<string, { title: string; kind: Kind; lead: string; prim: string[]; sem?: string[]; note?: string }> = {
  spacing: {
    title: '여백',
    kind: 'space',
    lead: '요소 사이 간격과 안쪽 여백에 쓰는 값입니다. 2 · 4 · 6 · 8 … 40px 안에서만 고르고, 임의 값(5px, 18px)을 쓰지 않습니다.',
    prim: ['--space-'],
  },
  sizing: {
    title: '크기',
    kind: 'size',
    lead: '컨트롤 높이 · 아이콘 크기처럼 정해진 크기입니다. 화면과 컴포넌트는 용도 이름(size-control-medium)으로 쓰고, 원값(size-32)은 그 뒤에서 값을 줍니다.',
    prim: ['--size-'],
    sem: ['--size-'],
  },
  radius: {
    title: '모서리',
    kind: 'radius',
    lead: '모서리 둥글기입니다. 용도 이름(xsmall 4 ~ xxlarge 20, full)으로 쓰며, 칩 · 배지처럼 알약 모양은 full을 씁니다.',
    prim: ['--radius-'],
    sem: ['--radius-'],
  },
  'border-width': {
    title: '선 두께',
    kind: 'border',
    lead: '테두리 두께입니다. 기본 테두리는 thin(1px), 포커스 링 · 강조 테두리는 thick(2px)을 씁니다.',
    prim: ['--border-width-'],
    sem: ['--border-width-'],
  },
  shadow: {
    title: '그림자',
    kind: 'shadow',
    lead: '떠 있는 요소(팝오버 · 다이얼로그 · 토스트)의 그림자입니다. 그림자는 세로 거리 · 흐림 · 퍼짐 · 색 재료를 묶어 small ~ xlarge 단계로 씁니다.',
    prim: ['--effect-'],
    note: '단계별 그림자(small ~ xlarge)의 조합과 색은 Semantic 토큰 파일에 있습니다. 지금은 Semantic 파일이 없어 재료만 보입니다.',
  },
};

export function ScalePage({ id }: { id: keyof typeof SCALES }) {
  const s = SCALES[id];
  const prim = s.prim.flatMap((p) => byPrefix('Primitive', p));
  const sem = (s.sem || []).flatMap((p) => byPrefix('Semantic', p));
  const shadowColors = id === 'shadow' ? TOKENS.filter((t) => t.name.startsWith('--color-shadow-') || t.name.startsWith('--color-black-alpha-')) : [];
  const groups = id === 'shadow' ? [...new Set(prim.map((t) => t.figma.split('/')[1]))] : [];
  const EFFECT_LABEL: Record<string, string> = { offsetX: '가로 거리', offsetY: '세로 거리', blur: '흐림', spread: '퍼짐' };
  return (
    <>
      <Head eyebrow="Foundations · 디자인 에셋" title={s.title} lead={s.lead} extra={<p className="gd-source">출처 {SRC} · 원값 {prim.length}{sem.length ? ` · 용도 이름 ${sem.length}` : ''}</p>} />
      {s.note ? <p className="note">{s.note}</p> : null}
      {sem.length ? (
        <>
          <h2 id="semantic">용도 이름 (Semantic)</h2>
          <p className="note">컴포넌트 코드와 화면 설계는 이 이름을 씁니다.</p>
          <ScaleTable kind={s.kind} list={sem} semantic />
        </>
      ) : null}
      {id === 'shadow' ? (
        <>
          {groups.map((g) => (
            <div key={g}>
              <h2 id={`fx-${g}`}>{EFFECT_LABEL[g] || g}</h2>
              <div className="fd-chips">
                {prim
                  .filter((t) => t.figma.split('/')[1] === g)
                  .map((t) => (
                    <span key={t.name} className="fd-chip" title={t.description}>
                      <i className="fd-shadow-demo" style={{ boxShadow: g === 'blur' ? `0 2px ${t.value} rgba(0,0,0,.18)` : g === 'offsetY' ? `0 ${t.value} 6px rgba(0,0,0,.18)` : undefined }} />
                      <CopyBtn value={t.name.slice(2)} /> <b className="mono">{t.value}</b>
                    </span>
                  ))}
              </div>
            </div>
          ))}
          <h2 id="colors">그림자 색</h2>
          <div className="fd-chips">
            {shadowColors.map((t) => (
              <span key={t.name} className="fd-chip" title={t.description}>
                <Swatch value={t.value} /> <CopyBtn value={t.name.slice(2)} /> <b className="mono">{t.value || '값 없음'}</b>
              </span>
            ))}
          </div>
        </>
      ) : (
        <>
          <h2 id="primitive">원값 (Primitive)</h2>
          <p className="note">용도 이름이 가리키는 값입니다. 화면과 컴포넌트에서 직접 쓰지 않습니다.</p>
          <ScaleTable kind={s.kind} list={prim} />
        </>
      )}
    </>
  );
}
export const SCALE_ROUTES = Object.keys(SCALES);
