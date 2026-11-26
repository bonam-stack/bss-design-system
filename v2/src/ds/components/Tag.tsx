// Tag: 콘텐츠의 구분값(분류)이나 속성 키워드를 짧게 표시한다. type 2종(basic · keyword) × appearance × tone 5종.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Tag › Tag (3085:30771) · type 2 × appearance 2(basic은 filled만) × tone 5, label
// 토큰: DS 컴포넌트 명세 tag-basic · tag-keyword
import type { HTMLAttributes } from 'react';
import { textStyle, tok } from '../shared';

export type TagTone = 'highlight' | 'info' | 'success' | 'danger' | 'neutral';

export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** basic 회색 바탕 구분값 · keyword 테두리 있는 탐색용 키워드 */
  type?: 'basic' | 'keyword';
  /** filled 바탕 채움 · outlined 바탕 없음 (keyword만, basic은 늘 filled) */
  appearance?: 'filled' | 'outlined';
  tone?: TagTone;
  label?: string;
}

export function Tag({ type = 'basic', appearance = 'filled', tone = 'highlight', label = 'Tag', style, ...rest }: TagProps) {
  const keyword = type === 'keyword';
  return (
    <span
      {...rest}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxSizing: 'border-box',
        whiteSpace: 'nowrap',
        verticalAlign: 'middle',
        height: tok(keyword ? 'tag-keyword-size-height' : 'tag-basic-size-height'),
        padding: `0 ${tok(keyword ? 'tag-keyword-space-padding-x' : 'tag-basic-space-padding-x')}`,
        borderRadius: tok(keyword ? 'tag-keyword-radius' : 'tag-basic-radius'),
        background: keyword ? tok(appearance === 'outlined' ? 'tag-keyword-outlined-color-bg-default' : 'tag-keyword-filled-color-bg-default') : tok('tag-basic-color-bg-default'),
        boxShadow: keyword ? `inset 0 0 0 ${tok('tag-keyword-border-width')} ${tok('tag-keyword-color-border-default')}` : undefined,
        color: tok(`tag-${type}-${tone}-color-fg-default`),
        ...textStyle('font-label-12-600'),
        ...style,
      }}
    >
      {label}
    </span>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
Tag.meta = { texts: { label: 'Tag' } };
