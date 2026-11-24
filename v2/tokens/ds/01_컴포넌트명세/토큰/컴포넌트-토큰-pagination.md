# 컴포넌트 토큰: pagination

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| pagination | 4012:33172 |

## 글자 스타일

> 컴포넌트 글자에는 Component 토큰이 없다. 피그마는 글자 레이어에 텍스트 스타일을, 코드는 Semantic 글자 변수를 그대로 쓴다. `+ tabular-nums`가 붙은 대상은 숫자 폭을 고정한다(코드 `font-variant-numeric: tabular-nums`, 피그마 `label/[크기]/tabular/[굵기]` 스타일).

| 대상 키 | 대상 | 글자 스타일 | 피그마 텍스트 스타일 | 값 (크기/줄 높이 굵기 자간) | 피그마 근거 |
| --- | --- | --- | --- | --- | --- |
| `pagination` | 페이지 번호 | `font-label-13-500` | `label/13/500` | 13px/20px 500 -0.2px | 4012:17218 type=number, 모든 상태: text style label/13/500 |

## 토큰 (22개: confirmed 22)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `pagination-color-bg-default` | `--pagination-color-bg-default` | 페이지네이션 항목(페이지 번호·처음/이전/다음/마지막 버튼)의 기본 상태 바탕 색으로, 선택 안 된 항목에 쓰며, 현재 페이지 채움은 pagination-current-color-bg-*를 쓴다. | #00000000 | color-bg-transparent → color-transparent | confirmed | O | 4012:17218 type=number, selection=unselected, state=default: #00000000<br>4012:33043 direction=모두, state=default: #00000000 |  |
| `pagination-color-bg-hover` | `--pagination-color-bg-hover` | 페이지네이션 항목(페이지 번호·처음/이전/다음/마지막 버튼)의 hover 상태 바탕 색으로, 선택 안 된 항목에 쓰며, 현재 페이지 채움은 pagination-current-color-bg-*를 쓴다. | #F8F9FB | color-bg-neutral-faint → color-gray-50 | confirmed | O | 4012:17218 type=number, selection=unselected, state=hover: #F8F9FB<br>4012:33043 direction=모두, state=hover: #F8F9FB |  |
| `pagination-color-bg-pressed` | `--pagination-color-bg-pressed` | 페이지네이션 항목(페이지 번호·처음/이전/다음/마지막 버튼)의 pressed 상태 바탕 색으로, 선택 안 된 항목에 쓰며, 현재 페이지 채움은 pagination-current-color-bg-*를 쓴다. | #F1F3F5 | color-bg-neutral-muted → color-gray-80 | confirmed | O | 4012:17218 type=number, selection=unselected, state=pressed: #F1F3F5<br>4012:33043 direction=모두, state=pressed: #F1F3F5 |  |
| `pagination-color-bg-disabled` | `--pagination-color-bg-disabled` | 페이지네이션 항목(페이지 번호·처음/이전/다음/마지막 버튼)의 비활성 상태 바탕 색으로, 선택 안 된 항목에 쓰며, 현재 페이지 채움은 pagination-current-color-bg-*를 쓴다. | #00000000 | color-bg-transparent → color-transparent | confirmed | O | 4012:17218 type=number, selection=unselected, state=disabled: #00000000<br>4012:33043 direction=모두, state=disabled (채움 없음): #00000000 |  |
| `pagination-color-fg-default` | `--pagination-color-fg-default` | 페이지네이션 항목의 페이지 번호 글자와 이동 아이콘의 기본 상태 색으로, 선택 안 된 항목에 쓰며, 현재 페이지 번호는 pagination-current-color-fg-default를 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 4012:17218 type=number, selection=unselected, state=default: #1C1F23<br>4012:33043 direction=모두, state=default, IconSlot: #1C1F23 |  |
| `pagination-color-fg-hover` | `--pagination-color-fg-hover` | 페이지네이션 항목의 페이지 번호 글자와 이동 아이콘의 hover 상태 색으로, 선택 안 된 항목에 쓰며, 현재 페이지 번호는 pagination-current-color-fg-default를 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 4012:17218 type=number, selection=unselected, state=hover: #1C1F23<br>4012:33043 direction=모두, state=hover, IconSlot: #1C1F23 |  |
| `pagination-color-fg-pressed` | `--pagination-color-fg-pressed` | 페이지네이션 항목의 페이지 번호 글자와 이동 아이콘의 pressed 상태 색으로, 선택 안 된 항목에 쓰며, 현재 페이지 번호는 pagination-current-color-fg-default를 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 4012:17218 type=number, selection=unselected, state=pressed: #1C1F23<br>4012:33043 direction=모두, state=pressed, IconSlot: #1C1F23 |  |
| `pagination-color-fg-disabled` | `--pagination-color-fg-disabled` | 페이지네이션 항목의 페이지 번호 글자와 이동 아이콘의 비활성 상태 색으로, 선택 안 된 항목에 쓰며, 현재 페이지 번호는 pagination-current-color-fg-default를 쓴다. | #B3B9C0 | color-fg-neutral-disabled → color-gray-400 | confirmed | O | 4012:17218 type=number, selection=unselected, state=disabled: #B3B9C0<br>4012:33043 direction=모두, state=disabled, IconSlot: #B3B9C0 |  |
| `pagination-current-color-bg-default` | `--pagination-current-color-bg-default` | 현재 페이지 번호(aria-current=page)의 기본 상태 채움 색(브랜드)으로, 현재 페이지 항목에만 쓰며, 위 글자는 pagination-current-color-fg-default를 쓴다. | #3617CE | color-bg-brand-strongest-default → color-tBlue-600 | confirmed | O | 4012:17218 type=number, selection=selected, state=default: #3617CE |  |
| `pagination-current-color-bg-hover` | `--pagination-current-color-bg-hover` | 현재 페이지 번호(aria-current=page)의 hover 상태 채움 색(브랜드)으로, 현재 페이지 항목에만 쓰며, 위 글자는 pagination-current-color-fg-default를 쓴다. | #2F15B2 | color-bg-brand-strongest-hover → color-tBlue-700 | confirmed | O | 4012:17218 type=number, selection=selected, state=hover: #2F15B2 |  |
| `pagination-current-color-bg-pressed` | `--pagination-current-color-bg-pressed` | 현재 페이지 번호(aria-current=page)의 pressed 상태 채움 색(브랜드)으로, 현재 페이지 항목에만 쓰며, 위 글자는 pagination-current-color-fg-default를 쓴다. | #261091 | color-bg-brand-strongest-pressed → color-tBlue-800 | confirmed | O | 4012:17218 type=number, selection=selected, state=pressed: #261091 |  |
| `pagination-current-color-bg-disabled` | `--pagination-current-color-bg-disabled` | 현재 페이지 번호(aria-current=page)의 비활성 상태 채움 색(브랜드)으로, 현재 페이지 항목에만 쓰며, 위 글자는 pagination-current-color-fg-default를 쓴다. | #B4B7FF | color-bg-brand-disabled → color-tBlue-200 | confirmed | O | 4012:17218 type=number, selection=selected, state=disabled: #B4B7FF |  |
| `pagination-current-color-fg-default` | `--pagination-current-color-fg-default` | 현재 페이지 번호 글자 색(모든 상태 흰색, 비활성 포함)으로, 브랜드 채움 위 번호에만 쓴다. | #FFFFFF | color-fg-onStrongest → color-white | confirmed | O | 4012:17218 type=number, selection=selected, state=모두: #FFFFFF |  |
| `pagination-size-height` | `--pagination-size-height` | 페이지네이션 항목(페이지 번호·이동 버튼)의 높이(20px)로, 페이지네이션 항목에만 쓰며 컨트롤 높이(size-control-*)가 아니다. | 20px | size-20 | confirmed | O | 4012:17218 모든 변형: 20<br>4012:33043 모든 변형: 20 |  |
| `pagination-size-minWidth` | `--pagination-size-min-width` | 페이지네이션 항목의 최소 너비(20px)로, 한 자리 번호와 이동 버튼이 정사각이 되게 하며, 두 자리 이상 번호는 좌우 여백만큼 넓어진다. | 20px | size-20 | confirmed | O | 4012:17218 type=number, 한 자리 번호: 20<br>4012:33043 모든 변형: 20 |  |
| `pagination-space-paddingX` | `--pagination-space-padding-x` | 페이지 번호 항목의 좌우 안쪽 여백(6px)으로, 번호 항목에만 쓰며 이동 버튼에는 쓰지 않는다. | 6px | space-6 | confirmed | O | 4012:17218 type=number: 6 |  |
| `pagination-radius` | `--pagination-radius` | 페이지네이션 항목의 모서리(4px)로, 항목의 hover·pressed 바탕과 현재 페이지 채움 모양에 쓴다. | 4px | radius-xsmall → radius-4 | confirmed | O | 4012:17218 모든 변형: 4<br>4012:33043 state=hover·pressed: 4 |  |
| `pagination-icon-size` | `--pagination-icon-size` | 페이지네이션 이동 버튼(처음·이전·다음·마지막)과 생략(…) 아이콘의 크기(16px)로, 페이지네이션 아이콘에만 쓴다. | 16px | size-icon-medium → size-16 | confirmed | O | 4012:33043 모든 변형, IconSlot: 16<br>4012:17218 type=ellipsis: 16 |  |
| `pagination-group-space-gap` | `--pagination-group-space-gap` | 페이지네이션 묶음 안 항목 사이 간격(10px)으로, 이동 버튼·번호 묶음·번호 사이에 같은 값으로 쓴다. | 10px | space-10 | confirmed | O | 4012:33172 Pagination, pageGroup: 10 |  |
| `pagination-group-space-paddingX` | `--pagination-group-space-padding-x` | 페이지네이션 묶음의 좌우 안쪽 여백(10px)으로, 페이지네이션 전체 상자에만 쓴다. | 10px | space-10 | confirmed | O | 4012:33172 Pagination 좌우: 10 |  |
| `pagination-group-space-paddingY` | `--pagination-group-space-padding-y` | 페이지네이션 묶음의 위아래 안쪽 여백(10px)으로, 페이지네이션 전체 상자에만 쓴다. | 10px | space-10 | confirmed | O | 4012:33172 Pagination 위아래: 10 |  |
| `pagination-focusRing-radius` | `--pagination-focus-ring-radius` | 페이지네이션 항목(페이지 번호·이동 버튼) 키보드 포커스 링의 모서리(6px, 항목 모서리 4 + 2)로, :focus-visible 링에만 쓰고 요소 모서리가 바뀌면 함께 바꾸며, 규칙 도출값이라 Semantic 없이 Primitive를 직접 참조한다. | 6px | radius-6 | confirmed | O | 4012:17218 type=number, selection=unselected state=hover·pressed, selection=selected 모든 상태, _FocusRing: 6 |  |

