// 위쪽 섹션 메뉴 · 왼쪽 목록 · 이전/다음 · 역할 선택 · 에디터 모드 띠.
// 누구에게나 같은 문서와 "내 요청"이 보이고, 역할(SB Studio 계정에서 받음)에 따라 작업 메뉴와 문서 안 편집 칸이 켜진다.
// 작업 메뉴: UX 담당자 = UX 편집, DS 담당자 = DS 작업, 관리자 = 관리자.
import { useEffect, useRef, useState } from 'react';
import * as P from './portal/store';
import type { Role } from './portal/store';
import { usePortal } from './portal/ctx';
import { patterns, icons } from './data';
import { docsIn, guideRoute } from './guide';
import type { Place } from './guide';

/** [경로, 이름, 왼쪽 목록 소제목] */
export type NavItem = [route: string, label: string, sub?: string, tag?: string];
export type Section = [key: string, label: string, items: NavItem[]];

/** UX 패턴 가이드 문서를 그 섹션 목록에 (소제목 = 가이드의 묶음) */
const guideItems = (place: Place, sub: (group: string) => string): NavItem[] => docsIn(place).map((d) => [guideRoute(d.id), d.title, sub(d.group.split(' › ')[0])]);

/** 가이드 문서의 컴포넌트 묶음: 문서 묶음이 없으면 문서 제목(테이블 · 리스트 …) */
export const docGroup = (d: { group: string; title: string }) => d.group.split(' › ')[0] || d.title;
/** 이 가이드 문서가 딸린 카탈로그 항목 (컴포넌트 · 블록 페이지 안에 보인다) */
export const hostOf = (docId: string) => {
  const d = docsIn('components').find((x) => x.id === docId);
  if (!d) return null;
  const L = d.targets.map((c) => P.item(c)).filter(Boolean) as P.Item[];
  return L.find((i) => i.kind === 'comp') || L[0] || null;
};
/** 컴포넌트 묶음 순서 (UX 패턴 가이드의 컴포넌트 분류) */
export const compGroups = () => {
  const order = P.catalogMeta().compGroups || [];
  const used = [...new Set([...P.items().filter((i) => i.kind === 'comp').map((i) => i.group || '기타'), ...docsIn('components').map(docGroup)])];
  return [...order, ...used.filter((g) => !order.includes(g))];
};

/** Components 목록: 묶음마다 컴포넌트(이름순) → 그 묶음의 사용 가이드 문서 */
function componentItems(I: P.Item[]): NavItem[] {
  const comps = I.filter((i) => i.kind === 'comp');
  const docs = docsIn('components');
  return compGroups().flatMap((g) => [
    ...comps.filter((i) => (i.group || '기타') === g).sort((a, b) => a.name.localeCompare(b.name, 'en')).map((i): NavItem => [i.code, i.name, g]),
    // 컴포넌트 · 블록에 딸린 가이드는 그 페이지 안에 있으므로 목록에는 딸린 곳이 없는 문서만
    ...docs.filter((d) => docGroup(d) === g && !hostOf(d.id)).map((d): NavItem => [guideRoute(d.id), d.title, g, '가이드']),
  ]);
}

