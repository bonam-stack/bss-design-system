# 컴포넌트 토큰: callout

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| callout-horizontal | 7430:80 |
| callout-vertical | 7430:80 |

## 글자 스타일

> 컴포넌트 글자에는 Component 토큰이 없다. 피그마는 글자 레이어에 텍스트 스타일을, 코드는 Semantic 글자 변수를 그대로 쓴다. `+ tabular-nums`가 붙은 대상은 숫자 폭을 고정한다(코드 `font-variant-numeric: tabular-nums`, 피그마 `label/[크기]/tabular/[굵기]` 스타일).

| 대상 키 | 대상 | 글자 스타일 | 피그마 텍스트 스타일 | 값 (크기/줄 높이 굵기 자간) | 피그마 근거 |
| --- | --- | --- | --- | --- | --- |
| `callout-title` | 콜아웃 제목(두 배치) | `font-label-15-600` | `label/15/600` | 15px/24px 600 -0.2px | 7430:80 모든 변형, title: text style label/15/600 |
| `callout-message` | 콜아웃 본문(description, 두 배치) | `font-label-14-400` | `label/14/400` | 14px/20px 400 -0.2px | 7430:80 모든 변형, description: text style label/14/400 |

## 토큰 (26개: confirmed 26)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `callout-neutral-color-bg-default` | `--callout-neutral-color-bg-default` | 중립 콜아웃의 바탕 색으로, tone=neutral 콜아웃에만 쓰며, horizontal에서 showBackground를 끄면 바탕을 두지 않으며 vertical은 항상 바탕을 둔다. | #F8F9FB | color-bg-neutral-faint → color-gray-50 | confirmed | O | 7430:80 tone=neutral, background: #F8F9FB |  |
| `callout-neutral-icon-color-fg-default` | `--callout-neutral-icon-color-fg-default` | 중립 콜아웃 앞 아이콘 색으로, tone=neutral 콜아웃의 아이콘에만 쓴다. | #454F59 | color-fg-neutral-strong-default → color-gray-700 | confirmed | O | 7430:80 tone=neutral, IconSlot: #454F59 |  |
| `callout-info-color-bg-default` | `--callout-info-color-bg-default` | 정보 콜아웃의 바탕 색으로, tone=info 콜아웃에만 쓰며, horizontal에서 showBackground를 끄면 바탕을 두지 않으며 vertical은 항상 바탕을 둔다. | #EAF3FF | color-bg-info-faint → color-blue-50 | confirmed | O | 7430:80 tone=info, background: #EAF3FF |  |
| `callout-info-icon-color-fg-default` | `--callout-info-icon-color-fg-default` | 정보 콜아웃 앞 아이콘 색으로, tone=info 콜아웃의 아이콘에만 쓴다. | #5895FF | color-fg-info-muted → color-blue-500 | confirmed | O | 7430:80 tone=info, IconSlot: #5895FF |  |
| `callout-success-color-bg-default` | `--callout-success-color-bg-default` | 성공 콜아웃의 바탕 색으로, tone=success 콜아웃에만 쓰며, horizontal에서 showBackground를 끄면 바탕을 두지 않으며 vertical은 항상 바탕을 둔다. | #DFFEF0 | color-bg-success-faint → color-green-50 | confirmed | O | 7430:80 tone=success, background: #DFFEF0 |  |
| `callout-success-icon-color-fg-default` | `--callout-success-icon-color-fg-default` | 성공 콜아웃 앞 아이콘 색으로, tone=success 콜아웃의 아이콘에만 쓴다. | #1AB46E | color-fg-success-muted → color-green-500 | confirmed | O | 7430:80 tone=success, IconSlot: #1AB46E |  |
| `callout-attention-color-bg-default` | `--callout-attention-color-bg-default` | 낮은 주의(노랑) 콜아웃의 바탕 색으로, tone=attention 콜아웃에만 쓰며, horizontal에서 showBackground를 끄면 바탕을 두지 않으며 vertical은 항상 바탕을 둔다. | #FFF7DC | color-bg-attention-faint → color-yellow-50 | confirmed | O | 7430:80 tone=attention, background: #FFF7DC | CLT-01 |
| `callout-attention-icon-color-fg-default` | `--callout-attention-icon-color-fg-default` | 낮은 주의(노랑) 콜아웃 앞 아이콘 색으로, tone=attention 콜아웃의 아이콘에만 쓴다. | #F5B54F | color-fg-attention-muted → color-yellow-600 | confirmed | O | 7430:80 tone=attention, IconSlot: #F5B54F |  |
| `callout-warning-color-bg-default` | `--callout-warning-color-bg-default` | 주의(주황) 콜아웃의 바탕 색으로, tone=warning 콜아웃에만 쓰며, horizontal에서 showBackground를 끄면 바탕을 두지 않으며 vertical은 항상 바탕을 둔다. | #FFEEDA | color-bg-warning-faint → color-orange-50 | confirmed | O | 7430:80 tone=warning, background: #FFEEDA | CLT-01 |
| `callout-warning-icon-color-fg-default` | `--callout-warning-icon-color-fg-default` | 주의(주황) 콜아웃 앞 아이콘 색으로, tone=warning 콜아웃의 아이콘에만 쓴다. | #FF9D3B | color-fg-warning-muted → color-orange-500 | confirmed | O | 7430:80 tone=warning, IconSlot: #FF9D3B |  |
| `callout-danger-color-bg-default` | `--callout-danger-color-bg-default` | 위험 콜아웃의 바탕 색으로, tone=danger 콜아웃에만 쓰며, horizontal에서 showBackground를 끄면 바탕을 두지 않으며 vertical은 항상 바탕을 둔다. | #FFE9E9 | color-bg-danger-faint → color-red-50 | confirmed | O | 7430:80 tone=danger, background: #FFE9E9 |  |
| `callout-danger-icon-color-fg-default` | `--callout-danger-icon-color-fg-default` | 위험 콜아웃 앞 아이콘 색으로, tone=danger 콜아웃의 아이콘에만 쓴다. | #EA5154 | color-fg-danger-muted → color-red-500 | confirmed | O | 7430:80 tone=danger, IconSlot: #EA5154 |  |
| `callout-highlight-color-bg-default` | `--callout-highlight-color-bg-default` | 브랜드 강조(highlight, 보라) 콜아웃의 바탕 색으로, tone=highlight 콜아웃에만 쓰며, horizontal에서 showBackground를 끄면 바탕을 두지 않으며 vertical은 항상 바탕을 둔다. | #F1F2FF | color-bg-brand-faint-default → color-tBlue-50 | confirmed | O | 7430:80 tone=highlight, background: #F1F2FF |  |
| `callout-highlight-icon-color-fg-default` | `--callout-highlight-icon-color-fg-default` | 브랜드 강조(highlight, 보라) 콜아웃 앞 아이콘 색으로, tone=highlight 콜아웃의 아이콘에만 쓴다. | #502DFB | color-fg-brand-muted → color-tBlue-500 | confirmed | O | 7430:80 tone=highlight, IconSlot: #502DFB |  |
| `callout-horizontal-space-paddingX` | `--callout-horizontal-space-padding-x` | 가로 배치 콜아웃(callout-horizontal) 상자의 좌우 안쪽 여백(24px)으로, callout-horizontal에만 쓴다. | 24px | space-24 | confirmed | O | 7430:80 layout=horizontal (모든 tone) 좌우: 24 |  |
| `callout-horizontal-title-space-gap` | `--callout-horizontal-title-space-gap` | 가로 배치 콜아웃(callout-horizontal)에서 제목과 본문 사이 가로 간격(20px)으로, callout-horizontal 글자 영역 안에만 쓴다. | 20px | space-20 | confirmed | O | 7430:80 layout=horizontal (모든 tone), textBox 가로 간격: 20 |  |
| `callout-horizontal-message-color-fg-default` | `--callout-horizontal-message-color-fg-default` | 가로 배치 콜아웃(callout-horizontal)의 본문(description) 색으로, 제목과 같은 진한 회색이며 모든 tone에서 같게 쓰고, 세로 배치 본문은 callout-vertical-message-color-fg-default를 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 7430:80 layout=horizontal (모든 tone), description: #1C1F23 |  |
| `callout-vertical-space-paddingX` | `--callout-vertical-space-padding-x` | 세로 배치 콜아웃(callout-vertical) 상자의 좌우 안쪽 여백(16px)으로, callout-vertical에만 쓴다. | 16px | space-16 | confirmed | O | 7430:80 layout=vertical (모든 tone) 좌우: 16 |  |
| `callout-vertical-message-color-fg-default` | `--callout-vertical-message-color-fg-default` | 세로 배치 콜아웃(callout-vertical)의 본문(description) 색으로, 모든 tone에서 같게 쓰며, 가로 배치 본문은 callout-horizontal-message-color-fg-default를 쓴다. | #454F59 | color-fg-neutral-strong-default → color-gray-700 | confirmed | O | 7430:80 layout=vertical (모든 tone), description: #454F59 |  |
| `callout-vertical-message-space-paddingTop` | `--callout-vertical-message-space-padding-top` | 세로 배치 콜아웃(callout-vertical) 본문 줄(subLine)의 위 여백(2px)으로, 제목 줄과의 간격 callout-vertical-content-space-gap(2)과 합쳐 4px가 되며, 본문 줄에만 쓴다. | 2px | space-2 | confirmed | O | 7430:80 layout=vertical (모든 tone), subLine 위 여백: 2 |  |
| `callout-vertical-content-space-gap` | `--callout-vertical-content-space-gap` | 세로 배치 콜아웃(callout-vertical) 글자 영역에서 제목 줄과 본문 줄 사이 세로 간격(2px)으로, 본문 줄 위 여백 callout-vertical-message-space-paddingTop(2)과 합쳐 4px가 되며, 글자 영역 안에만 쓴다. | 2px | space-2 | confirmed | O | 7430:80 layout=vertical (모든 tone), textBox 세로 간격: 2 |  |
| `callout-radius` | `--callout-radius` | 콜아웃 상자와 바탕의 모서리(8px)로, 콜아웃에만 쓴다. | 8px | radius-medium → radius-8 | confirmed | O | 7430:80 모든 변형, root·background: 8 |  |
| `callout-space-paddingY` | `--callout-space-padding-y` | 콜아웃 상자의 위아래 안쪽 여백(12px)으로, 두 배치(horizontal·vertical)에 함께 쓴다. | 12px | space-12 | confirmed | O | 7430:80 모든 변형 위아래: 12 |  |
| `callout-space-gap` | `--callout-space-gap` | 콜아웃에서 앞 아이콘·글자 영역·닫기 버튼 사이 가로 간격(8px)으로, 콜아웃 안 요소 사이에만 쓴다. | 8px | space-8 | confirmed | O | 7430:80 모든 변형, root·contentsGroup 가로 간격: 8 |  |
| `callout-icon-size` | `--callout-icon-size` | 콜아웃 앞 아이콘의 너비·높이(20px)로, 콜아웃 아이콘에만 쓴다. | 20px | size-icon-large → size-20 | confirmed | O | 7430:80 모든 변형, IconSlot: 20 |  |
| `callout-title-color-fg-default` | `--callout-title-color-fg-default` | 콜아웃 제목 색으로, 두 배치·모든 tone에서 같게 쓰며, 본문은 callout-horizontal-message-color-fg-default·callout-vertical-message-color-fg-default를 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 7430:80 모든 변형, title: #1C1F23 | CLT-02 |

