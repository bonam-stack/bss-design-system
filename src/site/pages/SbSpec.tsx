// 거버넌스 › SB Studio 연동 규격: 포털이 SB Studio에 주는 기준 데이터의 종류 · 코드 체계 · 필드 · 검증 규칙 · 버전 약속.
// API는 SB Studio가 만든다. 이 페이지는 무엇을 어떤 코드로 주는지의 약속이고, 개수 · 예시는 데이터에서 자동으로 채운다.
import type { ReactNode } from 'react';
import * as P from '../portal/store';
import { Head, St, Table } from '../ui';
import { components } from '../data';
import { glossary, guideDocs, guideRules } from '../guide';
import variables from '../../../tokens/variables.json';

const TOKENS = (variables as { tokens: Record<string, unknown> }).tokens;
const C = ({ children }: { children: ReactNode }) => <code>{children}</code>;

export function SbSpec() {
  const items = P.items();
  const slots = P.slots();
  const portalRules = P.rules().filter((r) => !r.source);
  const checks = P.checks();
  const ex = (prefix: string) => items.find((i) => i.code.startsWith(prefix))?.code || '-';
  const count = (prefix: string) => items.filter((i) => i.code.startsWith(prefix)).length;
  const tokenNames = Object.keys(TOKENS);
  return (
    <>
      <Head
        eyebrow="거버넌스 · 연동"
        title="SB Studio 연동 규격"
        lead="SB Studio가 화면을 그릴 때 포털에서 읽어 가는 기준 데이터의 약속입니다. API는 SB Studio가 만들고, 포털은 무엇을 어떤 코드 · 필드로 주는지를 정합니다. 원본은 저장소의 데이터 파일이고, 아래 개수와 예시는 그 데이터에서 자동으로 채웁니다."
      />

      <h2 id="read">읽는 순서</h2>
      <ol className="flow">
        <li>
          <strong>운영 버전만 읽습니다</strong>
          <span>관리자가 배포한 운영 서버 버전(지금 v{P.version()})을 읽고, 만든 SB에 그 버전을 기반 버전으로 기록합니다.</span>
        </li>
        <li>
          <strong>핵심 요약으로 먼저 판단합니다</strong>
          <span>컴포넌트 · 블록마다 무엇 · 쓸 때 · 꼭 지킬 기준을 먼저 보고, 애매할 때만 정책 · 규칙 전체를 봅니다.</span>
        </li>
        <li>
          <strong>슬롯 · 검증 규칙으로 맞는지 확인합니다</strong>
          <span>자리마다 정해진 것만 넣고, 생성 · 미리보기 · 게시 · 독립 검수 때 아래 검증 규칙으로 판정합니다.</span>
        </li>
      </ol>

      <h2 id="data">주는 데이터</h2>
      <Table
        cols={['데이터', '원본', '개수', '쓰는 곳']}
        rows={[
          ['카탈로그 항목 (컴포넌트 · 블록 · 레이아웃)', 'catalog/catalog.json › items', items.length, '화면 조립 · 이름 · 뜻'],
          ['슬롯', 'catalog/catalog.json › slots', slots.length, '자리마다 넣을 수 있는 것'],
          ['블록 부품 연결', 'catalog/catalog.json › parts', P.parts().length, '블록 안 컴포넌트'],
          ['포털 규칙', 'catalog/catalog.json › rules', portalRules.length, '배치 · 동작 · 구성 · 판정 · 표기'],
          ['UX 패턴 가이드 권장 · 금지', 'guides/ux-pattern/structure.json › rules', guideRules.length, '판단 근거 · 검수'],
          ['검증 규칙', 'catalog/catalog.json › checks', checks.length, '생성 · 미리보기 · Figma 검사 · 게시 · 독립 검수'],
          ['UX 패턴 가이드 문서', 'guides/ux-pattern/docs/<문서>.json', guideDocs.length, '패턴 · 모듈 · 컴포넌트 가이드 본문'],
          ['컴포넌트 (Figma · 사용 정책 · React)', 'components/<key>/component.json · guide.json · src/ds/components', components.length, '그리기 · 속성 · 정책'],
          ['디자인 토큰', 'tokens/variables.json', tokenNames.length, '색 · 글자 · 크기 · 여백'],
          ['용어사전', 'guides/ux-pattern/glossary.json', glossary.length, '용어 대조'],
          ['핵심 요약', '컴포넌트 · 블록 페이지 맨 위 (src/site/summary.ts가 자동 생성)', items.filter((i) => i.kind !== 'layout').length, '먼저 읽고 빠르게 판단'],
        ].map((r) => (
          <tr key={String(r[0])}>
            <td>{r[0]}</td>
            <td className="mono">{r[1]}</td>
            <td className="mono">{r[2]}</td>
            <td>{r[3]}</td>
          </tr>
        ))}
      />

      <h2 id="codes">코드 체계</h2>
      <p className="note">한 번 붙은 코드는 바꾸지 않습니다. 이름이 바뀌어도 코드는 그대로이고, 지운 코드는 다른 것에 다시 쓰지 않습니다. 코드는 화면에 보이지 않고 데이터에만 있습니다.</p>
      <Table
        cols={['종류', '형식', '예', '개수']}
        rows={[
          ['컴포넌트', <C>c-&lt;이름&gt;</C>, ex('c-'), count('c-')],
          ['블록', <C>b-&lt;이름&gt;</C>, ex('b-'), count('b-')],
          ['레이아웃 규칙', <C>l-&lt;이름&gt;</C>, ex('l-'), count('l-')],
          ['임시 블록 · 컴포넌트', <C>tb-… · tc-…</C>, ex('tb-'), count('tb-') + count('tc-')],
          ['슬롯 경로', <C>&lt;소속 코드&gt;.&lt;자리&gt;</C>, slots[4]?.path || slots[0]?.path, slots.length],
          ['포털 규칙', <C>R-&lt;문서 약어&gt;-&lt;번호&gt;</C>, portalRules[0]?.id, portalRules.length],
          ['가이드 권장 · 금지', <C>&lt;문서&gt;-&lt;번호&gt;</C>, guideRules[0]?.id, guideRules.length],
          ['검증 규칙', <C>R-&lt;번호&gt;</C>, checks[0]?.id, checks.length],
          ['가이드 문서', <C>&lt;문서 id&gt;</C>, guideDocs[0]?.id, guideDocs.length],
          ['디자인 토큰', <C>--&lt;층&gt;-&lt;이름&gt;</C>, tokenNames.find((t) => t.startsWith('--color-bg')) || tokenNames[0], tokenNames.length],
        ].map((r) => (
          <tr key={String(r[0])}>
            <td>{r[0]}</td>
            <td>{r[1]}</td>
            <td className="mono">{r[2]}</td>
            <td className="mono">{r[3]}</td>
          </tr>
        ))}
      />

      <h2 id="fields">필드</h2>
      <Table
        cols={['데이터', '필드']}
        rows={[
          ['카탈로그 항목', 'code · kind(comp · block · layout) · name · status(pub 게시 · draft 초안 · tmp 임시) · meaning · slot(놓이는 슬롯) · key(컴포넌트 데이터) · group(컴포넌트 분류) · policy(블록 정책)'],
          ['슬롯', 'path · owner(소속 코드) · mode(고정 · 쌓기 · 자유) · accepts(넣을 수 있는 코드) · name'],
          ['블록 부품 연결', 'block · slot(블록 안 자리) · comp · required'],
          ['포털 규칙', 'id · doc(근거 문서) · section · kind(배치 · 동작 · 구성 · 판정 · 표기) · text · targets(대상 코드 · 슬롯)'],
          ['가이드 권장 · 금지', 'id · doc · section · kind(권장 · 금지) · text · targets · source'],
          ['검증 규칙', 'id · name · severity(오류 · 경고) · when(판정하는 때) · target · data(판정에 쓰는 데이터) · condition'],
          ['디자인 토큰', 'name(CSS 변수) · figma(변수 경로) · collection(Primitive · Semantic · Component) · type · value · ref(참조 토큰) · description'],
          ['핵심 요약', 'what(무엇) · use(쓸 때) · rules(꼭 지킬 기준 3개) · instead(대신 쓸 것) · dont(하지 않음) · props(속성) · slot · parts'],
        ].map((r) => (
          <tr key={r[0]}>
            <td>{r[0]}</td>
            <td>{r[1]}</td>
          </tr>
        ))}
      />

      <h2 id="checks">검증 규칙</h2>
      <Table
        cols={['코드', '내용', '판정 조건', '판정하는 때', '심각도']}
        rows={checks.map((r) => (
          <tr key={r.id}>
            <td className="mono">{r.id}</td>
            <td>{r.name}</td>
            <td>{r.condition}</td>
            <td>{r.when.join(' · ')}</td>
            <td>
              <St c={r.severity === '오류' ? 'ng' : 'hold'} t={r.severity} />
            </td>
          </tr>
        ))}
      />

      <h2 id="version">버전</h2>
      <Table
        cols={['올림', '언제', 'SB Studio가 할 일']}
        rows={[
          ['MAJOR', '기존 것을 바꾸거나 지움 (규칙 수정 · 삭제, 슬롯 · 상태 변경, 속성 정의 변경)', '이 버전보다 오래된 기반 버전의 SB는 재검수 대상'],
          ['MINOR', '새로 더함 (컴포넌트 · 블록 · 규칙 추가, 변형 추가)', '새 기준을 쓸 수 있음 · 기존 SB는 그대로'],
          ['PATCH', '글 · 설명 수정, 코드 내부 수정', '영향 없음'],
        ].map((r) => (
          <tr key={r[0]}>
            <td className="mono">{r[0]}</td>
            <td>{r[1]}</td>
            <td>{r[2]}</td>
          </tr>
        ))}
      />
    </>
  );
}
