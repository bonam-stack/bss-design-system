// 위쪽 섹션 메뉴 · 왼쪽 목록 · 이전/다음 · 역할 선택 · 에디터 모드 띠.
// 누구에게나 같은 문서 사이트가 보이고, 오른쪽 위에서 담당 역할을 고르면 같은 페이지에 에디터 모드가 켜진다.
// 관리 메뉴(초안 · 게시, 승격 요청, 변경 감지)는 담당 역할에서만 보인다.
import * as P from './portal/store';
import type { Role } from './portal/store';
import { usePortal } from './portal/ctx';
import { patterns, icons } from './data';

export type Section = [key: string, label: string, items: [route: string, label: string][]];

export function sections(isEditor: boolean): Section[] {
  const I = P.items();
  const S: Section[] = [
    ['start', '시작하기', [['overview', '개요'], ['stack', '조립 구조'], ['updates', '업데이트']]],
    ['foundations', 'Foundations', [['icons', '아이콘'], ['tokens', '디자인 토큰']]],
    ['components', 'Components', [['components', '전체'], ...I.filter((i) => i.kind === 'comp').sort((a, b) => a.name.localeCompare(b.name, 'en')).map((i): [string, string] => [i.code, i.name])]],
    ['blocks', 'Blocks', [['blocks', '전체'], ...I.filter((i) => i.kind === 'shell' || i.kind === 'block').map((i): [string, string] => [i.code, i.name])]],
    ['patterns', 'Patterns', [['patterns', '전체'], ...patterns.map((p): [string, string] => [`pattern-${p.key}`, `${p.name} 패턴`]), ...I.filter((i) => i.kind === 'layout').map((i): [string, string] => [i.code, `${i.name} 레이아웃`])]],
    ['governance', 'UX 거버넌스', [['rules', '규칙'], ['slots', '빈칸'], ['lint', '검증 규칙']]],
  ];
  if (isEditor) S.push(['admin', '관리', [['pub', '초안 · 게시'], ['promo', '승격 요청'], ['chg', '변경 감지']]]);
  return S;
}

export function sectionOf(route: string, isEditor: boolean) {
  for (const [k, , items] of sections(isEditor)) if (items.some(([r]) => r === route)) return k;
  if (route.startsWith('pattern-')) return 'patterns';
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

export function SideNav({ route }: { route: string }) {
  const { isEditor } = usePortal();
  const all = sections(isEditor);
  const cur = sectionOf(route, isEditor);
  const [, label, items] = all.find(([k]) => k === cur)!;
  const out: JSX.Element[] = [];
  let lastKind: string | null = null;
  for (const [r, l] of items) {
    const it = P.item(r);
    const k = it?.kind;
    if (cur === 'blocks' && k && k !== lastKind) {
      out.push(<div key={`sub-${k}`} className="nav-sub">{k === 'shell' ? '앱쉘' : '블록'}</div>);
      lastKind = k;
    }
    if (cur === 'patterns' && k === 'layout' && lastKind !== 'layout') {
      out.push(<div key="sub-layout" className="nav-sub">레이아웃 규칙</div>);
      lastKind = 'layout';
    }
    const draft = isEditor && it && (P.openDraft('item', r) || P.openDraft('guide', it.key) || P.openDraft('figma', it.key) || P.openDraft('code', it.key));
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

/** 에디터 모드 띠: 역할 · 고칠 수 있는 것 · 초안 수 */
export function EditorBar() {
  const { role, isEditor } = usePortal();
  if (!isEditor) return null;
  const what = { ux: '레이아웃 규칙 · 규칙 · 사용 가이드', ds: '앱쉘 · 블록 · 컴포넌트 코드 · Figma 읽기', approver: '초안 게시 · 반려 · 롤백 · 승격 최종 승인', viewer: '' }[role];
  const mine = P.drafts((d) => d.status === 'draft' && (role === 'approver' || d.by === role)).length;
  return (
    <div className="ed-bar">
      <b>에디터 모드</b>
      <span>
        {P.ROLES[role]} · {what}
      </span>
      <a href="#pub">
        {role === 'approver' ? '게시 대기' : '내 초안'} {mine}건
      </a>
      <span className="ed-ver">게시 {P.version()}</span>
    </div>
  );
}

export const iconCount = () => icons.icons.length;
