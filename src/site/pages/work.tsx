// 역할별 작업 페이지 (BSS SB Studio 디자인 포맷 정의 및 연계 방식의 흐름).
// 케이스 1 토큰 · 컴포넌트 · 공통 블록: 디자인 요청 → UI팀 디자인 → 소스 변환 · 미리보기 → DS 담당자 확인 → 배포 요청 → 관리자 배포
// 케이스 2 UX 패턴: 기준 편집 → 규칙 번호 자동 → 저장 · 미리보기 → UX 담당자 확인 → 배포 요청 → 관리자 배포
// 케이스 3 블록: AI 부품(SB 파일 안) → 기획 컨펌(스냅샷 · DS 버전 기록) → UI 디자인 → 검수 후 DS 등록 → Designed SB → FE
// 케이스 4 아이콘: Workboard에서 요청(AI 더미로 기획 계속) → 디자인 요청 → 소스 변환 → 배포 → 더미 교체 · 알림
import { FigmaTokenRow } from './PortalCompPage';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import * as P from '../portal/store';
import type { Draft, Request } from '../portal/store';
import { usePortal } from '../portal/ctx';
import { components, patterns } from '../data';
import { BumpTag, ConfirmButton, DraftBox, Head, St, Table, human } from '../ui';

const FIGMA_FILE = '9AioWOXVOVm5C7kdSxSEEP';
export const TYPE_NAME: Record<P.DraftType, string> = { item: '카탈로그', rule: '규칙', guide: '사용 가이드', figma: 'Figma 변환', code: '코드', text: '설명', token: '토큰' };
const formValues = (f: HTMLFormElement) => Object.fromEntries(new FormData(f)) as Record<string, string>;
const whereOf = (d: Draft) =>
  d.type === 'token' ? '#tokens' : d.type === 'rule' ? '#rules' : d.type === 'guide' || d.type === 'figma' || d.type === 'code' || d.type === 'text' ? `#${P.itemByKey(d.key || d.target)?.code || d.code || d.target}` : `#${d.target}`;
const RESULT: Record<string, (d: Draft) => string> = { published: (d) => `배포 ${d.version}`, rejected: () => '반려', discarded: () => '버림', rolled_back: () => '롤백' };

export function DraftState({ d }: { d: Draft }) {
  if (d.status === 'draft') return d.requested ? <St c="hold" t="배포 요청됨" /> : <St c="ai" t="작성 중" />;
  return <St c={d.status === 'published' ? 'ok' : 'ng'} t={RESULT[d.status]?.(d) || d.status} />;
}