## 참고

- **source**: 피그마 Pagination 페이지: Pagination(4012:33172) 1종과 항목 2종. 테스트 아트보드 없음
- **naming**: 토큰 이름의 기본(부품 없음)은 상호작용 항목(페이지 번호·이동 버튼)이고, 부품 group은 전체 묶음(Pagination 상자, pagination-group-*)이다. 새 어휘 없이 기존 부품 어휘를 썼다
- **ellipsis**: 생략(…) 항목은 상태가 없고 아이콘 색이 번호 글자와 같아(gray 900) 따로 토큰을 만들지 않았다
- **control**: 이동 버튼은 기본·비활성에서 채움과 모서리가 없고(0), hover·pressed에서만 모서리 4 바탕이 보인다. 모서리는 pagination-radius 하나로 둔다
- **size20**: pagination-size-height·minWidth는 Primitive size-20을 직접 참조한다. 체크박스 상자(20)와 값만 같고 역할이 달라 Semantic으로 올리지 않는다
- **disabled**: 브랜드 채움(현재 페이지)의 비활성 바탕은 tBlue 200이다
- **focusRing**: 페이지 항목은 사이즈가 없어 포커스 링 모서리로 pagination-focusRing-radius(6 = 항목 모서리 4 + 2)를 쓴다
