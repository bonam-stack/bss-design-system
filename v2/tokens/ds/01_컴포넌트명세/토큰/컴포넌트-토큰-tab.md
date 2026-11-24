# 컴포넌트 토큰: tab

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| tab-underline | 7242:851 |
| tab-contained | 7242:963 |
| tab-anchor | 7242:1051 |

## 사이즈별 값

> 컴포넌트 사이즈 단어(xlarge·medium …)와 Semantic 단계 단어(`radius-medium`, `size-icon-small` …)는 서로 다른 척도다. 값은 이름으로 짐작하지 말고 이 표나 토큰 목록에서 확인한다. 칸마다 최종 값과 거친 Semantic(없으면 Primitive 직접 참조)을 적었다.

### tab-underline

| 사이즈 | `size-height` | `label-font` |
| --- | --- | --- |
| medium | 40px (Primitive) | 14px/20px 600 `font-label-14-600` |
| large | 56px (Primitive) | 18px/26px 700 `font-label-18-700` |

## 글자 스타일

> 컴포넌트 글자에는 Component 토큰이 없다. 피그마는 글자 레이어에 텍스트 스타일을, 코드는 Semantic 글자 변수를 그대로 쓴다. `+ tabular-nums`가 붙은 대상은 숫자 폭을 고정한다(코드 `font-variant-numeric: tabular-nums`, 피그마 `label/[크기]/tabular/[굵기]` 스타일).

| 대상 키 | 대상 | 글자 스타일 | 피그마 텍스트 스타일 | 값 (크기/줄 높이 굵기 자간) | 피그마 근거 |
| --- | --- | --- | --- | --- | --- |
| `tab-underline-medium-label` | 중간 밑줄형 tab(medium) 라벨 | `font-label-14-600` | `label/14/600` | 14px/20px 600 -0.2px | 7242:851 size=medium (모든 selection·state): text style label/14/600 |
| `tab-underline-large-label` | 큰 밑줄형 tab(large) 라벨 | `font-label-18-700` | `label/18/700` | 18px/26px 700 -0.2px | 7242:851 size=large (모든 selection·state): text style label/18/700 |
| `tab-contained-label` | tab-contained(상자형 탭) 라벨 | `font-label-16-600` | `label/16/600` | 16px/24px 600 -0.2px | 7242:963 (모든 position·selection·state): text style label/16/600 |
| `tab-anchor-label` | tab-anchor 라벨 | `font-label-15-600` | `label/15/600` | 15px/24px 600 -0.2px | 7242:1051 (모든 selection·state): text style label/15/600 |

