// 문서 사이트 공통 조각: 복사 버튼, 상태 표시, 표, 페이지 머리, 초안 상자, 규칙 목록.
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import * as P from './portal/store';
import type { Draft, Rule } from './portal/store';
import { usePortal } from './portal/ctx';
import { docsFor, guideDoc, guideRef, guideRoute } from './guide';

export const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '');
export const figmaUrl = (fileKey: string, nodeId: string) => `https://www.figma.com/design/${fileKey}/?node-id=${nodeId.replace(':', '-')}`;

/** 줄바꿈을 살린 글 */
export function Lines({ text }: { text: string }) {
  const parts = String(text ?? '').split('\n');
  return <>{parts.map((p, i) => (i ? [<br key={i} />, p] : p))}</>;
}

// ---------- 복사 · 알림 ----------

let toastFn: (msg: string) => void = () => {};
export const setToast = (fn: (msg: string) => void) => {
  toastFn = fn;
};
export const toast = (msg: string) => toastFn(msg);

/** 클릭 안에서 불러야 한다. 클립보드가 막히면 글을 선택해 둔다. */
export function copy(text: string, el?: Element | null) {
  const fail = () => {
    if (el) {
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection()!;
      sel.removeAllRanges();
      sel.addRange(range);
    }
    toast('텍스트를 선택했어요. Ctrl/Cmd+C로 복사하세요');
  };
  try {
    navigator.clipboard.writeText(text).then(() => toast('복사했어요'), fail);
  } catch {
    fail();
  }
}

export function CopyBtn({ value, label }: { value: string; label?: string }) {
  return (
    <button className="copy" title="클릭해서 복사" onClick={(e) => copy(value, e.currentTarget)}>
      {label ?? value}
    </button>
  );
}

// ---------- 카탈로그 코드 → 이름 ----------

/** 글 속에 섞인 카탈로그 코드 · 빈칸 경로를 이름으로 바꿔 보여 준다 */
export function human(text?: string) {
  return String(text ?? '').replace(/\b(?:tb|tc|c|b|s|l)-[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9.-]*)?/g, (code) => {
    const it = P.item(code);
    if (it) return it.name;
    const sl = P.slot(code);
    if (sl) return sl.name;
    // 빈칸 경로의 앞부분만 아는 경우 (b-content.column.body → 컨텐트 · column.body)
    const [head, ...rest] = code.split('.');
    const h = P.item(head);
    return h ? `${h.name} ${rest.join('.')}` : code;
  });
}

export function CodeLink({ code }: { code: string }) {
  const it = P.item(code);
  if (it) return <a href={`#${code}`}>{it.name}</a>;
  const sl = P.slot(code);
  return <>{sl ? sl.name : code}</>;
}

/** 근거 문서 표기(work-composition, form-big.html)가 UX 가이드 문서면 그 페이지로 잇는다 */
export function UxRef({ r, label }: { r?: string; label?: string }) {
  const d = guideRef(r);
  if (!d) return <>{label ?? r ?? ''}</>;
  return (
    <a href={`#${guideRoute(d.id)}`} title={`UX 패턴 가이드 · ${d.title}`}>
      {label ?? d.title}
    </a>
  );
}

export const joinNodes = (L: ReactNode[], sep: ReactNode) => L.flatMap((x, i) => (i ? [sep, x] : [x]));

// ---------- 표시 ----------

export const St = ({ c, t }: { c: string; t: string }) => <span className={`st ${c}`}>{t}</span>;
export const StOf = ({ s }: { s: P.Status }) => <St c={s === 'pub' ? 'ok' : s === 'tmp' ? 'ai' : 'wait'} t={P.STATUS[s] || s} />;
export const BumpTag = ({ b }: { b?: string }) => (b ? <span className={`bp ${b}`}>{b}</span> : null);

export function Check({ on, label }: { on: boolean; label: string }) {
  return (
    <span className={`ck ${on ? 'on' : 'off'}`}>
      {on ? (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="8" />
          <path d="M4.5 8.2l2.2 2.2 4.8-4.8" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="7.2" fill="none" strokeWidth="1.6" />
        </svg>
      )}
      {label}
    </span>
  );
}

