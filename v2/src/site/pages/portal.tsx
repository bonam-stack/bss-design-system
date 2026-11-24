// BSS 디자인 포털 페이지: 홈 · 목록 · 카탈로그 항목 · 거버넌스 · UX 가이드라인 · 승격 심사, 그리고 Foundations · 역할별 작업 페이지로 나눈다.
// 고친 내용은 초안 → 미리보기 확인 → 배포 요청 → 관리자 배포.
import type { FormEvent, ReactNode } from 'react';
import * as P from '../portal/store';
import type { Draft, HistoryEntry, Item, Kind, Role } from '../portal/store';
import { usePortal } from '../portal/ctx';
import { patterns, usage } from '../data';
import { docsFor, docsIn, guideRoute, guideSource } from '../guide';
import { AiSummary } from './AiSummary';
import { TokenDoc } from './TokenDocs';
import { UsagePanel } from './UsagePanel';
import { SbSpec } from './SbSpec';
import { compGroups, docGroup, hostOf } from '../nav';
import { GuideEmbed } from './GuidePage';
import { ColorPage, ScalePage, TokensPage, TypographyPage } from './FoundationPages';
import { BumpTag, Check, CodeLink, UxRef, DraftBox, Drafts, EditBtn, Head, RulesBlock, St, StOf, Table, TextScope, fmt, human, joinNodes } from '../ui';
import { FoundationsOverview, PendingPage } from './foundations';
import { Convert, Deploy, My, MyRequests, Recheck, Requests, Roles, SbEdit, SbStatus, UxEdit } from './work';

const KIND_LABEL: Record<Kind, string> = { block: 'Blocks', comp: 'Components', layout: 'UX 가이드라인 · 레이아웃' };
const formValues = (f: HTMLFormElement) => Object.fromEntries(new FormData(f)) as Record<string, string>;
const list = (s?: string) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);

/** 라우트 → 포털 페이지 (없으면 null) */
export function portalPage(route: string, role: Role): ReactNode | null {
  const isEditor = role !== 'viewer';
  switch (route) {
    case 'overview': return <Overview />;
    case 'stack': return <Stack />;
    case 'updates': return <Updates />;
    case 'foundations': return <FoundationsOverview />;
    case 'tokens': return <TokensPage />;
    case 'token-guide': return <TokenDoc which="guide" />;
    case 'token-changelog': return <TokenDoc which="changelog" />;
    case 'color': return <ColorPage />;
    case 'typography': return <TypographyPage />;
    case 'spacing': case 'sizing': case 'radius': case 'border-width': case 'shadow': return <ScalePage key={route} id={route} />;
    case 'motion': return <PendingPage title="모션" lead="열기 · 닫기 · 전환 · 상태 변화에 쓰는 시간과 움직임 곡선을 정합니다." todo={['시간(짧게 · 보통 · 길게)과 곡선', '팝업 · 토스트 · 펼침 등 컴포넌트별 적용']} />;
    case 'writing': return <PendingPage title="문구 (보이스 · 표기)" lead="화면 문구의 말투와 표기 규칙을 정합니다." todo={['말투 · 존댓말 기준', '버튼 · 안내 · 오류 문구 패턴', '숫자 · 날짜 · 단위 표기 (UX 규칙의 표기 규칙과 연결)']} />;
    case 'process': return <Process />;
    case 'ui-rules': return <PendingPage eyebrow="거버넌스 · UI 규칙" title="UI 규칙" lead="화면을 그릴 때 지키는 시각 규칙입니다. UX 규칙(화면을 어떻게 짜는가)과 짝을 이루고, Foundations · Components · Blocks는 모두 이 규칙을 따릅니다." todo={['값 대신 디자인 토큰만 쓰기 (색 · 글자 · 여백 · 모서리 · 그림자)', '컴포넌트 변형 · 상태(hover · pressed · disabled · focus)를 정해진 것만 쓰기', '간격 · 정렬 · 밀도 기준', 'Do · Don\'t와 규칙 번호 (UX 규칙과 같은 형식)']} />;
    case 'design-review': return <PendingPage eyebrow="거버넌스 · UI 규칙" title="디자인 검수 기준" lead="UI팀이 컴포넌트 · 블록을 배포하거나 업무 블록을 승격할 때 확인하는 항목입니다. 승격 심사 2단계(UI팀 디자인)의 기준이 됩니다." todo={['토큰 연결 · 하드코딩 값 없음', 'Figma 디자인 라이브러리와 일치 (속성 · 변형 · 이름)', '상태 · 접근성(대비 · 포커스) 확인', '승격 심사 2단계 체크리스트']} />;
    case 'figma-guide': return <PendingPage eyebrow="거버넌스 · UI 규칙" title="Figma 작성 기준" lead="SB 라이브러리는 디자인 DS 라이브러리와 동기화됩니다. 소스 변환이 읽을 수 있도록 Figma에서 지켜야 할 구조입니다." todo={['컴포넌트 · 레이어 · 속성 이름 규칙', 'Figma 변수(토큰) 연결 · 스타일 사용', '업무 블록을 Figma에서 고칠 때의 순서 (DS 담당자)', '라이브러리 배포 · 버전 기록']} />;
    case 'workboard': return <MyRequests />;
    case 'ux-edit': return role === 'ux' ? <UxEdit /> : null;
    case 'sb-edit': return role === 'ux' ? <SbEdit /> : null;
    case 'my': return role === 'ux' || role === 'ds' ? <My /> : null;
    case 'requests': return role === 'ds' ? <Requests /> : null;
    case 'convert': return role === 'ds' ? <Convert /> : null;
    case 'deploy': return role === 'approver' ? <Deploy /> : null;
    case 'recheck': return role === 'approver' ? <Recheck /> : null;
    case 'roles': return role === 'approver' ? <Roles /> : null;
    case 'components': return <ItemList kind="comp" />;
    case 'blocks': return <ItemList kind="block" />;
    case 'patterns': return <PatternList />;
    case 'ux-guide': return <UxGuide />;
    case 'rules': return <Rules />;
    case 'slots': return <Slots />;
    case 'lint': return <Lint />;
    case 'sb-spec': return <SbSpec />;
    case 'promo': return isEditor ? <Promo /> : null;
  }
  const it = P.item(route);
  if (it && !it.key) return <ItemPage it={it} />;
  return null;
}