export function sections(role: Role): Section[] {
  const I = P.items();
  const S: Section[] = [
    // 홈(개요 · 업데이트)은 위쪽 메뉴에 두지 않는다: 로고를 누르면 개요, 버전을 누르면 업데이트
    ['home', '홈', [['overview', '개요'], ['updates', '업데이트']]],
    // 맨 위는 두 거버넌스만. UX 거버넌스 = 화면을 어떻게 짜는가, UI 거버넌스 = 무엇으로 그리는가 (원칙 → Foundations → Components → Blocks 위계)
    [
      'ux',
      'UX 거버넌스',
      [
        ['rules', '규칙', '원칙 · 규칙'],
        ['lint', '검증 규칙', '원칙 · 규칙'],
        ...guideItems('start', () => '원칙 · 규칙'),
        ['slots', '슬롯', '화면 구조'],
        ['stack', '조립 구조', '화면 구조'],
        ...guideItems('foundations', (g) => `화면 구조 › ${g || '구조'}`),
        ...I.filter((i) => i.kind === 'layout').map((i): NavItem => [i.code, `${i.name} 레이아웃`, '화면 구조 › 레이아웃 규칙']),
        ...guideItems('blocks', (g) => `블록 정책${g ? ` › ${g}` : ''}`),
        ['patterns', '전체', 'UX 가이드라인'],
        ...guideItems('patterns', (g) => `UX 가이드라인 › ${g || '기타'}`),
        ['glossary', '용어사전', '기준 문서'],
        ...guideItems('governance', () => '기준 문서').filter(([r]) => r !== guideRoute('glossary')),
      ],
    ],
    [
      'ui',
      'UI 거버넌스',
      [
        ['ui-rules', 'UI 규칙', '원칙 · 규칙'],
        ['design-review', '디자인 검수 기준', '원칙 · 규칙'],
        ['figma-guide', 'Figma 작성 기준', '원칙 · 규칙'],
        ['foundations', '개요', 'Foundations'],
        ...(
          [
            ['color', '컬러'],
            ['typography', '타이포그래피'],
            ['spacing', '여백'],
            ['sizing', '크기'],
            ['radius', '모서리'],
            ['border-width', '선 두께'],
            ['shadow', '그림자'],
            ['motion', '모션'],
            ['writing', '문구 (보이스 · 표기)'],
            ['tokens', '디자인 토큰'],
            ['icons', '아이콘'],
          ] as [string, string][]
        ).map(([r, l]): NavItem => [r, l, 'Foundations']),
        ['components', '전체', 'Components'],
        ...componentItems(I).map(([r, l, g, tag]): NavItem => [r, l, `Components › ${g}`, tag]),
        ...patterns.map((p): NavItem => [`pattern-${p.key}`, `${p.name} 사용 예시`, 'Components › 입력']),
        ['blocks', '전체', 'Blocks'],
        ...I.filter((i) => i.kind === 'block' && !P.isSb(i)).map((i): NavItem => [i.code, i.name, 'Blocks › 공통 블록']),
        // 업무 구분은 블록이 아직 없어도 자리를 둔다 (경로가 빈 항목 = 안내 글)
        ...P.SB_DOMAINS.flatMap((dm) => {
          const L = I.filter((i) => P.sbDomain(i) === dm).map((i): NavItem => [i.code, i.name, `Blocks › ${dm} 블록`]);
          return L.length ? L : [['', '아직 없음', `Blocks › ${dm} 블록`] as NavItem];
        }),
      ],
    ],
    ['mine', '내 요청', [['my-requests', '내 요청']]],
  ];
  if (role === 'ux') S.push(['work', 'UX 편집', [['ux-edit', '기준 편집'], ['sb-edit', 'SB library 편집'], ['my', '내 변경'], ['promo', '승격 심사']]]);
  if (role === 'ds') S.push(['work', 'DS 작업', [['requests', '디자인 요청'], ['convert', '소스 변환'], ['my', '내 변경'], ['promo', '승격 심사']]]);
  if (role === 'approver') S.push(['work', '관리자', [['deploy', '운영 서버 배포'], ['recheck', '재검수 대상 SB'], ['roles', '권한 확인'], ['promo', '승격 심사']]]);
  return S;
}

export function sectionOf(route: string, role: Role) {
  for (const [k, , items] of sections(role)) if (items.some(([r]) => r === route)) return k;
  if (route.startsWith('pattern-') || route.startsWith('new-')) return 'ui';
  if (route.startsWith('g-') && hostOf(route.slice(2))) return 'ui';
  return 'home';
}

/** 작업 메뉴 숫자: 관리자 = 배포 요청, DS = 진행 중 요청 + 내 작성 중 초안, UX = 내 작성 중 초안 */
const workCount = (role: Role) =>
  role === 'approver'
    ? P.drafts((d) => d.status === 'draft' && !!d.requested).length
    : P.drafts((d) => d.status === 'draft' && d.by === role && !d.requested).length + (role === 'ds' ? P.requests().filter((r) => r.stage !== '완료').length : 0);

export function TopNav({ route }: { route: string }) {
  const { role } = usePortal();
  const cur = sectionOf(route, role);
  const n = workCount(role);
  return (
    <>
      {sections(role).filter(([k]) => k !== 'home').map(([k, label, items]) => (
        <a key={k} href={`#${items[0][0]}`} className={`${k === cur ? 'on' : ''}${k === 'work' ? ' admin' : ''}`} aria-current={k === cur ? 'true' : undefined}>
          {label}
          {k === 'work' && n ? (
            <>
              {' '}
              <em>{n}</em>
            </>
          ) : null}
        </a>
      ))}
    </>
  );
}
interface NavGroup {
  label: string;
  items: NavItem[];
  /** 둘째 단계 묶음 (소제목 '모듈 · 노드 모듈'의 '노드 모듈') */
  groups: NavGroup[];
}

/** 소제목('Components › 입력')으로 두 단계 묶음을 만든다. 소제목 없는 항목(전체 · 개요)은 맨 위에 그대로 */
function groupItems(items: NavItem[]) {
  const top: NavItem[] = [];
  const groups: NavGroup[] = [];
  const find = (L: NavGroup[], label: string) => L.find((g) => g.label === label) || (L.push({ label, items: [], groups: [] }), L[L.length - 1]);
  for (const it of items) {
    const sub = it[2];
    if (!sub) {
      top.push(it);
      continue;
    }
    const [a, ...rest] = sub.split(' › ');
    const g = find(groups, a);
    if (rest.length) find(g.groups, rest.join(' › ')).items.push(it);
    else g.items.push(it);
  }
  return { top, groups };
}

