// BSS 디자인 포털 문서 사이트. 주소는 해시 한 토큰(#overview, #icons, #c-checkbox, #pattern-input …)이라 링크를 나눌 수 있다.
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import * as P from './portal/store';
import type { Role } from './portal/store';
import { Ctx, emptyUi } from './portal/ctx';
import type { PortalCtx, TocItem, UiState } from './portal/ctx';
import { catalog, components, componentByKey, patterns } from './data';
import { EditorBar, Pager, RoleMenu, SideNav, TopNav } from './nav';
import { LastUpdated, TocList, setToast } from './ui';
import { portalPage } from './pages/portal';
import { ComponentPage } from './pages/ComponentPage';
import { PortalOnlyPage } from './pages/compPortal';
import { IconsPage } from './pages/IconsPage';
import { PatternPage } from './pages/PatternPage';
import { ComparePage } from './pages/ComparePage';
import { GuidePage } from './pages/GuidePage';
import { GlossaryPage } from './pages/GlossaryPage';
import { guideDoc } from './guide';

// BSS 디자인 포털: 저장소 JSON + SB Studio 카탈로그가 기준, 게시된 변경은 브라우저 저장소에서
P.init({
  catalog,
  comps: Object.fromEntries(components.map((c) => [c.data.key, c.data])),
  guides: Object.fromEntries(components.filter((c) => c.guide?.policy).map((c) => [c.data.key, c.guide!.policy!])),
});

const ROLE_KEY = 'bss-design-portal.role';
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
const ALIAS: Record<string, string> = { cmp: 'components', blk: 'blocks', gov: 'rules', 'gov-layouts': 'patterns', 'gov-slots': 'slots', 'gov-lint': 'lint', 'gov-patterns': 'patterns' };
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; n: number } | null>(null);
  const [toc, setToc] = useState<{ title: string; items: TocItem[] }>({ title: '', items: [] });
  const content = useRef<HTMLElement>(null);
  const isEditor = role !== 'viewer';

  const toast = useCallback((text: string) => setToastMsg((t) => ({ text, n: (t?.n || 0) + 1 })), []);
  useEffect(() => setToast(toast), [toast]);
  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 1600);
    return () => clearTimeout(t);
  }, [toastMsg]);

  const setRole = (r: Role) => {
    setRoleState(r);
    lsSet(ROLE_KEY, r);
    setUi((u) => ({ ...u, edit: null, editRule: null }));
    // 관리 페이지에 있다가 보기로 바꾸면 개요로
    if (r === 'viewer' && ['pub', 'promo', 'chg'].includes(readRoute())) location.hash = '#overview';
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
  if (ALIAS[route]) redirect = ALIAS[route];
  // 예전 UX 가이드 주소(#ux, #ux-<id>)는 포털 섹션에 놓인 문서로
  else if (route === 'ux') redirect = 'patterns';
  else if (route.startsWith('ux-')) redirect = route.slice(3) === 'glossary' ? 'glossary' : guideDoc(route.slice(3)) ? `g-${route.slice(3)}` : 'overview';
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
    page = <ComponentPage key={sc.data.key} sc={sc} />;
    withUpdated = true;
  } else if (key && P.comp(key)) {
    page = <PortalOnlyPage c={P.comp(key)!} />;
    withUpdated = true;
  } else {
    page = portalPage(route, isEditor);
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

  const ctx: PortalCtx = { role, setRole, ui, setUi, toast, toc };
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
        <EditorBar />
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
      <div className={`toast${toastMsg ? ' show' : ''}`} role="status">
        {toastMsg?.text}
      </div>
    </Ctx.Provider>
  );
}