export function Table({ cols, rows }: { cols: ReactNode[]; rows: ReactNode[] }) {
  return (
    <div className="tw">
      <table className="t">
        <thead>
          <tr>
            {cols.map((c, i) => (
              <th key={i}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows
          ) : (
            <tr>
              <td colSpan={cols.length} className="muted">
                없음
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/** 좁은 화면: 오른쪽 목차 대신 머리 아래 접힌 목차 */
export function TocInline() {
  const { toc } = usePortal();
  if (toc.items.length < 2) return null;
  return (
    <details className="toc-inline">
      <summary>목차</summary>
      <TocList />
    </details>
  );
}

export function TocList({ smooth }: { smooth?: boolean }) {
  const { toc } = usePortal();
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto', block: 'start' });
  return (
    <ul>
      {toc.items.map((h) => (
        <li key={h.id} className={h.sub ? 'sub' : ''}>
          <button type="button" onClick={() => go(h.id)}>
            {h.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

/** 페이지 머리: 분류 · 제목 · 설명 · 확인 표시, 그 아래 좁은 화면용 목차 */
export function Head({ eyebrow, title, lead, extra }: { eyebrow: string; title: string; lead?: string; extra?: ReactNode }) {
  return (
    <>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {lead ? <p className="lead">{human(lead)}</p> : null}
      {extra}
      <TocInline />
    </>
  );
}

export function EditBtn({ k, label = '편집' }: { k: string; label?: string }) {
  const { ui, toggleEdit } = usePortal();
  const on = ui.edit === k;
  return (
    <button type="button" className={`edit-btn${on ? ' on' : ''}`} onClick={() => toggleEdit(k)}>
      {on ? '닫기' : `✎ ${label}`}
    </button>
  );
}

export function DraftBox({ d }: { d: Draft | null }) {
  const { role, isEditor, act } = usePortal();
  if (!d) return null;
  const mine = role === d.by;
  return (
    <div className="dbox" role="note">
      <div className="dbox-h">
        <b>초안 {d.id}</b>
        <BumpTag b={d.bump} />
        <span>
          {P.ROLES[d.by]} · {fmt(d.at)} · 게시 대기
        </span>
      </div>
      <ul>
        {d.lines.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
      <div className="row">
        {role === 'approver' ? (
          <>
            <button className="btn2 primary sm" onClick={() => act(() => P.publish(role, [d.id]), (h) => `게시 ${h.version}`)}>
              게시
            </button>
            <button className="btn2 sm" onClick={() => act(() => P.discard(role, d.id), (x) => (x.status === 'rejected' ? `${x.id} 반려` : `${x.id} 초안을 버렸습니다`))}>
              반려
            </button>
          </>
        ) : null}
        {mine ? (
          <button className="btn2 sm" onClick={() => act(() => P.discard(role, d.id), (x) => (x.status === 'rejected' ? `${x.id} 반려` : `${x.id} 초안을 버렸습니다`))}>
            초안 버리기
          </button>
        ) : null}
        {isEditor ? (
          <a className="lnk" href="#pub">
            초안 · 게시
          </a>
        ) : null}
      </div>
    </div>
  );
}

/** 담당 역할에서만 보이는 열린 초안 */
export function Drafts({ type, target }: { type: P.DraftType; target?: string }) {
  const { isEditor } = usePortal();
  return isEditor ? <DraftBox d={P.openDraft(type, target)} /> : null;
}

export function RuleList({ list }: { list: Rule[] }) {
  return (
    <ul className="rl">
      {list.map((x) => (
        <li key={x.id}>
          <a className="rid" href="#rules">
            {x.id}
          </a>
          <span className="rk">{x.kind}</span>
          <p>
            {human(x.text)}
            <small>
              <UxRef r={x.doc} /> · {x.section}
            </small>
          </p>
        </li>
      ))}
    </ul>
  );
}

/** 이 카탈로그 코드의 근거가 되는 UX 패턴 가이드 문서 */
export function GuideChips({ code }: { code: string }) {
  const L = docsFor(code);
  if (!L.length) return null;
  return (
    <>
      <h3>UX 패턴 가이드</h3>
      <p className="chips gx-chips">
        {L.map((d) => (
          <a key={d.id} className="chip" href={`#${guideRoute(d.id)}`}>
            {d.title}
          </a>
        ))}
      </p>
    </>
  );
}

/** 한 대상에 걸린 규칙: 포털 규칙은 목록으로, UX 패턴 가이드의 권장 · 금지는 문서별로 접어서 */
export function RulesBlock({ list }: { list: Rule[] }) {
  const own = list.filter((r) => !r.source);
  const byDoc = new Map<string, Rule[]>();
  for (const r of list.filter((x) => x.source)) byDoc.set(r.doc, [...(byDoc.get(r.doc) || []), r]);
  return (
    <>
      {own.length ? (
        <>
          <h3>UX표준가이드 규칙</h3>
          <RuleList list={own} />
        </>
      ) : null}
      {byDoc.size ? (
        <>
          <h3>UX 패턴 가이드 권장 · 금지</h3>
          {[...byDoc].map(([doc, L]) => (
            <details key={doc} className="gx-rules">
              <summary>
                <a href={`#${guideRoute(doc)}`} onClick={(e) => e.stopPropagation()}>
                  {guideDoc(doc)?.title || doc}
                </a>{' '}
                <span className="muted">
                  권장 {L.filter((r) => r.kind === '권장').length} · 금지 {L.filter((r) => r.kind === '금지').length}
                </span>
              </summary>
              <RuleList list={L} />
            </details>
          ))}
        </>
      ) : null}
    </>
  );
}

/** 두 번 눌러야 실행되는 버튼 (되돌리기 어려운 동작). submit이면 두 번째에 폼을 보낸다 */
export function ConfirmButton({ className, children, onConfirm, type = 'button' }: { className: string; children: ReactNode; onConfirm?: () => void; type?: 'button' | 'submit' }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button
      type={type}
      className={className}
      onClick={(e) => {
        if (!armed) {
          e.preventDefault();
          setArmed(true);
          return;
        }
        setArmed(false);
        if (type === 'button') onConfirm?.();
      }}
    >
      {armed ? '한 번 더 누르면 실행' : children}
    </button>
  );
}

export const LastUpdated = () => (
  <p className="updated">
    게시 {P.version()} · {fmt(P.history()[0].at)}
  </p>
);
