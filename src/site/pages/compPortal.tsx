// 컴포넌트 상세 페이지의 포털 조각: 확인 표시, 담당 편집 칸, 게시된 규칙, 쓰이는 곳, Figma에서만 읽은 컴포넌트 페이지.
import type { FormEvent } from 'react';
import * as P from '../portal/store';
import type { GuideRule } from '../portal/store';
import { usePortal } from '../portal/ctx';
import { patterns } from '../data';
import type { Guide } from '../data';
import { Check, CodeLink, DraftBox, EditBtn, GuideChips, RulesBlock, StOf, Table, fmt } from '../ui';

/** 제목 아래: ✓ Figma ✓ 사용 가이드 · 상태 */
export function CompChecks({ c, hasGuide }: { c: { key: string; figmaSyncedAt?: string }; hasGuide: boolean }) {
  const r = P.itemByKey(c.key);
  return (
    <div className="checks">
      <Check on label="Figma" />
      <Check on={hasGuide} label="사용 가이드" />
      {r ? <StOf s={r.status} /> : null}
      {c.figmaSyncedAt ? <span className="muted">Figma 읽음 {fmt(c.figmaSyncedAt)}</span> : null}
    </div>
  );
}

/** 페이지 위쪽 에디터 칸: 디자인 시스템 담당 = 설명 · Figma 다시 읽기 */
export function CompEditor({ c }: { c: { key: string; figma?: { url?: string } } }) {
  const { role, ui, textEdit, can, act, closeEdit } = usePortal();
  if (!textEdit) return null;
  const r = P.itemByKey(c.key);
  const open = ui.edit === `figma:${c.key}`;
  const onRe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const url = String(new FormData(e.currentTarget).get('url') || '').trim();
    act(() => P.draftFigma(role, { key: c.key, url }), (d) => `Figma 읽기 · ${d.lines.join(' · ')} · 초안 ${d.id}`).then((x) => x && closeEdit());
  };
  return (
    <>
      {r ? <DraftBox d={P.openDraft('item', r.code)} /> : null}
      <DraftBox d={P.openDraft('figma', c.key)} />
      {can('figma') ? (
        <section className="ed-panel">
          <div className="ed-h">
            <b>디자인 시스템 담당</b>
            <span>모양은 Figma에서 고친 뒤 다시 읽습니다. 설명은 입력칸에서 바로 고치고, 컴포넌트 코드는 아래 AI 채팅으로 고칩니다</span>
          </div>
          <div className="row">
            <EditBtn k={`figma:${c.key}`} label="Figma에서 다시 읽기" />
          </div>
          {open ? (
            <form className="ef" onSubmit={onRe}>
              <label>
                Figma 노드 주소
                <input name="url" defaultValue={c.figma?.url || ''} />
              </label>
              <div className="row">
                <button className="btn2 primary sm">읽기 · 게시본과 비교</button>
              </div>
            </form>
          ) : null}
        </section>
      ) : null}
    </>
  );
}

/** 사용 가이드(Policy) 앞에 붙는 UX 가이드 담당 편집 칸 */
export function GuideEditor({ k }: { k: string }) {
  const { role, ui, textEdit, can, act, closeEdit } = usePortal();
  if (!textEdit || !P.guide(k)) return null;
  const d = P.openDraft('guide', k);
  if (!can('guide')) return <DraftBox d={d} />;
  const g = d?.after || P.guide(k)!;
  const open = ui.edit === `guide:${k}`;
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const rows: GuideRule[] = [...f.querySelectorAll<HTMLElement>('[data-rule]')].map((r) => ({
      id: r.dataset.rule!,
      kind: (r.querySelector('[name=kind]') as HTMLSelectElement).value as GuideRule['kind'],
      text: (r.querySelector('[name=text]') as HTMLInputElement).value,
      remove: (r.querySelector('[name=remove]') as HTMLInputElement).checked,
    }));
    const nr = f.querySelector('[data-new]')!;
    const add = [{ kind: (nr.querySelector('[name=kind]') as HTMLSelectElement).value as GuideRule['kind'], text: (nr.querySelector('[name=text]') as HTMLInputElement).value }];
    const lead = (f.elements.namedItem('lead') as HTMLTextAreaElement).value;
    act(() => P.draftGuide(role, k, { lead, rules: rows, add }), (x) => `초안 ${x.id} 저장 · 포털 승인 담당 게시 대기`).then((x) => x && closeEdit());
  };
  return (
    <>
      <DraftBox d={d} />
      <section className="ed-panel">
        <div className="ed-h">
          <b>사용 가이드 규칙</b>
          <span>글은 입력칸에서 바로 고칩니다. 여기서는 규칙을 더하거나 빼고 종류를 바꿉니다</span>
        </div>
        <div className="row">
          <EditBtn k={`guide:${k}`} label="규칙 추가 · 삭제 · 종류 바꾸기" />
        </div>
        {open ? (
          <form className="ef" onSubmit={onSubmit}>
            <label>
              정책 요약
              <textarea name="lead" rows={2} defaultValue={g.lead} />
            </label>
            <div className="ge">
              {g.rules.map((r: GuideRule, i: number) => (
                <div key={r.id} className="ge-r" data-rule={r.id}>
                  <span className="muted">{i + 1}</span>
                  <select name="kind" aria-label={`${r.id} 종류`} defaultValue={r.kind}>
                    {['rule', 'do', 'dont'].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                  <input name="text" defaultValue={r.text} aria-label={`${r.id} 내용`} />
                  <label className="cb">
                    <input type="checkbox" name="remove" /> 삭제
                  </label>
                </div>
              ))}
              <div className="ge-r" data-new="">
                <span className="muted">새 규칙</span>
                <select name="kind" aria-label="새 규칙 종류" defaultValue="do">
                  <option>do</option>
                  <option>dont</option>
                  <option>rule</option>
                </select>
                <input name="text" placeholder="rule은 '항목: 기준' 형태" aria-label="새 규칙 내용" />
                <span />
              </div>
            </div>
            <div className="row">
              <button className="btn2 primary sm">초안 저장</button>
            </div>
          </form>
        ) : null}
      </section>
    </>
  );
}

