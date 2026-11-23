// Foundations: 개요 · 토큰 편집 칸 · 준비 중 문서(모션 · 문구). 컬러 · 타이포그래피 · 여백 등 값 문서는 FoundationPages.
// 토큰 추가 · 수정은 DS 담당자 (디자인 토큰 문서의 편집 칸) → 초안 → 배포 요청 → 관리자 배포.
import { useState } from 'react';
import type { FormEvent } from 'react';
import * as P from '../portal/store';
import { usePortal } from '../portal/ctx';
import { icons } from '../data';
import { DraftBox, Head } from '../ui';

export function FoundationsOverview() {
  const n = Object.keys(P.tokens()).length;
  const cards: [string, string, string, string][] = [
    ['color', '컬러', 'Primitive → Semantic', '역할(배경 · 글자 · 테두리)로 고르는 색'],
    ['typography', '타이포그래피', 'Pretendard', '크기 · 줄 높이 · 굵기 단계'],
    ['spacing', '여백 · 크기 · 모서리 · 선 두께', '치수 토큰', '컴포넌트 토큰이 가리키는 단계'],
    ['shadow', '그림자', '화면 층', '카드 · 팝업 · 토스트가 쓰는 그림자'],
    ['icons', '아이콘', 'Line · Filled · Colored', `아이콘 ${icons.icons.length}개`],
    ['tokens', '디자인 토큰', 'Primitive → Semantic → Component', '토큰 목록 · 편집'],
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
          <span>DS 담당자가 토큰을 고치면 초안 → 배포 요청 → 관리자 배포로 반영됩니다. 지금 토큰 {n}개.</span>
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

export function TokenEditor() {
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
    act(() => P.draftToken(role, f), (d) => `초안 ${d.id} 저장 · 배포 요청 메뉴에서 미리보기 확인 후 요청`);
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
export function PendingPage({ title, lead, todo, eyebrow = 'Foundations' }: { title: string; lead: string; todo: string[]; eyebrow?: string }) {
  return (
    <>
      <Head eyebrow={eyebrow} title={title} lead={lead} extra={<div className="checks"><span className="st">준비 중</span></div>} />
      <h2 id="todo">채울 내용</h2>
      <ul>
        {todo.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <p className="note">기준이 정해지면 DS 담당자가 이 문서를 채웁니다.</p>
    </>
  );
}
