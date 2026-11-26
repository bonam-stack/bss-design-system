// BSS 디자인 포털 문서 사이트. 주소는 해시 한 토큰(#overview, #icons, #c-checkbox, #pattern-input …)이라 링크를 나눌 수 있다.
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import * as P from './portal/store';
import type { PortalComp, Role } from './portal/store';
import { Ctx, emptyUi } from './portal/ctx';
import type { PendingText, PortalCtx, TocItem, UiState } from './portal/ctx';
import { catalog, components, componentByKey, patterns, baseTokens } from './data';
import { Pager, RoleMenu, SideNav, TextEditBar, TopNav } from './nav';
import { LastUpdated, TocList, setToast } from './ui';
import { portalPage } from './pages/portal';
import { ComponentPage } from './pages/ComponentPage';
import { SpecComponentPage } from './pages/SpecComponentPage';
import { isRenderable } from '../ds/figma/tree';
import { PortalOnlyPage } from './pages/PortalCompPage';
import { IconsPage } from './pages/IconsPage';
import { PatternPage } from './pages/PatternPage';
import { ComparePage } from './pages/ComparePage';
import { GuidePage } from './pages/GuidePage';
import { GlossaryPage } from './pages/GlossaryPage';
import { guideDoc , shownDoc } from './guide';

// BSS 디자인 포털: 저장소 JSON + SB Studio 카탈로그가 기준, 게시된 변경은 브라우저 저장소에서
P.init({
  catalog,
  comps: Object.fromEntries(components.map((c) => [c.data.key, c.data])),
  guides: Object.fromEntries(components.filter((c) => c.guide?.policy).map((c) => [c.data.key, c.guide!.policy!])),
  tokens: baseTokens,
});

const ROLE_KEY = 'bss-ds-v2.role';
function lsGet(k: string) {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}
function lsSet(k: string, v: string) {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* 없어도 동작 */
  }
}

