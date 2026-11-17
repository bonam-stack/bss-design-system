// 위쪽 섹션 메뉴 · 왼쪽 목록 · 이전/다음 · 역할 선택 · 에디터 모드 띠.
// 누구에게나 같은 문서와 "내 요청"이 보이고, 역할(SB Studio 계정에서 받음)에 따라 작업 메뉴와 문서 안 편집 칸이 켜진다.
// 작업 메뉴: UX 담당자 = UX 편집, DS 담당자 = DS 작업, 관리자 = 관리자.
import * as P from './portal/store';
import type { Role } from './portal/store';
import { usePortal } from './portal/ctx';
import { patterns, icons } from './data';
import { docsIn, guideRoute } from './guide';
import type { Place } from './guide';

/** [경로, 이름, 왼쪽 목록 소제목] */
export type NavItem = [route: string, label: string, sub?: string];
export type Section = [key: string, label: string, items: NavItem[]];

/** UX 패턴 가이드 문서를 그 섹션 목록에 (소제목 = 가이드의 묶음) */
const guideItems = (place: Place, sub: (group: string) => string): NavItem[] => docsIn(place).map((d) => [guideRoute(d.id), d.title, sub(d.group.split(' › ')[0])]);

export function sections(role: Role): Section[] {
  const I = P.items();
  const S: Section[] = [
    ['governance', 'UX 거버넌스', [['rules', '규칙'], ['slots', '빈칸'], ['lint', '검증 규칙'], ['glossary', '용어사전'], ...guideItems('governance', () => '작성 기준').filter(([r]) => r !== guideRoute('glossary'))]],
    ['start', '시작하기', [['overview', '개요'], ['stack', '조립 구조'], ['updates', '업데이트'], ...guideItems('start', () => 'UX 원칙')]],
    [
      'foundations',
      'Foundations',
      [
        ['foundations', '개요'],
        ['color', '색상', '디자인 에셋'],
        ['typography', '타이포그래피', '디자인 에셋'],
        ['dimension', '간격 · 모서리', '디자인 에셋'],
        ['icons', '아이콘', '디자인 에셋'],
        ['elevation', '그림자', '디자인 에셋'],
        ['motion', '모션', '디자인 에셋'],
        ['writing', '문구 (보이스 · 표기)', '디자인 에셋'],
        ['tokens', '디자인 토큰', '디자인 에셋'],
        ...guideItems('foundations', (g) => g || '파운데이션'),
      ],
    ],
    ['components', 'Components', [['components', '전체'], ...I.filter((i) => i.kind === 'comp').sort((a, b) => a.name.localeCompare(b.name, 'en')).map((i): NavItem => [i.code, i.name, '컴포넌트']), ...guideItems('components', (g) => `컴포넌트 가이드${g ? ` · ${g}` : ''}`)]],
    [
      'blocks',
      'Blocks',
      [
        ['blocks', '전체'],
        ...I.filter((i) => i.kind === 'block' && !P.isSb(i)).map((i): NavItem => [i.code, i.name, '공통 블록']),
        ...I.filter((i) => P.isSb(i)).map((i): NavItem => [i.code, i.name, 'SB 블록']),
        ...guideItems('blocks', (g) => `모듈${g ? ` · ${g}` : ''}`),
      ],
    ],
    ['patterns', 'Patterns', [['patterns', '전체'], ...patterns.map((p): NavItem => [`pattern-${p.key}`, `${p.name} 패턴`, 'Figma 패턴']), ...guideItems('patterns', (g) => g || '패턴'), ...I.filter((i) => i.kind === 'layout').map((i): NavItem => [i.code, `${i.name} 레이아웃`, '레이아웃 규칙'])]],
    ['mine', '내 요청', [['my-requests', '내 요청']]],
  ];
  if (role === 'ux') S.push(['work', 'UX 편집', [['ux-edit', '기준 편집'], ['sb-edit', 'SB library 편집'], ['my', '내 변경'], ['promo', '승격 심사']]]);
  if (role === 'ds') S.push(['work', 'DS 작업', [['requests', '디자인 요청'], ['convert', '소스 변환'], ['my', '내 변경'], ['promo', '승격 심사']]]);
  if (role === 'approver') S.push(['work', '관리자', [['deploy', '운영 서버 배포'], ['recheck', '재검수 대상 SB'], ['roles', '권한 확인'], ['promo', '승격 심사']]]);
  return S;
}

