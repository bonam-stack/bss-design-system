# 컴포넌트 토큰: toolbar

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| toolbar | 9080:243 |

## 글자 스타일

> 컴포넌트 글자에는 Component 토큰이 없다. 피그마는 글자 레이어에 텍스트 스타일을, 코드는 Semantic 글자 변수를 그대로 쓴다. `+ tabular-nums`가 붙은 대상은 숫자 폭을 고정한다(코드 `font-variant-numeric: tabular-nums`, 피그마 `label/[크기]/tabular/[굵기]` 스타일).

| 대상 키 | 대상 | 글자 스타일 | 피그마 텍스트 스타일 | 값 (크기/줄 높이 굵기 자간) | 피그마 근거 |
| --- | --- | --- | --- | --- | --- |
| `toolbar-title` | 툴바 제목 | `font-label-14-600` | `label/14/600` | 14px/20px 600 -0.2px | 9080:243 title: text style label/14/600 |
| `toolbar-count` | 툴바 단계 수(현재·전체 숫자) | `font-label-14-500` + `tabular-nums` | `label/14/tabular/500` | 14px/20px 500 -0.2px | 9080:243 stepCount current·total: text style label/14/tabular/500 |
| `toolbar-separator` | 툴바 단계 수의 구분 기호(/) | `font-label-14-500` | `label/14/500` | 14px/20px 500 -0.2px | 9080:243 stepCount separator: text style label/14/500 |

## 토큰 (12개: confirmed 12)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `toolbar-color-bg-default` | `--toolbar-color-bg-default` | 툴바 막대의 반투명 흰 바탕 색으로, 툴바 막대에만 쓴다. | #FFFFFFCC | color-bg-translucent → color-whiteAlpha-80 | confirmed | O | 9080:243 Toolbar: #FFFFFFCC | TLB-01 |
| `toolbar-shadow` | `--toolbar-shadow` | 툴바 막대의 그림자(medium)로, 툴바 막대에만 쓴다. | 0px 2px 20px 0px #00000047 | shadow-medium | confirmed | O | 9080:243 Toolbar: shadow/medium |  |
| `toolbar-radius` | `--toolbar-radius` | 툴바 막대의 모서리(12px)로, 툴바 막대에만 쓴다. | 12px | radius-large → radius-12 | confirmed | O | 9080:243 Toolbar: 12 |  |
| `toolbar-space-paddingX` | `--toolbar-space-padding-x` | 툴바 막대의 좌우 안쪽 여백(16px)으로, 툴바 막대에만 쓴다. | 16px | space-16 | confirmed | O | 9080:243 Toolbar 좌우: 16 |  |
| `toolbar-space-paddingY` | `--toolbar-space-padding-y` | 툴바 막대의 위아래 안쪽 여백(6px)으로, 툴바 막대에만 쓴다. | 6px | space-6 | confirmed | O | 9080:243 Toolbar 위아래: 6 |  |
| `toolbar-space-gap` | `--toolbar-space-gap` | 툴바 막대에서 앞쪽 묶음(단계 정보·구분선)과 뒤쪽 도구 묶음 사이 간격, 앞쪽 묶음 안 단계 정보와 구분선 사이 간격(16px)으로, 툴바 묶음 사이에만 쓴다. | 16px | space-16 | confirmed | O | 9080:243 Toolbar·leadingGroup 가로 간격: 16 |  |
| `toolbar-group-space-gap` | `--toolbar-group-space-gap` | 툴바 뒤쪽 도구 묶음에서 셀렉트·버튼·토글 버튼 사이 간격(8px)으로, 도구 묶음 안에만 쓴다. | 8px | space-8 | confirmed | O | 9080:243 trailingGroup 가로 간격: 8 |  |
| `toolbar-title-space-gap` | `--toolbar-title-space-gap` | 툴바 단계 정보에서 제목·단계 표시(Steps)·단계 수 사이 간격(12px)으로, 단계 정보 안에만 쓴다. | 12px | space-12 | confirmed | O | 9080:243 stepInfo 가로 간격: 12 |  |
| `toolbar-title-color-fg-default` | `--toolbar-title-color-fg-default` | 툴바 제목 글자 색으로, 툴바 제목에만 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 9080:243 title: #1C1F23 |  |
| `toolbar-count-color-fg-default` | `--toolbar-count-color-fg-default` | 툴바 단계 수에서 전체 단계 수 글자 색으로, 현재 단계 수는 toolbar-current-count-color-fg-default를 쓴다. | #8B949E | color-fg-neutral-faint → color-gray-500 | confirmed | O | 9080:243 stepCount total: #8B949E |  |
| `toolbar-current-count-color-fg-default` | `--toolbar-current-count-color-fg-default` | 툴바 단계 수에서 현재 단계 수 글자 색으로, 전체 단계 수는 toolbar-count-color-fg-default를 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 9080:243 stepCount current: #1C1F23 | TLB-02 |
| `toolbar-separator-color-fg-default` | `--toolbar-separator-color-fg-default` | 툴바 단계 수에서 현재 수와 전체 수 사이 구분 기호(/) 색으로, 단계 수 구분 기호에만 쓴다. | #8B949E | color-fg-neutral-faint → color-gray-500 | confirmed | O | 9080:243 stepCount separator: #8B949E |  |

## 참고

- **source**: 피그마 ❖ Toolbar 페이지 Toolbar(9080:243)·_Item/Toolbar/ToggleButton(9080:257) 적용값
- **nested**: 단계 표시는 Steps(steps 토큰), 셀렉트는 select medium, 버튼은 button-action base medium, 토글 버튼은 toggleButton, 구분선은 Divider(세로, color-border-neutral-muted) 토큰을 쓴다. 막대 높이는 내용(버튼 32 + 위아래 여백 6)으로 정해져 토큰을 만들지 않았다
