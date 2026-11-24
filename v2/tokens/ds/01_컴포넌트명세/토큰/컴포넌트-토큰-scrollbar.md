# 컴포넌트 토큰: scrollbar

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| scrollbar | 5815:140 |

## 사이즈별 값

> 컴포넌트 사이즈 단어(xlarge·medium …)와 Semantic 단계 단어(`radius-medium`, `size-icon-small` …)는 서로 다른 척도다. 값은 이름으로 짐작하지 말고 이 표나 토큰 목록에서 확인한다. 칸마다 최종 값과 거친 Semantic(없으면 Primitive 직접 참조)을 적었다.

### scrollbar

| 사이즈 | `size` | `space-paddingX` | `space-paddingY` |
| --- | --- | --- | --- |
| medium | 4px (Primitive) | 2px (Primitive) | 2px (Primitive) |
| large | 6px (Primitive) | 6px (Primitive) | 6px (Primitive) |

## 토큰 (11개: confirmed 11)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `scrollbar-thumb-color-bg-default` | `--scrollbar-thumb-color-bg-default` | 스크롤 막대(thumb)의 기본 상태 색(반투명 회색 30%)으로, scrollbar 막대에만 쓰며, 막대가 움직이는 길은 scrollbar-track-color-bg-default(투명)를 쓴다. | #03182E4D | color-grayAlpha-30 | confirmed | O | 5815:140 state=default (모든 방향·사이즈): #03182E4D |  |
| `scrollbar-thumb-color-bg-hover` | `--scrollbar-thumb-color-bg-hover` | 스크롤 막대(thumb)에 포인터를 올린 hover 상태 색(반투명 회색 40%)으로, scrollbar 막대에만 쓰며, 막대가 움직이는 길은 scrollbar-track-color-bg-default(투명)를 쓴다. | #03182E66 | color-grayAlpha-40 | confirmed | O | 5815:140 state=hover (모든 방향·사이즈): #03182E66 |  |
| `scrollbar-thumb-color-bg-pressed` | `--scrollbar-thumb-color-bg-pressed` | 스크롤 막대(thumb)를 끌고 있는 pressed 상태 색(반투명 회색 50%)으로, scrollbar 막대에만 쓰며, 막대가 움직이는 길은 scrollbar-track-color-bg-default(투명)를 쓴다. | #03182E80 | color-grayAlpha-50 | confirmed | O | 5815:140 state=pressed (모든 방향·사이즈): #03182E80 |  |
| `scrollbar-thumb-radius` | `--scrollbar-thumb-radius` | 스크롤 막대의 모서리(알약형)로, scrollbar 막대에만 쓴다. | 9999px | radius-full → radius-9999 | confirmed | O | 5815:140 모든 변형, bar: 9999 |  |
| `scrollbar-medium-size` | `--scrollbar-medium-size` | 중간 스크롤바(medium)의 두께(4px)로, 세로 스크롤바 너비와 가로 스크롤바 높이에 함께 쓴다. | 4px | size-4 | confirmed | O | 5815:140 size=medium, direction=horizontal·vertical: 4 |  |
| `scrollbar-medium-space-paddingX` | `--scrollbar-medium-space-padding-x` | 중간 가로 스크롤바(medium)의 좌우 끝 여백(2px)으로, 막대가 길 끝에서 떨어지는 거리이며 세로 스크롤바는 scrollbar-medium-space-paddingY를 쓴다. | 2px | space-2 | confirmed | O | 5815:140 size=medium, direction=horizontal: 2 |  |
| `scrollbar-medium-space-paddingY` | `--scrollbar-medium-space-padding-y` | 중간 세로 스크롤바(medium)의 위아래 끝 여백(2px)으로, 막대가 길 끝에서 떨어지는 거리이며 가로 스크롤바는 scrollbar-medium-space-paddingX를 쓴다. | 2px | space-2 | confirmed | O | 5815:140 size=medium, direction=vertical, 위: 2<br>5815:140 size=medium, direction=vertical, 아래: 2 |  |
| `scrollbar-large-size` | `--scrollbar-large-size` | 큰 스크롤바(large)의 두께(6px)로, 세로 스크롤바 너비와 가로 스크롤바 높이에 함께 쓴다. | 6px | size-6 | confirmed | O | 5815:140 size=large, direction=horizontal·vertical: 6 |  |
| `scrollbar-large-space-paddingX` | `--scrollbar-large-space-padding-x` | 큰 가로 스크롤바(large)의 좌우 끝 여백(6px)으로, 막대가 길 끝에서 떨어지는 거리이며 세로 스크롤바는 scrollbar-large-space-paddingY를 쓴다. | 6px | space-6 | confirmed | O | 5815:140 size=large, direction=horizontal: 6 |  |
| `scrollbar-large-space-paddingY` | `--scrollbar-large-space-padding-y` | 큰 세로 스크롤바(large)의 위아래 끝 여백(6px)으로, 막대가 길 끝에서 떨어지는 거리이며 가로 스크롤바는 scrollbar-large-space-paddingX를 쓴다. | 6px | space-6 | confirmed | O | 5815:140 size=large, direction=vertical, 위: 6<br>5815:140 size=large, direction=vertical, 아래: 6 |  |
| `scrollbar-track-color-bg-default` | `--scrollbar-track-color-bg-default` | 스크롤 막대가 움직이는 길(track)의 바탕 색(모든 상태 투명)으로, scrollbar 길에만 쓰며, 막대 색은 scrollbar-thumb-color-bg-*를 쓴다. | #00000000 | color-bg-transparent → color-transparent | confirmed | O | 5815:140 모든 방향·사이즈·상태 12개 변형: #00000000 |  |

## 참고

- **source**: 피그마 ❖ Scrollbar Components
- **length**: 막대 길이는 내용 길이에 따라 정해져 토큰을 만들지 않았다
- **states**: 피그마 Scrollbar(5815:140)에 state(default·hover·pressed)가 있다. 막대(thumb) 색만 grayAlpha 30 → 40 → 50으로 바뀌고 치수는 같다
