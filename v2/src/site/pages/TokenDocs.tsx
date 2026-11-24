// Foundations › 디자인 토큰: DS 토큰 전달본에 함께 온 문서(개발 가이드 · 변경 이력)를 그대로 보여 준다. 전달본은 직접 고치지 않는다.
import { Marked } from 'marked';
import { Head } from '../ui';
import guide from '../../../tokens/ds/00_개발-가이드.md?raw';
import changelog from '../../../tokens/ds/02_CHANGELOG.md?raw';
import variables from '../../../tokens/variables.json';

const md = new Marked({ gfm: true });
const V = variables as { source: { name: string; version?: string } };

export function TokenDoc({ which }: { which: 'guide' | 'changelog' }) {
  const text = which === 'guide' ? guide : changelog;
  // 첫 # 제목은 페이지 제목으로 쓰고 본문에서 뺀다
  const body = text.replace(/^#\s+.*\n/, '');
  return (
    <>
      <Head
        eyebrow="Foundations · 디자인 토큰"
        title={which === 'guide' ? '토큰 개발 가이드' : '토큰 변경 이력'}
        lead={which === 'guide' ? '토큰 파일을 받는 개발자를 위한 안내입니다. 받는 파일 · 이름 규칙 · 적용 방법을 정리했습니다.' : '토큰 전달본마다 직전 전달본과 비교한 변경 내역입니다. 「삭제」「운영 출력 변경」은 코드 수정이 필요한 항목입니다.'}
        extra={<p className="gd-source">출처 {V.source.name} 전달본 · DS가 관리하는 원본에서 생성 (포털에서 고치지 않음)</p>}
      />
      <div className="ux-doc" dangerouslySetInnerHTML={{ __html: md.parse(body) as string }} />
    </>
  );
}
