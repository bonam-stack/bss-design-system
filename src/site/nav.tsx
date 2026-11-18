// 위쪽 섹션 메뉴 · 왼쪽 목록 · 이전/다음 · 역할 선택 · 에디터 모드 띠.
// 누구에게나 같은 문서 사이트가 보이고, 오른쪽 위에서 담당 역할을 고르면 같은 페이지에 에디터 모드가 켜진다.
// 관리 메뉴(초안 · 게시, 승격 요청, 변경 감지)는 담당 역할에서만 보인다.
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
    ...docs.filter((d) => docGroup(d) === g).map((d): NavItem => [guideRoute(d.id), d.title, g, '가이드']),
  ]);
}

export function sections(isEditor: boolean): Section[] {
  const I = P.items();
  const S: Section[] = [
    ['start', '시작하기', [['overview', '개요'], ['stack', '조립 구조'], ['updates', '업데이트'], ...guideItems('start', () => 'UX 원칙')]],
    ['foundations', 'Foundations', [['color', '컬러', '디자인 에셋'], ['typography', '타이포그래피', '디자인 에셋'], ['spacing', '여백', '디자인 에셋'], ['sizing', '크기', '디자인 에셋'], ['radius', '모서리', '디자인 에셋'], ['border-width', '선 두께', '디자인 에셋'], ['shadow', '그림자', '디자인 에셋'], ['tokens', '디자인 토큰', '디자인 에셋'], ['icons', '아이콘', '디자인 에셋'], ...guideItems('foundations', (g) => g || '파운데이션')]],
    ['components', 'Components', [['components', '전체'], ...componentItems(I)]],
    ['blocks', 'Blocks', [['blocks', '전체'], ...I.filter((i) => i.kind === 'block').map((i): NavItem => [i.code, i.name, '블록']), ...guideItems('blocks', (g) => `모듈${g ? ` · ${g}` : ''}`)]],
    ['patterns', 'Patterns', [['patterns', '전체'], ...patterns.map((p): NavItem => [`pattern-${p.key}`, `${p.name} 패턴`, 'Figma 패턴']), ...guideItems('patterns', (g) => g || '패턴'), ...I.filter((i) => i.kind === 'layout').map((i): NavItem => [i.code, `${i.name} 레이아웃`, '레이아웃 규칙'])]],
    ['governance', 'UX 거버넌스', [['rules', '규칙'], ['slots', '슬롯'], ['lint', '검증 규칙'], ['glossary', '용어사전'], ...guideItems('governance', () => '작성 기준').filter(([r]) => r !== guideRoute('glossary'))]],
  ];
  if (isEditor) S.push(['admin', '관리', [['pub', '초안 · 게시'], ['promo', '승격 요청'], ['chg', '변경 감지']]]);
  return S;
}

export function sectionOf(route: string, isEditor: boolean) {
  for (const [k, , items] of sections(isEditor)) if (items.some(([r]) => r === route)) return k;
  if (route.startsWith('pattern-')) return 'patterns';
  if (route.startsWith('new-')) return 'components';
  return 'start';
}

const adminCount = () => P.drafts((d) => d.status === 'draft').length + P.promotions().filter((p) => p.status === '대기').length;

export function TopNav({ route }: { route: string }) {
  const { isEditor } = usePortal();
  const cur = sectionOf(route, isEditor);
  const n = adminCount();
  return (
    <>
      {sections(isEditor).map(([k, label, items]) => (
        <a key={k} href={`#${items[0][0]}`} className={`${k === cur ? 'on' : ''}${k === 'admin' ? ' admin' : ''}`} aria-current={k === cur ? 'true' : undefined}>
          {label}
          {k === 'admin' && n ? (
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

/** 소제목('컴포넌트 가이드 · 입력')으로 두 단계 묶음을 만든다. 소제목 없는 항목(전체 · 개요)은 맨 위에 그대로 */
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
    const [a, ...rest] = sub.split(' · ');
    const g = find(groups, a);
    if (rest.length) find(g.groups, rest.join(' · ')).items.push(it);
    else g.items.push(it);
  }
  return { top, groups };
}

const hasRoute = (g: NavGroup, route: string): boolean => g.items.some(([r]) => r === route) || g.groups.some((x) => hasRoute(x, route));
const countOf = (g: NavGroup): number => g.items.length + g.groups.reduce((n, x) => n + countOf(x), 0);

export function SideNav({ route }: { route: string }) {
  const { isEditor } = usePortal();
  const all = sections(isEditor);
  const cur = sectionOf(route, isEditor);
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
        {all.map(([k, l, it]) => (
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
  const { isEditor } = usePortal();
  const items = sections(isEditor).find(([k]) => k === sectionOf(route, isEditor))![2];
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
  ux: '레이아웃 규칙 · 규칙 · 컴포넌트 설명 · 사용 가이드',
  ds: '블록 · 컴포넌트 설명 · 사용 가이드 · 컴포넌트 코드 · Figma 읽기',
  approver: '초안 게시 · 반려 · 롤백 · 승격 최종 승인',
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
  const mine = P.drafts((d) => d.status === 'draft' && (role === 'approver' || d.by === role)).length;
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
            <a className="role-pop-row" href="#pub" onClick={() => setOpen(false)}>
              <span>{role === 'approver' ? '게시 대기' : '내 초안'}</span>
              <b>{mine}건 →</b>
            </a>
          ) : null}
          <div className="role-pop-row">
            <span>게시 버전</span>
            <b className="mono">{P.version()}</b>
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
    toast(fails.length ? fails.join(' · ') : `${L.length}곳을 초안 ${[...ids].join(', ')}에 담았습니다 · 포털 승인 담당이 게시하면 반영됩니다`);
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