## 참고

- **source**: 피그마 ❖ Callout 페이지 Callout(7430:80) 적용값(layout=horizontal·vertical)
- **nested**: 닫기 버튼은 button-iconOnly(plain, large) 토큰을 쓴다. 너비는 놓이는 영역을 채우고(FILL) 높이는 내용으로 정해진다
- **layout**: 피그마 layout 축을 그룹 구성원 callout-horizontal·callout-vertical로 쓴다(아코디언과 같은 방식). tone 색·모서리·위아래 여백·요소 간격·아이콘·제목 색은 두 배치가 같아 그룹 공통 토큰(callout-*)이고, 한 배치에만 있는 값은 구성원 토큰이다. horizontal은 제목 옆에 본문이 한 줄로 놓인다(본문 색 callout-horizontal-message-color-fg-default(gray 900), 제목–본문 간격 callout-horizontal-title-space-gap 20, 좌우 여백 callout-horizontal-space-paddingX 24, showTitle 없음, 제목 항상 표시). vertical은 제목 줄 아래 본문이 놓인다(본문 색 callout-vertical-message-color-fg-default(gray 700), 제목 줄–본문 줄 간격 callout-vertical-content-space-gap 2 + 본문 줄 위 여백 callout-vertical-message-space-paddingTop 2, 좌우 여백 callout-vertical-space-paddingX 16, showBackground 없음, 바탕 항상 표시). 아이콘·닫기 칸은 높이 24 가운데 정렬이다