export function sectionOf(route: string, role: Role) {
  for (const [k, , items] of sections(role)) if (items.some(([r]) => r === route)) return k;
  if (route.startsWith('pattern-')) return 'patterns';
  return 'start';
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
      {sections(role).map(([k, label, items]) => (
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

export function SideNav({ route }: { route: string }) {
  const { role, isEditor } = usePortal();
  const all = sections(role);
  const cur = sectionOf(route, role);
  const [, label, items] = all.find(([k]) => k === cur)!;
  const out: JSX.Element[] = [];
  let lastKind: string | null = null;
  for (const [r, l, sub] of items) {
    const it = P.item(r);
    if (sub && sub !== lastKind) {
      out.push(<div key={`sub-${sub}`} className="nav-sub">{sub}</div>);
      lastKind = sub;
    }
    const draft = isEditor && it && (P.openDraft('item', r) || P.openDraft('guide', it.key) || P.openDraft('figma', it.key) || P.openDraft('code', it.key) || P.openDraft('text', it.key) || P.openDraft('code', r));
    out.push(
      <a key={r} href={`#${r}`} className={r === route ? 'on' : ''} aria-current={r === route ? 'page' : undefined}>
        {l}
        {it && it.status !== 'pub' ? <span className="nv-st">{P.STATUS[it.status]}</span> : null}
        {draft ? <i className="nv-dot" title="초안 있음" /> : null}
      </a>,
    );
  }
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
      {out}
    </>
  );
}

/** 이전 · 다음 (같은 섹션 안에서) */
export function Pager({ route }: { route: string }) {
  const { role } = usePortal();
  const items = sections(role).find(([k]) => k === sectionOf(route, role))![2];
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

export function RoleMenu() {
  const { role, setRole, isEditor } = usePortal();
  return (
    <label className={`role-pick${isEditor ? ' on' : ''}`}>
      <span className="sr">역할</span>
      <select id="ptRole" aria-label="역할 (POC: SB Studio 로그인 대신)" value={role} onChange={(e) => setRole(e.target.value as Role)}>
        {(Object.entries(P.ROLES) as [Role, string][]).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
    </label>
  );
}

/** 에디터 모드 띠: 역할 · 하는 일 · 내 변경(관리자는 배포 요청) · 운영 버전 · 다음 미리보기 버전 */
export function EditorBar() {
  const { role, isEditor } = usePortal();
  if (!isEditor) return null;
  const what = { ux: '기준 편집(UX 패턴 · 레이아웃 규칙 · 사용 가이드) · SB library 소스 편집', ds: '토큰 · 컴포넌트 · 공통 블록 · 소스 변환 · 디자인 요청', approver: '운영 서버 배포 · 롤백 · 재검수 대상 SB · 권한 확인', viewer: '' }[role];
  const n = role === 'approver' ? P.drafts((d) => d.status === 'draft' && !!d.requested).length : P.drafts((d) => d.status === 'draft' && d.by === role).length;
  const pv = P.previewVersion();
  return (
    <div className="ed-bar">
      <b>{P.ROLES[role]}</b>
      <span>{what}</span>
      <a href={role === 'approver' ? '#deploy' : '#my'}>
        {role === 'approver' ? '배포 요청' : '내 변경'} {n}건
      </a>
      <span className="ed-ver">
        운영 {P.version()}
        {pv ? ` · 다음 ${pv}` : ''}
      </span>
    </div>
  );
}

export const iconCount = () => icons.icons.length;