// ---------- 홈 ----------

function Overview() {
  const cards = [
    ['ui-rules', '거버넌스', 'UI 규칙', 'UI 규칙 · 디자인 검수 기준 · Figma 작성 기준'],
    ['foundations', 'Foundations', '컬러 · 타이포 · 여백 · 아이콘 · 토큰', '모든 부품이 쓰는 디자인 에셋'],
    ['components', 'Components', '묶음별 컴포넌트', '블록 안에 들어가는 최소 부품'],
    ['blocks', 'Blocks', '공통 블록 · 기능 블록 · BO 블록 · 모듈 정의', '슬롯 하나를 채우는 업무 단위 묶음'],
    ['workboard', 'Workboard', '요청이 어디까지 진행됐나', '단계별 건수 · 요청 목록 · 요청하기'],
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
            <Check on label={`UX 패턴 가이드 ${guideSource.release}`} />
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
    ['구조', 'app', '화면이 바뀌어도 남는 바탕 틀 · GNB · LNB · 콘텍스트 바 · 본문 영역', P.slots().filter((x) => x.owner === 'app').length, 'g-layout-common'],
    ['레이아웃 규칙', 'l-', '본문 영역을 어떤 슬롯 순서로 나눌지 정하는 규칙', n('layout'), 'patterns'],
    ['슬롯', '경로', '부품이 들어갈 자리 · 고정 · 쌓기 · 자유', P.slots().length, 'slots'],
    ['블록', 'b-', '슬롯 하나를 채우는 업무 단위 묶음', n('block'), 'blocks'],
    ['컴포넌트', 'c-', '블록 안에 들어가는 최소 부품', n('comp'), 'components'],
  ];
  return (
    <>
      <Head eyebrow="UX 가이드라인 · 레이아웃" title="조립 구조" lead="화면은 큰 단위에서 작은 단위로 쌓아 조립합니다. SB Studio는 4단계에서 이 순서대로 놓고 5단계에서 디자인 에셋을 입힙니다." />
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
        화면 유형 판정 규칙 순서로 판정합니다.
      </p>
      <ul>
        <li>
          <b>특수형</b> · 표준 틀로 만들 수 없는 예외 화면 · Stack 조립 제외 · 관리자 승인
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
          ['레이아웃 규칙 · 규칙 · 사용 가이드', 'UX 패턴 가이드 · 이 포털', P.ROLES.ux, P.ROLES.approver],
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
      <Head eyebrow="BSS Design" title="업데이트" lead="게시된 버전과 변경 노트입니다. MAJOR는 기존 것을 고치거나 지울 때(이미 만든 SB 재검수), MINOR는 추가 · 승격, PATCH는 설명 수정입니다." />
      <p className="note">
        UX 패턴 가이드는 {guideSource.release} 릴리스를 반영했습니다 ({guideSource.generated} 추출). 파운데이션 · 패턴 · 모듈 · 컴포넌트 가이드는 각 섹션에, 권장 · 금지는 규칙에, 용어는 용어사전에 있습니다.
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
  const { can } = usePortal();
  const I = P.items().filter((i) => i.kind === kind);
  const isComp = kind === 'comp';
  return (
    <>
      <Head
        eyebrow={isComp ? 'Components' : 'Blocks'}
        title={isComp ? '컴포넌트' : '블록'}
        lead={isComp ? '블록 안에 들어가는 최소 부품입니다. ✓ 표시는 Figma 디자인 에셋과 사용 가이드가 있는 것입니다.' : '블록은 슬롯 하나를 채우는 업무 단위 묶음입니다. 공통 블록 · 기능 블록 · BO 블록으로 나뉩니다. 블록이 무엇이고 어떻게 구성되는지는 모듈 정의에 있습니다.'}
      />
      {isComp && can('figma') ? (
        <p className="row">
          <a className="btn2 sm" href="#convert">
            새 컴포넌트는 DS 작업 › 소스 변환에서 Figma 주소로 추가
          </a>
        </p>
      ) : null}
      {isComp ? (
        compGroups().map((g) => {
          const L = I.filter((i) => (i.group || '기타') === g);
          const docs = docsIn('components').filter((d) => docGroup(d) === g && !hostOf(d.id));
          if (!L.length && !docs.length) return null;
          return (
            <div key={g}>
              <h2 id={`g-${g}`}>
                {g} <span className="count">{L.length}</span>
              </h2>
              {docs.length ? (
                <p className="note">
                  사용 가이드{' '}
                  {docs.map((d, j) => (
                    <span key={d.id}>
                      {j ? ' · ' : ''}
                      <a href={`#${guideRoute(d.id)}`}>{d.title}</a>
                    </span>
                  ))}
                </p>
              ) : null}
              {L.length ? <Grid list={L} /> : <p className="note">아직 이 묶음의 컴포넌트가 없습니다.</p>}
            </div>
          );
        })
      ) : (
        <BlockSections list={I} />
      )}
    </>
  );
}

/** 블록 성격별 묶음 (공통 · 기능 · BO 블록이 같은 분류) */
function TypeGrid({ list }: { list: Item[] }) {
  return (
    <>
      {P.BLOCK_TYPES.map((t) => {
        const L = list.filter((i) => P.blockType(i) === t);
        return L.length ? (
          <div key={t}>
            <h3>
              {t} <span className="count">{L.length}</span>
            </h3>
            <Grid list={L} />
          </div>
        ) : null;
      })}
    </>
  );
}

/** Blocks: 공통 블록 · 업무 블록(+ 승격 진행) */
function BlockSections({ list: I }: { list: Item[] }) {
  const sb = I.filter((i) => P.isSb(i));
  const promos = P.promotions().filter((p) => /^tb-/.test(p.code));
  return (
    <>
      <p className="note">공통 · 기능 · BO 블록은 같은 성격으로 나눕니다: {P.BLOCK_TYPES.join(' · ')}. 성격은 블록이 놓이는 슬롯과 모듈 정의를 따르므로, 같은 성격끼리 비교해 겹치는 업무 블록을 공통 블록으로 승격합니다.</p>
      <h2 id="common">공통 블록</h2>
      <TypeGrid list={I.filter((i) => !P.isSb(i))} />
      {P.SB_DOMAINS.map((dm) => {
        const L = sb.filter((i) => P.sbDomain(i) === dm);
        return (
          <div key={dm}>
            <h2 id={`blk-${dm}`}>
              {P.SB_GROUP[dm]} <span className="count">{L.length}</span>
            </h2>
            {L.length ? <TypeGrid list={L} /> : null}
          </div>
        );
      })}
      {promos.length ? (
        <>
          <h3>승격 진행</h3>
          <Table
            cols={['업무 블록', '사용', '판단', '단계', '상태']}
            rows={promos.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.from}</td>
                <td>{human(p.judge)}</td>
                <td className="nw">{p.stage}</td>
                <td>
                  <SbStatus p={p} />
                </td>
              </tr>
            ))}
          />
        </>
      ) : null}
      <h2 id="modules">모듈 정의</h2>
      <p className="note">블록이 무엇이고 어떻게 구성되는지 정한 UX 패턴 가이드의 모듈 문서입니다. 그 안의 지켜야 할 규칙은 거버넌스 › 규칙에 번호로 모여 있습니다.</p>
      {[...new Set(docsIn('blocks').map((d) => d.group.split(' › ')[0] || '모듈'))].map((g) => (
        <p key={g}>
          <b>{g}</b>{' '}
          {docsIn('blocks')
            .filter((d) => (d.group.split(' › ')[0] || '모듈') === g)
            .map((d, j) => (
              <span key={d.id}>
                {j ? ' · ' : ''}
                <a href={`#${guideRoute(d.id)}`}>{d.title}</a>
              </span>
            ))}
        </p>
      ))}
    </>
  );
}

