# 컴포넌트 토큰: selectionControl

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| checkbox | 2778:16890 |
| radio | 4971:31497 |

## 사이즈별 값

> 컴포넌트 사이즈 단어(xlarge·medium …)와 Semantic 단계 단어(`radius-medium`, `size-icon-small` …)는 서로 다른 척도다. 값은 이름으로 짐작하지 말고 이 표나 토큰 목록에서 확인한다. 칸마다 최종 값과 거친 Semantic(없으면 Primitive 직접 참조)을 적었다.

### checkbox

| 사이즈 | `size` | `focusRing-radius` | `label-font` |
| --- | --- | --- | --- |
| medium | 16px (Primitive) | 6px (Primitive) | 14px/20px 400 `font-label-14-400` |
| large | 20px (Primitive) | 6px (Primitive) | 16px/24px 500 `font-label-16-500` |

### radio

| 사이즈 | `size` | `dot-size` | `focusRing-radius` | `label-font` |
| --- | --- | --- | --- | --- |
| medium | 16px (Primitive) | 8px (Primitive) | 9999px `radius-full` | 14px/20px 400 `font-label-14-400` |
| large | 20px (Primitive) | 12px (Primitive) | 9999px `radius-full` | 16px/24px 500 `font-label-16-500` |

## 글자 스타일

> 컴포넌트 글자에는 Component 토큰이 없다. 피그마는 글자 레이어에 텍스트 스타일을, 코드는 Semantic 글자 변수를 그대로 쓴다. `+ tabular-nums`가 붙은 대상은 숫자 폭을 고정한다(코드 `font-variant-numeric: tabular-nums`, 피그마 `label/[크기]/tabular/[굵기]` 스타일).

| 대상 키 | 대상 | 글자 스타일 | 피그마 텍스트 스타일 | 값 (크기/줄 높이 굵기 자간) | 피그마 근거 |
| --- | --- | --- | --- | --- | --- |
| `checkbox-medium-label` | 중간 체크박스(medium) 라벨 | `font-label-14-400` | `label/14/400` | 14px/20px 400 -0.2px | 2778:16890 size=medium (모든 선택·상태), label: text style label/14/400 |
| `checkbox-large-label` | 큰 체크박스(large) 라벨 | `font-label-16-500` | `label/16/500` | 16px/24px 500 -0.2px | 2778:16890 size=large (모든 선택·상태), label: text style label/16/500 |
| `radio-medium-label` | 중간 라디오(medium) 라벨 | `font-label-14-400` | `label/14/400` | 14px/20px 400 -0.2px | 4971:31497 size=medium (모든 선택·상태), label: text style label/14/400 |
| `radio-large-label` | 큰 라디오(large) 라벨 | `font-label-16-500` | `label/16/500` | 16px/24px 500 -0.2px | 4971:31497 size=large (모든 선택·상태), label: text style label/16/500 |