/** Guidelines 안: 이 컴포넌트에 걸린 사용 규칙 */
export function compRules(key: string) {
  const r = P.itemByKey(key);
  return r ? P.rulesFor(r.code) : [];
}
export function CompRules({ k }: { k: string }) {
  const ru = compRules(k);
  const code = P.itemByKey(k)?.code;
  return (
    <>
      {code ? <GuideChips code={code} /> : null}
      {ru.length ? <RulesBlock list={ru} /> : null}
    </>
  );
}

/** Usage: 이 컴포넌트를 쓰는 블록 · 패턴 */
export function CompUsage({ k }: { k: string }) {
  const r = P.itemByKey(k);
  const parts = r ? P.parts().filter((p) => p.comp === r.code) : [];
  const pats = patterns.filter((p) => (p.components || []).includes(k));
  if (!parts.length && !pats.length) return null;
  return (
    <>
      <h2>Usage</h2>
      {parts.length ? (
        <>
          <h3>쓰이는 블록</h3>
          <Table
            cols={['블록', '자리', '필수']}
            rows={parts.map((p, i) => (
              <tr key={i}>
                <td>
                  <CodeLink code={p.block} />
                </td>
                <td>{p.slot}</td>
                <td>{p.required ? '필수' : '선택'}</td>
              </tr>
            ))}
          />
        </>
      ) : null}
      {pats.length ? (
        <>
          <h3>쓰이는 패턴</h3>
          <p className="chips">
            {pats.map((p, i) => (
              <span key={p.key}>
                {i ? ' ' : ''}
                <a href={`#pattern-${p.key}`}>{p.name} 패턴</a>
              </span>
            ))}
          </p>
        </>
      ) : null}
    </>
  );
}

/** 저장소 정책(guide.policy)을 게시된 규칙(번호 포함)으로 바꿔 사용 가이드에 표시 */
export function applyGuide(key: string, guide?: Guide, withDraft = false): Guide | undefined {
  // 담당에게는 아직 게시하지 않은 사용 가이드 초안을 보여 준다
  const g = (withDraft && (P.openDraft('guide', key)?.after as P.GuideDoc | undefined)) || P.guide(key);
  if (!guide || !g || !guide.policy) return guide;
  const pl = { ...guide.policy };
  const fromByName = Object.fromEntries((pl.rules || []).map((r) => [r.name, r.from]));
  pl.lead = g.lead;
  pl.rules = g.rules
    .filter((r) => r.kind === 'rule')
    .map((r) => {
      const i = r.text.indexOf(': ');
      const name = i > 0 ? r.text.slice(0, i) : '기준';
      return { id: r.id, name, desc: i > 0 ? r.text.slice(i + 2) : r.text, from: r.from || fromByName[name] || '포털에서 추가' };
    });
  pl.do = g.rules.filter((r) => r.kind === 'do').map((r) => ({ id: r.id, text: r.text }));
  pl.dont = g.rules.filter((r) => r.kind === 'dont').map((r) => ({ id: r.id, text: r.text }));
  return { ...guide, policy: pl };
}