/** UX 가이드라인 개요: 화면을 큰 것부터 짜는 순서대로 문서 묶음 */
function UxGuide() {
  const doc = (place: Parameters<typeof docsIn>[0]) => docsIn(place);
  const link = (id: string, title: string) => (
    <a key={id} href={`#${guideRoute(id)}`}>
      {title}
    </a>
  );
  const join = (L: ReactNode[]) => L.flatMap((x, i) => (i ? [' · ', x] : [x]));
  const groups = (place: Parameters<typeof docsIn>[0]) => [...new Set(doc(place).map((d) => d.group.split(' › ')[0]))];
  return (
    <>
      <Head eyebrow="UX 가이드라인" title="UX 가이드라인" lead="화면을 어떻게 짜는지 정한 문서입니다. 큰 것에서 작은 것 순서(원칙 → 화면 구조 → 레이아웃 → 화면 가이드)로 읽고, 블록 · 컴포넌트는 Blocks · Components에서 이어 봅니다. 지켜야 할 규칙은 거버넌스 › 규칙에 번호로 모여 있습니다." />
      <h2 id="principle">원칙</h2>
      <p>{join(doc('start').map((d) => link(d.id, d.title)))}</p>
      <h2 id="structure">화면 구조</h2>
      {groups('foundations').map((g) => (
        <p key={g}>
          <b>{g || '구조'}</b> {join(doc('foundations').filter((d) => d.group.split(' › ')[0] === g).map((d) => link(d.id, d.title)))}
        </p>
      ))}
      <h2 id="layout">레이아웃</h2>
      <p>
        <a href="#stack">조립 구조</a> · 슬롯 ·{' '}
        {join(P.items().filter((i) => i.kind === 'layout').map((i) => <a key={i.code} href={`#${i.code}`}>{i.name} 레이아웃</a>))}
      </p>
      <h2 id="guide">화면 가이드</h2>
      {groups('patterns').map((g) => (
        <p key={g}>
          <b>{g || '기타'}</b> {join(doc('patterns').filter((d) => d.group.split(' › ')[0] === g).map((d) => link(d.id, d.title)))}
        </p>
      ))}
    </>
  );
}

