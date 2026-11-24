# 컴포넌트 토큰: accordion

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| accordion-basic | 8544:2786 |
| accordion-basic (머리 항목 _Item/Accordion/Header) | 9843:1138 |
| accordion-compact | 8544:2786 |
| accordion-compact (머리 항목 _Item/Accordion/Header) | 9843:1138 |
| accordion-text | 8544:2786 |
| accordion-text (머리 항목 _Item/Accordion/Header) | 9843:1138 |

## 사이즈별 값

> 컴포넌트 사이즈 단어(xlarge·medium …)와 Semantic 단계 단어(`radius-medium`, `size-icon-small` …)는 서로 다른 척도다. 값은 이름으로 짐작하지 말고 이 표나 토큰 목록에서 확인한다. 칸마다 최종 값과 거친 Semantic(없으면 Primitive 직접 참조)을 적었다.

### accordion-basic

| 사이즈 | `size-height` | `space-paddingX` | `content-space-paddingBottom` | `icon-size` | `title-font` |
| --- | --- | --- | --- | --- | --- |
| medium | 52px (Primitive) | 20px (Primitive) | 32px (Primitive) | 16px `size-icon-medium` | 14px/20px 700 `font-title-14-700` |
| large | 64px (Primitive) | 24px (Primitive) | 40px (Primitive) | 20px `size-icon-large` | 16px/24px 700 `font-title-16-700` |

## 글자 스타일

> 컴포넌트 글자에는 Component 토큰이 없다. 피그마는 글자 레이어에 텍스트 스타일을, 코드는 Semantic 글자 변수를 그대로 쓴다. `+ tabular-nums`가 붙은 대상은 숫자 폭을 고정한다(코드 `font-variant-numeric: tabular-nums`, 피그마 `label/[크기]/tabular/[굵기]` 스타일).

| 대상 키 | 대상 | 글자 스타일 | 피그마 텍스트 스타일 | 값 (크기/줄 높이 굵기 자간) | 피그마 근거 |
| --- | --- | --- | --- | --- | --- |
| `accordion-basic-medium-title` | 중간 기본 아코디언(basic medium) 제목 | `font-title-14-700` | `title/14/700` | 14px/20px 700 -0.2px | 9843:1138 type=basic, size=medium (모든 listState·state), title: text style title/14/700 |
| `accordion-basic-large-title` | 큰 기본 아코디언(basic large) 제목 | `font-title-16-700` | `title/16/700` | 16px/24px 700 -0.2px | 9843:1138 type=basic, size=large (모든 listState·state), title: text style title/16/700 |
| `accordion-compact-title` | 좁은 아코디언(compact) 제목 | `font-label-14-600` | `label/14/600` | 14px/20px 600 -0.2px | 9843:1138 type=compact (모든 listState·state), title: text style label/14/600 |
| `accordion-text-title` | 글자형 아코디언(accordion-text) 제목 | `font-label-14-400` | `label/14/400` | 14px/20px 400 -0.2px | 9843:1138 type=text (모든 listState·state), title: text style label/14/400 |

