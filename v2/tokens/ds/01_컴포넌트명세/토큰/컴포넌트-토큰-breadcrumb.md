# 컴포넌트 토큰: breadcrumb

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| breadcrumb | 8821:223 |
| breadcrumb (구분 기호 _Item/Breadcrumb/Separator) | 9708:200 |
| 조합: Breadcrumb (breadcrumb) | 8822:541 |

## 글자 스타일

> 컴포넌트 글자에는 Component 토큰이 없다. 피그마는 글자 레이어에 텍스트 스타일을, 코드는 Semantic 글자 변수를 그대로 쓴다. `+ tabular-nums`가 붙은 대상은 숫자 폭을 고정한다(코드 `font-variant-numeric: tabular-nums`, 피그마 `label/[크기]/tabular/[굵기]` 스타일).

| 대상 키 | 대상 | 글자 스타일 | 피그마 텍스트 스타일 | 값 (크기/줄 높이 굵기 자간) | 피그마 근거 |
| --- | --- | --- | --- | --- | --- |
| `breadcrumb-label` | 경로 항목 라벨(링크·현재 위치 공통) | `font-label-14-400` | `label/14/400` | 14px/20px 400 -0.2px | 8821:223 모든 변형, label: label/14/400 |

## 토큰 (7개: confirmed 7)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `breadcrumb-separator-color-fg-default` | `--breadcrumb-separator-color-fg-default` | 브레드크럼 경로 항목 사이에 놓이는 구분 기호(_Item/Breadcrumb/Separator, 오른쪽 꺾쇠 아이콘)의 색(모든 상태 같음)으로, 구분 기호에만 쓰며, 라벨 글자 색은 breadcrumb-link-label-color-fg-*·breadcrumb-current-label-color-fg-default를 쓴다. | #697582 | color-fg-neutral-muted-default → color-gray-600 | confirmed | O | 9708:200 Icon/Line/ChevronRight: #697582 |  |
| `breadcrumb-separator-size` | `--breadcrumb-separator-size` | 브레드크럼 구분 기호(_Item/Breadcrumb/Separator) 아이콘의 너비·높이(14px)로, 구분 기호에만 쓴다. | 14px | size-icon-small → size-14 | confirmed | O | 9708:200 Icon/Line/ChevronRight: 14 |  |
| `breadcrumb-group-space-gap` | `--breadcrumb-group-space-gap` | 브레드크럼 목록 안 요소 사이 간격(6px, 가로)으로, Breadcrumb 목록에서 경로 항목과 구분 기호 사이(항목–구분 기호–항목)에 쓴다. | 6px | space-6 | confirmed | O | 8822:541 Breadcrumb content 슬롯(경로 항목·구분 기호 사이): 6 |  |
| `breadcrumb-link-label-color-fg-default` | `--breadcrumb-link-label-color-fg-default` | 브레드크럼 상위 경로 링크(position=link) 라벨의 기본 상태 글자 색으로, 링크 항목에만 쓰며, 현재 위치 항목은 breadcrumb-current-label-color-fg-default를 쓴다. | #697582 | color-fg-neutral-muted-default → color-gray-600 | confirmed | O | 8821:223 position=link, state=default: #697582 |  |
| `breadcrumb-link-label-color-fg-hover` | `--breadcrumb-link-label-color-fg-hover` | 브레드크럼 상위 경로 링크(position=link) 라벨의 hover 상태 글자 색으로, 링크 항목에만 쓰며, 현재 위치 항목은 breadcrumb-current-label-color-fg-default를 쓴다. | #454F59 | color-fg-neutral-muted-hover → color-gray-700 | confirmed | O | 8821:223 position=link, state=hover: #454F59 |  |
| `breadcrumb-link-label-color-fg-pressed` | `--breadcrumb-link-label-color-fg-pressed` | 브레드크럼 상위 경로 링크(position=link) 라벨의 pressed 상태 글자 색으로, 링크 항목에만 쓰며, 현재 위치 항목은 breadcrumb-current-label-color-fg-default를 쓴다. | #303942 | color-fg-neutral-muted-pressed → color-gray-800 | confirmed | O | 8821:223 position=link, state=pressed: #303942 |  |
| `breadcrumb-current-label-color-fg-default` | `--breadcrumb-current-label-color-fg-default` | 브레드크럼의 현재 위치 항목(position=current, 마지막 항목, aria-current 값 page) 라벨 글자 색으로, 현재 위치 항목에만 쓰며, 상위 경로 링크는 breadcrumb-link-label-color-fg-*를 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 8821:223 position=current, state=default: #1C1F23 |  |

## 참고

- **source**: 피그마 ❖ Breadcrumb 페이지 _Item/Breadcrumb/Item(8821:223)·_Item/Breadcrumb/Separator(9708:200)·Breadcrumb(8822:541) 적용값
- **stateMap**: 피그마 position 이름을 그대로 변형으로 쓴다: link([data-position="link"]), current([aria-current="page"]). 모든 경로 항목에 둘 중 하나가 붙는다. 현재 위치 항목은 state=default만 있다
- **separatorSplit**: 구분 기호는 경로 항목 밖 컴포넌트 _Item/Breadcrumb/Separator다. 간격은 breadcrumb-group-space-gap(6) 하나로 항목–구분 기호–항목 사이를 만든다. 구현: 구분 기호는 링크 밖 장식(aria-hidden="true")이고, 누르는 영역·hover·pressed·포커스는 라벨 링크(<a>)만이다