function PatternList() {
  const L = P.items().filter((i) => i.kind === 'layout');
  return (
    <>
      <Head eyebrow="UX 가이드라인" title="화면 가이드" lead="화면을 어떤 순서로 쌓고 어떻게 동작하게 할지 정한 가이드라인과 레이아웃 규칙입니다. 블록과 SB는 이 가이드라인을 따릅니다." />
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
  const uses = usage.items.filter((u) => u.block === it.code);
  const ru = P.rulesFor(it.code);
  const slotsOf = P.slots().filter((s) => s.owner === it.code);
  const editing = ui.edit === `item:${it.code}`;
  const d = P.openDraft('item', it.code);
  const kv: [string, ReactNode][] = (
    [
      ['상태', <StOf s={it.status} />],
      it.kind === 'comp' ? ['변형', it.variants] : null,
      it.kind === 'block' ? ['놓이는 슬롯', human(it.slot)] : null,
      it.kind === 'layout' ? ['적용 슬롯', <CodeLink code={it.slot || ''} />] : null,
      it.kind === 'layout' ? ['근거 문서', <UxRef r={it.guide} />] : null,
      ['기준 원본', it.design ? '모양 Figma 디자인 시스템 · 뜻 카탈로그' : it.kind === 'layout' ? 'UX 패턴 가이드' : 'UX 패턴 가이드 · 디자인 에셋 없음'],
      it.promotedFrom ? ['승격', `${it.promotedFrom}에서`] : null,
    ] as ([string, ReactNode] | null)[]
  ).filter((x): x is [string, ReactNode] => !!x);
  return (
    <TextScope.Provider value={{ key: it.code, name: it.name }}>
      <Head
        eyebrow={it.kind === 'block' ? `Blocks · ${P.sbDomain(it) ? P.SB_GROUP[P.sbDomain(it)!] : '공통 블록'} · ${P.blockType(it)}` : KIND_LABEL[it.kind]}
        title={it.name}
        lead={it.meaning}
        extra={
          <>
          <div className="checks">
            <Check on={it.design} label="Figma" />
            <Check on={it.ux} label="UX 가이드" />
            <Check on={it.status === 'pub'} label={P.STATUS[it.status]} />
          </div>
          {it.kind !== 'layout' ? (
            <AiSummary
              k={it.code}
              name={it.name}
              codeName={it.code}
              meaning={it.meaning}
              props={[]}
              actions={(it.lines || []).filter((l) => l.kind === 'rule').map((l) => `${l.cond} → ${l.action}`)}
              policy={{
                title: '',
                lead: '',
                when: { use: it.policy?.use || [], avoid: it.policy?.avoid || [] },
                rules: ru.filter((r) => !r.source).slice(0, 6).map((r) => ({ name: r.kind, desc: r.text, from: r.doc })),
                do: it.policy?.do || ru.filter((r) => r.source && r.kind === '권장').map((r) => r.text),
                dont: it.policy?.dont || ru.filter((r) => r.source && r.kind === '금지').map((r) => r.text),
              }}
            />
          ) : null}
          </>
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
              <h3>슬롯</h3>
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
              <h3>구성표</h3>
              <p className="note">블록 안 자리마다 어떤 컴포넌트를 어떤 속성값으로 쓰는지입니다. SB Studio는 이 값으로 블록을 그립니다.</p>
              <Table
                cols={['자리', '컴포넌트', '속성 · 값', '글 · 쓰는 법', '필수']}
                rows={parts.map((p, i) => (
                  <tr key={i}>
                    <td className="mono">{p.slot}</td>
                    <td>
                      <CodeLink code={p.comp} />
                    </td>
                    <td>
                      {p.props && Object.keys(p.props).length ? (
                        Object.entries(p.props).map(([k, v]) => (
                          <span key={k} className="kv-chip">
                            <code>{k}</code> {v}
                          </span>
                        ))
                      ) : (
                        <span className="muted">기본값</span>
                      )}
                    </td>
                    <td>{p.note || ''}</td>
                    <td>{p.required ? '필수' : '선택'}</td>
                  </tr>
                ))}
              />
            </>
          ) : null}
        </>
      ) : null}
      {(it.lines || []).length ? (
        <>
          <h2 id="lines">동작</h2>
          <p className="note">블록이 어떻게 동작하는지를 조건 → 동작으로 적습니다. SB Studio는 이 줄로 디스크립션을 쓰고 검수합니다.</p>
          <Table
            cols={['종류', '조건 · 자리', '동작', '설명']}
            rows={it.lines!.map((l, i) => (
              <tr key={i}>
                <td className="nowrap">
                  <span className={`line-kind k-${l.kind}`}>{P.LINE_KIND[l.kind]}</span>
                </td>
                <td>{l.cond || (l.slot ? <code>{l.slot}</code> : '')}</td>
                <td>{l.action ? <b>{l.action}</b> : ''}</td>
                <td>{l.text}</td>
              </tr>
            ))}
          />
        </>
      ) : null}
      <h2>
        Properties {can(P.editKind(it)) ? <EditBtn k={`item:${it.code}`} /> : null}
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
          <GuideEmbed docs={docsFor(it.code).map((d) => d.id)} />
          <RulesBlock list={ru} />
        </>
      ) : null}
      {usedIn.length || uses.length ? (
        <>
          <h2>Usage</h2>
          {usedIn.length ? (
            <>
              <h3>쓰이는 블록</h3>
              <p className="chips">{joinNodes(usedIn.map((b) => <CodeLink key={b} code={b} />), ' · ')}</p>
            </>
          ) : null}
          {uses.length ? <UsagePanel code={it.code} /> : null}
        </>
      ) : null}
    </TextScope.Provider>
  );
}

