# 컴포넌트 토큰: sidePanel

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| sidePanel | 7916:479 |

## 글자 스타일

> 컴포넌트 글자에는 Component 토큰이 없다. 피그마는 글자 레이어에 텍스트 스타일을, 코드는 Semantic 글자 변수를 그대로 쓴다. `+ tabular-nums`가 붙은 대상은 숫자 폭을 고정한다(코드 `font-variant-numeric: tabular-nums`, 피그마 `label/[크기]/tabular/[굵기]` 스타일).

| 대상 키 | 대상 | 글자 스타일 | 피그마 텍스트 스타일 | 값 (크기/줄 높이 굵기 자간) | 피그마 근거 |
| --- | --- | --- | --- | --- | --- |
| `sidePanel-title` | 사이드 패널 제목 | `font-title-16-700` | `title/16/700` | 16px/24px 700 -0.2px | 7916:479 title: text style title/16/700 |

## 토큰 (14개: confirmed 14)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `sidePanel-color-bg-default` | `--side-panel-color-bg-default` | 사이드 패널 표면의 바탕 색(흰색)으로, 패널 표면에만 쓴다. | #FFFFFF | color-bg-base → color-white | confirmed | O | 7916:479 SidePanel: #FFFFFF |  |
| `sidePanel-shadow` | `--side-panel-shadow` | 사이드 패널 표면의 그림자(medium)로, 패널 표면에만 쓴다. | 0px 2px 20px 0px #00000047 | shadow-medium | confirmed | O | 7916:479 SidePanel: shadow/medium |  |
| `sidePanel-radius` | `--side-panel-radius` | 사이드 패널 표면의 모서리(20px)로, 패널 표면에만 쓴다. | 20px | radius-xxlarge → radius-20 | confirmed | O | 7916:479 SidePanel: 20 |  |
| `sidePanel-size-width` | `--side-panel-size-width` | 사이드 패널의 너비(340px, 고정)로, 패널 표면에만 쓰며 높이는 화면에 따라 정해진다. | 340px | size-340 | confirmed | O | 7916:479 SidePanel: 340 |  |
| `sidePanel-header-space-paddingX` | `--side-panel-header-space-padding-x` | 사이드 패널 머리 영역의 좌우 안쪽 여백(20px)으로, 머리 영역에만 쓴다. | 20px | space-20 | confirmed | O | 7916:479 headerGroup, 좌우: 20 |  |
| `sidePanel-header-space-paddingTop` | `--side-panel-header-space-padding-top` | 사이드 패널 머리 영역의 위 안쪽 여백(20px)으로, 머리 영역에만 쓰며 아래 여백은 sidePanel-header-space-paddingBottom을 쓴다. | 20px | space-20 | confirmed | O | 7916:479 headerGroup, 위: 20 |  |
| `sidePanel-header-space-paddingBottom` | `--side-panel-header-space-padding-bottom` | 사이드 패널 머리 영역의 아래 안쪽 여백(16px)으로, 머리 영역에만 쓰며 위 여백은 sidePanel-header-space-paddingTop을 쓴다. | 16px | space-16 | confirmed | O | 7916:479 headerGroup, 아래: 16 |  |
| `sidePanel-header-space-gap` | `--side-panel-header-space-gap` | 사이드 패널 머리 영역 안 요소(제목 영역·닫기 버튼, 제목·배지) 사이 간격(8px)으로, 머리 영역에만 쓴다. | 8px | space-8 | confirmed | O | 7916:479 headerGroup·titleBox, 가로 간격: 8 |  |
| `sidePanel-title-color-fg-default` | `--side-panel-title-color-fg-default` | 사이드 패널 제목 글자 색으로, 머리 영역 제목에만 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 7916:479 title: #1C1F23 |  |
| `sidePanel-footer-space-paddingX` | `--side-panel-footer-space-padding-x` | 사이드 패널 아래 버튼 영역의 좌우 안쪽 여백(20px)으로, 아래 버튼 영역에만 쓴다. | 20px | space-20 | confirmed | O | 7916:479 footer, 좌우: 20 |  |
| `sidePanel-footer-space-paddingY` | `--side-panel-footer-space-padding-y` | 사이드 패널 아래 버튼 영역의 위아래 안쪽 여백(16px)으로, 아래 버튼 영역에만 쓴다. | 16px | space-16 | confirmed | O | 7916:479 footer, 위아래: 16 |  |
| `sidePanel-footer-color-border-default` | `--side-panel-footer-color-border-default` | 사이드 패널 아래 버튼 영역의 위 테두리 색(gray 100)으로, 본문과 버튼 영역을 나누는 위 테두리에만 쓴다. | #E8ECEF | color-border-neutral-faint → color-gray-100 | confirmed | O | 7916:479 footer, 위 테두리: #E8ECEF |  |
| `sidePanel-footer-borderWidth` | `--side-panel-footer-border-width` | 사이드 패널 아래 버튼 영역의 위 테두리 두께(1px)로, 위 테두리에만 쓴다. | 1px | borderWidth-thin → borderWidth-1 | confirmed | O | 7916:479 footer, 위 테두리: 1 |  |
| `sidePanel-group-space-gap` | `--side-panel-group-space-gap` | 사이드 패널 아래 버튼 묶음의 버튼 사이 간격(8px)으로, 아래 버튼 묶음에만 쓴다. | 8px | space-8 | confirmed | O | 7916:479 actions 슬롯, 가로 간격: 8 |  |

## 참고

- **source**: 피그마 ❖ Side Panel 페이지 SidePanel(7916:479) 적용값
- **nested**: 닫기 버튼은 button-iconOnly plain medium, 제목 옆 배지는 badge-basic, 본문 스크롤바는 scrollbar medium, 아래 버튼은 button-action xlarge 토큰을 쓴다. 높이는 화면에 따라 정해져 토큰을 만들지 않았다. 본문(content 슬롯)은 여백이 없다