function DraftRow({ d, acts }: { d: Draft; acts?: ReactNode }) {
  return (
    <tr>
      <td>
        <b className="nw">{d.id}</b>
      </td>
      <td className="nw">{TYPE_NAME[d.type]}</td>
      <td>
        <a href={whereOf(d)}>{d.title}</a>
        <ul className="mini">
          {d.lines.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      </td>
      <td>
        <BumpTag b={d.bump} />
      </td>
      <td className="nw">
        <DraftState d={d} />
      </td>
      <td className="acts">{acts}</td>
    </tr>
  );
}

const Steps = ({ r }: { r: Request }) => (
  <>
    <span className="steps">
      {P.REQ_STAGES.map((x) => (
        <i key={x} className={P.REQ_STAGES.indexOf(x) <= P.REQ_STAGES.indexOf(r.stage) ? 'on' : ''} title={x} />
      ))}
    </span>{' '}
    {r.stage}
  </>
);

/** Workboard (모두): 아이콘 · 컴포넌트 · 블록 · 토큰 요청이 어디까지 진행됐는지 단계별로 본다. 요청도 여기서 보낸다 */
export function MyRequests() {
  const { role, act } = usePortal();
  const [mine, setMine] = useState(false);
  const all = P.requests();
  const L = mine ? all.filter((r) => r.by === role) : all;
  const onAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const v = formValues(f);
    act(() => P.addRequest(role, { kind: v.kind, title: v.title, detail: v.detail }), (r) => `${r.id} 요청 · DS 담당자에게 전달`).then((x) => x && f.reset());
  };
  return (
    <>
      <Head eyebrow="Workboard" title="Workboard" lead="아이콘 · 컴포넌트 · 블록 · 토큰 요청이 어디까지 진행됐는지 봅니다. 완료되면 포털에 반영되고, AI 더미로 그린 화면은 자동으로 바뀝니다." />
      <div className="cards req-sum">
        {P.REQ_STAGES.map((st) => (
          <div key={st} className="card">
            <span className="card-eb">{st}</span>
            <b>{L.filter((r) => r.stage === st).length}건</b>
          </div>
        ))}
      </div>
      <h2 id="list">요청 목록</h2>
      <div className="seg" role="group" aria-label="보기">
        <button aria-pressed={!mine} onClick={() => setMine(false)}>
          전체
        </button>
        <button aria-pressed={mine} onClick={() => setMine(true)}>
          내 요청
        </button>
      </div>
      <Table
        cols={['요청', '종류', '내용', '요청자', '진행', '알림']}
        rows={L.map((r) => (
          <tr key={r.id}>
            <td className="nw">
              <b>{r.id}</b>
            </td>
            <td className="nw">{P.REQ_KINDS[r.kind]}</td>
            <td>
              {r.title}
              <br />
              <span className="muted">{r.detail}</span>
            </td>
            <td className="nw">{P.ROLES[r.by]}</td>
            <td className="nw">
              <Steps r={r} />
            </td>
            <td>{r.dummy ? <St c="hold" t="AI 더미 사용 중 · 개발 전달 불가" /> : r.notified ? <St c="ok" t="교체 완료" /> : null}</td>
          </tr>
        ))}
      />
      <h2 id="new">요청하기</h2>
      <section className="ed-panel" aria-label="요청하기">
        <form className="ef" onSubmit={onAdd}>
          <div className="ef-r">
            <label>
              종류
              <select name="kind">
                {Object.entries(P.REQ_KINDS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="w">
              무엇이 필요한가요
              <input name="title" required placeholder="예: export 아이콘" />
            </label>
          </div>
          <label>
            자세히 (쓰는 화면 · 크기 · 이유)
            <input name="detail" placeholder="예: SVC-02-001 조회 화면 · 16px" />
          </label>
          <div className="row">
            <button className="btn2 primary sm">요청</button>
          </div>
        </form>
      </section>
    </>
  );
}

/** UX 편집 › 기준 편집: UX 담당자가 고치는 문서 바로가기 (편집은 각 문서 안에서) */
export function UxEdit() {
  const I = P.items();
  const Open = ({ type, t }: { type: P.DraftType; t?: string }) => (P.openDraft(type, t) ? <St c="ai" t="초안" /> : null);
  const guides = components.filter((c) => P.guide(c.data.key));
  return (
    <>
      <Head eyebrow="UX 편집" title="기준 편집" lead="UX 패턴 · 레이아웃 규칙 · 컴포넌트 사용 가이드 · UX 규칙을 고칩니다. 문서를 열면 그 자리에 편집 칸이 있고, 저장하면 초안이 됩니다. 규칙 번호는 저장할 때 자동으로 붙고 바뀌지 않습니다." />
      <h2 id="rules">UX 규칙</h2>
      <p>
        <a className="btn2 sm" href="#rules">
          규칙 목록에서 추가 · 수정 · 삭제
        </a>
      </p>
      <h2 id="patterns">UX 패턴 · 레이아웃 규칙</h2>
      <Table
        cols={['문서', '종류']}
        rows={[
          ...patterns.map((p) => (
            <tr key={p.key}>
              <td>
                <a href={`#pattern-${p.key}`}>{p.name} 패턴</a>
              </td>
              <td>Figma 패턴</td>
            </tr>
          )),
          ...I.filter((i) => i.kind === 'layout').map((i) => (
            <tr key={i.code}>
              <td>
                <a href={`#${i.code}`}>{i.name}</a> <Open type="item" t={i.code} />
              </td>
              <td>레이아웃 규칙</td>
            </tr>
          )),
        ]}
      />
      <h2 id="guides">컴포넌트 사용 가이드</h2>
      <Table
        cols={['컴포넌트', '규칙 번호']}
        rows={guides.map((c) => (
          <tr key={c.data.key}>
            <td>
              <a href={`#${P.itemByKey(c.data.key)?.code || `c-${c.data.key}`}`}>{c.data.name}</a> <Open type="guide" t={c.data.key} />
            </td>
            <td className="mono">UX-{c.data.key.toUpperCase()}-NN</td>
          </tr>
        ))}
      />
    </>
  );
}

/** 배포 요청 (UX · DS 담당자): 내 초안 → 미리보기 확인 → 배포 요청 */
export function My() {
  const { role, act } = usePortal();
  const L = P.drafts((d) => d.by === role);
  const open = L.filter((d) => d.status === 'draft');
  const done = L.filter((d) => d.status !== 'draft');
  return (
    <>
      <Head eyebrow={role === 'ux' ? 'UX 편집' : 'DS 작업'} title="배포 요청" lead="내가 고친 초안입니다. 미리보기로 작동을 확인한 뒤 배포 요청하면 관리자가 운영 서버에 배포합니다." />
      <h2 id="open">진행 중</h2>
      <Table
        cols={['초안', '종류', '내용', '버전', '상태', '']}
        rows={open.map((d) => (
          <DraftRow
            key={d.id}
            d={d}
            acts={
              <>
                <a className="btn2 sm" href={whereOf(d)}>
                  미리보기
                </a>
                {!d.requested ? (
                  <button type="button" className="btn2 primary sm" onClick={() => act(() => P.requestDeploy(role, d.id), (x) => `${x.id} 배포 요청 · 관리자 배포 대기`)}>
                    배포 요청
                  </button>
                ) : null}
                <button type="button" className="btn2 sm" onClick={() => act(() => P.discard(role, d.id), (x) => `${x.id} 초안을 버렸습니다`)}>
                  버리기
                </button>
              </>
            }
          />
        ))}
      />
      {done.length ? (
        <>
          <h2 id="done">처리됨</h2>
          <Table cols={['초안', '종류', '내용', '버전', '결과', '']} rows={done.map((d) => <DraftRow key={d.id} d={d} />)} />
        </>
      ) : null}
    </>
  );
}

/** DS 작업 › 디자인 요청: 요청됨 → 디자인 작업 → 미리보기 확인 → 완료 */
export function Requests() {
  const { role, act } = usePortal();
  const L = P.requests();
  return (
    <>
      <Head eyebrow="DS 작업" title="디자인 요청" lead="SB 작성 중 들어온 아이콘 제작 · 컴포넌트 · 공통 블록 수정 · 토큰 요청입니다. UI팀이 Figma에서 만들면 소스 변환으로 읽어 미리보기를 확인합니다." />
      <div className="flowline">
        {P.REQ_STAGES.map((x) => (
          <span key={x}>{x}</span>
        ))}
      </div>
      <h2 id="list">요청</h2>
      <Table
        cols={['요청', '종류', '내용', '요청자', '단계', '']}
        rows={L.map((r) => (
          <tr key={r.id}>
            <td className="nw">
              <b>{r.id}</b>
            </td>
            <td className="nw">{P.REQ_KINDS[r.kind]}</td>
            <td>
              {r.title}
              <br />
              <span className="muted">{r.detail}</span>
            </td>
            <td className="nw">{P.ROLES[r.by]}</td>
            <td className="nw">
              <Steps r={r} />
            </td>
            <td className="acts">
              {r.stage !== '완료' ? (
                <button type="button" className="btn2 primary sm" onClick={() => act(() => P.advanceRequest(role, r.id), (x) => (x.notified ? `${x.id} 완료 · 더미 교체 · 요청자에게 알림` : `${x.id} → ${x.stage}`))}>
                  {P.REQ_STAGES[P.REQ_STAGES.indexOf(r.stage) + 1]}
                </button>
              ) : null}
              {r.stage === '디자인 작업' ? (
                <a className="lnk" href="#convert">
                  소스 변환
                </a>
              ) : null}
            </td>
          </tr>
        ))}
      />
    </>
  );
}

/** DS 작업 › 소스 변환: Figma 주소 → 형식 · 키 자동 확인 → 미리보기 초안 */
export function Convert() {
  const { role, act, setTextEdit } = usePortal();
  const pend = P.drafts((d) => d.status === 'draft' && d.type === 'figma');
  const onAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = formValues(e.currentTarget);
    act(() => P.draftFigma(role, { url: v.url.trim() }), (d) => `${d.after.name} 읽기 · 초안 ${d.id} 저장 · 이어서 React 코드를 만드세요`, (d) => `#new-${d.key}`).then((d) => d && setTextEdit(true));
  };
  const sample = (e: React.MouseEvent<HTMLButtonElement>) => {
    const f = e.currentTarget.form!;
    (f.elements.namedItem('url') as HTMLInputElement).value = `https://www.figma.com/design/${FIGMA_FILE}/Lib?node-id=9000-1`;
  };
  return (
    <>
      <Head eyebrow="DS 작업" title="소스 변환" lead="UI팀이 Figma에서 만든 컴포넌트 · 공통 블록을 Figma 주소로 읽어 포털 형식의 소스로 바꿉니다. 카탈로그 코드는 같은 이름이 있으면 거기에 잇고, 없으면 새로 등록합니다. 결과는 미리보기 초안이 됩니다." />
      <section className="ed-panel" aria-label="Figma 주소로 변환">
        <div className="ed-h">
          <b>컴포넌트 추가</b>
          <span>① Figma 컴포넌트 노드 주소를 읽으면 새 컴포넌트 페이지(배포 전)가 열립니다 → ② 그 페이지에서 React 코드를 만듭니다(AI 또는 기본 틀) → ③ 배포 요청 메뉴에서 미리보기 확인 후 요청. 기존 컴포넌트는 그 문서의 "Figma에서 다시 읽기"를 씁니다</span>
        </div>
        <FigmaTokenRow />
        <form className="ef" onSubmit={onAdd}>
          <label className="w">
            Figma 노드 주소 (Figma에서 컴포넌트를 선택하고 "링크 복사")
            <input name="url" required placeholder="https://www.figma.com/design/…?node-id=…" />
          </label>
          <div className="row">
            <button className="btn2 primary sm">읽기 · 초안 저장</button>
            <button type="button" className="lnk" onClick={sample}>
              예시: Chip 노드 (흉내)
            </button>
          </div>
        </form>
      </section>
      <section className="ed-panel" aria-label="토큰">
        <div className="ed-h">
          <b>토큰</b>
          <span>토큰은 Foundations › 디자인 토큰 문서에서 추가 · 수정합니다. 배포되면 토큰 소스(:root CSS)에 함께 반영됩니다.</span>
        </div>
        <div className="row">
          <a className="btn2 sm" href="#tokens">
            토큰 편집
          </a>
        </div>
      </section>
      <h2 id="drafts">변환 결과</h2>
      {pend.length ? (
        pend.map((d) => (
          <div key={d.id}>
            <DraftBox d={d} />
            {d.isNew ? (
              <p className="note">
                <a href={`#new-${d.key}`}>{d.after.name} 페이지에서 React 코드 만들기 →</a>
                {P.openDraft('code', d.key) ? ' · 코드 초안 있음' : ' · 아직 코드 없음'}
              </p>
            ) : null}
          </div>
        ))
      ) : (
        <p className="muted">아직 변환한 결과가 없습니다.</p>
      )}
    </>
  );
}

/** 관리자 › 운영 서버 배포: 배포 요청 처리 · 정기 · 수동 배포 · 롤백 */
export function Deploy() {
  const { role, act } = usePortal();
  const [mode, setMode] = useState<'정기' | '수동'>('정기');
  const req = P.drafts((d) => d.status === 'draft' && !!d.requested);
  const wip = P.drafts((d) => d.status === 'draft' && !d.requested);
  const done = P.drafts((d) => d.status !== 'draft');
  const last = P.history()[0];
  const pv = P.previewVersion();
  const onPublish = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const ids = [...f.querySelectorAll<HTMLInputElement>('input[name=ids]:checked')].map((x) => x.value);
    act(() => P.publish(role, ids, formValues(f).reason, mode), (h) => `${h.mode} ${h.version} · SB Studio가 이 버전을 읽습니다`);
  };
  const onRollback = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    act(() => P.rollback(role, formValues(e.currentTarget).reason), (h) => `${h.version}(으)로 되돌렸습니다`);
  };
  return (
    <>
      <Head
        eyebrow="관리자"
        title="운영 서버 배포"
        lead="담당자가 미리보기로 확인하고 배포 요청한 변경을 운영 서버(BSS 디자인 포털)에 배포합니다. SB Studio는 운영 서버 버전만 읽습니다."
        extra={
          <p className="row">
            <span>
              운영 <b className="mono">{P.version()}</b>
            </span>
            {pv ? (
              <span>
                다음 (미리보기) <b className="mono">{pv}</b>
              </span>
            ) : null}
          </p>
        }
      />
      <h2 id="pending">배포 요청</h2>
      <form onSubmit={onPublish}>
        <Table
          cols={['', '초안', '종류', '내용', '버전', '담당', '']}
          rows={req.map((d) => (
            <tr key={d.id}>
              <td>
                <input type="checkbox" name="ids" value={d.id} defaultChecked aria-label={`${d.id} 고르기`} />
              </td>
              <td>
                <b className="nw">{d.id}</b>
              </td>
              <td className="nw">{TYPE_NAME[d.type]}</td>
              <td>
                <a href={whereOf(d)}>{d.title}</a>
                <ul className="mini">
                  {d.lines.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </td>
              <td>
                <BumpTag b={d.bump} />
              </td>
              <td className="nw">{P.ROLES[d.by]}</td>
              <td>
                <button type="button" className="btn2 sm" onClick={() => act(() => P.discard(role, d.id), (x) => `${x.id} 반려`)}>
                  반려
                </button>
              </td>
            </tr>
          ))}
        />
        {req.length ? (
          <>
            <div className="deploy-mode">
              <label>
                <input type="radio" name="mode" checked={mode === '정기'} onChange={() => setMode('정기')} /> 정기 배포 <span className="muted">주기마다 묶어서</span>
              </label>
              <label>
                <input type="radio" name="mode" checked={mode === '수동'} onChange={() => setMode('수동')} /> 수동 배포 <span className="muted">긴급 수정 · 아이콘 추가 등, 사유 필수</span>
              </label>
            </div>
            <div className="row pad">
              <input name="reason" id="pubReason" className="grow" placeholder="변경 노트 · 수동 배포 사유 (무엇 · 왜 · 영향 범위)" />
              <button className="btn2 primary">고른 변경 배포 → {pv ? pv.replace(/-preview\.\d+$/, '') : ''}</button>
            </div>
          </>
        ) : null}
      </form>
      {wip.length ? (
        <>
          <h3>작성 중 (담당자 확인 전)</h3>
          <Table cols={['초안', '종류', '내용', '버전', '상태', '']} rows={wip.map((d) => <DraftRow key={d.id} d={d} />)} />
        </>
      ) : null}
      {last.prevPub ? (
        <>
          <h2 id="rollback">롤백</h2>
          <form className="row" onSubmit={onRollback}>
            <span>
              운영 <b className="mono">{P.version()}</b>
            </span>
            <input name="reason" id="rbReason" className="grow" placeholder="롤백 사유" />
            <ConfirmButton type="submit" className="btn2 sm danger">
              {last.from}(으)로 되돌리기
            </ConfirmButton>
          </form>
        </>
      ) : null}
      {done.length ? (
        <>
          <h2 id="done">처리 기록</h2>
          <Table cols={['초안', '종류', '내용', '버전', '결과', '']} rows={done.map((d) => <DraftRow key={d.id} d={d} />)} />
        </>
      ) : null}
      <h2 id="reset">시연 데이터</h2>
      <p className="row">
        <ConfirmButton className="btn2 sm danger" onConfirm={() => act(() => P.reset(), '처음 상태로 되돌렸습니다', '#overview')}>
          처음 상태로 되돌리기
        </ConfirmButton>
        <span className="muted">이 브라우저에 저장된 초안 · 배포 · 요청을 지웁니다</span>
      </p>
    </>
  );
}