export function ItemForm({ r, d }: { r: Item; d: Draft | null }) {
  const { role, act, closeEdit } = usePortal();
  const v: Item = d ? { ...r, ...d.after } : r;
  const extra = r.kind === 'comp' ? (['variants', '변형'] as const) : (['slot', r.kind === 'layout' ? '적용 슬롯' : '놓이는 슬롯'] as const);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = formValues(e.currentTarget);
    const fields: Partial<Item> = { name: f.name, meaning: f.meaning, status: f.status as P.Status };
    if ('variants' in f) fields.variants = f.variants;
    if ('slot' in f) fields.slot = f.slot;
    act(() => P.draftItem(role, r.code, fields), (x) => `초안 ${x.id} 저장 · 내 변경에서 미리보기 확인 후 배포 요청`).then((x) => x && closeEdit());
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
        <span className="muted">관리자가 배포하면 반영됩니다</span>
      </div>
    </form>
  );
}

// ---------- 거버넌스 · UX 규칙 ----------

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
      <Head eyebrow="거버넌스 · UX 규칙" title="규칙" lead="규칙 한 줄이 슬롯 → 블록 → 컴포넌트로 이어지는 연결표입니다. UX 패턴 가이드의 Do · Don't는 권장 · 금지 규칙으로 함께 올라 있습니다. SB Studio의 생성 · 미리보기 · Figma 검사 · 독립 검수가 같은 규칙을 씁니다." />
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
        <input type="search" id="rq" value={ui.q} placeholder="규칙 · 슬롯 · 블록 · 컴포넌트 검색" aria-label="규칙 검색" onChange={(e) => setUi((u) => ({ ...u, q: e.target.value }))} />
        {['', ...KINDS, '권장', '금지'].map((x) => (
          <button key={x} type="button" className={`chip${ui.kd === x ? ' on' : ''}`} onClick={() => setUi((u) => ({ ...u, kd: x }))}>
            {x || '전체'}
          </button>
        ))}
        <span className="muted">{L.length}건 · 포털 규칙 + UX 패턴 가이드 {guideSource.release} (권장 · 금지)</span>
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