## 토큰 (31개: confirmed 31)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `tab-label-color-fg-default` | `--tab-label-color-fg-default` | 선택되지 않은 탭 라벨의 기본 상태 글자 색으로, 세 탭(tab-underline·tab-contained·tab-anchor)의 선택 안 된 항목에 함께 쓰며, 선택된 탭 라벨은 tab-selected-label-color-fg-*를 쓴다. | #697582 | color-fg-neutral-muted-default → color-gray-600 | confirmed | O | 7242:851 selection=unselected, state=default (모든 size): #697582<br>7242:963 selection=unselected, state=default (모든 position): #697582<br>7242:1051 selection=unselected, state=default: #697582 |  |
| `tab-label-color-fg-hover` | `--tab-label-color-fg-hover` | 선택되지 않은 탭 라벨의 hover 상태 글자 색으로, 세 탭(tab-underline·tab-contained·tab-anchor)의 선택 안 된 항목에 함께 쓰며, 선택된 탭 라벨은 tab-selected-label-color-fg-*를 쓴다. | #454F59 | color-fg-neutral-muted-hover → color-gray-700 | confirmed | O | 7242:851 selection=unselected, state=hover (모든 size): #454F59<br>7242:963 selection=unselected, state=hover (모든 position): #454F59<br>7242:1051 selection=unselected, state=hover: #454F59 |  |
| `tab-label-color-fg-pressed` | `--tab-label-color-fg-pressed` | 선택되지 않은 탭 라벨의 pressed 상태 글자 색으로, 세 탭(tab-underline·tab-contained·tab-anchor)의 선택 안 된 항목에 함께 쓰며, 선택된 탭 라벨은 tab-selected-label-color-fg-*를 쓴다. | #303942 | color-fg-neutral-muted-pressed → color-gray-800 | confirmed | O | 7242:851 selection=unselected, state=pressed (모든 size): #303942<br>7242:963 selection=unselected, state=pressed (모든 position): #303942<br>7242:1051 selection=unselected, state=pressed: #303942 |  |
| `tab-label-color-fg-disabled` | `--tab-label-color-fg-disabled` | 선택되지 않은 탭 라벨의 비활성 상태 글자 색으로, 세 탭(tab-underline·tab-contained·tab-anchor)의 선택 안 된 항목에 함께 쓰며, 선택된 탭 라벨은 tab-selected-label-color-fg-*를 쓴다. | #B3B9C0 | color-fg-neutral-disabled → color-gray-400 | confirmed | O | 7242:851 selection=unselected, state=disabled (모든 size): #B3B9C0<br>7242:963 selection=unselected, state=disabled (모든 position): #B3B9C0<br>7242:1051 selection=unselected, state=disabled: #B3B9C0 |  |
| `tab-selected-label-color-fg-default` | `--tab-selected-label-color-fg-default` | 선택된 탭 라벨의 기본 상태 글자 색(브랜드)으로, 세 탭의 [aria-selected=true] 항목에 함께 쓰며, 선택 안 된 라벨은 tab-label-color-fg-*를 쓴다. | #3617CE | color-fg-brand-strong-default → color-tBlue-600 | confirmed | O | 7242:851 selection=selected, state=default (모든 size): #3617CE<br>7242:963 selection=selected, state=default (모든 position): #3617CE<br>7242:1051 selection=selected, state=default: #3617CE |  |
| `tab-selected-label-color-fg-hover` | `--tab-selected-label-color-fg-hover` | 선택된 탭 라벨의 hover 상태 글자 색(브랜드)으로, 세 탭의 [aria-selected=true] 항목에 함께 쓰며, 선택 안 된 라벨은 tab-label-color-fg-*를 쓴다. | #2F15B2 | color-fg-brand-strong-hover → color-tBlue-700 | confirmed | O | 7242:851 selection=selected, state=hover (모든 size): #2F15B2<br>7242:963 selection=selected, state=hover (모든 position): #2F15B2<br>7242:1051 selection=selected, state=hover: #2F15B2 |  |
| `tab-selected-label-color-fg-pressed` | `--tab-selected-label-color-fg-pressed` | 선택된 탭 라벨의 pressed 상태 글자 색(브랜드)으로, 세 탭의 [aria-selected=true] 항목에 함께 쓰며, 선택 안 된 라벨은 tab-label-color-fg-*를 쓴다. | #261091 | color-fg-brand-strong-pressed → color-tBlue-800 | confirmed | O | 7242:851 selection=selected, state=pressed (모든 size): #261091<br>7242:963 selection=selected, state=pressed (모든 position): #261091<br>7242:1051 selection=selected, state=pressed: #261091 |  |
| `tab-selected-label-color-fg-disabled` | `--tab-selected-label-color-fg-disabled` | 선택된 탭 라벨의 비활성 상태 글자 색(브랜드)으로, 세 탭의 [aria-selected=true] 항목에 함께 쓰며, 선택 안 된 라벨은 tab-label-color-fg-*를 쓴다. | #6268FF | color-fg-brand-disabled → color-tBlue-400 | confirmed | O | 7242:851 selection=selected, state=disabled (모든 size): #6268FF<br>7242:963 selection=selected, state=disabled (모든 position): #6268FF<br>7242:1051 selection=selected, state=disabled: #6268FF |  |
| `tab-selected-indicator-color-border-default` | `--tab-selected-indicator-color-border-default` | 선택된 tab-underline·tab-anchor 아래 밑줄(선택 표시)의 기본 상태 색으로, 밑줄형 탭에만 쓰며, tab-contained의 선택 테두리는 tab-contained-selected-color-border-*를 쓴다. | #3617CE | color-border-brand-strong-default → color-tBlue-600 | confirmed | O | 7242:851 selection=selected, state=default (모든 size): #3617CE<br>7242:1051 selection=selected, state=default: #3617CE |  |
| `tab-selected-indicator-color-border-hover` | `--tab-selected-indicator-color-border-hover` | 선택된 tab-underline·tab-anchor 아래 밑줄(선택 표시)의 hover 상태 색으로, 밑줄형 탭에만 쓰며, tab-contained의 선택 테두리는 tab-contained-selected-color-border-*를 쓴다. | #2F15B2 | color-border-brand-strong-hover → color-tBlue-700 | confirmed | O | 7242:851 selection=selected, state=hover (모든 size): #2F15B2<br>7242:1051 selection=selected, state=hover: #2F15B2 |  |
| `tab-selected-indicator-color-border-pressed` | `--tab-selected-indicator-color-border-pressed` | 선택된 tab-underline·tab-anchor 아래 밑줄(선택 표시)의 pressed 상태 색으로, 밑줄형 탭에만 쓰며, tab-contained의 선택 테두리는 tab-contained-selected-color-border-*를 쓴다. | #261091 | color-border-brand-strong-pressed → color-tBlue-800 | confirmed | O | 7242:851 selection=selected, state=pressed (모든 size): #261091<br>7242:1051 selection=selected, state=pressed: #261091 |  |
| `tab-selected-indicator-color-border-disabled` | `--tab-selected-indicator-color-border-disabled` | 선택된 tab-underline·tab-anchor 아래 밑줄(선택 표시)의 비활성 상태 색으로, 밑줄형 탭에만 쓰며, tab-contained의 선택 테두리는 tab-contained-selected-color-border-*를 쓴다. | #B4B7FF | color-border-brand-disabled → color-tBlue-200 | confirmed | O | 7242:851 selection=selected, state=disabled (모든 size): #B4B7FF<br>7242:1051 selection=selected, state=disabled: #B4B7FF |  |
| `tab-underline-medium-size-height` | `--tab-underline-medium-size-height` | 중간 밑줄형 tab(medium) 항목의 높이(40px)로, tab medium에만 쓰며 컨트롤 높이(size-control-*)가 아니다. | 40px | size-40 | confirmed | O | 7242:851 size=medium (모든 selection·state): 40 |  |
| `tab-underline-large-size-height` | `--tab-underline-large-size-height` | 큰 밑줄형 tab(large) 항목의 높이(56px)로, tab large에만 쓰며 컨트롤 높이(size-control-*)가 아니다. | 56px | size-56 | confirmed | O | 7242:851 size=large (모든 selection·state): 56 |  |
| `tab-underline-space-paddingX` | `--tab-underline-space-padding-x` | 밑줄형 tab 항목의 좌우 안쪽 여백(20px, 모든 사이즈)으로, tab에만 쓴다. | 20px | space-20 | confirmed | O | 7242:851 (모든 size·selection·state): 20 |  |
| `tab-underline-space-gap` | `--tab-underline-space-gap` | 밑줄형 tab 라벨과 개수 배지 사이 간격(4px)으로, tab 안에만 쓴다. | 4px | space-4 | confirmed | O | 7242:851 (모든 size·selection·state): 4 |  |
| `tab-underline-indicator-borderWidth` | `--tab-underline-indicator-border-width` | 선택된 tab 아래 밑줄의 두께(2px)로, 선택 표시에만 쓴다. | 2px | borderWidth-thick → borderWidth-2 | confirmed | O | 7242:851 selection=selected (모든 size·state): 2 |  |
| `tab-contained-selected-color-border-default` | `--tab-contained-selected-color-border-default` | 선택된 tab-contained 상자 테두리(위 2px·좌우 1px)의 기본 상태 색으로, tab-contained에만 쓰며 hover·pressed에서도 바뀌지 않고, 밑줄형 탭 선택 표시는 tab-selected-indicator-color-border-*를 쓴다. | #3617CE | color-border-brand-strong-default → color-tBlue-600 | confirmed | O | 7242:963 selection=selected, state=default (모든 position): #3617CE |  |
| `tab-contained-selected-color-border-hover` | `--tab-contained-selected-color-border-hover` | 선택된 tab-contained 상자 테두리(위 2px·좌우 1px)의 hover 상태 색으로, tab-contained에만 쓰며 hover·pressed에서도 바뀌지 않고, 밑줄형 탭 선택 표시는 tab-selected-indicator-color-border-*를 쓴다. | #3617CE | color-border-brand-strong-default → color-tBlue-600 | confirmed | O | 7242:963 selection=selected, state=hover (모든 position): #3617CE |  |
| `tab-contained-selected-color-border-pressed` | `--tab-contained-selected-color-border-pressed` | 선택된 tab-contained 상자 테두리(위 2px·좌우 1px)의 pressed 상태 색으로, tab-contained에만 쓰며 hover·pressed에서도 바뀌지 않고, 밑줄형 탭 선택 표시는 tab-selected-indicator-color-border-*를 쓴다. | #3617CE | color-border-brand-strong-default → color-tBlue-600 | confirmed | O | 7242:963 selection=selected, state=pressed (모든 position): #3617CE |  |
| `tab-contained-selected-color-border-disabled` | `--tab-contained-selected-color-border-disabled` | 선택된 tab-contained 상자 테두리(위 2px·좌우 1px)의 비활성 상태 색으로, tab-contained에만 쓰며 hover·pressed에서도 바뀌지 않고, 밑줄형 탭 선택 표시는 tab-selected-indicator-color-border-*를 쓴다. | #B4B7FF | color-border-brand-disabled → color-tBlue-200 | confirmed | O | 7242:963 selection=selected, state=disabled (모든 position): #B4B7FF |  |
| `tab-contained-color-border-default` | `--tab-contained-color-border-default` | 선택되지 않은 tab-contained의 위 테두리와 탭 사이 구분선 색(gray 300)으로, 기본·hover·pressed·비활성 모든 상태에 같은 값을 쓰며(상태별 토큰 없음), tab-contained에만 쓰고, 선택된 탭 테두리는 tab-contained-selected-color-border-*를 쓴다. | #C4C9CF | color-border-neutral-strong → color-gray-300 | confirmed | O | 7242:963 selection=unselected, 모든 상태 (모든 position): #C4C9CF |  |
| `tab-contained-color-bg-default` | `--tab-contained-color-bg-default` | tab-contained 항목의 바탕 색(선택·상태와 관계없이 투명)으로, tab-contained에만 쓰며, 탭 위치는 테두리로만 표시한다. | #00000000 | color-bg-transparent → color-transparent | confirmed | O | 7242:963 (모든 position·selection·state): #00000000 |  |
| `tab-contained-size-height` | `--tab-contained-size-height` | tab-contained 항목의 높이(40px)로, tab-contained에만 쓰며 컨트롤 높이(size-control-*)가 아니다. | 40px | size-40 | confirmed | O | 7242:963 (모든 position·selection·state): 40 |  |
| `tab-contained-space-paddingX` | `--tab-contained-space-padding-x` | tab-contained 항목의 좌우 안쪽 여백(20px)으로, tab-contained에만 쓴다. | 20px | space-20 | confirmed | O | 7242:963 (모든 position·selection·state): 20 |  |
| `tab-contained-space-gap` | `--tab-contained-space-gap` | tab-contained 라벨과 개수 배지 사이 간격(4px)으로, tab-contained 항목 안에만 쓰며, 탭과 탭 사이 간격은 0이라 토큰이 없다. | 4px | space-4 | confirmed | O | 7242:963 (모든 position·selection·state): 4 |  |
| `tab-contained-borderWidth` | `--tab-contained-border-width` | tab-contained의 기본 테두리·구분선 두께(1px)로, 선택 안 된 탭 위 테두리·탭 사이 구분선·선택된 탭 좌우 테두리에 쓰며, 선택된 탭 위 테두리는 tab-contained-indicator-borderWidth를 쓴다. | 1px | borderWidth-thin → borderWidth-1 | confirmed | O | 7242:963 (모든 position·selection·state): 1 |  |
| `tab-contained-indicator-borderWidth` | `--tab-contained-indicator-border-width` | 선택된 tab-contained 위 테두리(선택 표시)의 두께(2px)로, 선택된 탭 위쪽에만 쓴다. | 2px | borderWidth-thick → borderWidth-2 | confirmed | O | 7242:963 selection=selected (모든 position·state): 2 |  |
| `tab-anchor-size-height` | `--tab-anchor-size-height` | tab-anchor(페이지 안 위치 이동 탭) 항목의 높이(52px)로, tab-anchor에만 쓰며 컨트롤 높이(size-control-*)가 아니다. | 52px | size-52 | confirmed | O | 7242:1051 (모든 selection·state): 52 |  |
| `tab-anchor-indicator-borderWidth` | `--tab-anchor-indicator-border-width` | 선택된 tab-anchor 아래 밑줄의 두께(3px)로, 선택 표시에만 쓴다. | 3px | borderWidth-3 | confirmed | O | 7242:1051 selection=selected (모든 state): 3 |  |
| `tab-anchor-group-space-gap` | `--tab-anchor-group-space-gap` | tab-anchor 묶음에서 탭과 탭 사이 간격(24px)으로, tab-anchor 목록에만 쓰며, 항목 안 좌우 여백은 0이라 토큰이 없다. | 24px | space-24 | confirmed | O | 7242:1095 type=anchor: 24 |  |