## 토큰 (44개: confirmed 44)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `selectionControl-color-bg-default` | `--selection-control-color-bg-default` | 체크되지 않은 체크박스·라디오 상자의 기본 상태 바탕 색으로, 해제 상태 상자에만 쓰며, 체크된 상자는 checkbox-checked·radio-checked 토큰을 쓴다. | #FFFFFF | color-bg-base → color-white | confirmed | O | 2778:16890 selection=unchecked, state=default (모든 사이즈): #FFFFFF<br>4971:31497 selection=unchecked, state=default (모든 사이즈): #FFFFFF |  |
| `selectionControl-color-bg-hover` | `--selection-control-color-bg-hover` | 체크되지 않은 체크박스·라디오 상자의 hover 상태 바탕 색으로, 해제 상태 상자에만 쓰며, 체크된 상자는 checkbox-checked·radio-checked 토큰을 쓴다. | #F8F9FB | color-bg-neutral-faint → color-gray-50 | confirmed | O | 2778:16890 selection=unchecked, state=hover (모든 사이즈): #F8F9FB<br>4971:31497 selection=unchecked, state=hover (모든 사이즈): #F8F9FB |  |
| `selectionControl-color-bg-pressed` | `--selection-control-color-bg-pressed` | 체크되지 않은 체크박스·라디오 상자의 pressed 상태 바탕 색으로, 해제 상태 상자에만 쓰며, 체크된 상자는 checkbox-checked·radio-checked 토큰을 쓴다. | #F1F3F5 | color-bg-neutral-muted → color-gray-80 | confirmed | O | 2778:16890 selection=unchecked, state=pressed (모든 사이즈): #F1F3F5<br>4971:31497 selection=unchecked, state=pressed (모든 사이즈): #F1F3F5 |  |
| `selectionControl-color-bg-disabled` | `--selection-control-color-bg-disabled` | 체크되지 않은 체크박스·라디오 상자의 비활성 상태 바탕 색으로, 해제 상태 상자에만 쓰며, 체크된 상자는 checkbox-checked·radio-checked 토큰을 쓴다. | #E8ECEF | color-bg-neutral-disabled → color-gray-100 | confirmed | O | 2778:16890 selection=unchecked, state=disabled (모든 사이즈): #E8ECEF<br>4971:31497 selection=unchecked, state=disabled (모든 사이즈): #E8ECEF |  |
| `selectionControl-color-border-default` | `--selection-control-color-border-default` | 체크되지 않은 체크박스·라디오 상자의 테두리 색(gray 300)으로, 기본·hover·pressed·비활성 모든 상태에 같은 값을 쓰며(상태별 토큰 없음), 해제 상태 상자에만 쓰고, 체크된 라디오 테두리는 radio-checked-color-border-*를 쓴다. | #C4C9CF | color-border-neutral-strong → color-gray-300 | confirmed | O | 2778:16890 selection=unchecked, 모든 상태 (모든 사이즈): #C4C9CF<br>4971:31497 selection=unchecked, 모든 상태 (모든 사이즈): #C4C9CF |  |
| `selectionControl-label-color-fg-default` | `--selection-control-label-color-fg-default` | 체크박스·라디오 옆 라벨 글자의 기본 상태 색(체크 여부와 관계없이 같음)으로, 선택 컨트롤 라벨에만 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 2778:16890 selection=모두, state=default (모든 사이즈): #1C1F23<br>4971:31497 selection=모두, state=default (모든 사이즈): #1C1F23 |  |
| `selectionControl-label-color-fg-hover` | `--selection-control-label-color-fg-hover` | 체크박스·라디오 옆 라벨 글자의 hover 상태 색(체크 여부와 관계없이 같음)으로, 선택 컨트롤 라벨에만 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 2778:16890 selection=모두, state=hover (모든 사이즈): #1C1F23<br>4971:31497 selection=모두, state=hover (모든 사이즈): #1C1F23 |  |
| `selectionControl-label-color-fg-pressed` | `--selection-control-label-color-fg-pressed` | 체크박스·라디오 옆 라벨 글자의 pressed 상태 색(체크 여부와 관계없이 같음)으로, 선택 컨트롤 라벨에만 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 2778:16890 selection=모두, state=pressed (모든 사이즈): #1C1F23<br>4971:31497 selection=모두, state=pressed (모든 사이즈): #1C1F23 |  |
| `selectionControl-label-color-fg-disabled` | `--selection-control-label-color-fg-disabled` | 체크박스·라디오 옆 라벨 글자의 비활성 상태 색(체크 여부와 관계없이 같음)으로, 선택 컨트롤 라벨에만 쓴다. | #B3B9C0 | color-fg-neutral-disabled → color-gray-400 | confirmed | O | 2778:16890 selection=모두, state=disabled (모든 사이즈): #B3B9C0<br>4971:31497 selection=모두, state=disabled (모든 사이즈): #B3B9C0 |  |
| `checkbox-checked-color-bg-default` | `--checkbox-checked-color-bg-default` | 체크된(부분 선택 포함) 체크박스 상자의 기본 상태 채움 색으로, :checked·:indeterminate 체크박스에만 쓰며, 위 체크 표시는 checkbox-checked-indicator-color-fg-default를 쓴다. | #3617CE | color-bg-brand-strongest-default → color-tBlue-600 | confirmed | O | 2778:16890 selection=checked·indeterminate, state=default (모든 사이즈): #3617CE |  |
| `checkbox-checked-color-bg-hover` | `--checkbox-checked-color-bg-hover` | 체크된(부분 선택 포함) 체크박스 상자의 hover 상태 채움 색으로, :checked·:indeterminate 체크박스에만 쓰며, 위 체크 표시는 checkbox-checked-indicator-color-fg-default를 쓴다. | #2F15B2 | color-bg-brand-strongest-hover → color-tBlue-700 | confirmed | O | 2778:16890 selection=checked·indeterminate, state=hover (모든 사이즈): #2F15B2 |  |
| `checkbox-checked-color-bg-pressed` | `--checkbox-checked-color-bg-pressed` | 체크된(부분 선택 포함) 체크박스 상자의 pressed 상태 채움 색으로, :checked·:indeterminate 체크박스에만 쓰며, 위 체크 표시는 checkbox-checked-indicator-color-fg-default를 쓴다. | #261091 | color-bg-brand-strongest-pressed → color-tBlue-800 | confirmed | O | 2778:16890 selection=checked·indeterminate, state=pressed (모든 사이즈): #261091 |  |
| `checkbox-checked-color-bg-disabled` | `--checkbox-checked-color-bg-disabled` | 체크된(부분 선택 포함) 체크박스 상자의 비활성 상태 채움 색(gray 400)으로, :checked·:indeterminate 체크박스에만 쓰며, 위 체크 표시는 checkbox-checked-indicator-color-fg-default를 쓴다. | #B3B9C0 | color-bg-neutral-stronger-default → color-gray-400 | confirmed | O | 2778:16890 selection=checked·indeterminate, state=disabled (모든 사이즈): #B3B9C0 |  |
| `checkbox-checked-color-border-default` | `--checkbox-checked-color-border-default` | 체크된(부분 선택 포함) 체크박스 상자의 기본 상태 테두리 색(채움과 같은 브랜드색)으로, :checked·:indeterminate 체크박스에만 쓰며, 체크 안 된 상자 테두리는 selectionControl-color-border-default를 쓴다. | #3617CE | color-border-brand-strong-default → color-tBlue-600 | confirmed | O | 2778:16890 selection=checked·indeterminate, state=default (모든 사이즈): #3617CE |  |
| `checkbox-checked-color-border-hover` | `--checkbox-checked-color-border-hover` | 체크된(부분 선택 포함) 체크박스 상자의 hover 상태 테두리 색(채움과 같은 브랜드색)으로, :checked·:indeterminate 체크박스에만 쓰며, 체크 안 된 상자 테두리는 selectionControl-color-border-default를 쓴다. | #2F15B2 | color-border-brand-strong-hover → color-tBlue-700 | confirmed | O | 2778:16890 selection=checked·indeterminate, state=hover (모든 사이즈): #2F15B2 |  |
| `checkbox-checked-color-border-pressed` | `--checkbox-checked-color-border-pressed` | 체크된(부분 선택 포함) 체크박스 상자의 pressed 상태 테두리 색(채움과 같은 브랜드색)으로, :checked·:indeterminate 체크박스에만 쓰며, 체크 안 된 상자 테두리는 selectionControl-color-border-default를 쓴다. | #261091 | color-border-brand-strong-pressed → color-tBlue-800 | confirmed | O | 2778:16890 selection=checked·indeterminate, state=pressed (모든 사이즈): #261091 |  |
| `checkbox-checked-color-border-disabled` | `--checkbox-checked-color-border-disabled` | 체크된(부분 선택 포함) 체크박스 상자의 비활성 상태 테두리 색(채움과 같은 gray 400)으로, :checked·:indeterminate 체크박스에만 쓰며, 체크 안 된 상자 테두리는 selectionControl-color-border-default를 쓴다. | #B3B9C0 | color-border-neutral-stronger → color-gray-400 | confirmed | O | 2778:16890 selection=checked·indeterminate, state=disabled (모든 사이즈): #B3B9C0 |  |
| `checkbox-checked-indicator-color-fg-default` | `--checkbox-checked-indicator-color-fg-default` | 체크된 체크박스 안 체크 표시(✓)·부분 선택 표시(−)의 색(모든 상태 흰색)으로, 체크 표시에만 쓴다. | #FFFFFF | color-fg-onStrongest → color-white | confirmed | O | 2778:16890 selection=checked·indeterminate, state=모두, Vector: #FFFFFF |  |
| `checkbox-medium-size` | `--checkbox-medium-size` | 중간 체크박스(medium) 상자의 너비·높이(16px)로, checkbox medium 상자에만 쓰며 컨트롤 높이(size-control-*)가 아니다. | 16px | size-16 | confirmed | O | 2778:16890 size=medium (모든 선택·상태): 16 |  |
| `checkbox-medium-focusRing-radius` | `--checkbox-medium-focus-ring-radius` | 중간 체크박스(medium) 키보드 포커스 링의 모서리(6px, 상자 모서리 4 + 2)로, :focus-visible 링에만 쓰고 요소 모서리가 바뀌면 함께 바꾸며, 규칙 도출값이라 Semantic 없이 Primitive를 직접 참조한다. | 6px | radius-6 | confirmed | O | 2778:16890 size=medium (모든 선택·상태), _FocusRing: 6 |  |
| `checkbox-large-size` | `--checkbox-large-size` | 큰 체크박스(large) 상자의 너비·높이(20px)로, checkbox large 상자에만 쓰며 컨트롤 높이(size-control-*)가 아니다. | 20px | size-20 | confirmed | O | 2778:16890 size=large (모든 선택·상태): 20 |  |
| `checkbox-large-focusRing-radius` | `--checkbox-large-focus-ring-radius` | 큰 체크박스(large) 키보드 포커스 링의 모서리(6px, 상자 모서리 4 + 2)로, :focus-visible 링에만 쓰고 요소 모서리가 바뀌면 함께 바꾸며, 규칙 도출값이라 Semantic 없이 Primitive를 직접 참조한다. | 6px | radius-6 | confirmed | O | 2778:16890 size=large (모든 선택·상태), _FocusRing: 6 |  |
| `checkbox-radius` | `--checkbox-radius` | 체크박스 상자의 모서리(4px, 모든 사이즈)로, 체크박스 상자에만 쓴다. | 4px | radius-xsmall → radius-4 | confirmed | O | 2778:16890 모든 변형: 4 |  |
| `checkbox-borderWidth` | `--checkbox-border-width` | 체크박스 상자의 테두리 두께(1.5px, 안쪽)로, 체크박스 상자 테두리에만 쓰며 버튼·필드의 1px 테두리와 다르다. | 1.5px | borderWidth-1p5 | confirmed | O | 2778:16890 모든 변형, stroke INSIDE: 1.5 |  |
| `checkbox-space-gap` | `--checkbox-space-gap` | 체크박스 상자와 라벨 사이 간격(6px)으로, 체크박스와 라벨 사이에만 쓴다. | 6px | space-6 | confirmed | O | 2778:16890 모든 변형: 6 |  |
| `radio-checked-color-bg-default` | `--radio-checked-color-bg-default` | 선택된 라디오 원의 바탕 색(모든 상태 흰색)으로, 선택된 라디오에만 쓰며, 안쪽 점은 radio-checked-dot-color-bg-*를 쓴다. | #FFFFFF | color-bg-base → color-white | confirmed | O | 4971:31497 selection=checked, state=모두: #FFFFFF |  |
| `radio-checked-color-border-default` | `--radio-checked-color-border-default` | 선택된 라디오 원 테두리의 기본 상태 색으로, :checked 라디오에만 쓰며, 선택 안 된 라디오 테두리는 selectionControl-color-border-default를 쓴다. | #3617CE | color-border-brand-strong-default → color-tBlue-600 | confirmed | O | 4971:31497 selection=checked, state=default (모든 사이즈): #3617CE |  |
| `radio-checked-color-border-hover` | `--radio-checked-color-border-hover` | 선택된 라디오 원 테두리의 hover 상태 색으로, :checked 라디오에만 쓰며, 선택 안 된 라디오 테두리는 selectionControl-color-border-default를 쓴다. | #2F15B2 | color-border-brand-strong-hover → color-tBlue-700 | confirmed | O | 4971:31497 selection=checked, state=hover (모든 사이즈): #2F15B2 |  |
| `radio-checked-color-border-pressed` | `--radio-checked-color-border-pressed` | 선택된 라디오 원 테두리의 pressed 상태 색으로, :checked 라디오에만 쓰며, 선택 안 된 라디오 테두리는 selectionControl-color-border-default를 쓴다. | #261091 | color-border-brand-strong-pressed → color-tBlue-800 | confirmed | O | 4971:31497 selection=checked, state=pressed (모든 사이즈): #261091 |  |
| `radio-checked-color-border-disabled` | `--radio-checked-color-border-disabled` | 선택된 라디오 원 테두리의 비활성 상태 색(gray 400)으로, :checked 라디오에만 쓰며, 선택 안 된 라디오 테두리는 selectionControl-color-border-default를 쓴다. | #B3B9C0 | color-border-neutral-stronger → color-gray-400 | confirmed | O | 4971:31497 selection=checked, state=disabled (모든 사이즈): #B3B9C0 |  |
| `radio-checked-dot-color-bg-default` | `--radio-checked-dot-color-bg-default` | 선택된 라디오 안쪽 점의 기본 상태 색으로, 라디오 점에만 쓰며, 체크박스 채움은 checkbox-checked-color-bg-*를 쓴다. | #3617CE | color-bg-brand-strongest-default → color-tBlue-600 | confirmed | O | 4971:31497 selection=checked, state=default (모든 사이즈), dot: #3617CE |  |
| `radio-checked-dot-color-bg-hover` | `--radio-checked-dot-color-bg-hover` | 선택된 라디오 안쪽 점의 hover 상태 색으로, 라디오 점에만 쓰며, 체크박스 채움은 checkbox-checked-color-bg-*를 쓴다. | #2F15B2 | color-bg-brand-strongest-hover → color-tBlue-700 | confirmed | O | 4971:31497 selection=checked, state=hover (모든 사이즈), dot: #2F15B2 |  |
| `radio-checked-dot-color-bg-pressed` | `--radio-checked-dot-color-bg-pressed` | 선택된 라디오 안쪽 점의 pressed 상태 색으로, 라디오 점에만 쓰며, 체크박스 채움은 checkbox-checked-color-bg-*를 쓴다. | #261091 | color-bg-brand-strongest-pressed → color-tBlue-800 | confirmed | O | 4971:31497 selection=checked, state=pressed (모든 사이즈), dot: #261091 |  |
| `radio-checked-dot-color-bg-disabled` | `--radio-checked-dot-color-bg-disabled` | 선택된 라디오 안쪽 점의 비활성 상태 색(gray 400)으로, 라디오 점에만 쓰며, 체크박스 채움은 checkbox-checked-color-bg-*를 쓴다. | #B3B9C0 | color-bg-neutral-stronger-default → color-gray-400 | confirmed | O | 4971:31497 selection=checked, state=disabled (모든 사이즈), dot: #B3B9C0 |  |
| `radio-medium-size` | `--radio-medium-size` | 중간 라디오(medium) 상자의 너비·높이(16px)로, radio medium 상자에만 쓰며 컨트롤 높이(size-control-*)가 아니다. | 16px | size-16 | confirmed | O | 4971:31497 size=medium (모든 선택·상태): 16 |  |
| `radio-medium-dot-size` | `--radio-medium-dot-size` | 중간 라디오(medium) 선택 시 안쪽 점의 지름(8px)으로, 라디오 점에만 쓴다. | 8px | size-8 | confirmed | O | 4971:31497 size=medium, selection=checked, dot: 8 |  |
| `radio-medium-focusRing-radius` | `--radio-medium-focus-ring-radius` | 중간 라디오(medium) 키보드 포커스 링의 모서리(원형)로, :focus-visible 링에만 쓰며, 요소가 원형이라 링도 원형(radius-full)이다. | 9999px | radius-full → radius-9999 | confirmed | O | 4971:31497 size=medium (모든 선택·상태), _FocusRing: 9999 |  |
| `radio-large-size` | `--radio-large-size` | 큰 라디오(large) 상자의 너비·높이(20px)로, radio large 상자에만 쓰며 컨트롤 높이(size-control-*)가 아니다. | 20px | size-20 | confirmed | O | 4971:31497 size=large (모든 선택·상태): 20 |  |
| `radio-large-dot-size` | `--radio-large-dot-size` | 큰 라디오(large) 선택 시 안쪽 점의 지름(12px)으로, 라디오 점에만 쓴다. | 12px | size-12 | confirmed | O | 4971:31497 size=large, selection=checked, dot: 12 |  |
| `radio-large-focusRing-radius` | `--radio-large-focus-ring-radius` | 큰 라디오(large) 키보드 포커스 링의 모서리(원형)로, :focus-visible 링에만 쓰며, 요소가 원형이라 링도 원형(radius-full)이다. | 9999px | radius-full → radius-9999 | confirmed | O | 4971:31497 size=large (모든 선택·상태), _FocusRing: 9999 |  |
| `radio-radius` | `--radio-radius` | 라디오 상자의 모서리(원형, 모든 사이즈)로, 라디오 상자에만 쓴다. | 9999px | radius-full → radius-9999 | confirmed | O | 4971:31497 모든 변형: 9999 |  |
| `radio-borderWidth` | `--radio-border-width` | 라디오 상자의 테두리 두께(1.5px, 안쪽)로, 라디오 상자 테두리에만 쓰며 버튼·필드의 1px 테두리와 다르다. | 1.5px | borderWidth-1p5 | confirmed | O | 4971:31497 모든 변형, stroke INSIDE: 1.5 |  |
| `radio-space-gap` | `--radio-space-gap` | 라디오 상자와 라벨 사이 간격(6px)으로, 라디오와 라벨 사이에만 쓴다. | 6px | space-6 | confirmed | O | 4971:31497 모든 변형: 6 |  |
| `radio-group-space-gap` | `--radio-group-space-gap` | 라디오 그룹에서 라디오 항목 사이 간격(12px, 가로)으로, RadioGroup 안 항목 사이에만 쓰며 라디오와 라벨 사이 간격은 radio-space-gap을 쓴다. | 12px | space-12 | confirmed | O | 4971:31723 size=large·medium: 12 |  |

## 참고

- **source**: 피그마 Checkbox(2778:16890)·Radio(4971:31497)·RadioGroup(4971:31723) 적용값
- **stateMap**: 피그마 Checkbox selection=checked·indeterminate, Radio selection=selected는 변형 checked(:checked)다. unchecked·unselected는 변형 없음
- **shared**: 해제 상태 상자 바탕·테두리와 라벨 색은 두 컴포넌트가 같아 그룹 토큰이다. 체크 상태는 체크박스(채움)와 라디오(흰 바탕 + 테두리·점) 모양이 달라 컴포넌트 토큰으로 나눴다
- **indicator**: 체크 표시·부분 선택 표시 모양(벡터 11x7·9x6 등)은 아이콘 자산이라 크기 토큰을 만들지 않았다
- **focusRingRadius**: 체크박스 링 모서리 6(상자 4 + 2), 라디오는 원형.
- **checkedDisabled**: 선택된 라디오의 비활성 테두리는 color-border-brand-disabled(tBlue 200), 안쪽 점은 color-bg-brand-disabled(tBlue 200)를 쓴다