## 토큰 (33개: confirmed 33)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `accordion-color-bg-default` | `--accordion-color-bg-default` | 아코디언 전체 바탕 색으로, accordion-basic·accordion-compact에 쓰며, 바탕이 없는 글자형 accordion-text에는 쓰지 않는다. | #FFFFFF | color-bg-base → color-white | confirmed | O | 8544:2786 type=basic·compact (모든 size·listState): #FFFFFF |  |
| `accordion-color-border-default` | `--accordion-color-border-default` | 아코디언 아래 구분선 색으로, accordion-basic·accordion-compact의 아래 테두리에만 쓴다. | #E8ECEF | color-border-neutral-faint → color-gray-100 | confirmed | O | 8544:2786 type=basic·compact (모든 size·listState), 아래 테두리: #E8ECEF |  |
| `accordion-borderWidth` | `--accordion-border-width` | 아코디언 아래 구분선 두께(1px)로, accordion-basic·accordion-compact의 아래 테두리에만 쓴다. | 1px | borderWidth-thin → borderWidth-1 | confirmed | O | 8544:2786 type=basic·compact (모든 size·listState), 아래 테두리: 1 |  |
| `accordion-header-color-bg-default` | `--accordion-header-color-bg-default` | 아코디언 머리(제목 줄)의 기본 상태 바탕 색으로, accordion-basic·accordion-compact 머리에 쓰며, 글자형 accordion-text는 바탕을 두지 않는다. | #00000000 | color-bg-transparent → color-transparent | confirmed | O | 9843:1138 type=basic·compact, state=default (모든 size·listState): #00000000 | ACC-01 |
| `accordion-header-color-bg-hover` | `--accordion-header-color-bg-hover` | 아코디언 머리(제목 줄)의 hover 상태 바탕 색으로, accordion-basic·accordion-compact 머리에 쓰며, 글자형 accordion-text는 바탕을 두지 않는다. | #F8F9FB | color-bg-neutral-faint → color-gray-50 | confirmed | O | 9843:1138 type=basic·compact, state=hover (모든 size·listState): #F8F9FB |  |
| `accordion-header-color-bg-pressed` | `--accordion-header-color-bg-pressed` | 아코디언 머리(제목 줄)의 pressed 상태 바탕 색으로, accordion-basic·accordion-compact 머리에 쓰며, 글자형 accordion-text는 바탕을 두지 않는다. | #F1F3F5 | color-bg-neutral-muted → color-gray-80 | confirmed | O | 9843:1138 type=basic·compact, state=pressed (모든 size·listState): #F1F3F5 |  |
| `accordion-header-color-bg-disabled` | `--accordion-header-color-bg-disabled` | 아코디언 머리(제목 줄)의 disabled 상태 바탕 색으로, accordion-basic·accordion-compact 머리에 쓰며, 글자형 accordion-text는 바탕을 두지 않는다. | #00000000 | color-bg-transparent → color-transparent | confirmed | O | 9843:1138 type=basic·compact, state=disabled (모든 size·listState): #00000000 | ACC-03 |
| `accordion-header-color-fg-default` | `--accordion-header-color-fg-default` | 아코디언 머리 제목·펼침 아이콘의 기본 상태 색으로, accordion-basic·accordion-compact 머리에 쓰며, 글자형은 accordion-text-header-color-fg-*를 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 9843:1138 type=basic·compact, state=default (모든 size·listState), title·IconSlot: #1C1F23 |  |
| `accordion-header-color-fg-hover` | `--accordion-header-color-fg-hover` | 아코디언 머리 제목·펼침 아이콘의 hover 상태 색으로, accordion-basic·accordion-compact 머리에 쓰며, 글자형은 accordion-text-header-color-fg-*를 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 9843:1138 type=basic·compact, state=hover (모든 size·listState), title·IconSlot: #1C1F23 |  |
| `accordion-header-color-fg-pressed` | `--accordion-header-color-fg-pressed` | 아코디언 머리 제목·펼침 아이콘의 pressed 상태 색으로, accordion-basic·accordion-compact 머리에 쓰며, 글자형은 accordion-text-header-color-fg-*를 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 9843:1138 type=basic·compact, state=pressed (모든 size·listState), title·IconSlot: #1C1F23 |  |
| `accordion-header-color-fg-disabled` | `--accordion-header-color-fg-disabled` | 아코디언 머리 제목·펼침 아이콘의 disabled 상태 색으로, accordion-basic·accordion-compact 머리에 쓰며, 글자형은 accordion-text-header-color-fg-*를 쓴다. | #B3B9C0 | color-fg-neutral-disabled → color-gray-400 | confirmed | O | 9843:1138 type=basic·compact, state=disabled (모든 size·listState), title·IconSlot: #B3B9C0 |  |
| `accordion-title-space-gap` | `--accordion-title-space-gap` | 아코디언 머리 제목과 배지(showBadge) 사이 간격(8px)으로, 세 아코디언(basic·compact·text) 머리에 함께 쓰며, 배지 자체는 badge-basic 토큰을 쓴다. | 8px | space-8 | confirmed | O | 9843:1138 (모든 type·size·listState·state), titleBox(title·Badge): 8 |  |
| `accordion-basic-medium-size-height` | `--accordion-basic-medium-size-height` | 중간 기본 아코디언(basic medium) 머리 줄의 높이(52px)로, accordion-basic medium에만 쓴다. | 52px | size-52 | confirmed | O | 8544:2786 type=basic, size=medium (모든 listState), headerGroup: 52 |  |
| `accordion-basic-medium-space-paddingX` | `--accordion-basic-medium-space-padding-x` | 중간 기본 아코디언(basic medium) 머리·내용의 좌우 안쪽 여백(20px)으로, accordion-basic medium에만 쓴다. | 20px | space-20 | confirmed | O | 8544:2786 type=basic, size=medium (모든 listState), headerGroup·contentsGroup: 20 |  |
| `accordion-basic-medium-content-space-paddingBottom` | `--accordion-basic-medium-content-space-padding-bottom` | 중간 기본 아코디언(basic medium)을 펼쳤을 때 내용 아래 여백(32px)으로, accordion-basic medium의 내용 영역에만 쓴다. | 32px | space-32 | confirmed | O | 8544:2786 type=basic, size=medium, listState=expanded, contentsGroup: 32 |  |
| `accordion-basic-medium-icon-size` | `--accordion-basic-medium-icon-size` | 중간 기본 아코디언(basic medium) 머리 펼침 아이콘(꺾쇠)의 크기(16px)로, accordion-basic medium에만 쓴다. | 16px | size-icon-medium → size-16 | confirmed | O | 9843:1138 type=basic, size=medium (모든 listState·state), IconSlot: 16 |  |
| `accordion-basic-large-size-height` | `--accordion-basic-large-size-height` | 큰 기본 아코디언(basic large) 머리 줄의 높이(64px)로, accordion-basic large에만 쓴다. | 64px | size-64 | confirmed | O | 8544:2786 type=basic, size=large (모든 listState), headerGroup: 64 |  |
| `accordion-basic-large-space-paddingX` | `--accordion-basic-large-space-padding-x` | 큰 기본 아코디언(basic large) 머리·내용의 좌우 안쪽 여백(24px)으로, accordion-basic large에만 쓴다. | 24px | space-24 | confirmed | O | 8544:2786 type=basic, size=large (모든 listState), headerGroup·contentsGroup: 24 |  |
| `accordion-basic-large-content-space-paddingBottom` | `--accordion-basic-large-content-space-padding-bottom` | 큰 기본 아코디언(basic large)을 펼쳤을 때 내용 아래 여백(40px)으로, accordion-basic large의 내용 영역에만 쓴다. | 40px | space-40 | confirmed | O | 8544:2786 type=basic, size=large, listState=expanded, contentsGroup: 40 |  |
| `accordion-basic-large-icon-size` | `--accordion-basic-large-icon-size` | 큰 기본 아코디언(basic large) 머리 펼침 아이콘(꺾쇠)의 크기(20px)로, accordion-basic large에만 쓴다. | 20px | size-icon-large → size-20 | confirmed | O | 9843:1138 type=basic, size=large (모든 listState·state), IconSlot: 20 |  |
| `accordion-basic-space-gap` | `--accordion-basic-space-gap` | 기본 아코디언(basic)을 펼쳤을 때 머리와 내용 사이 간격(12px, 모든 사이즈)으로, accordion-basic에만 쓴다. | 12px | space-12 | confirmed | O | 8544:2786 type=basic, listState=expanded (모든 size): 12 |  |
| `accordion-basic-header-space-gap` | `--accordion-basic-header-space-gap` | 기본 아코디언(basic) 머리의 제목과 펼침 아이콘 사이 최소 간격(24px, 모든 사이즈)으로, accordion-basic 머리에만 쓴다. | 24px | space-24 | confirmed | O | 9843:1138 type=basic (모든 size·listState·state): 24 |  |
| `accordion-compact-size-height` | `--accordion-compact-size-height` | 좁은 아코디언(compact) 머리 줄의 높이(48px)로, accordion-compact에만 쓴다. | 48px | size-48 | confirmed | O | 8544:2786 type=compact (모든 listState), headerGroup: 48 | ACC-02 |
| `accordion-compact-space-gap` | `--accordion-compact-space-gap` | 좁은 아코디언(compact)을 펼쳤을 때 머리와 내용 사이 간격(4px)으로, accordion-compact에만 쓴다. | 4px | space-4 | confirmed | O | 8544:2786 type=compact, listState=expanded: 4 |  |
| `accordion-compact-header-space-gap` | `--accordion-compact-header-space-gap` | 좁은 아코디언(compact) 머리의 제목과 펼침 아이콘 사이 최소 간격(8px)으로, accordion-compact 머리에만 쓴다. | 8px | space-8 | confirmed | O | 9843:1138 type=compact (모든 listState·state): 8 |  |
| `accordion-compact-content-space-paddingBottom` | `--accordion-compact-content-space-padding-bottom` | 좁은 아코디언(compact)을 펼쳤을 때 내용 아래 여백(20px)으로, accordion-compact의 내용 영역에만 쓴다. | 20px | space-20 | confirmed | O | 8544:2786 type=compact, listState=expanded, contentsGroup: 20 |  |
| `accordion-compact-icon-size` | `--accordion-compact-icon-size` | 좁은 아코디언(compact) 머리 펼침 아이콘(꺾쇠)의 크기(16px)로, accordion-compact에만 쓴다. | 16px | size-icon-medium → size-16 | confirmed | O | 9843:1138 type=compact (모든 listState·state), IconSlot: 16 |  |
| `accordion-text-header-color-fg-default` | `--accordion-text-header-color-fg-default` | 글자형 아코디언(accordion-text) 제목·펼침 아이콘의 기본 상태 색으로, accordion-text에만 쓰며, 바탕이 있는 아코디언 머리는 accordion-header-color-fg-*를 쓴다. | #454F59 | color-fg-neutral-strong-default → color-gray-700 | confirmed | O | 9843:1138 type=text, state=default (모든 listState), title·IconSlot: #454F59 | ACC-04 |
| `accordion-text-header-color-fg-hover` | `--accordion-text-header-color-fg-hover` | 글자형 아코디언(accordion-text) 제목·펼침 아이콘의 hover 상태 색으로, accordion-text에만 쓰며, 바탕이 있는 아코디언 머리는 accordion-header-color-fg-*를 쓴다. | #303942 | color-fg-neutral-strong-hover → color-gray-800 | confirmed | O | 9843:1138 type=text, state=hover (모든 listState), title·IconSlot: #303942 |  |
| `accordion-text-header-color-fg-pressed` | `--accordion-text-header-color-fg-pressed` | 글자형 아코디언(accordion-text) 제목·펼침 아이콘의 pressed 상태 색으로, accordion-text에만 쓰며, 바탕이 있는 아코디언 머리는 accordion-header-color-fg-*를 쓴다. | #1C1F23 | color-fg-neutral-strong-pressed → color-gray-900 | confirmed | O | 9843:1138 type=text, state=pressed (모든 listState), title·IconSlot: #1C1F23 |  |
| `accordion-text-header-color-fg-disabled` | `--accordion-text-header-color-fg-disabled` | 글자형 아코디언(accordion-text) 제목·펼침 아이콘의 disabled 상태 색으로, accordion-text에만 쓰며, 바탕이 있는 아코디언 머리는 accordion-header-color-fg-*를 쓴다. | #B3B9C0 | color-fg-neutral-disabled → color-gray-400 | confirmed | O | 9843:1138 type=text, state=disabled (모든 listState), title·IconSlot: #B3B9C0 |  |
| `accordion-text-header-space-gap` | `--accordion-text-header-space-gap` | 글자형 아코디언(accordion-text)의 제목과 펼침 아이콘 사이 간격(6px)으로, accordion-text에만 쓴다. | 6px | space-6 | confirmed | O | 9843:1138 type=text (모든 listState·state): 6 |  |
| `accordion-text-icon-size` | `--accordion-text-icon-size` | 글자형 아코디언(accordion-text) 펼침 아이콘(꺾쇠)의 크기(16px)로, accordion-text에만 쓴다. | 16px | size-icon-medium → size-16 | confirmed | O | 9843:1138 type=text (모든 listState·state), IconSlot: 16 |  |

