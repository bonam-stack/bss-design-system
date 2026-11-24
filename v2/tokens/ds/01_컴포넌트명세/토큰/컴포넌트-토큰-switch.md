# 컴포넌트 토큰: switch

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| switch | 7324:1141 |

## 사이즈별 값

> 컴포넌트 사이즈 단어(xlarge·medium …)와 Semantic 단계 단어(`radius-medium`, `size-icon-small` …)는 서로 다른 척도다. 값은 이름으로 짐작하지 말고 이 표나 토큰 목록에서 확인한다. 칸마다 최종 값과 거친 Semantic(없으면 Primitive 직접 참조)을 적었다.

### switch

| 사이즈 | `size-height` | `size-width` | `thumb-size` | `focusRing-radius` |
| --- | --- | --- | --- | --- |
| small | 20px (Primitive) | 34px (Primitive) | 12px (Primitive) | 9999px `radius-full` |
| medium | 28px (Primitive) | 50px (Primitive) | 20px (Primitive) | 9999px `radius-full` |
| large | 32px (Primitive) | 58px (Primitive) | 24px (Primitive) | 9999px `radius-full` |

## 토큰 (25개: confirmed 25)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `switch-small-size-height` | `--switch-small-size-height` | 작은 스위치(small) 트랙의 높이(20px)로, switch small에만 쓰며 컨트롤 높이(size-control-*)가 아니다. | 20px | size-20 | confirmed | O | 7324:1141 size=small (모든 선택·상태): 20 |  |
| `switch-small-size-width` | `--switch-small-size-width` | 작은 스위치(small) 트랙의 너비(34px)로, switch small에만 쓴다. | 34px | size-34 | confirmed | O | 7324:1141 size=small (모든 선택·상태): 34 |  |
| `switch-small-thumb-size` | `--switch-small-thumb-size` | 작은 스위치(small) 동그라미(thumb)의 지름(12px)으로, 스위치 동그라미에만 쓴다. | 12px | size-12 | confirmed | O | 7324:1141 size=small, thumb: 12 |  |
| `switch-small-focusRing-radius` | `--switch-small-focus-ring-radius` | 작은 스위치(small) 키보드 포커스 링의 모서리(원형)로, :focus-visible 링에만 쓰며, 트랙이 원형이라 링도 원형(radius-full)이다. | 9999px | radius-full → radius-9999 | confirmed | O | 7324:1141 size=small (모든 선택·상태), _FocusRing: 9999 |  |
| `switch-medium-size-height` | `--switch-medium-size-height` | 중간 스위치(medium) 트랙의 높이(28px)로, switch medium에만 쓰며 컨트롤 높이(size-control-*)가 아니다. | 28px | size-28 | confirmed | O | 7324:1141 size=medium (모든 선택·상태): 28 |  |
| `switch-medium-size-width` | `--switch-medium-size-width` | 중간 스위치(medium) 트랙의 너비(50px)로, switch medium에만 쓴다. | 50px | size-50 | confirmed | O | 7324:1141 size=medium (모든 선택·상태): 50 |  |
| `switch-medium-thumb-size` | `--switch-medium-thumb-size` | 중간 스위치(medium) 동그라미(thumb)의 지름(20px)으로, 스위치 동그라미에만 쓴다. | 20px | size-20 | confirmed | O | 7324:1141 size=medium, thumb: 20 |  |
| `switch-medium-focusRing-radius` | `--switch-medium-focus-ring-radius` | 중간 스위치(medium) 키보드 포커스 링의 모서리(원형)로, :focus-visible 링에만 쓰며, 트랙이 원형이라 링도 원형(radius-full)이다. | 9999px | radius-full → radius-9999 | confirmed | O | 7324:1141 size=medium (모든 선택·상태), _FocusRing: 9999 |  |
| `switch-large-size-height` | `--switch-large-size-height` | 큰 스위치(large) 트랙의 높이(32px)로, switch large에만 쓰며 컨트롤 높이(size-control-*)가 아니다. | 32px | size-32 | confirmed | O | 7324:1141 size=large (모든 선택·상태): 32 |  |
| `switch-large-size-width` | `--switch-large-size-width` | 큰 스위치(large) 트랙의 너비(58px)로, switch large에만 쓴다. | 58px | size-58 | confirmed | O | 7324:1141 size=large (모든 선택·상태): 58 |  |
| `switch-large-thumb-size` | `--switch-large-thumb-size` | 큰 스위치(large) 동그라미(thumb)의 지름(24px)으로, 스위치 동그라미에만 쓴다. | 24px | size-24 | confirmed | O | 7324:1141 size=large, thumb: 24 |  |
| `switch-large-focusRing-radius` | `--switch-large-focus-ring-radius` | 큰 스위치(large) 키보드 포커스 링의 모서리(원형)로, :focus-visible 링에만 쓰며, 트랙이 원형이라 링도 원형(radius-full)이다. | 9999px | radius-full → radius-9999 | confirmed | O | 7324:1141 size=large (모든 선택·상태), _FocusRing: 9999 |  |
| `switch-color-bg-default` | `--switch-color-bg-default` | 꺼진(unchecked) 스위치 트랙의 기본 상태 채움 색으로, 꺼진 스위치 트랙에만 쓰며, 켜진 트랙은 switch-checked-color-bg-default를 쓴다. | #B3B9C0 | color-bg-neutral-stronger-default → color-gray-400 | confirmed | O | 7324:1141 selection=unchecked, state=default (모든 사이즈): #B3B9C0 |  |
| `switch-color-bg-hover` | `--switch-color-bg-hover` | 꺼진(unchecked) 스위치 트랙의 hover 상태 채움 색으로, 꺼진 스위치 트랙에만 쓰며, 켜진 트랙은 switch-checked-color-bg-hover를 쓴다. | #8B949E | color-bg-neutral-stronger-hover → color-gray-500 | confirmed | O | 7324:1141 selection=unchecked, state=hover (모든 사이즈): #8B949E |  |
| `switch-color-bg-pressed` | `--switch-color-bg-pressed` | 꺼진(unchecked) 스위치 트랙의 pressed 상태 채움 색으로, 꺼진 스위치 트랙에만 쓰며, 켜진 트랙은 switch-checked-color-bg-pressed를 쓴다. | #697582 | color-bg-neutral-stronger-pressed → color-gray-600 | confirmed | O | 7324:1141 selection=unchecked, state=pressed (모든 사이즈): #697582 |  |
| `switch-color-bg-disabled` | `--switch-color-bg-disabled` | 꺼진(unchecked) 스위치 트랙의 비활성 상태 채움 색으로, 꺼진 스위치 트랙에만 쓰며, 켜진 트랙은 switch-checked-color-bg-disabled를 쓴다. | #DCE0E5 | color-bg-neutral-stronger-disabled → color-gray-200 | confirmed | O | 7324:1141 selection=unchecked, state=disabled (모든 사이즈): #DCE0E5 |  |
| `switch-checked-color-bg-default` | `--switch-checked-color-bg-default` | 켜진(checked) 스위치 트랙의 기본 상태 채움 색으로, :checked 스위치 트랙에만 쓰며, 체크된 체크박스 상자는 checkbox-checked-color-bg-default를 쓴다. | #3617CE | color-bg-brand-strongest-default → color-tBlue-600 | confirmed | O | 7324:1141 selection=checked, state=default (모든 사이즈): #3617CE |  |
| `switch-checked-color-bg-hover` | `--switch-checked-color-bg-hover` | 켜진(checked) 스위치 트랙의 hover 상태 채움 색으로, :checked 스위치 트랙에만 쓰며, 체크된 체크박스 상자는 checkbox-checked-color-bg-hover를 쓴다. | #2F15B2 | color-bg-brand-strongest-hover → color-tBlue-700 | confirmed | O | 7324:1141 selection=checked, state=hover (모든 사이즈): #2F15B2 |  |
| `switch-checked-color-bg-pressed` | `--switch-checked-color-bg-pressed` | 켜진(checked) 스위치 트랙의 pressed 상태 채움 색으로, :checked 스위치 트랙에만 쓰며, 체크된 체크박스 상자는 checkbox-checked-color-bg-pressed를 쓴다. | #261091 | color-bg-brand-strongest-pressed → color-tBlue-800 | confirmed | O | 7324:1141 selection=checked, state=pressed (모든 사이즈): #261091 |  |
| `switch-checked-color-bg-disabled` | `--switch-checked-color-bg-disabled` | 켜진(checked) 스위치 트랙의 비활성 상태 채움 색(gray 400)으로, :checked 스위치 트랙에만 쓰며, 꺼진 트랙 비활성은 switch-color-bg-disabled, 체크된 체크박스 상자는 checkbox-checked-color-bg-disabled를 쓴다. | #B3B9C0 | color-bg-neutral-stronger-default → color-gray-400 | confirmed | O | 7324:1141 selection=checked, state=disabled (모든 사이즈): #B3B9C0 |  |
| `switch-thumb-color-bg-default` | `--switch-thumb-color-bg-default` | 스위치 동그라미(thumb)의 채움 색(모든 선택·상태에서 흰색)으로, 스위치 동그라미에만 쓰며, 트랙 색은 switch-color-bg-*·switch-checked-color-bg-*를 쓴다. | #FFFFFF | color-bg-onStrongest → color-white | confirmed | O | 7324:1141 모든 변형, thumb: #FFFFFF |  |
| `switch-thumb-radius` | `--switch-thumb-radius` | 스위치 동그라미(thumb)의 모서리(원형, 모든 사이즈)로, 동그라미에만 쓰며, 트랙 모서리는 switch-radius를 쓴다. | 9999px | radius-full → radius-9999 | confirmed | O | 7324:1141 모든 변형, thumb: 9999 |  |
| `switch-radius` | `--switch-radius` | 스위치 트랙의 모서리(원형, 모든 사이즈)로, 스위치 트랙에만 쓰며, 동그라미 모서리는 switch-thumb-radius를 쓴다. | 9999px | radius-full → radius-9999 | confirmed | O | 7324:1141 모든 변형: 9999 |  |
| `switch-space-paddingX` | `--switch-space-padding-x` | 스위치 트랙의 좌우 안쪽 여백(4px, 모든 사이즈)으로, 동그라미가 트랙 끝에서 떨어지는 거리이며, 위아래는 switch-space-paddingY를 쓴다. | 4px | space-4 | confirmed | O | 7324:1141 모든 변형, 좌우: 4 |  |
| `switch-space-paddingY` | `--switch-space-padding-y` | 스위치 트랙의 위아래 안쪽 여백(4px, 모든 사이즈)으로, 동그라미가 트랙 위아래에서 떨어지는 거리이며, 좌우는 switch-space-paddingX를 쓴다. | 4px | space-4 | confirmed | O | 7324:1141 모든 변형, 위아래: 4 |  |

## 참고

- **source**: 피그마 ❖ Switch / Toggle 페이지 Switch(7324:1141) 적용값
- **stateMap**: 피그마 selection=checked는 변형 checked(:checked·[aria-checked="true"]), unchecked는 변형 없음
- **focusRingRadius**: 스위치 링은 원형(트랙이 원형).
- **sizeLarge**: 사이즈는 large(32)·medium(28)·small(20)이다