/** 관리자 › 재검수 대상 SB: 규칙 · 버전 변경의 영향 */
export function Recheck() {
  const { role, act } = usePortal();
  const L = P.recheck();
  const opts = ['재검수 표시', '새 버전 후보', '무시(토큰만)'];
  return (
    <>
      <Head eyebrow="관리자" title="재검수 대상 SB" lead="기존 것을 고치거나 지운 변경(MAJOR)과 Figma · UX 패턴 가이드 변경 감지 중 이미 만든 Storyboard에 영향이 있는 것입니다. 컨펌된 SB에는 그때의 DS 버전이 기록되어 있어(스냅샷), 그보다 새 MAJOR 변경이 있으면 재검수 대상이 됩니다." />
      <h2 id="list">대상</h2>
      <Table
        cols={['출처', '버전 · 시점', '대상', '변경', '영향', '처리']}
        rows={L.map((r, k) => (
          <tr key={k}>
            <td className="nw">{r.source}</td>
            <td className="nw mono">
              {r.version} · {String(r.at).slice(0, 16).replace('T', ' ')}
            </td>
            <td>{human(r.target)}</td>
            <td>{r.change}</td>
            <td>{r.impact}</td>
            <td>
              {r.idx === undefined ? (
                <St c="hold" t="재검수 표시" />
              ) : (
                <select aria-label="처리" value={opts.includes(r.action || '') ? r.action : opts[0]} onChange={(e) => act(() => P.handleDetection(role, r.idx!, e.target.value), '처리 방식을 바꿨습니다')}>
                  {opts.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              )}
            </td>
          </tr>
        ))}
      />
    </>
  );
}

/** 관리자 › 권한 확인: SB Studio에서 받은 역할과 메뉴 */
export function Roles() {
  return (
    <>
      <Head eyebrow="관리자" title="권한 확인" lead="역할은 BSS SB Studio 계정에서 정해지고, 포털은 받은 역할에 따라 메뉴와 편집 칸을 다르게 보여 줍니다. POC에서는 오른쪽 위에서 역할을 고릅니다." />
      <Table
        cols={['역할', '작업 메뉴', '하는 일', '배포']}
        rows={[
          ['보기', 'Workboard', '문서 읽기 · Workboard 요청', '-'],
          ['UX 담당자', 'UX 편집: 기준 편집 · 배포 요청', 'UX 가이드라인 · 모듈 정의 · UX 규칙 · 컴포넌트 사용 가이드 · 업무 블록 설명 · 놓이는 슬롯', '배포 요청'],
          ['DS 담당자', 'DS 작업: 디자인 요청 · 소스 변환 · 배포 요청', 'UI 규칙 · Foundations(토큰) · 컴포넌트 · 블록 모양(Figma) · 소스 변환 · 디자인 요청 · 디자인 검수', '배포 요청'],
          ['관리자', '관리자: 운영 서버 배포 · 재검수 대상 SB · 권한 확인', '운영 서버 배포(정기 · 수동) · 롤백 · 재검수 대상 SB · 권한 확인', '운영 서버 배포'],
        ].map((r) => (
          <tr key={r[0]}>
            <td>
              <b>{r[0]}</b>
            </td>
            <td>{r[1]}</td>
            <td>{r[2]}</td>
            <td>{r[3]}</td>
          </tr>
        ))}
      />
      <p className="note">미리보기 확인은 작업한 담당자가 하고, 운영 서버 배포와 롤백은 관리자가 합니다.</p>
    </>
  );
}