## 참고

- **source**: 피그마 ❖ Accordion 페이지 Accordion(8544:2786)과 머리 항목 _Item/Accordion/Header(9843:1138) 적용값(디자이너 수정 반영본)
- **shared**: basic·compact는 전체 바탕·아래 구분선·머리 바탕·머리 글자 색이 같아 그룹 공통 토큰(accordion-color-*, accordion-header-color-*, 제목–배지 간격 accordion-title-space-gap)으로 둔다. accordion-text는 바탕·구분선 없이 글자 색만 회색 버튼처럼 700/800/900/400이라 accordion-text-header-color-fg-*로 둔다
- **states**: 머리 바탕은 기본·비활성 투명, hover gray 50, pressed gray 80이다. 상태 세트 규칙에 따라 기본·비활성에도 투명 바탕 토큰을 둔다. accordion-text는 바탕이 바뀌는 상태가 없어 바탕 토큰을 두지 않는다
- **listState**: listState(collapsed·expanded)는 꺾쇠 아이콘 방향(ChevronDown·ChevronUp)과 내용 영역 표시만 바뀌고 색·치수 값은 같아 변형 토큰을 두지 않는다
- **content**: 펼친 내용 영역(content 슬롯)은 다른 컴포넌트를 넣는 자리라 내용 자체의 토큰은 없다. 피그마의 _ContentPlaceholder(tGray 80 바탕, gray 600 글자)는 자리표시라 토큰을 만들지 않았다
- **nested**: 머리 배지는 Badge(type=basic, color=brand, emphasis=strong, indicator=new)로 badge-basic 토큰을 쓴다. 포커스 링(showFocus)은 focusRing 토큰을 쓴다
