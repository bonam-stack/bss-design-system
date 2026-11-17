// 모든 변형을 React 컴포넌트와 Figma 원본으로 나란히 그린다 (#compare-<key>). DS 담당자이 코드를 고친 뒤 확인하는 화면.
import { Component as ReactComponent } from 'react';
import type { ReactNode } from 'react';
import type { SiteComponent } from '../data';
import * as P from '../portal/store';
import { FigmaView } from '../../ds/figma/FigmaView';
import { defaultValues } from '../../ds/figma/variants';
import { compile } from '../live';
import { Head } from '../ui';

class Boundary extends ReactComponent<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(e: Error) {
    return { error: e.message };
  }
  render() {
    return this.state.error ? <span className="error">{this.state.error}</span> : this.props.children;
  }
}

export function ComparePage({ sc }: { sc: SiteComponent }) {
  const c = sc.data;
  const published = P.publishedCode(c.key);
  const C = (published && compile(sc.name, published).Component) || sc.Component;
  const values = defaultValues(c);
  const bools = Object.fromEntries(c.props.filter((p) => p.type === 'boolean').map((p) => [p.name, values[p.figmaName]]));
  const meta = C?.meta || { texts: {} };
  // value는 비워 두고(제어 컴포넌트가 되지 않게) 상태별 예시 값(sample)을 처음 값으로 넣는다
  const texts = Object.fromEntries(Object.entries(meta.texts).filter(([k]) => k !== 'value'));
  const code = P.itemByKey(c.key)?.code || `c-${c.key}`;
  return (
    <>
      <Head eyebrow="Components" title={`${c.name} · Figma 비교`} lead={`변형 ${c.variants.length}개를 React 컴포넌트(왼쪽)와 Figma 원본(오른쪽)으로 나란히 그립니다.${published ? ' 포털에 게시된 코드로 그렸습니다.' : ''}`} extra={<p><a className="lnk" href={`#${code}`}>← {c.name} 문서로</a></p>} />
      <div className="cmp">
        {c.variants.map((v) => {
          const sample = v.props.state ? meta.samples?.[v.props.state] : undefined;
          return (
            <div key={v.key} className="cmp-row" data-variant={JSON.stringify(v.props)}>
              <span className="cmp-name">{Object.values(v.props).join(' · ')}</span>
              <span className="cmp-cell" data-side="react" {...{ inert: '' }}>
                <Boundary>{C ? <C {...v.props} {...bools} {...texts} {...sample} /> : null}</Boundary>
              </span>
              <span className="cmp-cell" data-side="figma" {...{ inert: '' }}>
                <FigmaView data={c} icons={sc.icons} selection={v.props} values={values} />
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