const hasRoute = (g: NavGroup, route: string): boolean => g.items.some(([r]) => r === route) || g.groups.some((x) => hasRoute(x, route));
const countOf = (g: NavGroup): number => g.items.filter(([r]) => r).length + g.groups.reduce((n, x) => n + countOf(x), 0);

export function SideNav({ route: here }: { route: string }) {
  const { role, isEditor } = usePortal();
  // 컴포넌트 안에 딸린 가이드를 따로 열었으면 그 컴포넌트를 현재 위치로
  const host = here.startsWith('g-') ? hostOf(here.slice(2)) : null;
  const route = host ? host.code : here;
  const all = sections(role);
  const cur = sectionOf(route, role);
  const [, label, items] = all.find(([k]) => k === cur)!;
  const { top, groups } = groupItems(items);
  // 펼친 묶음 (섹션|묶음|둘째 묶음). 지금 페이지가 든 묶음은 늘 펼친다
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const keyOf = (path: string[]) => [cur, ...path].join('|');
  useEffect(() => {
    const want: string[] = [];
    for (const g of groups) {
      if (!hasRoute(g, route)) continue;
      want.push(keyOf([g.label]));
      for (const x of g.groups) if (hasRoute(x, route)) want.push(keyOf([g.label, x.label]));
    }
    if (want.some((k) => !open.has(k))) setOpen((o) => new Set([...o, ...want]));
  }, [route, cur]); // eslint-disable-line react-hooks/exhaustive-deps
  const toggle = (k: string) => setOpen((o) => {
    const n = new Set(o);
    if (n.has(k)) n.delete(k);
    else n.add(k);
    return n;
  });
  const link = ([r, l, , tag]: NavItem) => {
    if (!r) return <span key={`empty-${l}`} className="nav-empty">{l}</span>;
    const it = P.item(r);
    const draft = isEditor && it && (P.openDraft('item', r) || P.openDraft('guide', it.key) || P.openDraft('figma', it.key) || P.openDraft('code', it.key) || P.openDraft('text', it.key));
    return (
      <a key={r} href={`#${r}`} className={r === route ? 'on' : ''} aria-current={r === route ? 'page' : undefined}>
        {l}
        {tag ? <span className="nv-tag">{tag}</span> : null}
        {it && it.status !== 'pub' ? <span className="nv-st">{P.STATUS[it.status]}</span> : null}
        {draft ? <i className="nv-dot" title="초안 있음" /> : null}
      </a>
    );
  };
  const group = (g: NavGroup, path: string[], depth: number): JSX.Element => {
    const k = keyOf(path);
    const on = open.has(k);
    const id = `nav-${k.replace(/[^a-zA-Z0-9가-힣]+/g, '-')}`;
    return (
      <div key={k} className={`nav-grp d${depth}${on ? ' open' : ''}`}>
        <button type="button" className={`nav-acc${hasRoute(g, route) ? ' has' : ''}`} aria-expanded={on} aria-controls={id} onClick={() => toggle(k)}>
          <span className="nav-chev" aria-hidden="true">›</span>
          <span className="nav-acc-l">{g.label}</span>
          <span className="nav-cnt">{countOf(g)}</span>
        </button>
        {on ? (
          <div id={id} className="nav-grp-body">
            {g.items.map(link)}
            {g.groups.map((x) => group(x, [...path, x.label], depth + 1))}
          </div>
        ) : null}
      </div>
    );
  };
  return (
    <>
      {/* 좁은 화면에서는 위쪽 섹션 메뉴가 숨으므로 목록 위에 섹션을 둔다 */}
      <div className="m-sec">
        {all.filter(([k]) => k !== 'home').map(([k, l, it]) => (
          <a key={k} href={`#${it[0][0]}`} className={k === cur ? 'on' : ''}>
            {l}
          </a>
        ))}
      </div>
      <div className="nav-title">{label}</div>
      {top.map(link)}
      {groups.map((g) => group(g, [g.label], 0))}
    </>
  );
}

/** 이전 · 다음 (같은 섹션 안에서) */
export function Pager({ route }: { route: string }) {
  const { role } = usePortal();
  const items = sections(role).find(([k]) => k === sectionOf(route, role))![2].filter(([r]) => r);
  const i = items.findIndex(([r]) => r === route);
  if (i < 0) return null;
  const prev = items[i - 1];
  const next = items[i + 1];
  return (
    <nav className="pager" aria-label="이전 · 다음 문서">
      {prev ? (
        <a href={`#${prev[0]}`}>
          <span>이전 문서</span>
          <b>{prev[1]}</b>
        </a>
      ) : (
        <span />
      )}
      {next ? (
        <a className="nx" href={`#${next[0]}`}>
          <span>다음 문서</span>
          <b>{next[1]}</b>
        </a>
      ) : null}
    </nav>
  );
}