const SLOT_MODE: Record<string, { label: string; desc: string }> = {
  고정: { label: '고정', desc: '정해진 블록 하나만 들어갑니다. 다른 것으로 바꿀 수 없습니다.' },
  쌓기: { label: '쌓기', desc: '허용된 블록 여러 개를 위에서 아래로 순서대로 쌓습니다.' },
  자유: { label: '자유', desc: '들어갈 것을 정해 두지 않은 자리입니다. 관리자의 승인을 받아야 씁니다.' },
};
/** 슬롯이 딸린 곳 (조립 순서: 구조 → 레이아웃 → 블록 · 컴포넌트 안) */
const SLOT_OWNERS: [owner: string, title: string, what: string][] = [
  ['app', '모든 화면의 바탕 틀', '어느 화면에나 늘 있는 자리입니다. 본문 영역에는 아래 화면 유형 중 하나가 들어갑니다.'],
  ['l-general', '일반형 화면의 본문', '일반 업무 화면의 본문을 위에서 아래로 나눈 자리입니다. (선택) 자리는 비워 둘 수 있습니다.'],
  ['b-content', '컨텐트 블록 안', '일반형 화면의 컨텐트 자리에 들어간 블록을 다시 나눈 자리입니다.'],
  ['l-node', '노드형 화면의 본문', '단계가 이어지는 절차형 업무 화면의 자리입니다.'],
  ['c-popup', '팝업 틀', '팝업 컴포넌트가 가진 자리입니다.'],
  ['l-popup', '팝업 본문', '팝업 본문을 나눈 자리입니다. 일반형에서 페이지 타이틀을 뺀 구조입니다.'],
  ['l-special', '특수형 화면', '표준 틀로 만들 수 없는 예외 화면입니다.'],
];

function Slots() {
  const all = P.slots();
  const owners = [...SLOT_OWNERS.map(([o]) => o), ...[...new Set(all.map((s) => s.owner))].filter((o) => !SLOT_OWNERS.some(([x]) => x === o))];
  return (
    <>
      <Head
        eyebrow="UX 가이드라인 · 레이아웃"
        title="슬롯"
        lead="슬롯(slot)은 화면에서 무엇이 들어갈지 정해 둔 자리입니다. 화면을 설계할 때 아무 블록이나 놓지 않고, 자리마다 정해진 블록만 넣습니다. SB Studio의 생성기와 검증 규칙이 이 표로 화면을 만들고 검사합니다."
      />
      <h2 id="modes">넣는 방식 3가지</h2>
      <div className="slot-modes">
        {Object.values(SLOT_MODE).map((m) => (
          <section key={m.label} className="slot-mode">
            <span className={`slot-tag m-${m.label}`}>{m.label}</span>
            <p>{m.desc}</p>
          </section>
        ))}
      </div>
      <h2 id="read">읽는 법</h2>
      <p className="pt-text">
        예를 들어 <b>일반형 화면</b>의 <b>조회조건</b> 자리는 <span className="slot-tag m-고정">고정</span>이고 <b>조회조건 블록</b>만 들어갑니다. 그래서 일반형 화면에 조회조건을 넣을 때는 늘 같은 블록을 쓰고, 다른 블록을 그 자리에 놓으면 검증에서 오류가 납니다.
      </p>
      {owners.map((o) => {
        const L = all.filter((s) => s.owner === o);
        if (!L.length) return null;
        const meta = SLOT_OWNERS.find(([x]) => x === o);
        return (
          <div key={o}>
            <h2 id={`slot-${o}`}>
              {meta?.[1] || o} <span className="count">{L.length}</span>
            </h2>
            <p className="note">
              {meta?.[2]} <span className="muted">· 정한 곳</span> <CodeLink code={o} />
            </p>
            <SlotFrame owner={o} slots={L} />
          </div>
        );
      })}
    </>
  );
}