// 예전 주소(#cmp, #gov 탭 등)도 열리게
const ALIAS: Record<string, string> = { 'my-requests': 'workboard', 'request-status': 'workboard', pub: 'deploy', chg: 'recheck', cmp: 'components', blk: 'blocks', gov: 'rules', 'gov-layouts': 'patterns', 'gov-slots': 'slots', 'gov-lint': 'lint', 'gov-patterns': 'patterns' };
const readRoute = () => location.hash.replace(/^#/, '') || 'overview';
const codeOf = (key: string) => P.itemByKey(key)?.code || `c-${key}`;

function useRoute() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const on = () => setRoute(readRoute());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export function App() {
  const route = useRoute();
  useSyncExternalStore(P.subscribe, P.revision);
  const [role, setRoleState] = useState<Role>(() => {
    const r = lsGet(ROLE_KEY) as Role | null;
    return r && r in P.ROLES ? r : 'viewer';
  });
  const [ui, setUi] = useState<UiState>(emptyUi);
  const [textEdit, setTextEdit] = useState(false);
  const [pending, setPending] = useState<Record<string, PendingText>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; n: number } | null>(null);
  const [toc, setToc] = useState<{ title: string; items: TocItem[] }>({ title: '', items: [] });
  const content = useRef<HTMLElement>(null);

  const toast = useCallback((text: string) => setToastMsg((t) => ({ text, n: (t?.n || 0) + 1 })), []);
  useEffect(() => setToast(toast), [toast]);
  // 새 기준 데이터로 배포되어 이전 초안 · 게시 기록을 지웠으면 한 번 알린다
  useEffect(() => {
    if (P.wasWiped()) toast('새 기준 데이터로 바뀌어 이전 초안 · 게시 기록을 지웠습니다');
  }, [toast]);
  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 1600);
    return () => clearTimeout(t);
  }, [toastMsg]);

  const setRole = (r: Role) => {
    setRoleState(r);
    lsSet(ROLE_KEY, r);
    setUi((u) => ({ ...u, edit: null, editRule: null }));
    // 그 역할에 없는 작업 페이지에 있으면 개요로
    const WORK: Record<string, Role[]> = { 'ux-edit': ['ux'], 'sb-edit': ['ux'], my: ['ux', 'ds'], requests: ['ds'], convert: ['ds'], deploy: ['approver'], recheck: ['approver'], roles: ['approver'], promo: ['ux', 'ds', 'approver'] };
    const cur = readRoute();
    if (WORK[cur] && !WORK[cur].includes(r)) location.hash = '#overview';
  };

  // 페이지를 옮기면 편집 칸을 닫고 맨 위로 (편집 뒤 다시 그릴 때는 자리 유지)
  useEffect(() => {
    setUi((u) => ({ ...u, edit: null, editRule: null }));
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [route]);

  // ---------- 라우트 → 페이지 ----------
  let redirect: string | null = null;
  let page: React.ReactNode = null;
  let withUpdated = false;
  const it = P.item(route);
  const key = it?.key;
  const sc = key ? componentByKey(key) : null;
  const pattern = patterns.find((p) => `pattern-${p.key}` === route);
  // v2에는 거버넌스가 없다: 규칙 · 슬롯 · 검증 규칙 · 연동 규격 · 용어사전 · 운영 절차 · UI 규칙 · 작성 기준 문서는 홈으로 (데이터는 그대로 둔다)
  // v2에 없는 화면: UX 규칙 쪽 거버넌스 · UX 가이드라인(개요 · 원칙 · 화면 구조 · 레이아웃 · 조립 구조 · 화면 가이드). 데이터는 그대로 둔다
  const HIDDEN = ['process', 'rules', 'lint', 'sb-spec', 'slots', 'glossary', 'promo-rules', 'ux-guide', 'stack', 'patterns'];
  if (HIDDEN.includes(route) || P.item(route)?.kind === 'layout' || (route.startsWith('g-') && guideDoc(route.slice(2)) && !shownDoc(route.slice(2)))) redirect = 'overview';
  else if (ALIAS[route]) redirect = ALIAS[route];
  // 예전 UX 가이드 주소(#ux, #ux-<id>)는 포털 섹션에 놓인 문서로
  else if (route === 'ux') redirect = 'patterns';
  else if (route.startsWith('ux-') && (route.slice(3) === 'glossary' || guideDoc(route.slice(3)))) redirect = route.slice(3) === 'glossary' ? 'glossary' : `g-${route.slice(3)}`;
  else if (route === 'g-glossary') redirect = 'glossary';
  else if (componentByKey(route)) redirect = codeOf(route);
  else if (route === 'icons') page = <IconsPage />;
  else if (route === 'glossary') page = <GlossaryPage />;
  else if (route.startsWith('g-') && guideDoc(route.slice(2))) {
    page = <GuidePage key={route} id={route.slice(2)} />;
    withUpdated = false;
  }
  else if (route.startsWith('compare-') && componentByKey(route.slice(8))) page = <ComparePage sc={componentByKey(route.slice(8))!} />;
  else if (pattern) {
    page = <PatternPage key={pattern.key} p={pattern} />;
    withUpdated = true;
  } else if (sc) {
    // Figma 레이어 데이터가 없는 컴포넌트(DS 명세로 만든 것)는 명세 페이지로
    page = isRenderable(sc.data) ? <ComponentPage key={sc.data.key} sc={sc} /> : <SpecComponentPage key={sc.data.key} sc={sc} />;
    withUpdated = true;
  } else if (key && P.comp(key)) {
    page = <PortalOnlyPage key={key} c={P.comp(key) as PortalComp} />;
    withUpdated = true;
  } else if (route.startsWith('new-') && role !== 'viewer' && P.draftNewComp(route.slice(4))) {
    // 게시 전 새 컴포넌트: 담당이 코드를 먼저 만든다
    page = <PortalOnlyPage key={route} c={P.draftNewComp(route.slice(4))!} draft />;
  } else {
    page = portalPage(route, role);
    withUpdated = !!it;
    if (page === null) redirect = 'overview';
  }
  useEffect(() => {
    if (redirect) location.replace(`#${redirect}`);
  }, [redirect]);

  // 목차: 본문 h2 · h3 (해시는 페이지 경로로 쓰므로 목차는 버튼으로 스크롤)
  useLayoutEffect(() => {
    const el = content.current;
    if (!el) return;
    const build = () => {
      const hs = [...el.querySelectorAll('h2, h3')].filter((h) => !h.closest('.ed-panel, dialog, details.dev, .dbox') && !h.classList.contains('sr') && h.textContent!.trim()) as HTMLElement[];
      hs.forEach((h, i) => {
        if (!h.id) h.id = `s-${i}`;
      });
      const label = (h: Element) =>
        [...h.childNodes]
          .filter((n) => n.nodeType === 3 || (n.nodeType === 1 && !(n as Element).matches('button, .count, .rule-id')))
          .map((n) => n.textContent)
          .join('')
          .trim();
      const items = hs.length > 1 ? hs.map((h) => ({ id: h.id, label: label(h), sub: h.tagName === 'H3' })) : [];
      const title = el.querySelector('h1')?.textContent?.trim() || '';
      setToc((cur) => (JSON.stringify(cur) === JSON.stringify({ title, items }) ? cur : { title, items }));
    };
    build();
    const mo = new MutationObserver(build);
    mo.observe(el, { childList: true, subtree: true, characterData: true });
    return () => mo.disconnect();
  }, [route]);

  const ctx: PortalCtx = { role, setRole, ui, setUi, toast, toc, textEdit: textEdit && (P.canEdit(role, 'text') || P.canEdit(role, 'guide')), setTextEdit: (on: boolean) => (setTextEdit(on), on || setUi((u) => ({ ...u, edit: null, editRule: null }))), pending, setPending };
  return (
    <Ctx.Provider value={ctx}>
      <header className="topbar">
        <div className="topbar-inner">
          <button className="menu-btn" aria-label="메뉴 열기" aria-expanded={menuOpen} aria-controls="sidebar" onClick={() => setMenuOpen((o) => !o)}>
            ☰
          </button>
          <a href="#overview" className="brand">
            <span className="brand-mark" aria-hidden="true" />
            BSS Design
          </a>
          <nav className="top-nav" aria-label="섹션">
            <TopNav route={route} />
          </nav>
          <div className="top-r">
            <RoleMenu />
          </div>
        </div>
      </header>
      <div className="layout">
        <nav className={`sidebar${menuOpen ? ' open' : ''}`} id="sidebar" aria-label="문서 탐색">
          <SideNav route={route} />
        </nav>
        <main className="content" id="content" tabIndex={-1} ref={content}>
          {redirect ? null : (
            <>
              {page}
              {withUpdated ? <LastUpdated /> : null}
              <Pager route={route} />
            </>
          )}
        </main>
        <aside className="toc" aria-label="목차">
          {toc.items.length ? (
            <>
              <p className="toc-t">목차</p>
              <p className="toc-n">{toc.title}</p>
              <TocList smooth />
            </>
          ) : null}
        </aside>
      </div>
      <TextEditBar />
      <div className={`toast${toastMsg ? ' show' : ''}`} role="status">
        {toastMsg?.text}
      </div>
    </Ctx.Provider>
  );
}
