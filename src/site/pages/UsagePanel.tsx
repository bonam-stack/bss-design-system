// 블록 사용 현황: 블록 페이지에는 숫자 요약과 최근 몇 개만, 전체는 검색 · 필터가 있는 창에서 본다.
// 값은 SB Studio가 배포된 SB에서 역조인해 주는 데이터(catalog/usage.json). 쓰이는 곳이 수백 개여도 페이지가 길어지지 않게 한다.
import { useEffect, useMemo, useRef, useState } from 'react';
import * as P from '../portal/store';
import type { Usage } from '../portal/store';
import { usage } from '../data';

const ver = (v: string) => v.split('.').map(Number);
/** 운영 버전보다 MAJOR · MINOR가 낮은 기반 버전 = 다시 확인할 후보 */
const isOld = (v: string, cur: string) => {
  const [a, b] = ver(v);
  const [x, y] = ver(cur);
  return a < x || (a === x && b < y);
};
const domainName = (d: string) => ({ func: 'BSS 업무', bo: 'BO' } as Record<string, string>)[d] || d;

function UsageWindow({ list, onClose }: { list: Usage[]; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [dom, setDom] = useState('');
  const [v, setV] = useState('');
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    box.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);
  const cur = P.version();
  const doms = [...new Set(list.map((u) => u.domain))];
  const vers = [...new Set(list.map((u) => u.deployed))].sort((a, b) => (ver(b) > ver(a) ? 1 : -1));
  const query = q.trim().toLowerCase();
  const L = list.filter((u) => (!dom || u.domain === dom) && (!v || u.deployed === v) && (!query || `${u.sb} ${u.screen} ${u.uc}`.toLowerCase().includes(query)));
  // SB별로 묶어서
  const bySb = useMemo(() => {
    const m = new Map<string, Usage[]>();
    for (const u of L) m.set(u.sb, [...(m.get(u.sb) || []), u]);
    return [...m].sort((a, b) => b[1].length - a[1].length);
  }, [L]);
  return (
    <div className="pv-overlay" onClick={onClose}>
      <div className="pv-win" role="dialog" aria-modal="true" aria-label="사용 현황 전체" tabIndex={-1} ref={box} onClick={(e) => e.stopPropagation()}>
        <div className="pv-bar">
          <span className="pv-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <b>사용 현황 전체</b>
          <span className="pv-title">
            {L.length} 화면 · {bySb.length} SB {usage.sample ? '· 예시 데이터' : ''}
          </span>
          <button type="button" className="btn2 sm" onClick={onClose}>
            닫기 ✕
          </button>
        </div>
        <div className="pv-body">
          <div className="toolbar">
            <input type="search" className="search" placeholder="SB · 화면 코드 · UC 검색" aria-label="사용 현황 검색" value={q} onChange={(e) => setQ(e.target.value)} />
            <select className="in-sm" aria-label="업무" value={dom} onChange={(e) => setDom(e.target.value)}>
              <option value="">업무 전체</option>
              {doms.map((d) => (
                <option key={d} value={d}>
                  {domainName(d)}
                </option>
              ))}
            </select>
            <select className="in-sm" aria-label="기반 버전" value={v} onChange={(e) => setV(e.target.value)}>
              <option value="">기반 버전 전체</option>
              {vers.map((x) => (
                <option key={x} value={x}>
                  {x}
                  {isOld(x, cur) ? ' (이전 버전)' : ''}
                </option>
              ))}
            </select>
          </div>
          {bySb.map(([sb, U]) => (
            <details key={sb} className="us-sb" open={bySb.length <= 3}>
              <summary>
                <b>{sb}</b> <span className="muted">{domainName(U[0].domain)} · {U.length} 화면</span>
                {U.some((u) => isOld(u.deployed, cur)) ? <span className="us-old">이전 버전 {U.filter((u) => isOld(u.deployed, cur)).length}</span> : null}
              </summary>
              <table className="t">
                <thead>
                  <tr>
                    <th>화면</th>
                    <th>UC</th>
                    <th>기반 버전</th>
                  </tr>
                </thead>
                <tbody>
                  {U.map((u, i) => (
                    <tr key={i}>
                      <td className="mono">{u.screen}</td>
                      <td className="mono">{u.uc}</td>
                      <td className="mono">
                        {u.deployed} {isOld(u.deployed, cur) ? <span className="us-old">이전 버전</span> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          ))}
          {!L.length ? <p className="muted">조건에 맞는 화면이 없습니다.</p> : null}
        </div>
      </div>
    </div>
  );
}

export function UsagePanel({ code }: { code: string }) {
  const [open, setOpen] = useState(false);
  const list = usage.items.filter((u) => u.block === code);
  if (!list.length) return null;
  const cur = P.version();
  const sbs = new Set(list.map((u) => u.sb)).size;
  const old = list.filter((u) => isOld(u.deployed, cur)).length;
  const doms = [...new Set(list.map((u) => u.domain))].map((d) => `${domainName(d)} ${list.filter((u) => u.domain === d).length}`);
  const recent = [...list].sort((a, b) => (ver(b.deployed) > ver(a.deployed) ? 1 : -1)).slice(0, 5);
  return (
    <>
      <h3>
        사용 현황 {usage.sample ? <span className="us-sample">예시 데이터</span> : null}
      </h3>
      <div className="us-stats">
        <div>
          <b>{list.length}</b>
          <span>화면</span>
        </div>
        <div>
          <b>{sbs}</b>
          <span>SB</span>
        </div>
        <div>
          <b>{doms.join(' · ')}</b>
          <span>업무별 화면</span>
        </div>
        <div className={old ? 'warn' : ''}>
          <b>{old}</b>
          <span>이전 버전 기반 화면</span>
        </div>
      </div>
      <p className="note">최근 기반 버전 순 5개입니다. SB Studio가 배포된 SB에서 이 블록이 쓰인 화면을 찾아 주는 값으로, 승격 · 재검수 판단에 씁니다.</p>
      <table className="t us-recent">
        <thead>
          <tr>
            <th>SB</th>
            <th>화면</th>
            <th>기반 버전</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((u, i) => (
            <tr key={i}>
              <td>{u.sb}</td>
              <td className="mono">{u.screen}</td>
              <td className="mono">{u.deployed}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        <button type="button" className="btn2 sm" onClick={() => setOpen(true)}>
          전체 보기 ({list.length}) · 검색 · 필터
        </button>
      </p>
      {open ? <UsageWindow list={list} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
