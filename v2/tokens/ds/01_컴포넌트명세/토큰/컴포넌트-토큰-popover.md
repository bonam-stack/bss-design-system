# 컴포넌트 토큰: popover

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| popover | 7324:3459 |
| popover (본문 글자 Item/Popover/Text) | 9827:902 |

## 글자 스타일

> 컴포넌트 글자에는 Component 토큰이 없다. 피그마는 글자 레이어에 텍스트 스타일을, 코드는 Semantic 글자 변수를 그대로 쓴다. `+ tabular-nums`가 붙은 대상은 숫자 폭을 고정한다(코드 `font-variant-numeric: tabular-nums`, 피그마 `label/[크기]/tabular/[굵기]` 스타일).

| 대상 키 | 대상 | 글자 스타일 | 피그마 텍스트 스타일 | 값 (크기/줄 높이 굵기 자간) | 피그마 근거 |
| --- | --- | --- | --- | --- | --- |
| `popover-title` | 팝오버 제목 | `font-label-14-600` | `label/14/600` | 14px/20px 600 -0.2px | 7324:3459 모든 변형, title: text style label/14/600 |
| `popover-content` | 팝오버 본문 글자(Item/Popover/Text) | `font-label-14-400` | `label/14/400` | 14px/20px 400 -0.2px | 9827:902 type=plain·bullet, text: text style label/14/400 |

## 토큰 (16개: confirmed 16)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `popover-color-bg-default` | `--popover-color-bg-default` | 팝오버 상자와 화살표의 바탕 색(흰색)으로, 팝오버 상자에만 쓴다. | #FFFFFF | color-bg-base → color-white | confirmed | O | 7324:3459 모든 변형, contentsGroup·arrow: #FFFFFF | POP-01 |
| `popover-radius` | `--popover-radius` | 팝오버 상자의 모서리(8px)로, 팝오버 상자에만 쓴다. | 8px | radius-medium → radius-8 | confirmed | O | 7324:3459 모든 변형, contentsGroup: 8 |  |
| `popover-space-paddingX` | `--popover-space-padding-x` | 팝오버 상자의 좌우 안쪽 여백(12px)으로, 팝오버 상자에만 쓴다. | 12px | space-12 | confirmed | O | 7324:3459 모든 변형, contentsGroup 좌우: 12 |  |
| `popover-space-paddingY` | `--popover-space-padding-y` | 팝오버 상자의 위아래 안쪽 여백(12px)으로, 팝오버 상자에만 쓴다. | 12px | space-12 | confirmed | O | 7324:3459 모든 변형, contentsGroup 위아래: 12 |  |
| `popover-space-gap` | `--popover-space-gap` | 팝오버 상자에서 머리(제목)·내용·액션 영역 사이 세로 간격(8px)으로, 영역 사이에만 쓴다. | 8px | space-8 | confirmed | O | 7324:3459 모든 변형, contentsGroup 세로 간격: 8 |  |
| `popover-shadow` | `--popover-shadow` | 팝오버 상자의 그림자(small)로, 팝오버 상자에만 쓴다. | 0px 2px 12px 0px #0000003D | shadow-small | confirmed | O | 7324:3459 모든 변형: shadow/small |  |
| `popover-arrow-size-width` | `--popover-arrow-size-width` | 팝오버 화살표의 밑변 너비(10px)로, 화살표에만 쓰며, 화살표 색은 팝오버 바탕 색을 따른다. | 10px | size-arrow-width → size-10 | confirmed | O | 7324:3459 showArrow=true, arrow (left·right placement은 너비·높이를 바꿔 연결): 10 |  |
| `popover-arrow-size-height` | `--popover-arrow-size-height` | 팝오버 화살표의 높이(6px, 트리거 쪽으로 튀어나온 길이)로, 화살표에만 쓴다. | 6px | size-arrow-height → size-6 | confirmed | O | 7324:3459 showArrow=true, arrow (left·right placement은 너비·높이를 바꿔 연결): 6 |  |
| `popover-header-space-gap` | `--popover-header-space-gap` | 팝오버 머리에서 제목과 닫기 버튼 사이 간격(8px)으로, 머리 안에만 쓴다. | 8px | space-8 | confirmed | O | 7324:3459 모든 변형, header 가로 간격: 8 |  |
| `popover-footer-space-gap` | `--popover-footer-space-gap` | 팝오버 아래 버튼 영역(footer 슬롯, 버튼 오른쪽 정렬)에서 버튼 사이 간격(6px)으로, 버튼 영역 안에만 쓴다. | 6px | space-6 | confirmed | O | 7324:3459 모든 변형, footer 가로 간격: 6 |  |
| `popover-title-color-fg-default` | `--popover-title-color-fg-default` | 팝오버 제목 색으로, 팝오버 제목에만 쓰며, 본문 글자는 popover-content-color-fg-default를 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 7324:3459 모든 변형, title: #1C1F23 |  |
| `popover-content-color-fg-default` | `--popover-content-color-fg-default` | 팝오버 본문 글자(Item/Popover/Text) 색으로, 내용 슬롯의 글자에만 쓰며, 제목은 popover-title-color-fg-default를 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 9827:902 type=plain·bullet, text: #1C1F23 |  |
| `popover-bullet-color-bg-default` | `--popover-bullet-color-bg-default` | 팝오버 본문 글자 앞 글머리 점(type=bullet)의 채움 색으로, 글머리 점에만 쓴다. | #1C1F23 | color-bg-neutral-strongest-default → color-gray-900 | confirmed | O | 9827:902 type=bullet, ellipse: #1C1F23 |  |
| `popover-bullet-size` | `--popover-bullet-size` | 팝오버 본문 글머리 점의 너비·높이(3px)로, 글머리 점에만 쓴다. | 3px | size-bullet-small → size-3 | confirmed | O | 9827:902 type=bullet, ellipse: 3 |  |
| `popover-bullet-radius` | `--popover-bullet-radius` | 팝오버 본문 글머리 점을 동그랗게 만드는 모서리로, 글머리 점에만 쓴다. | 9999px | radius-full → radius-9999 | confirmed | O | 9827:902 type=bullet, ellipse: 9999 |  |
| `popover-bullet-space-gap` | `--popover-bullet-space-gap` | 팝오버 본문 글머리 목록(type=bullet)에서 점과 글자 사이 가로 간격(4px)으로, 팝오버 글머리 목록에만 쓴다. | 4px | space-4 | confirmed | O | 9827:902 Item/Popover/Text type=bullet 가로 간격(dot–text): 4 |  |

## 참고

- **source**: 피그마 ❖ Tooltip / Popover 페이지 Popover(7324:3459)·Item/Popover/Text(9827:902) 적용값
- **nested**: 닫기 버튼은 button-iconOnly(plain, small), 액션 버튼은 button-text(primary) 토큰을 쓴다. 너비 240은 대표 너비라 토큰을 만들지 않는다. 글머리 점 칸(너비 8)과 점·글자 사이 간격(4)은 표 글머리 점처럼 토큰을 만들지 않았다
