# 컴포넌트 토큰: tooltip

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| tooltip | 7324:3417 |

## 글자 스타일

> 컴포넌트 글자에는 Component 토큰이 없다. 피그마는 글자 레이어에 텍스트 스타일을, 코드는 Semantic 글자 변수를 그대로 쓴다. `+ tabular-nums`가 붙은 대상은 숫자 폭을 고정한다(코드 `font-variant-numeric: tabular-nums`, 피그마 `label/[크기]/tabular/[굵기]` 스타일).

| 대상 키 | 대상 | 글자 스타일 | 피그마 텍스트 스타일 | 값 (크기/줄 높이 굵기 자간) | 피그마 근거 |
| --- | --- | --- | --- | --- | --- |
| `tooltip` | 툴팁 문구 | `font-label-12-500` | `label/12/500` | 12px/16px 500 -0.2px | 7324:3417 모든 변형, text: text style label/12/500 |

## 토큰 (9개: confirmed 9)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `tooltip-color-bg-default` | `--tooltip-color-bg-default` | 툴팁 상자와 화살표의 바탕 색(gray 800, 어두운 바탕)으로, 기본 툴팁에 쓰며, 오류 툴팁은 tooltip-color-bg-error를 쓴다. | #303942 | color-gray-800 | confirmed | O | 7324:3417 state=default, body·arrow: #303942 | TTP-01 |
| `tooltip-color-bg-error` | `--tooltip-color-bg-error` | 오류 툴팁 상자와 화살표의 바탕 색(옅은 빨강)으로, 오류를 알리는 툴팁에만 쓴다. | #FFDCDC | color-bg-danger-strong → color-red-100 | confirmed | O | 7324:3417 state=error, body·arrow: #FFDCDC |  |
| `tooltip-color-fg-default` | `--tooltip-color-fg-default` | 툴팁 문구 색(흰색)으로, 어두운 기본 툴팁 바탕 위에 쓰며, 오류 툴팁은 tooltip-color-fg-error를 쓴다. | #FFFFFF | color-fg-onInverse → color-white | confirmed | O | 7324:3417 state=default, text: #FFFFFF |  |
| `tooltip-color-fg-error` | `--tooltip-color-fg-error` | 오류 툴팁 문구 색(진한 빨강)으로, 오류를 알리는 툴팁에만 쓴다. | #B8282B | color-fg-danger-strongest → color-red-800 | confirmed | O | 7324:3417 state=error, text: #B8282B |  |
| `tooltip-radius` | `--tooltip-radius` | 툴팁 상자의 모서리(8px)로, 툴팁 상자에만 쓴다. | 8px | radius-medium → radius-8 | confirmed | O | 7324:3417 모든 변형, body: 8 |  |
| `tooltip-space-paddingX` | `--tooltip-space-padding-x` | 툴팁 상자의 좌우 안쪽 여백(12px)으로, 툴팁 상자에만 쓴다. | 12px | space-12 | confirmed | O | 7324:3417 모든 변형, body 좌우: 12 |  |
| `tooltip-space-paddingY` | `--tooltip-space-padding-y` | 툴팁 상자의 위아래 안쪽 여백(12px)으로, 툴팁 상자에만 쓴다. | 12px | space-12 | confirmed | O | 7324:3417 모든 변형, body 위아래: 12 |  |
| `tooltip-arrow-size-width` | `--tooltip-arrow-size-width` | 툴팁 화살표의 밑변 너비(10px)로, 화살표에만 쓰며, 화살표 색은 툴팁 바탕 색을 따른다. | 10px | size-arrow-width → size-10 | confirmed | O | 7324:3417 showArrow=true, arrow (left·right placement은 너비·높이를 바꿔 연결): 10 |  |
| `tooltip-arrow-size-height` | `--tooltip-arrow-size-height` | 툴팁 화살표의 높이(6px, 트리거 쪽으로 튀어나온 길이)로, 화살표에만 쓴다. | 6px | size-arrow-height → size-6 | confirmed | O | 7324:3417 showArrow=true, arrow (left·right placement은 너비·높이를 바꿔 연결): 6 |  |

## 참고

- **source**: 피그마 ❖ Tooltip / Popover 페이지 Tooltip(7324:3417) 적용값
- **nested**: 화살표 색은 툴팁 바탕 색(tooltip-color-bg-*)을 따른다. 상자 크기는 문구 길이로 정해진다(HUG)
