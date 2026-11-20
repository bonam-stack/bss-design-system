// 초안 미리보기 창: 배포 전에 바뀐 것을 새 창처럼 띄워 본다. 관리자 배포 · 내 변경에서 연다.
// 코드 · 새 컴포넌트는 실제로 그려 보고, 토큰은 견본, 글 · 규칙은 바뀌기 전 → 후로 보여 준다.
import { useEffect, useRef, useState } from 'react';
import * as P from '../portal/store';
import type { Draft } from '../portal/store';
import { compile, pascal, repoSource } from '../live';
import { componentByKey } from '../data';
import { BumpTag } from '../ui';
import { Preview } from './PortalCompPage';
import { CodeBlock } from './ComponentPage';

/** 이 초안을 페이지에서 보는 주소 (배포 전 새 컴포넌트는 #new-<key>) */
export function draftHref(d: Draft): string {
  const key = d.key || d.target;
  if ((d.type === 'figma' || d.type === 'code') && P.draftNewComp(key)) return `#new-${key}`;
  if (d.type === 'token') return '#tokens';
  if (d.type === 'rule') return '#rules';
  if (d.type === 'guide' || d.type === 'figma' || d.type === 'code' || d.type === 'text') return `#${P.itemByKey(key)?.code || P.item(key)?.code || d.code || d.target}`;
  return `#${d.target}`;
}

/** 그릴 컴포넌트 코드: 이 초안이 코드면 그것, 새 컴포넌트면 같은 key의 코드 초안 */
function sourceFor(d: Draft): { name: string; source: string; props: { name: string; type: string; default: unknown; options?: string[] }[] } | null {
  const key = d.key || d.target;
  const code = d.type === 'code' ? d : P.openDraft('code', key);
  if (!code) return null;
  const meta = (P.draftNewComp(key) || P.comp(key) || componentByKey(key)?.data || { props: [] }) as { props: { name: string; type: string; default: unknown; options?: string[] }[] };
  return { name: pascal(key), source: code.after.source as string, props: meta.props || [] };
}

function Body({ d }: { d: Draft }) {
  const [tab, setTab] = useState<'view' | 'code'>('view');
  const src = d.type === 'code' || (d.type === 'figma' && d.isNew) ? sourceFor(d) : null;
  if (src) {
    const r = compile(src.name, src.source);
    const before = d.type === 'code' ? P.publishedCode(d.key || d.target) ?? repoSource(src.name) : '';
    return (
      <>
        <div className="sb-tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'view'} onClick={() => setTab('view')}>
            미리보기
          </button>
          <button role="tab" aria-selected={tab === 'code'} onClick={() => setTab('code')}>
            코드
          </button>
        </div>
        {tab === 'view' ? (
          r.Component ? (
            <section className="sb">
              <Preview key={src.source} C={r.Component} c={{ props: src.props }} />
            </section>
          ) : (
            <p className="error">코드 오류로 그릴 수 없습니다 · {r.error}</p>
          )
        ) : (
          <div className="sb-code">
            <CodeBlock label={`src/ds/components/${src.name}.tsx (초안)`} text={src.source} />
            {before ? <CodeBlock label="지금 운영 코드" text={before} /> : null}
          </div>
        )}
      </>
    );
  }
  if (d.type === 'figma') {
    const a = d.after || {};
    return (
      <>
        <p className="note">Figma에서 읽은 속성입니다. 아직 React 코드 초안이 없어 그림은 없습니다.</p>
        <ul className="mini">
          {(a.props || []).map((p: { name: string; type: string; options?: string[] }) => (
            <li key={p.name}>
              <code>{p.name}</code> {p.type}
              {p.options ? ` · ${p.options.join(' | ')}` : ''}
            </li>
          ))}
        </ul>
      </>
    );
  }
  if (d.type === 'token') {
    const cur = P.tokens()[d.target];
    const nv = d.after?.value as string | undefined;
    const isColor = /^#|rgb/.test(String(nv || cur?.value || ''));
    return (
      <div className="pv-cmp">
        {[
          ['지금', cur?.value],
          ['배포 후', d.after === null ? '(삭제)' : nv],
        ].map(([l, v]) => (
          <div key={l}>
            <b>{l}</b>
            {isColor && v && v !== '(삭제)' ? <i className="fd-sw big" style={{ ['--sw' as string]: v }} /> : null}
            <span className="mono">{v || '—'}</span>
          </div>
        ))}
      </div>
    );
  }
  if (d.type === 'text' && d.after?.fields) {
    const f = d.after.fields as Record<string, string>;
    return (
      <table className="t">
        <thead>
          <tr>
            <th>자리</th>
            <th>지금</th>
            <th>배포 후</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(f).map((k) => (
            <tr key={k}>
              <td>{d.after.labels?.[k] || k}</td>
              <td className="muted">{d.after.original?.[k] || '—'}</td>
              <td>{f[k]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  return (
    <>
      <p className="note">바뀌는 내용</p>
      <ul className="mini">
        {d.lines.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </>
  );
}

export function DraftPreview({ d, onClose }: { d: Draft; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    box.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prev?.focus();
    };
  }, [onClose]);
  return (
    <div className="pv-overlay" onClick={onClose}>
      <div className="pv-win" role="dialog" aria-modal="true" aria-label={`${d.id} 미리보기`} tabIndex={-1} ref={box} onClick={(e) => e.stopPropagation()}>
        <div className="pv-bar">
          <span className="pv-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <b>미리보기 · {d.id}</b>
          <span className="pv-title">{d.title}</span>
          <BumpTag b={d.bump} />
          <a className="btn2 sm" href={draftHref(d)} onClick={onClose}>
            페이지로 열기
          </a>
          <button type="button" className="btn2 sm" onClick={onClose} aria-label="닫기">
            닫기 ✕
          </button>
        </div>
        <div className="pv-body">
          <ul className="mini pv-lines">
            {d.lines.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
          <Body d={d} />
        </div>
      </div>
    </div>
  );
}

/** 표 안에 두는 미리보기 버튼 */
export function PreviewButton({ d }: { d: Draft }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="btn2 sm" onClick={() => setOpen(true)}>
        미리보기
      </button>
      {open ? <DraftPreview d={d} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
