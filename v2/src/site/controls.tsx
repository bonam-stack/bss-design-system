// 미리보기 조절 칸 (Figma 속성 패널처럼): 이름 왼쪽 · 값 오른쪽. 변형 = 드롭다운, 켜기/끄기 = 토글, 글 = 입력칸, 아이콘 = 아이콘 목록에서 고르기.
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../ds/shared';
import { icons } from './data';

/** 아이콘 이름 (Icon name과 같은 꼴: line/search) */
const ICONS = icons.icons.filter((i) => i.file).map((i) => ({ name: i.file!.replace(/^svg\//, '').replace(/\.svg$/, ''), label: i.name, style: i.style }));

export function CtlRow({ name, hint, children, wide }: { name: string; hint?: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={`ctl2${wide ? ' wide' : ''}`}>
      <span className="ctl2-name" title={name}>
        {name}
        {hint ? <span className="ctl-hint">{hint}</span> : null}
      </span>
      <div className="ctl2-val">{children}</div>
    </div>
  );
}

export function CtlSelect({ name, value, options, onChange }: { name: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <CtlRow name={name}>
      <span className="ctl2-select">
        <select aria-label={name} value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </span>
    </CtlRow>
  );
}

export function CtlToggle({ name, checked, onChange }: { name: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <CtlRow name={name}>
      <button type="button" role="switch" aria-checked={checked} aria-label={name} className="ctl2-toggle" onClick={() => onChange(!checked)}>
        <i aria-hidden="true" />
      </button>
    </CtlRow>
  );
}

export function CtlText({ name, value, onChange }: { name: string; value: string; onChange: (v: string) => void }) {
  return (
    <CtlRow name={name}>
      <input className="ctl2-text" aria-label={name} value={value} onChange={(e) => onChange(e.target.value)} />
    </CtlRow>
  );
}

/** 아이콘 고르기: 누르면 아이콘 목록(검색 · 모양 미리보기)이 열린다 */
export function CtlIcon({ name, value, onChange }: { name: string; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const box = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!open) return;
    search.current?.focus();
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
  const L = useMemo(() => {
    const k = q.trim().toLowerCase();
    return k ? ICONS.filter((i) => i.name.includes(k) || i.label.toLowerCase().includes(k)) : ICONS;
  }, [q]);
  const cur = ICONS.find((i) => i.name === value);
  return (
    <CtlRow name={name}>
      <div className="ctl2-icon" ref={box}>
        <button type="button" className="ctl2-icon-btn" aria-haspopup="listbox" aria-expanded={open} aria-label={`${name}: ${cur?.label || value}`} onClick={() => setOpen((o) => !o)}>
          <Icon name={value} size={16} />
          <span>{cur?.label || value}</span>
        </button>
        {open ? (
          <div className="ctl2-icon-pop">
            <input ref={search} className="ctl2-text" placeholder="아이콘 찾기" value={q} onChange={(e) => setQ(e.target.value)} aria-label="아이콘 찾기" />
            <div className="ctl2-icon-list" role="listbox" aria-label={`${name} 아이콘`}>
              {L.map((i) => (
                <button
                  key={i.name}
                  type="button"
                  role="option"
                  aria-selected={i.name === value}
                  title={`${i.label} · ${i.name}`}
                  onClick={() => {
                    onChange(i.name);
                    setOpen(false);
                  }}
                >
                  <Icon name={i.name} size={16} />
                  <span>{i.label}</span>
                  <em>{i.style}</em>
                </button>
              ))}
              {L.length ? null : <p className="muted">맞는 아이콘이 없습니다</p>}
            </div>
          </div>
        ) : null}
      </div>
    </CtlRow>
  );
}

export const CtlGroup = ({ children }: { children: ReactNode }) => <div className="ctl2-group">{children}</div>;