/** 슬롯이 딸린 곳마다 실제 화면 배치 (CSS grid 영역 이름 = 슬롯 경로 끝) */
const FRAMES: Record<string, { areas: string; cols: string; rows: string; h: number; label?: string }> = {
  app: { areas: '"lnb gnb communicator" "lnb context-bar communicator" "lnb body communicator"', cols: '72px 1fr 200px', rows: '52px 40px 1fr', h: 420, label: '공통 틀' },
  'l-general': { areas: '"title" "notice" "search" "detail" "content"', cols: '1fr', rows: '52px 44px 72px 72px 1fr', h: 460, label: '일반형 본문' },
  'b-content': { areas: '"action" "body" "status"', cols: '1fr', rows: '48px 1fr 44px', h: 300, label: '컨텐트' },
  'l-node': { areas: '"hud" "canvas" "actionbar"', cols: '1fr', rows: '56px 1fr 56px', h: 340, label: '노드형 본문' },
  'c-popup': { areas: '"content" "actions"', cols: '1fr', rows: '1fr 56px', h: 300, label: '팝업' },
  'l-popup': { areas: '"search" "content"', cols: '1fr', rows: '72px 1fr', h: 300, label: '팝업 본문' },
  'l-special': { areas: '"canvas"', cols: '1fr', rows: '1fr', h: 240, label: '특수형' },
};
const areaOf = (path: string) => path.split('.').pop()!;

