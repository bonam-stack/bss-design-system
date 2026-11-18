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