## 참고

- **source**: 피그마 Tabs 페이지 통합 세트 Tabs(7242:1095, type=underline·contained·anchor)와 항목 _Item/Tabs/Underline·Contained·Anchor 적용값
- **shared**: 선택 안 된 라벨·선택된 라벨 색은 세 탭이 같아 그룹 공통 토큰(tab-label-*, tab-selected-label-*)으로, 밑줄 색은 tab-underline·tab-anchor가 같아 tab-selected-indicator-*로 둔다. tab-contained 선택 테두리는 hover·pressed에서 바뀌지 않아 따로 뒀다
- **focusRing**: 탭 항목은 모서리가 0이라 포커스 링 모서리는 유틸리티 focusRing-radius(4)를 쓴다. 적용값 4 확인
- **countBadge**: 탭 안 개수 배지(Badge type=count, small 16)는 badge-counter 토큰을 쓴다
- **position**: tab-contained의 position=left·right는 테두리 위치만 다르다(오른쪽 끝 탭은 오른쪽 테두리 추가). 색·두께 토큰은 같다
- **containerGap**: 탭 목록(Tabs type=underline·contained·anchor)의 항목 사이 간격은 tab-anchor-group-space-gap을 쓴다. 밑줄형·상자형은 간격 0이라 토큰이 없다