function SlotFrame({ owner, slots }: { owner: string; slots: P.Slot[] }) {
  const f = FRAMES[owner] || { areas: slots.map((s) => `"${areaOf(s.path)}"`).join(' '), cols: '1fr', rows: slots.map(() => '1fr').join(' '), h: 80 * slots.length };
  const known = new Set(f.areas.replace(/"/g, ' ').split(/\s+/).filter(Boolean));
  return (
    <div className={`slot-frame${owner === 'c-popup' ? ' dim' : ''}`}>
      {f.label ? <span className="slot-frame-label">{f.label}</span> : null}
      <div className="slot-grid" style={{ gridTemplateAreas: f.areas, gridTemplateColumns: f.cols, gridTemplateRows: f.rows, height: f.h }}>
        {slots.map((s) => {
          const a = areaOf(s.path);
          return (
            <div key={s.path} className={`slot-area m-${s.mode}${/선택/.test(s.name) ? ' opt' : ''}`} style={known.has(a) ? { gridArea: a } : undefined} title={s.path}>
              <b>{s.name.replace(/ 영역$/, '')} 슬롯</b>
              <span className={`slot-tag m-${s.mode}`}>{s.mode}</span>
              <span className="slot-acc">{accepts(s.accepts)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** '들어가는 것'의 카탈로그 코드는 그 페이지로 */
function accepts(text: string) {
  const parts = String(text).split(/(\b(?:c|b|l)-[a-z][a-z0-9-]*)/g);
  return parts.map((p, i) => (i % 2 ? <CodeLink key={i} code={p} /> : <span key={i}>{human(p)}</span>));
}

/** 거버넌스 › 운영 절차: 누가 무엇을 고치고, 어떻게 심사 · 배포하고, 버전을 어떻게 올리는지 */
function Process() {
  const steps: [string, string][] = [
    ['요청', '누구나 Workboard에서 아이콘 · 컴포넌트 · 블록 · 토큰을 요청합니다. 기획은 AI 더미로 계속 진행합니다.'],
    ['작업 · 초안', 'UX 담당자는 규칙 · 가이드라인 · 업무 블록 설명을, DS 담당자는 토큰 · 컴포넌트 · 블록 모양(Figma)을 고칩니다. 고친 것은 초안이 됩니다.'],
    ['미리보기 확인', '초안은 미리보기 버전(x.y.z-preview.N)으로 확인합니다. 자동 검사(속성값 · ID · 규칙 · 토큰)를 통과해야 합니다.'],
    ['배포 요청', '담당자가 내 변경에서 배포를 요청합니다.'],
    ['배포', '관리자가 운영 서버에 배포합니다. 정기 배포가 기본이고, 수동 배포는 사유를 남깁니다. 문제가 있으면 롤백합니다.'],
    ['재검수', '규칙이 바뀌거나 MAJOR 배포가 나가면 영향받는 SB를 재검수 대상으로 알립니다.'],
  ];
  return (
    <>
      <Head eyebrow="거버넌스 · 운영" title="운영 절차" lead="디자인 시스템을 누가 고치고, 어떻게 심사해 배포하고, 버전을 어떻게 올리는지 정한 절차입니다. 모든 문서와 재료(Foundations · Components · Blocks)는 이 절차로만 바뀝니다." />
      <h2 id="flow">바뀌는 순서</h2>
      <ol className="flow">
        {steps.map(([t, d]) => (
          <li key={t}>
            <strong>{t}</strong>
            <span>{d}</span>
          </li>
        ))}
      </ol>
      <h2 id="roles">역할</h2>
      <Table
        cols={['역할', '맡는 것', '배포']}
        rows={[
          ['보기', '문서 읽기 · Workboard', '-'],
          ['UX 담당자', 'UX 가이드라인 · 모듈 정의 · UX 규칙 · 업무 블록 설명 · 놓이는 슬롯 · 승격 1단 심사', '배포 요청'],
          ['DS 담당자', 'UI 규칙 · 토큰 · 컴포넌트 · 블록 모양(Figma) · 소스 변환 · 디자인 요청 · 승격 2단 심사', '배포 요청'],
          ['관리자', '운영 서버 배포 · 롤백 · 재검수 대상 알림 · 권한 확인', '정기 · 수동 배포'],
        ].map((r) => (
          <tr key={r[0]}>
            <th>{r[0]}</th>
            <td>{r[1]}</td>
            <td>{r[2]}</td>
          </tr>
        ))}
      />
      <h2 id="promo">승격</h2>
      <p>
        여러 업무에서 반복해 쓰인 업무 블록(기능 · BO 블록)은 승격 후보가 됩니다. SB팀 표준 심사(UX 담당자) → UI팀 디자인 심사(DS 담당자, <a href="#design-review">디자인 검수 기준</a>) → 관리자 배포를 거쳐 공통 블록이 됩니다.
      </p>
      <h2 id="version">버전 규칙</h2>
      <Table
        cols={['올림', '언제', 'SB에 미치는 영향']}
        rows={[
          ['MAJOR', '기존 것을 고치거나 지울 때 (규칙 수정 · 삭제, 속성 정의 변경)', '이미 만든 SB 재검수'],
          ['MINOR', '추가 · 승격 (새 규칙 · 컴포넌트 · 토큰)', '없음 · 새로 쓸 수 있음'],
          ['PATCH', '설명 · 글 수정', '없음'],
        ].map((r) => (
          <tr key={r[0]}>
            <th className="mono">{r[0]}</th>
            <td>{r[1]}</td>
            <td>{r[2]}</td>
          </tr>
        ))}
      />
      <p className="note">
        지금 운영 버전 <b className="mono">{P.version()}</b> · 변경 기록은 <a href="#updates">업데이트</a>
      </p>
    </>
  );
}

function Lint() {
  const L = P.checks();
  return (
    <>
      <Head eyebrow="거버넌스 · UX 규칙" title="검증 규칙" lead="규칙 한 벌을 SB Studio의 생성 · 미리보기 · Figma 검사 · 게시 · 독립 검수가 같이 씁니다. 판정 조건과 심각도는 catalog.json의 checks가 원본입니다." />
      <h2 id="list" className="sr">
        검증 규칙
      </h2>
      <Table
        cols={['내용', '판정 조건', '판정하는 때', '심각도']}
        rows={L.map((r) => (
          <tr key={r.id}>
            <td>
              <b>{r.name}</b>
              <span className="fd-sub">{human(r.target)}</span>
            </td>
            <td>{human(r.condition)}</td>
            <td>{r.when.join(' · ')}</td>
            <td>
              <St c={r.severity === '오류' ? 'ng' : 'hold'} t={r.severity} />
            </td>
          </tr>
        ))}
      />
      <p className="note">
        SB Studio에 주는 형식은 SB Studio 연동 규격에 있습니다.
      </p>
    </>
  );
}

// ---------- 승격 심사 (UX 담당자 · DS 담당자 · 관리자) ----------

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
    act(() => P.promote(role, k, ok, { url: inp?.value.trim() }), (p) => (p.status === '승인' ? `공통 블록으로 배포 · ${p.code} · 운영 ${P.version()}` : p.status === '반려' ? '반려했습니다' : `${p.stage} 단계로 넘겼습니다`));
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
    act(() => P.addPromotion(role, { code: v.code, name: v.name, from: v.from, judge: v.judge }), (p) => `${p.id} 등록 · ${p.stage} 단계`).then((x) => x && f.reset());
  };
  return (
    <>
      <Head
        eyebrow={role === 'approver' ? '관리자' : role === 'ds' ? 'DS 작업' : 'UX 편집'}
        title="승격 심사"
        lead="여러 Storyboard에서 반복해 쓰인 업무 블록(tb-)을 2단 심사(SB팀 표준 → UI팀 디자인)를 거쳐 공통 블록으로 올립니다. 마지막은 관리자가 배포합니다."
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
            <b>승격 후보 등록</b>
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
      <h2 id="list">승격 후보</h2>
      <Table
        cols={['후보', '이름', '사용', '변형 판단', '심사 단계', '상태', '처리']}
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
      <p className="muted">관리자가 배포하면 코드 앞자리만 바뀌어(tb- → b-, tc- → c-) 공통 블록이 됩니다.</p>
    </>
  );
}