const CAN_DO: Record<Role, string> = {
  viewer: '문서를 읽습니다. 담당 역할로 바꾸면 그 자리에서 고칠 수 있습니다.',
  ux: '기준 편집(레이아웃 규칙 · 규칙 · 사용 가이드) · 업무 블록 · 컴포넌트 설명',
  ds: '토큰 · 컴포넌트 · 공통 블록 · 소스 변환 · 디자인 요청',
  approver: '운영 서버 배포 · 반려 · 롤백 · 재검수 대상 SB · 권한 확인',
};

/** 오른쪽 위 역할 버튼: 에디터 모드면 색이 바뀌고 초안 수 배지가 붙는다. 누르면 고칠 수 있는 것 · 내 초안 · 게시 버전 · 역할 바꾸기 */
export function RoleMenu() {
  const { role, setRole, isEditor } = usePortal();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);
  const mine = role === 'approver' ? P.drafts((d) => d.status === 'draft' && !!d.requested).length : P.drafts((d) => d.status === 'draft' && d.by === role).length;
  const pv = P.previewVersion();
  return (
    <div className="role-menu" ref={box}>
      <button type="button" className={`role-btn${isEditor ? ' on' : ''}`} aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen((o) => !o)}>
        {isEditor ? '✎ ' : ''}
        {P.ROLES[role]}
        {isEditor && mine ? <em className="role-badge" aria-label={`초안 ${mine}건`}>{mine}</em> : null}
        <span aria-hidden="true"> ▾</span>
      </button>
      {open ? (
        <div className="role-pop" role="dialog" aria-label="역할 · 에디터 모드">
          <p className="role-pop-t">{isEditor ? '에디터 모드' : '보기 모드'}</p>
          <p className="role-pop-d">{isEditor ? <>고칠 수 있는 것<br /><b>{CAN_DO[role]}</b></> : CAN_DO.viewer}</p>
          {isEditor ? (
            <a className="role-pop-row" href={role === 'approver' ? '#deploy' : '#my'} onClick={() => setOpen(false)}>
              <span>{role === 'approver' ? '배포 요청' : '내 변경'}</span>
              <b>{mine}건 →</b>
            </a>
          ) : null}
          <div className="role-pop-row">
            <span>운영 버전</span>
            <b className="mono">
              {P.version()}
              {pv ? ` · 다음 ${pv}` : ''}
            </b>
          </div>
          <label className="role-pop-sel">
            <span>역할 바꾸기 (POC: SB Studio 로그인 대신)</span>
            <select id="ptRole" value={role} onChange={(e) => (setRole(e.target.value as Role), setOpen(false))}>
              {(Object.entries(P.ROLES) as [Role, string][]).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
    </div>
  );
}

/** 설명 편집 모드의 아래 띠: 고친 곳 수 · 한 번에 초안 저장 · 취소 */
export function TextEditBar() {
  const { role, textEdit, setTextEdit, pending, setPending, toast } = usePortal();
  if (!textEdit) return null;
  const L = Object.values(pending).filter((x) => x.value.trim() !== x.before.trim());
  const save = () => {
    const ids = new Set<string>();
    const fails: string[] = [];
    for (const x of L) {
      try {
        const d = x.onSave ? x.onSave(x.value.trim()) : P.draftText(role, x.scopeKey, x.scopeName, x.path, x.label, x.before, x.value.trim());
        if (d && typeof d === 'object' && 'id' in d) ids.add(String((d as { id: string }).id));
      } catch (e) {
        fails.push(`${x.label}: ${(e as Error).message}`);
      }
    }
    setPending({});
    toast(fails.length ? fails.join(' · ') : `${L.length}곳을 초안 ${[...ids].join(', ')}에 담았습니다 · 내 변경에서 미리보기 확인 후 배포 요청`);
  };
  return (
    <div className="te-bar" role="region" aria-label="편집">
      <b>편집 중</b>
      <span>{L.length ? `고친 글 ${L.length}곳` : '입력칸의 글을 고치세요'}</span>
      <button type="button" className="btn2 primary sm" disabled={!L.length} onClick={save}>
        초안 저장
      </button>
      <button type="button" className="btn2 sm" disabled={!L.length} onClick={() => setPending({})}>
        고친 것 되돌리기
      </button>
      <button
        type="button"
        className="btn2 sm"
        onClick={() => {
          if (L.length && !confirm(`저장하지 않은 ${L.length}곳이 있습니다. 버리고 끌까요?`)) return;
          setPending({});
          setTextEdit(false);
        }}
      >
        끄기
      </button>
    </div>
  );
}

export const iconCount = () => icons.icons.length;
